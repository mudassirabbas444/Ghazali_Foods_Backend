import {
  createQuestion,
  getProductQuestions,
  getUserQuestionsService,
  getAllQuestions,
  answerQuestion,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  markHelpful,
} from "../../services/productQuestion/index.js";

const createQuestionController = async (req, res) => {
  try {
    const result = await createQuestion(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductQuestionsController = async (req, res) => {
  try {
    const result = await getProductQuestions(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserQuestionsController = async (req, res) => {
  try {
    const result = await getUserQuestionsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllQuestionsController = async (req, res) => {
  try {
    const result = await getAllQuestions(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const answerQuestionController = async (req, res) => {
  try {
    const result = await answerQuestion(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateQuestionController = async (req, res) => {
  try {
    const result = await updateQuestion(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteQuestionController = async (req, res) => {
  try {
    const result = await deleteQuestion(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveQuestionController = async (req, res) => {
  try {
    const result = await approveQuestion(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markHelpfulController = async (req, res) => {
  try {
    const result = await markHelpful(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createQuestionController,
  getProductQuestionsController,
  getUserQuestionsController,
  getAllQuestionsController,
  answerQuestionController,
  updateQuestionController,
  deleteQuestionController,
  approveQuestionController,
  markHelpfulController,
};

