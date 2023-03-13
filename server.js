const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<NAME>', process.env.DATABASE_NAME);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.info('DB connection Sucessfull')) // eslint-disable-line
  .catch((err) => {
    console.log('There was an error');
    console.log(err);
  });

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App runing on port ${port}..`);
});
