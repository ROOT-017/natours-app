const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apifeatures");

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    //  try {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError(`No document found with ID ${id}`, 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // try {
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError(`No document found with ID ${id}`, 404));

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // try {
    // const newTour = new Tour({});
    // newTour.save();
    const doc = await Model.create(req.body);

    //if (!newTour) return next(new AppError(`No tour found with ID ${id}`, 404));

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
    // } catch (err) {
    //   res.status(400).json({
    //     status: "fail",
    //     message: err,
    //   });
    // }
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //try {
    const { id } = req.params;

    let query = Model.findById(id);

    if (popOptions) query = Model.findById(id).populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError(`No document with ID ${id}`, 404));

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //Allow review for nested routes(hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;
    //SENDING RESPOSE
    res.status(200).json({
      status: "success",
      requestTime: req.requestTime,
      toursSize: doc.length,
      data: {
        data: doc,
      },
    });
  });
