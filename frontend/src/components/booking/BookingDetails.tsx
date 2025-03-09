import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi, Booking } from '../../services/bookingClient';
import { format } from 'date-fns';

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await bookingApi.getBookingById(id);
        setBooking(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch booking details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !booking) return;
    
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingApi.deleteBooking(id);
        navigate('/bookings');
      } catch (err) {
        setError('Failed to delete booking. Please try again.');
        console.error(err);
      }
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  const renderStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const statusClass = statusClasses[status] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded shadow text-center">
          Loading booking details...
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Booking not found'}
        </div>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => navigate('/bookings')}
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <div className="flex space-x-2">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => navigate('/bookings')}
          >
            Back to Bookings
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate(`/bookings/edit/${id}`)}
          >
            Edit Booking
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete Booking
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        {/* Booking Summary */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Booking #{booking._id.substring(0, 8)}</h2>
            {renderStatusBadge(booking.status)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created On</p>
              <p className="font-medium">{formatDate(booking.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">₹{booking.totalAmount.toFixed(2)}</p>
            </div>
            {booking.paymentIntentId && (
              <div>
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="font-medium">{booking.paymentIntentId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{booking.userId?.firstName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{booking.userId?.primaryEmail || 'No email'}</p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-3">Address</h3>
          {booking.address ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Street</p>
                <p className="font-medium">{booking.address.street}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{booking.address.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="font-medium">{booking.address.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Zip Code</p>
                <p className="font-medium">{booking.address.zipCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium">{booking.address.country}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No address information available</p>
          )}
        </div>

        {/* Items */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-3">Booking Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {booking.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(item.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.timeSlot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;