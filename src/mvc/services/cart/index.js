import cartServices from "./cart-services.js";

export const {
  getCart,
  addToCartService,
  updateCartItemService,
  removeFromCartService,
  clearCartService,
  applyCouponService,
  removeCouponService
} = cartServices;

