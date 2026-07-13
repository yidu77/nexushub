import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({ members: [], requests: [], resources: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`https://nexushub-backend-985p.onrender.com/api/search?q=${query}`, config);
          setResults(response.data);
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Search Results for: <span className="text-blue-600">"{query}"</span>
      </h1>

      {loading ? (
        <p className="text-gray-500">Searching...</p>
      ) : (
        <div className="space-y-8">
          {/* Members Results */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              👥 Team Members ({results.members.length})
            </h2>
            {results.members.length === 0 ? (
              <p className="text-gray-500">No members found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.members.map((m) => (
                  <div key={m.id} className="p-4 border rounded-lg dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.email}</p>
                    <p className="text-sm text-gray-500">{m.department}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requests Results */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
               Work Requests ({results.requests.length})
            </h2>
            {results.requests.length === 0 ? (
              <p className="text-gray-500">No requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Req #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {results.requests.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{r.request_number}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{r.title}</td>
                        <td className="px-4 py-2 text-sm">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Resources Results */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              📦 Resources ({results.resources.length})
            </h2>
            {results.resources.length === 0 ? (
              <p className="text-gray-500">No resources found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.resources.map((r) => (
                  <div key={r.id} className="p-4 border rounded-lg dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.resource_code}</p>
                    <p className="text-sm text-gray-500">{r.category}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;