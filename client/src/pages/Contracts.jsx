import { useEffect, useState } from 'react';
import { getContracts, updateContract, deleteContract } from '../api';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);

  const load = () => getContracts().then(setContracts).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    const c = contracts.find(x => x.contract_id === id);
    try {
      await updateContract(id, { closing_date: c.closing_date, final_price: c.final_price, earnest_money: c.earnest_money, status });
      load();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contract?')) return;
    try { await deleteContract(id); load(); } catch (err) { alert(err.message); }
  };

  const badge = (s) => {
    const map = { active: 'badge-active', closed: 'badge-sold', cancelled: 'badge-withdrawn' };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  return (
    <div>
      <div className="page-header"><h1>Contracts</h1></div>
      <div className="card mb-0">
        <table>
          <thead>
            <tr><th>Property</th><th>Buyer</th><th>Agent</th><th>Final Price</th><th>Earnest</th><th>Contract Date</th><th>Closing Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {contracts.map(c => (
              <tr key={c.contract_id}>
                <td>{c.address}</td>
                <td>{c.buyer_name}</td>
                <td>{c.agent_name}</td>
                <td>${Number(c.final_price).toLocaleString()}</td>
                <td>${Number(c.earnest_money || 0).toLocaleString()}</td>
                <td>{c.contract_date?.slice(0,10)}</td>
                <td>{c.closing_date?.slice(0,10) || '—'}</td>
                <td>
                  <select value={c.status} onChange={e => handleStatusChange(c.contract_id, e.target.value)}
                    style={{fontSize:12,padding:'2px 6px',border:'1px solid #d1d5db',borderRadius:4}}>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.contract_id)}>Delete</button></td>
              </tr>
            ))}
            {contracts.length === 0 && <tr><td colSpan="9" style={{color:'#999',textAlign:'center'}}>No contracts found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
