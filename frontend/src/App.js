import { useState } from "react";
import "./App.css";
import axios from "axios";
function App() {
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [results, setResults] = useState([]);

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    // Fetch results from backend API
    try {
      if (startDate && endDate) {
        const response = await axios.post(
          "http://127.0.0.1:5000/results",
          {
            start_date: startDate,
            end_date: endDate,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response);
        setResults(response.data.results);
      }
      else{
        
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = () => {
    // Create a FormData object to send the file to the backend
    const formData = new FormData();
    formData.append("file", file);

    // Use Axios to make the HTTP request for file upload
    axios
      .post("http://127.0.0.1:5000/upload", formData)
      .then((response) => {
        // Handle the response from the backend
        console.log("File uploaded successfully:", response.data); 
        // Reset the file input
        setFile(null);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  };
  return (
    <>
      {/* Upload  */}
      <div className="container">
        <h1>File Upload</h1>
        <div className="upload-container">
          <input type="file" onChange={handleFileChange} accept=".csv" />
          <button
            onClick={handleUpload}
            disabled={!file}
            className="upload-button"
          >
            Upload
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="container">
        <h2>Filter Images</h2>
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <label htmlFor="start-date" className="filter-label">
            Start Date:
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="filter-input"
          />
          <label htmlFor="end-date" className="filter-label">
            End Date:
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="filter-input"
          />
          <button type="submit" className="filter-button">
            Filter
          </button>
        </form>
      </div>

      {/* Results table */}
      <div className="container">
        <h2>Results</h2>
        <table id="results-table" className="results-table">
          <thead>
            <tr>
              <th>Image Name</th>
              <th>Detections</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.image_name}>
                <td>{result.image_name}</td>
                <td>{result.objects_detected}</td>
                <td>
                  <img
                    src={`/images/${result.image_name}`}
                    alt={result.image_name}
                    className="result-image"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
