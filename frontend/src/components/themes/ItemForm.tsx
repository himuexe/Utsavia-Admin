import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  createItem, 
  fetchItemById, 
  updateItem, 
  ItemCreateInput, 
  ItemPrice 
} from '../../services/itemClient';
import { categoryService, Category } from '../../services/categoryClient';
import Spinner from '../common/Spinner';
import { FaPlus, FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import { Button } from '../ui/button';

const ItemForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<ItemCreateInput>({
    name: '',
    description: '',
    prices: [],
    category: '',
    image: '',
    isActive: true
  });

  // Load data for edit mode
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories using categoryService
        const categoriesResponse = await categoryService.getAll();
        
        // Filter categories to include only level 1 categories
        const level1Categories = (categoriesResponse.data as Category[]).filter((category: Category) => category.level === 1);
        
        setCategories(level1Categories);
        
        // If edit mode, load the item data
        if (isEditMode && id) {
          const itemResponse = await fetchItemById(id);
          const item = itemResponse.data;
          
          // Format the data for the form
          setFormData({
            name: item.name,
            description: item.description || '',
            prices: item.prices || [],
            category: typeof item.category === 'string' ? item.category : item.category._id,
            image: item.image || '',
            isActive: item.isActive
          });
          
          // Set image preview if image exists
          if (item.image) {
            setImagePreview(item.image);
          }
        }
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Trigger file input click
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    
    // If in edit mode and there was an existing image, also clear it
    if (isEditMode && formData.image) {
      setFormData(prev => ({ ...prev, image: '' }));
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle price changes
  const handlePriceChange = (index: number, field: keyof ItemPrice, value: string) => {
    const updatedPrices = [...formData.prices];
    
    if (field === 'price') {
      updatedPrices[index][field] = parseFloat(value) || 0;
    } else {
      updatedPrices[index][field] = value;
    }
    
    setFormData(prev => ({ ...prev, prices: updatedPrices }));
  };

  // Add new price entry
  const addPriceEntry = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { city: '', price: 0 }]
    }));
  };

  // Remove price entry
  const removePriceEntry = (index: number) => {
    const updatedPrices = [...formData.prices];
    updatedPrices.splice(index, 1);
    setFormData(prev => ({ ...prev, prices: updatedPrices }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate form
      if (!formData.name || !formData.category || formData.prices.length === 0) {
        setError('Please fill in all required fields (name, category, and at least one price entry).');
        return;
      }
      
      // Validate price entries
      const invalidPrices = formData.prices.some(p => !p.city || p.price <= 0);
      if (invalidPrices) {
        setError('All price entries must have a city name and a price greater than zero.');
        return;
      }
      
      if (isEditMode && id) {
        // Update existing item
        await updateItem(id, formData, imageFile || undefined);
      } else {
        // Create new item
        await createItem(formData, imageFile || undefined);
      }
      
      // Navigate back to items list
      navigate('/themes/items');
    } catch (err) {
      setError('Failed to save item. Please try again.');
      console.error('Error saving item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Item' : 'Create New Item'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {/* Basic Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={String(formData.category)}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select a Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Image
            </label>
            
            <div className="flex items-start">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
              />
              
              {/* Image preview or placeholder */}
              <div className="flex-1 flex flex-col items-center">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Item preview" 
                      className="h-40 w-auto object-contain border rounded p-1" 
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      title="Remove image"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={handleImageClick}
                    className="h-40 w-full flex flex-col items-center justify-center border border-dashed rounded p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <FaImage size={40} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                  </div>
                )}
                
                {!imagePreview && (
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded flex items-center text-sm"
                  >
                    <FaUpload className="mr-1" /> Upload Image
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Active Item
            </label>
          </div>
        </div>
        
        {/* Price Information */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Price Information <span className="text-red-500">*</span>
            </h2>
            <Button
              type="button"
              onClick={addPriceEntry}
              className=" text-white py-1 px-3 rounded flex items-center text-sm"
            >
              <FaPlus className="mr-1" /> Add Price
            </Button>
          </div>
          
          {formData.prices.length === 0 ? (
            <div className="text-gray-500 text-center py-4 border border-dashed rounded">
              No price entries yet. Click "Add Price" to add pricing for different cities.
            </div>
          ) : (
            <div className="space-y-3">
              {formData.prices.map((price, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      value={price.city}
                      onChange={(e) => handlePriceChange(index, 'city', e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                      placeholder="City name"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                    <input
                      type="number"
                      value={price.price}
                      onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-2 border rounded"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removePriceEntry(index)}
                      className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                      title="Remove"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Form Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/themes/items')}
            className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
            disabled={submitting}
          >
            Cancel
          </button>
          <Button
            type="submit"
            className=" text-white py-2 px-4 rounded"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;