import {
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
} from "../../services/product/index.js";

const getProductsController = async (req, res) => {
  try {
    const result = await getProducts(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProductController = async (req, res) => {
  try {
    const result = await getProduct(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createProductController = async (req, res) => {
  try {
    console.log('[createProductController] Request received:', {
      method: req.method,
      url: req.url,
      hasFiles: !!req.files,
      fileCount: req.files?.length || 0,
      bodyKeys: Object.keys(req.body || {}),
      userId: req.user?.id,
      userEmail: req.user?.email,
      contentType: req.headers['content-type']
    });

    if (req.files && req.files.length > 0) {
      console.log('[createProductController] Files received:', req.files.map(f => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        bufferLength: f.buffer?.length || 0
      })));
    } else {
      console.log('[createProductController] No files in request');
    }

    const result = await createProductService(req);
    
    console.log('[createProductController] Service response:', {
      success: result.success,
      statusCode: result.statusCode,
      message: result.message,
      hasData: !!result.data
    });

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('[createProductController] Unhandled error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const result = await updateProductService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const result = await deleteProductService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getFeaturedProductsController = async (req, res) => {
  try {
    const result = await getFeaturedProducts(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBestSellersController = async (req, res) => {
  try {
    const result = await getBestSellers(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getNewArrivalsController = async (req, res) => {
  try {
    const result = await getNewArrivals(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateStockController = async (req, res) => {
  try {
    const result = await updateStockService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getLowStockController = async (req, res) => {
  try {
    const result = await getLowStockService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
  getFeaturedProductsController,
  getBestSellersController,
  getNewArrivalsController,
  updateStockController,
  getLowStockController
};

