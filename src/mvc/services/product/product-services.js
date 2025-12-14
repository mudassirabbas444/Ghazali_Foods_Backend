import mongoose from "mongoose";
import {
  createProduct,
  getProductById,
  getProductBySlug,
  getAllProducts,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getLowStockProducts
} from "../../database/db.product.js";
import { cleanupProductImages } from "../../../services/imageCleanup.js";
import { checkAndNotifyStock } from "../stockNotification/index.js";

// Helper function to calculate if product is out of stock
const calculateIsOutOfStock = (product) => {
  // Check base stock
  if (product.stock > 0) {
    return false;
  }
  
  // Check variant stocks
  if (product.variants && product.variants.length > 0) {
    const hasStockInVariants = product.variants.some(variant => 
      variant.stock > 0 && variant.isActive !== false
    );
    if (hasStockInVariants) {
      return false;
    }
  }
  
  // If trackInventory is false, consider it in stock
  if (product.trackInventory === false) {
    return false;
  }
  
  return true;
};

const getProducts = async (req) => {
  try {
    const options = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 20,
      category: req?.query?.category,
      search: req?.query?.search,
      minPrice: req?.query?.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req?.query?.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      sortBy: req?.query?.sortBy || 'default',
      // Advanced filters
      brands: req?.query?.brands ? (Array.isArray(req.query.brands) ? req.query.brands : req.query.brands.split(',')) : undefined,
      inStock: req?.query?.inStock === 'true',
      onSale: req?.query?.onSale === 'true',
      minRating: req?.query?.minRating ? parseFloat(req.query.minRating) : undefined,
      categories: req?.query?.categories ? (Array.isArray(req.query.categories) ? req.query.categories : req.query.categories.split(',')) : undefined,
    };
    
    const result = await getAllProducts(options);
    
    // Add isOutOfStock field to each product
    const productsWithStock = (result.products || []).map(product => {
      const productObj = product.toObject ? product.toObject() : product;
      productObj.isOutOfStock = calculateIsOutOfStock(product);
      return productObj;
    });
    
    return {
      success: true,
      message: "Products fetched successfully",
      statusCode: 200,
      products: productsWithStock,
      pagination: {
        total: result.total || 0,
        page: result.page || 1,
        pages: result.pages || 1
      }
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getProduct = async (req) => {
  try {
    const { id, slug } = req?.params;
    
    // Validate ObjectId format if id is provided
    if (id && !slug) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          message: "Invalid product ID format",
          statusCode: 400
        };
      }
    }
    
    let product;
    if (slug) {
      product = await getProductBySlug(slug);
    } else if (id) {
      product = await getProductById(id);
    } else {
      return {
        success: false,
        message: "Product ID or slug is required",
        statusCode: 400
      };
    }
    
    if (!product) {
      return {
        success: false,
        message: "Product not found",
        statusCode: 404
      };
    }
    
    // Increment view count (only for non-admin users viewing active products)
    if (product.isActive && (!req.user || !req.user.isAdmin)) {
      try {
        product.viewCount = (product.viewCount || 0) + 1;
        await product.save();
      } catch (viewError) {
        console.error("Error incrementing view count:", viewError);
        // Don't fail the request if view count update fails
      }
    }
    
    // Add isOutOfStock field
    const isOutOfStock = calculateIsOutOfStock(product);
    const productObj = product.toObject ? product.toObject() : product;
    productObj.isOutOfStock = isOutOfStock;
    
    return {
      success: true,
      message: "Product fetched successfully",
      statusCode: 200,
      product: productObj
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const createProductService = async (req) => {
  try {
    const productData = req?.body;
    
    // Validate required fields
    if (!productData.name) {
      return {
        success: false,
        message: "Product name is required",
        statusCode: 400
      };
    }
    
    if (!productData.description) {
      return {
        success: false,
        message: "Product description is required",
        statusCode: 400
      };
    }
    
    if (!productData.category) {
      return {
        success: false,
        message: "Product category is required",
        statusCode: 400
      };
    }
    
    // Validate category is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productData.category)) {
      return {
        success: false,
        message: "Invalid category ID",
        statusCode: 400
      };
    }
    
    // Handle subCategory - convert empty strings to null, validate if provided
    if (productData.subCategory !== undefined && productData.subCategory !== null) {
      if (productData.subCategory === '' || productData.subCategory === 'null') {
        // Remove empty subCategory or set to null
        productData.subCategory = null;
      } else if (!mongoose.Types.ObjectId.isValid(productData.subCategory)) {
        return {
          success: false,
          message: "Invalid subCategory ID",
          statusCode: 400
        };
      }
    }
    
    if (productData.basePrice === undefined || productData.basePrice === null) {
      return {
        success: false,
        message: "Product base price is required",
        statusCode: 400
      };
    }
    
    // Parse JSON strings if needed (common with form-data)
    if (typeof productData.variants === 'string') {
      try {
        productData.variants = JSON.parse(productData.variants);
      } catch (e) {
        // If parsing fails, set to empty array
        productData.variants = [];
      }
    }
    if (typeof productData.images === 'string') {
      try {
        productData.images = JSON.parse(productData.images);
      } catch (e) {
        // If parsing fails, treat as single image URL
        productData.images = [productData.images];
      }
    }
    
    // Handle image uploads if provided
    if (req?.files && req.files.length > 0) {
      const { uploadMultipleImages } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadMultipleImages(
        req.files,
        'products',
        req.user?.id
      );
      productData.images = uploadResult.images.map(img => img.url);
      productData.thumbnail = uploadResult.images[0]?.url;
    } else if (productData.images) {
      // If images are provided in body (as URLs), use them
      // Ensure it's an array
      if (typeof productData.images === 'string') {
        productData.images = [productData.images];
      }
      if (Array.isArray(productData.images) && productData.images.length > 0) {
        productData.thumbnail = productData.thumbnail || productData.images[0];
      }
    }
    
    // Ensure images array is not empty (business requirement)
    if (!productData.images || productData.images.length === 0) {
      return {
        success: false,
        message: "At least one product image is required",
        statusCode: 400
      };
    }
    
    const product = await createProduct(productData);
    
    return {
      success: true,
      message: "Product created successfully",
      statusCode: 201,
      data: product
    };
  } catch (error) {
    console.error('Create product error:', error);
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error. Please try again later."
    };
  }
};

