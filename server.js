if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

const errorController = require('./middleware/errorHandler');
const headers = require('./middleware/headers');

const winston = require('winston');

const mongoose = require('mongoose');

//import routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

//logger
process.on('uncaughtException', (ex) => {
  console.log('unct excep', ex);
  winston.error(ex.message, ex);
  process.exit(1);
});

process.on('unhandledRejection', (ex) => {
  console.log('unh Rej');
  winston.error(ex.message, ex);
  process.exit(1);
});

winston.configure({
  transports: [new winston.transports.File({ filename: 'logfile.log' })],
});

//init express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(headers);

//init helmet
app.use(helmet());

//init mongoose
mongoose.connect(process.env.DB_CONNECT).then(
  () => {
    console.log('Mongoose is connected');
  },
  (err) => {
    console.log(err);
  }
);

//set port
const PORT = process.env.PORT;

// routes
app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get('/', (req, res) => {
  // res.send("Your are awesome, but don't use this end-point ;)");
  throw new Error('Oops Something Went Wrong');
});

//err handler
app.use(errorController);

app.listen(PORT, () => {
  console.log(`PORT:${PORT}`);
});
