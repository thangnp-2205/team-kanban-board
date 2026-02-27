# 02. Database Schema Specification

## Spec ID: SPEC-002
## Status: Approved
## Version: 1.0

---

## 1. Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   users     │     │  board_members   │     │   boards    │
├─────────────┤     ├──────────────────┤     ├─────────────┤
│ id (PK)     │────<│ user_id (FK)     │>────│ id (PK)     │
│ email       │     │ board_id (FK)    │     │ title       │
│ created_at  │     │ role             │     │ description │
│ updated_at  │     │ joined_at        │     │ owner_id(FK)│
└─────────────┘     └──────────────────┘     │ created_at  │
                                              │ updated_at  │
                                              └──────┬──────┘
                                                     │
                    ┌────────────────────────────────┘
                    │
              ┌─────┴─────┐
              │  columns  │
              ├───────────┤
              │ id (PK)   │
              │ board_id  │
              │ title     │
              │ position  │
              │ created_at│
              └─────┬─────┘
                    │
              ┌─────┴─────┐
              │   cards   │
              ├───────────┤
              │ id (PK)   │
              │ column_id │
              │ title     │
              │ descriptn │
              │ position  │
              │ assignee  │
              │ due_date  │
              │ created_at│
              │ updated_at│
              └─────┬─────┘
                    │
        ┌───────────┴───────────┐
        │                       │
  ┌─────┴─────┐          ┌──────┴──────┐
  │ comments  │          │ activities  │
  ├───────────┤          ├─────────────┤
  │ id (PK)   │          │ id (PK)     │
  │ card_id   │          │ board_id    │
  │ user_id   │          │ user_id     │
  │ content   │          │ action      │
  │ created_at│          │ entity_type │
  └───────────┘          │ entity_id   │
                         │ metadata    │
                         │ created_at  │
                         └─────────────┘
```

---

## 2. Table Definitions

### 2.1 Table: users
> Sử dụng `auth.users` của Supabase, không cần tạo riêng.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | User ID |
| email | varchar | UNIQUE, NOT NULL | Email address |
| encrypted_password | varchar | NOT NULL | Hashed password |
| email_confirmed_at | timestamp | | Email verification time |
| created_at | timestamp | DEFAULT now() | |
| updated_at | timestamp | DEFAULT now() | |

### 2.2 Table: profiles
> Public user profile, liên kết với auth.users

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK -> auth.users | User ID |
| email | text | NOT NULL | User email |
| full_name | text | | Display name |
| avatar_url | text | | Avatar image URL |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

### 2.3 Table: boards

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_boards_owner ON boards(owner_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Board ID |
| title | varchar(255) | NOT NULL | Board title |
| description | text | | Board description |
| owner_id | uuid | FK -> auth.users, NOT NULL | Board creator |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

### 2.4 Table: board_members

```sql
CREATE TABLE board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

