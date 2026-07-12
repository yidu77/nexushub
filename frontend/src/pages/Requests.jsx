import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    request_number: '', title: '', description: '', 
    status: 'Pending', priority: 'Medium', requested_by: '', assigned_to: ''
  });
  

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = user.role === 'admin' || user.role === 'manager'; 
  const canCreate = user.role !== 'viewer'; 

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { 
    fetchRequests(); 
  }, [search, filterStatus, filterPriority]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/requests?search=${search}&status=${filterStatus}&priority=${filterPriority}`, config);
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
    if (!editingId) {
      const codeExists = requests.some(req => req.request_number.toLowerCase() === formData.request_number.toLowerCase());
      if (codeExists) { toast.error('This Request Number is already in use.'); return false; }
    }
    return true;
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/requests', formData, config);
      resetForm(); fetchRequests(); toast.success('Request created successfully!');
    } catch (error) { toast.error(error.response?.data?.error || 'Error creating request'); }
    finally { setSubmitting(false); }
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
      await axios.put(`http://localhost:5000/api/requests/${editingId}`, formData, config);
      resetForm(); fetchRequests(); toast.success('Request updated successfully!');
    } catch (error) { toast.error(error.response?.data?.error || 'Error updating request'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/requests/${id}`, config);
        fetchRequests();
        Swal.fire('Deleted!', 'Request has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete request', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({ request_number: '', title: '', description: '', status: 'Pending', priority: 'Medium', requested_by: '', assigned_to: '' });
    setEditingId(null); setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Work Requests</h1>
        {canCreate && (
          <button    onClick={() => { 
     resetForm(); 
     setFormData(prev => ({ ...prev, requested_by: user.email }));
     setShowForm(true); 
   }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm md:text-base">
            {editingId ? 'Cancel Edit' : '+ New Request'}
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input type="text" placeholder="Search Request #, Title..." value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded shadow-sm text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded shadow-sm text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="p-2 border rounded shadow-sm text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {showForm && canCreate && (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 dark:text-white">{editingId ? 'Edit Request' : 'Create New Request'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAddRequest} className="grid grid-cols-1 gap-3">
            <input type="text" name="request_number" placeholder="Request Number *" required value={formData.request_number} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <input type="text" name="title" placeholder="Title *" required value={formData.title} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <input type="text" name="requested_by" placeholder="Requested By *" required value={formData.requested_by} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <input type="text" name="assigned_to" placeholder="Assigned To" value={formData.assigned_to} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select name="priority" value={formData.priority} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="p-2 border rounded text-sm md:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600" rows="3"></textarea>
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base">
              {submitting ? 'Processing...' : (editingId ? 'Update Request' : 'Save Request')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? ( <p className="p-6 text-center text-gray-500">Loading requests...</p> ) : requests.length === 0 ? ( <p className="p-6 text-center text-gray-500">No work requests found.</p> ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Req #</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Priority</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Assigned To</th>
                  {canManage && <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-white">{req.request_number}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{req.title}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'Completed' ? 'bg-green-100 text-green-800' : req.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{req.status}</span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">{req.priority}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">{req.assigned_to || '-'}</td>
                    {canManage && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 md:gap-2">
                          <button onClick={() => handleEdit(req)} className="p-1 md:p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">✏️</button>
                          <button onClick={() => handleDelete(req.id)} className="p-1 md:p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">🗑️</button>
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
export default Requests;