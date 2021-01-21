const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', function(worker) {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // eslint-disable-next-line global-require
  require('./server.js');
}
