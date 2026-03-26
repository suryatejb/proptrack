import { useEffect, useState } from 'react';
import { getBuyers, createBuyer, updateBuyer, deleteBuyer } from '../api';

const EMPTY = { first_name: '', last_name: '', email: '', phone: '', pre_approval_status: 'none', budget_min: '', budget_max: '', preferences: '' };

export default function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => {
    const qs = filter ? `?status=${filter}` : '';
    getBuyers(qs).then(setBuyers).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit = (b) => { setForm({ ...b }); setError(''); setModal(b); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email) {
      setError('First name, last name, and email are required.'); return;
    }
    try {
      if (modal === 'create') await createBuyer(form);
      else await updateBuyer(modal.buyer_id, form);
      setModal(null); load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this buyer?')) return;
    try { await deleteBuyer(id); load(); } catch (err) { alert(err.message); }
  };

  const approvalBadge = (s) => {
    const map = { approved: 'badge-accepted', pending: 'badge-pending', none: 'badge-withdrawn' };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Buyers</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Buyer</button>
      </div>

      <div className="filter-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Approval Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="none">None</option>
        </select>
        <button className="btn" style={{background:'#e5e7eb'}} onClick={() => setFilter('')}>Clear</button>
      </div>

      <div className="card mb-0">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Pre-Approval</th><th>Budget Range</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {buyers.map(b => (
              <tr key={b.buyer_id}>
                <td>{b.first_name} {b.last_name}</td>
                <td>{b.email}</td>
                <td>{b.phone || '—'}</td>
                <td>{approvalBadge(b.pre_approval_status)}</td>
                <td>${Number(b.budget_min || 0).toLocaleString()} – ${Number(b.budget_max || 0).toLocaleString()}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-sm" style={{background:'#e0e7ff',color:'#3730a3'}} onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.buyer_id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {buyers.length === 0 && <tr><td colSpan="6" style={{color:'#999',textAlign:'center'}}>No buyers found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal === 'create' ? 'New Buyer' : 'Edit Buyer'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group"><label>First Name</label><input type="text" value={form.first_name} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" value={form.last_name} onChange={e => setForm(f => ({...f, last_name: e.target.value}))} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
                <div className="form-group"><label>Phone</label><input type="text" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
                <div className="form-group">
                  <label>Pre-Approval</label>
                  <select value={form.pre_approval_status} onChange={e => setForm(f => ({...f, pre_approval_status: e.target.value}))}>
                    <option value="none">None</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
                <div className="form-group"><label>Budget Min</label><input type="number" value={form.budget_min} onChange={e => setForm(f => ({...f, budget_min: e.target.value}))} /></div>
                <div className="form-group"><label>Budget Max</label><input type="number" value={form.budget_max} onChange={e => setForm(f => ({...f, budget_max: e.target.value}))} /></div>
                <div className="form-group full"><label>Preferences</label><textarea value={form.preferences} onChange={e => setForm(f => ({...f, preferences: e.target.value}))} /></div>
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{modal === 'create' ? 'Create' : 'Save'}</button>
                <button type="button" className="btn" style={{background:'#e5e7eb'}} onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
