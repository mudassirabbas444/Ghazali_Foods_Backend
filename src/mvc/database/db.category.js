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
    console.log('[createCategory DB] Starting database operation');
    console.log('[createCategory DB] Received categoryData:', JSON.stringify(categoryData, null, 2));
    
    await ensureConnection();
    console.log('[createCategory DB] Database connection verified');
    
    if (!categoryData.slug) {
      categoryData.slug = generateSlug(categoryData.name);
      console.log('[createCategory DB] Generated slug:', categoryData.slug);
    } else {
      
      console.log('[createCategory DB] Using provided slug:', categoryData.slug);
    }
    
    console.log('[createCategory DB] Creating Category model instance');
    const category = new Category(categoryData);
    
    console.log('[createCategory DB] Saving category to database');
    const savedCategory = await category.save();
    console.log('[createCategory DB] Category saved successfully with ID:', savedCategory._id);
    
    return savedCategory;
  } catch (error) {
    console.error('[createCategory DB] Database error:', error);
    console.error('[createCategory DB] Error stack:', error.stack);
    console.error('[createCategory DB] Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
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

