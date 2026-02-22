require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', mongoURI);

// Connect to MongoDB
mongoose.connect(mongoURI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  // Start server
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
