import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.js';
import Footer from './Footer.js';
import { Link } from 'react-router-dom'; 
import './Login.css';

function Login() {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/login/', {
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
        const data = await response.json();
        //check
        console.log('Login Successful');
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        navigate('/');
      } else {
        //check
        console.error('Login Failed');
      }

      setUserID('');
      setPassword('');

    } catch (error) {
      //check
      console.error('Error:', error);
    }
  };

  return (
    <div className='main'>
      <Header />
      <div className='content'>
          <p className='contentText'>Login</p>
          <div className='loginForm'>
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
              <input type="submit" value="Login" />
            </form>
          </div>
          <p className='contentText'>New user? <Link className="registerLink" to="/register">Register here</Link></p>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
