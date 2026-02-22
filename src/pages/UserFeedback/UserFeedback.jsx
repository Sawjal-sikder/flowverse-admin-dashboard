import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { API_BASE_URL } from '../../services/auth';
import { 
  Search, 
  MessageSquare,
  User
} from 'lucide-react';

const Plan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });

  // Fetch feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/dashboard/user-feedback/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle paginated response
        setFeedbacks(data.results || []);
        setPagination({
          count: data.count || 0,
          next: data.next || null,
          previous: data.previous || null
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError(err.message);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.user_information?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.user_information?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">User Feedback</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user feedback ({pagination.count} total)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="p-4">
              <div className="text-red-800">
                <h3 className="text-sm font-medium">Error loading feedback</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Search Bar */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search feedback by description, name, or email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </Card>

        {/* Feedback Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Loading feedback...</h3>
              <p className="mt-1 text-sm text-gray-500">Please wait while we fetch user feedback.</p>
            </div>
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>Feedback</Table.Header>
                    <Table.Header>Feedback To</Table.Header>
                    <Table.Header>Created At</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {filteredFeedbacks.map((feedback) => (
                    <Table.Row key={feedback.id}>
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {feedback.description}
                            </div>
                            <div className="text-xs text-gray-500">ID: {feedback.id}</div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          {/* <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-600" />
                          </div> */}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {feedback.user_information?.full_name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {feedback.user_information?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-900 whitespace-nowrap">
                          {formatDate(feedback.created_at)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {filteredFeedbacks.length === 0 && !loading && (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search criteria.'
                      : 'No user feedback has been submitted yet.'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Plan;