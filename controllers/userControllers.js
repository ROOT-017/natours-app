const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(fieldName => {
    if (allowedFields.includes(fieldName)) newObj[fieldName] = obj[fieldName];
  });
  return newObj;
};
//Users
exports.getAllUsers = factory.getAll(User);
//DO NOT ATTEMPt TO update PASSWORD WITH THIS
exports.updateUser = factory.updateOne(User);

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.deleteUser = factory.deleteOne(User);

exports.getUser = factory.getOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user post passwords data

  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route isn't to update password.Please user /updatemypassword instead",
        400
      )
    );
  const filteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});
