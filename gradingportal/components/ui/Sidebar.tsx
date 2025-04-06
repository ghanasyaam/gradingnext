import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, CalendarDays, Edit, PlusCircle, 
  BarChart3, Settings, Users, Bell, Search, ChevronRight
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("Events");
  
  const mainNavItems: NavItem[] = [
    { 
      href: "/dashboard", 
      label: "Dashboard", 
      icon: <BarChart3 size={18} />
    },
    { 
      href: "/users", 
      label: "Users", 
      icon: <Users size={18} />
    },
  ];
  
  const eventItems: NavItem[] = [
    { 
      href: "/events", 
      label: "All Events", 
      icon: <CalendarDays size={18} />,
      badge: 5
    },
    { 
      href: "/modify-event", 
      label: "Modify Event", 
      icon: <Edit size={18} />
    },
    { 
      href: "/create-event", 
      label: "Create Event", 
      icon: <PlusCircle size={18} />
    },
  ];
  
  const settingsItems: NavItem[] = [
    { 
      href: "/settings", 
      label: "Settings", 
      icon: <Settings size={18} />
    },
    { 
      href: "/notifications", 
      label: "Notifications", 
      icon: <Bell size={18} />,
      badge: 3
    },
  ];

  const isActive = (href: string) => pathname === href;
  
  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, setIsOpen]);

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const hovered = hoveredItem === item.href;
    
    return (
      <Link 
        href={item.href} 
        key={item.href}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group relative
          ${active 
            ? "bg-indigo-600 text-white" 
            : "text-gray-300 hover:bg-gray-800"}`}
        onMouseEnter={() => setHoveredItem(item.href)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="flex items-center gap-3">
          <div className={`${active ? "text-white" : "text-gray-400 group-hover:text-indigo-400"} transition-colors`}>
            {item.icon}
          </div>
          <span className="font-medium">{item.label}</span>
        </div>
        
        {item.badge && (
          <span className={`flex items-center justify-center px-2 min-w-6 h-6 rounded-full text-xs font-medium 
            ${active ? "bg-white text-indigo-600" : "bg-gray-700 text-gray-200"}`}>
            {item.badge}
          </span>
        )}
        
        {(active || hovered) && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-400 animate-expandWidth" />
        )}
      </Link>
    );
  };

  const renderSection = (title: string, items: NavItem[]) => {
    const isExpanded = expandedSection === title;
    
    return (
      <div className="mb-2">
        <button 
          onClick={() => setExpandedSection(isExpanded ? null : title)}
          className="flex items-center justify-between w-full px-3 py-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
          <ChevronRight 
            size={16} 
            className={`transform transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} 
          />
        </button>
        
        <div 
          className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out 
            ${isExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
        >
          {items.map(renderNavItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-10">
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white w-72 shadow-2xl transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-in-out z-20 flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 h-8 w-8 rounded-md flex items-center justify-center">
              <CalendarDays size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">EventHub</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* <div className="p-3">
          <div className="bg-gray-700/30 rounded-lg flex items-center gap-2 px-3 py-2 mb-4">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500 w-full"
            />
          </div>
        </div> */}
        
        <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="space-y-1 mb-6">
            {mainNavItems.map(renderNavItem)}
          </div>
          
          {renderSection("Events", eventItems)}
          {renderSection("Settings", settingsItems)}
        </nav>
        
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                JD
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-800"></div>
            </div>
            <div>
              <p className="font-medium text-sm">John Doe</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 left-4 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg p-2.5 transition-all duration-300 ease-in-out z-20 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
        aria-label="Open menu"
      >
        <div className="relative">
          <Menu size={20} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 items-center justify-center text-xs">
              8
            </span>
          </span>
        </div>
      </button>
    </div>
  );
}

// Add this to your global CSS file
const globalStyles = `
@keyframes expandWidth {
  from { width: 0; }
  to { width: 100%; }
}

.animate-expandWidth {
  animation: expandWidth 0.3s ease-out forwards;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
  border-radius: 2px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background-color: transparent;
}
`;