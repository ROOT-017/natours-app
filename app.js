const express = require("express");
const morgan = require("morgan");

const userRouter = require("./routes/userRoutes");
const tourRouter = require("./routes/tourRoutes");

const app = express();
//MIDDLEWARE
app.use(morgan("dev"));

app.use(express.json());

app.use(express.static(`${__dirname}/public/`));

//app.use(tourRouter.tourControllers.checkBody)
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/*
app.get('/api/v1/tours', getAllTours);
app.post('/api/v1/tours', createTour);
 */
//ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

//Catching unhandle routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "Fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
  next(err)
});

module.exports = app;
