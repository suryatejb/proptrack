import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings, getAgents, getBuyers, getProperties } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([getListings(), getAgents(), getBuyers(), getProperties()])
      .then(([listings, agents, buyers, properties]) => {
        setStats({
          total: listings.length,
          active: listings.filter(l => l.status === 'active').length,
          under_contract: listings.filter(l => l.status === 'under_contract').length,
          sold: listings.filter(l => l.status === 'sold').length,
          agents: agents.length,
          buyers: buyers.length,
          properties: properties.length,
          recent: listings.slice(0, 5),
        });
      })
      .catch(() => {});
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Active Listings</div>
          <div className="value">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="label">Under Contract</div>
          <div className="value">{stats.under_contract}</div>
        </div>
        <div className="stat-card">
          <div className="label">Sold</div>
          <div className="value">{stats.sold}</div>
        </div>
        <div className="stat-card">
          <div className="label">Agents</div>
          <div className="value">{stats.agents}</div>
        </div>
        <div className="stat-card">
          <div className="label">Buyers</div>
          <div className="value">{stats.buyers}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Recent Listings</div>
        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Price</th>
              <th>Status</th>
              <th>Agent</th>
              <th>Listed</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map(l => (
              <tr key={l.listing_id}>
                <td>
                  <Link className="text-link" to={`/listings/${l.listing_id}`}>
                    {l.address}
                  </Link>
                </td>
                <td>${Number(l.list_price).toLocaleString()}</td>
                <td><StatusBadge status={l.status} /></td>
                <td>{l.agent_name}</td>
                <td>{l.list_date?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: 'badge-active',
    under_contract: 'badge-contract',
    sold: 'badge-sold',
    withdrawn: 'badge-withdrawn',
  };
  return <span className={`badge ${map[status] || ''}`}>{status?.replace('_', ' ')}</span>;
}
