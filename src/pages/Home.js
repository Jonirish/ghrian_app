import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/App.css'; // Assuming you have styles for the photo feed

const Home = ({ userRole }) => {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userRole === "PARENT" || userRole === "STAFF" || userRole === "PRINCIPAL") {
      const fetchPhotos = async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get("http://localhost:8000/photos/view-photos", {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log("Fetched photos for homepage:", response.data);
          setPhotos(response.data);
        } catch (err) {
          console.error("Error fetching photos for homepage:", err);
          setError("Failed to load photos. Please try again.");
        }
      };

      fetchPhotos();
    }
  }, [userRole]);

  return (
    <div>
      <h1>Home</h1>
      {userRole === "PARENT" || userRole === "STAFF" || userRole === "PRINCIPAL" ? (
        <div>
          <h2>Approved Photos</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {photos.length === 0 && !error ? (
            <p>No approved photos available.</p>
          ) : (
            <div className="photo-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="photo-card">
                  <img src={`http://localhost:8000/${photo.file_path}`} alt={photo.story} />
                  <p>{photo.story}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p>Welcome to your homepage!</p>
      )}
    </div>
  );
};

export default Home;