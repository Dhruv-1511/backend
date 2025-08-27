const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { errors: celebrateErrors } = require('celebrate');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use('/api', routes);

app.use(notFound);
app.use(celebrateErrors());
app.use(errorHandler);

module.exports = app;
