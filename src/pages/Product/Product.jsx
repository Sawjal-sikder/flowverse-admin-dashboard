import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Create from './Create';
import EditForm from './Edit';
import Delete from './Delete';
import api from '../../services/auth';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical
} from 'lucide-react';

const Product = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // for creating new product
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // for product edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // for product delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Transform API data to match the expected format for the UI
  const transformProductData = (apiProduct) => {
    return {
      id: apiProduct.id,
      name: apiProduct.name || 'N/A',
      description: apiProduct.description || 'N/A',
      category: apiProduct.category || 'N/A',
      price: apiProduct.price || '0.00',
      stock: Number(apiProduct.stock) || 0,
      discount_price: apiProduct.discount_price || null,
      discount_percentage: Number(apiProduct.discount_percentage) || 0,
      type_of_product: apiProduct.type_of_product || 'N/A',
      is_active: Boolean(apiProduct.is_active),
      image1: apiProduct.image1 || null,
      image2: apiProduct.image2 || null,
      image3: apiProduct.image3 || null,
      total_reviews: Number(apiProduct.total_reviews) || 0,
      average_rating: Number(apiProduct.average_rating) || 0,
      created_at: apiProduct.created_at || '',
      updated_at: apiProduct.updated_at || ''
    };
  };

    // Fetch products from API
  const fetchProducts = async (page = currentPage, limit = itemsPerPage, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);


      // First try the basic endpoint to see if it works
      let response;
      try {
        // Try with standard pagination parameters first
        let url = `/shop/products/list/admin/?page=${page}&page_size=${limit}`;
        if (search && search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        response = await api.get(url);
      } catch (firstError) {
        console.log('First attempt failed, trying with limit parameter:', firstError.response?.status);
        
        try {
          // Try with limit instead of page_size
          let url = `/shop/products/list/admin/?page=${page}&limit=${limit}`;
          if (search && search.trim()) {
            url += `&search=${encodeURIComponent(search.trim())}`;
          }
          response = await api.get(url);
        } catch (secondError) {
          console.log('Second attempt failed, trying basic endpoint:', secondError.response?.status);
          
          // Try basic endpoint without pagination for now
          response = await api.get('/shop/products/list/admin/');
        }
      }

      // With Axios, the data is directly available in response.data
      const data = response.data;

      // Handle pagination data from API response
      const rawProductsData = data.results || data.data || (Array.isArray(data) ? data : []);
      const count = data.count || rawProductsData.length;
      
      // If API doesn't support pagination, simulate it client-side
      let paginatedData = rawProductsData;
      let actualCount = count;
      
      if (!data.results && !data.count) {
        // API doesn't support pagination, do client-side pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        paginatedData = rawProductsData.slice(startIndex, endIndex);
        actualCount = rawProductsData.length;
      }
      
      // Calculate total pages
      const calculatedTotalPages = Math.ceil(actualCount / limit);
      
      // Update pagination state
      setTotalCount(actualCount);
      setTotalPages(calculatedTotalPages);
      setCurrentPage(page);
      
      
      if (!paginatedData || paginatedData.length === 0) {
        setProducts([]);
        if (page === 1) {
          setError('No products found');
        }
        return;
      }
      
      // Transform API data to match UI expectations
      const transformedProducts = paginatedData.map(transformProductData);
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Fetch Products Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      setError(`API Error: ${error.response?.data?.message || error.message}`);
      
      
      // Generate sample data based on requested limit
      const sampleProducts = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        "id": (page - 1) * limit + i + 1,
        "category": ["Skincare", "Makeup", "Hair", "Fragrance"][i % 4],
        "name": `Sample Product ${(page - 1) * limit + i + 1}`,
        "description": `Sample product ${(page - 1) * limit + i + 1} for testing pagination`,
        "image1": null,
        "price": (Math.random() * 40 + 10).toFixed(2),
        "stock": Math.floor(Math.random() * 100),
        "discount_price": Math.random() > 0.5 ? (Math.random() * 30 + 5).toFixed(2) : null,
        "type_of_product": ["Skin", "Makeup", "Hair", "Fragrance"][i % 4],
        "is_active": Math.random() > 0.3,
        "discount_percentage": Math.random() > 0.5 ? Math.floor(Math.random() * 50) : 0,
        "total_reviews": Math.floor(Math.random() * 20),
        "average_rating": (Math.random() * 5).toFixed(1)
      }));
      
      const sampleData = {
        "count": 25, // Simulate total count for pagination
        "results": sampleProducts
      };
      
      // Simulate pagination for sample data
      setTotalCount(sampleData.count);
      setTotalPages(Math.ceil(sampleData.count / limit));
      setCurrentPage(page);
      
      const transformedProducts = sampleData.results.map(transformProductData);
      setProducts(transformedProducts);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts(1, itemsPerPage, '');
  }, []);

  // Debug: Log the current state
  useEffect(() => {
  }, [products, loading, error, currentPage, totalPages, totalCount, itemsPerPage]);

  // Since we're doing server-side pagination and search, we don't need client-side filtering
  const filteredProducts = products;

  // Handle search term change with debouncing
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Reset to first page when searching
    setCurrentPage(1);
    
    // Debounce the API call
    setTimeout(() => {
      fetchProducts(1, itemsPerPage, newSearchTerm);
    }, 300);
  };


  const handleRefresh = () => {
    fetchProducts(currentPage, itemsPerPage, searchTerm);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchProducts(newPage, itemsPerPage, searchTerm);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    fetchProducts(1, newItemsPerPage, searchTerm);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductUpdate = (updatedProductData) => {
    fetchProducts(currentPage, itemsPerPage, searchTerm);
  };

  const handleDeleteProduct = async (productId) => {
    setSelectedProductId(productId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProductId(null);
  };

  const handleProductDelete = (deletedProductId) => {
    fetchProducts(currentPage, itemsPerPage, searchTerm);
  };


  // Format price display
  const formatPrice = (price, discountPrice) => {
    if (discountPrice) {
      return (
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 line-through">${price}</span>
          <span className="text-sm font-medium text-green-600">${discountPrice}</span>
        </div>
      );
    }
    return <span className="text-sm font-medium">${price}</span>;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and monitor your product catalog.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                {error}
              </p>
            </div>
          )}

          
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex justify-between sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Button className="flex items-center" disabled={loading} onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-sm text-gray-500">Loading products...</div>
            </div>
          ) : (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header width="w-12">ID</Table.Header>
                  <Table.Header width="w-16">Image</Table.Header>
                  <Table.Header width="w-48 sm:w-64">Product Details</Table.Header>
                  <Table.Header width="w-20">Category</Table.Header>
                  <Table.Header width="w-24">Price</Table.Header>
                  <Table.Header width="w-24">Stock</Table.Header>
                  <Table.Header width="w-20">Status</Table.Header>
                  <Table.Header width="w-24">Reviews</Table.Header>
                  <Table.Header width="w-20">Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {filteredProducts.map((product) => (
                  <Table.Row key={product.id}>
                    <Table.Cell>
                      <div className="text-sm font-medium text-gray-900">{product.id}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {(() => {
                          const firstImage = product.image1 || product.image2 || product.image3;
                          if (firstImage) {
                            return (
                              <img 
                                src={firstImage} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '';
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Image</div>';
                                }}
                              />
                            );
                          } else {
                            return (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </Table.Cell>
                    <Table.Cell allowWrap={true} className="max-w-xs">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 leading-tight" title={product.name}>
                          {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
                        </div>
                        <div className="text-xs text-gray-500 leading-tight" title={product.description}>
                          {product.description.length > 50 ? `${product.description.substring(0, 50)}...` : product.description}
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded inline-block">
                          {product.type_of_product}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {formatPrice(product.price, product.discount_price)}
                      {product.discount_percentage > 0 && (
                        <div className="text-xs text-orange-600 font-medium">
                          {product.discount_percentage}% OFF
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-700">
                        {Number(product.stock || 0 ).toLocaleString()} pcs
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm font-medium">
                          ⭐ {Number(product.average_rating || 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({product.total_reviews || 0} reviews)
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditProduct(product)}
                          className="p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-sm text-gray-500">
                {searchTerm ? 'No products found matching your search' : 'No products found'}
              </div>
            </div>
          )}
        </Card>

        {/* Pagination Controls - Force Show for Testing */}
        {!loading && (totalPages > 1 || products.length > 0) && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              {/* Mobile pagination */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                {/* Results info */}
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalCount)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalCount}</span>
                  {' '}results
                </p>
                
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                    Show:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {/* Previous button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }

                    // Add ellipsis logic
                    if (totalPages > 7) {
                      if (i === 0 && pageNumber > 1) {
                        return (
                          <React.Fragment key="start-ellipsis">
                            <button
                              onClick={() => handlePageChange(1)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              1
                            </button>
                            {pageNumber > 2 && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                          </React.Fragment>
                        );
                      }
                      
                      if (i === 6 && pageNumber < totalPages) {
                        return (
                          <React.Fragment key="end-ellipsis">
                            {pageNumber < totalPages - 1 && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {totalPages}
                            </button>
                          </React.Fragment>
                        );
                      }
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  {/* Next button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        <EditForm
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          product={selectedProduct}
          onProductUpdate={handleProductUpdate}
          useLocalUpdate={false}
        />
        
        {/* Delete Product Modal */}
        <Delete
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          productId={selectedProductId}
          onDataDelete={handleProductDelete}
        />
        
        {/* Create Product Modal */}
        <Create
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={() => fetchProducts(currentPage, itemsPerPage)}
        />
      </div>
    </Layout>
  );
};

export default Product;