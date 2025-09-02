import express from 'express';
const auth = express.Router();

auth.get('/login', (req, res) => {
  res.render('login/index'); // renders views/auth/login.ejs
});

auth.get('/register', (req, res) => {
  res.render('register/index'); // renders views/auth/register.ejs
});

auth.get('/forgotpassword', (req, res) => {
    res.render('forgotpassword/index'); // renders views/auth/forgotpassword.ejs
});

export default auth;