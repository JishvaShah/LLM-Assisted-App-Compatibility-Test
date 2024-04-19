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
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file, file.name);
      });

      const response = await fetch('http://localhost:8000/api/process-image/', {
        method: 'POST',
        body: formData
      });

      if (response.status === 200) {
        const responseData = await response.json();
        
        if (responseData.message) {
          setOutput(responseData.message);
        }else {
          const { db_images, new_images } = responseData;
          const updatedOutputData = [];

          const imageNames = selectedFiles.map(file => file.name);
         
          db_images.forEach(data => {
            const { output_text, flag, image_name } = data;
            const fileIndex = imageNames.indexOf(image_name);
            if (fileIndex !== -1) {
              updateOutputData(output_text, flag, selectedFiles[fileIndex], updatedOutputData);
            }
          });
          new_images.forEach(data => {
            const { output_text, flag, image_name } = data;
            const fileIndex = imageNames.indexOf(image_name);
            if (fileIndex !== -1) {
              updateOutputData(output_text, flag, selectedFiles[fileIndex], updatedOutputData);
            }
          });
          setOutputData(updatedOutputData);
        }
      
      } else {
        console.error('Error:', response.statusText);
        toast.error('An error occurred while uploading images');
      }

      setShowModal(false);
      setSelectedFiles([]);
      toast.success('Images uploaded successfully');
      fileInputRef.current.value = null;
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while uploading images');
    } finally {
      setLoading(false); 
    }
  };

  const updateOutputData = (outputText, flag, image, updatedOutputData) => {
    const existingEntry = updatedOutputData.find(entry => entry.images.includes(image));
    if (existingEntry) {
      existingEntry.output = outputText;
      existingEntry.flag = flag;
    } else {
      updatedOutputData.push({
        images: [image],
        output: outputText,
        flag: flag
      });
    }
  };
    return (
    <div className="container">
      <div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} multiple className="mb-2" />
        {selectedFiles.length > 0 && (
          <>
            <button className="btn btn-danger ml-2" onClick={() => setSelectedFiles([])}>Clear Selection</button>
            <button style={{ backgroundColor: 'white', borderRadius:'5px', border:"2px solid white"}} className="custom-submit-button" onClick={handleSubmit}>Submit</button>
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
