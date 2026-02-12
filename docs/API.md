# API Documentation

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://api.yourdomain.com`

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Health Check Endpoints

### GET /health
Basic health check

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "message": "Server is running",
  "timestamp": "2026-02-01T15:30:00.000Z",
  "environment": "production",
  "uptime": 3600
}
```

### GET /health/detailed
Detailed health check with database status

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-02-01T15:30:00.000Z",
  "server": {
    "uptime": 3600,
    "memory": {...},
    "environment": "production",
    "nodeVersion": "v18.0.0"
  },
  "database": {
    "connected": true,
    "size": 1024000,
    "collections": 4
  }
}
```

## User Endpoints

### GET /api/users/:email
Get user profile

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "1234567890",
    "walletBalance": 1000,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### POST /api/users/:email
Create or update user profile

**Authentication**: Optional (creates new user if not authenticated)

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "1234567890",
    "walletBalance": 0
  }
}
```

## Wallet Endpoints

### GET /api/users/:email/wallet
Get wallet balance

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1000
  }
}
```

### PUT /api/users/:email/wallet
Update wallet balance

**Authentication**: Required

**Request Body:**
```json
{
  "amount": 500,
  "type": "credit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet updated successfully",
  "data": {
    "newBalance": 1500
  }
}
```

## Transaction Endpoints

### GET /api/users/:email/transactions
Get user transactions

**Authentication**: Required

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50)
- `type` (optional): Filter by transaction type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_123",
      "amount": 100,
      "type": "payment",
      "description": "15 min call with Priya",
      "createdAt": "2026-02-01T15:00:00.000Z"
    }
  ]
}
```

### POST /api/users/:email/transactions
Add a transaction

**Authentication**: Required

**Request Body:**
```json
{
  "amount": 100,
  "type": "payment",
  "description": "15 min call with listener"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": {
    "id": "txn_123",
    "amount": 100,
    "type": "payment"
  }
}
```

## Favorites Endpoints

### GET /api/users/:email/favorites
Get favorite listeners

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "favorites": ["listener_1", "listener_2"]
  }
}
```

### PUT /api/users/:email/favorites
Update favorite listeners

**Authentication**: Required

**Request Body:**
```json
{
  "favorites": ["listener_1", "listener_2", "listener_3"]
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "status": "error",
  "message": "Error description"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Payment**: 10 requests per hour

Rate limit information is included in response headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1643724000
```

## Webhooks (Future)

When payment integrations are added, webhook endpoints will be available for:
- Payment confirmation
- Payment failure
- Refund processing
