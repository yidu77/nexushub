import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    phone: '', 
    department: '', 
    status: 'Active',
    // NEW: User account fields
    password: '',
    role: 'staff'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/members?search=${search}&department=${filterDept}&status=${filterStatus}`, config);
      setMembers(response.data);
    } catch (error) { console.error('Error fetching members:', error); } 
    finally { setLoading(false); }
  };

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim()) { 
      toast.error('Please fill in all required fields (Name and Email)'); 
      return false; 
    }
    const nameParts = formData.name.trim().split(/\s+/);
    if (nameParts.length < 2) { 
      toast.error('Please enter full name (first name and last name)'); 
      return false; 
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { 
      toast.error('Please enter a valid email address'); 
      return false; 
    }
    if (formData.phone) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.phone)) { 
        toast.error('Phone number can only contain numbers, +, (), and -'); 
        return false; 
      }
    }
    // NEW: Validate password for new users
    if (!editingId && !formData.password) {
      toast.error('Please enter a temporary password for the user');
      return false;
    }
    if (!editingId && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      // NEW: Create user account first, then member
      await axios.post('http://localhost:5000/api/members', formData, config);
      resetForm(); 
      fetchMembers(); 
      toast.success('Member added successfully! They can login with their email and password.');
    } catch (error) { 
      toast.error(error.response?.data?.error || 'Failed to add member'); 
    }
    finally { setSubmitting(false); }
  };

  const handleEdit = (member) => {
    setFormData({ 
      name: member.name, 
      email: member.email, 
      phone: member.phone || '', 
      department: member.department || '', 
      status: member.status,
      password: '', // Don't show password
      role: member.role || 'staff'
    });
    setEditingId(member.id); 
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/members/${editingId}`, formData, config);
      resetForm(); 
      fetchMembers(); 
      toast.success('Member updated successfully!');
    } catch (error) { 
      toast.error(error.response?.data?.error || 'Failed to update member'); 
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await axios.delete(`http://localhost:5000/api/members/${id}`, config);
        fetchMembers(); 
        toast.success('Member deleted successfully!');
      } catch (error) { 
        toast.error('Failed to delete member'); 
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      email: '', 
      phone: '', 
      department: '', 
      status: 'Active',
      password: '',
      role: 'staff'
    });
    setEditingId(null); 
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Team Members</h1>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm md:text-base">
            {editingId ? 'Cancel Edit' : '+ Add Member'}
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input 
          type="text" placeholder="Search name, email..." value={search} 
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchMembers()} 
          className="p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700" 
        />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="p-2 border rounded shadow-sm text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <option value="">All Departments</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded shadow-sm text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button onClick={fetchMembers} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 text-sm md:text-base">Apply Filters</button>
      </div>

      {showForm && isAdmin && (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 dark:text-white">{editingId ? 'Edit Member' : 'Add New Member'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAddMember} className="grid grid-cols-1 gap-3">
            <input type="text" name="name" placeholder="Full Name *" required value={formData.name} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <input type="email" name="email" placeholder="Email Address (for login) *" required value={formData.email} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            {!editingId && (
              <input type="password" name="password" placeholder="Temporary Password (min 6 chars) *" required value={formData.password} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            )}
            <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <select name="role" value={formData.role} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option value="staff">Staff Member</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Administrator</option>
            </select>
            <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base">
              {submitting ? 'Processing...' : (editingId ? 'Update Member' : 'Save Member')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? ( <p className="p-6 text-center text-gray-500">Loading...</p> ) : members.length === 0 ? ( <p className="p-6 text-center text-gray-500">No team members found.</p> ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Department</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  {isAdmin && <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-white">{member.name}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{member.email}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">{member.department}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        member.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        member.role === 'viewer' ? 'bg-gray-100 text-gray-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {member.role || 'staff'}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{member.status}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 md:gap-2">
                          <button onClick={() => handleEdit(member)} className="p-1 md:p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">✏️</button>
                          <button onClick={() => handleDelete(member.id)} className="p-1 md:p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default Members;