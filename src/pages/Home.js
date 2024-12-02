import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/App.css'; // Assuming you have styles for the photo feed

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve JWT token from localStorage
        const response = await axios.get('http://localhost:8000/photos/view-photos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPhotos(response.data); // Set fetched photos
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Failed to load photos. Please try again.');
      }
    };

    fetchPhotos();
  }, []); // Run the effect only once

  return (
    <div className="photo-feed">
      <h2>Photo Feed</h2>
      {error && <p className="error">{error}</p>} {/* Display error message */}
      {photos.length > 0 ? (
        photos.map((photo) => (
          <div className="photo-card" key={photo.id}>
            <img src={`http://localhost:8000/${photo.file_path}`} alt={photo.story} />
            <p>{photo.story}</p>
          </div>
        ))
      ) : (
        <p>Loading photos...</p>
      )}
    </div>
  );
};

export default Home;
