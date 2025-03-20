import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchItems, deactivateItem, deleteItem, Item } from '../services/itemClient';
import { categoryService, Category } from '../services/categoryClient';
import { vendorClient as vendorService , VendorData} from '../services/vendorClient'; 
import Spinner from '../components/common/Spinner';
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
import { formatDate } from '../utils/formatters';

const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]); // State for vendors

  // Sorting and filtering states
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterVendor, setFilterVendor] = useState<string>(''); // Vendor filter
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load items, categories, and vendors
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load categories
        const categoriesResponse = await categoryService.getAll();
        setCategories(categoriesResponse.data as Category[]);

        // Load vendors
        const vendorsResponse = await vendorService.getAllVendors();
        setVendors(vendorsResponse.data as VendorData[]);

        // Load items
        await loadItems();
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load items with current filters and sorting
  const loadItems = async () => {
    try {
      const params: any = {
        sortBy: sortField,
        sortOrder: sortOrder,
      };

      if (filterCategory) {
        params.category = filterCategory;
      }

      if (filterStatus) {
        params.isActive = filterStatus === 'active';
      }

      if (filterVendor) {
        params.vendor = filterVendor; // Add vendor filter
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await fetchItems(params);
      setItems(response.data);
    } catch (err) {
      setError('Failed to load items. Please try again.');
      console.error('Error loading items:', err);
    }
  };

  // Apply filters and sorting
  const applyFilters = () => {
    loadItems();
  };

  // Reset all filters
  const resetFilters = () => {
    setSortField('createdAt');
    setSortOrder('desc');
    setFilterCategory('');
    setFilterStatus('');
    setFilterVendor('');
    setSearchTerm('');

    // Load items with reset filters
    setTimeout(() => {
      loadItems();
    }, 0);
  };

  // Handle item deactivation
  const handleDeactivate = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this item?')) {
      try {
        await deactivateItem(id);
        loadItems();
      } catch (err) {
        setError('Failed to deactivate item. Please try again.');
        console.error('Error deactivating item:', err);
      }
    }
  };

  // Handle item deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      try {
        await deleteItem(id);
        loadItems();
      } catch (err) {
        setError('Failed to delete item. Please try again.');
        console.error('Error deleting item:', err);
      }
    }
  };

  // Format category name
  const getCategoryName = (item: Item) => {
    if (!item.category) return 'N/A';
    return typeof item.category === 'string' ? item.category : item.category.name;
  };

  // Format vendor name
  const getVendorName = (item: Item) => {
    if (!item.vendor) return 'Admin';
    return typeof item.vendor === 'string' ? item.vendor : item.vendor.name;
  };

  // Format price display
  const formatPrices = (prices: { city: string; price: number }[]) => {
    if (!prices || prices.length === 0) return 'No prices';
    return prices.map((p) => `${p.city}: ₹${p.price}`).join(', ');
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Items Management</h1>
        <Link
          to="/themes/items/new"
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Item
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Filters & Sorting</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={resetFilters}
            className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Reset
          </button>
          <button
            onClick={applyFilters}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Items Table */}
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No items found. Try adjusting your filters or add a new item.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">Category</th>
                <th className="py-3 px-4 border-b text-left">Vendor</th>
                <th className="py-3 px-4 border-b text-left">Prices</th>
                <th className="py-3 px-4 border-b text-left">Status</th>
                <th className="py-3 px-4 border-b text-left">Created At</th>
                <th className="py-3 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className={!item.isActive ? 'bg-gray-50' : ''}>
                  <td className="py-3 px-4 border-b">
                    <div className="flex items-center">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b">{getCategoryName(item)}</td>
                  <td className="py-3 px-4 border-b">{getVendorName(item)}</td>
                  <td className="py-3 px-4 border-b">{formatPrices(item.prices)}</td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">{formatDate(item.createdAt)}</td>
                  <td className="py-3 px-4 border-b text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/themes/items/${item._id}`}
                        className="text-blue-500 hover:text-blue-700"
                        title="View"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/themes/items/${item._id}/edit`}
                        className="text-yellow-500 hover:text-yellow-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      {item.isActive ? (
                        <button
                          onClick={() => handleDeactivate(item._id)}
                          className="text-orange-500 hover:text-orange-700"
                          title="Deactivate"
                        >
                          <FaTrash />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Permanently"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Items;