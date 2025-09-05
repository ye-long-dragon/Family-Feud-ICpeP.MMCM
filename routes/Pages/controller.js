import expresss from 'express';
const controller = expresss.Router();
controller.get('/controller', (req, res) => {
    res.render('controller/index'); // renders views/controller/index.ejs
}
);
export default controller;