import { useState } from 'react';
import Login           from './pages/Login';
import AdminDashboard  from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Analytics        from './pages/Analytics';
import Navbar           from './components/Navbar';

// ── Simple client-side "router" ───────────────────────────────────────────────
const NAV = {
  admin:   [
    { id: 'manage',    label: '⚙️ Manage' },
    { id: 'analytics', label: '📈 Analytics' },
  ],
  teacher: [
    { id: 'marks',     label: '📝 Enter Marks' },
    { id: 'analytics', label: '📈 Analytics' },
  ],
  student: [
    { id: 'result',    label: '📋 My Result' },
  ],
};

export default function App() {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      // Attach stored user info — refreshed on login
      return JSON.parse(localStorage.getItem('csrps_user') || 'null');
    } catch { return null; }
  });

  const [page, setPage] = useState(() => {
    const u = JSON.parse(localStorage.getItem('csrps_user') || 'null');
    if (!u) return 'login';
    return u.role === 'admin' ? 'manage'
         : u.role === 'teacher' ? 'marks'
         : 'result';
  });

  const handleLogin = (userData) => {
    localStorage.setItem('csrps_user', JSON.stringify(userData));
    setUser(userData);
    setPage(
      userData.role === 'admin'   ? 'manage' :
      userData.role === 'teacher' ? 'marks'  : 'result'
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('csrps_user');
    setUser(null);
    setPage('login');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const navItems = NAV[user.role] || [];

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      {/* Tab navigation */}
      <div style={{ background: 'white', padding: '0 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)', position: 'sticky', top: 56, zIndex: 90 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 4 }}>
          {navItems.map(n => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderBottom: page === n.id ? '3px solid #1a237e' : '3px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontWeight: page === n.id ? 700 : 500,
                color: page === n.id ? '#1a237e' : '#666',
                fontSize: '.875rem',
                transition: 'all .15s'
              }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div style={{ paddingTop: 8 }}>
        {page === 'manage'    && <AdminDashboard />}
        {page === 'analytics' && <Analytics />}
        {page === 'marks'     && <TeacherDashboard />}
        {page === 'result'    && <StudentDashboard user={user} />}
      </div>
    </>
  );
}
