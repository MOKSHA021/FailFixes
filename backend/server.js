const app = require('./app');
const { connectDB } = require('./utils/database');
const config = require('./config/config');

// Database connection
connectDB();

// Start server
const server = app.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════╗
║          🎉 FailFixes Server             ║
║              Started Successfully!        ║
╠══════════════════════════════════════════╣
║ 🌐 Port: ${config.port.toString().padEnd(29)} ║
║ 📱 Environment: ${config.nodeEnv.padEnd(18)} ║  
║ 🕒 Started: ${new Date().toLocaleTimeString().padEnd(20)} ║
║ 🚀 API URL: http://localhost:${config.port}/api${' '.repeat(7)} ║
╚══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n👋 ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('💤 HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
