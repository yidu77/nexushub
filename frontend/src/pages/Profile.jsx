import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Editable fields
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [displayName, setDisplayName] = useState(user.name || '');
  const [editMode, setEditMode] = useState(false);

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
      
      await axios.put('http://localhost:5000/api/auth/profile/password', {
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put('http://localhost:5000/api/auth/profile', {
        name,
        phone,
        displayName
      }, config);
      
      // Update localStorage with new info
      const updatedUser = { ...user, name, phone, displayName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h1>
      
      {/* Profile Info Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Account Information</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        
        {!editMode ? (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{user.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Display Name</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{user.displayName || user.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{user.phone || 'Not set'}</p>
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
        ) : (
          // Edit Mode
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="How you want to be called"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email (cannot be changed)</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
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