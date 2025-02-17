import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import api from '@/axios/axiosInstance'; // Import your API instance

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  // Fetch categories from the backend when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('admin/categories/'); // Replace with your backend endpoint
      setCategories(response.data);
      console.log('category_data', categories)
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await api.post('admin/categories/', { 
          category_name: newCategory.trim(), 
          is_enabled: true // By default, new categories are enabled
        }); // Replace with your backend endpoint
        setCategories([...categories, response.data]);
        setNewCategory('');
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };

  const handleToggleEnable = async (id) => {
    try {
      const category = categories.find((cat) => cat.id === id);
      const updatedCategory = { ...category, is_enabled: !category.is_enabled };

      // Update the category in the backend
      await api.put(`admin/categories/${id}`, { 
        is_enabled: updatedCategory.is_enabled 
      }); // Replace with your backend endpoint

      // Update the category in the local state
      setCategories(categories.map((cat) => 
        cat.id === id ? updatedCategory : cat
      ));
    } catch (error) {
      console.error('Error toggling enable status:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="add-category">
          <AccordionTrigger className="text-lg font-semibold">
            Add Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddCategory}>Submit</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 font-semibold">
          <div>Category</div>
          <div>Enabled</div>
        </div>
        {categories.map((category) => (
          <div key={category.id} className="grid grid-cols-2 gap-4 items-center">
            <div>{category.category}</div>
            <div className="flex justify-start">
              <Switch
                checked={category.is_enabled}
                onCheckedChange={() => handleToggleEnable(category.id)}
                className="data-[state=checked]:bg-[#4A5859]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;