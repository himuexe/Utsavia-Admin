import {  useRef} from 'react';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../context/authContext';
import authApi from '../services/authClient';
import { Button } from '../components/ui/button'; 
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'; 

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

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
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open sidebar"
            >
              <FaBars className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile */}
            <div className="relative" ref={profileRef}>
              <DropdownMenu>
                <DropdownMenuTrigger >
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={"https://avatars.githubusercontent.com/u/66200562?v=4"} alt={user?.name || "Admin"} />
                      <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:block">{user?.name || "Admin"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-800">{user?.name || "Admin"}</p>
                    <p className="text-xs text-gray-500">{user?.email || "admin@example.com"}</p>
                  </div>
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="text-red-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;