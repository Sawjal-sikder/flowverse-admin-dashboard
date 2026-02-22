import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import EditUser from './EditAdmin';
import CreateAdmin from './CreateAdmin';
import api,{ API_BASE_URL } from '../../services/auth';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // for user edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Get notification function at component level
  const { success } = useNotification();

  // Transform API data to match the expected format for the UI
  const transformUserData = (apiUser) => {
    return {
      id: apiUser.id,
      name: apiUser.full_name || 'N/A',
      email: apiUser.email,
      role: apiUser.role || 'Admin', // Default role, you can modify based on your API response
      status: apiUser.is_active ? 'Active' : 'Inactive',
      lastLogin: 'N/A', // Add this field to your API if needed
      joinDate: 'N/A', // Add this field to your API if needed
      phone_number: apiUser.phone_number,
      profile_picture: apiUser.profile_picture,
      is_active: apiUser.is_active
    };
  };

  // Fetch users from API only
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/dashboard/administrators/`);
      const data = response.data;
      const rawUsersData = Array.isArray(data) ? data : data.users || data.data || data.results || [];
      const transformedUsers = rawUsersData.map(transformUserData);      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error response:', error.response?.data);
      setError(`API Error: ${error.response?.data?.message || error.message}`);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Pending: 'bg-yellow-100 text-yellow-800',
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      Admin: 'bg-purple-100 text-purple-800',
      Moderator: 'bg-blue-100 text-blue-800',
      User: 'bg-gray-100 text-gray-800',
    };
    return roleStyles[role] || 'bg-gray-100 text-gray-800';
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = (updatedUserData) => {
    // Refresh the entire users list from API to ensure consistency
    fetchUsers();
    // show success notification
    success('User Updated', 'The user information has been successfully updated.');
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrators</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and monitor administrator accounts
              </p>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {error} - Showing dummy data instead.
              </p>
            </div>
          )}
        </div>

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
                  placeholder="Search Administrators..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div> */}
            </div>

            <Button 
            className="flex items-center"
            onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Administrator
            </Button>
          </div>
        </Card>

        {/* Administrators Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-sm text-gray-500">Loading administrators...</div>
            </div>
          ) : (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Administrator Information</Table.Header>
                  <Table.Header>Phone Number</Table.Header>
                  <Table.Header>E-mail</Table.Header>
                  {/* <Table.Header>Status</Table.Header> */}
                  <Table.Header>ROLE</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {paginatedUsers.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name || "-"}</div>
                          <div className="text-sm text-gray-500">{user.email || "-"}</div>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.phone_number || "*****-********"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.email || "-"}
                      </span>
                    </Table.Cell>
                    {/* <Table.Cell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </Table.Cell> */}
                    <Table.Cell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        {/* <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button> */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button> */}
                        {/* <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button> */}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-sm text-gray-500">No users found</div>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-2">
                  {startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredUsers.length)} of {filteredUsers.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    return Math.abs(page - currentPage) <= 1;
                  })
                  .reduce((acc, page, idx, arr) => {
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                      acc.push('ellipsis-' + page);
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item) =>
                    typeof item === 'string' ? (
                      <span key={item} className="px-1 text-gray-400">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`px-3 py-1 text-sm rounded-md border ${
                          currentPage === item
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Edit User Modal */}
        <EditUser
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          user={selectedUser}
          onUserUpdate={handleUserUpdate}
          useLocalUpdate={false}
        />
        {/* Create User Modal */}
        <CreateAdmin
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onUserUpdate={handleUserUpdate}
        />
      </div>
    </Layout>
  );
};

export default Users;