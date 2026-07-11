import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  // Get the user info we saved during login
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
           Dashboard
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
           <Link to="/statistics" className={`block p-3 rounded ${getLinkClass('/statistics')}`}>
     📈 Statistics
   </Link>
      <Link to="/profile" className={`block p-3 rounded ${getLinkClass('/profile')}`}>
     👤 My Profile
   </Link>
      </nav>
      
      {/* User Profile Section - Shows Name & Role */}
      <div className="p-4 border-t border-blue-800 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar Circle */}
          <div className="w-10 h-10 rounded-full bg-blue-700 dark:bg-gray-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
            {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.email || 'User'}</p>
            {/* Role Badge */}
            <p className={`text-xs font-semibold ${user.role === 'admin' ? 'text-yellow-400' : 'text-blue-300 dark:text-gray-400'}`}>
              {user.role === 'admin' ? '👑 Administrator' : '👤 Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="p-4 border-t border-blue-800 dark:border-gray-700 text-xs text-blue-200 dark:text-gray-400 flex-shrink-0">
        © 2026 NexusHub
      </div>
    </div>
  );
}

export default Sidebar;