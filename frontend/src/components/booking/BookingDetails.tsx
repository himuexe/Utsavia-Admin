import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingApi, Booking, Vendor } from "../../services/bookingClient";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "pending" | "confirmed" | "cancelled" | "completed"
  >("pending");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await bookingApi.getBookingById(id);
        setBooking(data);
        setStatus(data.status); // Set the initial status
        setError(null);
      } catch (err) {
        setError("Failed to fetch booking details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !booking) return;

    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await bookingApi.deleteBooking(id);
        navigate("/bookings");
      } catch (err) {
        setError("Failed to delete booking. Please try again.");
        console.error(err);
      }
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !booking) return;

    try {
      setLoading(true);
      await bookingApi.updateBooking(id, { status });
      setBooking({ ...booking, status }); // Update local state
      setError(null);
    } catch (err) {
      setError("Failed to update booking status. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const renderStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };

    const statusClass = statusClasses[status] || "bg-gray-100 text-gray-800";

    return (
      <Badge className={statusClass}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
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

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Booking not found"}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate("/bookings")}>
          Back to Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/bookings")}>
            Back to Bookings
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Booking
          </Button>
          {/* Status Update Section */}
          <CardContent className="border-t">
            <div className="flex items-center space-x-4">
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(
                    value as "pending" | "confirmed" | "cancelled" | "completed"
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStatusUpdate} disabled={loading}>
                {loading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </CardContent>
        </div>
      </div>

      <Card>
        {/* Booking Summary */}
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Booking #{booking._id.substring(0, 8)}</CardTitle>
            {renderStatusBadge(booking.status)}
          </div>
          <CardDescription>Details of the booking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created On</p>
              <p className="font-medium">{formatDate(booking.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">
                ₹{booking.totalAmount.toFixed(2)}
              </p>
            </div>
            {booking.paymentIntentId && (
              <div>
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="font-medium">{booking.paymentIntentId}</p>
              </div>
            )}
          </div>
        </CardContent>

        {/* Customer Information */}
        <CardContent className="border-t">
          <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">
                {booking.userId?.firstName || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">
                {booking.userId?.primaryEmail || "No email"}
              </p>
            </div>
          </div>
        </CardContent>

        {/* Address Information */}
        <CardContent className="border-t">
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
        </CardContent>

        {/* Items */}
        <CardContent className="border-t">
          <h3 className="text-lg font-semibold mb-3">Booking Items</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Time Slot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booking.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {format(new Date(item.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {item.vendorId ? (
                        typeof item.vendorId === "string" ? (
                          <span className="text-gray-500">
                            Vendor ID: {item.vendorId}
                          </span>
                        ) : (
                          <div>
                            <div className="font-medium">
                              {(item.vendorId as Vendor).name}
                            </div>
                            {(item.vendorId as Vendor).companyName && (
                              <div className="text-sm text-gray-500">
                                {(item.vendorId as Vendor).companyName}
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-gray-500">Admin</span>
                      )}
                    </TableCell>
                    <TableCell>{item.timeSlot}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetailPage;
