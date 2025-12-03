import {
  createOrderService,
  getOrder,
  getUserOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
  cancelOrderService,
  getOrderStatsService
} from "../../services/order/index.js";

const createOrderController = async (req, res) => {
  try {
    const result = await createOrderService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOrderController = async (req, res) => {
  try {
    const result = await getOrder(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getUserOrdersController = async (req, res) => {
  try {
    const result = await getUserOrdersService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllOrdersController = async (req, res) => {
  try {
    const result = await getAllOrdersService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateOrderStatusController = async (req, res) => {
  try {
    const result = await updateOrderStatusService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const cancelOrderController = async (req, res) => {
  try {
    const result = await cancelOrderService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOrderStatsController = async (req, res) => {
  try {
    const result = await getOrderStatsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createOrderController,
  getOrderController,
  getUserOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  cancelOrderController,
  getOrderStatsController
};

