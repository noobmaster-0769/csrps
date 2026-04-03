import { useState } from 'react';
import { api } from '../api';

const DEMO = [
  { label: '🔴 Admin',   email: 'admin@csrps.com',   password: 'password123' },
  { label: '🔵 Teacher', email: 'teacher@csrps.com', password: 'password123' },
  { label: '🟢 Student', email: 'student@csrps.com', password: 'password123' },
];

export default function Login({ onLogin }) {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.login(form);
    setLoading(false);
    if (res.token) {
      localStorage.setItem('token', res.token);
      onLogin(res.user);
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemo = (d) => {
    setForm({ email: d.email, password: d.password });
    setError('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="logo">🎓</div>
        <h1>CSRPS</h1>
        <p className="tagline">Cloud Student Result Processing System</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email}
              onChange={handle} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password}
              onChange={handle} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? '⏳ Signing in…' : '🔐 Sign In'}
          </button>
        </form>

        <hr className="divider" />
        <p className="demo-label">DEMO ACCOUNTS</p>
        <div className="demo-btns">
          {DEMO.map(d => (
            <button key={d.email} className="btn btn-secondary btn-sm"
              onClick={() => fillDemo(d)} style={{ fontSize: '.75rem' }}>
              {d.label}
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '.72rem', color: '#bbb', marginTop: '18px' }}>
          IaaS · PaaS · SaaS · DaaS — Cloud Computing Lab Project
        </p>
      </div>
    </div>
  );
}
