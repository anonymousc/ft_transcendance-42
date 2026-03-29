// require('dotenv').config();
const express = require('express');
const cors = require('cors');
const autocompleteRouter = require('./routes/autocomplete');
const { router: placesRouter } = require('./routes/places');
const suggestRouter = require('./routes/suggest');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/', autocompleteRouter);
app.use('/', placesRouter);
app.use('/', suggestRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`AI Places Service running on port ${PORT}`);
});
