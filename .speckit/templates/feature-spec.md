# Feature: {{FEATURE_NAME}}

## Spec ID: FEAT-XXX
## Status: Draft
## Version: 1.0
## Priority: Must Have | Should Have | Could Have

---

## 1. Overview

Mô tả ngắn gọn về feature này.

---

## 2. User Stories

### US-XXX: {{Story Title}}
**As a** {{role}}  
**I want to** {{action}}  
**So that** {{benefit}}

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## 3. Data Structures

```typescript
interface {{EntityName}} {
  id: string;
  // ... other fields
}
```

---

## 4. API Endpoints

### POST /api/{{endpoint}}

**Request:**
```typescript
interface {{RequestName}} {
  // fields
}
```

**Response:**
```typescript
interface {{ResponseName}} {
  // fields
}
```

**Business Logic:**
1. Step 1
2. Step 2
3. Step 3

---

## 5. UI Specifications

### 5.1 {{Component Name}}

```
┌────────────────────────────────────┐
│ Visual mockup here                 │
└────────────────────────────────────┘
```

---

## 6. Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Error type | Message to show | How to recover |

---

## 7. Testing Scenarios

### Unit Tests
- [ ] Test case 1
- [ ] Test case 2

### Integration Tests
- [ ] Test case 1
- [ ] Test case 2

### E2E Tests
- [ ] Test case 1
- [ ] Test case 2

