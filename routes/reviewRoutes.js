const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .post(
    authController.restictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  )
  .get(authController.protect, reviewController.getAllReviews);
router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(
    authController.restictTo("admin", "user"),
    reviewController.deleteReview
  )
  .patch(
    authController.restictTo("admin", "user"),
    reviewController.updateReview
  );

module.exports = router;
