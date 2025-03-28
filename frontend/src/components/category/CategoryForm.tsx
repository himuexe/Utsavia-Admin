import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { categoryService, Category } from '../../services/categoryClient';
import { Button } from '../ui/button';

const CategoryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view');
  const isEditMode = id && !isViewMode;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    parentId: '',
    isActive: true,
    image: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch parent categories for the dropdown (only level 0 categories)
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await categoryService.getAll({ isActive: true });
        // Filter only level 0 categories (root-level)
        const rootCategories = (response.data as Category[]).filter(
          (cat) => cat.level === 0
        );
        setParentCategories(rootCategories);
      } catch (err) {
        console.error('Failed to fetch parent categories', err);
      }
    };

    fetchParentCategories();
  }, []);

  // Fetch category data if in edit or view mode
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await categoryService.getById(id);
        const categoryData = response.data as Category;
        setCategory(categoryData);
        
        if (categoryData.image) {
          setImagePreview(categoryData.image);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCategory((prev) => ({ ...prev, [name]: checked }));
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
      // Prepare the payload for the API call
      const categoryData: Partial<Category> = {
        name: category.name,
        description: category.description,
        isActive: category.isActive,
      };

      // Only include parentId when adding a new category
      if (!isEditMode) {
        categoryData.parentId = category.parentId === '' ? undefined : category.parentId;
      }

      if (isEditMode) {
        // Update existing category
        await categoryService.update(id!, categoryData, selectedFile || undefined);
        setSuccess('Category updated successfully');
      } else {
        // Create new category
        await categoryService.create(categoryData, selectedFile || undefined);
        setSuccess('Category created successfully');

        // Reset the form after successful creation
        setCategory({
          name: '',
          description: '',
          parentId: '',
          isActive: true,
          image: '',
        });
        setSelectedFile(null);
        setImagePreview(null);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
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

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {success && <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>}

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

            {/* Conditionally render Parent ID dropdown only in add mode */}
            {!isEditMode && (
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
                  {parentCategories.map((parent) => (
                    <option key={parent._id} value={parent._id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              <label className="block text-sm font-medium mb-1">Category Image</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isViewMode}
                accept="image/*"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, JPEG, PNG, GIF. Max size: 5MB
              </p>
              
              {/* Image preview */}
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt={category.name || 'Category preview'}
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
              <Button
                type="submit"
                disabled={loading}
                className=" text-white px-4 py-2 rounded"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;