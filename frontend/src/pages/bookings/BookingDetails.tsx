// src/pages/bookings/BookingDetails.tsx
import { FaBox, FaUser, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

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
  status: 'pending' | 'paid' | 'cancelled';
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

interface BookingDetailsProps {
  booking: Booking;
}

const BookingDetails = ({ booking }: BookingDetailsProps) => {
  return (
    <div className="space-y-6">
      {/* Booking ID and Date */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between flex-wrap">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
            <p className="mt-1 text-sm text-gray-900">{booking._id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(booking.updatedAt).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FaUser className="text-gray-400" /> Customer Information
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-600">User ID: {booking.userId}</p>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FaBox className="text-gray-400" /> Items
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {booking.items.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  Total Amount
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  ${booking.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Address */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FaMapMarkerAlt className="text-gray-400" /> Shipping Address
        </h3>
        <div className="mt-2 text-sm text-gray-600">
          <p>{booking.address.street}</p>
          <p>{booking.address.city}, {booking.address.state} {booking.address.zipCode}</p>
          <p>{booking.address.country}</p>
        </div>
      </div>

      {/* Payment Information */}
      {booking.paymentIntentId && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FaCreditCard className="text-gray-400" /> Payment Information
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>Payment ID: {booking.paymentIntentId}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Status badge component (same as in the main Bookings component)
const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = '';
  
  switch (status) {
    case 'pending':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'confirmed':
      colorClass = 'bg-blue-100 text-blue-800';
      break;
    case 'completed':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'cancelled':
      colorClass = 'bg-red-100 text-red-800';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass} uppercase font-semibold`}>
      {status}
    </span>
  );
};

export default BookingDetails;