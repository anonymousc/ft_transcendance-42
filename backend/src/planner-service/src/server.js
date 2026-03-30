require('dotenv').config();
const express = require('express');
const cors = require('cors');
const planRouter = require('./routes/plan');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT_PLAN || 7000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/', healthRouter);
app.use('/', planRouter);

app.listen(PORT, () => {
  console.log(`Planner Service running on port ${PORT}`);
});
