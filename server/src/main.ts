import '../src/firebase/firebase.config';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/user.route';
import noteRouter from './routes/note.route';

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
