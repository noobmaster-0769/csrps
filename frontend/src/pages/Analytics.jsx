import { useState, useEffect } from 'react';
import { api } from '../api';

// Simple SVG bar — no charting library needed
function Bar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 14, background: '#e8eaf6', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 8,
          transition: 'width .5s ease' }} />
      </div>
      <span style={{ minWidth: 36, textAlign: 'right', fontSize: '.82rem', fontWeight: 700, color: '#444' }}>
        {value}
      </span>
    </div>
  );
}

const GRADE_COLOR = { A: '#2e7d32', B: '#1565c0', C: '#f57c00', D: '#bf360c', Fail: '#b71c1c' };

function gradeFromPct(pct) {
  if (pct >= 90) return 'A';
  if (pct >= 75) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 40) return 'D';
  return 'Fail';
}

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.getAnalytics().then(d => {
      if (d.error) setError(d.error);
      else setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading" style={{ paddingTop: 80 }}>Loading analytics…</div>;
  if (error)   return <div className="container"><div className="alert alert-error">⚠️ {error}</div></div>;
  if (!data)   return null;

  const { subject_averages, pass_fail, top_students } = data;
  const passRate = pass_fail.total > 0
    ? ((pass_fail.pass / pass_fail.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="container">
      {/* Summary stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{pass_fail.total}</div>
          <div className="stat-label">Students with Marks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#2e7d32' }}>{pass_fail.pass}</div>
          <div className="stat-label">Passed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#c62828' }}>{pass_fail.fail}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{passRate}%</div>
          <div className="stat-label">Pass Rate</div>
        </div>
      </div>

      {/* Subject averages */}
      <div className="card">
        <h2>📊 Average Marks by Subject</h2>
        {subject_averages.length === 0
          ? <div className="empty">No marks data yet.</div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {subject_averages.map(s => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    marginBottom: 4, fontSize: '.85rem' }}>
                    <strong>{s.name}</strong>
                    <span style={{ color: '#888' }}>Max: {s.max_marks}</span>
                  </div>
                  <Bar value={parseFloat(s.avg_marks)} max={s.max_marks} color="#1565c0" />
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Pass / Fail visual */}
      <div className="card">
        <h2>✅ Pass / Fail Distribution</h2>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: '.85rem', marginBottom: 4 }}>
                <span>Pass</span><strong style={{ color: '#2e7d32' }}>{pass_fail.pass}</strong>
              </div>
              <Bar value={pass_fail.pass} max={pass_fail.total} color="#2e7d32" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: '.85rem', marginBottom: 4 }}>
                <span>Fail</span><strong style={{ color: '#c62828' }}>{pass_fail.fail}</strong>
              </div>
              <Bar value={pass_fail.fail} max={pass_fail.total} color="#c62828" />
            </div>
          </div>
          {/* Mini donut-style text representation */}
          <div style={{ textAlign: 'center', padding: '12px 20px',
            background: '#f0f4f8', borderRadius: 10 }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a237e' }}>{passRate}%</div>
            <div style={{ fontSize: '.78rem', color: '#888', textTransform: 'uppercase' }}>Pass Rate</div>
          </div>
        </div>
      </div>

      {/* Top students */}
      <div className="card">
        <h2>🏆 Top 5 Students</h2>
        {top_students.length === 0
          ? <div className="empty">No results yet.</div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Rank</th><th>Student</th><th>Class</th><th>Total</th><th>Percentage</th><th>Grade</th></tr>
                </thead>
                <tbody>
                  {top_students.map((s, i) => {
                    const g = gradeFromPct(parseFloat(s.percentage));
                    return (
                      <tr key={s.roll_no}>
                        <td>
                          <span style={{ fontSize: '1.1rem' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                        </td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.class}</td>
                        <td>{s.total} / {s.max_total}</td>
                        <td>
                          <Bar value={parseFloat(s.percentage)} max={100}
                            color={GRADE_COLOR[g] || '#666'} />
                        </td>
                        <td><span className={`badge badge-${g}`}>{g}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
