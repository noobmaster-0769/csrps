import { useState, useEffect } from 'react';
import { api } from '../api';

// ── Sub-page: Student Management ──────────────────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [form,     setForm]     = useState({ name: '', class: '', roll_no: '' });
  const [msg,      setMsg]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null); // student id being edited

  const load = async () => {
    setLoading(true);
    const data = await api.getStudents();
    setStudents(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const submit = async (e) => {
    e.preventDefault();
    let res;
    if (editing) {
      res = await api.updateStudent(editing, form);
    } else {
      res = await api.addStudent(form);
    }
    if (res.error) return flash(res.error, false);
    flash(editing ? 'Student updated!' : 'Student added!');
    setForm({ name: '', class: '', roll_no: '' });
    setEditing(null);
    load();
  };

  const startEdit = (s) => {
    setForm({ name: s.name, class: s.class, roll_no: s.roll_no });
    setEditing(s.id);
  };

  const del = async (id) => {
    if (!confirm('Delete this student? This also removes all their marks.')) return;
    await api.deleteStudent(id);
    flash('Student deleted.');
    load();
  };

  return (
    <>
      <div className="card">
        <h2>👤 {editing ? 'Edit Student' : 'Add New Student'}</h2>
        {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>
          {msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
        <form onSubmit={submit}>
          <div className="form-row-3">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handle}
                placeholder="e.g. Alice Johnson" required />
            </div>
            <div className="form-group">
              <label>Class</label>
              <input name="class" value={form.class} onChange={handle}
                placeholder="e.g. 10-A" required />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input name="roll_no" value={form.roll_no} onChange={handle}
                placeholder="e.g. CS001" required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit">
              {editing ? '💾 Update' : '➕ Add Student'}
            </button>
            {editing && (
              <button className="btn btn-secondary" type="button"
                onClick={() => { setEditing(null); setForm({ name: '', class: '', roll_no: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>📋 All Students ({students.length})</h2>
        {loading ? <div className="loading">Loading…</div> : (
          students.length === 0
            ? <div className="empty">No students added yet.</div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Class</th><th>Roll No</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id}>
                        <td>{i + 1}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.class}</td>
                        <td><code>{s.roll_no}</code></td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => startEdit(s)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => del(s.id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}
      </div>
    </>
  );
}

// ── Sub-page: Subject Management ──────────────────────────────────────────────
function SubjectsTab() {
  const [subjects, setSubjects] = useState([]);
  const [form,     setForm]     = useState({ name: '', max_marks: 100 });
  const [msg,      setMsg]      = useState(null);
  const [loading,  setLoading]  = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await api.getSubjects();
    setSubjects(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.addSubject({ name: form.name, max_marks: parseInt(form.max_marks) });
    if (res.error) return flash(res.error, false);
    flash('Subject added!');
    setForm({ name: '', max_marks: 100 });
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete this subject?')) return;
    await api.deleteSubject(id);
    flash('Subject deleted.');
    load();
  };

  return (
    <>
      <div className="card">
        <h2>📚 Add New Subject</h2>
        {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>
          {msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Subject Name</label>
              <input name="name" value={form.name} onChange={handle}
                placeholder="e.g. Mathematics" required />
            </div>
            <div className="form-group">
              <label>Maximum Marks</label>
              <input name="max_marks" type="number" value={form.max_marks}
                onChange={handle} min="1" max="500" required />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">➕ Add Subject</button>
        </form>
      </div>

      <div className="card">
        <h2>📋 All Subjects ({subjects.length})</h2>
        {loading ? <div className="loading">Loading…</div> : (
          subjects.length === 0
            ? <div className="empty">No subjects added yet.</div>
            : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Subject</th><th>Max Marks</th><th>Action</th></tr></thead>
                  <tbody>
                    {subjects.map((s, i) => (
                      <tr key={s.id}>
                        <td>{i + 1}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.max_marks}</td>
                        <td>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => del(s.id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}
      </div>
    </>
  );
}

// ── Sub-page: Register User ───────────────────────────────────────────────────
function RegisterTab() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'teacher', student_id: '' });
  const [students, setStudents] = useState([]);
  const [msg,     setMsg]     = useState(null);

  useEffect(() => { api.getStudents().then(d => setStudents(Array.isArray(d) ? d : [])); }, []);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const flash  = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (form.role !== 'student') delete payload.student_id;
    const res = await api.register(payload);
    if (res.error) return flash(res.error, false);
    flash(`User "${res.name}" created as ${res.role}!`);
    setForm({ name: '', email: '', password: '', role: 'teacher', student_id: '' });
  };

  return (
    <div className="card">
      <h2>🔐 Create User Account</h2>
      {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>
        {msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handle}>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
        {form.role === 'student' && (
          <div className="form-group">
            <label>Link to Student Record</label>
            <select name="student_id" value={form.student_id} onChange={handle} required>
              <option value="">— select student —</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>
              ))}
            </select>
          </div>
        )}
        <button className="btn btn-success" type="submit">➕ Create Account</button>
      </form>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'students', label: '👤 Students' },
  { id: 'subjects', label: '📚 Subjects' },
  { id: 'register', label: '🔐 User Accounts' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('students');
  return (
    <div className="container">
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'students' && <StudentsTab />}
      {tab === 'subjects' && <SubjectsTab />}
      {tab === 'register' && <RegisterTab />}
    </div>
  );
}
