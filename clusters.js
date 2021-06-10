/* eslint-disable global-require */
const cluster = require('cluster');

if (cluster.isMaster) {
  const server = require('http').createServer();
  const io = require('socket.io')(server);
  const redis = require('socket.io-redis');

  io.adapter(redis({ host: 'localhost', port: 6379 }));

  for (let i = 0; i < 5; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', function(worker) {
    console.log(`worker ${worker.process.pid} died`);
  });
}

if (cluster.isWorker) {
  // eslint-disable-next-line global-require
  require('./server.js');
}
