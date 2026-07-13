import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function Statistics() {
  const [data, setData] = useState({ members: [], requests: [], resources: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [membersRes, requestsRes, resourcesRes] = await Promise.all([
          axios.get('https://nexushub-backend-985p.onrender.com/api/members', config),
          axios.get('https://nexushub-backend-985p.onrender.com/api/requests', config),
          axios.get('https://nexushub-backend-985p.onrender.com/api/resources', config)
        ]);

        setData({
          members: membersRes.data,
          requests: requestsRes.data,
          resources: resourcesRes.data
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Process Data ---
  const getChartData = (items, key) => {
    return items.reduce((acc, curr) => {
      const val = curr[key] || 'Unknown';
      const existing = acc.find(item => item.name === val);
      if (existing) existing.value++;
      else acc.push({ name: val, value: 1 });
      return acc;
    }, []);
  };

  const membersByDept = getChartData(data.members, 'department');
  const requestsByStatus = getChartData(data.requests, 'status');
  const requestsByPriority = getChartData(data.requests, 'priority');
  const resourcesByCategory = getChartData(data.resources, 'category');
  const resourcesByStatus = getChartData(data.resources, 'status');

  // Active vs Inactive Members
  const activeMembers = data.members.filter(m => m.status === 'Active').length;
  const inactiveMembers = data.members.length - activeMembers;
  const memberStatusData = [
    { name: 'Active', value: activeMembers },
    { name: 'Inactive', value: inactiveMembers }
  ];

  if (loading) return <div className="p-6 text-center text-gray-500">Loading Statistics...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">Detailed Statistics</h1>
      
      {/* Section 1: Members */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">👥 Team Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">Active vs Inactive</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={memberStatusData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {memberStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Members by Department</h3>
          {membersByDept.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={membersByDept}>
                <XAxis dataKey="name" stroke="#8884d8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#8884d8" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-10">No department data.</p>}
        </div>
      </div>

      {/* Section 2: Requests */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">📝 Work Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">Requests by Status</h3>
          {requestsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={requestsByStatus} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {requestsByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-10">No status data.</p>}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">Requests by Priority</h3>
          {requestsByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={requestsByPriority} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {requestsByPriority.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-10">No priority data.</p>}
        </div>
      </div>

      {/* Section 3: Resources */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">📦 Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">Resources by Status</h3>
          {resourcesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={resourcesByStatus} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {resourcesByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-10">No status data.</p>}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">Resources by Category</h3>
          {resourcesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={resourcesByCategory} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {resourcesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-10">No category data.</p>}
        </div>
      </div>
    </div>
  );
}

export default Statistics;