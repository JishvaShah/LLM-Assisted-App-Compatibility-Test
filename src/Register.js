import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.js';
import Footer from './Footer.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'; 
import './Register.css';

function Register() {
  const [employeeID, setEmployeeID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log("emp:"+employeeID+" pwd:"+password);
      const response = await fetch('http://llm-app-balancer-327500741.us-east-2.elb.amazonaws.com/signup/', {
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
        //check
        console.log('Registration Successful');
        toast.success('Registration Successful');
        navigate('/login');
      } else {
        //check
        console.error('Registration Failed');
        toast.error('Registration Failed');
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
          <p className='contentText'>Register</p>
          <div className='regForm'>
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
