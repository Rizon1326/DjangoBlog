import React from 'react';
import rizon from "../assets/rizon.jpeg";

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="rounded-full overflow-hidden border-4 border-white shadow-lg w-64 h-64">
                <img 
                  src={rizon}
                  alt="Khandakar Mehedi Hasan" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Khandakar Mehedi Hasan</h2>
              <h3 className="text-xl text-blue-600 mb-4">Software Engineering Intern</h3>
              <p className="text-gray-600 mb-6">
                Software engineering student at Institute of Information Technology, University of Dhaka. 
                Currently working as a Software Engineering Intern at Brain Station 23.
              </p>
              <a 
                href="#" 
                className="inline-block bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
              >
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">My Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow transition-shadow">
              <h3 className="font-bold text-gray-800 mb-2">Frontend</h3>
              <p className="text-gray-600">HTML, CSS, JavaScript, React</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow transition-shadow">
              <h3 className="font-bold text-gray-800 mb-2">Backend</h3>
              <p className="text-gray-600">Node.js, Express, Django</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow transition-shadow">
              <h3 className="font-bold text-gray-800 mb-2">Languages</h3>
              <p className="text-gray-600">Java, Python, C++</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow transition-shadow">
              <h3 className="font-bold text-gray-800 mb-2">Database</h3>
              <p className="text-gray-600">MySQL, MongoDB, PostgreSQL</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">© 2025 Khandakar Mehedi Hasan</p>
          <div className="flex justify-center space-x-4">
            <a href="https://www.linkedin.com/in/khandakar-mehedi-hasan-aa9688323/" className="hover:text-blue-400 transition-colors">LinkedIn</a>
            <a href="https://github.com/Rizon1326" className="hover:text-blue-400 transition-colors">GitHub</a>
            <a href="bsse1326@iit.du.ac.bd" className="hover:text-blue-400 transition-colors">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;