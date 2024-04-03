import React, { useState, useRef } from 'react';

function ImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [output, setOutput] = useState('');
  const [flag, setFlag] = useState('');

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

//  const handleConfirmUpload = async () => {
//    try {
//      // Prepare form data
//      const formData = new FormData();
//      selectedFiles.forEach(file => {
//        formData.append('images', file, file.name);
//      });
//
//      // Make API call
//      const response = await fetch('http://localhost:8000/api/process-image/', {
//        method: 'POST',
//        body: formData
//      });
//
//      // Introduce a delay (e.g., 10 seconds) before handling the response
//      await new Promise(resolve => setTimeout(resolve, 10000));
//      const data = await response.json();
//
//      // Handle the response after the delay
//      console.log(data); // Log the response data to console
//
//      // Check if response contains output_text
//      if (data.hasOwnProperty('output_text')) {
//        setOutput(data.output_text);
//      }
//
//      setShowModal(false);
//      setSelectedFiles([]);
//      alert("Images uploaded successfully");
//      fileInputRef.current.value = null;
//    } catch (error) {
//      console.error('Error:', error);
//      alert("An error occurred while uploading images");
//    }
//  };

const handleConfirmUpload = async () => {
  try {
    // Prepare form data
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file, file.name);
    });

    // Make API call
    const response = await fetch('http://localhost:8000/api/process-image/', {
      method: 'POST',
      body: formData
    });

    // Introduce a delay (e.g., 10 seconds) before handling the response
    await new Promise(resolve => setTimeout(resolve, 10000));
    const dataArray = await response.json();

    // Check if the dataArray contains at least one element
    if (dataArray.length > 0) {
      const data = dataArray[0]; // Access the 0th element
      // Check if the data object contains output_text and flag
      if (data.hasOwnProperty('output_text') && data.hasOwnProperty('flag')) {
        const outputText = data.output_text;
        const flag = data.flag;
        console.log("Output Text:", outputText);
        console.log("Flag:", flag);
        setOutput(outputText);
        setFlag(flag);
      }
    }

    setShowModal(false);
    setSelectedFiles([]);
    alert("Images uploaded successfully");
    fileInputRef.current.value = null;
  } catch (error) {
    console.error('Error:', error);
    alert("An error occurred while uploading images");
  }
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
              <div className="modal-body">
                {selectedFiles.map((file, index) => (
                  <img key={index} src={URL.createObjectURL(file)} alt={`Selected Image ${index}`} className="img-fluid" style={{ width: '100%', height: '100%' }} />
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

      <div className="mt-4" style={outputContainerStyle}>
              <h2>Output</h2>
              <div className="output-content" style={outputContentStyle}>
                <p>{output}</p>
                <p>{flag}</p>
              </div>
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
