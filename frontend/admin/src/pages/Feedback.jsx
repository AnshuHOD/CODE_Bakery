import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    api.get('/feedback')
      .then(r => setFeedbacks(r.data.data))
      .catch(err => console.error("Error fetching feedback list", err));
  }, []);

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div>
      <h1 style={{ color: '#1B2A4A', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Customer Feedback</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Review star ratings and recommendation logs submitted by customers.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {feedbacks.length > 0 ? (
          feedbacks.map((f) => (
            <div key={f._id} className="dashboard-card" style={{ borderLeft: `6px solid ${f.rating >= 4 ? '#0F6E56' : f.rating === 3 ? '#E8A020' : '#E74C3C'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ color: '#1B2A4A', fontSize: '18px', fontWeight: '700' }}>{f.customer?.name || 'Anonymous'}</h4>
                  <small style={{ color: '#666', fontSize: '13px' }}>{f.customer?.email || 'No email registered'}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#E8A020', fontSize: '20px', fontWeight: 'bold', display: 'block' }}>
                    {renderStars(f.rating)}
                  </span>
                  <small style={{ color: '#888', fontSize: '12px' }}>
                    {new Date(f.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </small>
                </div>
              </div>
              
              <p style={{ fontSize: '15px', color: '#333', fontStyle: 'italic', background: '#FAF8F4', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(27,42,74,0.03)', marginBottom: '12px' }}>
                "{f.comment || 'No comments provided.'}"
              </p>
              
              <div style={{ display: 'flex', gap: '24px', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ color: '#1B2A4A' }}>
                  📦 Order Ref: <strong style={{ color: '#0F6E56' }}>{f.order?.orderId || '-'}</strong>
                </span>
                <span style={{ color: f.wouldRecommend ? '#0F6E56' : '#E74C3C' }}>
                  {f.wouldRecommend ? '✅ Would Recommend' : '❌ Would Not Recommend'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="dashboard-card" style={{ textAlign: 'center', color: '#888', padding: '32px' }}>
            No customer reviews logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
