import express from 'express';
import dotenv from 'dotenv';

// Importing Routes
import admin from './routes/Pages/admin.js';
import connect from './database/mongo-dbconnect.js';
import auth from './routes/Pages/auth.js';

//database connection
connect();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public'
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views'); 
// if your views folder is named 'views' and is in project root




// Mount admin router at /admin
app.use('/', admin);
app.use('/auth', auth);





// 404 handler (after all routes)
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
