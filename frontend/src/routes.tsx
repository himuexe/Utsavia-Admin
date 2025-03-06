import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard';
import Bookings from './pages/bookings';
import Categories from './pages/categories';
import Themes from './pages/themes';
import LoginPage from './pages/login/index';
import ProtectedRoute from './pages/login/ProtectedRoute';
import { AuthProvider } from './context/authContext';

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
        path: 'management',
        element: <Categories />,
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