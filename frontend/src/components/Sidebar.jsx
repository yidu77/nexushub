import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Dashboard visible to Admin, Manager, Viewer — not Staff
  const canSeeDashboard = ['admin', 'manager', 'viewer'].includes(user.role);

  const getLinkClass = (path) => {
    return location.pathname === path 
      ? 'bg-blue-700 dark:bg-gray-700 text-white' 
      : 'text-blue-100 dark:text-gray-300 hover:bg-blue-800 dark:hover:bg-gray-700';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
       navigate('/');
  };

  const displayName = user.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="w-64 bg-blue-900 dark:bg-gray-800 text-white flex flex-col h-full transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-blue-800 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-xl font-bold">NexusHub</h1>
        <p className="text-xs text-blue-200 dark:text-gray-400 mt-1">Management System</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {canSeeDashboard && (
          <Link to="/dashboard" className={`block p-2.5 rounded text-sm ${getLinkClass('/dashboard')}`}>
             📊 Dashboard
          </Link>
        )}
        <Link to="/members" className={`block p-2.5 rounded text-sm ${getLinkClass('/members')}`}>
          👥 Team Members
        </Link>
        <Link to="/requests" className={`block p-2.5 rounded text-sm ${getLinkClass('/requests')}`}>
          📝 Work Requests
        </Link>
        <Link to="/resources" className={`block p-2.5 rounded text-sm ${getLinkClass('/resources')}`}>
          📦 Resources
        </Link>
        <Link to="/statistics" className={`block p-2.5 rounded text-sm ${getLinkClass('/statistics')}`}>
          📈 Statistics
        </Link>
      </nav>
      
      {/* Compact Clickable Profile Section */}
      <Link to="/profile" className="block p-3 border-t border-blue-800 dark:border-gray-700 bg-blue-950/50 dark:bg-gray-900/50 hover:bg-blue-800/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs text-blue-200 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </Link>
      
      {/* Compact Logout Button */}
      <div className="p-3 border-t border-blue-800 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-blue-800 dark:border-gray-700 text-xs text-center text-blue-200 dark:text-gray-400 flex-shrink-0">
        © 2026 NexusHub
      </div>
    </div>
  );
}

export default Sidebar;