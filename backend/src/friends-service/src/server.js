require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const friendsRouter = require('./routes/friends');
const chatRouter = require('./routes/chat');
const notificationsRouter = require('./routes/notifications');
require('./sockets/chatSocket');
require('./sockets/notificationSocket');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://localhost',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'friends-service' }),
);

app.use('/friends', friendsRouter);
app.use('/chat', chatRouter);
app.use('/notifications', notificationsRouter);
app.listen(PORT, () => {
  console.log(`Friends service running on port ${PORT}`);
});
