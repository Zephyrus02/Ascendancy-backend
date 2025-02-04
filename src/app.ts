import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import teamRoutes from './routes/teamRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  methods: ['GET', 'POST'],
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
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/teams', teamRoutes);

// Connect to database
connectDB();

const PORT = process.env.PORT || 6000; // Should match frontend API_URL

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});