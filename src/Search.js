import React, { useState } from "react";
import Header from "./Header.js";
import Footer from "./Footer.js";

function Search() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flag, setFlag] = useState(null);
  const [imageName, setImageName] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const screenshots = await queryScreenshots({
      startDate,
      endDate,
      flag,
      imageName,
    });
    setSearchResults(screenshots);
  };

  const queryScreenshots = async ({
    startDate = "",
    endDate = "",
    flag = null,
    imageName = "",
  }) => {
    let url = "http://localhost:8000/api/screenshots/?";
    if (startDate) url += `start_date=${startDate}&`;
    if (endDate) url += `end_date=${endDate}&`;
    if (flag !== null) url += `flag=${flag}&`;
    if (imageName) url += `image_name=${encodeURIComponent(imageName)}&`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data;
  };

  return (
    <div className="main">
      <Header />
      <h1>Search</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label>Flag:</label>
          <select
            value={flag}
            onChange={(e) => setFlag(e.target.value === "true")}
          >
            <option value="">All</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
        <div>
          <label>Image Name:</label>
          <input
            type="text"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
          />
        </div>
        <button type="submit">Search</button>
      </form>

      <h2>Search Results</h2>
      <ul>
        {searchResults.map((result) => (
          <li key={result.id}>
            <a href={result.signed_image_url} target="_blank" rel="noreferrer">
              <img src={result.image_url} alt={`Screenshot ${result.id}`} />
            </a>
            <p>Image Name: {result.image_name}</p>
            <p>Flag: {result.analysis_result.flag ? "True" : "False"}</p>
            <p>Output Text: {result.analysis_result.output_text}</p>
            <p>Signed URL: <a href={result.signed_image_url} target="_blank" rel="noreferrer">{result.signed_image_url}</a></p>
            {/* Add more details as needed */}
          </li>
        ))}
      </ul>
      <Footer />
    </div>
  );
}

export default Search;