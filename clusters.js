/* eslint-disable global-require */
require('dotenv').config();
const cluster = require('cluster');
const { connect } = require('mongoose');

const { dbUrl } = require('./utils/dbUrls');

if (cluster.isMaster) {
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
        setInterval(() => {
          const {
            shiftEndChecker,
          } = require('./src/routes/rider/shiftEndChecker');

          shiftEndChecker();
        }, 10000);

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
