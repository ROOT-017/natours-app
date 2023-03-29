const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchAsync");

const multer = require("multer");
const sharp = require("sharp");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, `public/img/users`);
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, Please uplaod only images"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const factory = require("./handlerFactory");

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.reSizeTourImages = async (req, res, next) => {
  if (!req.files.images || !req.files.imageCover) return next();

  //1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2) Images        .toFormat("jpeg")

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
};
//Tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage, price";
  req.query.fields = "name,price,ratingsAverage,summery,dufficulty";
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: "reviews" });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatngs: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { average: 1 },
    },
  ]);
  res.status(200).json({
    results: stats.length,
    status: "success",
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  //try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    results: plan.length,
    status: "success",
    data: { plan },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, unit, latlng } = req.params;
  const [lat, lng] = latlng.split(",");

  const radianRadius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  // : new AppError("Measuring unit should be either mi or km only"); // 3,950
  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide both longitude and latitude in the format like this lat,log",
        400
      )
    );

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radianRadius],
      },
    },
  });

  res.status(200).json({
    status: "sucess",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { unit, latlng } = req.params;

  const unitMultiplier = unit === "mi" ? 0.000621371 : 0.001;
  const [lat, lng] = latlng.split(",");
  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide both longitude and latitude in the format like this lat,log",
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: unitMultiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "sucess",
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
// : new AppError("Measuring unit should be either mi or km only"); // 3,950
