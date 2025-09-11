import React, { useState } from 'react';
import { FiDownload, FiEye, FiMail, FiMapPin, FiLinkedin, FiGithub, FiAward, FiBriefcase, FiBook, FiCode, FiHeart } from 'react-icons/fi';

const ProfessionalPage = () => {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'full'

  const handleDownloadResume = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Maya_A_Ramirez_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Professional Profile</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            My professional journey, skills, and experience in technology and beyond.
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 mr-4">
                <FiCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tech Focus</p>
                <p className="text-2xl font-bold text-gray-900">Python & AI</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-3 mr-4">
                <FiBriefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Experience</p>
                <p className="text-2xl font-bold text-gray-900">2+ Years</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3 mr-4">
                <FiBook className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Education</p>
                <p className="text-2xl font-bold text-gray-900">Tech Focused</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-3 mr-4">
                <FiHeart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Passion</p>
                <p className="text-2xl font-bold text-gray-900">AI & Wellness</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-600">Let's connect and explore opportunities together</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiMail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">mrami2702@gmail.com</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiMapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">Austin, TX</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiLinkedin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">LinkedIn</h3>
              <a 
                href="https://www.linkedin.com/in/maya-ramirez-367066184/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Connect with me
              </a>
            </div>
          </div>
        </div>

        {/* Resume Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Resume Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <FiAward className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Maya's Resume</h2>
                  <p className="text-blue-100 text-sm">Professional experience and skills</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setViewMode(viewMode === 'preview' ? 'full' : 'preview')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiEye className="h-4 w-4" />
                  <span>{viewMode === 'preview' ? 'Full View' : 'Preview'}</span>
                </button>
                
                <button
                  onClick={handleDownloadResume}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiDownload className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resume Content */}
          <div className="p-6">
            {viewMode === 'preview' ? (
              <div className="space-y-6">
                {/* Resume Preview */}
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <FiAward className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Preview</h3>
                    <p className="text-gray-600 mb-4">
                      Click "Full View" to see the complete resume, or download the PDF to view offline.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setViewMode('full')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <FiEye className="h-4 w-4" />
                        <span>View Full Resume</span>
                      </button>
                      <button
                        onClick={handleDownloadResume}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <FiDownload className="h-4 w-4" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <FiCode className="mr-2 h-5 w-5" />
                      Technical Skills
                    </h3>
                    <ul className="space-y-2 text-blue-800">
                      <li> Python Backend Development</li>
                      <li> AI Agents & Generative AI</li>
                      <li> Machine Learning</li>
                      <li> API Development</li>
                      <li> Database Design</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                      <FiBriefcase className="mr-2 h-5 w-5" />
                      Experience Highlights
                    </h3>
                    <ul className="space-y-2 text-green-800">
                      <li> 2+ Years in Technology</li>
                      <li> AI & Machine Learning Projects</li>
                      <li> Backend Development</li>
                      <li> Problem Solving & Innovation</li>
                      <li> Cross-functional Collaboration</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <iframe
                  src="/resume.pdf"
                  className="w-full h-[800px] border border-gray-300 rounded-lg"
                  title="Maya A. Ramirez Resume"
                />
              </div>
            )}
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Connect & Explore</h3>
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com/mrami2702"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <FiGithub className="h-5 w-5" />
                <span>GitHub</span>
              </a>
              
              <a
                href="https://www.linkedin.com/in/maya-ramirez-367066184/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <FiLinkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
              
              <a
                href="mailto:mrami2702@gmail.com"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <FiMail className="h-5 w-5" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPage;
