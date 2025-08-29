const app = require('./app');
const { connectDB } = require('./utils/database');
const config = require('./config/config');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

// Initialize server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🎉 FailFixes Server                      ║
║                   Started Successfully!                     ║
╠══════════════════════════════════════════════════════════════╣
║ 🌐 Port: ${config.port.toString().padEnd(47)} ║
║ 📱 Environment: ${config.nodeEnv.padEnd(36)} ║  
║ 🕒 Started: ${new Date().toLocaleString().padEnd(38)} ║
║ 🚀 API URL: http://localhost:${config.port}/api${' '.repeat(25)} ║
║ 🏥 Health: http://localhost:${config.port}/api/health${' '.repeat(18)} ║
║ 📊 Database: ${config.database.uri.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'.padEnd(33)} ║
╚══════════════════════════════════════════════════════════════╝

🔧 Available Endpoints:
   • GET  /api/health           - Health check
   • POST /api/auth/login       - User login
   • POST /api/auth/register    - User registration
   • GET  /api/stories          - Get stories
   • GET  /api/users/suggested  - Get suggested users
   • GET  /api/users/dashboard  - User dashboard

💡 Tips:
   • Use Postman or curl to test API endpoints
   • Check logs for detailed request information
   • Frontend should connect to: http://localhost:${config.port}
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.error('💥 UNHANDLED REJECTION! Shutting down...');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      console.log(`\n👋 ${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        console.log('💤 HTTP server closed');
        
        try {
          await require('mongoose').connection.close();
          console.log('📤 Database connection closed');
        } catch (err) {
          console.error('❌ Error closing database connection:', err);
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
