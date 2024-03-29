import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home.js';
import Profile from './Profile.js';
import Uploads from './Uploads.js';
import Login from './Login.js';
import Register from './Register.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>        
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<Uploads />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
