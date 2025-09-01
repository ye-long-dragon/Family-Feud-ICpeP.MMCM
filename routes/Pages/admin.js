import express from "express";
const admin = express.Router();

admin.get("/", (req, res) => {
  res.render("adminScreen/index"); // renders views/adminScreen/index.ejs
});

export default admin;
