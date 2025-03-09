
// Header.tsx
import { useState, useRef, useEffect } from 'react';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/authContext';
import authApi from '../services/authClient';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <header className="bg-white shadow-sm z-10 sticky top-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-indigo-600 md:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Open sidebar"
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
        
            {/* User Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <FaUserCircle className="h-6 w-6 text-gray-500" />
                <span className="text-sm font-medium hidden sm:block">{user?.name || "Admin"}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-800">{user?.name || "Admin"}</p>
                    <p className="text-xs text-gray-500">{user?.email || "admin@example.com"}</p>
                  </div>
                  <div className="py-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;