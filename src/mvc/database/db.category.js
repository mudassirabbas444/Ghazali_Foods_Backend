import Category from "../models/Category.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const createCategory = async (categoryData) => {
  try {
    await ensureConnection();
    if (!categoryData.slug) {
      categoryData.slug = generateSlug(categoryData.name);
    }
    const category = new Category(categoryData);
    return await category.save();
  } catch (error) {
    throw new Error("Error creating category: " + error.message);
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    await ensureConnection();
    return await Category.findById(categoryId);
  } catch (error) {
    throw new Error("Error fetching category: " + error.message);
  }
};

export const getCategoryBySlug = async (slug) => {
  try {
    await ensureConnection();
    return await Category.findOne({ slug, isActive: true });
  } catch (error) {
    throw new Error("Error fetching category by slug: " + error.message);
  }
};

export const getAllCategories = async (options = {}) => {
  try {
    await ensureConnection();  
    const categories = await Category.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate('parentCategory', 'name slug');
    return categories;
    
  } catch (error) {
    throw new Error("Error fetching categories: " + error.message);
  }
};

export const updateCategory = async (categoryId, updateData) => {
  try {
    await ensureConnection();
    if (updateData.name && !updateData.slug) {
      updateData.slug = generateSlug(updateData.name);
    }
    const category = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  } catch (error) {
    throw new Error("Error updating category: " + error.message);
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    await ensureConnection();
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  } catch (error) {
    throw new Error("Error deleting category: " + error.message);
  }
};

