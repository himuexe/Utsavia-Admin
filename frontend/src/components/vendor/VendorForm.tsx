import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorClient, VendorData } from '../../services/vendorClient';

const VendorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<VendorData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    paymentMode: 'upi',
    upiId: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
    },
    city: '',
    isActive: true,
    isDiscarded: false,
  });

  // Fetch vendor data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchVendor = async () => {
        try {
          setLoading(true);
          const response = await vendorClient.getVendorById(id);
          
          if (response && response.data) {
            // Ensure bank details object exists to prevent errors in the form
            const vendorData = response.data;
            if (!vendorData.bankDetails) {
              vendorData.bankDetails = {
                accountNumber: '',
                ifscCode: '',
                accountHolderName: '',
              };
            }
            
            setFormData(vendorData);
            setError(null);
          } else {
            setError('Failed to fetch vendor data');
          }
        } catch (err) {
          setError('Error loading vendor data. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchVendor();
    }
  }, [id, isEditMode]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested bankDetails fields
    if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle payment mode changes
  const handlePaymentModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      paymentMode: e.target.value as 'upi' | 'bank'
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.name || !formData.email) {
        setError('Name and email are required fields');
        setLoading(false);
        return;
      }
      
      // Clean up validation for UPI or Bank details based on payment mode
      const dataToSubmit = { ...formData };
      
      if (dataToSubmit.paymentMode === 'upi') {
        // If UPI is selected, remove bank details
        dataToSubmit.bankDetails = undefined;
        
        // Validate UPI ID is provided
        if (!dataToSubmit.upiId) {
          setError('UPI ID is required for UPI payment mode');
          setLoading(false);
          return;
        }
      } else {
        // If Bank is selected, remove UPI ID
        dataToSubmit.upiId = undefined;
        
        // Validate bank details
        if (!dataToSubmit.bankDetails?.accountNumber || 
            !dataToSubmit.bankDetails?.ifscCode || 
            !dataToSubmit.bankDetails?.accountHolderName) {
          setError('All bank details are required for bank payment mode');
          setLoading(false);
          return;
        }
      }
      
      if (isEditMode && id) {
        // Update existing vendor
        await vendorClient.updateVendor(id, dataToSubmit);
        setSuccess('Vendor updated successfully');
      }
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/vendors');
      }, 1500);
      
    } catch (err) {
      setError('Failed to save vendor. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="p-8 text-center">Loading vendor data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Vendor' : 'View Vendor'}</h1>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => navigate('/vendors')}
        >
          Back to Vendors
        </button>
      </div>
      
      {/* Error and success messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Vendor form */}
      <div className="bg-white rounded shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic information */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">Basic Information</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={!isEditMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={!isEditMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.phone || ''}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.companyName || ''}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.city || ''}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={formData.address || ''}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            </div>
            
            {/* Payment Information */}
            <div className="col-span-2 mt-4">
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">Payment Information</h2>
            </div>
            
            <div className="col-span-2">
              <div className="flex space-x-4 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="upi"
                    checked={formData.paymentMode === 'upi'}
                    onChange={handlePaymentModeChange}
                    className="form-radio h-4 w-4 text-blue-600"
                    disabled={!isEditMode}
                  />
                  <span className="ml-2">UPI</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="bank"
                    checked={formData.paymentMode === 'bank'}
                    onChange={handlePaymentModeChange}
                    className="form-radio h-4 w-4 text-blue-600"
                    disabled={!isEditMode}
                  />
                  <span className="ml-2">Bank Transfer</span>
                </label>
              </div>
            </div>
            
            {formData.paymentMode === 'upi' ? (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="upiId"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.upiId || ''}
                  onChange={handleChange}
                  placeholder="username@upi"
                  required={formData.paymentMode === 'upi'}
                  disabled={!isEditMode}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankDetails.accountHolderName"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.bankDetails?.accountHolderName || ''}
                    onChange={handleChange}
                    required={formData.paymentMode === 'bank'}
                    disabled={!isEditMode}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankDetails.accountNumber"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.bankDetails?.accountNumber || ''}
                    onChange={handleChange}
                    required={formData.paymentMode === 'bank'}
                    disabled={!isEditMode}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankDetails.ifscCode"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.bankDetails?.ifscCode || ''}
                    onChange={handleChange}
                    required={formData.paymentMode === 'bank'}
                    disabled={!isEditMode}
                  />
                </div>
              </>
            )}
            
            {/* Status toggles */}
            {isEditMode && (
              <>
                <div className="col-span-2 mt-4">
                  <h2 className="text-lg font-semibold mb-3 border-b pb-2">Vendor Status</h2>
                </div>
                
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="form-checkbox h-5 w-5 text-blue-600"
                      disabled={!isEditMode}
                    />
                    <span className="ml-2">Active Status</span>
                  </label>
                </div>
                
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isDiscarded"
                      checked={formData.isDiscarded}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDiscarded: e.target.checked }))}
                      className="form-checkbox h-5 w-5 text-blue-600"
                      disabled={!isEditMode}
                    />
                    <span className="ml-2">Discarded</span>
                  </label>
                </div>
              </>
            )}
            
            {/* Submit button */}
            {isEditMode && (
              <div className="col-span-2 mt-6 flex justify-end">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-300"
                  onClick={() => navigate('/vendors')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Update Vendor'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;