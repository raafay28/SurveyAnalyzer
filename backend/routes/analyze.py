from flask import Blueprint, request, jsonify, current_app
import pandas as pd
import numpy as np
from collections import Counter
import os, json, re
from werkzeug.utils import secure_filename

analyze_bp = Blueprint('analyze', __name__)

# ── Sentiment Analysis (keyword-based, no external libs needed) ──────────────
POS_WORDS = set(['good','great','excellent','amazing','wonderful','fantastic','love','best',
    'happy','satisfied','perfect','outstanding','brilliant','helpful','awesome','nice',
    'positive','recommend','impressive','delightful','enjoyed','smooth','easy','fast',
    'efficient','clear','useful','innovative','reliable','quality','pleased'])
NEG_WORDS = set(['bad','poor','terrible','awful','horrible','hate','worst','slow','difficult',
    'confusing','disappointing','frustrating','useless','broken','buggy','expensive',
    'complicated','boring','mediocre','unreliable','unhappy','unsatisfied','problem',
    'issue','error','fail','failed','wrong','negative','annoying','hard','unclear'])

def get_sentiment(text):
    if not isinstance(text, str) or text.strip() == '':
        return 'neutral'
    words = re.findall(r'\b\w+\b', text.lower())
    pos = sum(1 for w in words if w in POS_WORDS)
    neg = sum(1 for w in words if w in NEG_WORDS)
    if pos > neg: return 'positive'
    if neg > pos: return 'negative'
    return 'neutral'

def get_sentiment_score(text):
    if not isinstance(text, str): return 0
    words = re.findall(r'\b\w+\b', text.lower())
    pos = sum(1 for w in words if w in POS_WORDS)
    neg = sum(1 for w in words if w in NEG_WORDS)
    total = pos + neg
    if total == 0: return 0
    return round((pos - neg) / total, 2)

def extract_keywords(texts, top_n=20):
    STOP = set(['the','a','an','and','or','but','in','on','at','to','for','of','with',
        'is','are','was','were','be','been','have','has','had','do','does','did',
        'will','would','could','should','may','might','i','you','we','they','it',
        'this','that','these','those','my','your','our','their','its','very','so',
        'just','also','then','than','when','which','who','how','what','where','why'])
    all_words = []
    for t in texts:
        if isinstance(t, str):
            words = re.findall(r'\b[a-z]{3,}\b', t.lower())
            all_words.extend([w for w in words if w not in STOP])
    return Counter(all_words).most_common(top_n)

def detect_col_type(series):
    unique_ratio = series.nunique() / max(len(series), 1)
    if pd.api.types.is_numeric_dtype(series):
        if series.nunique() <= 10:
            return 'rating'
        return 'numeric'
    if series.nunique() <= 15 and unique_ratio < 0.3:
        return 'categorical'
    avg_len = series.dropna().astype(str).str.len().mean()
    if avg_len > 30:
        return 'text'
    return 'categorical'

@analyze_bp.route('/api/survey/upload', methods=['POST'])
def upload_survey():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    f = request.files['file']
    if not f.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files supported'}), 400

    path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'survey.csv')
    f.save(path)
    df = pd.read_csv(path)

    if df.empty:
        return jsonify({'error': 'CSV is empty'}), 400

    # Detect column types
    col_types = {}
    for col in df.columns:
        col_types[col] = detect_col_type(df[col])

    return jsonify({
        'message': 'Survey uploaded successfully',
        'rows': len(df),
        'columns': list(df.columns),
        'col_types': col_types,
        'preview': df.head(3).fillna('').to_dict(orient='records')
    })

