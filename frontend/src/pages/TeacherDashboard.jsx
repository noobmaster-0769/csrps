import { useState, useEffect } from 'react';
import { api } from '../api';

export default function TeacherDashboard() {
  const [students,  setStudents]  = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [selStudent, setSelStudent] = useState('');
  const [existing,  setExisting]  = useState({}); // subjectId → current marks
  const [draft,     setDraft]     = useState({}); // subjectId → input value
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState(null);

  useEffect(() => {
    Promise.all([api.getStudents(), api.getSubjects()]).then(([s, sub]) => {
      setStudents(Array.isArray(s) ? s : []);
      setSubjects(Array.isArray(sub) ? sub : []);
      setLoading(false);
    });
  }, []);

  // Load existing marks when student changes
  useEffect(() => {
    if (!selStudent) { setExisting({}); setDraft({}); return; }
    api.getMarks(selStudent).then(data => {
      const map  = {};
      const init = {};
      if (Array.isArray(data)) {
        data.forEach(m => {
          map[m.subject_id]  = m.marks;
          init[m.subject_id] = m.marks;
        });
      }
      setExisting(map);
      setDraft(init);
    });
  }, [selStudent]);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000); };

  const saveAll = async () => {
    if (!selStudent) return flash('Please select a student first.', false);
    setSaving(true);
    const errors = [];
    for (const sub of subjects) {
      const val = draft[sub.id];
      if (val === '' || val === undefined) continue;
      const marks = parseInt(val);
      if (isNaN(marks) || marks < 0) { errors.push(`${sub.name}: invalid value`); continue; }
      const res = await api.enterMarks({ student_id: parseInt(selStudent), subject_id: sub.id, marks });
      if (res.error) errors.push(`${sub.name}: ${res.error}`);
    }
    setSaving(false);
    if (errors.length) return flash(errors.join(' | '), false);
    flash('All marks saved successfully! ✅');
    // Refresh existing marks
    const data = await api.getMarks(selStudent);
    if (Array.isArray(data)) {
      const map = {};
      data.forEach(m => { map[m.subject_id] = m.marks; });
      setExisting(map);
    }
  };

  if (loading) return <div className="loading" style={{ paddingTop: 80 }}>Loading…</div>;

  const selectedName = students.find(s => s.id === parseInt(selStudent))?.name || '';

  return (
    <div className="container">
      <div className="card">
        <h2>📝 Marks Entry</h2>
        <p style={{ color: '#666', fontSize: '.85rem', marginBottom: 16 }}>
          Select a student and enter marks for each subject. Click <strong>Save All Marks</strong> when done.
        </p>

        <div className="form-group" style={{ maxWidth: 360 }}>
          <label>Select Student</label>
          <select value={selStudent} onChange={e => setSelStudent(e.target.value)}>
            <option value="">— choose a student —</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.roll_no} ({s.class})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selStudent && (
        <div className="card">
          <h2>📊 Marks for {selectedName}</h2>
          {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>
            {msg.ok ? '✅' : '⚠️'} {msg.text}</div>}

          {subjects.length === 0
            ? <div className="empty">No subjects created yet. Ask the admin to add subjects.</div>
            : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Max Marks</th>
                        <th>Saved Marks</th>
                        <th>Enter / Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map(sub => (
                        <tr key={sub.id}>
                          <td><strong>{sub.name}</strong></td>
                          <td>{sub.max_marks}</td>
                          <td>
                            {existing[sub.id] !== undefined
                              ? <span className="badge badge-B">{existing[sub.id]}</span>
                              : <span style={{ color: '#ccc', fontSize: '.8rem' }}>not entered</span>}
                          </td>
                          <td>
                            <input
                              className="marks-input"
                              type="number"
                              min="0"
                              max={sub.max_marks}
                              placeholder="0"
                              value={draft[sub.id] ?? ''}
                              onChange={e => setDraft(d => ({ ...d, [sub.id]: e.target.value }))}
                            />
                            <span style={{ color: '#aaa', fontSize: '.8rem', marginLeft: 6 }}>
                              / {sub.max_marks}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 18 }}>
                  <button className="btn btn-success" onClick={saveAll} disabled={saving}>
                    {saving ? '⏳ Saving…' : '💾 Save All Marks'}
                  </button>
                </div>
              </>
            )}
        </div>
      )}

      {/* Grade reference card */}
      <div className="card">
        <h2>📏 Grade Scale Reference</h2>
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
