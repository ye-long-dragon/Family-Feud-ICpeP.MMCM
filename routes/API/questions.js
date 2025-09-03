import express from 'express';
const questions = express.Router();
import Question from '../../models/question.js';

// Route to create a new question
questions.post('/create', async (req, res) => {
  try {
    const { question, answers } = req.body;
    const newQuestion = new Question({
        question,
        answers: answers.map(answer => ({
            answer: answer.answer,
            points: answer.points
        }))
    });
    await newQuestion.save();
    res.status(201).json({ message: 'Question created successfully', question: newQuestion });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default questions;