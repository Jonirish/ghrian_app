import React from "react";
import { useNavigate } from "react-router-dom";

const ActionPage = () => {
  const navigate = useNavigate();

  const handleTakePhoto = () => {
    navigate("/upload"); // Redirect to the Upload page
  };

  const handleGoToHomepage = () => {
    navigate("/"); // Redirect to Homepage
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome!</h1>
      <p>What would you like to do?</p>
      <button
        onClick={handleTakePhoto}
        style={{
          margin: "10px",
          padding: "15px",
          fontSize: "18px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Take a Photo!
      </button>
      <br />
      <button
        onClick={handleGoToHomepage}
        style={{
          margin: "10px",
          padding: "15px",
          fontSize: "18px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Continue to Homepage
      </button>
    </div>
  );
};

export default ActionPage;
