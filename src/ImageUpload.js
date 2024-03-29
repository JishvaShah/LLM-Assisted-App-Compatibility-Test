import React, { useState, useRef } from 'react';

function ImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [output, setOutput] = useState('');

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

  const handleConfirmUpload = () => {
      // Prepare form data
      const formData = new FormData();
      formData.append('images', file, file.name);

      // Make API call
      fetch('http://localhost:8000/api/process-image/', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Handle the response
        setOutput(JSON.stringify(data, null, 2));
        setShowModal(false);
        setSelectedFiles([]);
        alert("Images uploaded successfully");
        fileInputRef.current.value = null;
      })
      .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while uploading images");
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

    </div>
  );
}



export default ImageUpload;
