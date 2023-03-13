const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.info('DB connection Sucessfull'))
  .catch((err) => {
    console.log('There was an error');
    console.log(err);
  });

//READ JSON FILE

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//IMPORT DATA INTO DATABASE

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Successfully Loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA IN DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Successfully Deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
