import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1', routes);


const startServer = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');

      app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`DB connection failed (attempt ${i + 1}):`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      } else {
        console.error('All retries failed. Exiting...');
        process.exit(1);
      }
    }
  }
};

startServer();