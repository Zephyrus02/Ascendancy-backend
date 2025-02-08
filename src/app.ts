import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import teamRoutes from './routes/teamRoutes';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes';
import matchRoutes from './routes/matchRoutes';
import roomRoutes from './routes/roomRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    '*',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://www.ascendancy-esports.me',
    'https://ascendancy-backend.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  exposedHeaders: ['Access-Control-Allow-Origin']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add this before other routes
app.get('/', (req, res) => {
  console.log('Server is running');
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/rooms', roomRoutes);

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});