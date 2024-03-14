import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ImageUpload.css'; // Import CSS file

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [uploads, setUploads] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      toast.error("Please upload an image file only");
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    setShowSubmitModal(true);
  };

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedFile(null);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  const handleDelete = () => {
    setSelectedFile(null); // Clear the selected file
  };

  const handleView = (file) => {
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleConfirmUpload = () => {
    setUploads([selectedFile, ...uploads]); // Add uploaded file to beginning of uploads array
    setSelectedFile(null); // Clear the selected file
    setShowSubmitModal(false);
    toast.success("Image uploaded successfully");
    // Reset the file input
    fileInputRef.current.value = null;
  };

  return (
    <div className="container">
      <h2 className="title">Mobile Bug Solver</h2>
      <div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
        {selectedFile && (
          <>
            <button className="btn btn-primary ml-2" onClick={handleSubmit}>Submit</button>
            <button className="btn btn-danger ml-2" onClick={handleDelete}>Delete</button>
          </>
        )}
      </div>

      {showSubmitModal && (
        <div className="modal" role="dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Selected Image</h5>
            </div>
            <div className="modal-body">
              {selectedFile && (
                <img src={URL.createObjectURL(selectedFile)} alt="Selected Image" className="image-preview" />
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary close-btn" onClick={handleCloseSubmitModal}>Close</button>
              <button type="button" className="btn btn-primary confirm-btn" onClick={handleConfirmUpload}>Confirm Upload</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && (
        <div className="modal" role="dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Uploaded Image</h5>
            </div>
            <div className="modal-body">
              {selectedFile && (
                <img src={URL.createObjectURL(selectedFile)} alt="Selected Image" className="image-preview" />
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary close-btn" onClick={handleCloseViewModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="uploaded-images">
          <h3>Uploaded Images</h3>
          {uploads.reverse().map((file, index) => (
            <div key={index} className="uploaded-image">
              <img src={URL.createObjectURL(file)} alt={`Uploaded Image ${index}`} className="img-thumbnail" />
              <button className="btn btn-primary ml-2" onClick={() => handleView(file)}>View</button>
              <button className="btn btn-danger" onClick={() => setUploads(uploads.filter((_, i) => i !== index))}>Delete</button>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;