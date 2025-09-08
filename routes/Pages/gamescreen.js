import express from 'express';
const gamescreen = express.Router();
import Question from '../../models/question.js';

// Route to render the gamescreen page with questions passed to the view
gamescreen.get('/gamescreen', async (req, res) => {
    try {
        const questions = await Question.find().lean();
        res.locals.questions = questions;
        res.locals.title = "Game Screen";
        res.locals.description = "Game screen for the Family Feud game.";
        res.locals.keywords = "game screen, family feud, game";
        res.locals.author = "Baraclan";
        res.locals.copyright = "© 2023 Baraclan";
        res.render('gamescreen/index', {
            questions: questions // Pass questions to the view
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).send('Internal Server Error');
    }
});
 
export default gamescreen;