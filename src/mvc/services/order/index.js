import orderServices from "./order-services.js";

export const {
  createOrderService,
  getOrder,
  getUserOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
  updatePaymentStatusService,
  cancelOrderService,
  getOrderStatsService
} = orderServices;

