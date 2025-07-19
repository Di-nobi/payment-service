import { Controller, Post, Body, Get, Param, Request, UseGuards, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '../dtos/payment.dto';
import { ApiOperation, ApiTags, ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyGuard } from '../guard/apiKey.guard'
import { JwtGuard} from '../guard/jwt.guard';

@Controller('payments')
@ApiTags('payments')
@ApiSecurity('Api-Key')
@ApiBearerAuth('JWT')
@UseGuards(ApiKeyGuard, JwtGuard)
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) {}

  @Post('create')
  @ApiOperation({ summary: 'Creates a payment for an order' })
  @HttpCode(201)
  async createPayment(@Body() body: CreatePaymentDto, @Request() req: any) {
    const userId = req.user.id;
    const jwtToken = req.headers['authorization']?.split(' ')[1];
    const paymentId = await this.paymentsService.createPayment(userId, body, jwtToken);
    return { 
      success: true, 
      message: 'Payment created', 
      data: { paymentId } 
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @HttpCode(200)
  async getPayment(@Param('id') id: string) {
    const payment = await this.paymentsService.getPayment(id);
    return { 
      success: true, 
      message: 'Payment retrieved', 
      data: payment 
    };
  }
}