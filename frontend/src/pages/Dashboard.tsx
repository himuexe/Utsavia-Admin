import React, { useState, useEffect } from "react";
import { bookingApi, BookingStats } from "../services/bookingClient";
import { format, subDays } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, Calendar, DollarSign, Users } from "lucide-react";
import { Input } from "@/components/ui/input"; 

const BookingDashboard: React.FC = () => {
  // State for dashboard data
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Custom chart colors
  const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b"];
  const STATUS_COLORS = {
    confirmed: "#10b981", // Green
    pending: "#f59e0b", // Amber
    cancelled: "#ef4444", // Red
    completed: "#6366f1", // Indigo
  };

  // Format currency for Indian Rupees
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Fetch current period stats
  const fetchCurrentStats = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getBookingStats(
        dateRange.startDate,
        dateRange.endDate
      );

      // Set default values for missing data
      setStats({
        totalBookings: data.totalBookings || 0,
        bookingsByStatus: data.bookingsByStatus || [],
        revenue: {
          totalRevenue: data.revenue?.totalRevenue || 0,
          averageBookingValue: data.revenue?.averageBookingValue || 0,
          maxBookingValue: data.revenue?.maxBookingValue || 0,
        },
        bookingsByDay: data.bookingsByDay || [],
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch booking statistics. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle date range changes
  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Effect to fetch stats when date range changes
  useEffect(() => {
    fetchCurrentStats();
  }, [dateRange]);

  // Prepare data for pie chart with status mapping
  const preparePieChartData = () => {
    if (!stats || !stats.bookingsByStatus.length) return [];

    // Map database status to display name
    const statusNameMap: { [key: string]: string } = {
      confirmed: "Confirmed",
      pending: "Pending",
      cancelled: "Cancelled",
      completed: "Completed",
    };

    return stats.bookingsByStatus.map((item) => ({
      name: statusNameMap[item._id] || item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: STATUS_COLORS[item._id as keyof typeof STATUS_COLORS] || COLORS[0],
    }));
  };

  // Prepare data for time series charts with gap filling
  const prepareTimeSeriesData = () => {
    if (!stats || !stats.bookingsByDay.length) return [];

    // Create a map to fill in missing dates
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const datesMap: {
      [key: string]: {
        date: string;
        count: number;
        revenue: number;
        formattedDate: string;
      };
    } = {};

    // Initialize all dates in range with zeros
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd");
      const formattedDate = format(d, "MMM dd");
      datesMap[dateStr] = {
        date: dateStr,
        count: 0,
        revenue: 0,
        formattedDate,
      };
    }

    // Fill in actual data
    stats.bookingsByDay.forEach((dayData) => {
      if (datesMap[dayData._id]) {
        datesMap[dayData._id] = {
          ...datesMap[dayData._id],
          count: dayData.count,
          revenue: dayData.revenue,
        };
      }
    });

    // Convert map to array and sort by date
    return Object.values(datesMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Calculate 7-day moving average for chart data
  const calculateMovingAverage = (data: any[], key: string, days: number = 7) => {
    return data.map((item, index) => {
      // For the first few points where we don't have enough history
      if (index < days - 1) {
        const available = data.slice(0, index + 1);
        const sum = available.reduce((acc, curr) => acc + curr[key], 0);
        return {
          ...item,
          [`${key}MA`]: sum / available.length,
        };
      }

      // Calculate the moving average with full window
      const sum = data.slice(index - days + 1, index + 1).reduce((acc, curr) => acc + curr[key], 0);
      return {
        ...item,
        [`${key}MA`]: sum / days,
      };
    });
  };

  // Prepare data for combined revenue and bookings chart
  const prepareComposedChartData = () => {
    const timeSeriesData = prepareTimeSeriesData();
    const withMovingAverage = calculateMovingAverage(timeSeriesData, "revenue");
    return withMovingAverage;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Booking Analytics</h1>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <p className="text-gray-700">Loading dashboard data...</p>
        </div>
      ) : stats ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Bookings
                </CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.revenue.totalRevenue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Avg. Booking Value
                </CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalBookings > 0
                    ? formatCurrency(stats.revenue.averageBookingValue || 0)
                    : formatCurrency(0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Per booking average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Highest Booking
                </CardTitle>
                <ArrowUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.revenue.maxBookingValue || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum value booking
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bookings by status - pie chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-700">
                  Bookings by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {preparePieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} bookings (${((value as number) / stats.totalBookings * 100).toFixed(1)}%)`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Daily bookings - area chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-700">
                  Daily Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={prepareTimeSeriesData()}
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="formattedDate"
                        tickMargin={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickMargin={10}
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        labelFormatter={(_, item: any) => {
                          if (item && item[0] && item[0].payload) {
                            return `Date: ${format(new Date(item[0].payload.date), "MMM dd, yyyy")}`;
                          }
                          return "Unknown date";
                        }}
                        formatter={(value) => [`${value} bookings`, "Bookings"]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorBookings)"
                        name="Bookings"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combined chart - revenue bar chart with trend line */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-700">
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={prepareComposedChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="formattedDate"
                      tickMargin={10}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => formatCurrency(value)}
                      tickMargin={10}
                    />
                    <Tooltip
                      labelFormatter={(_, item: any) => {
                        if (item && item[0] && item[0].payload) {
                          return `Date: ${format(new Date(item[0].payload.date), "MMM dd, yyyy")}`;
                        }
                        return "Unknown date";
                      }}
                      formatter={(value, name) => {
                        if (name === "Revenue") {
                          return [formatCurrency(value as number), name];
                        } else if (name === "7-Day Avg") {
                          return [formatCurrency(value as number), name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      yAxisId="left"
                      name="Revenue"
                      fill="#10b981"
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenueMA"
                      yAxisId="left"
                      name="7-Day Avg"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            No data available for the selected date range. Please adjust your filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingDashboard;