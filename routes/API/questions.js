import express from 'express';
const questions = express.Router();
import Question from '../../models/question.js';

// Ensure JSON bodies are parsed for this router
questions.use(express.json());

// Route to create a new question
questions.post('/create', async (req, res) => {
  try {
    const { question, answers } = req.body || {};

    // Basic payload validation
    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid payload: "question" must be a non-empty string' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid payload: "answers" must be an array' });
    }

    if (answers.length < 1 || answers.length > 6) {
      return res.status(400).json({ message: 'Invalid payload: "answers" array must contain 1 to 6 items' });
    }

    const normalizedAnswers = answers.map((a, index) => {
      const text = a && typeof a.answer === 'string' ? a.answer.trim() : '';
      const pointsNumber = typeof a?.points === 'number' ? a.points : Number(a?.points);

      if (text.length === 0 || !Number.isFinite(pointsNumber)) {
        throw new Error(`Invalid answer at index ${index}: requires non-empty "answer" and numeric "points"`);
      }

      return { answer: text, points: pointsNumber };
    });

    const newQuestion = new Question({
      question: question.trim(),
      answers: normalizedAnswers,
    });

    await newQuestion.save();
    return res.status(201).json({ message: 'Question created successfully', question: newQuestion });
  } catch (error) {
    // Handle validation errors from our checks or Mongoose
    if (error?.name === 'ValidationError' || /Invalid answer at index/.test(String(error?.message))) {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }

    console.error('Error creating question:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default questions;