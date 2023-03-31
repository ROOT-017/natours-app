const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(viewsController.alerts)

router.get("/", authController.isLoggedIn, viewsController.getOverview);
//router.get("/tour", viewsController.getTours);
router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTours);

router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);

router.get("/me", authController.protect, viewsController.getAccount);
router.get("/mytours", authController.protect, viewsController.getMyTours);

module.exports = router;
