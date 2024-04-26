import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../Styles/Home.css';

function Header() {

  const isLoggedIn = () => {
    return localStorage.getItem('isLoggedIn') === 'true';
  };
  const handleIsNotLoggedIn = () => {
    toast.error('You need to log in first to perfom this action.');
  };

  return (
    <div className='header'>
      <p className='logoName'>AppCheck AI</p>
      <div className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/search">Search</Link></li>
          <li><Link to="/upload">Upload</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </div>
    </div>
  );
}

export default Header;