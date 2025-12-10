// test.js - Test environment variable loading
import dotenv from 'dotenv';
dotenv.config();

console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已配置' : '未配置');

// Force exit process to prevent hanging
process.exit(0);
//