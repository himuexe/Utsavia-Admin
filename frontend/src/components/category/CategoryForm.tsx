// src/components/category/CategoryForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { categoryService, Category } from '../../services/categoryClient';

const CategoryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view');
  const isEditMode = id && !isViewMode;
  
  const [category, setCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    parentId: '',
    isActive: true,
    image: ''
  });
  
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Fetch parent categories for the dropdown
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await categoryService.getAll({ isActive: true });
        // Filter out the current category if in edit mode
        const filteredCategories = (response.data as Category[]).filter(
          cat => !id || cat._id !== id
        );
        setParentCategories(filteredCategories);
      } catch (err) {
        console.error('Failed to fetch parent categories', err);
      }
    };
    
    fetchParentCategories();
  }, [id]);
  
  // Fetch category data if in edit or view mode
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await categoryService.getById(id);
        setCategory(response.data as Category);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch category');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategory(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCategory(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category.name) {
      setError('Name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // If parentId is empty string, set it to null
      const categoryData = {
        ...category,
        parentId: category.parentId === '' ? undefined : category.parentId
      };
      
      if (isEditMode) {
        await categoryService.update(id!, categoryData);
        setSuccess('Category updated successfully');
      } else {
        await categoryService.create(categoryData);
        setSuccess('Category created successfully');
        
        // Reset the form after successful creation
        if (!isEditMode) {
          setCategory({
            name: '',
            description: '',
            parentId: '',
            isActive: true,
            image: ''
          });
        }
      }
      
      // Navigate back to categories list after a short delay
      setTimeout(() => {
        navigate('/management');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && (isEditMode || isViewMode)) {
    return <div className="text-center py-8">Loading category data...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isViewMode ? 'Category Details' : isEditMode ? 'Edit Category' : 'Create New Category'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white p-6 rounded shadow">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={category.name || ''}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="Category name"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Parent Category</label>
              <select
                name="parentId"
                value={category.parentId || ''}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full p-2 border rounded"
              >
                <option value="">None (Root Category)</option>
                {parentCategories.map(parent => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={category.description || ''}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="Category description"
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                name="image"
                value={category.image || ''}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="Image URL"
                className="w-full p-2 border rounded"
              />
              {category.image && (
                <div className="mt-2">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="h-24 w-24 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={category.isActive === true}
                onChange={handleCheckboxChange}
                disabled={isViewMode}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>
            
            {isViewMode && category.level !== undefined && (
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <div className="p-2 border rounded bg-gray-50">
                  {category.level}
                </div>
              </div>
            )}
            
            {isViewMode && category.slug && (
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <div className="p-2 border rounded bg-gray-50">
                  {category.slug}
                </div>
              </div>
            )}
            
            {isViewMode && category.createdAt && (
              <div>
                <label className="block text-sm font-medium mb-1">Created At</label>
                <div className="p-2 border rounded bg-gray-50">
                  {new Date(category.createdAt).toLocaleString()}
                </div>
              </div>
            )}
            
            {isViewMode && category.updatedAt && (
              <div>
                <label className="block text-sm font-medium mb-1">Updated At</label>
                <div className="p-2 border rounded bg-gray-50">
                  {new Date(category.updatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/management')}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mr-2"
            >
              {isViewMode ? 'Back' : 'Cancel'}
            </button>
            
            {!isViewMode && (
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
              </button>
            )}
            
            {isViewMode && (
              <button
                type="button"
                onClick={() => navigate(`/management/categories/${id}/edit`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;