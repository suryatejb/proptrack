import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings, getAgents, getNeighborhoods, createListing, updateListing, deleteListing } from '../api';

const EMPTY = { property_id: '', agent_id: '', list_price: '', status: 'active', list_date: '', expiration_date: '', description: '' };

function StatusBadge({ status }) {
  const map = { active: 'badge-active', under_contract: 'badge-contract', sold: 'badge-sold', withdrawn: 'badge-withdrawn' };
  return <span className={`badge ${map[status] || ''}`}>{status?.replace('_', ' ')}</span>;
}

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filters, setFilters] = useState({ status: '', agent_id: '', min_price: '', max_price: '' });
  const [modal, setModal] = useState(null); // null | 'create' | listing object
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString() ? '?' + params.toString() : '';
    getListings(qs).then(setListings).catch(() => {});
  };

  useEffect(() => { load(); }, [filters]);
  useEffect(() => { getAgents().then(setAgents); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit = (l) => {
    setForm({
      property_id: l.property_id,
      agent_id: l.agent_id,
      list_price: l.list_price,
      status: l.status,
      list_date: l.list_date?.slice(0, 10) || '',
      expiration_date: l.expiration_date?.slice(0, 10) || '',
      description: l.description || '',
    });
    setError('');
    setModal(l);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.property_id || !form.agent_id || !form.list_price || !form.list_date) {
      setError('Property ID, agent, list price, and list date are required.');
      return;
    }
    try {
      if (modal === 'create') {
        await createListing(form);
      } else {
        await updateListing(modal.listing_id, form);
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try { await deleteListing(id); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Listings</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Listing</button>
      </div>

      <div className="filter-bar">
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="under_contract">Under Contract</option>
          <option value="sold">Sold</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <select value={filters.agent_id} onChange={e => setFilters(f => ({ ...f, agent_id: e.target.value }))}>
          <option value="">All Agents</option>
          {agents.map(a => <option key={a.agent_id} value={a.agent_id}>{a.first_name} {a.last_name}</option>)}
        </select>
        <input type="number" placeholder="Min price" value={filters.min_price}
          onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))} style={{ width: 110 }} />
        <input type="number" placeholder="Max price" value={filters.max_price}
          onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))} style={{ width: 110 }} />
        <button className="btn" style={{ background: '#e5e7eb' }} onClick={() => setFilters({ status: '', agent_id: '', min_price: '', max_price: '' })}>
          Clear
        </button>
      </div>

      <div className="card mb-0">
        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Price</th>
              <th>Status</th>
              <th>Beds/Baths</th>
              <th>Agent</th>
              <th>Listed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(l => (
              <tr key={l.listing_id}>
                <td>
                  <Link className="text-link" to={`/listings/${l.listing_id}`}>
                    {l.address}
                  </Link>
                </td>
                <td>${Number(l.list_price).toLocaleString()}</td>
                <td><StatusBadge status={l.status} /></td>
                <td>{l.bedrooms}bd / {l.bathrooms}ba</td>
                <td>{l.agent_name}</td>
                <td>{l.list_date?.slice(0, 10)}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-sm" style={{ background: '#e0e7ff', color: '#3730a3' }} onClick={() => openEdit(l)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(l.listing_id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr><td colSpan="7" style={{ color: '#999', textAlign: 'center' }}>No listings found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal === 'create' ? 'New Listing' : 'Edit Listing'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Property ID</label>
                  <input type="number" value={form.property_id} onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Agent</label>
                  <select value={form.agent_id} onChange={e => setForm(f => ({ ...f, agent_id: e.target.value }))}>
                    <option value="">Select agent</option>
                    {agents.map(a => <option key={a.agent_id} value={a.agent_id}>{a.first_name} {a.last_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>List Price</label>
                  <input type="number" value={form.list_price} onChange={e => setForm(f => ({ ...f, list_price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="under_contract">Under Contract</option>
                    <option value="sold">Sold</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>List Date</label>
                  <input type="date" value={form.list_date} onChange={e => setForm(f => ({ ...f, list_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input type="date" value={form.expiration_date} onChange={e => setForm(f => ({ ...f, expiration_date: e.target.value }))} />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{modal === 'create' ? 'Create' : 'Save'}</button>
                <button type="button" className="btn" style={{ background: '#e5e7eb' }} onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
