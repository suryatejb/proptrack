import { useEffect, useState } from 'react';
import { getInspections, deleteInspection } from '../api';

export default function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    const qs = filter ? `?result=${filter}` : '';
    getInspections(qs).then(setInspections).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this inspection?')) return;
    try { await deleteInspection(id); load(); } catch (err) { alert(err.message); }
  };

  const badge = (r) => {
    const map = { pass: 'badge-pass', fail: 'badge-fail', conditional: 'badge-conditional' };
    return <span className={`badge ${map[r] || ''}`}>{r}</span>;
  };

  return (
    <div>
      <div className="page-header"><h1>Inspections</h1></div>

      <div className="filter-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Results</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="conditional">Conditional</option>
        </select>
        <button className="btn" style={{background:'#e5e7eb'}} onClick={() => setFilter('')}>Clear</button>
      </div>

      <div className="card mb-0">
        <table>
          <thead>
            <tr><th>Property</th><th>Inspector</th><th>Date</th><th>Result</th><th>Issues Found</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {inspections.map(i => (
              <tr key={i.inspection_id}>
                <td>{i.address}</td>
                <td>{i.inspector_name}</td>
                <td>{i.inspection_date?.slice(0,10)}</td>
                <td>{badge(i.result)}</td>
                <td style={{maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.issues_found || '—'}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(i.inspection_id)}>Delete</button></td>
              </tr>
            ))}
            {inspections.length === 0 && <tr><td colSpan="6" style={{color:'#999',textAlign:'center'}}>No inspections found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
