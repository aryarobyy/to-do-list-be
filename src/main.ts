import express, { Request, Response } from 'express';
import './firebase/admin.sdk';
import './firebase/firebase.config'
import dotenv from 'dotenv';
import userRouter from './routes/user.route';
import noteRouter from './routes/note.route';
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from './socket';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"]
  },
  connectionStateRecovery: {}
});

initSocket(io);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use(express.static(path.join(__dirname, "public")));

app.use('/user', userRouter)
app.use('/note', noteRouter)

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
