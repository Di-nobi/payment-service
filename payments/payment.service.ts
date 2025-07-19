import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreatePaymentDto } from '../dtos/payment.dto';

@Injectable()
export class PaymentService {
  private readonly redis: Redis;
  private readonly rabbitmq: ClientProxy;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    });
    this.rabbitmq = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL')],
        queue: 'payment_queue',
        queueOptions: { durable: true },
      },
    } as any);
  }

  async createPayment(userId: string, payload: CreatePaymentDto, jwtToken: string): Promise<string> {

    //This validates the orderId
    const orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL') || 'http://order-service:3000';
    try {
      await firstValueFrom(
        this.httpService.get(`${orderServiceUrl}/orders/${payload.orderId}`, {
          headers: {
            'X-API-Key': this.configService.get<string>('API_KEY'),
            Authorization: `Bearer ${jwtToken}`,
          },
        }),
      );
    } catch (err) {
      console.error(err)
      throw new BadRequestException('Unable to fetch Order Id');
    }

    const paymentId = uuidv4();
    const payment = { id: paymentId, userId, ...payload, createdAt: new Date(), status: 'confirmed' };
    await this.redis.set(`payment:${paymentId}`, JSON.stringify(payment));
    await this.rabbitmq.emit('payment.confirmed', payment).toPromise();
    return paymentId;
  }

  async getPayment(paymentId: string): Promise<any> {
    const payment = await this.redis.get(`payment:${paymentId}`);
    if (!payment) throw new BadRequestException('Payment not found');
    return JSON.parse(payment);
  }
}