// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // To navigate after creating a blog
// import { createBlog } from '../../services/blogService'; // Import the createBlog function

// const CreateBlog = () => {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   // Handle form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!title || !content) {
//       setError('Both title and content are required!');
//       return;
//     }

//     setLoading(true);
//     try {
//       const newBlog = {
//         title,
//         content,
//       };
//       const response = await createBlog(newBlog);
//       setLoading(false);
//       console.log('Blog created successfully:', response);
//       navigate('/allblogs');
//     } catch (err) {
//       setLoading(false);
//       setError(err.message || 'Error creating blog');
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="bg-white p-6 rounded-md shadow-md">
//         <h1 className="text-2xl mb-4">Create a New Blog</h1>

//         {error && <div className="text-red-500 mb-4">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Title</label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md"
//               placeholder="Enter blog title"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">Content</label>
//             <textarea
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               className="mt-1 p-2 w-full border border-gray-300 rounded-md"
//               rows="4"
//               placeholder="Enter blog content"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
//             disabled={loading}
//           >
//             {loading ? 'Creating Blog...' : 'Create Blog'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateBlog;
