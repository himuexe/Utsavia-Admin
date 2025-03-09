import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi, Booking, BookingItem, Address } from '../../services/bookingClient';

interface BookingFormData {
  userId: string;
  items: BookingItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentIntentId?: string;
  address: Address;
}

const initialItemState: BookingItem = {
  itemName: '',
  price: 0,
  date: new Date(),
  timeSlot: ''
};

const initialAddressState: Address = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  isPrimary: false
};

const initialFormState: BookingFormData = {
  userId: '', // This will be set directly
  items: [{ ...initialItemState }],
  totalAmount: 0,
  status: 'pending',
  address: { ...initialAddressState }
};

const BookingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState<BookingFormData>(initialFormState);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking data for edit mode
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!isEditMode || !id) return;
      
      try {
        setLoading(true);
        const bookingData = await bookingApi.getBookingById(id);
        
        // Transform the response to match the form structure
        setFormData({
          userId: bookingData.userId._id, // Set userId directly from the fetched data
          items: bookingData.items.map(item => ({
            itemName: item.itemName,
            price: item.price,
            date: new Date(item.date),
            timeSlot: item.timeSlot
          })),
          totalAmount: bookingData.totalAmount,
          status: bookingData.status,
          paymentIntentId: bookingData.paymentIntentId,
          address: bookingData.address
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch booking data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [id, isEditMode]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        await bookingApi.updateBooking(id, formData);
      } else {
        await bookingApi.createBooking(formData);
      }
      
      navigate('/bookings');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} booking. Please try again.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle change in form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle change in address fields
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  // Handle change in item fields
  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedItems = [...prev.items];
      
      // Handle date separately
      if (name === 'date') {
        updatedItems[index] = {
          ...updatedItems[index],
          [name]: new Date(value)
        };
      } else if (name === 'price') {
        updatedItems[index] = {
          ...updatedItems[index],
          [name]: parseFloat(value)
        };
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          [name]: value
        };
      }
      
      // Recalculate total amount
      const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotalAmount
      };
    });
  };

  // Add new item
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...initialItemState }]
    }));
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotalAmount
      };
    });
  };

  if (loading && isEditMode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded shadow text-center">
          Loading booking data...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Booking' : 'Create New Booking'}</h1>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => navigate('/bookings')}
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6">
        {/* Booking Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Booking Status</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID (Optional)</label>
            <input
              type="text"
              name="paymentIntentId"
              value={formData.paymentIntentId || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter payment ID"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input
                type="text"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={handleAddressChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.address.country}
                onChange={handleAddressChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPrimary"
                checked={formData.address.isPrimary || false}
                onChange={(e) => handleAddressChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: 'isPrimary',
                    value: e.target.checked
                  }
                } as any)}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Primary Address</label>
            </div>
          </div>
        </div>

        {/* Booking Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Booking Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Add Item
            </button>
          </div>
          
          {formData.items.map((item, index) => (
            <div key={index} className="p-4 border rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Item #{index + 1}</h3>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={item.date instanceof Date ? item.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    name="timeSlot"
                    value={item.timeSlot}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g. 10:00 AM - 11:00 AM"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 text-right">
            <p className="text-lg font-semibold">
              Total Amount: ₹{formData.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Booking' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingFormPage;