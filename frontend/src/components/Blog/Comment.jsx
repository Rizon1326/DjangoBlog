// import React, { useState, useEffect } from 'react';
// import { useParams, useLocation } from 'react-router-dom';
// import { getComments, createComment, replyToComment } from '../../services/blogService';
// import { getAuthToken, getUserDetails } from '../../services/authService';

// const Comment = () => {
//   const { blogId } = useParams();  // Get the blogId from the URL
//   const location = useLocation();
//   const { userId, username } = location.state || {};
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [error, setError] = useState('');
//   const [replyData, setReplyData] = useState({ parentId: null, content: '' });
//   const [currentUser, setCurrentUser] = useState({ id: userId, username: username });

//   useEffect(() => {
//     // If user details weren't passed via location state, fetch them
//     const fetchUserDetails = async () => {
//       if (!userId || !username) {
//         try {
//           const token = getAuthToken();
//           if (token) {
//             const userDetails = await getUserDetails(token);
//             setCurrentUser(userDetails);
//           }
//         } catch (error) {
//           console.error("Failed to fetch user details:", error);
//         }
//       }
//     };
    
//     fetchUserDetails();
//   }, [userId, username]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const token = getAuthToken(); 
//         if (!token) {
//           setError('Authentication token not found');
//           return;
//         }

//         const response = await getComments(blogId);
//         setComments(response);
//       } catch (error) {
//         setError('Error fetching comments');
//         console.error(error);
//       }
//     };

//     fetchComments();
//   }, [blogId]);

//   const handleCommentSubmit = async (e) => {
//     e.preventDefault();
//     if (!newComment.trim()) {
//       setError('Comment cannot be empty');
//       return;
//     }
//     try {
//       const data = { 
//         content: newComment,
//         userId: currentUser.id,  // Include user ID with comment
//         author: currentUser.username  // Include username as author
//       };
//       await createComment(blogId, data);
//       setNewComment('');
//       setError('');
//       // Re-fetch comments after posting
//       const response = await getComments(blogId);
//       setComments(response);
//     } catch (error) {
//       setError('Failed to post comment');
//       console.error(error);
//     }
//   };

//   const handleReplySubmit = async (commentId, e) => {
//     e.preventDefault();
//     if (!replyData.content.trim()) {
//       setError('Reply cannot be empty');
//       return;
//     }
//     try {
//       const data = { 
//         content: replyData.content,
//         userId: currentUser.id,  // Include user ID with reply
//         author: currentUser.username  // Include username as author
//       };
//       await replyToComment(blogId, commentId, data);
//       setReplyData({ parentId: null, content: '' });
//       // Re-fetch comments after replying
//       const response = await getComments(blogId);
//       setComments(response);
//     } catch (error) {
//       setError('Failed to post reply');
//       console.error(error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4">
//       <h2 className="text-2xl font-semibold text-gray-800">Comments for Blog {blogId}</h2>
//       {error && <div className="text-red-500 mt-2">{error}</div>}
      
//       {currentUser.username ? (
//         <p className="text-gray-600 mb-2">Commenting as: {currentUser.username}</p>
//       ) : (
//         <p className="text-red-500 mb-2">Please log in to comment</p>
//       )}

//       <form onSubmit={handleCommentSubmit} className="mb-4">
//         <textarea
//           value={newComment}
//           onChange={(e) => setNewComment(e.target.value)}
//           rows="4"
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           placeholder="Add a comment"
//           disabled={!currentUser.id}
//         ></textarea>
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
//           disabled={!currentUser.id}
//         >
//           Post Comment
//         </button>
//       </form>

//       <div className="space-y-4">
//         {comments.map((comment) => (
//           <div key={comment.id} className="bg-white p-6 rounded-md shadow-md">
//             <h3 className="text-xl font-semibold text-gray-800">{comment.author}</h3>
//             <p className="text-gray-600 mt-2">{comment.content}</p>
//             <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-4">
//               <textarea
//                 value={replyData.parentId === comment.id ? replyData.content : ''}
//                 onChange={(e) => setReplyData({ parentId: comment.id, content: e.target.value })}
//                 rows="3"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Reply to this comment"
//                 disabled={!currentUser.id}
//               ></textarea>
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
//                 disabled={!currentUser.id}
//               >
//                 Post Reply
//               </button>
//             </form>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Comment;