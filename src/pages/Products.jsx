import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  Package
} from 'lucide-react';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - in a real app, this would come from an API
  const [products] = useState([
    {
      id: 1,
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: 299.99,
      stock: 45,
      status: 'In Stock',
      image: '/placeholder-product.jpg',
      sku: 'WH-001',
      createdAt: '2024-01-10',
    },
    {
      id: 2,
      name: 'Cotton T-Shirt',
      category: 'Clothing',
      price: 29.99,
      stock: 5,
      status: 'Low Stock',
      image: '/placeholder-product.jpg',
      sku: 'CT-002',
      createdAt: '2024-01-08',
    },
    {
      id: 3,
      name: 'Coffee Maker',
      category: 'Home & Kitchen',
      price: 149.99,
      stock: 0,
      status: 'Out of Stock',
      image: '/placeholder-product.jpg',
      sku: 'CM-003',
      createdAt: '2024-01-05',
    },
    {
      id: 4,
      name: 'Gaming Mouse',
      category: 'Electronics',
      price: 79.99,
      stock: 23,
      status: 'In Stock',
      image: '/placeholder-product.jpg',
      sku: 'GM-004',
      createdAt: '2024-01-03',
    },
    {
      id: 5,
      name: 'Desk Lamp',
      category: 'Home & Kitchen',
      price: 89.99,
      stock: 12,
      status: 'In Stock',
      image: '/placeholder-product.jpg',
      sku: 'DL-005',
      createdAt: '2024-01-01',
    },
  ]);

  const categories = ['all', ...new Set(products.map(product => product.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status.toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status, stock) => {
    if (status === 'Out of Stock' || stock === 0) {
      return 'bg-red-100 text-red-800';
    } else if (status === 'Low Stock' || stock <= 5) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product inventory
          </p>
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
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="in stock">In Stock</option>
                  <option value="low stock">Low Stock</option>
                  <option value="out of stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Product</Table.Header>
                <Table.Header>Category</Table.Header>
                <Table.Header>Price</Table.Header>
                <Table.Header>Stock</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Created</Table.Header>
                <Table.Header>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredProducts.map((product) => (
                <Table.Row key={product.id}>
                  <Table.Cell>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-900">{product.category}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-900">{product.stock}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(product.status, product.stock)}`}>
                      {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-sm text-gray-500">
                    {product.createdAt}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new product.'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
                <div className="mt-6">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Products;