# 03. API Endpoints Specification

## Spec ID: SPEC-003
## Status: Approved
## Version: 1.0

---

## 1. API Overview

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://{domain}/api`

### Authentication
- All API endpoints (except auth) require authentication
- Use Supabase session token in cookies
- 401 Unauthorized if not authenticated

### Response Format

```typescript
// Success Response
interface SuccessResponse<T> {
  data: T;
  error: null;
}

// Error Response
interface ErrorResponse {
  data: null;
  error: {
    code: string;
    message: string;
  };
}
```

---

## 2. Authentication Endpoints

> Authentication is handled by Supabase Auth client-side.
> No custom API endpoints needed.

### Client-side Auth Functions

| Function | Description |
|----------|-------------|
| `supabase.auth.signUp()` | Register new user |
| `supabase.auth.signInWithPassword()` | Login with email/password |
| `supabase.auth.signOut()` | Logout |
| `supabase.auth.getUser()` | Get current user |
| `supabase.auth.getSession()` | Get current session |

---

## 3. Boards API

### 3.1 GET /api/boards
Get all boards for current user.

**Request:**
```http
GET /api/boards
```

**Response:**
```typescript
interface Board {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
  member_count: number;
}

// Response: Board[]
```

**Acceptance Criteria:**
- [x] Returns only boards where user is owner or member
- [x] Includes `is_owner` flag for each board
- [x] Includes `member_count` for each board
- [x] Sorted by updated_at DESC

---

### 3.2 POST /api/boards
Create a new board.

**Request:**
```typescript
interface CreateBoardRequest {
  title: string;      // required, max 255 chars
  description?: string;
}
```

**Response:**
```typescript
interface CreateBoardResponse {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  columns: Column[]; // 3 default columns created
}
```

**Business Logic:**
1. Create board with owner_id = current user
2. Create 3 default columns: "To Do" (0), "In Progress" (1), "Done" (2)
3. Auto-add user as board member with role "owner" (via trigger)
4. Log activity: "created board"

**Acceptance Criteria:**
- [x] Title is required
- [x] Title max 255 characters
- [x] Creates 3 default columns
- [x] Returns created board with columns
- [x] Activity logged

---

### 3.3 GET /api/boards/[boardId]
Get board details with columns and cards.

**Request:**
```http
GET /api/boards/{boardId}
```

**Response:**
```typescript
interface BoardDetail {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  columns: ColumnWithCards[];
  members: BoardMember[];
}

interface ColumnWithCards {
  id: string;
  title: string;
  position: number;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  assignee_id: string | null;
  assignee: { id: string; email: string; full_name: string | null } | null;
  due_date: string | null;
  created_at: string;
  comment_count: number;
}

interface BoardMember {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}
```

**Acceptance Criteria:**
- [x] Returns 404 if board not found
- [x] Returns 403 if user is not member
- [x] Columns sorted by position ASC
- [x] Cards sorted by position ASC within column
- [x] Includes assignee details
- [x] Includes comment count for each card

---

### 3.4 PATCH /api/boards/[boardId]
Update board details.

**Request:**
```typescript
interface UpdateBoardRequest {
  title?: string;
  description?: string;
}
```

**Response:**
```typescript
// Updated Board object
```

**Acceptance Criteria:**
- [x] Only owner can update
- [x] Returns 403 if not owner
- [x] Partial update supported

---

### 3.5 DELETE /api/boards/[boardId]
Delete a board.

**Request:**
```http
DELETE /api/boards/{boardId}
```

**Response:**
```typescript
{ success: true }
```

**Acceptance Criteria:**
- [x] Only owner can delete
- [x] Cascade deletes all columns, cards, comments, activities
- [x] Returns 403 if not owner

---

### 3.6 GET /api/boards/[boardId]/members
Get board members.

**Request:**
```http
GET /api/boards/{boardId}/members
```

**Response:**
```typescript
BoardMember[]
```

---

### 3.7 POST /api/boards/[boardId]/members
Add member to board.

**Request:**
```typescript
interface AddMemberRequest {
  email: string;
}
```

**Response:**
```typescript
interface AddMemberResponse {
  id: string;
  user_id: string;
  role: 'member';
  joined_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
}
```

**Business Logic:**
1. Find user by email
2. Check if already a member
3. Add as member with role "member"
4. Log activity: "added member"

**Acceptance Criteria:**
- [x] Only owner can add members
- [x] Returns 404 if user not found
- [x] Returns 409 if already a member
- [x] Activity logged

---

### 3.8 DELETE /api/boards/[boardId]/members/[userId]
Remove member from board.

**Request:**
```http
DELETE /api/boards/{boardId}/members/{userId}
```

**Acceptance Criteria:**
- [x] Only owner can remove members
- [x] Cannot remove owner
- [x] Activity logged

---

## 4. Columns API

### 4.1 POST /api/columns
Create a new column.

**Request:**
```typescript
interface CreateColumnRequest {
  board_id: string;
  title: string;
  position?: number; // defaults to last position
}
```

