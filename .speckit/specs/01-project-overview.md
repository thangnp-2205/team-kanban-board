# 01. Project Overview Specification

## Spec ID: SPEC-001
## Status: Approved
## Version: 1.0

---

## 1. Tổng quan

### 1.1 Mục tiêu
Xây dựng ứng dụng Kanban Board cho phép team nhỏ quản lý công việc hiệu quả.

### 1.2 Scope

#### In Scope
- User authentication (register, login, logout)
- Board management (CRUD)
- Column management (CRUD, reorder)
- Card/Task management (CRUD, drag-drop, assign)
- Comment system
- Activity logging
- Board sharing/collaboration

#### Out of Scope (v1.0)
- Real-time collaboration (WebSocket)
- File attachments
- Labels/Tags
- Due date notifications
- Mobile app
- Offline mode

---

## 2. User Roles

### 2.1 Board Owner
- Tạo, sửa, xóa board
- Mời/xóa members
- Full quyền với columns và cards

### 2.2 Board Member
- Xem board
- Tạo, sửa, di chuyển cards
- Comment trên cards
- Không thể xóa board hoặc quản lý members

### 2.3 Guest (Future)
- Chỉ xem board (read-only)

---

## 3. Functional Requirements

### FR-001: Authentication
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | User có thể đăng ký với email/password | Must |
| FR-001.2 | User có thể đăng nhập | Must |
| FR-001.3 | User có thể đăng xuất | Must |
| FR-001.4 | Session được duy trì qua refresh | Must |
| FR-001.5 | Redirect về login khi chưa authenticated | Must |

### FR-002: Board Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | User có thể tạo board mới | Must |
| FR-002.2 | Board tự động có 3 columns mặc định | Must |
| FR-002.3 | User có thể xem danh sách boards | Must |
| FR-002.4 | User có thể sửa tên/mô tả board | Should |
| FR-002.5 | Owner có thể xóa board | Must |
| FR-002.6 | Owner có thể mời members qua email | Must |

### FR-003: Column Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | User có thể tạo column mới | Must |
| FR-003.2 | User có thể sửa tên column | Must |
| FR-003.3 | User có thể xóa column | Must |
| FR-003.4 | User có thể kéo-thả để đổi vị trí column | Should |

### FR-004: Card Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | User có thể tạo card trong column | Must |
| FR-004.2 | User có thể kéo-thả card giữa columns | Must |
| FR-004.3 | User có thể sửa title/description | Must |
| FR-004.4 | User có thể gán assignee cho card | Must |
| FR-004.5 | User có thể set due date | Should |
| FR-004.6 | User có thể xóa card | Must |

### FR-005: Comment System
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | User có thể thêm comment vào card | Must |
| FR-005.2 | User có thể xem danh sách comments | Must |
| FR-005.3 | User có thể xóa comment của mình | Must |
| FR-005.4 | Comments hiển thị theo thời gian | Must |

### FR-006: Activity Log
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Ghi log khi tạo/sửa/xóa card | Must |
| FR-006.2 | Ghi log khi di chuyển card | Must |
| FR-006.3 | Ghi log khi assign/unassign | Must |
| FR-006.4 | Hiển thị activity log trong board | Must |

---

## 4. Non-Functional Requirements

### NFR-001: Performance
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001.1 | First Contentful Paint | < 1.5s |
| NFR-001.2 | Time to Interactive | < 3s |
| NFR-001.3 | Drag-drop response | < 100ms |
| NFR-001.4 | API response time | < 500ms |

### NFR-002: Security
| ID | Requirement |
|----|-------------|
| NFR-002.1 | Mã hóa password với bcrypt |
| NFR-002.2 | Row Level Security trên tất cả tables |
| NFR-002.3 | Input validation ở cả client và server |
| NFR-002.4 | HTTPS only |
| NFR-002.5 | CORS configuration |

### NFR-003: Accessibility
| ID | Requirement |
|----|-------------|
| NFR-003.1 | WCAG 2.1 Level AA compliance |
| NFR-003.2 | Keyboard navigation |
| NFR-003.3 | Screen reader support |
| NFR-003.4 | Color contrast >= 4.5:1 |

### NFR-004: Compatibility
| ID | Requirement |
|----|-------------|
| NFR-004.1 | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-004.2 | Responsive design (mobile, tablet, desktop) |

---

## 5. Technical Stack

```yaml
Frontend:
  Framework: Next.js 14+ (App Router)
  Language: TypeScript (strict mode)
  Styling: Tailwind CSS
  State: React Context + useState
  Drag-Drop: @dnd-kit/core, @dnd-kit/sortable

Backend:
  Runtime: Next.js API Routes (Edge Runtime compatible)
  Database: Supabase (PostgreSQL)
  Auth: Supabase Auth
  ORM: Supabase JS Client

DevOps:
  Hosting: Vercel
  CI/CD: Vercel (auto deploy from GitHub)
  Monitoring: Vercel Analytics

Development:
  MCP: Context7
  SDD Tool: SpecKit
  Linting: ESLint
  Formatting: Prettier
```

---

## 6. Acceptance Criteria Checklist

### MVP Launch Criteria
- [ ] User có thể register/login/logout
- [ ] User có thể tạo board với default columns
- [ ] User có thể tạo cards
- [ ] User có thể drag-drop cards giữa columns
- [ ] User có thể assign members
- [ ] User có thể comment trên cards
- [ ] Activity log hoạt động
- [ ] Board sharing hoạt động
- [ ] Deploy thành công lên Vercel

