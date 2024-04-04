import React, { useState } from 'react';
import Header from './Header.js';
import Footer from './Footer.js';

function Search() {
const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flag, setFlag] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const screenshots = await queryScreenshots({ startDate, endDate, flag, imageUrl });
    setSearchResults(screenshots);
  };

  const queryScreenshots = async ({ startDate = '', endDate = '', flag = null, imageUrl = '' }) => {
    let url = 'api/screenshots/?';
    if (startDate) url += `start_date=${startDate}&`;
    if (endDate) url += `end_date=${endDate}&`;
    if (flag !== null) url += `flag=${flag}&`;
    if (imageUrl) url += `image_url=${encodeURIComponent(imageUrl)}&`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };
  return (
    <div className='main'>
      <Header />
      <h1>Search</h1>
      <form onSubmit={handleSubmit}>
              <div>
                <label>Start Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label>End Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <label>Flag:</label>
                <select value={flag} onChange={(e) => setFlag(parseInt(e.target.value))}>
                  <option value="">All</option>
                  <option value="1">1</option>
                  <option value="0">0</option>
                </select>
              </div>
              <div>
                <label>Image URL:</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              <button type="submit">Search</button>
            </form>

            <h2>Search Results</h2>
            <ul>
              {searchResults.map((result, index) => (
                <li key={index}>
                  <img src={result.imageUrl} alt={`Screenshot ${index}`} />
                  <p>Flag: {result.flag ? 'True' : 'False'}</p>
                  <p>Date: {result.date}</p>
                  {/* Add more details as needed */}
                </li>
              ))}
            </ul>
      <Footer />
    </div>
  );
}

export default Search;
