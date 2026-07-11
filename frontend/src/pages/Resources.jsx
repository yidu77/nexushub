import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState(''); // NEW
  const [filterStatus, setFilterStatus] = useState(''); // NEW
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resource_code: '', name: '', category: '', status: 'Available'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      // Send search AND filters to backend
      const response = await axios.get(`http://localhost:5000/api/resources?search=${search}&category=${filterCategory}&status=${filterStatus}`, config);
      setResources(response.data);
    } catch (error) { console.error('Error fetching resources:', error); } 
    finally { setLoading(false); }
  };

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const validateForm = () => {
    if (!formData.resource_code.trim() || !formData.name.trim()) {
      toast.error('Please fill in all required fields (Code and Name)');
      return false;
    }
    if (!editingId) {
      const codeExists = resources.some(res => res.resource_code.toLowerCase() === formData.resource_code.toLowerCase());
      if (codeExists) { toast.error('This Resource Code is already in use.'); return false; }
    }
    return true;
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/resources', formData, config);
      resetForm(); fetchResources(); toast.success('Resource added successfully!');
    } catch (error) { toast.error(error.response?.data?.error || 'Error adding resource'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (res) => {
    setFormData({ resource_code: res.resource_code, name: res.name, category: res.category || '', status: res.status });
    setEditingId(res.id); setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/resources/${editingId}`, formData, config);
      resetForm(); fetchResources(); toast.success('Resource updated successfully!');
    } catch (error) { toast.error(error.response?.data?.error || 'Error updating resource'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await axios.delete(`http://localhost:5000/api/resources/${id}`, config);
        fetchResources(); toast.success('Resource deleted successfully!');
      } catch (error) { toast.error('Error deleting resource'); }
    }
  };

  const resetForm = () => {
    setFormData({ resource_code: '', name: '', category: '', status: 'Available' });
    setEditingId(null); setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Resources</h1>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm md:text-base">
            {editingId ? 'Cancel Edit' : '+ Add Resource'}
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input 
          type="text" placeholder="Search Code or Name..." value={search} 
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchResources()} 
          className="p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700" 
        />
        {/* Category Filter */}
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="p-2 border rounded shadow-sm text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <option value="">All Categories</option>
          <option value="IT">IT</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Vehicles">Vehicles</option>
        </select>
        {/* Status Filter */}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded shadow-sm text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        <button onClick={fetchResources} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 text-sm md:text-base">Apply Filters</button>
      </div>

      {showForm && isAdmin && (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 dark:text-white">{editingId ? 'Edit Resource' : 'Add New Resource'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAddResource} className="grid grid-cols-1 gap-3">
            <input type="text" name="resource_code" placeholder="Resource Code *" required value={formData.resource_code} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <input type="text" name="name" placeholder="Resource Name *" required value={formData.name} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base">
              {submitting ? 'Processing...' : (editingId ? 'Update Resource' : 'Save Resource')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? ( <p className="p-6 text-center text-gray-500">Loading resources...</p> ) : resources.length === 0 ? ( <p className="p-6 text-center text-gray-500">No resources found.</p> ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Category</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  {isAdmin && <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {resources.map((res) => (
                  <tr key={res.id}>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-white">{res.resource_code}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{res.name}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">{res.category}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${res.status === 'Available' ? 'bg-green-100 text-green-800' : res.status === 'In Use' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{res.status}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 md:gap-2">
                          <button onClick={() => handleEdit(res)} className="p-1 md:p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">✏️</button>
                          <button onClick={() => handleDelete(res.id)} className="p-1 md:p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">🗑️</button>
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
export default Resources;