const updateProductService = async (req) => {
  try {
    const { id } = req?.params;
    const updateData = req?.body;
    
    // Validate product ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid product ID",
        statusCode: 400
      };
    }
    
    // Check if product exists first
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      return {
        success: false,
        message: "Product not found",
        statusCode: 404
      };
    }
    
    // Handle image uploads if provided
    if (req?.files && req.files.length > 0) {
      const { uploadMultipleImages } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadMultipleImages(
        req.files,
        'products',
        req.user?.id
      );
      updateData.images = uploadResult.images.map(img => img.url);
      if (!updateData.thumbnail) {
        updateData.thumbnail = uploadResult.images[0]?.url;
      }
    }
    
    // Parse JSON strings if needed (common with form-data)
    if (typeof updateData.category === 'string' && mongoose.Types.ObjectId.isValid(updateData.category)) {
      updateData.category = updateData.category;
    }
    // Handle subCategory - convert empty strings to null, validate if provided
    if (updateData.subCategory !== undefined && updateData.subCategory !== null) {
      if (updateData.subCategory === '' || updateData.subCategory === 'null') {
        updateData.subCategory = null;
      } else if (typeof updateData.subCategory === 'string' && !mongoose.Types.ObjectId.isValid(updateData.subCategory)) {
        return {
          success: false,
          message: "Invalid subCategory ID",
          statusCode: 400
        };
      }
    }
    if (typeof updateData.variants === 'string') {
      try {
        updateData.variants = JSON.parse(updateData.variants);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }
    if (typeof updateData.images === 'string') {
      try {
        updateData.images = JSON.parse(updateData.images);
      } catch (e) {
        // If parsing fails, treat as single image URL
        updateData.images = [updateData.images];
      }
    }
    
    const previousProduct = existingProduct;
    const product = await updateProduct(id, updateData);
    
    // Check if stock was updated and trigger notifications
    if (updateData.stock !== undefined || updateData.variants) {
      try {
        // Check base stock
        if (updateData.stock !== undefined && previousProduct.stock === 0 && updateData.stock > 0) {
          await checkAndNotifyStock(id, null);
        }
        
        // Check variant stocks
        if (updateData.variants && Array.isArray(updateData.variants)) {
          for (const variant of updateData.variants) {
            const prevVariant = previousProduct.variants?.find(v => v.weight === variant.weight);
            if (prevVariant && prevVariant.stock === 0 && variant.stock > 0) {
              await checkAndNotifyStock(id, variant.weight);
            }
          }
        }
      } catch (notifyError) {
        console.error("Error triggering stock notifications:", notifyError);
        // Don't throw error, just log it
      }
    }
    
    return {
      success: true,
      message: "Product updated successfully",
      statusCode: 200,
      data: product
    };
  } catch (error) {
    console.error('Update product error:', error);
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error. Please try again later."
    };
  }
};

