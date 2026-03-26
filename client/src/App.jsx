import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Properties from './pages/Properties';
import Agents from './pages/Agents';
import Buyers from './pages/Buyers';
import Showings from './pages/Showings';
import Contracts from './pages/Contracts';
import Inspections from './pages/Inspections';
import Reports from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Navbar />
        <main className="main">
          <Routes>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/listings"          element={<Listings />} />
            <Route path="/listings/:id"      element={<ListingDetail />} />
            <Route path="/properties"        element={<Properties />} />
            <Route path="/agents"            element={<Agents />} />
            <Route path="/buyers"            element={<Buyers />} />
            <Route path="/showings"          element={<Showings />} />
            <Route path="/contracts"         element={<Contracts />} />
            <Route path="/inspections"       element={<Inspections />} />
            <Route path="/reports"           element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
