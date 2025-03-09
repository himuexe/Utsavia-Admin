// Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaCog, 
  FaPalette, 
  FaTimes, 
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: FaHome, description: 'View analytics overview' },
    { name: 'Bookings', href: '/bookings', icon: FaCalendarAlt, description: 'Manage reservations' },
    { name: 'Management', href: '/management', icon: FaCog, description: 'System settings' },
    { name: 'Themes', href: '/themes', icon: FaPalette, description: 'Customize appearance' },
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-all duration-300 ease-in-out shadow-lg
      `}
      aria-label="Sidebar navigation"
    >
      <div className="flex items-center justify-between h-16 px-6 border-b">
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-gray-800">Utsavia Admin</h1>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-1 rounded-md text-gray-500 hover:text-indigo-600 md:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Close sidebar"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
      
      <div className="px-3 py-4">
        <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
          Main Navigation
        </p>
        <nav className="space-y-1" aria-label="Main">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `
                group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                transition-all duration-200
              `}
              aria-label={item.description}
            >
              <item.icon className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors`} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;