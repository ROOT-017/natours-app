const { promisify } = require("util");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError"); //
//const sendEmail = require("../utils/email");
const Email = require("../utils/email");

const crypto = require("crypto");

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  // console.log(res.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: "2022-02-19",
    role: req.body.role || "user",
  });

  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Check if email and password exist
  if (!password || !email) {
    return next(new AppError("Please provide an email and password", 400));
  }

  //2) Check if user exist && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //3) If Everything is correct, send token to client
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
});
exports.logout = catchAsync((req, res, next) => {
  res.cookie("jwt", "logging out...", {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(new AppError("Your are not log in, Please Log in", 401));

  //2) validate the token

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  //3)Check if user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("The User with token don't exist", 401));
  }
  //4) check if user changed password after token has being issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User change password recently, login again", 401)
    );
  }
  //Grand access to the protected route
  res.locals.user = currentUser;
  req.user = currentUser;
  next();
});
// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_KEY
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.restictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You dont have permission to perform this action", 403)
      );
    next();
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on posted email;\
  // console.log(req.body.email);
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("No user found with this email", 404));

  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to the users email

  //const message = `Forgot your password? Submit a PATCH request with you new password and passwordConfirm to: ${resetURL}.\n If you didn't forgot your password, please ignore this email!`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "Your password reset token(valid for 10 min)}",
    //   message,
    // });
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetpassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Check your email for token",
    });
  } catch (err) {
    user.passwordResetTooken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user base on token
  const resetToken = req.params.token;
  const hashToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetTooken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expires and there is a user with the token set the new password
  if (!user) return next(new AppError("Token invalid or expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetTooken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  //3) Update changepassword property for the user

  //4) Log the user in, send JWT
  createSendToken(user, 200, res);

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   //1)Get the user from collection
//   const user = await User.findById(req.user.id).select("+password");

//   if (!user) return next(new AppError("Expired or invalid token"));
//   //2) checkeif posted password is correct
//   if (req.body.newPassword != req.body.passwordConfirm)
//     return next(new AppError("Passwords don't match", 401));

//   const candidatePassword = req.body.passwordCurrent;
//   const newPassword = req.body.newPassword;

//   let currrentPassword = user.password;
//   const checkPassword = await user.correctPassword(
//     candidatePassword,
//     currrentPassword
//   );
//   if (!checkPassword)
//     return next(new AppError("Your current password is wrong", 401));
//   //3)If so upadate password
//   user.password = newPassword;
//   user.passwordConfirm = newPassword;
//   user.save();
//   //3)log user in, sent jwt
//   createSendToken(user, 200, res);
// });
