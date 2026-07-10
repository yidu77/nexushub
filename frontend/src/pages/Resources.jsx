import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resource_code: '', name: '', category: '', status: 'Available'
  });

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/resources?search=${search}`);
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

    // Check for duplicate Resource Code (only when adding new)
    if (!editingId) {
      const codeExists = resources.some(res => 
        res.resource_code.toLowerCase() === formData.resource_code.toLowerCase()
      );
      if (codeExists) {
        toast.error('This Resource Code is already in use. Please use a unique code.');
        return false;
      }
    }
    return true;
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/resources', formData);
      resetForm(); fetchResources(); toast.success('Resource added successfully!');
    } catch (error) { 
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else { toast.error('Error adding resource'); }
    } finally { setSubmitting(false); }
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
      await axios.put(`http://localhost:5000/api/resources/${editingId}`, formData);
      resetForm(); fetchResources(); toast.success('Resource updated successfully!');
    } catch (error) { 
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else { toast.error('Error updating resource'); }
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await axios.delete(`http://localhost:5000/api/resources/${id}`);
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Resources</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm md:text-base">
          {editingId ? 'Cancel Edit' : '+ Add Resource'}
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search by Code or Name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchResources()} className="flex-1 p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
        <button onClick={fetchResources} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 text-sm md:text-base">Search</button>
      </div>

      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">{editingId ? 'Edit Resource' : 'Add New Resource'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAddResource} className="grid grid-cols-1 gap-3">
            <input type="text" name="resource_code" placeholder="Resource Code * (e.g., RES-001)" required value={formData.resource_code} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <input type="text" name="name" placeholder="Resource Name * (e.g., Projector)" required value={formData.name} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <input type="text" name="category" placeholder="Category (e.g., Electronics)" value={formData.category} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded text-sm md:text-base">
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base">
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (editingId ? 'Update Resource' : 'Save Resource')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? ( <p className="p-6 text-center text-gray-500 text-sm md:text-base">Loading resources...</p> ) : resources.length === 0 ? ( <p className="p-6 text-center text-gray-500 text-sm md:text-base">No resources found.</p> ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Code</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Name</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">Category</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map((res) => (
                  <tr key={res.id}>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">{res.resource_code}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 max-w-xs truncate">{res.name}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">{res.category}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${res.status === 'Available' ? 'bg-green-100 text-green-800' : res.status === 'In Use' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{res.status}</span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 md:gap-2">
                        <button onClick={() => handleEdit(res)} className="p-1 md:p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors" title="Edit Resource">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(res.id)} className="p-1 md:p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors" title="Delete Resource">
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
export default Resources;