import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import SubscriptionEdit from './SubscriptionEdit';
import { API_BASE_URL } from '../../services/auth';
import { formatDate } from '../../components/ui/formatDate';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  CreditCard
} from 'lucide-react';

const Subscription = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);


    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/payment/subscriptions/list/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure data is an array - handle different response formats
        let subscriptionArray = [];
        if (Array.isArray(data)) {
          subscriptionArray = data;
        } else if (data && Array.isArray(data.results)) {
          // Handle paginated response
          subscriptionArray = data.results;
        } else if (data && Array.isArray(data.data)) {
          // Handle data wrapped in a data property
          subscriptionArray = data.data;
        } else if (data && Array.isArray(data.subscriptions)) {
          // Handle subscriptions wrapped in a subscriptions property
          subscriptionArray = data.subscriptions;
        } else {
          console.warn('Unexpected API response format:', data);
          subscriptionArray = [];
        }
        
        setSubscriptions(subscriptionArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

      // Fetch users on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleEditSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleSubscriptionUpdate = (updatedSubscription) => {
    // Trigger a refresh to fetch updated data from the server
    fetchSubscriptions();
    setEditModalOpen(false);
    setSelectedSubscription(null);
  };

  const filteredSubscriptions = Array.isArray(subscriptions) ? subscriptions.filter(subscription => {
    const matchesSearch = subscription.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.plan?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.stripe_customer_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && subscription.status === 'active') ||
                         (filterStatus === 'trialing' && subscription.status === 'trialing') ||
                         (filterStatus === 'inactive' && subscription.status === 'inactive');
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (active) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getSubscriptionStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user subscriptions and their status
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="p-4">
              <div className="text-red-800">
                <h3 className="text-sm font-medium">Error loading subscriptions</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions Bar */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  disabled={loading}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* <Button className="flex items-center" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button> */}
          </div>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Loading subscriptions...</h3>
              <p className="mt-1 text-sm text-gray-500">Please wait while we fetch the subscriptions.</p>
            </div>
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>Plan</Table.Header>
                    <Table.Header>User</Table.Header>
                    <Table.Header>Customer ID</Table.Header>
                    <Table.Header>Status</Table.Header>
                    <Table.Header>Trial End</Table.Header>
                    <Table.Header>Period End</Table.Header>
                    <Table.Header>Auto Renew</Table.Header>
                    <Table.Header>Actions</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {filteredSubscriptions.map((subscription) => (
                    <Table.Row key={subscription.id}>
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{subscription.plan.name}</div>
                            <div className="text-sm text-gray-500">{subscription.plan.description}</div>
                            <div className="text-xs text-gray-400">{subscription.plan.price_display}</div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-gray-900">
                          {subscription.user}
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="text-sm text-gray-900 font-mono">
                          {subscription.stripe_customer_id}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionStatusBadge(subscription.status)}`}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-gray-900">
                          {formatDate(subscription.trial_end)}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-gray-900">
                          {formatDate(subscription.current_period_end)}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subscription.auto_renew ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {subscription.auto_renew ? 'Yes' : 'No'}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditSubscription(subscription)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {filteredSubscriptions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No subscriptions available at the moment.'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Edit Subscription Modal */}
        <SubscriptionEdit 
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          subscription={selectedSubscription}
          onSubscriptionUpdate={handleSubscriptionUpdate}
        />
      </div>
    </Layout>
  );
};

export default Subscription;