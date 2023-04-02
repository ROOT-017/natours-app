const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(.*?[^\\])\1/)[0];
  const message = `Duplicate field value ${value}. Please use different one`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(msg => msg.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token please login again!", 401);

const handlExpiredJWTError = () =>
  new AppError("Token expired, please login again!", 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api"))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  else
    return res.status(err.statusCode).render("error", {
      title: "Not Found",
      msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message || "An error occured",
      });
    }
    console.error("ERROR 💥️");
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
  //RENDERED SITE
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Not Found",
      msg: err.message,
    });
  }
  console.error("ERROR 💥️");
  console.log(err);
  return res.status(err.statusCode).render("error", {
    title: "Not Found",
    msg: "Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Fail";

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "CastError") {
      error = handleCastErrorDB(err);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    } else if (err.name === "ValidationError") {
      error = handleValidationErrorDB(err);
    } else if (err.name === "JsonWebTokenError") {
      error = handleJWTError();
    } else if (err.name === "TokenExpiredError") {
      error = handlExpiredJWTError();
    }
    return sendErrorProd(error, req, res);
  }
};
