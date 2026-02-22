import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import api, { API_BASE_URL } from '../../services/auth';
import { X, Plus } from 'lucide-react';

const Edit = ({ isOpen, onClose, product, onProductUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const FetchCategory = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/shop/categories/');
      
      // Handle different possible response structures
      let categoriesData = response.data;
      if (response.data && response.data.results) {
        // If the response is paginated
        categoriesData = response.data.results;
      } else if (response.data && response.data.data) {
        // If the response is wrapped in a data property
        categoriesData = response.data.data;
      }
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      return categoriesData;
    } catch (error) {
      setCategories([]);
      return [];
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      FetchCategory();
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    description: '',
    image1: '',
    image2: '',
    image3: '',
    price: '',
    stock: '0',
    discount_price: '',
    type_of_product: '',
    is_active: true,
  });
  const [imageFiles, setImageFiles] = useState({
    image1: null,
    image2: null,
    image3: null,
  });
  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update form data when product changes
  useEffect(() => {
    if (product && categories.length > 0) {
      
      // Find the correct category ID by matching with categories data
      let categoryValue = '';
      
      if (product.category) {
        // Handle case where product.category might be an object
        let categoryToMatch = product.category;
        if (typeof product.category === 'object' && product.category !== null) {
          // If category is an object, extract the ID
          categoryToMatch = product.category.id || product.category._id || product.category;
        }
        
        // First try to find by exact ID match
        const categoryMatch = categories.find(cat => 
          (cat.id && cat.id.toString() === categoryToMatch.toString()) ||
          (cat._id && cat._id.toString() === categoryToMatch.toString())
        );
        
        if (categoryMatch) {
          categoryValue = categoryMatch.id || categoryMatch._id;
        } else {
          // If no ID match, try to find by name (in case product.category is a name or object with name)
          let categoryName = categoryToMatch;
          if (typeof product.category === 'object' && product.category !== null) {
            categoryName = product.category.name || product.category.title || product.category.category_name || categoryToMatch;
          }
          
          const nameMatch = categories.find(cat => 
            cat.name === categoryName || 
            cat.title === categoryName || 
            cat.category_name === categoryName
          );
          
          if (nameMatch) {
            categoryValue = nameMatch.id || nameMatch._id;
          } else {
            // As fallback, use the extracted category value as is
            categoryValue = categoryToMatch;
          }
        }
      }
      
      
      setFormData({
        category: categoryValue,
        name: product.name || '',
        description: product.description || '',
        image1: product.image1 || '',
        image2: product.image2 || '',
        image3: product.image3 || '',
        price: product.price || '',
        stock: product.stock || '0',
        discount_price: product.discount_price || '',
        type_of_product: product.type_of_product || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
      
      // Set existing image previews
      setImagePreviews({
        image1: product.image1 || null,
        image2: product.image2 || null,
        image3: product.image3 || null,
      });
      
      // Reset image files since we're editing existing images
      setImageFiles({
        image1: null,
        image2: null,
        image3: null,
      });
    }
  }, [product, categories]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent negative values for price fields
    if ((name === 'price' || name === 'discount_price') && parseFloat(value) < 0) {
      return; // Don't update state with negative values
    }
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };
      
      // Validate discount price is not greater than price
      if (name === 'discount_price' || name === 'price') {
        const price = parseFloat(name === 'price' ? value : prev.price);
        const discountPrice = parseFloat(name === 'discount_price' ? value : prev.discount_price);
        
        if (!isNaN(price) && !isNaN(discountPrice) && discountPrice > price) {
          setError('Discount price must not be greater than the regular price');
        } else if (error && error.includes('Discount price must not be greater than')) {
          setError(null); // Clear the error if validation passes
        }
      }
      
      return newFormData;
    });
  };

  const handleImageChange = (e, imageField) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFiles(prev => ({
        ...prev,
        [imageField]: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({
          ...prev,
          [imageField]: reader.result
        }));
      };
      reader.readAsDataURL(file);

      // Clear any previous error
      setError(null);
    }
  };

  const handleRemoveImage = (imageField) => {
    setImageFiles(prev => ({
      ...prev,
      [imageField]: null
    }));
    setImagePreviews(prev => ({
      ...prev,
      [imageField]: null
    }));
    
    // Also clear the form data for this image field
    setFormData(prev => ({
      ...prev,
      [imageField]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    try {
      setLoading(true);
      setError(null);

      // Validate discount price is not greater than price before submission
      const price = parseFloat(formData.price);
      const discountPrice = parseFloat(formData.discount_price);
      
      if (!isNaN(price) && !isNaN(discountPrice) && discountPrice > price) {
        setError('Discount price must not be greater than the regular price');
        setLoading(false);
        return;
      }

      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('category', formData.category || '');
      formDataToSend.append('price', formData.price || '');
      formDataToSend.append('stock', formData.stock || '0');
      formDataToSend.append('discount_price', formData.discount_price || '');
      formDataToSend.append('type_of_product', formData.type_of_product || '');
      formDataToSend.append('is_active', formData.is_active);
      
      // Add image files only if new files are selected
      if (imageFiles.image1) {
        formDataToSend.append('image1', imageFiles.image1);
      }
      if (imageFiles.image2) {
        formDataToSend.append('image2', imageFiles.image2);
      }
      if (imageFiles.image3) {
        formDataToSend.append('image3', imageFiles.image3);
      }

      const response = await api.patch(`shop/products/${product.id}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      const updatedProduct = response.data;
      
      // Call the callback to update the parent component
      if (onProductUpdate) {
        onProductUpdate(updatedProduct);
      }
      
      onClose();
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (errorData.name && Array.isArray(errorData.name)) {
          setError(`Name validation error: ${errorData.name.join(', ')}`);
          return;
        }
        
        if (errorData.description && Array.isArray(errorData.description)) {
          setError(`Description validation error: ${errorData.description.join(', ')}`);
          return;
        }
        
        // Handle other field validation errors
        const validationErrors = [];
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            validationErrors.push(`${field}: ${errorData[field].join(', ')}`);
          }
        });
        
        if (validationErrors.length > 0) {
          setError(`Validation errors: ${validationErrors.join('; ')}`);
          return;
        }
        
        setError(errorData.message || errorData.detail || 'Failed to update Product');
      } else {
        setError(error.message || 'Failed to update Product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    // Reset form when closing without saving
    if (product && categories.length > 0) {
      // Find the correct category ID by matching with categories data
      let categoryValue = '';
      
      if (product.category) {
        // Handle case where product.category might be an object
        let categoryToMatch = product.category;
        if (typeof product.category === 'object' && product.category !== null) {
          // If category is an object, extract the ID
          categoryToMatch = product.category.id || product.category._id || product.category;
        }
        
        // First try to find by exact ID match
        const categoryMatch = categories.find(cat => 
          (cat.id && cat.id.toString() === categoryToMatch.toString()) ||
          (cat._id && cat._id.toString() === categoryToMatch.toString())
        );
        
        if (categoryMatch) {
          categoryValue = categoryMatch.id || categoryMatch._id;
        } else {
          // If no ID match, try to find by name (in case product.category is a name or object with name)
          let categoryName = categoryToMatch;
          if (typeof product.category === 'object' && product.category !== null) {
            categoryName = product.category.name || product.category.title || product.category.category_name || categoryToMatch;
          }
          
          const nameMatch = categories.find(cat => 
            cat.name === categoryName || 
            cat.title === categoryName || 
            cat.category_name === categoryName
          );
          
          if (nameMatch) {
            categoryValue = nameMatch.id || nameMatch._id;
          } else {
            // As fallback, use the extracted category value as is
            categoryValue = categoryToMatch;
          }
        }
      }
      
      setFormData({
        category: categoryValue,
        name: product.name || '',
        description: product.description || '',
        image1: product.image1 || '',
        image2: product.image2 || '',
        image3: product.image3 || '',
        price: product.price || '',
        stock: product.stock || '0',
        discount_price: product.discount_price || '',
        type_of_product: product.type_of_product || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
      
      setImagePreviews({
        image1: product.image1 || null,
        image2: product.image2 || null,
        image3: product.image3 || null,
      });
      
      setImageFiles({
        image1: null,
        image2: null,
        image3: null,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900">Edit Product</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Product name"
                required
                
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Select Category
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? 'Loading categories...' : 'Select a category'}
                </option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id || category._id} value={category.id || category._id}>
                    {category.name || category.title || category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description of Product
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description..."
                rows="3"
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Product Price
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="$ 00.0"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                required
                min="0"
                step="1"
              />
            </div>
            <div>
              <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price
              </label>
              <input
                type="number"
                id="discount_price"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="$ 00.0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="type_of_product" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Product
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                id="type_of_product"
                name="type_of_product"
                value={formData.type_of_product}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter type of product"
                
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Product is Active
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Active products are visible to customers
              </p>
            </div>
            {/* Image Upload Fields */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Product Images</h4>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Image 1 */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image 1
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'image1')}
                      className="hidden"
                      id="image1-upload"
                    />
                    {imagePreviews.image1 ? (
                      <div className="relative">
                        <img
                          src={imagePreviews.image1}
                          alt="Preview 1"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('image1')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="image1-upload"
                        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-8 h-8 text-gray-400 hover:text-blue-500" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Image 2 */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image 2
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'image2')}
                      className="hidden"
                      id="image2-upload"
                    />
                    {imagePreviews.image2 ? (
                      <div className="relative">
                        <img
                          src={imagePreviews.image2}
                          alt="Preview 2"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('image2')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="image2-upload"
                        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-8 h-8 text-gray-400 hover:text-blue-500" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Image 3 */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image 3
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'image3')}
                      className="hidden"
                      id="image3-upload"
                    />
                    {imagePreviews.image3 ? (
                      <div className="relative">
                        <img
                          src={imagePreviews.image3}
                          alt="Preview 3"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('image3')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="image3-upload"
                        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-8 h-8 text-gray-400 hover:text-blue-500" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            
          </div>
          
          <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;