import {   ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectToast,
  clearToast,
} from '../store/appSlice';
import Toast from '../components/ui/Toast';

// Define the props for the AppContent component
interface AppContentProps {
  children: ReactNode;
}

function AppContent({ children }: AppContentProps) {
  const dispatch = useDispatch();
  const toast = useSelector(selectToast);

  return (
    <>
      {/* Display toast if it exists */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => dispatch(clearToast())}
        />
      )}
      {/* Render children */}
      {children}
    </>
  );
}

export default AppContent;