import React from "react";

const Contact = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Contact Section */}
      <section className="py-16 justify-content items-center">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="w-full max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Contact Me
            </h2>

            <div className="flex flex-col lg:flex-row justify-center gap-12">
              {/* Contact Information */}
              <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-md p-8 lg:ml-auto">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  My Contact Information
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Name</h4>
                      <p className="text-gray-600">Khandakar Mehedi Hasan</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Email</h4>
                      <p className="text-gray-600">bsse1326@iit.du.ac.bd</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Phone</h4>
                      <p className="text-gray-600">01314824297</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-xl">🏠</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Address</h4>
                      <p className="text-gray-600">
                        F.H Hall, South Building, Room: 5001
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
