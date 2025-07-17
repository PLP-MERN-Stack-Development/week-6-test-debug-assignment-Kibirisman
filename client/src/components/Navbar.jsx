import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="navbar-brand">
          🐛 Bug Tracker
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/bugs" className={`nav-link ${isActive('/bugs')}`}>
              All Bugs
            </Link>
          </li>
          <li>
            <Link to="/bugs/new" className={`nav-link ${isActive('/bugs/new')}`}>
              Report Bug
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;