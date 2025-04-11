import React from 'react';

const BlogForm = ({ 
  blogData, 
  onChange, 
  error, 
  success,
  onSubmit,
  isEdit = false,
  onCancel,
  renderButtons
}) => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          {isEdit ? 'Edit Blog' : 'Create New Blog'}
        </h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{success}</div>}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={blogData.title}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Blog title"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={blogData.content}
              onChange={onChange}
              rows="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Blog content"
              required
            ></textarea>
          </div>

          <div className="flex justify-between">
            {/* This conditional renders the cancel button if onCancel is provided */}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
            
            {/* Custom buttons can be rendered here */}
            {renderButtons ? renderButtons() : (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {isEdit ? 'Update Blog' : 'Create Blog'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;