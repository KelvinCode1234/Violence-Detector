import React, { useState } from "react";
import axios from "axios";

const ImageUploaderAndAnalyzer = () => {
  const [image, setImage] = useState(null); 
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [step, setStep] = useState(1);

  const handleImageUpload = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      // Upload to ImgBB
      const uploadResponse = await axios.post("https://api.imgbb.com/1/upload", formData, {
        params: {
          key: import.meta.env.VITE_IMGBB_API_KEY, 
        },
      });

      const uploadedUrl = uploadResponse.data.data.url;
      setImageUrl(uploadedUrl);
      setStep(2);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };


    const [resultColor, setResultColor] = useState("text-dark");
    const analyzeImage = async () => {
      if (!imageUrl) return;

      setLoading(true);
      setResult("");
      setResultColor("text-dark");

      try {
        const myHeaders = new Headers();
        myHeaders.append("apikey", "IaOcipp9nxVqUTsc3ekagBib2jsew6HF"); 

        const requestOptions = {
          method: "GET",
          redirect: "follow",
          headers: myHeaders,
        };

        const response = await fetch(
          `https://api.apilayer.com/violence_detection/url?url=${encodeURIComponent(imageUrl)}`,
          requestOptions
        );
        const data = await response.json();
        console.log("API Response:", data); 

        const violenceLevel = data.value;
        const description = data.description;

        if (violenceLevel == null || isNaN(violenceLevel)) {
          setResult("⚠️ Could not determine violence level. Please try again.");
          return;
        }

        let message = "";
        let colorClass = "text-dark"; 

        switch (violenceLevel) {
          case 1:
            message = "✅ Very unlikely contains violence (Safe)";
            colorClass = "text-success";
            break;
          case 2:
            message = "🟢 Unlikely contains violence (Still safe)";
            colorClass = "text-success";
            break;
          case 3:
            message = "⚠️ Possible violence (Requires review)";
            colorClass = "text-warning";
            break;
          case 4:
            message = "❌ Likely contains violence (Should be flagged)";
            colorClass = "text-danger";
            break;
          case 5:
            message = "🚨 Highly likely contains violence (Must be flagged)";
            colorClass = "text-danger";
            break;
          default:
            message = "⚠️ Could not determine violence level.";
        }

        setResult(message);
        setResultColor(colorClass);
      } catch (error) {
        console.error("Error analyzing image:", error);
        setResult("❌ Error analyzing image. Please ensure the image URL is valid.");
        setResultColor("text-danger");
      } finally {
        setLoading(false);
      }
    };
  
  
    return (
        <div className="container mt-5">
        <div className="card shadow-lg p-4">
        <h1 className="text-center mb-4">Image Violence Detection</h1>

        {step === 1 && (
        <div className="step-container">
            <h4 className="text-center mb-3">Step 1: Upload Your Image</h4>
            <input
            type="file"
            accept="image/*"
            className="form-control mb-3"
            onChange={(e) => setImage(e.target.files[0])}
            />
            <button
            onClick={handleImageUpload}
            className="btn btn-primary w-100"
            disabled={!image || loading}
            >
            {loading ? "Uploading..." : "Upload & Generate URL"}
            </button>
        </div>
        )}

        {step === 2 && (
        <div className="step-container">
            <div className="d-flex justify-content-start mb-3">
            <button
                className="btn btn-outline-secondary go-back-btn"
                onClick={() => {
                setStep(1);
                setImage(null);
                setImageUrl("");
                setResult("");
                }}
            >
                <strong>&larr;</strong> Go Back
            </button>
            </div>

            <h4 className="text-center mb-3">Step 2: Analyze the Image</h4>
            <p className="text-center text-muted">
            Your Image URL:{" "}
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                {imageUrl}
            </a>
            </p>
            <button
            onClick={analyzeImage}
            className="btn btn-success w-100"
            disabled={loading}
            >
            {loading ? "Analyzing..." : "Analyze Image"}
            </button>
            {result && (
              <p className={`mt-3 text-center fw-bold ${resultColor}`}>
              {result}
            </p>
          )}
        </div>
        )}
      </div>
      </div>

    );
};

export default ImageUploaderAndAnalyzer;

