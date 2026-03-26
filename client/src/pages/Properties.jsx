import { useEffect, useState } from 'react';
import { getProperties, getNeighborhoods, createProperty, updateProperty, deleteProperty } from '../api';

const EMPTY = { address: '', city: '', state: '', zip_code: '', square_feet: '', bedrooms: '', bathrooms: '', year_built: '', property_type: 'single_family', neighborhood_id: '' };

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filters, setFilters] = useState({ property_type: '', neighborhood_id: '' });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString() ? '?' + params.toString() : '';
    getProperties(qs).then(setProperties).catch(() => {});
  };

  useEffect(() => { load(); }, [filters]);
  useEffect(() => { getNeighborhoods().then(setNeighborhoods); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit = (p) => {
    setForm({
      address: p.address, city: p.city, state: p.state, zip_code: p.zip_code,
      square_feet: p.square_feet || '', bedrooms: p.bedrooms || '', bathrooms: p.bathrooms || '',
      year_built: p.year_built || '', property_type: p.property_type,
      neighborhood_id: p.neighborhood_id || '',
    });
    setError('');
    setModal(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.state || !form.zip_code || !form.property_type) {
      setError('Address, city, state, zip code, and type are required.');
      return;
    }
    try {
      if (modal === 'create') await createProperty(form);
      else await updateProperty(modal.property_id, form);
      setModal(null); load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    try { await deleteProperty(id); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Properties</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Property</button>
      </div>

      <div className="filter-bar">
        <select value={filters.property_type} onChange={e => setFilters(f => ({...f, property_type: e.target.value}))}>
          <option value="">All Types</option>
          <option value="single_family">Single Family</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
          <option value="multi_family">Multi Family</option>
        </select>
        <select value={filters.neighborhood_id} onChange={e => setFilters(f => ({...f, neighborhood_id: e.target.value}))}>
          <option value="">All Neighborhoods</option>
          {neighborhoods.map(n => <option key={n.neighborhood_id} value={n.neighborhood_id}>{n.name}</option>)}
        </select>
        <button className="btn" style={{background:'#e5e7eb'}} onClick={() => setFilters({property_type:'',neighborhood_id:''})}>Clear</button>
      </div>

      <div className="card mb-0">
        <table>
          <thead>
            <tr><th>Address</th><th>Type</th><th>Beds/Baths</th><th>Sq Ft</th><th>Year</th><th>Neighborhood</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.property_id}>
                <td>{p.address}, {p.city}</td>
                <td>{p.property_type?.replace('_', ' ')}</td>
                <td>{p.bedrooms}bd / {p.bathrooms}ba</td>
                <td>{p.square_feet?.toLocaleString()}</td>
                <td>{p.year_built}</td>
                <td>{p.neighborhood_name || '—'}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-sm" style={{background:'#e0e7ff',color:'#3730a3'}} onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.property_id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {properties.length === 0 && <tr><td colSpan="7" style={{color:'#999',textAlign:'center'}}>No properties found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal === 'create' ? 'New Property' : 'Edit Property'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full"><label>Address</label><input type="text" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
                <div className="form-group"><label>City</label><input type="text" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} /></div>
                <div className="form-group"><label>State</label><input type="text" maxLength={2} value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} /></div>
                <div className="form-group"><label>Zip Code</label><input type="text" value={form.zip_code} onChange={e => setForm(f => ({...f, zip_code: e.target.value}))} /></div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.property_type} onChange={e => setForm(f => ({...f, property_type: e.target.value}))}>
                    <option value="single_family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi_family">Multi Family</option>
                  </select>
                </div>
                <div className="form-group"><label>Bedrooms</label><input type="number" value={form.bedrooms} onChange={e => setForm(f => ({...f, bedrooms: e.target.value}))} /></div>
                <div className="form-group"><label>Bathrooms</label><input type="number" step="0.5" value={form.bathrooms} onChange={e => setForm(f => ({...f, bathrooms: e.target.value}))} /></div>
                <div className="form-group"><label>Square Feet</label><input type="number" value={form.square_feet} onChange={e => setForm(f => ({...f, square_feet: e.target.value}))} /></div>
                <div className="form-group"><label>Year Built</label><input type="number" value={form.year_built} onChange={e => setForm(f => ({...f, year_built: e.target.value}))} /></div>
                <div className="form-group">
                  <label>Neighborhood</label>
                  <select value={form.neighborhood_id} onChange={e => setForm(f => ({...f, neighborhood_id: e.target.value}))}>
                    <option value="">None</option>
                    {neighborhoods.map(n => <option key={n.neighborhood_id} value={n.neighborhood_id}>{n.name}</option>)}
                  </select>
                </div>
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
