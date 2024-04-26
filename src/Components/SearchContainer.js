import React, { useState } from "react";
import '../Styles/Search.css';

function SearchContainer() {
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
    let url = "https://llm-app-balancer-327500741.us-east-2.elb.amazonaws.com/api/screenshots/?";
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
    console.log(data);
    return data;
  };

  return (    
      <div className="search-container">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-row">
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
            <button type="submit" className="search-button">Search</button>
          </div>
        </form>
        <h2>Search Results</h2>
        <div className="table-container">
            <table>
            <thead>
                <tr>
                {/* <th>Image</th> */}
                <th>Image Name</th>
                <th>Flag</th>
                <th>Output Text</th>
                <th>Signed URL</th>
                </tr>
            </thead>
            <tbody>
                {searchResults.map((result) => (
                <tr key={result.id}>
                    {/* <td>
                    <a href={result.signed_image_url} target="_blank" rel="noreferrer">
                        <img src={result.image_url} alt={`Screenshot ${result.id}`} />
                    </a>
                    </td> */}
                    <td>{result.image_name}</td>
                    <td>{result.analysis_result.flag ? "True" : "False"}</td>
                    <td>{result.analysis_result.output_text}</td>
                    <td>
                    <a href={result.signed_image_url} target="_blank" rel="noreferrer" className="shortened-url">
                        {shortenUrl(result.signed_image_url)}
                    </a>
                    </td>
                    {/* Add more details as needed */}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
  );
}

// Function to shorten the URL
const shortenUrl = (url) => {
  const maxLength = 30; // Maximum length of the shortened URL
  if (url.length <= maxLength) {
    return url;
  }
  const halfLength = Math.floor(maxLength / 2);
  const start = url.slice(0, halfLength);
  const end = url.slice(-halfLength);
  return `${start}...${end}`;
};

export default SearchContainer;
