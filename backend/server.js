const express = require('express');
const cors = require('cors');
require('dotenv').config();

const generateRoute = require('./routes/generate');
const coachRoute = require('./routes/coach');
const refineRoute = require('./routes/refine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

app.use('/api/generate', generateRoute);
app.use('/api/coach', coachRoute);
app.use('/api/refine', refineRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
