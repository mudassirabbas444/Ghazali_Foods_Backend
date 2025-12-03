import Address from "../models/Address.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createAddress = async (addressData) => {
  try {
    await ensureConnection();
    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      await Address.updateMany(
        { user: addressData.user, isDefault: true },
        { isDefault: false }
      );
    }
    const address = new Address(addressData);
    return await address.save();
  } catch (error) {
    throw new Error("Error creating address: " + error.message);
  }
};

export const getAddressById = async (addressId) => {
  try {
    await ensureConnection();
    return await Address.findById(addressId);
  } catch (error) {
    throw new Error("Error fetching address: " + error.message);
  }
};

export const getUserAddresses = async (userId) => {
  try {
    await ensureConnection();
    return await Address.find({ user: userId, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching user addresses: " + error.message);
  }
};

export const getDefaultAddress = async (userId) => {
  try {
    await ensureConnection();
    return await Address.findOne({ user: userId, isDefault: true, isActive: true });
  } catch (error) {
    throw new Error("Error fetching default address: " + error.message);
  }
};

export const updateAddress = async (addressId, updateData) => {
  try {
    await ensureConnection();
    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      const address = await Address.findById(addressId);
      if (address) {
        await Address.updateMany(
          { user: address.user, isDefault: true, _id: { $ne: addressId } },
          { isDefault: false }
        );
      }
    }
    const address = await Address.findByIdAndUpdate(addressId, updateData, { new: true });
    if (!address) {
      throw new Error("Address not found");
    }
    return address;
  } catch (error) {
    throw new Error("Error updating address: " + error.message);
  }
};

export const deleteAddress = async (addressId) => {
  try {
    await ensureConnection();
    const address = await Address.findByIdAndUpdate(
      addressId,
      { isActive: false },
      { new: true }
    );
    if (!address) {
      throw new Error("Address not found");
    }
    return address;
  } catch (error) {
    throw new Error("Error deleting address: " + error.message);
  }
};

