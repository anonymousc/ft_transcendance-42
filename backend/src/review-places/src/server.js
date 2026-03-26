require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const reviewsRouter = require('./routes/reviews');

const app  = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use('/', reviewsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'review-places' }));

app.listen(PORT, () => {
  console.log(`Review Places Service running on port ${PORT}`);
});
