require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const favRouter = require('./routes/fav');

const app  = express();
const PORT = process.env.PORT || 4002;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/', favRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'fav-places' }));

app.listen(PORT, () => {
  console.log(`Fav Places Service running on port ${PORT}`);
});
