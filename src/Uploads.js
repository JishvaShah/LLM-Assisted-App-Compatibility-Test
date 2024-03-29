import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import Header from './Header';
import Footer from './Footer';

function Uploads() {
  const [output, setOutput] = useState('');

  return (
    <div className='main'>
    <Header/>
      <h1>Uploads</h1>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1 }}>
          <ImageUpload setOutput={setOutput} />
        </div>
        {output && (
          <div style={{ flex: 1, marginLeft: '20px' }}>
            <h2>Output</h2>
            <textarea
              value={output}
              disabled
              style={{ width: '100%', minHeight: '200px' }}
            />
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}

export default Uploads;
