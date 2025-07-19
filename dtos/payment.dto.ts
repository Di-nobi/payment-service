import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID from Order Service' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  amount: number;
}