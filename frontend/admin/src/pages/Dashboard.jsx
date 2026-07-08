import { useEffect, useState } from 'react';
import api from '../api/axios';

const StatCard = ({ label, value, color }) => (
  <div className="dashboard-card" style={{ borderTop: `4px solid ${color}` }}>
    <p style={{ color: '#888', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>{label}</p>
    <h2 style={{ color, fontSize: '32px', fontWeight: '800' }}>{value}</h2>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(err => {
        console.error("Error loading dashboard stats", err);
        setError(err.response?.data?.message || err.message);
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: '24px', background: '#FDEDEC', color: '#E74C3C', borderRadius: '12px', border: '1.5px solid #FADBD8', maxWidth: '500px' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>⚠️ Failed to Load Analytics</h3>
        <p style={{ marginBottom: '16px' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ padding: '10px 20px', background: '#E74C3C', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(231, 76, 60, 0.2)' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!stats) return <p style={{ fontSize: '16px', fontWeight: '600', color: '#1B2A4A' }}>Loading analytics... 🎂</p>;

  return (
    <div>
      <h1 style={{ color: '#1B2A4A', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Real-time business performance overview.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard label="Total Orders" value={stats.totalOrders} color="#1B2A4A" />
        <StatCard label="Revenue (₹)" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} color="#0F6E56" />
        <StatCard label="Total Leads" value={stats.totalLeads} color="#E8A020" />
        <StatCard label="Customers" value={stats.totalCustomers} color="#9B59B6" />
      </div>

      <div className="dashboard-card">
        <h3 style={{ color: '#1B2A4A', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Recent Order Submissions</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Total', 'Status'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: '700', color: '#1B2A4A' }}>{o.orderId}</td>
                    <td>{o.customer?.name || 'Anonymous'}</td>
                    <td style={{ color: '#0F6E56', fontWeight: '700' }}>₹{o.total}</td>
                    <td>
                      <span 
                        className="badge" 
                        style={{ 
                          background: o.status === 'delivered' ? '#E1F5EE' : '#FCF3CF',
                          color: o.status === 'delivered' ? '#0F6E56' : '#B7950B'
                        }}
                      >
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>No recent orders.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
