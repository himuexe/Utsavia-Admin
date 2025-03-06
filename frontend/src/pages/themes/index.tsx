// src/pages/themes/index.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ICategory } from '../../types/category';
import CategoryModal from './CategoryModal';
import { toast } from 'react-hot-toast';
import { categoriesApi } from '../../services/categoryApi';

const ThemesPage = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  

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


  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category._id.toString()}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <Link
                to={`/items?category=${category._id}`}
                className="text-lg font-semibold text-gray-800 hover:text-blue-600"
              >
                {category.name}
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsModalOpen(true);
                  }}
                  className="text-gray-600 hover:text-blue-600"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(category._id.toString())}
                  className="text-gray-600 hover:text-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>
            {category.description && (
              <p className="text-gray-600 mt-2 text-sm">{category.description}</p>
            )}
            <div className="mt-2 flex items-center justify-between text-sm">
              <span
                className={`px-2 py-1 rounded ${
                  category.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-gray-500">Level: {category.level}</span>
            </div>
          </div>
        ))}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
};

export default ThemesPage;
