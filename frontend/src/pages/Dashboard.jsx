import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

function Dashboard() {
  const [data, setData] = useState({ members: [], requests: [], resources: [] });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [membersRes, requestsRes, resourcesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/members', config),
          axios.get('http://localhost:5000/api/requests', config),
          axios.get('http://localhost:5000/api/resources', config)
        ]);

        setData({
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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;

  // --- Calculate Stats ---
  const totalMembers = data.members.length;
  const activeMembers = data.members.filter(m => m.status === 'Active').length;
  const totalRequests = data.requests.length;
  const completedRequests = data.requests.filter(r => r.status === 'Completed').length;
  const pendingRequests = data.requests.filter(r => r.status === 'Pending').length;
  const totalResources = data.resources.length;

  // --- Get Recent Activities (Latest 5 of each) ---
  const recentMembers = [...data.members].slice(0, 5);
  const recentRequests = [...data.requests].slice(0, 5);
  const recentResources = [...data.resources].slice(0, 5);

  // --- Chart Data ---
  const requestsByStatus = [
    { name: 'Pending', value: pendingRequests },
    { name: 'In Progress', value: data.requests.filter(r => r.status === 'In Progress').length },
    { name: 'Completed', value: completedRequests }
  ];

  const membersByDept = data.members.reduce((acc, member) => {
    const existing = acc.find(item => item.name === member.department);
    if (existing) existing.value++;
    else acc.push({ name: member.department, value: 1 });
    return acc;
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
       Welcome back, {user.name}!
      </h1>

      {/* Summary Cards - 6 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
          <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Members</p>
          <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
          <p className="text-2xl font-bold text-purple-600">{totalRequests}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed Requests</p>
          <p className="text-2xl font-bold text-green-600">{completedRequests}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Resources</p>
          <p className="text-2xl font-bold text-red-600">{totalResources}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Requests by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={requestsByStatus} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {requestsByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Members by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={membersByDept}>
              <XAxis dataKey="name" stroke="#8884d8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8884d8" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activities</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Team Members */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              👥 New Team Members
            </h3>
            <div className="space-y-2">
              {recentMembers.length === 0 ? (
                <p className="text-sm text-gray-500">No members yet</p>
              ) : (
                recentMembers.map((member) => (
                  <div key={member.id} className="text-sm border-b dark:border-gray-700 pb-2 last:border-0">
                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                    <p className="text-gray-500 text-xs">{member.department}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Work Requests */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              📝 New Work Requests
            </h3>
            <div className="space-y-2">
              {recentRequests.length === 0 ? (
                <p className="text-sm text-gray-500">No requests yet</p>
              ) : (
                recentRequests.map((req) => (
                  <div key={req.id} className="text-sm border-b dark:border-gray-700 pb-2 last:border-0">
                    <p className="font-medium text-gray-900 dark:text-white">{req.title}</p>
                    <p className="text-gray-500 text-xs">{req.request_number} - {req.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recently Added Resources */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              📦 Recently Added Resources
            </h3>
            <div className="space-y-2">
              {recentResources.length === 0 ? (
                <p className="text-sm text-gray-500">No resources yet</p>
              ) : (
                recentResources.map((res) => (
                  <div key={res.id} className="text-sm border-b dark:border-gray-700 pb-2 last:border-0">
                    <p className="font-medium text-gray-900 dark:text-white">{res.name}</p>
                    <p className="text-gray-500 text-xs">{res.resource_code} - {res.category}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;