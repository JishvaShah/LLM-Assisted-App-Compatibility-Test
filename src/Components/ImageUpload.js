import React, { useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [output, setOutput] = useState('');
  const [flag, setFlag] = useState(false);
  const [outputData, setOutputData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [concatenatedOutput, setConcatenatedOutput] = useState('');

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      setSelectedFiles(validFiles);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

const handleConfirmUpload = async () => {
    try {
        setLoading(true);
        // Set loading to true while waiting for response
        // Prepare form data
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('images', file, file.name);
            });
            // Make API call
            const response = await fetch('https://llm-app-balancer-327500741.us-east-2.elb.amazonaws.com/api/process-image/',
            {       method: 'POST',       body: formData     });
            // Check if the response status is 200
            if (response.status === 200) {
                const responseData = await response.json();
                // Combine db_images and new_images into one array
                const combinedData = [...responseData.db_images, ...responseData.new_images];
                // Check if combinedData is not empty
                if (combinedData.length > 0) {
                let concatenatedOutputText = '';
                // Initialize concatenated output text
                const updatedOutputData = [];
                // Initialize an empty array for updated output data
                combinedData.forEach((data, index) => {
                if (data.hasOwnProperty('output_text') && data.hasOwnProperty('flag')) {
                    const outputText = data.output_text;
                    const flag = data.flag;
                    concatenatedOutputText += outputText + ' ';
                    // Concatenate output texts
                    // Update outputData state
                    updateOutputData(outputText, flag, selectedFiles[index], updatedOutputData);
                    }
                    });
                    setConcatenatedOutput(concatenatedOutputText); // Set concatenated output text
                    setOutputData(updatedOutputData); // Set the updated output data
                    }
                    setShowModal(false);
                    setSelectedFiles([]);
                    if (combinedData.length > 0) {
                        toast.success("Images uploaded and processed successfully!");
                    } else {
                        toast.info("Images uploaded but no data to display.");
                    }
                fileInputRef.current.value = null;
                } else {
                    // Handle non-200 status code
                    console.error('Error:', response.statusText);
                    toast.error("An error occurred while uploading images");
                }
                }
                catch (error) {
                console.error('Error:', error);
                toast.error("An error occurred while processing images");
                } finally {
                setLoading(false); // Set loading back to false when request is completed
                }
                };


  const updateOutputData = (outputText, flag, image, updatedOutputData) => {
    const existingEntry = updatedOutputData.find(entry => entry.images.includes(image));
//    if (existingEntry) {
//      // If an entry already exists for this image, update its output and flag
//      existingEntry.output = outputText;
//      existingEntry.flag = flag;
//    } else {
//      // Otherwise, create a new entry for this image
//
//    }
    updatedOutputData.push({
            images: [image],
            output: outputText,
            flag: flag
          });
  };
    return (
    <div className="container">
      <div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} multiple className="mb-2" />
        {selectedFiles.length > 0 && (
          <>
            <button className="btn btn-danger ml-2" onClick={() => setSelectedFiles([])}>Clear Selection</button>
            <button className="btn btn-primary ml-2" onClick={handleSubmit}>Submit</button>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal d-block" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selected Images</h5>
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {selectedFiles.map((file, index) => (
                  <img key={index} src={URL.createObjectURL(file)} alt={`Selected Image ${index}`} className="img-fluid" style={{ width: '100%', height: 'auto' }} />
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmUpload}>Confirm Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}

      <div className="mt-4" style={outputContainerStyle}>
        <h2>Output</h2>
        <div className="output-content" style={outputContentStyle}>
          <p>{concatenatedOutput}</p>
        </div>
      </div>

      <div className="mt-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Uploaded Image</th>
              <th>Output</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {outputData.flatMap((data, index) =>
              data.images.map((image, imageIndex) => (
                <tr key={`${index}-${imageIndex}`}>
                  <td>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded Image ${index + 1}-${imageIndex + 1}`}
                      className="img-fluid"
                      style={{ width: '100px', height: 'auto', marginRight: '10px', marginBottom: '10px' }}
                    />
                  </td>
                  <td>{data.output}</td>
                  <td>{data.flag.toString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inline CSS styles
const outputContainerStyle = {
  border: '1px solid #ccc',
  borderRadius: '5px',
  padding: '10px',
  marginTop: '20px'
};

const outputContentStyle = {
  margin: '10px 0'
};

export default ImageUpload;
