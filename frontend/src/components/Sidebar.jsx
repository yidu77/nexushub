import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation(); // This checks what page we are on

  // Helper to highlight the active link
  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'bg-blue-900 text-white font-bold'
      : 'text-blue-100 hover:bg-blue-700';
  };

  return (
    <div className="w-64 bg-blue-800 text-white flex flex-col h-screen">
      {/* Logo / Title */}
      <div className="p-4 text-2xl font-bold border-b border-blue-700 text-center">
        NexusHub
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/dashboard" className={`block p-3 rounded ${getLinkClass('/dashboard')}`}>
          📊 Dashboard
        </Link>
        <Link to="/members" className={`block p-3 rounded ${getLinkClass('/members')}`}>
          👥 Team Members
        </Link>
        
        {/* Placeholder for future modules */}
        <div className="block p-3 rounded text-blue-300 opacity-50 cursor-not-allowed">
          📝 Work Requests (Soon)
        </div>
        <div className="block p-3 rounded text-blue-300 opacity-50 cursor-not-allowed">
          📦 Resources (Soon)
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;