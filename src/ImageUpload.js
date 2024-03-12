import React, { useState } from 'react';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    setShowModal(true);
  };

  const handleConfirmUpload = () => {
    // Close the modal
    setShowModal(false);

    const formData = new FormData();
    formData.append('image', selectedFile);

    // Replace 'your-backend-url' with your actual backend URL
    fetch('your-backend-url', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      // Handle response
      console.log("Image uploaded successfully");
    })
    .catch(error => {
      // Handle error
      console.error('Error uploading image:', error);
    });
  };

  return (
    <div className="container">
      <h2 className="mt-4 mb-4">Mobile Bug Solver</h2>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button onClick={handleSubmit} className="btn btn-primary mr-2">
        Submit
      </button>

      {showModal && (
        <div className="modal d-block" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selected Image</h5>
                <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {selectedFile && (
                  <img src={URL.createObjectURL(selectedFile)} alt="Selected Image" className="img-fluid" style={{ width: '100%', height: '100%' }} />
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
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
