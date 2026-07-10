import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path 
      ? 'bg-blue-700 dark:bg-gray-700 text-white' 
      : 'text-blue-100 dark:text-gray-300 hover:bg-blue-800 dark:hover:bg-gray-700';
  };

  return (
    <div className="w-64 bg-blue-900 dark:bg-gray-800 text-white flex flex-col h-full transition-colors duration-300">
      {/* Header - Fixed height */}
      <div className="p-6 border-b border-blue-800 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-2xl font-bold">NexusHub</h1>
        <p className="text-sm text-blue-200 dark:text-gray-400 mt-1">Management System</p>
      </div>
      
      {/* Navigation - Grows to fill space */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link to="/dashboard" className={`block p-3 rounded ${getLinkClass('/dashboard')}`}>
          📊 Dashboard
        </Link>
        <Link to="/members" className={`block p-3 rounded ${getLinkClass('/members')}`}>
          👥 Team Members
        </Link>
        <Link to="/requests" className={`block p-3 rounded ${getLinkClass('/requests')}`}>
          📝 Work Requests
        </Link>
        <Link to="/resources" className={`block p-3 rounded ${getLinkClass('/resources')}`}>
          📦 Resources
        </Link>
        {/* Add more links here in the future - sidebar will grow automatically! */}
      </nav>
      
      {/* Footer - Fixed at bottom */}
      <div className="p-4 border-t border-blue-800 dark:border-gray-700 text-xs text-blue-200 dark:text-gray-400 flex-shrink-0">
        © 2026 NexusHub
      </div>
    </div>
  );
}

export default Sidebar;