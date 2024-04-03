import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.js';
import Footer from './Footer.js';
import { Link } from 'react-router-dom'; 
import './Register.css';

function Register() {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {

      const response = await fetch('http://localhost:8000/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_id: userID,
          password: password
        })
      });
      
      if (response.ok) {
        //check
        console.log('Registration Successful');
        navigate('/login');
      } else {
        //check
        console.error('Registration Failed');
      }

      setUserID('');
      setPassword('');

    } catch (error) {
      console.error('Error:', error);
    }
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
