import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <aside className="sidebar">
      <div className="brand">PropTrack</div>
      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/listings">Listings</NavLink>
        <NavLink to="/properties">Properties</NavLink>
        <NavLink to="/agents">Agents</NavLink>
        <NavLink to="/buyers">Buyers</NavLink>
        <NavLink to="/showings">Showings</NavLink>
        <NavLink to="/contracts">Contracts</NavLink>
        <NavLink to="/inspections">Inspections</NavLink>
        <NavLink to="/reports">Reports</NavLink>
      </nav>
    </aside>
  );
}
