import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payments/payment.modules';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PaymentModule,
  ],
})
export class AppModule {}