import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './Home.css';

function Header() {
  return (
    <div className='header'>
      <p className='logoName'>AppCheck AI</p>
      <div className="navbar">
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/upload">Uploads</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
        </ul>    
      </div>
    </div>
  );
}

export default Header;