const deleteProductService = async (req) => {
  try {
    const { id } = req?.params;
    
    const product = await getProductById(id);
    if (!product) {
      return {
        success: false,
        message: "Product not found",
        statusCode: 404
      };
    }
    
    // Cleanup images
    await cleanupProductImages(product);
    
    await deleteProduct(id);
    
    return {
      success: true,
      message: "Product deleted successfully",
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getFeaturedProducts = async (req) => {
  try {
    const options = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 10,
      isFeatured: true,
      isActive: true
    };
    
    const result = await getAllProducts(options);
    
    // Add isOutOfStock field to each product
    const productsWithStock = (result.products || []).map(product => {
      const productObj = product.toObject ? product.toObject() : product;
      productObj.isOutOfStock = calculateIsOutOfStock(product);
      return productObj;
    });
    
    return {
      success: true,
      message: "Featured products fetched successfully",
      statusCode: 200,
      products: productsWithStock
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getBestSellers = async (req) => {
  try {
    const options = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 10,
      isBestSeller: true,
      isActive: true
    };
    
    const result = await getAllProducts(options);
    
    // Add isOutOfStock field to each product
    const productsWithStock = (result.products || []).map(product => {
      const productObj = product.toObject ? product.toObject() : product;
      productObj.isOutOfStock = calculateIsOutOfStock(product);
      return productObj;
    });
    
    return {
      success: true,
      message: "Best sellers fetched successfully",
      statusCode: 200,
      products: productsWithStock
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getNewArrivals = async (req) => {
  try {
    const options = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 10,
      isNewArrival: true,
      isActive: true,
      sortBy: 'newest'
    };
    
    const result = await getAllProducts(options);
    
    // Add isOutOfStock field to each product
    const productsWithStock = (result.products || []).map(product => {
      const productObj = product.toObject ? product.toObject() : product;
      productObj.isOutOfStock = calculateIsOutOfStock(product);
      return productObj;
    });
    
    return {
      success: true,
      message: "New arrivals fetched successfully",
      statusCode: 200,
      products: productsWithStock
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updateStockService = async (req) => {
  try {
    const { id } = req?.params;
    const { variant, quantity } = req?.body;
    
    const product = await updateProductStock(id, variant, quantity);
    
    return {
      success: true,
      message: "Stock updated successfully",
      statusCode: 200,
      data: product
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getLowStockService = async (req) => {
  try {
    const threshold = parseInt(req?.query?.threshold) || 10;
    const products = await getLowStockProducts(threshold);
    
    return {
      success: true,
      message: "Low stock products fetched successfully",
      statusCode: 200,
      products: products,
      data: products // Keep for backward compatibility
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

export default {
  getProducts,
  getProduct,
  createProductService,
  updateProductService,
  deleteProductService,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  updateStockService,
  getLowStockService
};

