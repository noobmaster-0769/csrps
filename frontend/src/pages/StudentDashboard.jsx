import { useState, useEffect } from 'react';
import { api } from '../api';

const GRADE_COLOR = { A: 'badge-A', B: 'badge-B', C: 'badge-C', D: 'badge-D', Fail: 'badge-Fail' };

export default function StudentDashboard({ user }) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user.student_id) {
      setError('Your account is not linked to a student record. Contact the admin.');
      setLoading(false);
      return;
    }
    api.getResult(user.student_id).then(data => {
      if (data.error) setError(data.error);
      else setResult(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="loading" style={{ paddingTop: 80 }}>Loading your result…</div>;

  if (error) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div className="alert alert-error">⚠️ {error}</div>
    </div>
  );

  if (!result) return null;

  const { student, marks, total, max_total, percentage, grade, status } = result;
  const gradeClass = GRADE_COLOR[grade] || 'badge-D';

  return (
    <div className="container">
      {/* Header card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div className="score-circle">
          <span className="score-pct">{percentage}%</span>
          <span className="score-label">Score</span>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.3rem', color: '#1a237e', borderBottom: 'none', marginBottom: 6 }}>
            {student.name}
          </h2>
          <p style={{ color: '#666', fontSize: '.9rem' }}>
            Class: <strong>{student.class}</strong> &nbsp;|&nbsp; Roll No: <strong>{student.roll_no}</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '.75rem', color: '#999', textTransform: 'uppercase' }}>Grade</span>
              <div><span className={`badge ${gradeClass}`} style={{ fontSize: '1rem', padding: '4px 14px' }}>{grade}</span></div>
            </div>
            <div>
              <span style={{ fontSize: '.75rem', color: '#999', textTransform: 'uppercase' }}>Status</span>
              <div><span className={`badge badge-${status}`} style={{ fontSize: '1rem', padding: '4px 14px' }}>{status}</span></div>
            </div>
            <div>
              <span style={{ fontSize: '.75rem', color: '#999', textTransform: 'uppercase' }}>Total</span>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a237e' }}>{total} / {max_total}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise marks */}
      <div className="card">
        <h2>📊 Subject-wise Marks</h2>
        {marks.length === 0
          ? <div className="empty">No marks entered yet. Check back later.</div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Subject</th><th>Marks Obtained</th><th>Max Marks</th><th>Percentage</th></tr>
                </thead>
                <tbody>
                  {marks.map((m, i) => {
                    const pct = ((m.marks / m.max_marks) * 100).toFixed(1);
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><strong>{m.subject}</strong></td>
                        <td>{m.marks}</td>
                        <td>{m.max_marks}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              height: 8, width: 100, background: '#e8eaf6', borderRadius: 4, overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: pct >= 75 ? '#2e7d32' : pct >= 40 ? '#f57c00' : '#c62828',
                                borderRadius: 4
                              }} />
                            </div>
                            <span style={{ fontSize: '.82rem', color: '#666' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Grade scale */}
      <div className="card">
        <h2>📏 Grade Scale</h2>
        <div className="grade-scale">
          {[['A', '≥ 90%', 'badge-A'], ['B', '≥ 75%', 'badge-B'],
            ['C', '≥ 60%', 'badge-C'], ['D', '≥ 40%', 'badge-D'],
            ['Fail', '< 40%', 'badge-Fail']].map(([g, r, cls]) => (
            <div className="grade-scale-item" key={g}>
              <span className={`badge ${cls}`}>{g}</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
