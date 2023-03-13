const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apifeatures');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//exports.checkId = (req, res, next, val) => {
// if (req.params.id * 1 > tours.length) {
//   return res.status(404).json({
//     status: 'Fail',
//     message: 'Invalid ID',
//   });
// }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'Fail',
//       message: 'Misssing Propersties',
//     });
//   }//
//   next();
// };
//ROUT HANDLERS

//Tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name,price,ratingsAverage,summery,dufficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY
    // //1)FILTERING
    // const queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => {
    //   delete queryObj[el];
    // });

    // //EXECUTE QUERY
    // //2)ADVANCED FILTRING
    // //const queryStr = JSON.stringify(queryObj).replace('gte', '$gte');
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));

    //3 Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    //4) FIELD LIMITING
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }
    //5) PAGINATION
    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 100;
    // const skip = (page - 1) * limit;
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (numTours >= skip) throw new Error('This page soent exist');
    // }

    // query = query.skip(skip).limit(limit);

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .sort()
      .limitFields()
      .pagination();
    // .filter().sort().limitfields().pagination()
    const tours = await features.query;

    //SENDING RESPOSE
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      toursSize: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invald Dataset',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invald Dataset',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invald Dataset',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    await Tour.findByIdAndDelete(id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invald Dataset',
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 },
        },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatngs: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { average: 1 },
      },
    ]);
    res.status(200).json({
      results: stats.length,
      status: 'success',
      data: { stats },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invald Dataset',
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
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
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
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
      status: 'success',
      data: { plan },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invald Dataset',
    });
  }
};
