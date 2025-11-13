// src/components/layout/footer.tsx
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Upload Workbook', path: '/upload' },
        { label: 'Processing Status', path: '/processing' },
        { label: 'Reports', path: '/reports' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', path: '/docs' },
        { label: 'Help Center', path: '/help' },
        { label: 'FAQs', path: '/faqs' },
        { label: 'API Reference', path: '/api-docs' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Support', path: '/support' },
        { label: 'Report an Issue', path: '/report-issue' },
        { label: 'Feature Request', path: '/feature-request' },
        { label: 'System Status', path: '/status' },
      ],
    },
  ]

  return (
    <footer className="bg-kpmg-gray-900 text-white mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-kpmg-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Tax Computation Engine</h3>
                <p className="text-sm text-kpmg-gray-400">KPMG East Africa</p>
              </div>
            </div>
            <p className="text-sm text-kpmg-gray-400 mb-4 max-w-md">
              Intelligent tax computation system for Kenya tax compliance. 
              Built by the Tax Technology Team to streamline tax computation processes.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-kpmg-gray-400">
                <Mail size={16} className="flex-shrink-0" />
                <a href="mailto:tax.tech@kpmg.com" className="hover:text-white transition-colors">
                  tax.tech@kpmg.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-kpmg-gray-400">
                <Phone size={16} className="flex-shrink-0" />
                <a href="tel:+254-20-2806000" className="hover:text-white transition-colors">
                  +254 20 2806000
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-kpmg-gray-400">
                <MapPin size={16} className="flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Footer links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-kpmg-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-kpmg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-kpmg-gray-400 text-center md:text-left">
              <p>
                &copy; {currentYear} KPMG East Africa. All rights reserved.
              </p>
              <p className="text-xs mt-1">
                Version 1.0.0 | Built by Tax Technology Team
              </p>
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-kpmg-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-kpmg-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <a
                href="https://home.kpmg/xx/en/home.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-kpmg-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                KPMG Global
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* KPMG brand notice */}
      <div className="bg-kpmg-gray-950 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-kpmg-gray-500 text-center">
            KPMG is a global organization of independent professional services firms 
            providing Audit, Tax and Advisory services. Operating in 143 countries and 
            territories with more than 265,000 partners and employees.
          </p>
        </div>
      </div>
    </footer>
  )
}