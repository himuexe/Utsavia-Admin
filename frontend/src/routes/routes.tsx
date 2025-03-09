import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/BookingList';
import BookingFormPage from '../components/booking/BookingForm';
import BookingDetailsPage from '../components/booking/BookingDetails';
import Categories from '../pages/Categories';
import CategoryFormPage from '../components/category/CategoryForm';
import CategoryViewPage from '../components/category/CategoryView';
import Items from '../pages/Themes';
import ItemFormPage from '../components/themes/ItemForm';
import ItemViewPage from '../components/themes/ItemView';
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
      // Item routes
      {
        path: 'management/items',
        element: <Items />,
      },
      {
        path: 'management/items/new',
        element: <ItemFormPage />,
      },
      {
        path: 'management/items/:id',
        element: <ItemViewPage />,
      },
      {
        path: 'management/items/:id/edit',
        element: <ItemFormPage />,
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