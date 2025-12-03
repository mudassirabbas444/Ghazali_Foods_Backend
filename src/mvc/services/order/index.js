import orderServices from "./order-services.js";

export const {
  createOrderService,
  getOrder,
  getUserOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
  cancelOrderService,
  getOrderStatsService
} = orderServices;

