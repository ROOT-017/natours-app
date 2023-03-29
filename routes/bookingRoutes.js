const express = require("express");
const bookingControllers = require("../controllers/bookingControllers");
const authController = require("../controllers/authController");

const router = express.Router();

router.get(
  "/checkout-session/:tourId",
  authController.protect,
  bookingControllers.getCheckoutSession
);

router.use(authController.protect);
router
  .route("/")
  .get(bookingControllers.getAllBookings)
  .post(bookingControllers.createBooking);
router
  .route("/:id")
  .get(bookingControllers.getBooking)
  .post(bookingControllers.updateBooking)
  .delete(bookingControllers.deleteBooking);

module.exports = router;
