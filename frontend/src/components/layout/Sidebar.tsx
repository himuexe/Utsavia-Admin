import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaTags, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: FaHome },
    { name: 'Bookings', href: '/bookings', icon: FaCalendarAlt },
    { name: 'Management', href: '/management', icon: FaTags },
    { name: 'Themes', href: '/themes', icon: FaTags },
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 transition-transform duration-300 ease-in-out shadow-lg
    `}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-[#2D3436]">Utsavia Admin</h1>
        <button 
          onClick={toggleSidebar} 
          className="p-1 rounded-md text-gray-500 hover:text-[#FF6B6B] md:hidden"
        >
          <FaTimes className="w-6 h-6" />
        </button>
      </div>
      <nav className="mt-5 px-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => `
              flex items-center px-4 py-3 mt-1 rounded-md text-sm
              ${isActive 
                ? 'bg-[#FF6B6B] text-white' 
                : 'text-[#2D3436] hover:bg-[#FF6B6B]/10'}
              transition-all duration-300
            `}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;