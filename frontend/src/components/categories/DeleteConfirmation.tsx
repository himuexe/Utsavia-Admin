// src/pages/categories/components/DeleteConfirmation.tsx
import { FiAlertTriangle } from 'react-icons/fi';

interface DeleteConfirmationProps {
  categoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation = ({ categoryName, onConfirm, onCancel }: DeleteConfirmationProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <FiAlertTriangle size={48} />
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Confirm Deletion</h2>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete the category <strong className="text-gray-800">{categoryName}</strong>? 
          This action cannot be undone.
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;