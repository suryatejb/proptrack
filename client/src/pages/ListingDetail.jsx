import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getListing, deleteListing,
  getPriceHistory, createPriceHistory, deletePriceHistory,
  getOffersByListing, createOffer, acceptOffer, updateOffer, deleteOffer,
  getShowingsByListing, createShowing,
  getInspectionsByListing, createInspection,
  getBuyers, getAgents,
} from '../api';

function Badge({ value, map }) {
  return <span className={`badge ${map[value] || ''}`}>{value?.replace(/_/g, ' ')}</span>;
}

const statusMap = { active: 'badge-active', under_contract: 'badge-contract', sold: 'badge-sold', withdrawn: 'badge-withdrawn' };
const offerMap = { pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected', expired: 'badge-pending', withdrawn: 'badge-withdrawn' };
const inspMap = { pass: 'badge-pass', fail: 'badge-fail', conditional: 'badge-conditional' };

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [offers, setOffers] = useState([]);
  const [showings, setShowings] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [modal, setModal] = useState(null);

  const reload = () => {
    getListing(id).then(setListing).catch(() => navigate('/listings'));
    getPriceHistory(id).then(setPriceHistory).catch(() => {});
    getOffersByListing(id).then(setOffers).catch(() => {});
    getShowingsByListing(id).then(setShowings).catch(() => {});
    getInspectionsByListing(id).then(setInspections).catch(() => {});
  };

  useEffect(() => {
    reload();
    getBuyers().then(setBuyers).catch(() => {});
    getAgents().then(setAgents).catch(() => {});
  }, [id]);

  if (!listing) return <p>Loading...</p>;

  const handleDeleteListing = async () => {
    if (!confirm('Delete this listing and all related records?')) return;
    try { await deleteListing(id); navigate('/listings'); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>{listing.address}</h1>
        <div className="actions">
          <button className="btn btn-danger" onClick={handleDeleteListing}>Delete Listing</button>
          <button className="btn" style={{ background: '#e5e7eb' }} onClick={() => navigate('/listings')}>← Back</button>
        </div>
      </div>

      {/* Listing overview */}
      <div className="card">
        <div className="section-title">Listing Details</div>
        <div className="detail-grid">
          <div className="detail-item"><div className="dk">Status</div><div className="dv"><Badge value={listing.status} map={statusMap} /></div></div>
          <div className="detail-item"><div className="dk">List Price</div><div className="dv">${Number(listing.list_price).toLocaleString()}</div></div>
          <div className="detail-item"><div className="dk">Listed</div><div className="dv">{listing.list_date?.slice(0,10)}</div></div>
          <div className="detail-item"><div className="dk">Expires</div><div className="dv">{listing.expiration_date?.slice(0,10) || '—'}</div></div>
          <div className="detail-item"><div className="dk">Beds / Baths</div><div className="dv">{listing.bedrooms}bd / {listing.bathrooms}ba</div></div>
          <div className="detail-item"><div className="dk">Sq Ft</div><div className="dv">{listing.square_feet?.toLocaleString()}</div></div>
          <div className="detail-item"><div className="dk">Neighborhood</div><div className="dv">{listing.neighborhood_name || '—'}</div></div>
          <div className="detail-item"><div className="dk">Walk Score</div><div className="dv">{listing.walkability_score ?? '—'}</div></div>
          <div className="detail-item"><div className="dk">School Rating</div><div className="dv">{listing.school_rating ?? '—'}</div></div>
          <div className="detail-item"><div className="dk">Agent</div><div className="dv">{listing.agent_name} · {listing.agent_email}</div></div>
        </div>
        {listing.description && <p style={{ color: '#555', fontSize: 13 }}>{listing.description}</p>}
      </div>

      {/* Price History */}
      <Section
        title="Price History"
        onAdd={() => setModal('priceHistory')}
        addLabel="+ Log Price Change"
      >
        <table>
          <thead><tr><th>Date</th><th>Old Price</th><th>New Price</th><th>Reason</th><th></th></tr></thead>
          <tbody>
            {priceHistory.map(p => (
              <tr key={p.price_history_id}>
                <td>{p.change_date?.slice(0,10)}</td>
                <td>${Number(p.old_price).toLocaleString()}</td>
                <td>${Number(p.new_price).toLocaleString()}</td>
                <td>{p.change_reason || '—'}</td>
                <td><button className="btn btn-sm btn-danger" onClick={async () => { await deletePriceHistory(p.price_history_id); reload(); }}>Delete</button></td>
              </tr>
            ))}
            {priceHistory.length === 0 && <tr><td colSpan="5" style={{color:'#999',textAlign:'center'}}>No price changes</td></tr>}
          </tbody>
        </table>
      </Section>

      {/* Offers */}
      <Section title="Offers" onAdd={() => setModal('offer')} addLabel="+ Submit Offer">
        <table>
          <thead><tr><th>Buyer</th><th>Offer Price</th><th>Status</th><th>Submitted</th><th>Expires</th><th>Actions</th></tr></thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.offer_id}>
                <td>{o.buyer_name}</td>
                <td>${Number(o.offer_price).toLocaleString()}</td>
                <td><Badge value={o.status} map={offerMap} /></td>
                <td>{o.submitted_at?.slice(0,10)}</td>
                <td>{o.expiration_date?.slice(0,10) || '—'}</td>
                <td>
                  <div className="actions">
                    {o.status === 'pending' && (
                      <button className="btn btn-sm btn-success" onClick={() => setModal({ type: 'acceptOffer', offer: o })}>Accept</button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={async () => { await deleteOffer(o.offer_id); reload(); }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {offers.length === 0 && <tr><td colSpan="6" style={{color:'#999',textAlign:'center'}}>No offers yet</td></tr>}
          </tbody>
        </table>
      </Section>

      {/* Showings */}
      <Section title="Showings" onAdd={() => setModal('showing')} addLabel="+ Schedule Showing">
        <table>
          <thead><tr><th>Buyer</th><th>Date/Time</th><th>Status</th><th>Feedback</th></tr></thead>
          <tbody>
            {showings.map(s => (
              <tr key={s.appointment_id}>
                <td>{s.buyer_name || '—'}</td>
                <td>{s.scheduled_time?.replace('T', ' ').slice(0,16)}</td>
                <td>{s.status}</td>
                <td>{s.feedback_notes || '—'}</td>
              </tr>
            ))}
            {showings.length === 0 && <tr><td colSpan="4" style={{color:'#999',textAlign:'center'}}>No showings scheduled</td></tr>}
          </tbody>
        </table>
      </Section>

      {/* Inspections */}
      <Section title="Inspections" onAdd={() => setModal('inspection')} addLabel="+ Add Inspection">
        <table>
          <thead><tr><th>Inspector</th><th>Date</th><th>Result</th><th>Issues</th><th></th></tr></thead>
          <tbody>
            {inspections.map(i => (
              <tr key={i.inspection_id}>
                <td>{i.inspector_name}</td>
                <td>{i.inspection_date?.slice(0,10)}</td>
                <td><Badge value={i.result} map={inspMap} /></td>
                <td>{i.issues_found || '—'}</td>
                <td><button className="btn btn-sm btn-danger" onClick={async () => { await deleteInspection(i.inspection_id); reload(); }}>Delete</button></td>
              </tr>
            ))}
            {inspections.length === 0 && <tr><td colSpan="5" style={{color:'#999',textAlign:'center'}}>No inspections</td></tr>}
          </tbody>
        </table>
      </Section>

      {/* Modals */}
      {modal === 'priceHistory' && (
        <PriceHistoryModal listingId={id} onClose={() => { setModal(null); reload(); }} />
      )}
      {modal === 'offer' && (
        <OfferModal listingId={id} buyers={buyers} onClose={() => { setModal(null); reload(); }} />
      )}
      {modal?.type === 'acceptOffer' && (
        <AcceptOfferModal listingId={id} offer={modal.offer} onClose={() => { setModal(null); reload(); }} />
      )}
      {modal === 'showing' && (
        <ShowingModal listingId={id} buyers={buyers} agents={agents} onClose={() => { setModal(null); reload(); }} />
      )}
      {modal === 'inspection' && (
        <InspectionModal listingId={id} onClose={() => { setModal(null); reload(); }} />
      )}
    </div>
  );
}

function Section({ title, onAdd, addLabel, children }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>{title}</div>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>{addLabel}</button>
      </div>
      {children}
    </div>
  );
}

function PriceHistoryModal({ listingId, onClose }) {
  const [form, setForm] = useState({ old_price: '', new_price: '', change_date: '', change_reason: '' });
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!form.old_price || !form.new_price || !form.change_date) { setError('Old price, new price, and date are required.'); return; }
    try { await createPriceHistory({ ...form, listing_id: listingId }); onClose(); } catch (err) { setError(err.message); }
  };
  return (
    <Modal title="Log Price Change" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-group"><label>Old Price</label><input type="number" value={form.old_price} onChange={e => setForm(f => ({...f, old_price: e.target.value}))} /></div>
          <div className="form-group"><label>New Price</label><input type="number" value={form.new_price} onChange={e => setForm(f => ({...f, new_price: e.target.value}))} /></div>
          <div className="form-group"><label>Date</label><input type="date" value={form.change_date} onChange={e => setForm(f => ({...f, change_date: e.target.value}))} /></div>
          <div className="form-group"><label>Reason</label><input type="text" value={form.change_reason} onChange={e => setForm(f => ({...f, change_reason: e.target.value}))} /></div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" className="btn" style={{background:'#e5e7eb'}} onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function OfferModal({ listingId, buyers, onClose }) {
  const [form, setForm] = useState({ buyer_id: '', offer_price: '', contingencies: '', expiration_date: '' });
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!form.buyer_id || !form.offer_price) { setError('Buyer and offer price are required.'); return; }
    try { await createOffer({ ...form, listing_id: listingId }); onClose(); } catch (err) { setError(err.message); }
  };
  return (
    <Modal title="Submit Offer" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-group full">
            <label>Buyer</label>
            <select value={form.buyer_id} onChange={e => setForm(f => ({...f, buyer_id: e.target.value}))}>
              <option value="">Select buyer</option>
              {buyers.map(b => <option key={b.buyer_id} value={b.buyer_id}>{b.first_name} {b.last_name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Offer Price</label><input type="number" value={form.offer_price} onChange={e => setForm(f => ({...f, offer_price: e.target.value}))} /></div>
          <div className="form-group"><label>Expiration Date</label><input type="date" value={form.expiration_date} onChange={e => setForm(f => ({...f, expiration_date: e.target.value}))} /></div>
          <div className="form-group full"><label>Contingencies</label><textarea value={form.contingencies} onChange={e => setForm(f => ({...f, contingencies: e.target.value}))} /></div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Submit</button>
          <button type="button" className="btn" style={{background:'#e5e7eb'}} onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function AcceptOfferModal({ listingId, offer, onClose }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      await acceptOffer({
        listing_id: listingId,
        buyer_id: offer.buyer_id,
        offer_price: offer.offer_price,
        contingencies: offer.contingencies,
        expiration_date: offer.expiration_date,
      });
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  return (
    <Modal title="Accept Offer" onClose={onClose}>
      <p style={{marginBottom:12}}>
        Accept offer of <strong>${Number(offer.offer_price).toLocaleString()}</strong> from <strong>{offer.buyer_name}</strong>?
      </p>
      <p style={{color:'#666', fontSize:13, marginBottom:16}}>
        This will insert the accepted offer and update the listing status to "Under Contract" in a single transaction. If either step fails, both changes will be rolled back.
      </p>
      {error && <div className="error-msg">{error}</div>}
      <div className="form-actions">
        <button className="btn btn-success" onClick={confirm} disabled={loading}>{loading ? 'Processing...' : 'Confirm Accept'}</button>
        <button className="btn" style={{background:'#e5e7eb'}} onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

function ShowingModal({ listingId, buyers, agents, onClose }) {
  const [form, setForm] = useState({ buyer_id: '', agent_id: '', scheduled_time: '', feedback_notes: '' });
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!form.buyer_id || !form.agent_id || !form.scheduled_time) { setError('Buyer, agent, and time are required.'); return; }
    try { await createShowing({ ...form, listing_id: listingId }); onClose(); } catch (err) { setError(err.message); }
  };
  return (
    <Modal title="Schedule Showing" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Buyer</label>
            <select value={form.buyer_id} onChange={e => setForm(f => ({...f, buyer_id: e.target.value}))}>
              <option value="">Select buyer</option>
              {buyers.map(b => <option key={b.buyer_id} value={b.buyer_id}>{b.first_name} {b.last_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Agent</label>
            <select value={form.agent_id} onChange={e => setForm(f => ({...f, agent_id: e.target.value}))}>
              <option value="">Select agent</option>
              {agents.map(a => <option key={a.agent_id} value={a.agent_id}>{a.first_name} {a.last_name}</option>)}
            </select>
          </div>
          <div className="form-group full"><label>Date & Time</label><input type="datetime-local" value={form.scheduled_time} onChange={e => setForm(f => ({...f, scheduled_time: e.target.value}))} /></div>
          <div className="form-group full"><label>Feedback Notes</label><textarea value={form.feedback_notes} onChange={e => setForm(f => ({...f, feedback_notes: e.target.value}))} /></div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Schedule</button>
          <button type="button" className="btn" style={{background:'#e5e7eb'}} onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function InspectionModal({ listingId, onClose }) {
  const [form, setForm] = useState({ inspector_name: '', inspection_date: '', result: 'pass', issues_found: '' });
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!form.inspector_name || !form.inspection_date) { setError('Inspector name and date are required.'); return; }
    try { await createInspection({ ...form, listing_id: listingId }); onClose(); } catch (err) { setError(err.message); }
  };
  return (
    <Modal title="Add Inspection" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-group"><label>Inspector Name</label><input type="text" value={form.inspector_name} onChange={e => setForm(f => ({...f, inspector_name: e.target.value}))} /></div>
          <div className="form-group"><label>Date</label><input type="date" value={form.inspection_date} onChange={e => setForm(f => ({...f, inspection_date: e.target.value}))} /></div>
          <div className="form-group">
            <label>Result</label>
            <select value={form.result} onChange={e => setForm(f => ({...f, result: e.target.value}))}>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="conditional">Conditional</option>
            </select>
          </div>
          <div className="form-group full"><label>Issues Found</label><textarea value={form.issues_found} onChange={e => setForm(f => ({...f, issues_found: e.target.value}))} /></div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" className="btn" style={{background:'#e5e7eb'}} onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
