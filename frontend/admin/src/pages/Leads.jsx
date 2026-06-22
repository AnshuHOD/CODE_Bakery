import { useEffect, useState } from 'react';
import api from '../api/axios';

const LEAD_STATUS_COLORS = {
  new: '#2980B9',
  contacted: '#3498DB',
  qualified: '#8E44AD',
  order_placed: '#2ECC71',
  closed_won: '#0F6E56',
  closed_lost: '#E74C3C',
};

export default function Leads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get('/leads')
      .then(r => setLeads(r.data.data))
      .catch(err => console.error("Error fetching leads", err));
  }, []);

  const updateLeadStatus = async (id, status) => {
    try {
      await api.put(`/leads/${id}`, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
    } catch (err) {
      alert("Failed to update lead status: " + err.message);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1B2A4A', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>CRM Lead Funnel</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Track chatbot inquiries and custom cake order qualifications.</p>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {['Contact Name', 'Email / Phone', 'Interested In', 'Est. Budget', 'Source', 'Status', 'Update Status', 'Captured At'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((l) => (
                <tr key={l._id}>
                  <td>
                    <strong style={{ color: '#1B2A4A' }}>{l.name}</strong>
                    {l.notes && (
                      <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginTop: '2px' }}>
                        Notes: "{l.notes}"
                      </div>
                    )}
                  </td>
                  <td>
                    <span>{l.email}</span><br/>
                    <small style={{ color: '#666' }}>{l.phone}</small>
                  </td>
                  <td style={{ fontSize: '13px', color: '#555', maxWidth: '200px' }}>{l.interestedIn || '-'}</td>
                  <td style={{ fontWeight: '700', color: '#B7950B' }}>{l.estimatedBudget || '-'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{l.source}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: LEAD_STATUS_COLORS[l.status] + '22', 
                        color: LEAD_STATUS_COLORS[l.status] 
                      }}
                    >
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={l.status} 
                      onChange={e => updateLeadStatus(l._id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1.5px solid #d0cec8', fontSize: '13px', cursor: 'pointer' }}
                    >
                      {['new', 'contacted', 'qualified', 'order_placed', 'closed_won', 'closed_lost'].map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(l.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>No leads captured yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
