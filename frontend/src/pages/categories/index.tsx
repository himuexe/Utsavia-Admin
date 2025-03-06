// src/pages/categories/index.tsx
import { useState, useEffect } from 'react';
import { categoriesApi } from '../../services/categoryApi';
import { ICategory, CategoryFormData } from '../../types/category';
import CategoryList from '../../components/categories/CategoryList';
import CategoryForm from '../../components/categories/CategoryForm';
import DeleteConfirmation from '../../components/categories/DeleteConfirmation';
import { toast } from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (category: ICategory) => {
    setCategoryToDelete(category);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await categoriesApi.delete(categoryToDelete._id);
      setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error('Failed to delete category');
    } finally {
      setShowDeleteConfirmation(false);
      setCategoryToDelete(null);
    }
  };

  const handleSubmit = async (formData: CategoryFormData) => {
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = await categoriesApi.update(editingCategory._id, formData);
        setCategories(categories.map(cat => 
          cat._id === editingCategory._id ? updatedCategory : cat
        ));
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const newCategory = await categoriesApi.create(formData);
        setCategories([...categories, newCategory]);
        toast.success('Category created successfully');
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch (err) {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>
        <button 
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add New Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-500">
          {error}
        </div>
      ) : (
        <CategoryList 
          categories={categories} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <CategoryForm 
              initialData={editingCategory || undefined}
              allCategories={categories}
              onSubmit={handleSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <DeleteConfirmation
          categoryName={categoryToDelete?.name || ''}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
    </div>
  );
};

export default Categories;