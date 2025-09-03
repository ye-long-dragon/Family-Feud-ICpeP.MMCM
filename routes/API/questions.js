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

// Route to get all questions
questions.get('/', async (req, res) => {
  try {
    const questions = await Question.find().lean();
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//delete question by ID
questions.delete('/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
    const deletedQuestion = await Question.findByIdAndDelete(questionId);
    if (!deletedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully', question: deletedQuestion });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route to update a question by ID
questions.put('/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
    const { question, answers } = req.body;
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        question,
        answers: answers.map(answer => ({
          answer: answer.answer,
            points: answer.points
        }))
      },
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question updated successfully', question: updatedQuestion });
    } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

export default questions;