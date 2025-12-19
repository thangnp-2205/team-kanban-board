-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Boards policies
CREATE POLICY "Users can view boards they are members of"
  ON boards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Board owners and admins can update boards"
  ON boards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
      AND board_members.user_id = auth.uid()
      AND board_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Board owners can delete boards"
  ON boards FOR DELETE
  USING (owner_id = auth.uid());

-- Board members policies
CREATE POLICY "Board members can view other members"
  ON board_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM board_members AS bm
      WHERE bm.board_id = board_members.board_id
      AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "Board owners and admins can add members"
  ON board_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = board_members.board_id
      AND board_members.user_id = auth.uid()
      AND board_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Board owners and admins can update members"
  ON board_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM board_members AS bm
      WHERE bm.board_id = board_members.board_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Board owners and admins can remove members"
  ON board_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM board_members AS bm
      WHERE bm.board_id = board_members.board_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    OR user_id = auth.uid() -- Users can leave boards
  );

-- Columns policies
CREATE POLICY "Board members can view columns"
  ON columns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = columns.board_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board members can create columns"
  ON columns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = columns.board_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board members can update columns"
  ON columns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = columns.board_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board owners and admins can delete columns"
  ON columns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = columns.board_id
      AND board_members.user_id = auth.uid()
      AND board_members.role IN ('owner', 'admin')
    )
  );

-- Cards policies
CREATE POLICY "Board members can view cards"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM columns
      JOIN board_members ON board_members.board_id = columns.board_id
      WHERE columns.id = cards.column_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board members can create cards"
  ON cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns
      JOIN board_members ON board_members.board_id = columns.board_id
      WHERE columns.id = cards.column_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board members can update cards"
  ON cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM columns
      JOIN board_members ON board_members.board_id = columns.board_id
      WHERE columns.id = cards.column_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board members can delete cards"
  ON cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM columns
      JOIN board_members ON board_members.board_id = columns.board_id
      WHERE columns.id = cards.column_id
      AND board_members.user_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Board members can view comments"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cards
      JOIN columns ON columns.id = cards.column_id
      JOIN board_members ON board_members.board_id = columns.board_id
      WHERE cards.id = comments.card_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board members can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM cards
      JOIN columns ON columns.id = cards.column_id
      JOIN board_members ON board_members.board_id = columns.board_id
      WHERE cards.id = comments.card_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (user_id = auth.uid());

-- Activity logs policies
CREATE POLICY "Board members can view activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = activity_logs.board_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board members can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = activity_logs.board_id
      AND board_members.user_id = auth.uid()
    )
  );

