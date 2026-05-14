# User Login Feature Documentation

## Overview
This document describes the user login feature implementation.

## API Endpoint
- **Method**: POST
- **URL**: `/api/auth/login`
- **Content-Type**: application/json

## Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Response (Success - 200)
```json
{
  "data": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Response (Error - 400)
```json
{
  "error": "Username atau Password salah"
}
```

## Implementation Details

### Database Schema
- **Table**: sessions
- **Columns**:
  - id: INT AUTO_INCREMENT PRIMARY KEY
  - token: VARCHAR(255) NOT NULL UNIQUE
  - user_id: INT NOT NULL (FK to users.id)
  - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### Service Layer
- **File**: src/services/auth-service.ts
- **Function**: loginUser(email, password)
- **Returns**: UUID token string

### Route Handler
- **File**: src/routes/auth.ts
- **Endpoint**: POST /auth/login
- **Validation**: Email format, password required

## Security Features
1. Password verification using bcrypt
2. UUID tokens for session management
3. Generic error messages to prevent email enumeration
4. Input validation on all fields
5. Foreign key constraints on database

## Usage Example
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Error Handling
- Invalid email format: Returns validation error
- Empty password: Returns validation error
- User not found: Returns "Username atau Password salah"
- Wrong password: Returns "Username atau Password salah"
- Database error: Returns "Username atau Password salah"

## Next Steps
1. Implement token validation middleware
2. Create logout endpoint
3. Add session expiry
4. Implement token refresh mechanism
