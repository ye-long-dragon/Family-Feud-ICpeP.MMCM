import express from "express";
import question from "../../models/question.js";
const admin = express.Router();

//render admin dashboard with questions from database
admin.get('/', async (req, res) => {
    try {
      const questions = await question.find().lean();
      res.locals.questions = questions; // Make questions available in the view
      res.locals.title = "Admin Dashboard";
      res.locals.description = "Manage questions and answers for the Family Feud game.";
      res.locals.keywords = "admin, dashboard, family feud, questions, answers";
      res.locals.author = "Baraclan";
      res.locals.copyright = "© 2023 Baraclan";

      // Render the admin dashboard view
      res.render('adminScreen/index', {
        questions: questions // Pass questions to the view
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).send('Internal Server Error');
    }

    
});



export default admin;
