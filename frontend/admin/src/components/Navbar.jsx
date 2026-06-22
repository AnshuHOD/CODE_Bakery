import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/orders', label: '📦 Orders' },
  { to: '/leads', label: '👥 Leads (CRM)' },
  { to: '/menu', label: '🎂 Menu' },
  { to: '/feedback', label: '⭐ Feedback' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const logout = () => { 
    localStorage.removeItem('bakery_admin_token'); 
    navigate('/login'); 
  };

  return (
    <nav style={{ width: '220px', background: '#1B2A4A', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '28px 16px', flexShrink: 0 }}>
      <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '32px', paddingLeft: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        🎂 Hooda's Bakery<br/>
        <span style={{ fontSize: '12px', color: '#E1F5EE', fontWeight: '400', opacity: 0.8 }}>Admin Dashboard</span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map(l => (
          <NavLink 
            key={l.to} 
            to={l.to} 
            end={l.to === '/'}
            style={({ isActive }) => ({
              display: 'block', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              color: isActive ? 'white' : '#B0C4DE', 
              fontWeight: isActive ? '700' : '400',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent', 
              fontSize: '15px',
              transition: 'all 0.2s ease'
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
      <button 
        onClick={logout} 
        style={{ 
          marginTop: 'auto', 
          background: 'transparent', 
          border: '1.5px solid rgba(176, 196, 222, 0.4)', 
          color: '#B0C4DE', 
          padding: '12px', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={e => {
          e.target.style.borderColor = 'white';
          e.target.style.color = 'white';
          e.target.style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseOut={e => {
          e.target.style.borderColor = 'rgba(176, 196, 222, 0.4)';
          e.target.style.color = '#B0C4DE';
          e.target.style.background = 'transparent';
        }}
      >
        Logout →
      </button>
    </nav>
  );
}
