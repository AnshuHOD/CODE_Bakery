import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', form);
      localStorage.setItem('bakery_admin_token', res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B2A4A' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '380px', boxShadow: '0 8px 32px rgba(27,42,74,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ color: '#1B2A4A', fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>🎂 Hooda's Bakery</h2>
        <p style={{ color: '#666', fontSize: '15px', marginBottom: '24px' }}>Admin Dashboard Gateway</p>
        
        {error && <p style={{ color: '#E74C3C', fontSize: '14px', fontWeight: '600', marginBottom: '14px', background: '#FDEDEC', padding: '8px 12px', borderRadius: '6px' }}>{error}</p>}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px' }}>Admin Email</label>
          <input 
            type="email" 
            placeholder="admin@sweetbites.com" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})}
            style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0ddd5', fontSize: '14px', outline: 'none' }} 
            required
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '4px' }}>Security Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})}
            style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0ddd5', fontSize: '14px', outline: 'none' }} 
            required
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: '#0F6E56', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '16px', 
            fontWeight: '700', 
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(15, 110, 86, 0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => e.target.style.background = '#13876a'}
          onMouseOut={e => e.target.style.background = '#0F6E56'}
        >
          Sign In ➔
        </button>
      </form>
    </div>
  );
}
