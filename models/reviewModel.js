const mongoose = require("mongoose");
const Tour = require("./tourModel");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, "Review can't be empty"],
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      require: [true, "A review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "A review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({ path: "tour", select: "name" }).populate({
  //     path: "user",
  //     select: "name photo",
  //   });
  this.populate({ path: "user", select: "name photo" });

  next();
});

reviewSchema.statics.calAverageRatngs = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        averageAverage: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].averageAverage,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.3,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calAverageRatngs(this.tour);
});

reviewSchema.pre(/findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/findOneAnd/, async function () {
  await this.r.constructor.calAverageRatngs(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
