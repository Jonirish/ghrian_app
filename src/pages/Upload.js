import React, { useState } from "react";
import axios from "axios";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [story, setStory] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleStoryChange = (e) => {
    setStory(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("story", story);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You are not authorized to perform this action.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/photos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(`Photo uploaded successfully! Photo ID: ${response.data.photo_id}`);
      setFile(null);
      setStory("");
    } catch (error) {
      console.error("Error uploading photo:", error);
      setMessage("Failed to upload the photo. Please try again.");
    }
  };

  return (
    <div>
      <h1>Upload Photo</h1>
      <form onSubmit={handleUpload}>
        <div>
          <label htmlFor="file">Choose a photo:</label>
          <input type="file" id="file" accept="image/*" capture="environment" // "environment" for rear camera, "user" for front camera
onChange={handleFileChange} />
        </div>
        <div>
          <label htmlFor="story">Add a story (optional):</label>
          <textarea
            id="story"
            value={story}
            onChange={handleStoryChange}
            placeholder="Write a short description..."
          ></textarea>
        </div>
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Upload;
