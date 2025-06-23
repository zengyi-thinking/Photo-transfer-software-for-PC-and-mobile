import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB连接配置
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/filetransfer';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB连接成功');
    
    // 监听连接事件
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB连接错误:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB连接断开');
    });
    
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// Redis连接配置
export const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    const client = createClient({
      url: redisUrl,
      retry_delay_on_failover: 100,
      max_attempts: 3,
    });
    
    client.on('error', (error) => {
      console.error('Redis连接错误:', error);
    });
    
    client.on('connect', () => {
      console.log('Redis连接成功');
    });
    
    client.on('reconnecting', () => {
      console.log('Redis重新连接中...');
    });
    
    await client.connect();
    
    return client;
  } catch (error) {
    console.error('Redis连接失败:', error);
    throw error;
  }
};

// 数据库健康检查
export const checkDatabaseHealth = async () => {
  const health = {
    mongodb: false,
    redis: false,
  };
  
  try {
    // 检查MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.mongodb = true;
    }
  } catch (error) {
    console.error('MongoDB健康检查失败:', error);
  }
  
  try {
    // 检查Redis
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    await redisClient.connect();
    await redisClient.ping();
    await redisClient.disconnect();
    health.redis = true;
  } catch (error) {
    console.error('Redis健康检查失败:', error);
  }
  
  return health;
};
