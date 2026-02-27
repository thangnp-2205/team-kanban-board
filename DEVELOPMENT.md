# Development Guide - Team Kanban Board

## Specification-Driven Development (SDD)

Dự án này áp dụng phương pháp **Specification-Driven Development** - viết spec trước, code sau.

## Workflow

### 1. SPEC Phase
Trước khi bắt đầu code một feature mới:

1. Đọc spec hiện có trong `.speckit/specs/`
2. Nếu cần tạo feature mới, sử dụng template:
   ```bash
   cp .speckit/templates/feature-spec.md .speckit/specs/05-features/new-feature.md
   ```
3. Điền đầy đủ:
   - User stories với acceptance criteria
   - Data structures (TypeScript interfaces)
   - API endpoints
   - UI mockups/wireframes

### 2. DESIGN Phase
1. Xác định components cần tạo/sửa
2. Thiết kế data flow
3. Review database schema
4. Confirm API contracts

### 3. IMPLEMENT Phase
1. Code theo spec đã viết
2. Đảm bảo TypeScript types match với spec
3. Implement error handling
4. Add loading states

### 4. TEST Phase
1. Viết tests dựa trên acceptance criteria
2. Mỗi criterion = ít nhất 1 test case
3. Run tests: `npm test`

### 5. REVIEW Phase
1. Self-review: code có match spec không?
2. Peer review
3. QA verification

---

## Specs Structure

```
.speckit/specs/
├── README.md                     # Index của tất cả specs
├── 01-project-overview.md        # Requirements, scope, tech stack
├── 02-database-schema.md         # Tables, relationships, RLS
├── 03-api-endpoints.md           # All API routes with details
├── 04-components.md              # UI component specs
├── 05-features/                  # Individual feature specs
│   ├── auth.md
│   ├── boards.md
│   ├── columns.md
│   ├── cards.md
│   ├── comments.md
│   ├── members.md
│   └── activity-log.md
└── 06-ui-ux.md                   # Design system, colors, typography
```

---

## Quick Reference

### Feature Development Checklist

```
□ Read existing spec or create new one
□ User stories defined
□ Acceptance criteria listed
□ Data structures documented
□ API endpoints specified
□ UI mockups created
─────────────────────────────────
□ Components designed
□ State management planned
□ Database changes reviewed
─────────────────────────────────
□ Code implemented
□ TypeScript types aligned
□ Error handling done
□ Loading states done
─────────────────────────────────
□ Tests written
□ All acceptance criteria tested
─────────────────────────────────
□ Code reviewed
□ Spec requirements verified
□ No regressions
```

---

## MCP Server Setup

Dự án này sử dụng MCP (Model Context Protocol) server Context7 để hỗ trợ development.

### Configuration

Thêm vào file cấu hình MCP của bạn:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

### Usage
- Sử dụng Context7 để query documentation
- Hỏi về best practices cho Next.js, Supabase, etc.
- Get code examples và patterns

---

## Environment Setup

### Required Node.js Version
```bash
# Install Node.js 20+ using nvm
nvm install 20
nvm use 20

# Or check .nvmrc
nvm use
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Database Setup
Run migrations in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

---

## Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Database (if using Supabase CLI)
supabase start        # Start local Supabase
supabase db push      # Push migrations
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `kanban-card.tsx` |
| Pages | folder-based | `boards/[boardId]/page.tsx` |
| Hooks | camelCase with 'use' | `use-user.ts` |
| Utils | kebab-case | `activity.ts` |
| Types | PascalCase | `Board`, `Card` |

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add board sharing modal
fix: resolve drag-drop position calculation
docs: update SDD workflow
refactor: simplify card update logic
test: add card movement tests
```

---

## Getting Help

1. Check specs in `.speckit/specs/`
2. Read component specs in `04-components.md`
3. Review API specs in `03-api-endpoints.md`
4. Ask Context7 MCP for documentation

