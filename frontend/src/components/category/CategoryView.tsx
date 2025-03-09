// src/components/category/CategoryView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { categoryService, Category } from '../../services/categoryClient';

const CategoryView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch the category
        const response = await categoryService.getById(id);
        setCategory(response.data as Category);
        
        // Fetch child categories
        const allCategoriesResponse = await categoryService.getAll({ parentId: id });
        setChildCategories(allCategoriesResponse.data as Category[]);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch category details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryDetails();
  }, [id]);
  
  const handleDelete = async () => {
    if (!category) return;
    
    if (childCategories.length > 0) {
      alert('Cannot delete a category with subcategories. Please delete or reassign subcategories first.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      try {
        await categoryService.delete(category._id);
        navigate('/management');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading category details...</div>;
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/management')}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Back to Categories
        </button>
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Category not found</div>
        <button
          onClick={() => navigate('/management')}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Back to Categories
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Details</h1>
        <div>
          <Link
            to={`/management/categories/${id}/edit`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Basic Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
              <div className="p-2 border rounded bg-gray-50">{category.name}</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Slug</label>
              <div className="p-2 border rounded bg-gray-50">{category.slug}</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <div className="p-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Level</label>
              <div className="p-2 border rounded bg-gray-50">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Level {category.level}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Additional Information</h3>
            
            {category.parentId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">Parent Category</label>
                <div className="p-2 border rounded bg-gray-50">
                  <Link 
                    to={`/management/categories/${category.parentId}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Parent
                  </Link>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
              <div className="p-2 border rounded bg-gray-50">
                {new Date(category.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
              <div className="p-2 border rounded bg-gray-50">
                {new Date(category.updatedAt).toLocaleString()}
              </div>
            </div>
            
            {category.image && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">Image</label>
                <div className="p-2">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="h-32 w-32 object-cover rounded"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
            <div className="p-2 border rounded bg-gray-50 min-h-24">
              {category.description || 'No description provided.'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Child Categories Section */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-medium mb-4">Subcategories</h3>
        
        {childCategories.length === 0 ? (
          <div className="text-gray-500">No subcategories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {childCategories.map((child) => (
                  <tr key={child._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {child.image && (
                          <img 
                            src={child.image} 
                            alt={child.name} 
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-gray-500">{child.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        child.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {child.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(child.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/management/categories/${child._id}`}
                        className="text-blue-500 hover:text-blue-700 mr-4"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/management/categories/${child._id}/edit`}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryView;