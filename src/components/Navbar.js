import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <h2>Christ Soldiers</h2>
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <div className={isMenuOpen ? 'hamburger open' : 'hamburger'}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          {!user ? (
            // Menu for logged out users
            <>
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={`nav-link ${isActive('/')}`}
                  onClick={closeMenu}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/about" 
                  className={`nav-link ${isActive('/about')}`}
                  onClick={closeMenu}
                >
                  About Us
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/events" 
                  className={`nav-link ${isActive('/events')}`}
                  onClick={closeMenu}
                >
                  Events
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/gallery" 
                  className={`nav-link ${isActive('/gallery')}`}
                  onClick={closeMenu}
                >
                  Gallery
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/presentation" 
                  className={`nav-link ${isActive('/presentation')}`}
                  onClick={closeMenu}
                >
                  Leaderboard
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/contact" 
                  className={`nav-link ${isActive('/contact')}`}
                  onClick={closeMenu}
                >
                  Contact Us
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/admin/login" 
                  className={`nav-link admin-link ${isActive('/admin/login')}`}
                  onClick={closeMenu}
                >
                  Admin Portal
                </Link>
              </li>
            </>
          ) : (
            // Menu for logged in users
            <>
              <li className="nav-item">
                <Link 
                  to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'judge' ? '/judge/dashboard' : '/section/dashboard'} 
                  className="nav-link"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <span className="nav-link user-info">
                  👤 {user.username} ({user.role})
                </span>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