CREATE INDEX idx_board_members_board ON board_members(board_id);
CREATE INDEX idx_board_members_user ON board_members(user_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Membership ID |
| board_id | uuid | FK -> boards, NOT NULL | Board reference |
| user_id | uuid | FK -> auth.users, NOT NULL | User reference |
| role | varchar(20) | CHECK IN (owner, member) | Member role |
| joined_at | timestamptz | DEFAULT now() | Join timestamp |

### 2.5 Table: columns

```sql
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_columns_board ON columns(board_id);
CREATE INDEX idx_columns_position ON columns(board_id, position);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Column ID |
| board_id | uuid | FK -> boards, NOT NULL | Board reference |
| title | varchar(255) | NOT NULL | Column title |
| position | integer | NOT NULL, DEFAULT 0 | Display order |
| created_at | timestamptz | DEFAULT now() | |

### 2.6 Table: cards

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cards_column ON cards(column_id);
CREATE INDEX idx_cards_position ON cards(column_id, position);
CREATE INDEX idx_cards_assignee ON cards(assignee_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Card ID |
| column_id | uuid | FK -> columns, NOT NULL | Column reference |
| title | varchar(255) | NOT NULL | Card title |
| description | text | | Card description |
| position | integer | NOT NULL, DEFAULT 0 | Display order in column |
| assignee_id | uuid | FK -> auth.users | Assigned user |
| due_date | date | | Due date |
| created_by | uuid | FK -> auth.users, NOT NULL | Creator |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

### 2.7 Table: comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_card ON comments(card_id);
CREATE INDEX idx_comments_user ON comments(user_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Comment ID |
| card_id | uuid | FK -> cards, NOT NULL | Card reference |
| user_id | uuid | FK -> auth.users, NOT NULL | Commenter |
| content | text | NOT NULL | Comment text |
| created_at | timestamptz | DEFAULT now() | |

### 2.8 Table: activities

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_board ON activities(board_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Activity ID |
| board_id | uuid | FK -> boards, NOT NULL | Board reference |
| user_id | uuid | FK -> auth.users, NOT NULL | Actor |
| action | varchar(50) | NOT NULL | Action type (created, updated, moved, etc.) |
| entity_type | varchar(20) | NOT NULL | Entity type (card, column, board) |
| entity_id | uuid | NOT NULL | Entity reference |
| metadata | jsonb | DEFAULT '{}' | Additional data |
| created_at | timestamptz | DEFAULT now() | |

---

## 3. Action Types for Activities

| Action | Entity Type | Metadata |
|--------|-------------|----------|
| created | card | { title } |
| updated | card | { field, old_value, new_value } |
| moved | card | { from_column, to_column } |
| assigned | card | { assignee_id, assignee_name } |
| unassigned | card | { assignee_id, assignee_name } |
| deleted | card | { title } |
| created | column | { title } |
| deleted | column | { title } |
| added | member | { member_email } |
| removed | member | { member_email } |

---

## 4. Row Level Security Policies

### 4.1 profiles

```sql
-- Anyone can view profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 4.2 boards

```sql
-- Users can view boards they own or are members of
CREATE POLICY "Users can view their boards"
  ON boards FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

-- Users can create boards
CREATE POLICY "Users can create boards"
  ON boards FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Only owner can update board
CREATE POLICY "Owner can update board"
  ON boards FOR UPDATE
  USING (owner_id = auth.uid());

-- Only owner can delete board
CREATE POLICY "Owner can delete board"
  ON boards FOR DELETE
  USING (owner_id = auth.uid());
```

### 4.3 board_members

```sql
-- Members can view board members
CREATE POLICY "Members can view board members"
  ON board_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id 
      AND (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM board_members bm 
        WHERE bm.board_id = boards.id AND bm.user_id = auth.uid()
      ))
    )
  );

-- Only owner can add members
CREATE POLICY "Owner can add members"
  ON board_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND owner_id = auth.uid()
    )
  );

-- Only owner can remove members
CREATE POLICY "Owner can remove members"
  ON board_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = board_members.board_id AND owner_id = auth.uid()
    )
  );
```

### 4.4 columns

```sql
-- Board members can view columns
CREATE POLICY "Members can view columns"
  ON columns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = columns.board_id 
      AND (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = boards.id AND user_id = auth.uid()
      ))
    )
  );

-- Board members can manage columns
CREATE POLICY "Members can manage columns"
  ON columns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = columns.board_id 
      AND (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = boards.id AND user_id = auth.uid()
      ))
    )
  );
```

### 4.5 cards

```sql
-- Board members can view cards
CREATE POLICY "Members can view cards"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN boards b ON b.id = c.board_id
      WHERE c.id = cards.column_id
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = b.id AND user_id = auth.uid()
      ))
    )
  );

-- Board members can manage cards
CREATE POLICY "Members can manage cards"
  ON cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM columns c
      JOIN boards b ON b.id = c.board_id
      WHERE c.id = cards.column_id
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = b.id AND user_id = auth.uid()
      ))
    )
  );
```

### 4.6 comments

```sql
-- Board members can view comments
CREATE POLICY "Members can view comments"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cards ca
      JOIN columns c ON c.id = ca.column_id
      JOIN boards b ON b.id = c.board_id
      WHERE ca.id = comments.card_id
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = b.id AND user_id = auth.uid()
      ))
    )
  );

-- Board members can add comments
CREATE POLICY "Members can add comments"
  ON comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM cards ca
      JOIN columns c ON c.id = ca.column_id
      JOIN boards b ON b.id = c.board_id
      WHERE ca.id = comments.card_id
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = b.id AND user_id = auth.uid()
      ))
    )
  );

-- Users can delete own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (user_id = auth.uid());
```

### 4.7 activities

```sql
-- Board members can view activities
CREATE POLICY "Members can view activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE id = activities.board_id 
      AND (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = boards.id AND user_id = auth.uid()
      ))
    )
  );

-- System creates activities (via service role)
CREATE POLICY "System can create activities"
  ON activities FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

---

## 5. Triggers

### 5.1 Auto-create profile on user signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 5.2 Auto-add owner as board member

```sql
CREATE OR REPLACE FUNCTION handle_new_board()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO board_members (board_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_board_created
  AFTER INSERT ON boards
  FOR EACH ROW EXECUTE FUNCTION handle_new_board();
```

### 5.3 Update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

