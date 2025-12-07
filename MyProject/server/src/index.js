import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';

dotenv.config();

const DEFAULT_PORT = Number(process.env.PORT) || 4000;

const startServer = (port) => {
  const server = http.createServer(app);

  server.listen(port, '0.0.0.0', () => {
    console.log(`API server listening on http://0.0.0.0:${port}`);
    console.log(`API server accessible at http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use.`);
      if (process.env.PORT) {
        console.error('Please free the configured port or change the PORT environment variable.');
        process.exit(1);
      } else {
        const nextPort = port + 1;
        console.log(`Attempting to use port ${nextPort} instead...`);
        setTimeout(() => startServer(nextPort), 500);
      }
    } else {
      throw error;
    }
  });
};

startServer(DEFAULT_PORT);

