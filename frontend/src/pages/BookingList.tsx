import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi, Booking, BookingFilters } from '../services/bookingClient';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input'; // shadcn Input component
import { Button } from '@/components/ui/button'; // shadcn Button component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // shadcn Card component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // shadcn Table component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // shadcn Select component

const BookingListPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const statusOptions = ['all', 'pending', 'confirmed', 'cancelled'];
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getBookings(filters);

      if (response && response.bookings && response.pagination) {
        setBookings(response.bookings);
        setTotalBookings(response.pagination.total);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
        setError(null);
      } else {
        setBookings([]);
        setError('No data received from server');
      }
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: name === 'page' ? value : 1
    }));
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortField: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Delete booking handler
  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingApi.deleteBooking(id);
        fetchBookings(); // Refresh bookings list
      } catch (err) {
        setError('Failed to delete booking. Please try again.');
        console.error(err);
      }
    }
  };

  // Effect to fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [filters]);

  // Format date for display
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  // Render status badge
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Date range filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            
            {/* Amount range filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
              <Input
                type="number"
                value={filters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
              <Input
                type="number"
                value={filters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search city, street, item..."
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              className="mr-2"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
            <Button
              onClick={fetchBookings}
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Bookings table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading bookings...</div>
          ) : !bookings || bookings.length === 0 ? (
            <div className="p-8 text-center">No bookings found. Try adjusting your filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('createdAt')}
                  >
                    <div className="flex items-center">
                      Date
                      {filters.sortField === 'createdAt' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('totalAmount')}
                  >
                    <div className="flex items-center">
                      Amount
                      {filters.sortField === 'totalAmount' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {filters.sortField === 'status' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Vendors</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id} className="hover:bg-gray-50">
                    <TableCell className="whitespace-nowrap">
                      {formatDate(booking.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.userId?.firstName || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{booking.userId?.primaryEmail || 'No email'}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      ₹{booking.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell>
                      {booking.items && booking.items.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.itemName} - ₹{item.price.toFixed(2)}
                          <div className="text-xs text-gray-500">
                            {format(new Date(item.date), 'MMM dd, yyyy')} | {item.timeSlot}
                          </div>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {booking.address ? (
                        <>
                          <div className="font-medium">
                            {booking.address.street}, {booking.address.city}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.address.state}, {booking.address.zipCode}, {booking.address.country}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">No address provided</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {booking.items && booking.items.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.vendorName} 
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => navigate(`/bookings/${booking._id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="ghost"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteBooking(booking._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {!loading && bookings && bookings.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * filters.limit! + 1}</span> to <span className="font-medium">{Math.min(currentPage * filters.limit!, totalBookings)}</span> of <span className="font-medium">{totalBookings}</span> bookings
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handleFilterChange('page', currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('page', pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handleFilterChange('page', currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingListPage;