import * as express from 'express';
import * as cors from 'cors';

import { userRouter } from './routers/user';

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost', '127.0.0.1'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Cookies', 'Accept'],
  credentials: true
}));

app.use('/api/user', userRouter);

app.listen(PORT, async () => {
  console.log(`Ready to receive connections on port ${PORT}!`);
});
