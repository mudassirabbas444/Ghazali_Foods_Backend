import ProductQuestion from "../models/ProductQuestion.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createProductQuestion = async (questionData) => {
  try {
    await ensureConnection();
    const question = new ProductQuestion(questionData);
    return await question.save();
  } catch (error) {
    throw new Error("Error creating product question: " + error.message);
  }
};

export const getProductQuestionById = async (questionId) => {
  try {
    await ensureConnection();
    return await ProductQuestion.findById(questionId)
      .populate('user', 'fullName email')
      .populate('product', 'name slug')
      .populate('answeredBy', 'fullName');
  } catch (error) {
    throw new Error("Error fetching product question: " + error.message);
  }
};

export const getProductQuestionsByProduct = async (productId, filters = {}) => {
  try {
    await ensureConnection();
    const query = { product: productId };
    
    if (filters.isApproved !== undefined) {
      query.isApproved = filters.isApproved;
    }
    if (filters.hasAnswer !== undefined) {
      if (filters.hasAnswer) {
        query.answer = { $exists: true, $ne: null, $ne: '' };
      } else {
        query.$or = [
          { answer: { $exists: false } },
          { answer: null },
          { answer: '' }
        ];
      }
    }
    
    return await ProductQuestion.find(query)
      .populate('user', 'fullName email')
      .populate('answeredBy', 'fullName')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching product questions: " + error.message);
  }
};

export const getUserQuestions = async (userId) => {
  try {
    await ensureConnection();
    return await ProductQuestion.find({ user: userId })
      .populate('product', 'name slug thumbnail')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching user questions: " + error.message);
  }
};

export const getAllProductQuestions = async (filters = {}) => {
  try {
    await ensureConnection();
    const query = {};
    
    if (filters.product) {
      query.product = filters.product;
    }
    if (filters.isApproved !== undefined) {
      query.isApproved = filters.isApproved;
    }
    if (filters.hasAnswer !== undefined) {
      if (filters.hasAnswer) {
        query.answer = { $exists: true, $ne: null, $ne: '' };
      } else {
        query.$or = [
          { answer: { $exists: false } },
          { answer: null },
          { answer: '' }
        ];
      }
    }
    
    return await ProductQuestion.find(query)
      .populate('user', 'fullName email')
      .populate('product', 'name slug')
      .populate('answeredBy', 'fullName')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching product questions: " + error.message);
  }
};

export const updateProductQuestion = async (questionId, updateData) => {
  try {
    await ensureConnection();
    if (updateData.answer) {
      updateData.answeredAt = new Date();
    }
    const question = await ProductQuestion.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true }
    );
    if (!question) {
      throw new Error("Product question not found");
    }
    return question;
  } catch (error) {
    throw new Error("Error updating product question: " + error.message);
  }
};

export const deleteProductQuestion = async (questionId) => {
  try {
    await ensureConnection();
    const question = await ProductQuestion.findByIdAndDelete(questionId);
    if (!question) {
      throw new Error("Product question not found");
    }
    return question;
  } catch (error) {
    throw new Error("Error deleting product question: " + error.message);
  }
};

export const incrementHelpfulCount = async (questionId) => {
  try {
    await ensureConnection();
    return await ProductQuestion.findByIdAndUpdate(
      questionId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error incrementing helpful count: " + error.message);
  }
};

