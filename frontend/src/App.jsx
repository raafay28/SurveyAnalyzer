import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend);

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4'];

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { 
    x: { 
      ticks: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans', sans-serif", size: 10, weight: '500' } }, 
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false } 
    }, 
    y: { 
      ticks: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans', sans-serif", size: 10, weight: '500' } }, 
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false } 
    } 
  }
};

const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  Upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Help: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Message: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Database: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  File: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Info: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Smile: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Neutral: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="15" x2="16" y2="15" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Frown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Activity: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
};

function SentimentGauge({ data }) {
  const total = data.positive + data.negative + data.neutral;
  if (total === 0) return null;
  const posW = (data.positive / total * 100).toFixed(1);
  const negW = (data.negative / total * 100).toFixed(1);
  const neuW = (data.neutral / total * 100).toFixed(1);
  return (
    <div>
      <div className="sentiment-bar">
        <div className="sentiment-pos" style={{ flex: data.positive }} title={`Positive: ${data.positive}`} />
        <div className="sentiment-neu" style={{ flex: data.neutral }} title={`Neutral: ${data.neutral}`} />
        <div className="sentiment-neg" style={{ flex: data.negative }} title={`Negative: ${data.negative}`} />
      </div>
      <div className="flex gap-3 mt-2" style={{ flexWrap: 'wrap' }}>
        <span className="badge badge-positive"><Icons.Smile /> Positive {posW}%</span>
        <span className="badge badge-neutral"><Icons.Neutral /> Neutral {neuW}%</span>
        <span className="badge badge-negative"><Icons.Frown /> Negative {negW}%</span>
      </div>
    </div>
  );
}

function DistributionBar({ label, count, max, color = '#6366f1' }) {
  return (
    <div className="dist-row">
      <div className="dist-label" title={label}>{label}</div>
      <div className="dist-bar">
        <div className="dist-fill" style={{ width: `${(count / max) * 100}%`, background: color }} />
      </div>
      <div className="dist-count">{count}</div>
    </div>
  );
}

function RatingStars({ value, max = 5 }) {
  const filled = Math.round(value);
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < filled ? 'star' : 'star-outline'}>★</span>
      ))}
      <span style={{ marginLeft: 6, fontWeight: 700, color: 'var(--yellow)', fontSize: '0.9rem' }}>{value}</span>
    </span>
  );
}

