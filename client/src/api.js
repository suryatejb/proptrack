const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// neighborhoods
export const getNeighborhoods = () => req('/neighborhoods');
export const createNeighborhood = (data) => req('/neighborhoods', { method: 'POST', body: JSON.stringify(data) });
export const updateNeighborhood = (id, data) => req(`/neighborhoods/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteNeighborhood = (id) => req(`/neighborhoods/${id}`, { method: 'DELETE' });

// agents
export const getAgents = () => req('/agents');
export const getAgent = (id) => req(`/agents/${id}`);
export const createAgent = (data) => req('/agents', { method: 'POST', body: JSON.stringify(data) });
export const updateAgent = (id, data) => req(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAgent = (id) => req(`/agents/${id}`, { method: 'DELETE' });

// buyers
export const getBuyers = (params = '') => req(`/buyers${params}`);
export const getBuyer = (id) => req(`/buyers/${id}`);
export const createBuyer = (data) => req('/buyers', { method: 'POST', body: JSON.stringify(data) });
export const updateBuyer = (id, data) => req(`/buyers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBuyer = (id) => req(`/buyers/${id}`, { method: 'DELETE' });

// properties
export const getProperties = (params = '') => req(`/properties${params}`);
export const getProperty = (id) => req(`/properties/${id}`);
export const createProperty = (data) => req('/properties', { method: 'POST', body: JSON.stringify(data) });
export const updateProperty = (id, data) => req(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProperty = (id) => req(`/properties/${id}`, { method: 'DELETE' });

// listings
export const getListings = (params = '') => req(`/listings${params}`);
export const getListing = (id) => req(`/listings/${id}`);
export const createListing = (data) => req('/listings', { method: 'POST', body: JSON.stringify(data) });
export const updateListing = (id, data) => req(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteListing = (id) => req(`/listings/${id}`, { method: 'DELETE' });

// price history
export const getPriceHistory = (listingId) => req(`/price-history/listing/${listingId}`);
export const createPriceHistory = (data) => req('/price-history', { method: 'POST', body: JSON.stringify(data) });
export const deletePriceHistory = (id) => req(`/price-history/${id}`, { method: 'DELETE' });

// showings
export const getShowings = (params = '') => req(`/showings${params}`);
export const getShowingsByListing = (listingId) => req(`/showings/listing/${listingId}`);
export const createShowing = (data) => req('/showings', { method: 'POST', body: JSON.stringify(data) });
export const updateShowing = (id, data) => req(`/showings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteShowing = (id) => req(`/showings/${id}`, { method: 'DELETE' });

// offers
export const getOffersByListing = (listingId) => req(`/offers/listing/${listingId}`);
export const createOffer = (data) => req('/offers', { method: 'POST', body: JSON.stringify(data) });
export const acceptOffer = (data) => req('/offers/accept', { method: 'POST', body: JSON.stringify(data) });
export const updateOffer = (id, data) => req(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteOffer = (id) => req(`/offers/${id}`, { method: 'DELETE' });

// contracts
export const getContracts = () => req('/contracts');
export const createContract = (data) => req('/contracts', { method: 'POST', body: JSON.stringify(data) });
export const updateContract = (id, data) => req(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteContract = (id) => req(`/contracts/${id}`, { method: 'DELETE' });

// inspections
export const getInspectionsByListing = (listingId) => req(`/inspections/listing/${listingId}`);
export const getInspections = (params = '') => req(`/inspections${params}`);
export const createInspection = (data) => req('/inspections', { method: 'POST', body: JSON.stringify(data) });
export const updateInspection = (id, data) => req(`/inspections/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInspection = (id) => req(`/inspections/${id}`, { method: 'DELETE' });

// reports (backed by DB views)
export const getActiveListingsReport = () => req('/reports/active-listings');
export const getAgentPerformanceReport = () => req('/reports/agent-performance');
