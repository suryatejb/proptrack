import { useEffect, useState } from 'react';
import { getActiveListingsReport, getAgentPerformanceReport } from '../api';

export default function Reports() {
  const [listings, setListings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [tab, setTab] = useState('listings');

  useEffect(() => {
    getActiveListingsReport().then(setListings).catch(() => {});
    getAgentPerformanceReport().then(setAgents).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          className={`btn ${tab === 'listings' ? 'btn-primary' : ''}`}
          style={tab !== 'listings' ? { background: '#e5e7eb', color: '#222' } : {}}
          onClick={() => setTab('listings')}
        >
          Active Listings Search
        </button>
        <button
          className={`btn ${tab === 'agents' ? 'btn-primary' : ''}`}
          style={tab !== 'agents' ? { background: '#e5e7eb', color: '#222' } : {}}
          onClick={() => setTab('agents')}
        >
          Agent Performance
        </button>
      </div>

      {tab === 'listings' && (
        <div className="card">
          <div className="section-title">Active Listings with Neighborhood Data</div>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
            Backed by the <code>active_listings_with_neighborhood</code> view — joins listing, property, neighborhood, and agent.
          </p>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Neighborhood</th>
                <th>Price</th>
                <th>Beds/Baths</th>
                <th>Walk Score</th>
                <th>School Rating</th>
                <th>Flood Zone</th>
                <th>Agent</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.listing_id}>
                  <td>{l.address}, {l.city}</td>
                  <td>{l.neighborhood_name}</td>
                  <td>${Number(l.list_price).toLocaleString()}</td>
                  <td>{l.bedrooms}bd / {l.bathrooms}ba</td>
                  <td>{l.walkability_score}</td>
                  <td>{l.school_rating}</td>
                  <td>{l.flood_zone}</td>
                  <td>{l.agent_name}</td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr><td colSpan="8" style={{ color: '#999', textAlign: 'center' }}>No active listings</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'agents' && (
        <div className="card">
          <div className="section-title">Agent Days-on-Market Performance</div>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
            Backed by the <code>agent_days_on_market</code> view — aggregates closed contracts per agent.
          </p>
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Brokerage</th>
                <th>Closed Deals</th>
                <th>Avg Days on Market</th>
                <th>Min Days</th>
                <th>Max Days</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.agent_id}>
                  <td>{a.agent_name}</td>
                  <td>{a.brokerage}</td>
                  <td>{a.total_closed}</td>
                  <td>{a.avg_days_on_market}</td>
                  <td>{a.min_days}</td>
                  <td>{a.max_days}</td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr><td colSpan="6" style={{ color: '#999', textAlign: 'center' }}>No closed contracts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
