import express from "express";
import productQuestionController from "../../controllers/productQuestion/productQuestion.controller.js";
import { productQuestionRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

// Public routes
router.get(productQuestionRoutes.GET_PRODUCT_QUESTIONS, productQuestionController.getProductQuestionsController);

// User routes
router.post(productQuestionRoutes.CREATE_QUESTION, auth, productQuestionController.createQuestionController);
router.get(productQuestionRoutes.GET_USER_QUESTIONS, auth, productQuestionController.getUserQuestionsController);
router.put(productQuestionRoutes.UPDATE_QUESTION, auth, productQuestionController.updateQuestionController);
router.delete(productQuestionRoutes.DELETE_QUESTION, auth, productQuestionController.deleteQuestionController);
router.put(productQuestionRoutes.MARK_HELPFUL, productQuestionController.markHelpfulController);

// Admin routes
router.get(productQuestionRoutes.GET_ALL_QUESTIONS, auth, isAdmin, productQuestionController.getAllQuestionsController);
router.put(productQuestionRoutes.ANSWER_QUESTION, auth, isAdmin, productQuestionController.answerQuestionController);
router.put(productQuestionRoutes.APPROVE_QUESTION, auth, isAdmin, productQuestionController.approveQuestionController);

export { router as productQuestionRouter };

