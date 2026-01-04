import express from 'express';
import authRoutes from './modules/auth/auth.route';

const app = express();

app.use(express.json());

// Register auth routes
app.use('/api/auth', authRoutes);

export default app;
