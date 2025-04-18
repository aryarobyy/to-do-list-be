import express, { Request, Response } from 'express';
import './firebase/admin.sdk';
import './firebase/firebase.config'
import dotenv from 'dotenv';
import userRouter from './routes/user.route';
import noteRouter from './routes/note.route';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/user', userRouter)
app.use('/note', noteRouter)

app.listen(port, () => console.log(`Running on port ${port}`));
