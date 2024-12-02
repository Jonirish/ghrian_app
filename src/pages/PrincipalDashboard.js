import React, { useState, useEffect } from "react";
import axios from "axios";

const PrincipalDashboard = () => {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:8000/photos/photos-to-review", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched photos:", response.data);
        setPhotos(response.data.photos || []);
      } catch (err) {
        console.error("Error fetching photos:", err);
        setError("Failed to load photos. Please try again.");
      }
    };

    fetchPhotos();
  }, []);

  const handleReview = async (photoId, decision) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:8000/photos/review-photo`,
        null,
        {
          params: {
            photo_id: photoId,
            decision: decision.toUpperCase(), // Ensure the decision is properly formatted
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`Photo ${photoId} ${decision.toLowerCase()}: successfully reviewed.`);
      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== photoId));
    } catch (err) {
      console.error(`Error reviewing photo ${photoId}:`, err);
      alert(`Failed to ${decision.toLowerCase()} photo. Please try again.`);
    }
  };

  return (
    <div>
      <h1>Principal Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {photos.length === 0 && !error ? (
        <p>No photos awaiting review.</p>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={`http://localhost:8000/${photo.file_path}`} alt={photo.story} />
              <p>{photo.story}</p>
              <button onClick={() => handleReview(photo.id, "APPROVED")}>Approve</button>
              <button onClick={() => handleReview(photo.id, "REJECTED")}>Reject</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipalDashboard;
