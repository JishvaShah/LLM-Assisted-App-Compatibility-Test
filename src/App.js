import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home.js';
import Search from './Search.js';
import Uploads from './Uploads.js';
import Login from './Login.js';
import Register from './Register.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>        
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/upload" element={<Uploads />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
