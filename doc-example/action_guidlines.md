# Server Actions Guidelines

This document outlines the coding standards and best practices for writing server actions in the job board application.

## Table of Contents

1. [File Structure](#file-structure)
2. [Naming Conventions](#naming-conventions)
3. [Code Structure](#code-structure)
4. [Type Safety](#type-safety)
5. [Validation](#validation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling](#error-handling)
8. [Database Operations](#database-operations)
9. [File Upload Actions](#file-upload-actions)
10. [Return Types](#return-types)
11. [Examples](#examples)

## File Structure

### Directory Organization

```
src/actions/
├── auth/                    # Authentication actions
├── users/                   # User profile management
├── companies/               # Company management
├── company-members/         # Company team management
├── jobs/                    # Job management
├── applications/            # Job applications
├── categories/              # Job categories
├── saved-jobs/              # Saved jobs functionality
├── cv/                      # CV management
└── index.ts                 # Export all actions
```

### File Naming

- Use kebab-case for file names: `create-company.ts`, `get-user-profile.ts`
- Use descriptive action names: `upload-company-logo.ts`, `accept-invitation.ts`
- Group related actions in appropriate directories

## Naming Conventions

### Function Names

- Use camelCase for function names
- Start with action verb: `createCompany`, `updateUserProfile`, `deleteJob`
- Be descriptive and specific: `uploadCompanyLogo` not `uploadFile`

### Variable Names

- Use camelCase for variables
- Use descriptive names: `validatedData`, `hasPermission`, `companyError`
- Use auxiliary verbs for booleans: `isLoading`, `hasError`, `canUpdate`

### Type Names

- Use PascalCase for type names
- End result types with `Result`: `CreateCompanyResult`, `UpdateProfileResult`
- End data types with `Data`: `CompanyData`, `InviteMemberData`

## Code Structure

### Basic Template

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { TypeFromCustomTypes } from "@/types/custom.types";
import { z } from "zod";

// Validation schema (if needed)
const actionSchema = z.object({
  // validation rules
});

type ActionData = z.infer<typeof actionSchema>;

// Return type
type ActionResult =
  | { success: true; message: string; data?: any }
  | { success: false; error: string };

export async function actionName(params: ActionData): Promise<ActionResult> {
  try {
    // 1. Validate input (if using schema)
    const validatedData = actionSchema.parse(params);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // 4. Authorization checks
    // ... permission logic

    // 5. Business logic
    // ... main action logic

    // 6. Database operations
    const { data, error } = await supabase
      .from("table_name")
      .operation()
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // 7. Return success
    return {
      success: true,
      message: "Action completed successfully",
      data,
    };
  } catch (error) {
    // 8. Error handling
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
```

## Type Safety

### Use Proper Types

```typescript
// ✅ Good - Use types from custom.types.ts
import {
  Company,
  CompanyInsertDto,
  CompanyUpdateDto,
} from "@/types/custom.types";

// ❌ Bad - Don't use any or unknown
function updateCompany(data: any): Promise<any>;

// ✅ Good - Define specific types
function updateCompany(data: CompanyUpdateDto): Promise<UpdateCompanyResult>;
```

### Return Types

```typescript
// ✅ Good - Use discriminated unions
type ActionResult =
  | { success: true; message: string; data: Company }
  | { success: false; error: string };

// ❌ Bad - Generic return type
type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};
```

## Validation

### Input Validation with Zod

```typescript
// ✅ Good - Comprehensive validation
const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z.string().min(2, "Company slug must be at least 2 characters"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  size: z
    .enum(["startup", "small", "medium", "large", "enterprise"])
    .optional(),
  founded_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
});

// ✅ Good - Handle validation errors
try {
  const validatedData = createCompanySchema.parse(inputData);
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: error.errors[0].message,
    };
  }
}
```

### File Validation

```typescript
// ✅ Good - Validate file type and size
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
if (!allowedTypes.includes(file.type)) {
  return {
    success: false,
    error: "Invalid file type. Only JPEG, PNG, and WebP files are allowed.",
  };
}

const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  return {
    success: false,
    error: "File size too large. Maximum size is 5MB.",
  };
}
```

## Authentication & Authorization

### Authentication Check

```typescript
// ✅ Good - Always check authentication first
const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  return {
    success: false,
    error: "User not authenticated",
  };
}
```

### Role-Based Authorization

```typescript
// ✅ Good - Check user role
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (profileError || profile.role !== "employer") {
  return {
    success: false,
    error: "Only employers can create companies",
  };
}
```

### Permission-Based Authorization

```typescript
// ✅ Good - Check specific permissions
let hasPermission = company.owner_id === user.id;

if (!hasPermission) {
  const { data: member, error: memberError } = await supabase
    .from("company_members")
    .select("permissions")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  if (
    !memberError &&
    member &&
    member.permissions?.includes("manage_company")
  ) {
    hasPermission = true;
  }
}

if (!hasPermission) {
  return {
    success: false,
    error: "You don't have permission to perform this action",
  };
}
```

## Error Handling

### Database Errors

```typescript
// ✅ Good - Handle specific error codes
if (slugError && slugError.code !== "PGRST116") {
  return {
    success: false,
    error: "Failed to check slug availability",
  };
}

// ✅ Good - Check for null data
if (!data) {
  return {
    success: false,
    error: "Resource not found",
  };
}
```

### Generic Error Handling

```typescript
// ✅ Good - Catch all errors
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: error.errors[0].message,
    };
  }

  return {
    success: false,
    error: "An unexpected error occurred while performing action",
  };
}
```

## Database Operations

### Query Patterns

```typescript
// ✅ Good - Select specific fields
const { data, error } = await supabase
  .from("companies")
  .select("id, name, owner_id")
  .eq("id", companyId)
  .single();

// ✅ Good - Use joins for related data
const { data, error } = await supabase
  .from("company_members")
  .select(
    `
    *,
    profiles:user_id (
      id,
      full_name,
      email,
      avatar_url
    )
  `
  )
  .eq("company_id", companyId);
```

### Update Operations

```typescript
// ✅ Good - Always update timestamp
const updateData: Partial<CompanyUpdateDto> = {
  updated_at: new Date().toISOString(),
};

// ✅ Good - Only update provided fields
if (validatedData.name !== undefined) updateData.name = validatedData.name;
if (validatedData.description !== undefined)
  updateData.description = validatedData.description;
```

## File Upload Actions

### File Upload Pattern

```typescript
export async function uploadFile(
  resourceId: number,
  file: File
): Promise<UploadResult> {
  try {
    // 1. Authentication
    // 2. Authorization
    // 3. File validation
    // 4. Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${resourceId}/${Date.now()}.${fileExt}`;

    // 5. Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("bucket-name")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    // 6. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("bucket-name").getPublicUrl(uploadData.path);

    // 7. Update database record
    const { error: updateError } = await supabase
      .from("table_name")
      .update({
        file_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resourceId);

    return {
      success: true,
      fileUrl: publicUrl,
      message: "File uploaded successfully",
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred while uploading file",
    };
  }
}
```

## Return Types

### Success Response

```typescript
// ✅ Good - Include relevant data
return {
  success: true,
  message: "Action completed successfully",
  data: resultData, // Optional: return created/updated data
};
```

### Error Response

```typescript
// ✅ Good - User-friendly error messages
return {
  success: false,
  error: "You don't have permission to perform this action",
};

// ✅ Good - Specific validation errors
return {
  success: false,
  error: "Company name must be at least 2 characters",
};
```

## Examples

### Simple CRUD Action

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { Company } from "@/types/custom.types";

type GetCompanyResult =
  | { success: true; company: Company }
  | { success: false; error: string };

export async function getCompany(companyId: number): Promise<GetCompanyResult> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Company not found",
      };
    }

    return {
      success: true,
      company: data,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred while fetching company",
    };
  }
}
```

### Complex Action with Validation and Authorization

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { CompanyInsertDto } from "@/types/custom.types";
import { z } from "zod";

const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z.string().min(2, "Company slug must be at least 2 characters"),
  description: z.string().optional(),
});

type CompanyData = z.infer<typeof createCompanySchema>;

type CreateCompanyResult =
  | {
      success: true;
      message: string;
      company: CompanyInsertDto & { id: number };
    }
  | { success: false; error: string };

export async function createCompany(
  companyData: CompanyData
): Promise<CreateCompanyResult> {
  try {
    // Validate input
    const validatedData = createCompanySchema.parse(companyData);

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Check authorization
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile.role !== "employer") {
      return {
        success: false,
        error: "Only employers can create companies",
      };
    }

    // Business logic - check slug uniqueness
    const { data: existingCompany, error: slugError } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", validatedData.slug)
      .single();

    if (slugError && slugError.code !== "PGRST116") {
      return {
        success: false,
        error: "Failed to check slug availability",
      };
    }

    if (existingCompany) {
      return {
        success: false,
        error: "Company slug already exists",
      };
    }

    // Create company
    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Failed to create company",
      };
    }

    return {
      success: true,
      message: "Company created successfully",
      company: data,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred while creating company",
    };
  }
}
```

## Best Practices Summary

1. **Always use "use server" directive** at the top of action files
2. **Import types from custom.types.ts** for type safety
3. **Use Zod for input validation** when accepting user data
4. **Always check authentication** before performing actions
5. **Implement proper authorization** based on user roles and permissions
6. **Handle errors gracefully** with user-friendly messages
7. **Use discriminated unions** for return types
8. **Update timestamps** when modifying records
9. **Validate file uploads** for type and size
10. **Use descriptive function and variable names**
11. **Follow consistent code structure** across all actions
12. **Export all actions** from the main index.ts file

## Common Patterns

### Permission Checking Pattern

```typescript
// Check if user is owner or has specific permission
let hasPermission = resource.owner_id === user.id;

if (!hasPermission) {
  const { data: member } = await supabase
    .from("company_members")
    .select("permissions")
    .eq("company_id", resourceId)
    .eq("user_id", user.id)
    .single();

  if (member && member.permissions?.includes("required_permission")) {
    hasPermission = true;
  }
}
```

### Unique Field Validation Pattern

```typescript
// Check if field value is unique
const { data: existing, error: checkError } = await supabase
  .from("table_name")
  .select("id")
  .eq("field_name", value)
  .neq("id", currentId) // Exclude current record for updates
  .single();

if (checkError && checkError.code !== "PGRST116") {
  return { success: false, error: "Failed to check availability" };
}

if (existing) {
  return { success: false, error: "Value already exists" };
}
```

This guidelines document should be followed for all new server actions to ensure consistency, type safety, and maintainability across the codebase.
