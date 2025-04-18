// frontend/src/components/Auth/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../services/authService"; 

const Profile = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userData = await getUserDetails();
      setUsername(userData.username);
      setUserId(userData.id);
      setEmail(userData.email);
    };

    fetchUserDetails();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold">
              <span className="text-blue-600">Blog</span>
              <span className="text-gray-800">Sphere</span>
              <span className="text-yellow-500 ml-1">✎ᝰ</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xl text-gray-600">
              Welcome, {username || "User"}
            </span>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xl text-blue-600 hover:text-blue-800"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/#")}
              className="text-xl text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-4 mt-5">
        <div className="bg-white p-4 rounded-lg shadow-md w-2/4 mx-auto">
          <p className="text-lg font-semibold text-gray-700">
            <span role="img" aria-label="user">
              👤
            </span>{" "}
            Username: {username}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md w-2/4 mx-auto">
          <p className="text-lg font-semibold text-gray-700">
            <span role="img" aria-label="email">
              📧
            </span>{" "}
            Email: {email}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md w-2/4 mx-auto">
          <p className="text-lg font-semibold text-gray-700">
            <span role="img" aria-label="user-id">
              🆔
            </span>{" "}
            User ID: {userId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
