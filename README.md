# Team Kanban Board

Ứng dụng Kanban Board cho nhóm nhỏ được xây dựng với Next.js, TypeScript và Supabase.

## 🚀 Tính năng

- ✅ **Quản lý Boards**: Tạo, chỉnh sửa và xóa boards
- ✅ **Columns/Lists**: Tạo các cột (To Do, In Progress, Done,...)
- ✅ **Cards/Tasks**: Tạo, chỉnh sửa, xóa và di chuyển cards
- ✅ **Drag & Drop**: Kéo thả cards giữa các columns
- ✅ **Comments**: Thêm comment vào cards
- ✅ **Assignee**: Gán người phụ trách cho cards
- ✅ **Team Collaboration**: Mời thành viên vào board, phân quyền (Owner/Admin/Member)
- ✅ **Activity Log**: Theo dõi hoạt động trên board
- ✅ **Authentication**: Đăng ký/Đăng nhập với Supabase Auth
- ✅ **Row Level Security**: Bảo mật dữ liệu với RLS policies

## 🛠 Công nghệ

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Deployment**: Vercel / Cloudflare

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/your-username/team-kanban-board.git
cd team-kanban-board
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 3. Setup Supabase

1. Tạo project mới tại [Supabase](https://supabase.com)
2. Copy file `.env.example` thành `.env.local`
3. Thêm Supabase credentials vào `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Database

Chạy các SQL migrations trong Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 📁 Cấu trúc dự án

```
team-kanban-board/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (dashboard)/        # Dashboard pages
│   │   │   └── boards/         # Board pages
│   │   ├── api/                # API Routes
│   │   │   ├── boards/
│   │   │   ├── cards/
│   │   │   ├── columns/
│   │   │   ├── comments/
│   │   │   └── activity/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # UI components
│   │   ├── board/              # Board-specific components
│   │   └── shared/             # Shared components
│   ├── lib/
│   │   ├── supabase/           # Supabase client
│   │   ├── activity.ts         # Activity logging helpers
│   │   └── utils.ts
│   ├── types/                  # TypeScript types
│   └── middleware.ts
├── supabase/
│   └── migrations/             # Database migrations
├── public/
├── package.json
└── README.md
```

## 🗃 Database Schema

### Tables

- **profiles**: User profiles (extends auth.users)
- **boards**: Kanban boards
- **board_members**: Board membership (many-to-many)
- **columns**: Board columns/lists
- **cards**: Task cards
- **comments**: Card comments
- **activity_logs**: Activity tracking

## 🔒 Row Level Security (RLS)

Tất cả tables đều được bảo vệ bằng RLS policies:
- Users chỉ có thể xem boards mà họ là thành viên
- Chỉ board owners/admins có thể thêm/xóa members
- Board members có thể tạo/sửa columns và cards
- Users chỉ có thể sửa/xóa comments của chính họ

## 🚀 Deploy

### Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào [Vercel](https://vercel.com)
3. Thêm environment variables
4. Deploy!

### Deploy lên Cloudflare Workers

Sử dụng `@cloudflare/next-on-pages`:

```bash
npm install -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
```

## 🔧 MCP Server (Context7)

Để sử dụng MCP Server Context7 trong quá trình phát triển, tham khảo documentation tại:
https://github.com/context7/mcp-server

## 📝 Specification-Driven Development (SDD)

Project này được phát triển theo phương pháp **Specification-Driven Development** sử dụng SpecKit.

### SDD Workflow

```
1. SPEC     → Viết specification chi tiết (acceptance criteria, data structures, API)
2. DESIGN   → Thiết kế component architecture & data flow
3. IMPLEMENT → Implement code theo spec
4. TEST     → Viết tests theo acceptance criteria
5. REVIEW   → Code review & QA verification
```

### Specification Files

```
.speckit/
├── config.yaml                   # SpecKit configuration
├── templates/                    # Spec templates
│   ├── feature-spec.md
│   ├── component-spec.md
│   ├── api-spec.md
│   └── user-story.md
└── specs/
    ├── README.md                 # Spec index
    ├── 01-project-overview.md    # Project requirements & scope
    ├── 02-database-schema.md     # Database design & RLS policies
    ├── 03-api-endpoints.md       # API specifications
    ├── 04-components.md          # Component specifications
    ├── 05-features/              # Feature specifications
    │   ├── auth.md               # Authentication
    │   ├── boards.md             # Board management
    │   ├── columns.md            # Column management
    │   ├── cards.md              # Card management (drag-drop)
    │   ├── comments.md           # Comment system
    │   ├── members.md            # Member management
    │   └── activity-log.md       # Activity logging
    └── 06-ui-ux.md               # UI/UX design system
```

### Sử dụng Specs

1. **Trước khi code**: Đọc spec tương ứng để hiểu requirements
2. **Trong khi code**: Follow acceptance criteria và data structures
3. **Sau khi code**: Verify implementation matches spec
4. **Testing**: Viết tests dựa trên acceptance criteria trong spec

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

