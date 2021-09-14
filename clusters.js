/* eslint-disable global-require */
require('dotenv').config();
const cluster = require('cluster');
const OS = require('os');

process.env.UV_THREADPOOL_SIZE = OS.cpus().length;

if (cluster.isMaster) {
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
