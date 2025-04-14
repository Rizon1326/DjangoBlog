import React, { useEffect, useState } from "react";
import {
  getComments,
  createComment,
  replyToComment,
} from "../../services/blogService";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const BlogDetail = ({
  blog,
  onBack,
  currentUser,
  showEditControls = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyData, setReplyData] = useState({ parentId: null, content: "" });
  const [commentError, setCommentError] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(""); // "success" or "error"

  useEffect(() => {
    if (blog) {
      fetchComments();
    }
  }, [blog]);

  const fetchComments = async () => {
    if (!blog) return;
    
    try {
      const response = await getComments(blog.id);
      const treeComments = transformCommentsToTree(response);
      setComments(treeComments);
    } catch (error) {
      showAlert("Error fetching comments", "error");
      console.error(error);
    }
  };

  const showAlert = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const transformCommentsToTree = (comments) => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: []
      };
    });

    comments.forEach(comment => {
      if (comment.parent_comment) {
        const parentComment = commentMap[comment.parent_comment];
        if (parentComment) {
          parentComment.replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const handleLoginRedirect = () => {
    navigate("/login", {
      state: { redirectAfterLogin: `/blog/${blog.id}` },
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser.id) {
      showAlert("Please login to comment", "error");
      handleLoginRedirect();
      return;
    }

    if (!newComment.trim()) {
      showAlert("Comment cannot be empty", "error");
      return;
    }

    try {
      const data = {
        content: newComment,
        userId: currentUser.id,
        author: currentUser.username,
      };
      await createComment(blog.id, data);
      setNewComment("");
      showAlert("Comment posted successfully!", "success");

      // Re-fetch comments after posting
      fetchComments();
    } catch (error) {
      showAlert("Failed to post comment", "error");
      console.error(error);
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();

    if (!currentUser.id) {
      showAlert("Please login to reply", "error");
      handleLoginRedirect();
      return;
    }

    if (!replyData.content.trim()) {
      showAlert("Reply cannot be empty", "error");
      return;
    }

    try {
      const data = {
        content: replyData.content,
        userId: currentUser.id,
        author: currentUser.username,
        parent_comment: commentId, // Ensure we're using the correct field name
      };
      
      await replyToComment(blog.id, commentId, data);
      setReplyData({ parentId: null, content: "" });
      setShowReplyForm(null);
      showAlert("Reply posted successfully!", "success");

      // Re-fetch comments after replying
      fetchComments();
    } catch (error) {
      showAlert("Failed to post reply", "error");
      console.error(error);
    }
  };

  const getAvatarColor = (username) => {
    if (!username) return "bg-gray-400";
    
    const firstChar = username.charAt(0).toLowerCase();
    if (firstChar === 'j') return "bg-gray-400";
    if (firstChar === 'a') return "bg-blue-500";
    if (firstChar === 'b') return "bg-green-500";
    
    const colors = ["bg-red-500", "bg-yellow-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500"];
    return colors[username.charCodeAt(0) % colors.length];
  };

  const CommentTree = ({ comment, depth = 0, isLastReply = true, threadColors = [] }) => {
    const thisCommentColor = depth === 0 
      ? "bg-blue-500" 
      : depth === 1 
        ? "bg-green-500" 
        : depth % 2 === 0 
          ? "bg-purple-500" 
          : "bg-red-500";
    
    const hasReplies = comment.replies && comment.replies.length > 0;
    const commentThreadColors = [...threadColors];
    
    if (depth > 0) {
      commentThreadColors.push(thisCommentColor);
    }

    return (
      <div className="relative">
        {/* Render thread lines from parent comments */}
        {threadColors.map((color, index) => (
          <div
            key={`thread-${index}`}
            className={`absolute left-0 top-0 bottom-0 w-0.5 ${color}`}
            style={{ left: `${index * 20}px` }}
          />
        ))}

        {/* The actual comment */}
        <div 
          className={`relative ${depth > 0 ? `ml-${depth * 6}` : ""}`} 
          style={{ marginLeft: depth > 0 ? `${depth * 24}px` : "0" }}
        >
          {/* Horizontal connector line to comment */}
          {depth > 0 && (
            <div 
              className={`absolute left-0 top-8 h-0.5 ${thisCommentColor}`} 
              style={{ width: "12px", left: "-12px" }}
            />
          )}

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-3">
            <div className="flex items-center mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-2 ${getAvatarColor(comment.author)}`}>
                {comment.author ? comment.author.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="flex justify-between w-full">
                <h4 className="font-semibold text-gray-800">{comment.author}</h4>
                <span className="text-xs text-gray-500">
                  {comment.created_at &&
                    formatDistanceToNow(new Date(comment.created_at))}{" "}
                  ago
                </span>
              </div>
            </div>
            <p className="text-gray-600 ml-10">{comment.content}</p>

            <div className="ml-10 mt-2">
              <button
                onClick={() => {
                  if (!currentUser.id) {
                    showAlert("Please login to reply", "error");
                    handleLoginRedirect();
                  } else {
                    setShowReplyForm(
                      showReplyForm === comment.id ? null : comment.id
                    );
                    setReplyData({ parentId: comment.id, content: "" });
                  }
                }}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                {showReplyForm === comment.id ? "Cancel" : "Reply"}
              </button>
            </div>

            {showReplyForm === comment.id && (
              <form
                onSubmit={(e) => handleReplySubmit(comment.id, e)}
                className="mt-3 ml-10"
              >
                <textarea
                  value={replyData.content}
                  onChange={(e) =>
                    setReplyData({ ...replyData, content: e.target.value })
                  }
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder={`Reply to ${comment.author}`}
                ></textarea>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 mt-2 text-sm"
                >
                  Submit Reply
                </button>
              </form>
            )}
          </div>

          {/* Render replies */}
          {hasReplies && (
            <div className="ml-0">
              {comment.replies.map((reply, index) => (
                <CommentTree 
                  key={reply.id} 
                  comment={reply} 
                  depth={depth + 1}
                  isLastReply={index === comment.replies.length - 1}
                  threadColors={threadColors}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md w-full max-w-4xl mx-auto">
      {/* Alert Message */}
      {alertMessage && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md shadow-lg ${
          alertType === "success" ? "bg-green-100 text-green-800 border border-green-300" : 
          "bg-red-100 text-red-800 border border-red-300"
        }`}>
          <div className="flex items-center">
            {alertType === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {alertMessage}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
          {blog.title}
        </h2>
        {showEditControls && (
          <div className="flex space-x-4">
            <button
              onClick={() => onEdit(blog)}
              className="text-blue-500 hover:text-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(blog.id)}
              className="text-red-500 hover:text-red-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 mt-2">{blog.content}</p>

      <p className="text-gray-500 text-sm mt-4">
        <strong>Created:</strong>{" "}
        {formatDistanceToNow(new Date(blog.created_at))} ago
      </p>
      <p className="text-gray-500 text-sm">
        <strong>Updated:</strong>{" "}
        {formatDistanceToNow(new Date(blog.updated_at))} ago
      </p>

      <div className="flex justify-start items-center mt-6">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-600 text-sm sm:text-base"
        >
          Back
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments</h3>

        {currentUser.username ? (
          <p className="text-gray-600 mb-2">
            Commenting as: <span className="font-semibold">{currentUser.username}</span>
          </p>
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Please <button 
                    onClick={handleLoginRedirect}
                    className="font-medium underline text-blue-800 hover:text-blue-900"
                  >log in</button> to comment on this blog post.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={currentUser.id ? "Add a comment" : "Log in to comment"}
          ></textarea>
          {currentUser.id ? (
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
            >
              Post Comment
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 mt-2"
            >
              Log in to Comment
            </button>
          )}
        </form>

        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentTree 
                key={comment.id} 
                comment={comment} 
                depth={0}
                isLastReply={false}
                threadColors={[]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;