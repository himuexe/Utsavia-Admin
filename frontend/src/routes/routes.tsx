import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/BookingList';
import BookingDetailsPage from '../components/booking/BookingDetails';
import Categories from '../pages/Categories';
import CategoryFormPage from '../components/category/CategoryForm';
import CategoryViewPage from '../components/category/CategoryView';
import Items from '../pages/Themes';
import ItemFormPage from '../components/themes/ItemForm';
import ItemViewPage from '../components/themes/ItemView';
import Themes from '../pages/Themes';
import LoginPage from '../pages/Login';
import VendorListPage from '../pages/Vendor';
import VendorFormPage from '../components/vendor/VendorForm';
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
        path: 'themes/items',
        element: <Items />,
      },
      {
        path: 'themes/items/new',
        element: <ItemFormPage />,
      },
      {
        path: 'themes/items/:id',
        element: <ItemViewPage />,
      },
      {
        path: 'themes/items/:id/edit',
        element: <ItemFormPage />,
      },
      {
        path: 'themes',
        element: <Themes />,
      },
      // Vendor routes
      {
        path: 'vendors',
        element: <VendorListPage />,
      },
      {
        path: 'vendors/:id',
        element: <VendorFormPage/>,
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