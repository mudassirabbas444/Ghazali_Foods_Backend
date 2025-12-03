import express from "express";
import addressController from "../../controllers/address/address.controller.js";
import { addressRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

// All address routes require authentication
router.get(addressRoutes.GET_ADDRESSES, auth, addressController.getAddressesController);
router.get(addressRoutes.GET_ADDRESS, auth, addressController.getAddressController);
router.get(addressRoutes.GET_DEFAULT_ADDRESS, auth, addressController.getDefaultAddressController);
router.post(addressRoutes.CREATE_ADDRESS, auth, addressController.createAddressController);
router.put(addressRoutes.UPDATE_ADDRESS, auth, addressController.updateAddressController);
router.delete(addressRoutes.DELETE_ADDRESS, auth, addressController.deleteAddressController);

export { router as addressRouter };

