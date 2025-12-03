import Product from "../models/Product.js";
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

export const createProduct = async (productData) => {
  try {
    await ensureConnection();
    if (!productData.slug) {
      productData.slug = generateSlug(productData.name);
    }
    const product = new Product(productData);
    return await product.save();
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

export const getProductById = async (productId) => {
  try {
    await ensureConnection();
    return await Product.findById(productId).populate('category', 'name slug');
  } catch (error) {
    throw new Error("Error fetching product: " + error.message);
  }
};

export const getProductBySlug = async (slug) => {
  try {
    await ensureConnection();
    return await Product.findOne({ slug, isActive: true }).populate('category', 'name slug');
  } catch (error) {
    throw new Error("Error fetching product by slug: " + error.message);
  }
};

export const getAllProducts = async (options = {}) => {
  try {
    await ensureConnection();
    const page = parseInt(options.page) || 1;
    const limit = options.limit ? parseInt(options.limit) : 1000; // Default to large number to show all
    const skip = (page - 1) * limit;
    
    const query = {};
    
    if (options.category) {
      query.category = options.category;
    }
    
    if (options.isActive !== undefined) {
      query.isActive = options.isActive;
    }
    
    if (options.isFeatured !== undefined) {
      query.isFeatured = options.isFeatured;
    }
    
    if (options.isBestSeller !== undefined) {
      query.isBestSeller = options.isBestSeller;
    }
    
    if (options.isNewArrival !== undefined) {
      query.isNewArrival = options.isNewArrival;
    }
    
    if (options.search) {
      query.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
        { tags: { $in: [new RegExp(options.search, 'i')] } }
      ];
    }
    
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.basePrice = {};
      if (options.minPrice !== undefined) {
        query.basePrice.$gte = options.minPrice;
      }
      if (options.maxPrice !== undefined) {
        query.basePrice.$lte = options.maxPrice;
      }
    }
    
    // Brand filter
    if (options.brands && Array.isArray(options.brands) && options.brands.length > 0) {
      query.brand = { $in: options.brands };
    }
    
    // In stock filter - handle combination with search
    if (options.inStock === true) {
      const stockCondition = {
        $or: [
          { stock: { $gt: 0 } },
          { 'variants.stock': { $gt: 0 } }
        ]
      };
      
      if (query.$or) {
        // Search exists, combine with $and
        query.$and = [
          { $or: query.$or },
          stockCondition
        ];
        delete query.$or;
      } else {
        // No search, just add stock condition
        Object.assign(query, stockCondition);
      }
    }
    
    // On sale filter (discount > 0)
    if (options.onSale === true) {
      query.discount = { $gt: 0 };
    }
    
    // Minimum rating filter
    if (options.minRating !== undefined && options.minRating > 0) {
      query.averageRating = { $gte: options.minRating };
    }
    
    // Multiple categories filter
    if (options.categories && Array.isArray(options.categories) && options.categories.length > 0) {
      query.category = { $in: options.categories };
    }
    
    // Sort
    let sort = {};
    if (options.sortBy === 'price_low') {
      sort = { basePrice: 1 };
    } else if (options.sortBy === 'price_high') {
      sort = { basePrice: -1 };
    } else if (options.sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (options.sortBy === 'popularity') {
      sort = { averageRating: -1, totalReviews: -1 };
    } else {
      sort = { displayOrder: 1, createdAt: -1 };
    }
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(query);
    
    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw new Error("Error fetching products: " + error.message);
  }
};

export const updateProduct = async (productId, updateData) => {
  try {
    await ensureConnection();
    if (updateData.name && !updateData.slug) {
      updateData.slug = generateSlug(updateData.name);
    }
    const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error("Error updating product: " + error.message);
  }
};

export const deleteProduct = async (productId) => {
  try {
    await ensureConnection();
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error("Error deleting product: " + error.message);
  }
};

export const updateProductStock = async (productId, variant, quantity) => {
  try {
    await ensureConnection();
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    let previousStock = 0;
    if (variant) {
      // Update variant stock
      const variantIndex = product.variants.findIndex(v => v.weight === variant);
      if (variantIndex !== -1) {
        previousStock = product.variants[variantIndex].stock;
        product.variants[variantIndex].stock = quantity;
      }
    } else {
      // Update base stock
      previousStock = product.stock;
      product.stock = quantity;
    }
    
    const savedProduct = await product.save();
    
    // Trigger stock notifications if stock went from 0 to > 0
    if (previousStock === 0 && quantity > 0) {
      try {
        const { checkAndNotifyStock } = await import("../../services/stockNotification/index.js");
        await checkAndNotifyStock(productId, variant || null);
      } catch (notifyError) {
        console.error("Error triggering stock notifications:", notifyError);
        // Don't throw error, just log it
      }
    }
    
    return savedProduct;
  } catch (error) {
    throw new Error("Error updating product stock: " + error.message);
  }
};

export const getLowStockProducts = async (threshold = 10) => {
  try {
    await ensureConnection();
    return await Product.find({
      isActive: true,
      $or: [
        { stock: { $lte: threshold } },
        { 'variants.stock': { $lte: threshold } }
      ]
    }).populate('category', 'name');
  } catch (error) {
    throw new Error("Error fetching low stock products: " + error.message);
  }
};

