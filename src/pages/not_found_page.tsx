// src/pages/not_found_page.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Upload, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-[#00338D] 
                        rounded-full mb-6">
            <span className="text-6xl font-bold text-white">404</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-transparent border-2 border-[#00338D] text-[#00338D] 
                     rounded-lg font-semibold hover:bg-[#00338D] hover:text-white 
                     transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-3 bg-[#00338D] text-white rounded-lg font-semibold 
                     hover:bg-[#00205B] transition-all flex items-center justify-center gap-2 
                     shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Links
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/dashboard"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#00338D] 
                       hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center 
                            mx-auto mb-3 group-hover:bg-[#00338D] transition-colors">
                <Search className="w-5 h-5 text-[#00338D] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Dashboard</h3>
              <p className="text-sm text-gray-600">View all workbooks</p>
            </Link>

            <Link
              to="/upload"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#00338D] 
                       hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center 
                            mx-auto mb-3 group-hover:bg-[#00338D] transition-colors">
                <Upload className="w-5 h-5 text-[#00338D] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Upload</h3>
              <p className="text-sm text-gray-600">Upload workbook</p>
            </Link>

            <Link
              to="/reports"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#00338D] 
                       hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center 
                            mx-auto mb-3 group-hover:bg-[#00338D] transition-colors">
                <Search className="w-5 h-5 text-[#00338D] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Reports</h3>
              <p className="text-sm text-gray-600">View reports</p>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please contact the{' '}
          <a href="mailto:support@kpmg.com" className="text-[#00338D] hover:text-[#00205B] font-medium">
            KPMG support team
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;