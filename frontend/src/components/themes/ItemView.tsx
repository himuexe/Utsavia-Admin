// src/components/item/ItemView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemById, deactivateItem, deleteItem } from '../../services/itemClient';
import Spinner from '../common/Spinner';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';

const ItemView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const response = await fetchItemById(id);
        setItem(response.data);
      } catch (err) {
        setError('Failed to load item details. Please try again.');
        console.error('Error loading item:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadItem();
  }, [id]);

  // Handle item deactivation
  const handleDeactivate = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to deactivate this item?')) {
      try {
        await deactivateItem(id);
        // Refresh item data
        const response = await fetchItemById(id);
        setItem(response.data);
      } catch (err) {
        setError('Failed to deactivate item. Please try again.');
        console.error('Error deactivating item:', err);
      }
    }
  };

  // Handle item deletion
  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      try {
        await deleteItem(id);
        // Navigate back to items list
        navigate('/themes/items');
      } catch (err) {
        setError('Failed to delete item. Please try again.');
        console.error('Error deleting item:', err);
      }
    }
  };

  // Get category name
  const getCategoryName = () => {
    if (!item || !item.category) return 'N/A';
    return typeof item.category === 'string' ? item.category : item.category.name;
  };
  const getVendorName = () => {
    if (!item || !item.vendor) return 'Admin';
    return typeof item.vendor === 'string' ? item.category : item.vendor.name;
  };

  if (loading) {
    return <Spinner />;
  }

  if (!item) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Item not found'}
        </div>
        <div className="mt-4">
          <Link to="/themes/items" className="text-blue-500 hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <Link to="/themes/items" className="text-blue-500 hover:underline flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Items
        </Link>
        <div className="space-x-2">
          <Link
            to={`/themes/items/${id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-700 text-white py-2 px-4 rounded inline-flex items-center"
          >
            <FaEdit className="mr-2" /> Edit
          </Link>
          {item.isActive ? (
            <button
              onClick={handleDeactivate}
              className="bg-orange-500 hover:bg-orange-700 text-white py-2 px-4 rounded inline-flex items-center"
            >
              <FaTrash className="mr-2" /> Deactivate
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded inline-flex items-center"
            >
              <FaTrash className="mr-2" /> Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Item Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                item.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-gray-500 mt-2">Category: {getCategoryName()}</p>
          <p className="text-gray-500 mt-2">Vendor: {getVendorName()}</p>
        </div>

        {/* Item Image */}
        {item.image && (
          <div className="border-b">
            <img
              src={item.image}
              alt={item.name}
              className="w-full max-h-64 object-cover"
            />
          </div>
        )}

        {/* Item Details */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">
              {item.description || 'No description available.'}
            </p>
          </div>

          {/* Prices */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Prices</h2>
            {item.prices && item.prices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.prices.map((price: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded">
                    <p className="font-medium">{price.city}</p>
                    <p className="text-green-600 text-lg">₹{price.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No price information available.</p>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 mt-6 text-sm text-gray-500">
            <p>Created: {formatDate(item.createdAt)}</p>
            <p>Last Updated: {formatDate(item.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemView;