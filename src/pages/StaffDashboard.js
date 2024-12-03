import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StaffDashboard = () => {
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [approvedPhotos, setApprovedPhotos] = useState([]); // New state for approved photos
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      const token = localStorage.getItem("token");

      try {
        // Fetch pending photos
        const pendingResponse = await axios.get(
          "http://localhost:8000/photos/staff/pending-photos",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPendingPhotos(pendingResponse.data);

        // Fetch approved photos
        const approvedResponse = await axios.get(
          "http://localhost:8000/photos/staff/approved-photos", // New endpoint
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApprovedPhotos(approvedResponse.data);

        console.log("Fetched photos:", {
          pending: pendingResponse.data,
          approved: approvedResponse.data,
        });
      } catch (err) {
        console.error("Error fetching photos for staff:", err);
        setError("Failed to load photos. Please try again.");
      }
    };

    fetchPhotos();
  }, []);

  return (
    <div>
      <h1>Staff Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Pending Photos Section */}
      <h2>Pending Photos</h2>
      {pendingPhotos.length === 0 && !error ? (
        <p>No pending photos found.</p>
      ) : (
        <div className="photo-grid">
          {pendingPhotos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={`http://localhost:8000/${photo.file_path}`} alt={photo.story} />
              <p>{photo.story}</p>
              <p>Uploaded: {new Date(photo.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Approved Photos Section */}
      <h2>Approved Photos</h2>
      {approvedPhotos.length === 0 && !error ? (
        <p>No approved photos found.</p>
      ) : (
        <div className="photo-grid">
          {approvedPhotos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={`http://localhost:8000/${photo.file_path}`} alt={photo.story} />
              <p>{photo.story}</p>
              <p>Approved on: {new Date(photo.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;