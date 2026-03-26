import { useEffect, useState } from 'react';
import { getShowings, updateShowing, deleteShowing, getAgents } from '../api';

export default function Showings() {
  const [showings, setShowings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filters, setFilters] = useState({ agent_id: '', date: '' });

  const load = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString() ? '?' + params.toString() : '';
    getShowings(qs).then(setShowings).catch(() => {});
  };

  useEffect(() => { load(); }, [filters]);
  useEffect(() => { getAgents().then(setAgents); }, []);

  const handleStatusChange = async (id, status) => {
    const showing = showings.find(s => s.appointment_id === id);
    try { await updateShowing(id, { scheduled_time: showing.scheduled_time, status, feedback_notes: showing.feedback_notes }); load(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this showing?')) return;
    try { await deleteShowing(id); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header"><h1>Showings</h1></div>

      <div className="filter-bar">
        <select value={filters.agent_id} onChange={e => setFilters(f => ({...f, agent_id: e.target.value}))}>
          <option value="">All Agents</option>
          {agents.map(a => <option key={a.agent_id} value={a.agent_id}>{a.first_name} {a.last_name}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={e => setFilters(f => ({...f, date: e.target.value}))} />
        <button className="btn" style={{background:'#e5e7eb'}} onClick={() => setFilters({agent_id:'',date:''})}>Clear</button>
      </div>

      <div className="card mb-0">
        <table>
          <thead>
            <tr><th>Property</th><th>Buyer</th><th>Agent</th><th>Scheduled</th><th>Status</th><th>Feedback</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {showings.map(s => (
              <tr key={s.appointment_id}>
                <td>{s.address || '—'}</td>
                <td>{s.buyer_name || '—'}</td>
                <td>{s.agent_name || '—'}</td>
                <td>{s.scheduled_time?.replace('T',' ').slice(0,16)}</td>
                <td>
                  <select value={s.status} onChange={e => handleStatusChange(s.appointment_id, e.target.value)}
                    style={{fontSize:12,padding:'2px 6px',border:'1px solid #d1d5db',borderRadius:4}}>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={{maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.feedback_notes || '—'}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.appointment_id)}>Delete</button></td>
              </tr>
            ))}
            {showings.length === 0 && <tr><td colSpan="7" style={{color:'#999',textAlign:'center'}}>No showings found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