**Response:**
```typescript
interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}
```

**Business Logic:**
1. Validate user is board member
2. Calculate position (if not provided, use max + 1)
3. Create column
4. Log activity: "created column"

**Acceptance Criteria:**
- [x] User must be board member
- [x] Title is required
- [x] Position auto-calculated if not provided
- [x] Activity logged

---

### 4.2 PATCH /api/columns
Update column(s) - supports batch update for reordering.

**Request:**
```typescript
interface UpdateColumnsRequest {
  columns: {
    id: string;
    title?: string;
    position?: number;
  }[];
}
```

**Acceptance Criteria:**
- [x] User must be board member
- [x] Supports batch position updates for drag-drop
- [x] Transaction ensures atomic update

---

### 4.3 DELETE /api/columns
Delete a column.

**Request:**
```typescript
interface DeleteColumnRequest {
  id: string;
}
```

**Business Logic:**
1. Validate user is board member
2. Delete column (cascades to cards)
3. Reorder remaining columns
4. Log activity: "deleted column"

**Acceptance Criteria:**
- [x] User must be board member
- [x] Cascade deletes all cards
- [x] Remaining columns reordered
- [x] Activity logged

---

## 5. Cards API

### 5.1 POST /api/cards
Create a new card.

**Request:**
```typescript
interface CreateCardRequest {
  column_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string; // ISO date string
}
```

**Response:**
```typescript
interface Card {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  assignee_id: string | null;
  assignee: User | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

**Business Logic:**
1. Validate user is board member
2. Calculate position (last in column)
3. Create card
4. Log activity: "created card"

**Acceptance Criteria:**
- [x] User must be board member
- [x] Title is required
- [x] Position auto-calculated
- [x] Activity logged

---

### 5.2 PATCH /api/cards
Update card(s) - supports single update and batch reorder.

**Request:**
```typescript
// Single card update
interface UpdateCardRequest {
  id: string;
  title?: string;
  description?: string;
  column_id?: string;  // for moving between columns
  position?: number;
  assignee_id?: string | null;
  due_date?: string | null;
}

// Batch position update (for drag-drop)
interface BatchUpdateCardsRequest {
  cards: {
    id: string;
    column_id: string;
    position: number;
  }[];
}
```

**Business Logic for Move:**
1. Update card's column_id and position
2. Reorder cards in source and destination columns
3. Log activity: "moved card from X to Y"

**Business Logic for Assign:**
1. Update assignee_id
2. Log activity: "assigned X to card" or "unassigned X from card"

**Acceptance Criteria:**
- [x] User must be board member
- [x] Supports move between columns
- [x] Activity logged for moves
- [x] Activity logged for assignment changes

---

### 5.3 DELETE /api/cards
Delete a card.

**Request:**
```typescript
interface DeleteCardRequest {
  id: string;
}
```

**Business Logic:**
1. Validate user is board member
2. Delete card (cascades to comments)
3. Reorder remaining cards in column
4. Log activity: "deleted card"

**Acceptance Criteria:**
- [x] User must be board member
- [x] Cascade deletes comments
- [x] Activity logged

---

## 6. Comments API

### 6.1 GET /api/comments?card_id={cardId}
Get comments for a card.

**Response:**
```typescript
interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Response: Comment[]
```

**Acceptance Criteria:**
- [x] User must be board member
- [x] Sorted by created_at ASC

---

### 6.2 POST /api/comments
Create a new comment.

**Request:**
```typescript
interface CreateCommentRequest {
  card_id: string;
  content: string;
}
```

**Business Logic:**
1. Validate user is board member
2. Create comment
3. Log activity: "commented on card"

**Acceptance Criteria:**
- [x] User must be board member
- [x] Content is required
- [x] Activity logged

---

### 6.3 DELETE /api/comments
Delete a comment.

**Request:**
```typescript
interface DeleteCommentRequest {
  id: string;
}
```

**Acceptance Criteria:**
- [x] User can only delete own comments
- [x] Returns 403 if not comment owner

---

## 7. Activity API

### 7.1 GET /api/activity?board_id={boardId}
Get activity log for a board.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| board_id | string | required | Board ID |
| limit | number | 50 | Max items to return |
| offset | number | 0 | Pagination offset |

**Response:**
```typescript
interface Activity {
  id: string;
  board_id: string;
  user_id: string;
  action: string;
  entity_type: 'card' | 'column' | 'board' | 'member';
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Response: Activity[]
```

**Acceptance Criteria:**
- [x] User must be board member
- [x] Sorted by created_at DESC
- [x] Supports pagination
- [x] Includes user details

---

## 8. Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Not authenticated |
| 403 | FORBIDDEN | Not authorized for this action |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 500 | INTERNAL_ERROR | Server error |

---

## 9. Rate Limiting

| Endpoint | Limit |
|----------|-------|
| All endpoints | 100 requests/minute per user |
| POST /api/boards | 10 requests/minute |
| POST /api/comments | 30 requests/minute |

> Note: Rate limiting is handled by Vercel/CloudFlare edge.

