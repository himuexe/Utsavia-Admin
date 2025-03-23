import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorClient, VendorData, VendorFilters } from '../services/vendorClient';
import { Button } from '@/components/ui/button';

const VendorListPage: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const cityOptions = ['All','Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Jaipur', 'Hyderabad', 'Pune', 'Across India','Indore','Lucknow','Chandigarh','Ahmedabad'];
  
  const [filters, setFilters] = useState<VendorFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch vendors
  const fetchVendors = async () => {
    try {   
      setLoading(true);
      const response = await vendorClient.getAllVendors(filters);

      if (response && response.data) {
        setVendors(response.data);
        setError(null);
      } else {
        setVendors([]);
        setError('No data received from server');
      }
    } catch (err) {
      setError('Failed to fetch vendors. Please try again.');
      console.error(err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value === 'All' ? undefined : value
    }));
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  // Toggle vendor active status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await vendorClient.toggleVendorStatus(id, !currentStatus);
      fetchVendors(); // Refresh vendors list
    } catch (err) {
      setError('Failed to update vendor status. Please try again.');
      console.error(err);
    }
  };


  // Delete vendor handler
  const handleDeleteVendor = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      try {
        await vendorClient.deleteVendor(id);
        fetchVendors(); // Refresh vendors list
      } catch (err) {
        setError('Failed to delete vendor. Please try again.');
        console.error(err);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: Date | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Effect to fetch vendors when filters change
  useEffect(() => {
    fetchVendors();
  }, [filters]);

  // Render status badge
  const renderStatusBadge = (isActive: boolean | undefined) => {
    const statusClass = isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Management</h1>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={filters.isActive === undefined ? 'all' : (filters.isActive ? 'active' : 'inactive')}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('isActive', value === 'all' ? undefined : value === 'active')
              }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          
          {/* City filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={filters.city || 'All'}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              {cityOptions.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search name, email, company..."
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-300"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
          <Button
            onClick={fetchVendors}
            className=" text-white py-2 px-4 rounded"
          >
            Apply Filters
          </Button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Vendors table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">Loading vendors...</div>
        ) : !vendors || vendors.length === 0 ? (
          <div className="p-8 text-center">No vendors found. Try adjusting your filters.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('createdAt')}
                >
                  <div className="flex items-center">
                    Date Added
                    {filters.sortBy === 'createdAt' && (
                      <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('name')}
                >
                  <div className="flex items-center">
                    Name
                    {filters.sortBy === 'name' && (
                      <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('companyName')}
                >
                  <div className="flex items-center">
                    Company
                    {filters.sortBy === 'companyName' && (
                      <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('city')}
                >
                  <div className="flex items-center">
                    City
                    {filters.sortBy === 'city' && (
                      <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor._id} className={`hover:bg-gray-50 `}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(vendor.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.companyName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vendor.email}</div>
                    <div className="text-sm text-gray-500">{vendor.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.city || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="capitalize">{vendor.paymentMode}</div>
                    {vendor.paymentMode === 'upi' ? (
                      <div className="text-xs text-gray-500">{vendor.upiId || 'No UPI ID'}</div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {vendor.bankDetails?.accountHolderName 
                          ? `${vendor.bankDetails.accountHolderName.substring(0, 10)}...` 
                          : 'No bank details'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(vendor.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => navigate(`/vendors/${vendor._id}`)}
                    >
                      View
                    </button>
                    <button 
                      className={`mr-3 ${vendor.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                      onClick={() => handleToggleStatus(vendor._id as string, vendor.isActive as boolean)}
                    >
                      {vendor.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteVendor(vendor._id as string)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorListPage;