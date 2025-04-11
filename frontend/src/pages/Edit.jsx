import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBlogDetail, editBlog } from '../services/blogService';
import { getAuthToken } from '../services/authService';
import BlogForm from '../components/Blog/BlogForm';

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const blogFromState = location.state?.blog;

  const [blog, setBlog] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (blogFromState) {
      setBlog({
        title: blogFromState.title,
        content: blogFromState.content,
      });
      setLoading(false);
      return;
    }
    
    const fetchBlogDetails = async () => {
      try {
        const data = await getBlogDetail(id);
        setBlog({
          title: data.title,
          content: data.content,
        });
        setLoading(false);
      } catch {
        setError('Failed to fetch blog details');
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id, blogFromState, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prevBlog) => ({
      ...prevBlog,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!blog.title.trim() || !blog.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      await editBlog(id, blog);
      setSuccess('Blog updated successfully');
     
      setTimeout(() => {
        navigate('/my-blogs', { 
          state: { 
            userId: location.state?.userId, 
            username: location.state?.username 
          } 
        });
      }, 1500);
    } catch {
      setError('Failed to update blog');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BlogForm
      blogData={blog}
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={error}
      success={success}
      isEdit={true}
      onCancel={handleCancel}
    />
  );
};

export default Edit;