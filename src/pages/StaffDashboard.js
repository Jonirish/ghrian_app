import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StaffDashboard = () => {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:8000/photos/my-photos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setPhotos(response.data))
      .catch((err) => setError('Failed to load photos.'));
  }, []);

  return (
    <div>
      <h1>Staff Dashboard</h1>
      {error && <p>{error}</p>}
      <div className="photo-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-card">
            <img src={`http://localhost:8000/${photo.file_path}`} alt={photo.story} />
            <p>{photo.story}</p>
            <p>Status: {photo.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDashboard;
