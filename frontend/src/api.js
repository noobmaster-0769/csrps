// All API calls go through this module.
// VITE_API_URL is set in .env for production; in dev, Vite proxy handles /api/*

const BASE = import.meta.env.VITE_API_URL || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`
});

const get  = (url)  => fetch(BASE + url, { headers: authHeaders() }).then(r => r.json());
const post = (url, body) => fetch(BASE + url, { method: 'POST',   headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json());
const put  = (url, body) => fetch(BASE + url, { method: 'PUT',    headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json());
const del  = (url)  => fetch(BASE + url, { method: 'DELETE', headers: authHeaders() }).then(r => r.json());

export const api = {
  // Auth
  login:    (data) => fetch(BASE + '/api/auth/login',    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  register: (data) => fetch(BASE + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),

  // Students  — DaaS
  getStudents:   ()   => get('/api/students'),
  getStudent:    (id) => get(`/api/students/${id}`),
  addStudent:    (d)  => post('/api/students', d),
  updateStudent: (id, d) => put(`/api/students/${id}`, d),
  deleteStudent: (id) => del(`/api/students/${id}`),

  // Subjects
  getSubjects:   ()   => get('/api/subjects'),
  addSubject:    (d)  => post('/api/subjects', d),
  deleteSubject: (id) => del(`/api/subjects/${id}`),

  // Marks  — DaaS
  enterMarks: (d)          => post('/api/marks', d),
  getMarks:   (studentId)  => get(`/api/marks/${studentId}`),

  // Results  — DaaS
  getResult: (studentId) => get(`/api/results/${studentId}`),

  // Analytics  — DaaS
  getAnalytics: () => get('/api/analytics'),
};
