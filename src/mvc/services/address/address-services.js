import {
  createAddress,
  getAddressById,
  getUserAddresses,
  getDefaultAddress,
  updateAddress,
  deleteAddress
} from "../../database/db.address.js";

const getAddresses = async (req) => {
  try {
    const userId = req?.user?.id;
    
    const addresses = await getUserAddresses(userId);
    
    return {
      success: true,
      message: "Addresses fetched successfully",
      statusCode: 200,
      data: addresses
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getAddress = async (req) => {
  try {
    const { id } = req?.params;
    
    const address = await getAddressById(id);
    
    if (!address) {
      return {
        success: false,
        message: "Address not found",
        statusCode: 404
      };
    }
    
    // Check ownership
    if (address.user.toString() !== req.user.id && !req.user.isAdmin) {
      return {
        success: false,
        message: "Unauthorized",
        statusCode: 403
      };
    }
    
    return {
      success: true,
      message: "Address fetched successfully",
      statusCode: 200,
      data: address
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const createAddressService = async (req) => {
  try {
    const userId = req?.user?.id;
    const addressData = { ...req?.body, user: userId };
    
    const address = await createAddress(addressData);
    
    return {
      success: true,
      message: "Address created successfully",
      statusCode: 201,
      data: address
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updateAddressService = async (req) => {
  try {
    const { id } = req?.params;
    const updateData = req?.body;
    
    const address = await getAddressById(id);
    if (!address) {
      return {
        success: false,
        message: "Address not found",
        statusCode: 404
      };
    }
    
    // Check ownership
    if (address.user.toString() !== req.user.id && !req.user.isAdmin) {
      return {
        success: false,
        message: "Unauthorized",
        statusCode: 403
      };
    }
    
    const updatedAddress = await updateAddress(id, updateData);
    
    return {
      success: true,
      message: "Address updated successfully",
      statusCode: 200,
      data: updatedAddress
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const deleteAddressService = async (req) => {
  try {
    const { id } = req?.params;
    
    const address = await getAddressById(id);
    if (!address) {
      return {
        success: false,
        message: "Address not found",
        statusCode: 404
      };
    }
    
    // Check ownership
    if (address.user.toString() !== req.user.id && !req.user.isAdmin) {
      return {
        success: false,
        message: "Unauthorized",
        statusCode: 403
      };
    }
    
    await deleteAddress(id);
    
    return {
      success: true,
      message: "Address deleted successfully",
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

const getDefaultAddressService = async (req) => {
  try {
    const userId = req?.user?.id;
    
    const address = await getDefaultAddress(userId);
    
    if (!address) {
      return {
        success: true,
        message: "No default address found",
        statusCode: 200,
        data: null
      };
    }
    
    return {
      success: true,
      message: "Default address fetched successfully",
      statusCode: 200,
      data: address
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
  getAddresses,
  getAddress,
  createAddressService,
  updateAddressService,
  deleteAddressService,
  getDefaultAddressService
};

