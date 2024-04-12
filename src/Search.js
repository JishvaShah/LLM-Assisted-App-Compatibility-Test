import React, { useState } from "react";
import Header from "./Header.js";
import Footer from "./Footer.js";
import SearchContainer from "./SearchContainer.js";
// import './Search.css';

function Search() {

  return (
    <div className="main">
      <Header />
      <SearchContainer/>
      <Footer />
    </div>
  );
}

export default Search;
