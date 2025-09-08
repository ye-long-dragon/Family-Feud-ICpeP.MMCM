// server.js
import express from 'express';
import dotenv from 'dotenv';
import {io } from 'socket.io-client';



import path from 'path';



import connect from './database/mongo-dbconnect.js';

// Import Page routes
import auth from './routes/Pages/auth.js';
import admin from './routes/Pages/admin.js';
import controller from './routes/Pages/controller.js';
import gamescreen from './routes/Pages/gamescreen.js';

dotenv.config();
connect();


const app = express();
const PORT = process.env.PORT || 3000;
const socket = io(`http://localhost:${process.env.SOCKETPORT || 4000}`); // Connect to Socket.IO server



// Middleware
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views');

// API Routes
import questions from './routes/API/questions.js';
app.use('/api/questions', questions);

// Page routers
app.use('/', admin);
app.use('/auth', auth);
app.use('/', controller);
app.use('/', gamescreen);

// 404 fallback
app.use((req, res) => res.status(404).send("404 Not Found"));

// ✅ Run HTTP + Socket.IO server
app.listen(PORT, () => {
  console.log(`✅ Server + Socket.IO running at http://localhost:${PORT}`);
});


