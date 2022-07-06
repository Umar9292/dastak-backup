/* eslint-disable global-require */
require('dotenv').config();
const cluster = require('cluster');
const { connect } = require('mongoose');
const { schedule } = require('node-cron');
// const OS = require('os');

const { dbUrl } = require('./utils/dbUrls');
// const { shiftEndChecker } = require('./src/routes/rider/shiftEndChecker');
// const { shiftStartChecker } = require('./src/routes/rider/shiftStartChecker');

if (cluster.isMaster) {
  schedule(
    '1 20 17 * * *',
    () => {
      console.log('running every minute 1, 2, 4 and 5');
    },
    { scheduled: true, timezone: 'Asia/Karachi' }
  );

  connect(
    dbUrl,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
    err => {
      if (err) {
        console.log(err);
      } else {
        // setInterval(() => {
        //   shiftStartChecker();
        //   shiftEndChecker();
        // }, 10000);

        console.log('Connected to database');
      }
    }
  );

  for (let i = 0; i < 5; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code) {
    console.log(`worker ${worker.process.pid} died`);

    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
    }
  });
} else {
  // eslint-disable-next-line global-require
  require('./server.js');
}
