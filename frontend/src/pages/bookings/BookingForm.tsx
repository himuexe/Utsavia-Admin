// src/pages/bookings/BookingForm.tsx
import { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

interface BookingItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Booking {
  _id: string;
  userId: string;
  items: BookingItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentIntentId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BookingFormProps {
  booking?: Booking;
  onSubmit: (booking: Booking) => void;
  onCancel: () => void;
}

const BookingForm = ({ booking, onSubmit, onCancel }: BookingFormProps) => {
  const [formData, setFormData] = useState<Booking>({
    _id: booking?._id || '',
    userId: booking?.userId || '',
    items: booking?.items || [],
    totalAmount: booking?.totalAmount || 0,
    status: booking?.status || 'pending',
    paymentIntentId: booking?.paymentIntentId || '',
    address: {
      street: booking?.address.street || '',
      city: booking?.address.city || '',
      state: booking?.address.state || '',
      zipCode: booking?.address.zipCode || '',
      country: booking?.address.country || '',
    },
    createdAt: booking?.createdAt || '',
    updatedAt: booking?.updatedAt || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [name]: value,
      },
    });
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value,
    };
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { _id: '', name: '', quantity: 0, price: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
          User ID
        </label>
        <input
          type="text"
          name="userId"
          id="userId"
          value={formData.userId}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
          Total Amount
        </label>
        <input
          type="number"
          name="totalAmount"
          id="totalAmount"
          value={formData.totalAmount}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <div className="mt-1 space-y-2">
          <input
            type="text"
            name="street"
            value={formData.address.street}
            onChange={handleAddressChange}
            placeholder="Street"
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          <input
            type="text"
            name="city"
            value={formData.address.city}
            onChange={handleAddressChange}
            placeholder="City"
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          <input
            type="text"
            name="state"
            value={formData.address.state}
            onChange={handleAddressChange}
            placeholder="State"
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          <input
            type="text"
            name="zipCode"
            value={formData.address.zipCode}
            onChange={handleAddressChange}
            placeholder="Zip Code"
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          <input
            type="text"
            name="country"
            value={formData.address.country}
            onChange={handleAddressChange}
            placeholder="Country"
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Items</label>
        {formData.items.map((item, index) => (
          <div key={index} className="mt-2 space-y-2">
            <input
              type="text"
              name="name"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Item Name"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
            <input
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Quantity"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
            <input
              type="number"
              name="price"
              value={item.price}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Price"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="text-red-600 hover:text-red-900"
            >
              Remove Item
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Item
        </button>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaTimes className="inline-block mr-2" /> Cancel
        </button>
        <button
          type="submit"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaSave className="inline-block mr-2" /> Save
        </button>
      </div>
    </form>
  );
};

export default BookingForm;