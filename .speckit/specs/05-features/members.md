# Feature: Board Members Management

## Spec ID: FEAT-006
## Status: Approved
## Version: 1.0
## Priority: Must Have

---

## 1. Overview

Quản lý thành viên của board, cho phép owner mời và xóa members.

---

## 2. User Stories

### US-024: View Board Members
**As a** board member  
**I want to** see who is in the board  
**So that** I know my collaborators

**Acceptance Criteria:**
- [x] Members list in share modal
- [x] Show avatar, name, email
- [x] Show role (owner/member)
- [x] Owner shown first

### US-025: Invite Member
**As a** board owner  
**I want to** invite people to my board  
**So that** they can collaborate

**Acceptance Criteria:**
- [x] "Share" button in board header
- [x] Email input to invite
- [x] Find user by email
- [x] Error if user not found
- [x] Error if already a member
- [x] New member added with "member" role
- [x] Activity: "added member"

### US-026: Remove Member
**As a** board owner  
**I want to** remove members from my board  
**So that** I can control access

**Acceptance Criteria:**
- [x] Remove button next to each member
- [x] Only owner can remove
- [x] Cannot remove owner
- [x] Confirmation before remove
- [x] Activity: "removed member"

---

## 3. Data Structures

### Board Member
```typescript
interface BoardMember {
  id: string;
  board_id: string;
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

---

## 4. UI Specifications

### 4.1 Share Board Modal

```
┌────────────────────────────────────────────┐
│ Share Board                           [X]  │
├────────────────────────────────────────────┤
│                                            │
│ Invite by email                            │
│ ┌────────────────────────────────┐ ┌─────┐ │
│ │ Enter email address...         │ │Send │ │
│ └────────────────────────────────┘ └─────┘ │
│                                            │
│ ──────────────────────────────────────     │
│                                            │
│ Members (3)                                │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ 👤 John Doe (you)                    │   │
│ │    john@example.com          Owner   │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ 👤 Jane Smith                    [X] │   │
│ │    jane@example.com          Member  │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ 👤 Bob Wilson                    [X] │   │
│ │    bob@example.com           Member  │   │
│ └──────────────────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘
```

### 4.2 Member Row

**For Owner:**
```
┌──────────────────────────────────────────┐
│ ┌───┐                                    │
│ │👤 │  John Doe (you)                    │
│ └───┘  john@example.com                  │
│                              👑 Owner    │
└──────────────────────────────────────────┘
```

**For Member (viewed by owner):**
```
┌──────────────────────────────────────────┐
│ ┌───┐                              ┌───┐ │
│ │👤 │  Jane Smith                  │ X │ │
│ └───┘  jane@example.com            └───┘ │
│                               Member     │
└──────────────────────────────────────────┘
```

**For Member (viewed by member):**
```
┌──────────────────────────────────────────┐
│ ┌───┐                                    │
│ │👤 │  Jane Smith                        │
│ └───┘  jane@example.com                  │
│                               Member     │
└──────────────────────────────────────────┘
```

### 4.3 Share Button in Header

```
┌──────────────────────────────────────────────┐
│ Board Title              [👥 Share] [≡ More] │
└──────────────────────────────────────────────┘
```

---

## 5. API Usage

### Get Members
```typescript
// GET /api/boards/[boardId]/members
const { data: members } = await fetch(
  `/api/boards/${boardId}/members`
);
```

### Add Member
```typescript
// POST /api/boards/[boardId]/members
const member = await addMember({
  boardId,
  email: "newmember@example.com"
});
```

### Remove Member
```typescript
// DELETE /api/boards/[boardId]/members/[userId]
await removeMember({
  boardId,
  userId
});
```

---

## 6. Business Rules

1. **Owner Auto-Added:** When board is created, owner is automatically added as member with role "owner"
2. **Only Owner Manages:** Only board owner can add/remove members
3. **Cannot Remove Owner:** Owner cannot be removed from board
4. **User Must Exist:** Can only invite users who have registered
5. **No Duplicate Members:** Each user can only be a member once

---

## 7. Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| User not found | "No user found with this email" | Clear input |
| Already a member | "This user is already a member" | Clear input |
| Cannot remove owner | "Cannot remove the board owner" | Show message |
| Not authorized | "Only the board owner can manage members" | Hide controls |
| Failed to add | "Failed to add member" | Retry |
| Failed to remove | "Failed to remove member" | Retry |

---

## 8. Permissions Matrix

| Action | Owner | Member |
|--------|-------|--------|
| View members | ✅ | ✅ |
| Add member | ✅ | ❌ |
| Remove member | ✅ | ❌ |
| Leave board | ❌ (owner can't leave) | ✅ (future) |

---

## 9. Testing Scenarios

### Unit Tests
- [ ] Member row component renders correctly
- [ ] Remove button visibility based on role
- [ ] Email validation

### Integration Tests
- [ ] Add member API
- [ ] Remove member API
- [ ] Cannot add duplicate member
- [ ] Cannot remove owner

### E2E Tests
- [ ] Open share modal
- [ ] Add member by email
- [ ] Remove member
- [ ] Error for non-existent email

