// src/pages/admin/CategoriesPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryService, Category } from "../services/categoryClient";

// Sort options
type SortOption = {
  label: string;
  value: string;
  order: "asc" | "desc";
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting
  const [search, setSearch] = useState<string>("");
  const [parentFilter, setParentFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>({
    label: "Newest First",
    value: "createdAt",
    order: "desc",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Parent categories for filter dropdown
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  const sortOptions: SortOption[] = [
    { label: "Newest First", value: "createdAt", order: "desc" },
    { label: "Oldest First", value: "createdAt", order: "asc" },
    { label: "Name (A-Z)", value: "name", order: "asc" },
    { label: "Name (Z-A)", value: "name", order: "desc" },
    { label: "Level (Low-High)", value: "level", order: "asc" },
    { label: "Level (High-Low)", value: "level", order: "desc" },
  ];

  // Fetch categories with current filters
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params: any = {
        sort: sortOption.value,
        order: sortOption.order,
      };

      if (search) params.search = search;
      if (parentFilter)
        params.parentId = parentFilter === "root" ? "null" : parentFilter;
      if (activeFilter) params.isActive = activeFilter === "active";

      const response = await categoryService.getAll(params);
      setCategories(response.data as Category[]);

      // Get parent categories for filter
      if (parentCategories.length === 0) {
        const allCategories = await categoryService.getAll();
        setParentCategories(
          (allCategories.data as Category[]).filter((c) => c.level === 0)
        );
      }
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [sortOption, parentFilter, activeFilter]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCategories();
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryService.delete(id);
        // Refresh the list
        fetchCategories();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <Link
          to="categories/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Category
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Parent Category
            </label>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Categories</option>
              <option value="root">Root Categories</option>
              {parentCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              value={`${sortOption.value}-${sortOption.order}`}
              onChange={(e) => {
                const [value, order] = e.target.value.split("-");
                const selected = sortOptions.find(
                  (option) => option.value === value && option.order === order
                );
                if (selected) setSortOption(selected);
              }}
              className="w-full p-2 border rounded"
            >
              {sortOptions.map((option) => (
                <option
                  key={`${option.value}-${option.order}`}
                  value={`${option.value}-${option.order}`}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setParentFilter("");
                setActiveFilter("");
                setSortOption(sortOptions[0]);
              }}
              className="ml-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {/* Categories table */}
      {loading ? (
        <div className="text-center py-8">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8">No categories found.</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-500">
                            {category.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Level {category.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.parentId ? (
                        <Link
                          to={`/management/categories/${category.parentId}`}
                          className="text-blue-500 hover:underline"
                        >
                          {(category as any).parentId?.name || "View Parent"}
                        </Link>
                      ) : (
                        "Root Category"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/management/categories/${category._id}`}
                        className="text-blue-500 hover:text-blue-700 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        to={`/management/categories/${category._id}/edit`}
                        className="text-indigo-500 hover:text-indigo-700 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm">
                <button
                  onClick={() =>
                    paginate(currentPage > 1 ? currentPage - 1 : 1)
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === i + 1
                        ? "text-blue-500 bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    paginate(
                      currentPage < totalPages ? currentPage + 1 : totalPages
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoriesPage;
