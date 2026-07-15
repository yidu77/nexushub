import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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

// Dashboard is visible to Admin, Manager, and Viewer — NOT Staff (matches the role spec).
const DashboardRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const allowedRoles = ['admin', 'manager', 'viewer'];
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/members" replace />;
  }

  return children;
};

function App() {
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
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route
            path="/dashboard"
            element={
              <DashboardRoute>
                <Dashboard />
              </DashboardRoute>
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