import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [showTitle, setShowTitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  
  const blogEmojis = ["✍️", "📝", "📚", "💭", "🖋️", "📖"];
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => setShowTitle(true), 300);
    setTimeout(() => setShowButtons(true), 800);
    
    const emojiInterval = setInterval(() => {
      setCurrentEmojiIndex((prev) => (prev + 1) % blogEmojis.length);
    }, 2000);
    
    return () => clearInterval(emojiInterval);
  }, [blogEmojis.length]);

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

      <header className={`text-center py-8 transform transition-all duration-700 ${showTitle ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="text-center pt-8 pb-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            <span className="text-blue-600">Blog</span>
            <span className="text-gray-800">Sphere</span>
            <span className="text-yellow-500 ml-1">✎ᝰ</span>
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-gray-700 mt-4">Express Your Thoughts and Ideas</p>
      </header>

      <div className="flex justify-center items-center mt-8 mb-8">
        <div className="relative h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 flex justify-center items-center">
          <span className="text-4xl sm:text-6xl md:text-7xl animate-bounce absolute">
            {blogEmojis[currentEmojiIndex]}
          </span>
          <div className="absolute w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-ping"></div>
        </div>
      </div>

      <div className={`mt-6 space-x-6 transition-all duration-700 ${showButtons ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <button
          onClick={navigateToLogin}
          className="px-8 py-3 text-sm sm:text-base md:text-lg lg:text-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition transform duration-300 focus:ring-2 focus:ring-blue-300 focus:outline-none"
        >
          Login 🔑
        </button>
        <button
          onClick={navigateToRegister}
          className="px-8 py-3 text-sm sm:text-base md:text-lg lg:text-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition transform duration-300 focus:ring-2 focus:ring-green-300 focus:outline-none"
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
          className="w-full py-4 text-sm sm:text-base md:text-lg lg:text-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition transform duration-300 focus:ring-2 focus:ring-purple-300 focus:outline-none flex justify-center items-center"
        >
          <span className="mr-2 text-xl">📚</span>
          Explore Recent Blogs
          <span className="ml-2 text-xl">🚀</span>
        </button>
      </div>
      
      <footer className="mt-16 text-center text-gray-500 text-sm sm:text-base">
        <p>Share your story with the world today!</p>
      </footer>
    </div>
  );
};

export default HomePage;
