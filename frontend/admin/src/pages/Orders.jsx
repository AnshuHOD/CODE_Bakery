import { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUS_COLORS = {
  pending_payment: '#E8A020',
  confirmed: '#2980B9',
  processing: '#8E44AD',
  dispatched: '#16A085',
  delivered: '#0F6E56',
  cancelled: '#E74C3C',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data.data))
      .catch(err => console.error("Error fetching orders", err));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1B2A4A', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Order Processing</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Track transactions and update delivery lifecycle status.</p>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr style={{ background: '#1B2A4A', color: 'white' }}>
              {['Order ID', 'Customer', 'Items', 'Total', 'Delivery Date', 'Payment', 'Status', 'Update Status'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((o, idx) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: '700', color: '#1B2A4A' }}>{o.orderId}</td>
                  <td>
                    <strong style={{ color: '#1B2A4A' }}>{o.customer?.name}</strong><br/>
                    <small style={{ color: '#666' }}>{o.customer?.phone}</small>
                  </td>
                  <td style={{ color: '#555', fontSize: '13px', maxWidth: '250px' }}>
                    {o.items.map(i => `${i.productName} (${i.sizeKg}kg ${i.flavour ? `- ${i.flavour}` : ''})`).join(', ')}
                    {o.specialInstructions && (
                      <div style={{ marginTop: '4px', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                        Note: "{o.specialInstructions}"
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: '700', color: '#0F6E56' }}>₹{o.total}</td>
                  <td>{new Date(o.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  <td>
                    <span 
                      className="badge"
                      style={{ 
                        background: o.payment?.status === 'paid' ? '#E1F5EE' : '#FDEDEC',
                        color: o.payment?.status === 'paid' ? '#0F6E56' : '#E74C3C'
                      }}
                    >
                      {o.payment?.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: STATUS_COLORS[o.status] + '22', 
                        color: STATUS_COLORS[o.status] 
                      }}
                    >
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={o.status} 
                      onChange={e => updateStatus(o._id, e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #d0cec8', fontSize: '13px', cursor: 'pointer' }}
                    >
                      {['pending_payment', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>No orders placed yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