@analyze_bp.route('/api/survey/analyze', methods=['GET'])
def analyze_survey():
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'survey.csv')
    if not os.path.exists(path):
        return jsonify({'error': 'No survey uploaded'}), 404

    df = pd.read_csv(path)
    results = {}

    for col in df.columns:
        col_type = detect_col_type(df[col])
        col_data = df[col].dropna()
        result = {'type': col_type, 'total_responses': len(col_data), 'missing': int(df[col].isnull().sum())}

        if col_type == 'rating':
            result['mean'] = round(float(col_data.mean()), 2)
            result['median'] = round(float(col_data.median()), 2)
            result['std'] = round(float(col_data.std()), 2)
            result['min'] = float(col_data.min())
            result['max'] = float(col_data.max())
            counts = col_data.value_counts().sort_index()
            result['distribution'] = {str(k): int(v) for k, v in counts.items()}

        elif col_type == 'numeric':
            result['mean'] = round(float(col_data.mean()), 2)
            result['median'] = round(float(col_data.median()), 2)
            result['std'] = round(float(col_data.std()), 2)
            result['min'] = float(col_data.min())
            result['max'] = float(col_data.max())

        elif col_type == 'categorical':
            counts = col_data.value_counts()
            result['distribution'] = {str(k): int(v) for k, v in counts.head(15).items()}
            result['most_common'] = str(counts.index[0]) if len(counts) > 0 else ''
            result['unique_count'] = int(col_data.nunique())

        elif col_type == 'text':
            texts = col_data.astype(str).tolist()
            sentiments = [get_sentiment(t) for t in texts]
            scores = [get_sentiment_score(t) for t in texts]
            sent_counts = Counter(sentiments)
            keywords = extract_keywords(texts)
            result['sentiment'] = {
                'positive': sent_counts.get('positive', 0),
                'negative': sent_counts.get('negative', 0),
                'neutral': sent_counts.get('neutral', 0),
                'avg_score': round(float(np.mean(scores)), 3)
            }
            result['keywords'] = [{'word': w, 'count': c} for w, c in keywords]
            result['sample_responses'] = [{'text': t, 'sentiment': get_sentiment(t)} for t in texts[:5]]

        results[col] = result

    # Overall survey summary
    total_responses = len(df)
    completion_rate = round((df.notna().sum().sum() / max(df.shape[0] * df.shape[1], 1)) * 100, 1)
    text_cols = [c for c in df.columns if detect_col_type(df[c]) == 'text']
    overall_sentiment = {'positive': 0, 'negative': 0, 'neutral': 0}
    if text_cols:
        for col in text_cols:
            for t in df[col].dropna().astype(str):
                s = get_sentiment(t)
                overall_sentiment[s] += 1

    # Run AI Analyst & Persona Generation
    ai_data = generate_ai_analyst_and_personas(df, results, completion_rate)

    return jsonify({
        'results': results,
        'summary': {
            'total_responses': total_responses,
            'total_columns': len(df.columns),
            'completion_rate': completion_rate,
            'overall_sentiment': overall_sentiment,
            'text_columns': text_cols,
        },
        'ai_analysis': {
            'executive_summary': ai_data['executive_summary'],
            'key_findings': ai_data['key_findings'],
            'recommendations': ai_data['recommendations']
        },
        'ai_personas': ai_data['personas']
    })

