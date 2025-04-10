import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [showTitle, setShowTitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  
  // Emojis for the animation
  const blogEmojis = ["✍️", "📝", "📚", "💭", "🖋️", "📖"];
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);

  useEffect(() => {
    // Staggered animations
    setTimeout(() => setShowTitle(true), 300);
    setTimeout(() => setShowButtons(true), 800);
    
    // Cycle through emojis
    const emojiInterval = setInterval(() => {
      setCurrentEmojiIndex((prev) => (prev + 1) % blogEmojis.length);
    }, 2000);
    
    return () => clearInterval(emojiInterval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Floating blog elements in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-2xl opacity-20 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          >
            {blogEmojis[i % blogEmojis.length]}
          </div>
        ))}
      </div>

      <header className={`text-center py-8 transform transition-all duration-700 ${showTitle ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Welcome to BlogSphere ✎ᝰ
        </h1>
        <p className="text-xl text-gray-700 mt-4">Express Your Thoughts and Ideas</p>
      </header>

      <div className="flex justify-center items-center mt-8 mb-8">
        <div className="relative h-32 w-32 flex justify-center items-center">
          <span className="text-7xl animate-bounce absolute">
            {blogEmojis[currentEmojiIndex]}
          </span>
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-ping"></div>
        </div>
      </div>

      <div className={`mt-6 space-x-6 transition-all duration-700 ${showButtons ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <button
          onClick={navigateToLogin}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition transform duration-300 focus:ring-2 focus:ring-blue-300 focus:outline-none"
        >
          Login 🔑
        </button>
        <button
          onClick={navigateToRegister}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition transform duration-300 focus:ring-2 focus:ring-green-300 focus:outline-none"
        >
          Register 📝
        </button>
      </div>

      <div className={`relative mt-16 w-full max-w-4xl mx-auto px-4 transition-all duration-700 delay-300 ${showButtons ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}></span>
            ))}
          </div>
        </div>
        
        <button
          onClick={navigateToViewAllBlogs}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition transform duration-300 focus:ring-2 focus:ring-purple-300 focus:outline-none flex justify-center items-center"
        >
          <span className="mr-2 text-xl">📚</span>
          Explore Recent Blogs
          <span className="ml-2 text-xl">🚀</span>
        </button>
      </div>
      
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p >Share your story with the world today!</p>
        
      </footer>
    </div>
  );
};

export default HomePage;