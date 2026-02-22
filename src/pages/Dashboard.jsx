import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { API_BASE_URL } from '../services/auth';
import { 
  Users, 
  Package, 
  Folder, 
  TrendingUp,
} from 'lucide-react';


const Dashboard = () => {
  const [data, setData] = useState({
    total_users: 0,
    active_users: 0,
    total_uploaded_videos: 0,
    total_generated_videos: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard/overview/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);


  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="relative overflow-hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : data.total_users || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : data.active_users || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Uploaded videos</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : data.total_uploaded_videos || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Folder className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Generated Videos</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : data.total_generated_videos || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bar Chart
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">User Insights</h2>
                <p className="text-sm text-gray-600">Monthly breakdown of individual and company users</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Individuals</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Company</span>
                </div>
              </div>
            </div>
            
            {chartLoading ? (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-500">Loading chart...</p>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="individuals" 
                    name="Individuals"
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="company" 
                    name="Company"
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </Card> */}

                {/* <Card className="mb-8"> <RuleAnalysis /> </Card> */}

      </div>
    </Layout>
  );
};

export default Dashboard;
