import { Link, useLocation } from 'react-router-dom';
import { TrafficCone } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/emergency', label: 'Emergency' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
              <TrafficCone className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">Smart Traffic AI</span>
          </div>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${location.pathname === item.path
                  ? 'text-gray-900 font-medium border-b-2 border-teal-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900 transition'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition"
            >
              Launch App
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
