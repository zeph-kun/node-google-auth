const app = require('./src/app');
const { PORT } = require('./src/config/env');
const connectDB = require('./src/config/db');

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
