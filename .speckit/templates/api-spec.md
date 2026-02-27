# API Endpoint: {{ENDPOINT_NAME}}

## Spec ID: API-XXX
## Status: Draft
## Version: 1.0

---

## 1. Endpoint Overview

| Property | Value |
|----------|-------|
| Method | GET / POST / PATCH / DELETE |
| Path | /api/{{path}} |
| Auth | Required / Optional |
| Rate Limit | X requests/minute |

---

## 2. Request

### Headers
| Header | Required | Description |
|--------|----------|-------------|
| Content-Type | Yes | application/json |
| Authorization | Yes | Bearer token (via cookie) |

### Path Parameters
| Param | Type | Description |
|-------|------|-------------|
| id | string | Resource ID |

### Query Parameters
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 20 | Max items to return |
| offset | number | 0 | Pagination offset |

### Request Body
```typescript
interface {{RequestName}} {
  field1: string;
  field2?: number;
}
```

### Example Request
```http
POST /api/{{path}}
Content-Type: application/json

{
  "field1": "value",
  "field2": 42
}
```

---

## 3. Response

### Success Response (200/201)
```typescript
interface {{ResponseName}} {
  data: {
    id: string;
    // ... other fields
  };
  error: null;
}
```

### Example Success
```json
{
  "data": {
    "id": "123",
    "field1": "value"
  },
  "error": null
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Not authenticated |
| 403 | FORBIDDEN | Not authorized |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_ERROR | Server error |

### Example Error
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field1 is required"
  }
}
```

---

## 4. Business Logic

1. Validate request body
2. Check user authentication
3. Check user authorization
4. Perform database operation
5. Log activity (if applicable)
6. Return response

---

## 5. Database Operations

```sql
-- Query description
SELECT * FROM table WHERE condition;

-- Or Supabase client
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('column', value);
```

---

## 6. Validation Rules

| Field | Rules |
|-------|-------|
| field1 | Required, string, max 255 chars |
| field2 | Optional, number, min 0 |

---

## 7. Authorization Rules

- User must be authenticated
- User must be board member (for board resources)
- Only owner can perform certain actions

---

## 8. Testing

### Unit Tests
- [ ] Validation logic
- [ ] Authorization checks

### Integration Tests
- [ ] Success case
- [ ] Validation error case
- [ ] Authorization error case
- [ ] Not found case

### Example Test Cases
```typescript
describe('POST /api/{{path}}', () => {
  it('should create resource when valid', async () => {
    // test implementation
  });
  
  it('should return 400 for invalid body', async () => {
    // test implementation
  });
  
  it('should return 401 when not authenticated', async () => {
    // test implementation
  });
});
```

