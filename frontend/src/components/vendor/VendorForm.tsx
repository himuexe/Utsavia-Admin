import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorClient, VendorData } from '../../services/vendorClient';
import { Card, CardHeader, CardTitle, CardContent,CardDescription} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

  // Handle status toggle
  const handleStatusToggle = async (checked: boolean) => {
    if (!id) return;

    try {
      setLoading(true);
      await vendorClient.updateVendor(id, { isActive: checked });
      setFormData((prev) => ({ ...prev, isActive: checked }));
      setSuccess('Vendor status updated successfully');
    } catch (err) {
      setError('Failed to update vendor status. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate('/vendors')}>
          Back to Vendors
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Details</h1>
        <Button variant="outline" onClick={() => navigate('/vendors')}>
          Back to Vendors
        </Button>
      </div>

      {success && (
        <Alert className="mb-6">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
          <CardDescription>View and manage vendor details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Full Name</Label>
              <p className="text-sm text-gray-700">{formData.name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-700">{formData.email}</p>
            </div>
            <div>
              <Label>Phone Number</Label>
              <p className="text-sm text-gray-700">{formData.phone}</p>
            </div>
            <div>
              <Label>Company Name</Label>
              <p className="text-sm text-gray-700">{formData.companyName}</p>
            </div>
            <div>
              <Label>City</Label>
              <p className="text-sm text-gray-700">{formData.city}</p>
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <p className="text-sm text-gray-700">{formData.address}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Payment Mode</Label>
                <p className="text-sm text-gray-700">
                  {formData.paymentMode === 'upi' ? 'UPI' : 'Bank Transfer'}
                </p>
              </div>
              {formData.paymentMode === 'upi' ? (
                <div>
                  <Label>UPI ID</Label>
                  <p className="text-sm text-gray-700">{formData.upiId}</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Account Holder Name</Label>
                    <p className="text-sm text-gray-700">
                      {formData.bankDetails?.accountHolderName}
                    </p>
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <p className="text-sm text-gray-700">
                      {formData.bankDetails?.accountNumber}
                    </p>
                  </div>
                  <div>
                    <Label>IFSC Code</Label>
                    <p className="text-sm text-gray-700">
                      {formData.bankDetails?.ifscCode}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status Toggle */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Vendor Status</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="vendor-status"
                checked={formData.isActive}
                onCheckedChange={handleStatusToggle}
                disabled={loading}
              />
              <Label htmlFor="vendor-status">
                {formData.isActive ? 'Active' : 'Inactive'}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorForm;