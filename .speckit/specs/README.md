# Team Kanban Board - Specification Document

## Tổng quan dự án

**Tên dự án:** Team Kanban Board  
**Phiên bản:** 1.0.0  
**Ngày tạo:** 2026-02-27  
**Phương pháp phát triển:** Specification-Driven Development (SDD)

## Mô tả

Xây dựng Kanban board cho nhóm nhỏ với các cột trạng thái: To Do / In Progress / Done. Người dùng có thể:
- Tạo Board, List/Column, Card (task)
- Kéo–thả để đổi trạng thái
- Comment và gán người phụ trách
- Xem Activity Log

## Công nghệ sử dụng

- **Frontend & Backend:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **MCP Server:** Context7 (for development assistance)

## Cấu trúc Specs

```
specs/
├── README.md                    # Document này
├── 01-project-overview.md       # Tổng quan dự án
├── 02-database-schema.md        # Thiết kế database
├── 03-api-endpoints.md          # API specifications
├── 04-components.md             # Component specifications
├── 05-features/                 # Feature specifications
│   ├── auth.md                  # Authentication
│   ├── boards.md                # Board management
│   ├── columns.md               # Column management
│   ├── cards.md                 # Card management
│   ├── comments.md              # Comment system
│   ├── members.md               # Member management
│   └── activity-log.md          # Activity logging
└── 06-ui-ux.md                  # UI/UX specifications
```

## SDD Workflow

```
1. SPEC     → Viết specification chi tiết
2. DESIGN   → Thiết kế architecture & components
3. IMPLEMENT → Implement theo spec
4. TEST     → Viết tests theo acceptance criteria
5. REVIEW   → Code review & QA
```

## Quy tắc phát triển

1. **Spec First:** Luôn viết spec trước khi code
2. **Acceptance Criteria:** Mọi feature phải có acceptance criteria rõ ràng
3. **Type Safety:** Sử dụng TypeScript strict mode
4. **Testing:** Viết tests theo acceptance criteria
5. **Documentation:** Cập nhật docs khi thay đổi spec

