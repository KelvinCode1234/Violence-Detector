import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImageUploader from './components/ImageUploader/ImageUploader';

const App = () => {
  return (
    <div className="min-vh-100 bg-gradient">
      <div className="container py-5">
        <ImageUploader />
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default App;
