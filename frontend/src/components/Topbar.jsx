import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // NEW

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  // NEW: Handle Search
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white hidden md:block">
          Welcome, {user.email || 'User'}
        </h2>
      </div>

      {/* NEW: Global Search Bar */}
      <div className="flex-1 w-full md:max-w-md mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members, requests, resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full p-2 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Notification Bell */}
        <NotificationBell />

        {/* Dark Mode Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          )}
        </button>

        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm md:text-base">Logout</button>
      </div>
    </header>
  );
}

export default Topbar;