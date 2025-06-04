# RBAC Implementation Guide

## Tổng quan

Hệ thống RBAC (Role-Based Access Control) được triển khai dựa trên tài liệu Supabase về Custom Claims và RBAC. Hệ thống này cung cấp kiểm soát truy cập chi tiết dựa trên vai trò người dùng và quyền hạn cụ thể.

## Kiến trúc

### 1. Database Schema

#### Bảng `role_permissions`

```sql
create table public.role_permissions (
  id bigint generated always as identity primary key,
  role public.user_role not null,
  permission public.app_permission not null,
  created_at timestamptz default now() not null,
  unique (role, permission)
);
```

#### Enum `app_permission`

```sql
create type public.app_permission as enum (
  -- Job management
  'jobs.create', 'jobs.read', 'jobs.update', 'jobs.delete', 'jobs.publish', 'jobs.feature',
  -- Application management
  'applications.read', 'applications.update', 'applications.delete', 'applications.review',
  -- Company management
  'companies.create', 'companies.read', 'companies.update', 'companies.delete', 'companies.verify',
  -- User management
  'users.read', 'users.update', 'users.delete', 'users.manage_roles',
  -- System permissions
  'system.admin', 'system.moderate', 'system.analytics'
);
```

### 2. Custom Claims trong JWT

Mỗi JWT token chứa custom claims:

```typescript
interface CustomClaims {
  user_role: UserRole; // Vai trò người dùng
  permissions: string[]; // Danh sách quyền hạn
  company_ids: number[]; // ID các công ty có quyền truy cập
  is_company_owner: boolean; // Có phải chủ công ty không
}
```

### 3. Auth Hook

Function `custom_access_token_hook` tự động thêm custom claims vào JWT khi user đăng nhập hoặc refresh token.

## Cách sử dụng

### 1. Client-side Components

#### Permission Guards

```tsx
import { PermissionGuard, RoleGuard, AdminOnly } from '@/components/rbac/permission-guard';

// Hiển thị nút chỉ khi có quyền tạo job
<PermissionGuard permission="jobs.create">
  <Button>Create Job</Button>
</PermissionGuard>

// Hiển thị section chỉ cho admin
<AdminOnly>
  <AdminPanel />
</AdminOnly>

// Hiển thị với fallback
<PermissionGuard
  permission="jobs.update"
  showFallback
  fallback={<div>No permission to edit jobs</div>}
>
  <EditJobButton />
</PermissionGuard>
```

#### React Hooks

```tsx
import { usePermission, useRole, useRBAC } from "@/lib/rbac/rbac-provider";

function MyComponent() {
  const canCreateJobs = usePermission("jobs.create");
  const { isAdmin, isEmployer } = useRole();
  const { permissions, companyIds } = useRBAC();

  return (
    <div>
      {canCreateJobs && <CreateJobButton />}
      {isAdmin && <AdminSettings />}
    </div>
  );
}
```

### 2. Server-side Operations

#### API Routes

```typescript
import { requirePermission, requireRole } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Yêu cầu quyền tạo job
  await requirePermission("jobs.create");

  // Hoặc yêu cầu vai trò admin
  await requireRole("admin");

  // Logic xử lý...
}
```

#### Server Components

```tsx
import {
  hasServerPermission,
  getServerCustomClaims,
} from "@/lib/supabase/server";

export default async function JobManagementPage() {
  const canManageJobs = await hasServerPermission("jobs.update");
  const claims = await getServerCustomClaims();

  if (!canManageJobs) {
    return <div>Access denied</div>;
  }

  return <JobManagementInterface />;
}
```

### 3. Middleware Protection

Routes được bảo vệ tự động qua middleware:

```typescript
// src/lib/supabase/middleware.ts
const ROUTE_PERMISSIONS = {
  "/admin": { roles: ["admin"] },
  "/employer": { roles: ["employer", "admin"] },
  "/jobs/create": { permissions: ["jobs.create"] },
  // ...
};
```

## Vai trò và Quyền hạn

### Job Seeker

- `jobs.read` - Xem việc làm
- `applications.read` - Xem đơn ứng tuyển của mình
- `companies.read` - Xem thông tin công ty

### Employer

- Tất cả quyền của Job Seeker
- `jobs.create`, `jobs.update`, `jobs.delete`, `jobs.publish` - Quản lý việc làm
- `applications.update`, `applications.review` - Xử lý đơn ứng tuyển
- `companies.create`, `companies.update` - Quản lý công ty
- `users.read` - Xem thông tin ứng viên

### Admin

- Tất cả quyền của Employer
- `jobs.feature` - Đánh dấu việc làm nổi bật
- `applications.delete` - Xóa đơn ứng tuyển
- `companies.delete`, `companies.verify` - Quản lý công ty
- `users.update`, `users.delete`, `users.manage_roles` - Quản lý người dùng
- `system.admin`, `system.moderate`, `system.analytics` - Quản trị hệ thống

## Company Access Control

Ngoài quyền hạn cơ bản, hệ thống còn kiểm soát truy cập theo công ty:

```tsx
// Chỉ hiển thị nếu có quyền truy cập company ID 123
<CompanyAccessGuard companyId={123} permission="jobs.create">
  <CreateJobButton />
</CompanyAccessGuard>;

// Hook để kiểm tra
const hasAccess = useCompanyAccess(123, "jobs.update");
```

## RLS Policies

Row Level Security policies được cập nhật để sử dụng RBAC:

```sql
-- Chỉ cho phép tạo job nếu có quyền và truy cập công ty
create policy "Users with job permissions can create jobs"
  on public.jobs for insert
  to authenticated
  with check (
    authorize('jobs.create') and
    has_company_access(company_id, 'jobs.create')
  );
```

## Testing

Truy cập `/rbac-demo` để test hệ thống RBAC với các vai trò khác nhau.

## Troubleshooting

### 1. Custom claims không xuất hiện

- Kiểm tra auth hook đã được cài đặt đúng
- Refresh session: `supabase.auth.refreshSession()`

### 2. Permission bị từ chối

- Kiểm tra role_permissions table có mapping đúng không
- Verify JWT token chứa đúng permissions

### 3. Company access không hoạt động

- Kiểm tra user có trong company_members hoặc là owner
- Verify company_ids trong JWT claims

## Security Notes

1. **Never trust client-side checks** - Luôn validate permissions ở server-side
2. **Use RLS policies** - Database-level security là lớp bảo vệ cuối cùng
3. **Audit permissions** - Log và monitor các thay đổi quyền hạn
4. **Principle of least privilege** - Chỉ cấp quyền tối thiểu cần thiết

## Migration và Deployment

1. Apply migration: `supabase db reset --local`
2. Configure auth hook trong Supabase dashboard
3. Test permissions với các user roles khác nhau
4. Deploy và monitor logs

---

Tài liệu này sẽ được cập nhật khi có thay đổi trong hệ thống RBAC.
