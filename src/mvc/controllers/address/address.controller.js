import {
  getAddresses,
  getAddress,
  createAddressService,
  updateAddressService,
  deleteAddressService,
  getDefaultAddressService
} from "../../services/address/index.js";

const getAddressesController = async (req, res) => {
  try {
    const result = await getAddresses(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAddressController = async (req, res) => {
  try {
    const result = await getAddress(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createAddressController = async (req, res) => {
  try {
    const result = await createAddressService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateAddressController = async (req, res) => {
  try {
    const result = await updateAddressService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteAddressController = async (req, res) => {
  try {
    const result = await deleteAddressService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getDefaultAddressController = async (req, res) => {
  try {
    const result = await getDefaultAddressService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAddressesController,
  getAddressController,
  createAddressController,
  updateAddressController,
  deleteAddressController,
  getDefaultAddressController
};

