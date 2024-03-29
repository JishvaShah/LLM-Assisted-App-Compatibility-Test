import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header.js';
import Footer from './Footer.js';
import './Home.css';

function Home() {
  return (
    <div className='main'>
      <Header />
      <div className="content">
        <p>Welcome to AppCheck AI: Your AI-powered solution for seamless <br />Android app compatibility testing through intelligent image analysis.</p>
        {/* Use Link component instead of div */}
        <Link to="/upload" className="cta">Upload an Image <i className="fas fa-cloud-upload-alt"></i></Link>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
