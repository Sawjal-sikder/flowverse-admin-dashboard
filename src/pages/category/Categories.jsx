import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import api from '../../services/auth';
import { formatDate } from '../../components/ui/formatDate';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  Folder,
  Package
} from 'lucide-react';
import Create from './Create';
import Update from './Update';
import Delete from './Delete';

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    FetchCategories();
  }, []);

  const FetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shop/categories/');
      
      const data = response.data;
      
      // Check if data has a nested structure (common in APIs)
      let categoriesData = data;
      if (data && data.results) {
        categoriesData = data.results;
      } else if (data && data.data) {
        categoriesData = data.data;
      }
      
      // Ensure data is an array before setting it
      const finalCategories = Array.isArray(categoriesData) ? categoriesData : [];
      setCategories(finalCategories);
    } catch (error) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = (Array.isArray(categories) ? categories : []).filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = (Array.isArray(categories) ? categories : []).reduce((sum, category) => sum + (category.productCount || 0), 0);

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Organize your products with categories
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Folder className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(categories) ? categories.length : 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Folder className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(Array.isArray(categories) ? categories : []).filter(c => c.is_active).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button className="flex items-center"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </Card>


        {/* Categories Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading categories...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Header>Category</Table.Header>
                    <Table.Header>Products</Table.Header>
                    <Table.Header>Status</Table.Header>
                    <Table.Header>Created</Table.Header>
                    <Table.Header>Actions</Table.Header>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {filteredCategories.map((category) => (
                    <Table.Row key={category.id}>
                      <Table.Cell allowWrap={true} className="max-w-xs">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Folder className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 leading-tight" title={category.name}>
                              {category.name && category.name.length > 30 ? `${category.name.substring(0, 30)}...` : category.name}
                            </div>
                            <div className="text-xs text-gray-500 leading-tight" title={category.description}>
                              {category.description && category.description.length > 50 ? `${category.description.substring(0, 50)}...` : category.description}
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{category.productCount}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-sm text-gray-500">
                        {formatDate(category.created_at)}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          {/* <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button> */}
                          <Button variant="ghost" size="sm"
                          onClick={() => {
                              setSelectedCategory(category);
                              setIsUpdateModalOpen(true);
                            }}
                            >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm"
                          onClick={() => {
                              setSelectedCategory(category);
                              setIsDeleteModalOpen(true);
                            }}
                            >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          {/* <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <Folder className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search criteria.'
                      : 'Get started by creating a new category.'
                    }
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Create Category Modal */}
        <Create
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={(newCategory) => {
            setCategories((prev) => [...prev, newCategory]);
          }}
        />
        {/* Update Category Modal */}
        <Update
          isOpen={isUpdateModalOpen}
          category={selectedCategory}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedCategory(null);
          }}
          onUpdate={(updatedCategory) => {
            FetchCategories();
          }}
          useLocalUpdate={false}
        />
        {/* Delete Category Modal */}
        <Delete
          isOpen={isDeleteModalOpen}
          categoryId={selectedCategory ? selectedCategory.id : null}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
          }}
          onDelete={() => {
            FetchCategories();
          }}
        />
      </div>
    </Layout>
  );
};

export default Categories;