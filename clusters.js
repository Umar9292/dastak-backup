/* eslint-disable global-require */
require('dotenv').config();
const cluster = require('cluster');

if (cluster.isMaster) {
  for (let i = 0; i < 6; i += 1) {
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
