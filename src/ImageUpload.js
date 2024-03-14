import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDelete = () => {
    setSelectedFile(null); // Clear the selected file
  };

  const handleConfirmUpload = () => {
    setShowModal(false);
    setUploads([selectedFile, ...uploads]); // Add uploaded file to beginning of uploads array
    setSelectedFile(null); // Clear the selected file
    toast.success("Image uploaded successfully");
    // Reset the file input
    fileInputRef.current.value = null;
  };

  return (
    <div className="container">
      <h2 className="mt-4 mb-4">Mobile Bug Solver</h2>
      <div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
        {selectedFile && (
          <>
            <button className="btn btn-danger ml-2" onClick={handleDelete}>Delete</button>
            <button className="btn btn-primary ml-2" onClick={handleSubmit}>Submit</button>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal d-block" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selected Image</h5>
              </div>
              <div className="modal-body">
                {selectedFile && (
                  <img src={URL.createObjectURL(selectedFile)} alt="Selected Image" className="img-fluid" style={{ width: '100%', height: '100%' }} />
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmUpload}>Confirm Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="mt-4">
          <h3>Uploaded Images</h3>
          {uploads.reverse().map((file, index) => (
            <div key={index} className="mb-2">
              <img src={URL.createObjectURL(file)} alt={`Uploaded Image ${index}`} className="img-thumbnail mr-2" style={{ width: '100px', height: '100px' }} />
              <button className="btn btn-danger" onClick={() => setUploads(uploads.filter((_, i) => i !== index))}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
