import React from 'react';
import { 
  Home, 
  Calendar, 
  Package, 
  FolderOpen, 
  Settings, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { logout, family } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'week1', label: 'Week 1', icon: Calendar },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="text-2xl mr-3">🌟</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LumiPods</h1>
            <p className="text-sm text-gray-600">{family?.name} Family</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="space-y-2">
          <button className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings className="h-5 w-5 mr-3 text-gray-500" />
            <span className="font-medium">Settings</span>
          </button>
          
          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
