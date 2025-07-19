// config/config.ts
import { ConfigModule } from '@nestjs/config';

export const configureEnvironment = () => {
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  });
};