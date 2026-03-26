import { useEffect, useState } from 'react';
import { getAgents, createAgent, updateAgent, deleteAgent } from '../api';

const EMPTY = { license_number: '', first_name: '', last_name: '', email: '', phone: '', brokerage: '', hire_date: '' };

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => getAgents().then(setAgents).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit = (a) => {
    setForm({ ...a, hire_date: a.hire_date?.slice(0,10) || '' });
    setError(''); setModal(a);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.license_number || !form.first_name || !form.last_name || !form.email || !form.brokerage) {
      setError('License number, name, email, and brokerage are required.'); return;
    }
    try {
      if (modal === 'create') await createAgent(form);
      else await updateAgent(modal.agent_id, form);
      setModal(null); load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this agent?')) return;
    try { await deleteAgent(id); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Agents</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Agent</button>
      </div>

      <div className="card mb-0">
        <table>
          <thead>
            <tr><th>Name</th><th>License</th><th>Email</th><th>Phone</th><th>Brokerage</th><th>Hire Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.agent_id}>
                <td>{a.first_name} {a.last_name}</td>
                <td>{a.license_number}</td>
                <td>{a.email}</td>
                <td>{a.phone || '—'}</td>
                <td>{a.brokerage}</td>
                <td>{a.hire_date?.slice(0,10) || '—'}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-sm" style={{background:'#e0e7ff',color:'#3730a3'}} onClick={() => openEdit(a)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.agent_id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {agents.length === 0 && <tr><td colSpan="7" style={{color:'#999',textAlign:'center'}}>No agents found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal === 'create' ? 'New Agent' : 'Edit Agent'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group"><label>First Name</label><input type="text" value={form.first_name} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" value={form.last_name} onChange={e => setForm(f => ({...f, last_name: e.target.value}))} /></div>
                <div className="form-group"><label>License Number</label><input type="text" value={form.license_number} onChange={e => setForm(f => ({...f, license_number: e.target.value}))} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
                <div className="form-group"><label>Phone</label><input type="text" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
                <div className="form-group"><label>Brokerage</label><input type="text" value={form.brokerage} onChange={e => setForm(f => ({...f, brokerage: e.target.value}))} /></div>
                <div className="form-group"><label>Hire Date</label><input type="date" value={form.hire_date} onChange={e => setForm(f => ({...f, hire_date: e.target.value}))} /></div>
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
