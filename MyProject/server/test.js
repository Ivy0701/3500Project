// test.js - 测试环境变量加载
import dotenv from 'dotenv';
dotenv.config();

console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已配置' : '未配置');

// 强制退出进程，防止卡住
process.exit(0);
//