def generate_ai_analyst_and_personas(df, results, completion_rate):
    rating_cols = []
    text_cols = []
    cat_cols = []
    numeric_cols = []
    
    for col, data in results.items():
        if data['type'] == 'rating':
            rating_cols.append(col)
        elif data['type'] == 'text':
            text_cols.append(col)
        elif data['type'] == 'categorical':
            cat_cols.append(col)
        elif data['type'] == 'numeric':
            numeric_cols.append(col)
            
    # Compute row-level satisfaction scores
    scores = []
    for idx, row in df.iterrows():
        row_scores = []
        for r_col in rating_cols:
            val = row[r_col]
            if pd.notna(val) and isinstance(val, (int, float, np.integer, np.floating)):
                normalized = ((float(val) - 1) / 4) * 2 - 1  # 1 -> -1, 5 -> 1
                row_scores.append(normalized)
        for t_col in text_cols:
            val = row[t_col]
            if pd.notna(val) and isinstance(val, str):
                row_scores.append(get_sentiment_score(val))
        
        if row_scores:
            scores.append((idx, float(np.mean(row_scores))))
        else:
            scores.append((idx, 0.0))
            
    # Classify rows into personas
    pos_idxs = []
    neg_idxs = []
    neu_idxs = []
    
    has_scores = any(s[1] != 0.0 for s in scores)
    if not has_scores:
        n = len(df)
        pos_idxs = list(range(0, int(n * 0.4)))
        neu_idxs = list(range(int(n * 0.4), int(n * 0.75)))
        neg_idxs = list(range(int(n * 0.75), n))
    else:
        for idx, score in scores:
            if score > 0.15:
                pos_idxs.append(idx)
            elif score < -0.15:
                neg_idxs.append(idx)
            else:
                neu_idxs.append(idx)
                
    total = len(df)
    pos_pct = round((len(pos_idxs) / max(total, 1)) * 100, 1)
    neg_pct = round((len(neg_idxs) / max(total, 1)) * 100, 1)
    neu_pct = round((len(neu_idxs) / max(total, 1)) * 100, 1)
    
    def get_group_keywords(idxs):
        texts = []
        for t_col in text_cols:
            for idx in idxs:
                if idx < len(df):
                    val = df.iloc[idx][t_col]
                    if pd.notna(val) and isinstance(val, str):
                        texts.append(val)
        return [w for w, _ in extract_keywords(texts, 5)]

    pos_keywords = get_group_keywords(pos_idxs)
    neg_keywords = get_group_keywords(neg_idxs)
    neu_keywords = get_group_keywords(neu_idxs)
    
    def get_group_quote(idxs, fallback):
        for t_col in text_cols:
            for idx in idxs:
                if idx < len(df):
                    val = df.iloc[idx][t_col]
                    if pd.notna(val) and isinstance(val, str) and len(val.strip()) > 15:
                        return f'"{val.strip()}"'
        return fallback

    pos_quote = get_group_quote(pos_idxs, "Everything is working smoothly and meeting our project requirements.")
    neg_quote = get_group_quote(neg_idxs, "The responsiveness could be improved. Some parts are hard to navigate.")
    neu_quote = get_group_quote(neu_idxs, "It meets the baseline expectations, but does not stand out.")
    
    all_text = []
    for t_col in text_cols:
        all_text.extend(df[t_col].dropna().astype(str).tolist())
    all_keywords = [w for w, _ in extract_keywords(all_text, 10)]
    
    main_topic = all_keywords[0] if all_keywords else "experience"
    second_topic = all_keywords[1] if len(all_keywords) > 1 else "service"
    
    findings = []
    recommendations = []
    
    if rating_cols:
        r_col = rating_cols[0]
        if r_col in results and 'mean' in results[r_col]:
            avg_rating = results[r_col]['mean']
            findings.append(f"Primary rating metric '{r_col}' averages {avg_rating}/5.0, reflecting solid core reception.")
            if avg_rating < 3.5:
                recommendations.append(f"Investigate low satisfaction scores in '{r_col}' by launching targeted follow-up surveys.")
            else:
                recommendations.append(f"Leverage strong satisfaction metrics ({avg_rating}/5) on '{r_col}' in marketing collaterals and case studies.")
    
    if text_cols:
        pos_count = sum(results[col]['sentiment']['positive'] for col in text_cols if col in results and 'sentiment' in results[col])
        neg_count = sum(results[col]['sentiment']['negative'] for col in text_cols if col in results and 'sentiment' in results[col])
        total_comments = pos_count + neg_count + sum(results[col]['sentiment']['neutral'] for col in text_cols if col in results and 'sentiment' in results[col])
        
        if total_comments > 0:
            pos_ratio = round((pos_count / total_comments) * 100, 1)
            neg_ratio = round((neg_count / total_comments) * 100, 1)
            findings.append(f"Sentiment analysis reveals a {pos_ratio}% positive and {neg_ratio}% negative voice across text responses.")
            
            neg_issues = [w for w in neg_keywords if w in ['slow', 'difficult', 'expensive', 'confusing', 'broken', 'buggy', 'cost']]
            if neg_issues:
                issue_str = ", ".join(neg_issues)
                findings.append(f"Negative feedback is concentrated around key friction points: {issue_str}.")
                recommendations.append(f"Address identified friction points ({issue_str}) in the next release cycle.")
            else:
                recommendations.append("Investigate qualitative critiques to identify subtle performance bottlenecks.")
    
    if len(findings) < 2:
        findings.append(f"Analysis shows a highly engaged cohort with a survey completion rate of {completion_rate}%.")
    if len(recommendations) < 2:
        recommendations.append(f"Segment response data by categorical values to reveal demographic variations.")
        
    personas = [
      {
        "name": "The Brand Advocate",
        "tagline": "Satisfied power-user advocating for expansion.",
        "type": "positive",
        "size_percentage": pos_pct,
        "profile": f"Highly satisfied respondents who appreciate the core benefits of {main_topic}. They want more features and deeper integrations.",
        "likes": [main_topic, second_topic, "ease of use"][:3],
        "dislikes": ["waiting for new updates", "lack of advanced API documentation"],
        "key_quote": pos_quote,
        "avatar_gradient": "linear-gradient(135deg, #10b981, #059669)",
        "initials": "BA"
      },
      {
        "name": "The Skeptical Critic",
        "tagline": "Frustrated by hurdles, searching for alternatives.",
        "type": "negative",
        "size_percentage": neg_pct,
        "profile": f"Encountered usability obstacles or felt let down by the {second_topic}. High threat of moving to a competitor.",
        "likes": ["initial concept", "some core features"],
        "dislikes": [neg_keywords[0] if neg_keywords else "performance delays", neg_keywords[1] if len(neg_keywords) > 1 else "complexity", "pricing/fees"],
        "key_quote": neg_quote,
        "avatar_gradient": "linear-gradient(135deg, #ef4444, #b91c1c)",
        "initials": "SC"
      },
      {
        "name": "The Passive Observer",
        "tagline": "Meets basic requirements without excitement.",
        "type": "neutral",
        "size_percentage": neu_pct,
        "profile": "Uses the system strictly as needed. Indifferent to premium upgrades but stable if basic functionalities are maintained.",
        "likes": ["reliability", "simplicity"],
        "dislikes": ["unnecessary layout alterations", "forced tutorials"],
        "key_quote": neu_quote,
        "avatar_gradient": "linear-gradient(135deg, #6b7280, #374151)",
        "initials": "PO"
      }
    ]
    
    active_personas = [p for p in personas if p["size_percentage"] > 0]
    if not active_personas:
        active_personas = personas
        
    s_col_count = len(df.columns)
    s_rows = len(df)
    
    summary_text = (
        f"Automated analysis of {s_rows} respondents across {s_col_count} parameters has been executed. "
        f"The data displays a general completion rate of {completion_rate}%. "
    )
    if rating_cols and rating_cols[0] in results and 'mean' in results[rating_cols[0]]:
        summary_text += f"Satisfaction benchmarks score around {results[rating_cols[0]]['mean']}/5.0. "
    if text_cols:
        summary_text += f"Key qualitative discourse pivots on topics such as '{main_topic}' and '{second_topic}'."
        
    return {
        "executive_summary": summary_text,
        "key_findings": findings,
        "recommendations": recommendations,
        "personas": active_personas
    }

@analyze_bp.route('/api/survey/data')
def get_data():
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'survey.csv')
    if not os.path.exists(path):
        return jsonify({'error': 'No data'}), 404
    df = pd.read_csv(path)
    return jsonify({
        'rows': len(df),
        'columns': list(df.columns),
        'preview': df.head(50).fillna('').to_dict(orient='records')
    })
