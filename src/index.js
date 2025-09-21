import express from 'express';
import routes from './routes/index.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});