import productServices from "./product-services.js";

export const {
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
} = productServices;

