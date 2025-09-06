import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './routes/API/socket.js';
import registerSocketHandlers from './routes/API/sockethandlers.js';

// Importing Routes

import connect from './database/mongo-dbconnect.js';

//Pages routes
import auth from './routes/Pages/auth.js';
import admin from './routes/Pages/admin.js';
import controller from './routes/Pages/controller.js';
import gamescreen from './routes/Pages/gamescreen.js';
import sockethandlers from './routes/API/sockethandlers.js';

//database connection
connect();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Attach Socket.IO to HTTP server
const io = initSocket(server);

registerSocketHandlers(io);

// Middleware



// Serve static files from 'public'
app.use(express.static('public'));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views'); 
// if your views folder is named 'views' and is in project root

//API Routes
import questions from './routes/API/questions.js';
app.use('/api/questions', questions);

registerSocketHandlers(io);

// Mount admin router at /admin
app.use('/', admin);
app.use('/auth', auth);
app.use('/', controller);
app.use('/', gamescreen); 








// 404 handler (after all routes)
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