function ColumnCard({ col, data }) {
  const typeBadge = { rating: 'badge-rating', text: 'badge-text', categorical: 'badge-categorical', numeric: 'badge-rating' };

  return (
    <div className="col-card">
      <div className="col-header">
        <div className="col-name">{col}</div>
        <div className="flex gap-2 items-center">
          <span className={`badge ${typeBadge[data.type] || 'badge-categorical'}`}>{data.type}</span>
          <span className="text-sm text-muted">{data.total_responses} responses</span>
          {data.missing > 0 && <span className="badge badge-negative" style={{ fontSize: '0.7rem' }}>{data.missing} missing</span>}
        </div>
      </div>

      {data.type === 'rating' && (
        <div>
          <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--panel-border)' }}>
              <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Average</div>
              <RatingStars value={data.mean} max={Math.ceil(data.max)} />
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--panel-border)' }}>
              <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Median</div>
              <span className="font-bold" style={{ fontSize: '1.1rem' }}>{data.median}</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--panel-border)' }}>
              <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Std Dev</div>
              <span className="font-bold" style={{ fontSize: '1.1rem' }}>{data.std}</span>
            </div>
          </div>
          {data.distribution && (
            <div style={{ height: 200, position: 'relative', marginTop: 12 }}>
              <Bar data={{
                labels: Object.keys(data.distribution),
                datasets: [{ data: Object.values(data.distribution), backgroundColor: 'rgba(99, 102, 241, 0.8)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4 }]
              }} options={{ 
                ...chartOpts, 
                plugins: { 
                  ...chartOpts.plugins, 
                  title: { display: true, text: 'Rating Distribution', color: '#94a3b8', font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '700' } } 
                } 
              }} />
            </div>
          )}
        </div>
      )}

      {data.type === 'categorical' && data.distribution && (
        <div>
          <div className="text-sm text-muted mb-4">{data.unique_count} unique values · Most common: <strong>{data.most_common}</strong></div>
          {Object.entries(data.distribution).map(([label, count], i) => (
            <DistributionBar key={label} label={label} count={count} max={Math.max(...Object.values(data.distribution))} color={COLORS[i % COLORS.length]} />
          ))}
        </div>
      )}

      {data.type === 'text' && data.sentiment && (
        <div>
          <div className="mb-4">
            <div className="text-sm font-bold mb-2">Overall Sentiment</div>
            <SentimentGauge data={data.sentiment} />
          </div>
          {data.keywords?.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-bold mb-2">Top Keywords</div>
              <div className="keyword-cloud">
                {data.keywords.slice(0, 15).map((k, i) => (
                  <span key={i} className="keyword-tag" style={{ fontSize: `${Math.max(0.7, Math.min(1.1, 0.7 + k.count / 20))}rem` }}>
                    {k.word} <span style={{ opacity: 0.6 }}>({k.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.sample_responses?.length > 0 && (
            <div>
              <div className="text-sm font-bold mb-2">Sample Responses</div>
              {data.sample_responses.map((r, i) => {
                const text = typeof r === 'string' ? r : r.text;
                const sent = typeof r === 'string' ? 'neutral' : r.sentiment;
                const borderColor = sent === 'positive' ? 'var(--green)' : sent === 'negative' ? 'var(--red)' : 'var(--text-dim)';
                const icon = sent === 'positive' ? <Icons.Smile /> : sent === 'negative' ? <Icons.Frown /> : <Icons.Neutral />;
                return (
                  <div key={i} style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--panel-border)', borderRadius: 8, fontSize: '0.85rem', marginBottom: 8, borderLeft: `4px solid ${borderColor}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span className={`badge badge-${sent}`} style={{ flexShrink: 0 }}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{icon} {sent}</span></span>
                    <span style={{ color: 'var(--text)' }}>"{text}"</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {data.type === 'numeric' && (
        <div className="grid-4">
          {[['Mean', data.mean], ['Median', data.median], ['Min', data.min], ['Max', data.max]].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center', padding: 16, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--panel-border)', borderRadius: 10 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>{val}</div>
              <div className="text-sm text-muted" style={{ marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function App() {
  const [tab, setTab] = useState('upload');
  const [uploadInfo, setUploadInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) { setError('Please upload a CSV file'); return; }
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await axios.post(`${API_BASE}/api/survey/upload`, fd);
      setUploadInfo(r.data);
      // Auto-analyze
      const a = await axios.get(`${API_BASE}/api/survey/analyze`);
      setAnalysis(a.data);
      const d = await axios.get(`${API_BASE}/api/survey/data`);
      setRawData(d.data);
      setTab('overview');
    } catch (e) { setError(e.response?.data?.error || 'Upload failed'); }
    finally { setLoading(false); }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const sentiment = analysis?.summary?.overall_sentiment;
  const sentTotal = sentiment ? sentiment.positive + sentiment.negative + sentiment.neutral : 0;

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-logo">
          <Icons.Logo />
          <div>
            <h1>Survey Analyzer</h1>
            <p>Instant survey insight engine with automated sentiment & keywords analysis</p>
          </div>
        </div>
        {uploadInfo && (
          <div className="topbar-info">
            <Icons.File />
            <span>{uploadInfo.rows} responses · {uploadInfo.columns.length} questions</span>
          </div>
        )}
      </div>

      <div className="page">
        {error && (
          <div className="alert alert-error mb-4">
            <Icons.Alert />
            <span>{error}</span>
          </div>
        )}

        <div className="tab-bar">
          {[
            { id: 'upload', label: 'Upload', icon: <Icons.Upload /> },
            { id: 'overview', label: 'Overview', icon: <Icons.Chart /> },
            { id: 'personas', label: 'AI Personas', icon: <Icons.Users /> },
            { id: 'questions', label: 'Questions', icon: <Icons.Help /> },
            { id: 'sentiment', label: 'Sentiment', icon: <Icons.Message /> },
            { id: 'raw', label: 'Raw Data', icon: <Icons.Database /> },
          ].map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* UPLOAD TAB */}
        {tab === 'upload' && (
          <div>
            <div className={`upload-zone ${drag ? 'drag' : ''}`}
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              {loading ? (
                <div>
                  <div className="spinner" />
                  <h3>Analyzing your survey...</h3>
                  <p style={{ marginTop: 8 }}>Reading responses, parsing keywords, and estimating sentiment...</p>
                </div>
              ) : (
                <div>
                  <div className="upload-icon-container">
                    <Icons.Upload />
                  </div>
                  <h3>Drop your Survey CSV here</h3>
                  <p>or click to browse · Supports Google Forms, Typeform, SurveyMonkey exports</p>
                  <button className="btn btn-primary" style={{ marginTop: 8 }}>
                    <Icons.Upload /> Choose File
                  </button>
                </div>
              )}
            </div>
            
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-title"><Icons.Info /> How to use</div>
              <div className="grid-3">
                {[
                  { icon: <Icons.Download />, title: '1. Export Data', desc: 'Download your survey responses as CSV from Google Forms, Typeform, or any other tool.' },
                  { icon: <Icons.Upload />, title: '2. Upload CSV', desc: 'Drop the CSV file above. The analyzer automatically detects data columns and types.' },
                  { icon: <Icons.Activity />, title: '3. Instant Insights', desc: 'Get sentiment analyses, distributions, keyword clouds, and ratings summaries instantly.' },
                ].map((step, idx) => (
                  <div key={idx} style={{ padding: 20, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--panel-border)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ color: 'var(--primary)', display: 'flex' }}>{step.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{step.title}</div>
                    </div>
                    <div className="text-sm text-muted">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && analysis && (
          <div>
            <div className="grid-4 mb-4">
              {[
                { icon: <Icons.Users />, val: analysis.summary.total_responses, label: 'Total Responses', colorClass: 'stat-blue' },
                { icon: <Icons.Help />, val: analysis.summary.total_columns, label: 'Questions', colorClass: 'stat-purple' },
                { icon: <Icons.Check />, val: `${analysis.summary.completion_rate}%`, label: 'Completion Rate', colorClass: 'stat-green' },
                { icon: <Icons.Message />, val: analysis.summary.text_columns.length, label: 'Open-ended Qs', colorClass: 'stat-yellow' },
              ].map(s => (
                <div key={s.label} className={`stat-box ${s.colorClass}`}>
                  <div className="stat-icon-wrap">{s.icon}</div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            {/* AI Analyst Report Card */}
            {analysis.ai_analysis && (
              <div className="card mb-4" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M12 2a10 10 0 0 1 7.54 16.59l-1.42-1.42A8 8 0 1 0 12 20v2a10 10 0 0 1 0-20z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span style={{ marginLeft: 8 }}>🧠 AI Analyst Executive Brief</span>
                </div>
                <p style={{ fontSize: '0.94rem', color: 'var(--text)', lineHeight: '1.6', marginBottom: '20px' }}>
                  {analysis.ai_analysis.executive_summary}
                </p>
                <div className="grid-2">
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '12px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icons.Check /> Key Findings
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
                      {analysis.ai_analysis.key_findings.map((f, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icons.Info /> Strategic Recommendations
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
                      {analysis.ai_analysis.recommendations.map((r, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>➔</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid-2">
              {sentTotal > 0 && (
                <div className="card">
                  <div className="card-title"><Icons.Message /> Overall Sentiment Analysis</div>
                  <div>
                    <SentimentGauge data={sentiment} />
                    <div style={{ height: 160, position: 'relative', marginTop: 20 }}>
                      <Doughnut data={{
                        labels: ['Positive', 'Neutral', 'Negative'],
                        datasets: [{ data: [sentiment.positive, sentiment.neutral, sentiment.negative], backgroundColor: ['#10b981', '#64748b', '#ef4444'], borderWidth: 0 }]
                      }} options={{ 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { 
                          legend: { 
                            position: 'right', 
                            labels: { 
                              color: '#e2e8f0', 
                              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
                              boxWidth: 12,
                              padding: 15
                            } 
                          } 
                        } 
                      }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-title"><Icons.Chart /> Question Preview Breakdown</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(analysis.results).slice(0, 3).map(([col, data]) => (
                    <div key={col} style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--panel-border)', borderRadius: 10 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={col}>{col}</div>
                      <div className="flex gap-2 items-center">
                        <span className={`badge ${data.type === 'text' ? 'badge-text' : data.type === 'rating' ? 'badge-rating' : 'badge-categorical'}`}>{data.type}</span>
                        <span className="text-sm text-muted">{data.total_responses} responses</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PERSONAS TAB */}
        {tab === 'personas' && analysis && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>👥 AI-Generated User Personas</h2>
              <p className="text-muted" style={{ fontSize: '0.88rem' }}>
                We cluster responses and build customer profiles dynamically, capturing core cohorts, desires, friction points, and user quotes.
              </p>
            </div>
            
            <div className="grid-3">
              {analysis.ai_personas && analysis.ai_personas.map((persona, index) => (
                <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '50%', 
                      background: persona.avatar_gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#fff',
                      fontSize: '1.05rem',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      flexShrink: 0
                    }}>
                      {persona.initials}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {persona.name}
                        <span className={`badge ${persona.type === 'positive' ? 'badge-positive' : persona.type === 'negative' ? 'badge-negative' : 'badge-neutral'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                          {persona.size_percentage}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={persona.tagline}>
                        {persona.tagline}
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Description */}
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px', flex: '1' }}>
                    {persona.profile}
                  </p>
                  
                  {/* Likes and Dislikes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>✓ Key Needs / Likes</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {persona.likes.map((l, i) => (
                          <span key={i} className="badge badge-positive" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{l}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>✗ Frustrations / Dislikes</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {persona.dislikes.map((d, i) => (
                          <span key={i} className="badge badge-negative" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Representative Quote speech bubble */}
                  <div style={{ 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--panel-border)', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem', 
                    fontStyle: 'italic', 
                    color: 'var(--text)', 
                    lineHeight: '1.4',
                    position: 'relative'
                  }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', lineHeight: '0', position: 'absolute', top: '10px', left: '6px' }}>“</span>
                    <div style={{ paddingLeft: '10px' }}>{persona.key_quote}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {tab === 'questions' && analysis && (
          <div>
            {Object.entries(analysis.results).map(([col, data]) => (
              <ColumnCard key={col} col={col} data={data} />
            ))}
          </div>
        )}

        {/* SENTIMENT TAB */}
        {tab === 'sentiment' && analysis && (
          <div>
            {analysis.summary.text_columns.length === 0 ? (
              <div className="empty">
                <div className="empty-icon-container"><Icons.Message /></div>
                <h3>No open-ended questions</h3>
                <p>Sentiment analysis requires text/open-ended columns in your survey CSV.</p>
              </div>
            ) : (
              analysis.summary.text_columns.map(col => {
                const data = analysis.results[col];
                if (!data || data.type !== 'text') return null;
                return (
                  <div key={col} className="card mb-4">
                    <div className="card-title"><Icons.Message /> {col}</div>
                    <div className="grid-2">
                      <div>
                        <SentimentGauge data={data.sentiment} />
                        <div style={{ marginTop: 24 }}>
                          <div className="text-sm font-bold mb-3">Top Keywords</div>
                          <div className="keyword-cloud">
                            {data.keywords?.slice(0, 20).map((k, i) => (
                              <span key={i} className="keyword-tag">{k.word} ({k.count})</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold mb-3">Sample Responses</div>
                        {data.sample_responses?.map((r, i) => {
                          const text = typeof r === 'string' ? r : r.text;
                          const sent = typeof r === 'string' ? 'neutral' : r.sentiment;
                          const borderColor = sent === 'positive' ? 'var(--green)' : sent === 'negative' ? 'var(--red)' : 'var(--text-dim)';
                          const icon = sent === 'positive' ? <Icons.Smile /> : sent === 'negative' ? <Icons.Frown /> : <Icons.Neutral />;
                          return (
                            <div key={i} style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--panel-border)', borderRadius: 8, fontSize: '0.85rem', marginBottom: 8, borderLeft: `4px solid ${borderColor}` }}>
                              <div style={{ marginBottom: 6 }}>
                                <span className={`badge badge-${sent}`}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{icon} {sent}</span></span>
                              </div>
                              <span style={{ color: 'var(--text)' }}>"{text}"</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* RAW DATA TAB */}
        {tab === 'raw' && rawData && (
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title" style={{ margin: 0, border: 'none', padding: 0 }}><Icons.Database /> Raw Survey Data</div>
              <span className="text-sm text-muted" style={{ fontWeight: 600 }}>{rawData.rows} rows · {rawData.columns.length} columns</span>
            </div>
            <div className="table-wrap" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
              <table>
                <thead>
                  <tr>
                    {rawData.columns.map(c => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rawData.preview.map((row, i) => (
                    <tr key={i}>
                      {rawData.columns.map(c => <td key={c} title={String(row[c] || '')}>{String(row[c] || '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!analysis && tab !== 'upload' && (
          <div className="empty">
            <div className="empty-icon-container"><Icons.File /></div>
            <h3>No survey uploaded</h3>
            <p>Go to the Upload tab to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
