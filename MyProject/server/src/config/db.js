import mongoose from 'mongoose';

// Force connection mode - directly write the connection string
const MONGODB_URI = 'mongodb+srv://comp_user:789456123@cluster0.oqtm8xy.mongodb.net/?appName=Cluster0';
console.log('🔧 Using force connection mode, directly connecting to the database...');

const connectDb = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDb;
