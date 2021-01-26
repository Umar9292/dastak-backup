const cluster = require('cluster');

if (cluster.isMaster) {
  for (let i = 0; i < 3; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', function(worker) {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // eslint-disable-next-line global-require
  require('./server.js');
}
