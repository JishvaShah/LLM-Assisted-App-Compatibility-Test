import React, { useState } from 'react';
import Header from './Header.js';
import Footer from './Footer.js';
import { Link } from 'react-router-dom'; 
import './Register.css';

function Register() {

  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Submitted:', { userID, password });
  };

  return (
    <div className='main'>
      <Header />
      <div className='content'>
          <p className='contentText'>Register</p>
          <div className='regForm'>
            <form onSubmit={handleSubmit}>
              <label htmlFor="userID">UserID:</label>
              <input
                type="text"
                id="userID"
                name="userID"
                value={userID}
                onChange={(event) => setUserID(event.target.value)}
              />
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <input type="submit" value="Register" />
            </form>
          </div>
          <p className='contentText'>Existing user? <Link className="loginLink" to="/login">Login here</Link></p>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
