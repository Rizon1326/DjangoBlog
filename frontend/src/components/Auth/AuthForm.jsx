// /src/components/Auth/AuthForm.jsx
import React from "react";

const AuthForm = ({
  title,
  children,
  onSubmit,
  error,
  success,
  loading,
  footerText,
  footerLinkText,
  footerLinkHref,
  submitButtonText,
  loadingButtonText,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Logo at the top with different colors */}
          <div className="text-center pt-8 pb-2">
            <h1 className="text-3xl font-bold">
              <span className="text-blue-600">Blog</span>
              <span className="text-gray-800">Sphere</span>
              <span className="text-yellow-500 ml-1">✎ᝰ</span>
            </h1>
          </div>

          <div className="px-6 py-6">
            <h2 className="text-2xl font-medium text-gray-800 mb-6">{title}</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={onSubmit}>
              {children}

              <div className="mb-5">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-md text-white text-sm font-medium ${
                    loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  {loading ? loadingButtonText : submitButtonText}
                </button>
              </div>
            </form>
          </div>

          {footerText && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-600 text-center">
                {footerText}{" "}
                <a
                  href={footerLinkHref}
                  className="text-blue-600 font-medium hover:text-blue-800"
                >
                  {footerLinkText}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;