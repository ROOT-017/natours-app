const express = require("express");

const router = express.Router();

const userController = require("../controllers/userControllers");

const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotpassword", authController.forgotPassword);
router.patch("/resetpassword/:token", authController.resetPassword);
//
router.use(authController.protect); //Any route below this line/middleware is protected

router.get("/me", userController.getMe, userController.getUser);
router.patch(
  "/updateme",
  userController.uploadUserPhoto,
  userController.reSizeUserPhoto,
  userController.updateMe
);
router.patch("/updatemypassword", authController.updatePassword);
router.delete("/deleteme", userController.deleteMe);

//All routes below this middleware/line are restricted to admininistrators only
router.use(authController.restictTo("admin"));
router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
