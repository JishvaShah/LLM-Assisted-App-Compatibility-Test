import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header.js';
import Footer from './Footer.js';
import '../Styles/Login.css';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer


function Login() {
  const [employeeID, setEmployeeID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log("emp:"+employeeID+" pwd:"+password);
      const response = await fetch('https://llm-app-balancer-327500741.us-east-2.elb.amazonaws.com/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_id: employeeID,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        navigate('/upload');
        toast.success('Login Successful');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Login Failed');
      }

      setEmployeeID('');
      setPassword('');

    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='main'>
      <Header />
      <div className='content'>
          <p className='contentText'>Login</p>
          <div className='loginForm'>
            <form onSubmit={handleSubmit}>
              <label htmlFor="employeeID">Employee ID:</label>
              <input
                type="text"
                id="employeeID"
                name="employeeID"
                value={employeeID}
                onChange={(event) => setEmployeeID(event.target.value)}
                pattern="[a-zA-Z0-9]+"
                title="Please enter only letters and numbers"
                required
              />
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <input type="submit" value="Login" />
            </form>
          </div>
          <p className='contentText'>New user? <Link className="registerLink" to="/register">Register here</Link></p>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default Login;
