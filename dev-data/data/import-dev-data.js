const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");

const Tour = require("../../models/tourModel");
const Review = require("../../models/reviewModel");
const User = require("../../models/userModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
).replace("<NAME>", process.env.DATABASE_NAME);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.info("DB connection Sucessfull"))
  .catch(err => {
    console.log("There was an error");
    console.log(err);
  });

//READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

//IMPORT DATA INTO DATABASE

const importData = async () => {
  try {
    // await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false });
    await Review.create(review);

    console.log("Data Successfully Loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA IN DB

const deleteData = async () => {
  try {
    await Review.deleteMany();
    // await User.deleteMany();
    // await Tour.deleteMany();
    console.log("Data Successfully Deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
