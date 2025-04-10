import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyOTP from './components/Auth/VerifyOTP';
import ViewAllBlog from './components/Blog/ViewAllBlog';
import Dashboard from './components/Blog/Dashboard';
import MyBlogs from './components/Blog/MyBlogs';
// import CreateBlog from './components/Blog/CreateBlog';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyOTP />} />
          <Route path="/allblog" element={<ViewAllBlog />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-blogs" element={<MyBlogs />} />
          {/* <Route path="/create-blog" element={<MyBlogs />} /> */}
          
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
