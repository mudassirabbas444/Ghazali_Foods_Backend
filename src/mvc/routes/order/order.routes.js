import express from "express";
import orderController from "../../controllers/order/order.controller.js";
import { orderRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

// Admin routes - MUST come before parameterized routes like /:id
router.get(orderRoutes.GET_ORDER_STATS, auth, isAdmin, orderController.getOrderStatsController);
router.get(orderRoutes.GET_ALL_ORDERS, auth, isAdmin, orderController.getAllOrdersController);
router.put(orderRoutes.UPDATE_ORDER_STATUS, auth, isAdmin, orderController.updateOrderStatusController);
router.put(orderRoutes.UPDATE_PAYMENT_STATUS, auth, isAdmin, orderController.updatePaymentStatusController);

// User routes
router.post(orderRoutes.CREATE_ORDER, auth, orderController.createOrderController);
router.get(orderRoutes.GET_USER_ORDERS, auth, orderController.getUserOrdersController);
router.get(orderRoutes.GET_ORDER_BY_NUMBER, auth, orderController.getOrderController);
router.get(orderRoutes.GET_ORDER, auth, orderController.getOrderController);
router.post(orderRoutes.CANCEL_ORDER, auth, orderController.cancelOrderController);

export { router as orderRouter };

