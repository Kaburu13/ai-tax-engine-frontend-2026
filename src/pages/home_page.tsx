//home_page.tsx
// src/pages/home_page.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Calculator, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle 
} from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00338D] to-[#00205B] opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              AI Tax Computation Engine
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Automated tax computation for Kenya Revenue Authority compliance. 
              Powered by artificial intelligence and built for KPMG East Africa.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/upload"
                className="px-8 py-3 bg-white text-[#00338D] rounded-lg font-semibold 
                         hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                Upload Workbook
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-transparent text-white border-2 border-white 
                         rounded-lg font-semibold hover:bg-white hover:text-[#00338D] 
                         transition-all"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Key Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your tax computation process with intelligent automation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6 text-[#00338D]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Sheet Detection
            </h3>
            <p className="text-gray-600">
              Automatically identifies and classifies tax computation sheets, trial balances, 
              and supporting schedules using AI pattern recognition.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-[#00338D]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              KRA Compliance
            </h3>
            <p className="text-gray-600">
              Computes corporate income tax, investment allowances, and deferred tax 
              according to Kenya Revenue Authority regulations.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[#00338D]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Year-over-Year Continuity
            </h3>
            <p className="text-gray-600">
              Validates continuity between prior year and current year computations, 
              ensuring consistency and accuracy.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#00338D]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Validation & Error Detection
            </h3>
            <p className="text-gray-600">
              Identifies discrepancies, missing data, and computational errors 
              with detailed validation reports.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-[#00338D]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Instant Processing
            </h3>
            <p className="text-gray-600">
              Upload Excel workbooks and receive automated tax computations 
              in seconds, not hours.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-[#00338D]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Comprehensive Reports
            </h3>
            <p className="text-gray-600">
              Generate detailed computation reports with all supporting schedules 
              and audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple three-step process to automate your tax computations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-[#00338D] text-white 
                              rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-2">
                  Upload Workbook
                </h3>
                <p className="text-gray-600">
                  Upload your Excel workbook containing trial balances, tax computations, 
                  and supporting schedules.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-[#00338D] text-white 
                              rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-2">
                  AI Processing
                </h3>
                <p className="text-gray-600">
                  Our AI engine detects sheets, extracts data, validates computations, 
                  and applies KRA regulations.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-[#00338D] text-white 
                              rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-2">
                  Get Results
                </h3>
                <p className="text-gray-600">
                  Review automated computations, validation reports, and download 
                  comprehensive Excel reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#00338D] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Automate Your Tax Computations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join KPMG East Africa teams using AI to streamline tax compliance
          </p>
          <Link
            to="/upload"
            className="inline-block px-8 py-3 bg-white text-[#00338D] rounded-lg 
                     font-semibold hover:bg-blue-50 transition-all shadow-lg 
                     hover:shadow-xl"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2025 KPMG East Africa. All rights reserved.</p>
          <p className="text-sm mt-2">
            Tax Technology Team | Kenya & Uganda Operations
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;