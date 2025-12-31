import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
              PathWise
            </h3>
            <p className="text-gray-600 text-sm">
              AI-powered personalized learning platform for employee skill development.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-primary-600 text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-600 hover:text-primary-600 text-sm">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-600 hover:text-primary-600 text-sm">
                  Register
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
            <p className="text-gray-600 text-sm">
              Email: info@pathwise.com
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Support: support@pathwise.com
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
            Made with <Heart size={16} className="text-red-500 fill-current" /> by PathWise Team
          </p>
          <p className="text-gray-500 text-xs mt-2">
            &copy; {new Date().getFullYear()} PathWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
