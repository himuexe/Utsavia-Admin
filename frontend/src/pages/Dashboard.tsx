import React, { useState, useEffect } from 'react';
import { bookingApi, BookingStats } from '../services/bookingClient';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const BookingDashboard: React.FC = () => {
  // State
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getBookingStats(dateRange.startDate, dateRange.endDate);
      
      // Ensure we have default values if the API returns empty data
      setStats({
        totalBookings: data.totalBookings || 0,
        bookingsByStatus: data.bookingsByStatus || [],
        revenue: {
          totalRevenue: data.revenue?.totalRevenue || 0,
          averageBookingValue: data.revenue?.averageBookingValue || 0,
          maxBookingValue: data.revenue?.maxBookingValue || 0
        },
        bookingsByDay: data.bookingsByDay || []
      });
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch booking statistics. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle date range change
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Effect to fetch stats when date range changes
  useEffect(() => {
    fetchStats();
  }, [dateRange]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`; // Changed from `$` to `₹`
  };
  
  // Prepare data for pie chart - handle status mapping
  const preparePieChartData = () => {
    if (!stats || !stats.bookingsByStatus.length) return [];
    
    // Map from DB status to display name if needed
    const statusNameMap: { [key: string]: string } = {
      'confirmed': 'Confirmed',
      'pending': 'Pending',
      'cancelled': 'Cancelled',
    };
    
    return stats.bookingsByStatus.map(item => ({
      name: statusNameMap[item._id] || (item._id.charAt(0).toUpperCase() + item._id.slice(1)),
      value: item.count
    }));
  };
  
  // Prepare data for daily line/bar charts with default values for missing dates
  const prepareTimeSeriesData = () => {
    if (!stats || !stats.bookingsByDay.length) return [];
    
    // Parse date range to fill in missing dates
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const datesMap: { [key: string]: { _id: string, count: number, revenue: number } } = {};
    
    // Initialize all dates in range with zeros
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      datesMap[dateStr] = { _id: dateStr, count: 0, revenue: 0 };
    }
    
    // Fill in actual data
    stats.bookingsByDay.forEach(dayData => {
      if (datesMap[dayData._id]) {
        datesMap[dayData._id] = dayData;
      }
    });
    
    // Convert map to array and sort by date
    return Object.values(datesMap).sort((a, b) => 
      new Date(a._id).getTime() - new Date(b._id).getTime()
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Dashboard</h1>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-3 py-2"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-3 py-2"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
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
        <div className="p-8 text-center">Loading dashboard data...</div>
      ) : stats ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-medium text-gray-500">Total Bookings</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalBookings}</p>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-medium text-gray-500">Total Revenue</h3>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats.revenue.totalRevenue || 0)}</p>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-medium text-gray-500">Avg. Booking Value</h3>
              <p className="text-3xl font-bold mt-2">
                {stats.totalBookings > 0 
                  ? formatCurrency(stats.revenue.averageBookingValue || 0) 
                  : formatCurrency(0)}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-medium text-gray-500">Highest Booking</h3>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats.revenue.maxBookingValue || 0)}</p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bookings by status pie chart */}
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Bookings by Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preparePieChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {preparePieChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} bookings`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Daily bookings line chart */}
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Daily Bookings</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareTimeSeriesData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return format(date, 'MMM dd');
                      }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${format(new Date(value), 'MMM dd, yyyy')}`}
                      formatter={(value: any, name: any) => {
                        if (name === 'count') return [`${value} bookings`, 'Bookings'];
                        return [formatCurrency(value), 'Revenue'];
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Bookings" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Revenue chart */}
          <div className="bg-white p-6 rounded shadow mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Daily Revenue</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareTimeSeriesData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="_id" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, 'MMM dd');
                    }}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    labelFormatter={(value) => `Date: ${format(new Date(value), 'MMM dd, yyyy')}`}
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center">No data available for the selected date range.</div>
      )}
    </div>
  );
};

export default BookingDashboard;