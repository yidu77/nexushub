import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put('http://localhost:5000/api/auth/profile', {
        currentPassword,
        newPassword
      }, config);
      
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h1>
      
      {/* Profile Info Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{user.department || 'Not assigned'}</p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input 
              type="password" 
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;