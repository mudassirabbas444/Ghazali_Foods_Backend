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
    
    return {
      success: true,
      message: "Products fetched successfully",
      statusCode: 200,
      products: result.products || [],
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
    
    return {
      success: true,
      message: "Product fetched successfully",
      statusCode: 200,
      product: product
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
    }
    
    const product = await createProduct(productData);
    
    return {
      success: true,
      message: "Product created successfully",
      statusCode: 201,
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

const updateProductService = async (req) => {
  try {
    const { id } = req?.params;
    const updateData = req?.body;
    
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
    
    const previousProduct = await getProduct(id);
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
    return {
      success: false,
      statusCode: 500,
      message: error.message
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
    
    return {
      success: true,
      message: "Featured products fetched successfully",
      statusCode: 200,
      products: result.products || []
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
    
    return {
      success: true,
      message: "Best sellers fetched successfully",
      statusCode: 200,
      products: result.products || []
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
    
    return {
      success: true,
      message: "New arrivals fetched successfully",
      statusCode: 200,
      products: result.products || []
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

