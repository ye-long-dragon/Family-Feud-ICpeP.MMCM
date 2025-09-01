import express from 'express';
import dotenv from 'dotenv';

// Importing Routes
import admin from './routes/Pages/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public'
app.use(express.static('public'));

// Set views folder and template engine
app.set('views', './views');
app.set('view engine', 'ejs');

// Mount admin router at /admin
app.use('/admin', admin);

// 404 handler (after all routes)
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
