import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home.js';
import Search from './Components/Search.js';
import Uploads from './Components/Uploads.js';
import Login from './Components/Login.js';
import Register from './Components/Register.js';
import Logout from './Components/Logout.js';
import './Styles/App.css';

function App() {
  return (
    <div className="App">
      <Routes>        
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/upload" element={<Uploads />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
  );
}

export default App;
