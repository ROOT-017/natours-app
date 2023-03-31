const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = rquire("cors");

const compression = require("compression");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const userRouter = require("./routes/userRoutes");
const tourRouter = require("./routes/tourRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const app = express();

app.set("view engine", "pug");

app.set("views", path.join(__dirname, "views"));

//Serving static files
app.use(express.static(path.join(__dirname, "public")));

app.use(compression());

app.use(cors());

app.options("*", cors());

// console.log(process.env.NODE_ENV);
// console.log(process.env.DATABASE);

//MIDDLEWARE
//Set security header
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.use(morgan("dev"));
// console.log(`Confirming dev mode`);

//Limiting request from thesame IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: `To many request form this IP, Please try again in an hour!`,
});

app.use("/api", limiter);

//Body parser, reading data form body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//Data santzation against NoSQL
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "price",
      "difficulty",
      "ratingsQuantity",
      "ratingsAverage",
    ],
  })
);

//app.use(tourRouter.tourControllers.checkBody)

//Testing middleware
app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  next();
});
/*
app.get('/api/v1/tours', getAllTours);
app.post('/api/v1/tours', createTour);
 */
//ROUTES

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

//Catching unhandle routes
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "Fail",
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = "Fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
