import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from './Header.js';
import Footer from './Footer.js';
import '../Styles/Home.css';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer


function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to toggle access token
  // const toggleAccessToken = () => {
  //   setIsLoggedIn((prevIsLoggedIn) => !prevIsLoggedIn);
  // };

  // Load isLoggedIn state from local storage on component mount
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedIsLoggedIn) {
      setIsLoggedIn(JSON.parse(storedIsLoggedIn));
    }
  }, []);

  // Update local storage when isLoggedIn state changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  const handleIsNotLoggedIn = () => {
    toast.error('You need to be logged in to upload images.');
  };

  return (
    <div className='main'>
      <Header />
      <div className="content">
        <p>Welcome to AppCheck AI: Your AI-powered solution for seamless <br />Android app compatibility testing through intelligent image analysis.</p>
        {/* Conditional rendering based on session status */}
        {isLoggedIn ? (
          <Link to="/upload" className="cta">Upload an Image <i className="fas fa-cloud-upload-alt"></i></Link>
        ) : (
          <Link to="/login" className="cta" onClick={handleIsNotLoggedIn}>Upload an Image <i className="fas fa-cloud-upload-alt"></i></Link>
        )}
        {/* <button onClick={toggleAccessToken}>Toggle Access Token</button> */}
      </div>
      <Footer />
    </div>
  );
}

export default Home;