import { useState, useEffect } from 'react';
import { ICategory, CategoryFormData } from '../../types/category';

interface CategoryFormProps {
  initialData?: ICategory;
  allCategories: ICategory[];
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}

const CategoryForm = ({ initialData, allCategories, onSubmit, onCancel }: CategoryFormProps) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    parentId: initialData?.parentId || '',
    level: initialData?.level || 0,
    path: initialData?.path || '',
    isActive: initialData?.isActive ?? true,
    image: initialData?.image || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  // Handle parent category change and auto-update level
  useEffect(() => {
    if (formData.parentId) {
      const parentCategory = allCategories.find(cat => cat._id === formData.parentId);
      if (parentCategory) {
        setFormData(prev => ({
          ...prev,
          level: (parentCategory.level || 0) + 1,
          // Update path if parent has a path
          path: parentCategory.path 
            ? `${parentCategory.path}/${formData.slug}` 
            : `/${formData.slug}`
        }));
      }
    } else {
      // If no parent, set level to 0 and path to just the slug
      setFormData(prev => ({
        ...prev,
        level: 0,
        path: `/${prev.slug}`
      }));
    }
  }, [formData.parentId, formData.slug, allCategories]);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      // Only auto-generate slug if user hasn't manually edited it
      slug: prev.slug === '' || prev.slug === initialData?.slug 
        ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : prev.slug
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    // Check if slug is unique (except for the current category being edited)
    const slugExists = allCategories.some(
      cat => cat.slug === formData.slug && cat._id !== initialData?._id
    );
    
    if (slugExists) {
      newErrors.slug = 'Slug must be unique';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Filter out the current category and its children from parent options to prevent circular references
  const getValidParentOptions = () => {
    // If we're not editing, all categories are valid parents
    if (!initialData) return allCategories;
    
    // Helper function to check if a category is a descendant of the current category
    const isDescendant = (category: ICategory): boolean => {
      if (category.parentId === initialData._id) return true;
      const parent = allCategories.find(cat => cat._id === category.parentId);
      return parent ? isDescendant(parent) : false;
    };
    
    return allCategories.filter(
      cat => cat._id !== initialData._id && !isDescendant(cat)
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.name ? 'border-red-300' : ''
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug *
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.slug ? 'border-red-300' : ''
          }`}
        />
        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Used in URLs. Only lowercase letters, numbers, and hyphens.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
          Parent Category
        </label>
        <select
          id="parentId"
          name="parentId"
          value={formData.parentId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">None (Top Level)</option>
          {getValidParentOptions().map(category => (
            <option key={category._id} value={category._id}>
              {category.name} {category.level ? `(Level ${category.level})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700">
            Level
          </label>
          <input
            type="number"
            id="level"
            name="level"
            value={formData.level}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Auto-calculated based on parent
          </p>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image URL
          </label>
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="path" className="block text-sm font-medium text-gray-700">
          Path
        </label>
        <input
          type="text"
          id="path"
          name="path"
          value={formData.path}
          readOnly
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Auto-generated based on parent path and slug
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;