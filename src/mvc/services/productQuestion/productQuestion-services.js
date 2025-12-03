import {
  createProductQuestion,
  getProductQuestionById,
  getProductQuestionsByProduct,
  getUserQuestions,
  getAllProductQuestions,
  updateProductQuestion,
  deleteProductQuestion,
  incrementHelpfulCount,
} from "../../database/db.productQuestion.js";
import { getProductById } from "../../database/db.product.js";

const createQuestion = async (req) => {
  try {
    const userId = req?.user?.id;
    const { productId, question } = req?.body;

    if (!productId || !question) {
      return {
        success: false,
        message: "Product ID and question are required",
        statusCode: 400,
      };
    }

    // Check if product exists
    const product = await getProductById(productId);
    if (!product) {
      return {
        success: false,
        message: "Product not found",
        statusCode: 404,
      };
    }

    const questionData = await createProductQuestion({
      user: userId,
      product: productId,
      question: question.trim(),
    });

    return {
      success: true,
      message: "Question submitted successfully",
      statusCode: 201,
      data: questionData,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const getProductQuestions = async (req) => {
  try {
    const { productId } = req?.params;
    const filters = {
      isApproved: req?.query?.isApproved !== undefined 
        ? req.query.isApproved === 'true' 
        : true, // Only show approved by default
    };

    const questions = await getProductQuestionsByProduct(productId, filters);

    return {
      success: true,
      message: "Product questions fetched successfully",
      statusCode: 200,
      data: questions,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const getUserQuestionsService = async (req) => {
  try {
    const userId = req?.user?.id;

    const questions = await getUserQuestions(userId);

    return {
      success: true,
      message: "User questions fetched successfully",
      statusCode: 200,
      data: questions,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const getAllQuestions = async (req) => {
  try {
    const filters = {
      product: req?.query?.product || undefined,
      isApproved: req?.query?.isApproved !== undefined 
        ? req.query.isApproved === 'true' 
        : undefined,
      hasAnswer: req?.query?.hasAnswer !== undefined 
        ? req.query.hasAnswer === 'true' 
        : undefined,
    };

    const questions = await getAllProductQuestions(filters);

    return {
      success: true,
      message: "Product questions fetched successfully",
      statusCode: 200,
      data: questions,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const answerQuestion = async (req) => {
  try {
    const adminId = req?.user?.id;
    const { questionId } = req?.params;
    const { answer } = req?.body;

    if (!answer || !answer.trim()) {
      return {
        success: false,
        message: "Answer is required",
        statusCode: 400,
      };
    }

    const question = await updateProductQuestion(questionId, {
      answer: answer.trim(),
      answeredBy: adminId,
      answeredAt: new Date(),
    });

    if (!question) {
      return {
        success: false,
        message: "Question not found",
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: "Answer submitted successfully",
      statusCode: 200,
      data: question,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const updateQuestion = async (req) => {
  try {
    const userId = req?.user?.id;
    const { questionId } = req?.params;
    const { question } = req?.body;

    const existingQuestion = await getProductQuestionById(questionId);
    if (!existingQuestion) {
      return {
        success: false,
        message: "Question not found",
        statusCode: 404,
      };
    }

    if (existingQuestion.user.toString() !== userId) {
      return {
        success: false,
        message: "Unauthorized",
        statusCode: 403,
      };
    }

    const updatedQuestion = await updateProductQuestion(questionId, {
      question: question.trim(),
      isApproved: false, // Reset approval when question is updated
    });

    return {
      success: true,
      message: "Question updated successfully",
      statusCode: 200,
      data: updatedQuestion,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const deleteQuestion = async (req) => {
  try {
    const userId = req?.user?.id;
    const { questionId } = req?.params;

    const question = await getProductQuestionById(questionId);
    if (!question) {
      return {
        success: false,
        message: "Question not found",
        statusCode: 404,
      };
    }

    // User can delete their own question, admin can delete any
    const isAdmin = req?.user?.isAdmin;
    if (question.user.toString() !== userId && !isAdmin) {
      return {
        success: false,
        message: "Unauthorized",
        statusCode: 403,
      };
    }

    await deleteProductQuestion(questionId);

    return {
      success: true,
      message: "Question deleted successfully",
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const approveQuestion = async (req) => {
  try {
    const { questionId } = req?.params;

    const question = await updateProductQuestion(questionId, {
      isApproved: true,
    });

    if (!question) {
      return {
        success: false,
        message: "Question not found",
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: "Question approved successfully",
      statusCode: 200,
      data: question,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const markHelpful = async (req) => {
  try {
    const { questionId } = req?.params;

    const question = await incrementHelpfulCount(questionId);

    if (!question) {
      return {
        success: false,
        message: "Question not found",
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: "Marked as helpful",
      statusCode: 200,
      data: question,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

export {
  createQuestion,
  getProductQuestions,
  getUserQuestionsService,
  getAllQuestions,
  answerQuestion,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  markHelpful,
};

