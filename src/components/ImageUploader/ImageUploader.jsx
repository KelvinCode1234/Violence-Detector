import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FiUpload, FiArrowLeft, FiAlertTriangle, FiCheck, FiFlag } from 'react-icons/fi';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ImageUploaderAndAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [violenceLevel, setViolenceLevel] = useState(0);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const handleImageUpload = async () => {
    if (!image) {
      toast.warning("Please select an image first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const uploadResponse = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData,
        {
          params: {
            key: import.meta.env.VITE_IMGBB_API_KEY,
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedUrl = uploadResponse.data.data.url;
      setImageUrl(uploadedUrl);
      setStep(2);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setResult("");
    setViolenceLevel(0);

    try {
      const myHeaders = new Headers();
      myHeaders.append("apikey", import.meta.env.VITE_VIOLENCE_API_KEY);

      const requestOptions = {
        method: "GET",
        redirect: "follow",
        headers: myHeaders,
      };

      const response = await fetch(
        `https://api.apilayer.com/violence_detection/url?url=${encodeURIComponent(
          imageUrl
        )}`,
        requestOptions
      );
      const data = await response.json();
      console.log("API Response:", data);

      const level = data.value;
      const description = data.description;

      if (level == null || isNaN(level)) {
        setResult("Could not determine violence level. Please try again.");
        toast.warning("Analysis incomplete. Please try again.");
        return;
      }

      setViolenceLevel(level);
      let message = "";
      let colorClass = "text-dark";

      switch (level) {
        case 1:
          message = "Very unlikely contains violence (Safe)";
          colorClass = "text-success";
          break;
        case 2:
          message = "Unlikely contains violence (Still safe)";
          colorClass = "text-success";
          break;
        case 3:
          message = "Possible violence (Requires review)";
          colorClass = "text-warning";
          break;
        case 4:
          message = "Likely contains violence (Should be flagged)";
          colorClass = "text-danger";
          break;
        case 5:
          message = "Highly likely contains violence (Must be flagged)";
          colorClass = "text-danger";
          break;
        default:
          message = "Could not determine violence level.";
      }

      setResult(message);
      setAnalysisHistory(prev => [...prev, { url: imageUrl, level, message, timestamp: new Date() }]);
      toast.success("Analysis completed!");
    } catch (error) {
      console.error("Error analyzing image:", error);
      setResult("Error analyzing image. Please ensure the image URL is valid.");
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Violence Level'],
    datasets: [
      {
        label: 'Detection Confidence',
        data: [violenceLevel * 20], // Scale 1-5 to 20-100
        backgroundColor: violenceLevel <= 2 
          ? '#4CAF50' 
          : violenceLevel === 3 
            ? '#FFC107' 
            : '#F44336',
        borderColor: violenceLevel <= 2 
          ? '#388E3C' 
          : violenceLevel === 3 
            ? '#FFA000' 
            : '#D32F2F',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Confidence: ${context.raw}%`;
          }
        }
      }
    }
  };

  return (
    <div className="container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card shadow-lg border-0 overflow-hidden"
      >
        <div className="card-header bg-primary text-white py-3">
          <h1 className="text-center mb-0">
            <FiFlag className="me-2" />
            Violence Detection Scanner
          </h1>
        </div>
        
        <div className="card-body p-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="step-container"
              >
                <h4 className="text-center mb-4">
                  <FiUpload className="me-2" />
                  Step 1: Upload Your Image
                </h4>
                
                <div className="mb-4 text-center">
                  <p className="text-muted">
                    Upload an image to analyze for violent content. We support JPG, PNG, and GIF formats.
                  </p>
                </div>
                
                <div className="d-flex flex-column align-items-center">
                  <div className="mb-3 w-100">
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => setImage(e.target.files[0])}
                      id="imageUpload"
                    />
                  </div>
                  
                  <button
                    onClick={handleImageUpload}
                    className="btn btn-primary btn-lg w-100 py-2"
                    disabled={!image || loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <FiUpload className="me-2" />
                    )}
                    {loading ? "Uploading..." : "Upload & Analyze"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="step-container"
              >
                <button
                  className="btn btn-outline-secondary mb-3"
                  onClick={() => {
                    setStep(1);
                    setImage(null);
                    setImageUrl("");
                    setResult("");
                    setViolenceLevel(0);
                  }}
                >
                  <FiArrowLeft className="me-1" />
                  Upload New Image
                </button>

                <h4 className="text-center mb-4">
                  <FiAlertTriangle className="me-2" />
                  Step 2: Analysis Results
                </h4>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <h5 className="card-title">Uploaded Image</h5>
                        {imageUrl && (
                          <div className="ratio ratio-1x1 bg-light mb-3">
                            <img
                              src={imageUrl}
                              alt="Uploaded content"
                              className="img-fluid object-fit-contain"
                              style={{ maxHeight: '300px' }}
                            />
                          </div>
                        )}
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-truncate d-block mb-2"
                        >
                          View full image
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title text-center">Analysis</h5>
                        
                        <button
                          onClick={analyzeImage}
                          className="btn btn-success w-100 mb-3"
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          ) : (
                            <FiCheck className="me-2" />
                          )}
                          {loading ? "Analyzing..." : "Analyze Image"}
                        </button>
                        
                        {result && (
                          <>
                            <div className={`alert ${
                              violenceLevel <= 2 
                                ? 'alert-success' 
                                : violenceLevel === 3 
                                  ? 'alert-warning' 
                                  : 'alert-danger'
                            }`}>
                              <div className="d-flex align-items-center">
                                {violenceLevel <= 2 ? (
                                  <FiCheck size={24} className="me-2" />
                                ) : (
                                  <FiAlertTriangle size={24} className="me-2" />
                                )}
                                <strong>{result}</strong>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h6 className="text-center mb-3">Detection Confidence</h6>
                              <Bar data={chartData} options={chartOptions} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {analysisHistory.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-center mb-3">Analysis History</h5>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Image</th>
                            <th>Result</th>
                            <th>Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisHistory.slice().reverse().map((item, index) => (
                            <tr key={index}>
                              <td>{item.timestamp.toLocaleTimeString()}</td>
                              <td>
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                  View
                                </a>
                              </td>
                              <td>{item.message}</td>
                              <td>
                                <span className={`badge ${
                                  item.level <= 2 
                                    ? 'bg-success' 
                                    : item.level === 3 
                                      ? 'bg-warning' 
                                      : 'bg-danger'
                                }`}>
                                  {item.level}/5
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="card-footer bg-light py-3 text-center text-muted">
          <small>
            Violence Detection Scanner &copy; {new Date().getFullYear()} - Powered by AI
          </small>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageUploaderAndAnalyzer;