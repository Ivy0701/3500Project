import mongoose from 'mongoose';

// 方法三：强行接入 - 直接写死连接字符串
const MONGODB_URI = 'mongodb+srv://comp_user:789456123@cluster0.oqtm8xy.mongodb.net/?appName=Cluster0';
console.log('🔧 使用强行接入模式，直接连接数据库...');

const connectDb = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

export default connectDb;
