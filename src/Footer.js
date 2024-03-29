import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './Home.css';

function Footer() {
  return (
    <div className="footer">
      <p>
        <FontAwesomeIcon icon={faLinkedin} /> Contact Us : 
        <a href="http://www.linkedin.com/in/yian-chen-20618098" target="_blank" rel="noopener noreferrer">
          Yian Chen
        </a> |
        <a href="http://www.linkedin.com/in/jishvashah3000" target="_blank" rel="noopener noreferrer">
          Jishva Shah
        </a> |
        <a href="http://www.linkedin.com/in/mihir-kapile" target="_blank" rel="noopener noreferrer">
          Mihir Kapile
        </a>
      </p>
    </div>
  );
}

export default Footer;
