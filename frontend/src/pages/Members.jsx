import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', department: '', status: 'Active'
  });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/members?search=${search}`);
      setMembers(response.data);
    } catch (error) { console.error('Error fetching members:', error); } 
    finally { setLoading(false); }
  };

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const validateForm = () => {
    // Check required fields
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields (Name and Email)');
      return false;
    }

    // Full name validation (at least 2 words)
    const nameParts = formData.name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      toast.error('Please enter full name (first name and last name)');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address (e.g., user@example.com)');
      return false;
    }

    // Phone validation (if provided)
    if (formData.phone) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error('Phone number can only contain numbers, +, (), and -');
        return false;
      }
    }

    // Check if email already exists (when adding new member)
    if (!editingId) {
      const emailExists = members.some(member => 
        member.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        toast.error('This email is already registered. Please use a different email.');
        return false;
      }
    }

    return true;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/members', formData);
      resetForm();
      fetchMembers();
      toast.success('Member added successfully!');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to add member. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      department: member.department || '',
      status: member.status
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/members/${editingId}`, formData);
      resetForm();
      fetchMembers();
      toast.success('Member updated successfully!');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to update member. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await axios.delete(`http://localhost:5000/api/members/${id}`);
        fetchMembers();
        toast.success('Member deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete member');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', department: '', status: 'Active' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Team Members</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm md:text-base">
          {editingId ? 'Cancel Edit' : '+ Add Member'}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input 
          type="text" placeholder="Search by name, email, or phone..." value={search}
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
          className="flex-1 p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
        />
        <button onClick={fetchMembers} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 text-sm md:text-base">Search</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">{editingId ? 'Edit Member' : 'Add New Member'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAddMember} className="grid grid-cols-1 gap-3">
            <input type="text" name="name" placeholder="Full Name * (e.g., John Smith)" required value={formData.name} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <input type="email" name="email" placeholder="Email Address * (e.g., john@company.com)" required value={formData.email} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <input type="text" name="phone" placeholder="Phone Number (e.g., +1 234-567-8900)" value={formData.phone} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded text-sm md:text-base">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base">
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (editingId ? 'Update Member' : 'Save Member')}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? ( <p className="p-6 text-center text-gray-500 text-sm md:text-base">Loading members...</p> ) : members.length === 0 ? ( <p className="p-6 text-center text-gray-500 text-sm md:text-base">No team members found.</p> ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Name</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Email</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">Department</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">{member.name}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 max-w-xs truncate">{member.email}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">{member.department}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{member.status}</span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 md:gap-2">
                        <button onClick={() => handleEdit(member)} className="p-1 md:p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors" title="Edit Member">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(member.id)} className="p-1 md:p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors" title="Delete Member">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
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