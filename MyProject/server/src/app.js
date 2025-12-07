import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDb from './config/db.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import receivingRoutes from './routes/receivingRoutes.js';
import replenishmentRoutes from './routes/replenishmentRoutes.js';
import { initDefaultUsers } from './scripts/initDefaultUsers.js';
import { initOperationalData } from './scripts/initOperationalData.js';
import { initRegionalInventories } from './scripts/initRegionalInventories.js';

connectDb();
initDefaultUsers();
initOperationalData();
initRegionalInventories();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfer-orders', transferRoutes);
app.use('/api/receiving', receivingRoutes);
app.use('/api/replenishments', replenishmentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

export default app;

