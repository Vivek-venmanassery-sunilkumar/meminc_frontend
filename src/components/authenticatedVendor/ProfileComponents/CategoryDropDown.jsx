import { useState, useEffect } from 'react';
import api from '@/axios/axiosInstance'; // Adjust the import path accordingly

const CategoryDropdown = ({ value, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('admin/categories/');
        const enabledCategories = response.data.filter(category => category.is_enabled);
        setCategories(enabledCategories);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Category</label>
      <select
        value={value}
        onChange={onChange}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="" disabled>Select a category</option>
        {categories.map(category => (
          <option key={category.id} value={category.category}>
            {category.category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryDropdown;