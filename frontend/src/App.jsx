import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ViewAllBlog from './pages/ViewAllBlog';
import Dashboard from './pages/Dashboard';
import MyBlogs from './pages/MyBlog';
// import CreateBlog from './components/Blog/CreateBlog';
import CreateBlog from './pages/CreateBlog';
import Edit from './pages/Edit';
import Draft from './components/Blog/Draft';
import Profile from './components/Auth/Profile';
// import Edit from './components/Blog/Edit';
// import Comment from './components/Blog/Comment';
import About from './components/About';
import Contact from './components/Contact';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute

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

          {/* Private Routes - Wrap the protected components in PrivateRoute */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/my-blogs" element={<PrivateRoute><MyBlogs /></PrivateRoute>} />
          <Route path="/create-blog" element={<PrivateRoute><CreateBlog /></PrivateRoute>} />
          <Route path="/draft" element={<PrivateRoute><Draft /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/edit-blog" element={<PrivateRoute><Edit /></PrivateRoute>} />
          {/* <Route path="/comment/:blogId" element={<PrivateRoute><Comment /></PrivateRoute>} /> */}

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
