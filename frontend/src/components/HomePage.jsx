// src/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; 

const HomePage = () => {
  
  const navigate = useNavigate(); 

  
  const navigateToLogin = () => {
    navigate('/login'); 
  };

  const navigateToRegister = () => {
    navigate('/register'); 
  };

  const navigateToViewAllBlogs = () => {
    navigate('/allblog'); 
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-600">Welcome to BlogSphere ✎ᝰ.</h1>
       <p className="text-lg text-gray-700 mt-2"> Express Your Thoughts and Ideas</p>
      </header>

      <div className="flex justify-center items-center mt-12 animate-bounce">
        <span className="text-6xl">✈️</span>
        {/* <img src='rizon.jpeg' alt="Blog Icon" className="w-24 h-24 ml-4" /> */}
        </div>
      
     
      <div className="mt-6 space-x-4">
        <button
          onClick={navigateToLogin}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300"
        >
          Login
        </button>
        <button
          onClick={navigateToRegister}
          className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300"
        >
          Register
        </button>
      </div>
      
     
      <section className="mt-12 max-w-4xl mx-auto px-4">
        <button
          onClick={navigateToViewAllBlogs}
          className="px-6 py-2 bg-purple-500 text-white font-semibold rounded-md hover:bg-purple-600 transition duration-300"
        >
          Recent Blogs
        </button>
      </section>
    </div>
  );
};

export default HomePage;
