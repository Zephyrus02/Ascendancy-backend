import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import teamRoutes from './routes/teamRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT'], // Add PUT
  allowedHeaders: ['Content-Type', 'Accept']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

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

// Connect to database
connectDB();

const PORT = process.env.PORT || 6000; // Should match frontend API_URL

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});