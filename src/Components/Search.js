import React from "react";
import Header from "./Header.js";
import Footer from "./Footer.js";
import SearchContainer from "./SearchContainer.js";
import { ToastContainer } from 'react-toastify'; // Import ToastContainer


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
