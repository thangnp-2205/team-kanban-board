# Feature: Authentication

## Spec ID: FEAT-001
## Status: Approved
## Version: 1.0
## Priority: Must Have

---

## 1. Overview

Xử lý đăng ký, đăng nhập, và quản lý session cho users.

---

## 2. User Stories

### US-001: User Registration
**As a** new user  
**I want to** register with my email and password  
**So that** I can create and manage Kanban boards

**Acceptance Criteria:**
- [x] Registration form with email and password fields
- [x] Password must be at least 6 characters
- [x] Email must be valid format
- [x] Show error if email already registered
- [x] Auto-login after successful registration
- [x] Redirect to /boards after registration

### US-002: User Login
**As a** registered user  
**I want to** login with my credentials  
**So that** I can access my boards

**Acceptance Criteria:**
- [x] Login form with email and password
- [x] Show error for invalid credentials
- [x] Remember session across browser refreshes
- [x] Redirect to /boards after login
- [x] Redirect to intended page if login was triggered by protected route

### US-003: User Logout
**As a** logged-in user  
**I want to** logout from the application  
**So that** I can secure my account

**Acceptance Criteria:**
- [x] Logout button in navbar
- [x] Clear session on logout
- [x] Redirect to /login after logout

### US-004: Protected Routes
**As a** system  
**I want to** protect dashboard routes  
**So that** only authenticated users can access boards

**Acceptance Criteria:**
- [x] Redirect to /login if accessing /boards without auth
- [x] Redirect to /boards if accessing /login while authenticated
- [x] Middleware checks session on every request

---

## 3. Technical Implementation

### 3.1 Auth Provider (Supabase)
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 3.2 Server-side Auth
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        }
      }
    }
  );
}
```

### 3.3 Middleware
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const supabase = createServerClient(/*...*/);
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith('/boards')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users away from auth pages
  if (user && ['/login', '/register'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/boards', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
};
```

---

## 4. UI Specifications

### 4.1 Login Page (`/login`)

```
┌────────────────────────────────────┐
│           Team Kanban              │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Email                        │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Password                     │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │         Sign In              │  │
│  └──────────────────────────────┘  │
│                                    │
│  Don't have an account? Register   │
└────────────────────────────────────┘
```

### 4.2 Register Page (`/register`)

```
┌────────────────────────────────────┐
│           Team Kanban              │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Full Name (optional)         │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Email                        │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Password                     │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │       Create Account         │  │
│  └──────────────────────────────┘  │
│                                    │
│  Already have an account? Login    │
└────────────────────────────────────┘
```

---

## 5. Error Handling

| Scenario | Error Message |
|----------|---------------|
| Invalid email format | "Please enter a valid email address" |
| Password too short | "Password must be at least 6 characters" |
| Email already registered | "An account with this email already exists" |
| Invalid credentials | "Invalid email or password" |
| Network error | "Unable to connect. Please try again." |

---

## 6. Testing Scenarios

### Unit Tests
- [ ] Email validation function
- [ ] Password validation function

### Integration Tests
- [ ] Successful registration flow
- [ ] Registration with existing email
- [ ] Successful login flow
- [ ] Login with invalid credentials
- [ ] Logout flow
- [ ] Session persistence

### E2E Tests
- [ ] Complete registration journey
- [ ] Complete login journey
- [ ] Protected route redirect
- [ ] Logout and session clear

