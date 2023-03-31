const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const factory = require("./handlerFactory.js");

exports.alerts = (res, req, next) => {
  const { alert } = req.query || "";
  if (alert === "booking")
    res.locals.alert = `Yur booking was successful. Please check your email for confirmation \n
     If your booking doesent shows here immediately, Please come back later`;

  next();
};
exports.getOverview = catchAsync(async (req, res) => {
  //1)Get tour data from collection
  const tours = await Tour.find();
  //2)Build template

  //3)Render that template using the tour data
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTours = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  if (!tour)
    return next(new AppError(`There is no tour with name: ${req.params.slug}`));

  res.status(200).render("tour", {
    title: `${tour.name}`,
    tour,
  });
});

// exports.getHome = (req, res) => {
//   res.status(200).render("base", { tour: "The Forest Hiker", user: "TERENCE" });
// };

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: `Log into your account`,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: `Natour`,
  });
};
exports.getMyTours = catchAsync(async (req, res, next) => {
  //1 Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  //2) find all bookings fo a user
  const tourIds = bookings.map(booking => booking.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render("account", {
    title: `Natour`,
    user: updatedUser,
  });
});
