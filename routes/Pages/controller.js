import express from 'express';
const controller = express.Router();
import Question from '../../models/question.js';

// Route to render the controller page with questions passed to the view
controller.get('/controller', async (req, res) => {
  try {
    const questions = await Question.find().lean();
    res.locals.questions = questions;
    res.locals.title = "Controller Dashboard";
    res.locals.description = "Controller for the Family Feud game.";
    res.locals.keywords = "controller, family feud, game controller";
    res.locals.author = "Baraclan";
    res.locals.copyright = "© 2023 Baraclan";
    res.render('controller/index', {
      questions: questions // Pass questions to the view
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default controller;
