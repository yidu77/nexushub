import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* The Sidebar on the left */}
      <Sidebar />
      
      {/* The main content area on the right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* The Topbar at the top */}
        <Topbar />
        
        {/* The "TV Screen" where pages will load */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;