import express from 'express';
const gamescreen = express.Router();

gamescreen.get('/gamescreen', (req, res) => {
    res.render('gamescreen/index'); // renders views/gamescreen/index.ejs
});

export default gamescreen;