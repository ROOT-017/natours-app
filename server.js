const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", err => {
  console.error(err.name);
  console.error(err.message);
  console.log("UNCAUGHT EXCEPTION Shuting down...");
  process.exit(1);
});
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
).replace("<NAME>", process.env.DATABASE_NAME);
const port = process.env.PORT || 8000;
var server;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.info("DB connection Sucessfull🤗️");
    server = app.listen(port, () => {
      console.log(`App runing on port ${port}..👂️`);
    });
  }); // eslint-disable-line

process.on("unhandledRejection", err => {
  console.error(err.name);
  console.error(err.message);

  console.log("UNHANDLED REJECTION Shuting down...");

  server.close(() => {
    process.exit(1);
  });
});
