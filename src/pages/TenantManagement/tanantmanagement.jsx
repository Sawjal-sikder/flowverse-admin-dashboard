import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import EditPlan from './EditPlan';
import CreatePlan from './CreatePlan';
import { API_BASE_URL } from '../../services/auth';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  FileText,
  Download
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const Plan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });
  const {success} = useNotification();

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCreatePlanSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setCreateModalOpen(false);
    success('Contract created successfully');
  };

  // Fetch contracts from API
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/dashboard/tenant-management/`, {
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
        setContracts(data.results || []);
        setPagination({
          count: data.count || 0,
          next: data.next || null,
          previous: data.previous || null
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching contracts:', err);
        setError(err.message);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [refreshTrigger]);

  const handleEditContract = (contract) => {
    setSelectedContract(contract);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedContract(null);
  };

  const handleContractUpdate = (updatedContract) => {
    setRefreshTrigger(prev => prev + 1);
    setEditModalOpen(false);
    setSelectedContract(null);
    success('Contract updated successfully');
  };

  const handleDownload = (fileUrl, title) => {
    window.open(fileUrl, '_blank');
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title?.toLowerCase().includes(searchTerm.toLowerCase());
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
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your tenant contracts ({pagination.count} total)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="p-4">
              <div className="text-red-800">
                <h3 className="text-sm font-medium">Error loading contracts</h3>
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
                  placeholder="Search contracts..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* <Button className="flex items-center" disabled={loading} onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contract
            </Button> */}
          </div>
        </Card>

        {/* Contracts Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Loading contracts...</h3>
              <p className="mt-1 text-sm text-gray-500">Please wait while we fetch your contracts.</p>
            </div>
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>Contract</Table.Header>
                    <Table.Header>Created At</Table.Header>
                    <Table.Header>Updated At</Table.Header>
                    {/* <Table.Header>Actions</Table.Header> */}
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {filteredContracts.map((contract) => (
                    <Table.Row key={contract.id}>
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                            <div className="text-xs text-gray-500">ID: {contract.id}</div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-900">
                          {formatDate(contract.created_at)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-900">
                          {formatDate(contract.updated_at)}
                        </span>
                      </Table.Cell>
                      {/* <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownload(contract.file, contract.title)}
                            title="Download Contract"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditContract(contract)}
                            title="Edit Contract"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </Table.Cell> */}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {filteredContracts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search criteria.'
                      : 'Get started by creating a new contract.'
                    }
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contract
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Edit Contract Modal */}
        <EditPlan 
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          plan={selectedContract}
          onPlanUpdate={handleContractUpdate}
        />
        
        {/* Create Contract Modal */}
        <CreatePlan 
          isOpen={createModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleCreatePlanSuccess}
        />
      </div>
    </Layout>
  );
};

export default Plan;