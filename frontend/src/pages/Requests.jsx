import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    request_number: '', title: '', description: '', 
    status: 'Pending', priority: 'Medium', requested_by: '', assigned_to: ''
  });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/requests?search=${search}`);
      setRequests(response.data);
    } catch (error) { console.error('Error fetching requests:', error); } 
    finally { setLoading(false); }
  };

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const validateForm = () => {
    if (!formData.request_number.trim() || !formData.title.trim() || !formData.requested_by.trim()) {
      toast.error('Please fill in all required fields (Request #, Title, Requested By)');
      return false;
    }

    // Check for duplicate Request Number (only when adding new)
    if (!editingId) {
      const codeExists = requests.some(req => 
        req.request_number.toLowerCase() === formData.request_number.toLowerCase()
      );
      if (codeExists) {
        toast.error('This Request Number is already in use. Please use a unique number.');
        return false;
      }
    }
    return true;
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/requests', formData);
      resetForm(); fetchRequests(); toast.success('Request created successfully!');
    } catch (error) { 
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else { toast.error('Error creating request'); }
    } finally { setSubmitting(false); }
  };

  const handleEdit = (req) => {
    setFormData({
      request_number: req.request_number, title: req.title, description: req.description || '',
      status: req.status, priority: req.priority, requested_by: req.requested_by, assigned_to: req.assigned_to || ''
    });
    setEditingId(req.id); setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/requests/${editingId}`, formData);
      resetForm(); fetchRequests(); toast.success('Request updated successfully!');
    } catch (error) { 
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else { toast.error('Error updating request'); }
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await axios.delete(`http://localhost:5000/api/requests/${id}`);
        fetchRequests(); toast.success('Request deleted successfully!');
      } catch (error) { toast.error('Error deleting request'); }
    }
  };

  const resetForm = () => {
    setFormData({ request_number: '', title: '', description: '', status: 'Pending', priority: 'Medium', requested_by: '', assigned_to: '' });
    setEditingId(null); setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Work Requests</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm md:text-base">
          {editingId ? 'Cancel Edit' : '+ New Request'}
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search by Request #, Title, or Requested By..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchRequests()} className="flex-1 p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
        <button onClick={fetchRequests} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 text-sm md:text-base">Search</button>
      </div>

      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">{editingId ? 'Edit Request' : 'Create New Request'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAddRequest} className="grid grid-cols-1 gap-3">
            <input type="text" name="request_number" placeholder="Request Number * (e.g., REQ-001)" required value={formData.request_number} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <input type="text" name="title" placeholder="Title * (e.g., Printer Broken)" required value={formData.title} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <input type="text" name="requested_by" placeholder="Requested By *" required value={formData.requested_by} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <input type="text" name="assigned_to" placeholder="Assigned To" value={formData.assigned_to} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" />
            <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded text-sm md:text-base">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select name="priority" value={formData.priority} onChange={handleChange} className="p-2 border rounded text-sm md:text-base">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="p-2 border rounded text-sm md:text-base" rows="3"></textarea>
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base">
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (editingId ? 'Update Request' : 'Save Request')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? ( <p className="p-6 text-center text-gray-500 text-sm md:text-base">Loading requests...</p> ) : requests.length === 0 ? ( <p className="p-6 text-center text-gray-500 text-sm md:text-base">No work requests found.</p> ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Req #</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Title</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden sm:table-cell">Priority</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">Assigned To</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">{req.request_number}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 max-w-xs truncate">{req.title}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'Completed' ? 'bg-green-100 text-green-800' : req.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{req.status}</span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden sm:table-cell">{req.priority}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">{req.assigned_to || '-'}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 md:gap-2">
                        <button onClick={() => handleEdit(req)} className="p-1 md:p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors" title="Edit Request">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(req.id)} className="p-1 md:p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors" title="Delete Request">
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
export default Requests;