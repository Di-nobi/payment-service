# Payment Service

The **Payment Service** handles payment creation via HTTP, verifying orders with the Order Service and publishing `payment.confirmed` events to RabbitMQ.

---

## 🧰 Prerequisites

- Node.js 18.x  
- Docker & Docker Compose V2  
- Git

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/payment-service.git
cd payment-service
npm install

###env
REDIS_HOST=redis  
REDIS_PORT=6379  
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672  
JWT_SECRET=your_secure_jwt_secret_here  
API_KEY=1234567812  
SWAGGER_API_NAME=Payment Service  
SWAGGER_API_DESCRIPTION=Payment processing service  
SWAGGER_API_CURRENT_VERSION=1.0  
SWAGGER_API_ROOT=api  
ORDER_SERVICE_URL=http://order-service:3000

##Run with Docker
docker compose  up --build

# payment-service/docker-compose.yml
version: '3.8'
services:
  payment-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3003:3000'
    env_file:
      - .env
    depends_on:
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - shared-network
  redis:
    image: redis:6
    ports:
      - '6381:6379'
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - shared-network
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - '5674:5672'
      - '15674:15672'
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    healthcheck:
      test: ["CMD", "rabbitmqctl", "status"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - shared-network
networks:
  shared-network:
    name: shared-network
    external: true

| Method | Endpoint         | Description       | Request Body                                | Response Body                                                                                                                                                                           |
| ------ | ---------------- | ----------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | /payments/create | Create a payment  | `{ "orderId": "string", "amount": number }` | `{ "success": true, "message": "Payment created", "data": { "paymentId": "string" } }`                                                                                                  |
| GET    | /payments/\:id   | Get payment by ID | None                                        | `{ "success": true, "message": "Payment retrieved", "data": { "id": "string", "userId": "string", "orderId": "string", "amount": number, "createdAt": "string", "status": "string" } }` |

###Local Tests

docker compose  up --build

curl -X POST http://localhost:3001/auth/register \
  -H "X-API-Key: 1234567812" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

###Creates an ordr
curl -X POST http://localhost:3002/orders/create \
  -H "X-API-Key: 1234567812" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"product":"Laptop","quantity":2}'

###Create payment
curl -X POST http://localhost:3003/payments/create \
  -H "X-API-Key: 1234567812" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"<orderId>","amount":999.99}'

###Gets a payment
curl -X GET http://localhost:3003/payments/<paymentId> \
  -H "X-API-Key: 1234567812" \
  -H "Authorization: Bearer <jwt_token>"

</details>