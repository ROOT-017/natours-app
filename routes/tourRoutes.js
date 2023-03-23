const express = require("express");
const tourControllers = require("../controllers/tourControllers");
//const reviewController = require("./../controllers/reviewController");
const authController = require("../controllers/authController");

const reviewRouter = require("../routes/reviewRoutes");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

//router.param('id', tourControllers.checkId);
router
  .route("/top-5-tours")
  .get(tourControllers.aliasTopTours, tourControllers.getAllTours);

router.route("/tour-stats").get(tourControllers.getTourStats);

router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restictTo("admin", "lead-guide", "guide"),
    tourControllers.getMonthlyPlan
  );

router
  .route("/")
  .get(tourControllers.getAllTours)
  .post(
    authController.protect,
    authController.restictTo("lead-guide", "admin"),
    tourControllers.createTour
  );
router
  .route("/:id")
  .get(tourControllers.getTour)
  .patch(
    authController.protect,
    authController.restictTo("admin", "lead-guide"),
    tourControllers.updateTour
  )
  .delete(
    authController.protect,
    authController.restictTo("admin", "lead-guide"),
    tourControllers.deleteTour
  );

// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restictTo("user"),
//     reviewController.createReview
//   );
//router.post("/:tourId/reviews", reviewController.createReview);

module.exports = router;
