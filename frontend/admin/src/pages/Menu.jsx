import { useEffect, useState } from 'react';
import api from '../api/axios';

const CATEGORIES = ['cake', 'pastry', 'bread', 'cookie', 'other'];

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'cake',
    pricePerKg: 0,
    minSizeKg: 0.5,
    available: true,
    imageUrl: '',
    tags: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = () => {
    api.get('/products')
      .then(r => setProducts(r.data.data))
      .catch(err => console.error("Error fetching menu products", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      pricePerKg: parseFloat(form.pricePerKg),
      minSizeKg: parseFloat(form.minSizeKg),
      tags: form.tags.split(',').map(t => t.trim()).filter(t => t !== '')
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        alert("Product updated!");
      } else {
        await api.post('/products', payload);
        alert("Product created!");
      }
      setEditingId(null);
      setForm({ name: '', description: '', category: 'cake', pricePerKg: 0, minSizeKg: 0.5, available: true, imageUrl: '', tags: '' });
      fetchProducts();
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category,
      pricePerKg: p.pricePerKg,
      minSizeKg: p.minSizeKg || 0.5,
      available: p.available,
      imageUrl: p.imageUrl || '',
      tags: p.tags ? p.tags.join(', ') : ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Error removing item: " + err.message);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1B2A4A', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Menu Configuration</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Configure items displayed on the customer-facing menu page.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        {/* Creation Form */}
        <form onSubmit={handleSubmit} className="dashboard-card" style={{ position: 'sticky', top: '100px' }}>
          <h3 style={{ color: '#1B2A4A', marginBottom: '20px', fontWeight: '700' }}>
            {editingId ? '📝 Edit Menu Item' : '✨ Add New Product'}
          </h3>
          
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Red Velvet Cake"/>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe ingredients, allergy alerts..."></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select className="form-control" value={form.available} onChange={e => setForm({...form, available: e.target.value === 'true'})}>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Price per Kg (₹)</label>
              <input type="number" className="form-control" value={form.pricePerKg} onChange={e => setForm({...form, pricePerKg: e.target.value})} required min="0"/>
            </div>
            <div className="form-group">
              <label className="form-label">Min Size (Kg)</label>
              <input type="number" className="form-control" step="0.5" value={form.minSizeKg} onChange={e => setForm({...form, minSizeKg: e.target.value})} required min="0.5"/>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (Optional)</label>
            <input type="text" className="form-control" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://image-url.com/cake.jpg"/>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input type="text" className="form-control" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="eggless, bestseller, custom"/>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }}>
              {editingId ? 'Update Item' : 'Add to Menu'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => {
                setEditingId(null);
                setForm({ name: '', description: '', category: 'cake', pricePerKg: 0, minSizeKg: 0.5, available: true, imageUrl: '', tags: '' });
              }}>Cancel</button>
            )}
          </div>
        </form>

        {/* Product List Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {products.map(p => (
            <div key={p._id} className="dashboard-card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}/>
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎂</div>
              )}
              <div style={{ flex: 1 }}>
                <span className="badge" style={{ background: '#FAF5EB', color: '#1B2A4A', fontSize: '11px', padding: '2px 8px', marginBottom: '4px' }}>{p.category}</span>
                <h4 style={{ color: '#1B2A4A', fontSize: '16px', fontWeight: '700' }}>{p.name}</h4>
                <p style={{ color: '#666', fontSize: '13px', margin: '4px 0' }}>{p.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontWeight: '600' }}>
                  <span style={{ color: '#0F6E56' }}>₹{p.pricePerKg}/kg</span>
                  <span style={{ color: '#888' }}>Min: {p.minSizeKg}kg</span>
                  <span style={{ color: p.available ? '#2ECC71' : '#E74C3C' }}>
                    ● {p.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDelete(p._id)}>Remove</button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="dashboard-card" style={{ textAlign: 'center', color: '#888' }}>No items in the menu. Add one using the form!</div>
          )}
        </div>
      </div>
    </div>
  );
}
