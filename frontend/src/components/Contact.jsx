// frontend/src/components/Contact.jsx
import React from "react";
import { Mail, User, Phone, Home, ArrowRight } from "lucide-react";

const Contact = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 px-6 sm:px-10">
            <h1 className="text-3xl font-bold text-white text-center">Contact Me</h1>
            <p className="text-blue-100 mt-2 text-center">Feel free to reach out anytime</p>
          </div>
          
          {/* Contact Information */}
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 pb-2 border-b border-gray-200">My Contact Information</h2>
            
            <div className="grid gap-8 md:grid-cols-2">
              {/* Name */}
              <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-blue-50 transition duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Name</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">Khandakar Mehedi Hasan</p>
                </div>
              </div>
              
              {/* Email */}
              <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-blue-50 transition duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Mail size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-600">Email</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">bsse1326@iit.du.ac.bd</p>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-blue-50 transition duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Phone size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Phone</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">01314824297</p>
                </div>
              </div>
              
              {/* Address */}
              <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-blue-50 transition duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Home size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-600">Address</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">F.H Hall, South Building, Room: 5001</p>
                </div>
              </div>
            </div>
            
            {/* Contact Button */}
            <div className="mt-10 flex justify-center">
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition duration-300 hover:from-blue-700 hover:to-indigo-800">
                Send Message
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Khandakar Mehedi Hasan | All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default Contact;