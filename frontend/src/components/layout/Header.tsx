import { useState } from 'react';
import { FaBars, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import authApi from '../../services/authClient';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();

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
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-[#FF6B6B] md:hidden"
          >
            <FaBars className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-gray-500 hover:text-[#FF6B6B]"
              >
                <span>{user?.name || "Admin"}</span>
                <FaChevronDown className="h-4 w-4" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#F0F0F0] rounded-md shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-[#2D3436] hover:bg-[#FF6B6B] hover:text-white transition-all duration-300"
                  >
                    Logout
                  </button>
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