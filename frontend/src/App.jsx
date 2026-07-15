import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react'; // ← useEffect comes from 'react', NOT 'react-router-dom'!
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Requests from './pages/Requests';
import Resources from './pages/Resources';
import Layout from './components/Layout';
import SearchResults from './pages/SearchResults';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Only lets Admins through. Anyone else gets sent back to their dashboard-less home.
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin') {
    return <Navigate to="/members" replace />;
  }

  return children;
};

function App() {
  // Load theme from local storage on startup
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        {/* Login Page (Public) */}
        <Route path="/" element={<Login />} />
        
        {/* Wrap all protected routes inside the Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route path="/members" element={<Members />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;