// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/BookingList';
import BookingFormPage from '../components/booking/BookingForm';
import BookingDetailsPage from '../components/booking/BookingDetails';
import Categories from '../pages/Categories';
import CategoryFormPage from '../components/category/CategoryForm';
import CategoryViewPage from '../components/category/CategoryView';
import Themes from '../pages/Themes';
import LoginPage from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../context/authContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      </AuthProvider>
    ),
    errorElement: <div>404</div>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'bookings',
        element: <Bookings />,
      },
      {
        path: 'bookings/new',
        element: <BookingFormPage />,
      },
      {
        path: '/bookings/:id',
        element: <BookingDetailsPage />,
      },
      {
        path: 'bookings/edit/:id',
        element: <BookingFormPage />,
      },
      {
        path: 'management',
        element: <Categories />,
      },
      // Category routes
      {
        path: 'management/categories/new',
        element: <CategoryFormPage />,
      },
      {
        path: 'management/categories/:id',
        element: <CategoryViewPage />,
      },
      {
        path: 'management/categories/:id/edit',
        element: <CategoryFormPage />,
      },
      {
        path: 'themes',
        element: <Themes />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    ),
  },
]);

export default router;