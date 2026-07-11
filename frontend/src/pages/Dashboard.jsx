import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Colors for the charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function Dashboard() {
  const [stats, setStats] = useState({ members: [], requests: [], resources: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch all data at once
        const [membersRes, requestsRes, resourcesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/members', config),
          axios.get('http://localhost:5000/api/requests', config),
          axios.get('http://localhost:5000/api/resources', config)
        ]);

        setStats({
          members: membersRes.data,
          requests: requestsRes.data,
          resources: resourcesRes.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Process Data for Charts ---
  
  // Chart 1: Requests by Status
  const requestsByStatus = stats.requests.reduce((acc, curr) => {
    const status = curr.status || 'Unknown';
    const existing = acc.find(item => item.name === status);
    if (existing) existing.value++;
    else acc.push({ name: status, value: 1 });
    return acc;
  }, []);

  // Chart 2: Members by Department
  const membersByDept = stats.members.reduce((acc, curr) => {
    const dept = curr.department || 'Unassigned';
    const existing = acc.find(item => item.name === dept);
    if (existing) existing.value++;
    else acc.push({ name: dept, value: 1 });
    return acc;
  }, []);

  // Chart 3: Resources by Category
  const resourcesByCategory = stats.resources.reduce((acc, curr) => {
    const cat = curr.category || 'Uncategorized';
    const existing = acc.find(item => item.name === cat);
    if (existing) existing.value++;
    else acc.push({ name: cat, value: 1 });
    return acc;
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Members</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.members.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Requests</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.requests.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Resources</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.resources.length}</p>
        </div>
      </div>

      {/* Charts Section */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Requests by Status (Pie Chart) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Requests by Status</h3>
          {requestsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={requestsByStatus} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                  {requestsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No request data yet.</p>
          )}
        </div>

        {/* Chart 2: Members by Department (Bar Chart) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Members by Department</h3>
          {membersByDept.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={membersByDept}>
                <XAxis dataKey="name" stroke="#8884d8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#8884d8" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No department data yet.</p>
          )}
        </div>

        {/* Chart 3: Resources by Category (Horizontal Bar Chart) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Resources by Category</h3>
          {resourcesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourcesByCategory} layout="vertical">
                <XAxis type="number" stroke="#8884d8" style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" stroke="#8884d8" style={{ fontSize: '12px' }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No resource data yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;