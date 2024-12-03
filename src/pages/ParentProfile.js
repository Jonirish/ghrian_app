import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../api/users";

const ParentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchUserProfile(token)
      .then((response) => setProfile(response.data))
      .catch((err) => setError("Failed to load profile."));
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h1>Parent Profile</h1>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
};

export default ParentProfile;
