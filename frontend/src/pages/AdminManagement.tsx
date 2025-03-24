import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { fetchAdmins, createAdmin, deleteAdmin } from '../services/adminClient';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const AdminManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for creating new admin
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });
  
  const { user } = useAuth();

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const adminsData = await fetchAdmins();
        setAdmins(adminsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admins');
      } finally {
        setLoading(false);
      }
    };
    
    loadAdmins();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newAdmin = await createAdmin(formData);
      setAdmins(prev => [...prev, newAdmin]);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {    
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await deleteAdmin(adminId);
        setAdmins(prev => prev.filter(admin => admin._id !== adminId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete admin');
      }
    }
  };

  if (loading && admins.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
        <p className="text-muted-foreground">
          Manage admin users and their permissions
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Current user info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>Currently logged in user information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Badge variant="outline" className="capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create new admin form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Admin</CardTitle>
          <CardDescription>Add a new admin user to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : 'Create Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin list */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>List of all admin users with their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {admin.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(admin.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {admin._id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No admin users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagementPage;