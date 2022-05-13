import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const rootDir = process.env.NODE_ENV === 'development' ? 'src' : 'build';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'kevin.heard',
  password: '',
  database: 'readit',
  synchronize: true,
  logging: true,
  entities: [rootDir + '/entity/**/*{.ts,.js}'],
  migrations: [rootDir + '/migration/**/*{.ts,.js}'],
  subscribers: [rootDir + '/subscribers/**/*{.ts,.js}'],
});
