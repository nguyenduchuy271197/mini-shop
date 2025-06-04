# UI Guidelines - Job Board Platform

## Tổng quan Thiết kế

### Design Philosophy

- **Modern & Clean**: Giao diện hiện đại, tối giản với focus vào nội dung
- **User-Centric**: Ưu tiên trải nghiệm người dùng và khả năng sử dụng
- **Consistent**: Nhất quán trong toàn bộ hệ thống
- **Accessible**: Tuân thủ tiêu chuẩn accessibility WCAG 2.1 AA
- **Responsive**: Tối ưu cho mọi thiết bị từ mobile đến desktop

### Design System Foundation

Sử dụng **Shadcn/ui** làm component library chính với Tailwind CSS và Radix UI primitives.

## Color Palette

### Primary Colors

```css
/* Brand Colors */
--primary: 222.2 84% 4.9%; /* #0f172a - Slate 900 */
--primary-foreground: 210 40% 98%; /* #f8fafc - Slate 50 */

/* Secondary Colors */
--secondary: 210 40% 96%; /* #f1f5f9 - Slate 100 */
--secondary-foreground: 222.2 84% 4.9%; /* #0f172a - Slate 900 */

/* Accent Colors */
--accent: 217.2 91.2% 59.8%; /* #3b82f6 - Blue 500 */
--accent-foreground: 210 40% 98%; /* #f8fafc - Slate 50 */
```

### Semantic Colors

```css
/* Success */
--success: 142.1 76.2% 36.3%; /* #16a34a - Green 600 */
--success-foreground: 138.5 76.5% 96.7%; /* #f0fdf4 - Green 50 */

/* Warning */
--warning: 32.1 94.6% 43.7%; /* #ea580c - Orange 600 */
--warning-foreground: 33.3 100% 96.5%; /* #fff7ed - Orange 50 */

/* Error */
--destructive: 0 84.2% 60.2%; /* #ef4444 - Red 500 */
--destructive-foreground: 0 85.7% 97.3%; /* #fef2f2 - Red 50 */

/* Info */
--info: 199.4 89.2% 48.4%; /* #0ea5e9 - Sky 500 */
--info-foreground: 204 100% 97.1%; /* #f0f9ff - Sky 50 */
```

### Neutral Colors

```css
/* Background & Surfaces */
--background: 0 0% 100%; /* #ffffff - White */
--foreground: 222.2 84% 4.9%; /* #0f172a - Slate 900 */

--card: 0 0% 100%; /* #ffffff - White */
--card-foreground: 222.2 84% 4.9%; /* #0f172a - Slate 900 */

--muted: 210 40% 96%; /* #f1f5f9 - Slate 100 */
--muted-foreground: 215.4 16.3% 46.9%; /* #64748b - Slate 500 */

/* Borders */
--border: 214.3 31.8% 91.4%; /* #e2e8f0 - Slate 200 */
--input: 214.3 31.8% 91.4%; /* #e2e8f0 - Slate 200 */
--ring: 217.2 91.2% 59.8%; /* #3b82f6 - Blue 500 */
```

### Job Board Specific Colors

```css
/* Job Status Colors */
--job-published: 142.1 76.2% 36.3%; /* Green 600 */
--job-draft: 32.1 94.6% 43.7%; /* Orange 600 */
--job-closed: 215.4 16.3% 46.9%; /* Slate 500 */
--job-featured: 262.1 83.3% 57.8%; /* Purple 500 */

/* Application Status Colors */
--app-pending: 32.1 94.6% 43.7%; /* Orange 600 */
--app-reviewing: 199.4 89.2% 48.4%; /* Sky 500 */
--app-shortlisted: 262.1 83.3% 57.8%; /* Purple 500 */
--app-interviewed: 217.2 91.2% 59.8%; /* Blue 500 */
--app-accepted: 142.1 76.2% 36.3%; /* Green 600 */
--app-rejected: 0 84.2% 60.2%; /* Red 500 */

/* Company Size Colors */
--company-startup: 262.1 83.3% 57.8%; /* Purple 500 */
--company-small: 199.4 89.2% 48.4%; /* Sky 500 */
--company-medium: 217.2 91.2% 59.8%; /* Blue 500 */
--company-large: 142.1 76.2% 36.3%; /* Green 600 */
--company-enterprise: 222.2 84% 4.9%; /* Slate 900 */
```

## Typography

### Font Stack

```css
/* Primary Font - Inter */
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
  Arial, sans-serif;

/* Monospace Font - JetBrains Mono */
font-family: "JetBrains Mono", "Fira Code", Consolas, "Liberation Mono", Menlo,
  Courier, monospace;
```

### Typography Scale

```css
/* Headings */
.text-h1 {
  font-size: 3rem;
  line-height: 1.2;
  font-weight: 800;
} /* 48px */
.text-h2 {
  font-size: 2.25rem;
  line-height: 1.25;
  font-weight: 700;
} /* 36px */
.text-h3 {
  font-size: 1.875rem;
  line-height: 1.3;
  font-weight: 600;
} /* 30px */
.text-h4 {
  font-size: 1.5rem;
  line-height: 1.35;
  font-weight: 600;
} /* 24px */
.text-h5 {
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 500;
} /* 20px */
.text-h6 {
  font-size: 1.125rem;
  line-height: 1.45;
  font-weight: 500;
} /* 18px */

/* Body Text */
.text-lg {
  font-size: 1.125rem;
  line-height: 1.6;
} /* 18px */
.text-base {
  font-size: 1rem;
  line-height: 1.6;
} /* 16px */
.text-sm {
  font-size: 0.875rem;
  line-height: 1.5;
} /* 14px */
.text-xs {
  font-size: 0.75rem;
  line-height: 1.4;
} /* 12px */

/* Special Text */
.text-lead {
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: 400;
} /* 20px */
.text-muted {
  color: hsl(var(--muted-foreground));
}
.text-subtle {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}
```

### Typography Usage

- **H1**: Page titles, hero headings
- **H2**: Section headings, card titles
- **H3**: Subsection headings
- **H4**: Component titles
- **H5-H6**: Minor headings, labels
- **Lead**: Introduction paragraphs, important descriptions
- **Base**: Standard body text
- **Small**: Secondary information, metadata
- **Muted**: Helper text, placeholders

## Spacing & Layout

### Spacing Scale

```css
/* Spacing Scale (based on 4px) */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### Layout Grid

```css
/* Container Sizes */
.container-sm {
  max-width: 640px;
} /* Mobile */
.container-md {
  max-width: 768px;
} /* Tablet */
.container-lg {
  max-width: 1024px;
} /* Desktop */
.container-xl {
  max-width: 1280px;
} /* Large Desktop */
.container-2xl {
  max-width: 1536px;
} /* Extra Large */

/* Content Widths */
.content-narrow {
  max-width: 65ch;
} /* Reading content */
.content-wide {
  max-width: 80ch;
} /* Form content */
```

### Component Spacing

- **Card padding**: `p-6` (24px)
- **Button padding**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Input padding**: `px-3 py-2` (12px horizontal, 8px vertical)
- **Section spacing**: `space-y-8` (32px vertical)
- **Component spacing**: `space-y-4` (16px vertical)

## Component Guidelines

### Buttons

```tsx
// Primary Button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>

// Secondary Button
<Button variant="secondary">
  Secondary Action
</Button>

// Outline Button
<Button variant="outline">
  Outline Action
</Button>

// Ghost Button
<Button variant="ghost">
  Ghost Action
</Button>

// Destructive Button
<Button variant="destructive">
  Delete Action
</Button>

// Button Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Cards

```tsx
// Basic Card
<Card className="p-6">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content
  </CardContent>
  <CardFooter>
    Card footer
  </CardFooter>
</Card>

// Job Card
<Card className="hover:shadow-md transition-shadow">
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Job Title</h3>
        <p className="text-muted-foreground">Company Name</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>📍 Location</span>
          <span>💼 Job Type</span>
          <span>💰 Salary Range</span>
        </div>
      </div>
      <Badge variant="secondary">Featured</Badge>
    </div>
  </CardContent>
</Card>
```

### Forms

```tsx
// Form Layout
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      placeholder="Enter your email"
      className="w-full"
    />
    <p className="text-sm text-muted-foreground">
      We'll never share your email.
    </p>
  </div>

  <div className="space-y-2">
    <Label htmlFor="message">Message</Label>
    <Textarea
      id="message"
      placeholder="Enter your message"
      className="min-h-[100px]"
    />
  </div>

  <Button type="submit" className="w-full">
    Submit
  </Button>
</form>
```

### Navigation

```tsx
// Main Navigation
<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-16 items-center">
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold text-xl">JobBoard</span>
      </Link>
    </div>
    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
      <nav className="flex items-center space-x-6">
        <Link href="/jobs" className="text-sm font-medium">Jobs</Link>
        <Link href="/companies" className="text-sm font-medium">Companies</Link>
      </nav>
    </div>
  </div>
</nav>

// Sidebar Navigation
<aside className="w-64 border-r bg-muted/40">
  <nav className="space-y-2 p-4">
    <Button variant="ghost" className="w-full justify-start">
      <Home className="mr-2 h-4 w-4" />
      Dashboard
    </Button>
    <Button variant="ghost" className="w-full justify-start">
      <Search className="mr-2 h-4 w-4" />
      Find Jobs
    </Button>
  </nav>
</aside>
```

### Status Indicators

```tsx
// Job Status Badge
const JobStatusBadge = ({ status }: { status: string }) => {
  const variants = {
    published: "bg-green-100 text-green-800",
    draft: "bg-orange-100 text-orange-800",
    closed: "bg-gray-100 text-gray-800",
    featured: "bg-purple-100 text-purple-800",
  };

  return <Badge className={variants[status]}>{status}</Badge>;
};

// Application Status
const ApplicationStatus = ({ status }: { status: string }) => {
  const config = {
    pending: { color: "orange", icon: "⏳" },
    reviewing: { color: "blue", icon: "👀" },
    shortlisted: { color: "purple", icon: "⭐" },
    accepted: { color: "green", icon: "✅" },
    rejected: { color: "red", icon: "❌" },
  };

  return (
    <div className="flex items-center gap-2">
      <span>{config[status].icon}</span>
      <Badge variant={config[status].color}>{status}</Badge>
    </div>
  );
};
```

## Layout Patterns

### Dashboard Layout

```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <header className="border-b">
    <div className="container flex h-16 items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <UserMenu />
      </div>
    </div>
  </header>

  {/* Main Content */}
  <div className="container py-6">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Stats Cards */}
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">{/* Main Content */}</div>
      <div>{/* Sidebar Content */}</div>
    </div>
  </div>
</div>
```

### Job Listing Layout

```tsx
<div className="container py-6">
  <div className="flex flex-col lg:flex-row gap-6">
    {/* Filters Sidebar */}
    <aside className="lg:w-64 space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Filters</h3>
        {/* Filter components */}
      </Card>
    </aside>

    {/* Job Results */}
    <main className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <div className="flex items-center gap-4">
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
          </Select>
        </div>
      </div>

      <div className="space-y-4">{/* Job cards */}</div>
    </main>
  </div>
</div>
```

### Form Layout

```tsx
<div className="container max-w-2xl py-6">
  <Card className="p-6">
    <CardHeader>
      <CardTitle>Create Job Posting</CardTitle>
      <CardDescription>
        Fill in the details for your job posting
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form className="space-y-6">
        {/* Form sections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          {/* Form fields */}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Job Details</h3>
          {/* Form fields */}
        </div>
      </form>
    </CardContent>

    <CardFooter className="flex justify-between">
      <Button variant="outline">Save as Draft</Button>
      <Button>Publish Job</Button>
    </CardFooter>
  </Card>
</div>
```

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
/* xs: 0px - 639px (default) */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */
/* 2xl: 1536px+ */
```

### Responsive Patterns

```tsx
// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Responsive Navigation
<nav className="hidden md:flex items-center space-x-6">
  {/* Desktop nav */}
</nav>
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="sm" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    {/* Mobile nav */}
  </SheetContent>
</Sheet>

// Responsive Text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>
```

## Accessibility Guidelines

### Focus Management

```css
/* Focus styles */
.focus-visible:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
```

### ARIA Labels

```tsx
// Proper labeling
<Button aria-label="Save job to favorites">
  <Heart className="h-4 w-4" />
</Button>

// Form accessibility
<div>
  <Label htmlFor="job-title">Job Title</Label>
  <Input
    id="job-title"
    aria-describedby="job-title-help"
    required
  />
  <p id="job-title-help" className="text-sm text-muted-foreground">
    Enter a clear, descriptive job title
  </p>
</div>

// Status announcements
<div role="status" aria-live="polite">
  Application submitted successfully
</div>
```

### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio
- **Focus indicators**: Minimum 3:1 contrast ratio

## Animation & Transitions

### Transition Classes

```css
/* Standard transitions */
.transition-base {
  transition: all 150ms ease-in-out;
}

.transition-colors {
  transition: color 150ms ease-in-out, background-color 150ms ease-in-out;
}

.transition-transform {
  transition: transform 150ms ease-in-out;
}

/* Hover effects */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hover-scale:hover {
  transform: scale(1.02);
}
```

### Loading States

```tsx
// Skeleton Loading
<div className="space-y-4">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-20 w-full" />
</div>

// Button Loading
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>

// Card Loading
<Card className="p-6">
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-muted rounded w-3/4"></div>
    <div className="h-4 bg-muted rounded w-1/2"></div>
    <div className="h-20 bg-muted rounded"></div>
  </div>
</Card>
```

## Icons & Imagery

### Icon Usage

```tsx
// Lucide React Icons (recommended)
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Heart,
  Bell,
  User,
  Settings
} from "lucide-react"

// Icon sizes
<Search className="h-4 w-4" />  // Small (16px)
<Search className="h-5 w-5" />  // Medium (20px)
<Search className="h-6 w-6" />  // Large (24px)
<Search className="h-8 w-8" />  // Extra Large (32px)

// Icon with text
<div className="flex items-center gap-2">
  <MapPin className="h-4 w-4 text-muted-foreground" />
  <span className="text-sm">San Francisco, CA</span>
</div>
```

### Image Guidelines

```tsx
// Company Logo
<div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
  <img
    src={company.logoUrl}
    alt={`${company.name} logo`}
    className="h-full w-full object-cover"
  />
</div>

// Avatar
<Avatar className="h-8 w-8">
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
</Avatar>

// Company Banner
<div className="h-32 w-full rounded-lg overflow-hidden bg-muted">
  <img
    src={company.bannerUrl}
    alt={`${company.name} banner`}
    className="h-full w-full object-cover"
  />
</div>
```

## Error Handling & Feedback

### Error States

```tsx
// Form Error
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    className={cn("w-full", error && "border-destructive")}
  />
  {error && (
    <p className="text-sm text-destructive flex items-center gap-2">
      <AlertCircle className="h-4 w-4" />
      {error.message}
    </p>
  )}
</div>

// Empty State
<div className="text-center py-12">
  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
  <p className="text-muted-foreground mb-4">
    Try adjusting your search criteria
  </p>
  <Button variant="outline">Clear filters</Button>
</div>

// Error Page
<div className="text-center py-20">
  <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
  <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
  <p className="text-muted-foreground mb-6">
    We're sorry, but something unexpected happened.
  </p>
  <div className="space-x-4">
    <Button onClick={() => window.location.reload()}>
      Try again
    </Button>
    <Button variant="outline" asChild>
      <Link href="/">Go home</Link>
    </Button>
  </div>
</div>
```

### Success Feedback

```tsx
// Toast Notifications
import { toast } from "sonner"

// Success toast
toast.success("Job application submitted successfully!")

// Error toast
toast.error("Failed to submit application. Please try again.")

// Loading toast
toast.loading("Submitting application...")

// Success Banner
<Alert className="border-green-200 bg-green-50">
  <CheckCircle className="h-4 w-4 text-green-600" />
  <AlertTitle className="text-green-800">Success!</AlertTitle>
  <AlertDescription className="text-green-700">
    Your profile has been updated successfully.
  </AlertDescription>
</Alert>
```

## Performance Guidelines

### Image Optimization

```tsx
// Next.js Image component
import Image from "next/image";

<Image
  src={company.logoUrl}
  alt={`${company.name} logo`}
  width={48}
  height={48}
  className="rounded-lg"
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>;
```

### Code Splitting

```tsx
// Lazy load heavy components
import { lazy, Suspense } from "react"

const JobApplicationForm = lazy(() => import("./JobApplicationForm"))

<Suspense fallback={<Skeleton className="h-96" />}>
  <JobApplicationForm />
</Suspense>
```

### Bundle Optimization

- Use tree-shaking friendly imports
- Lazy load non-critical components
- Optimize images with WebP format
- Use CDN for static assets
- Implement proper caching strategies

## Testing Guidelines

### Component Testing

```tsx
// Test component accessibility
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("JobCard should be accessible", async () => {
  const { container } = render(<JobCard job={mockJob} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Test component interactions
test("should save job when heart icon is clicked", async () => {
  const user = userEvent.setup();
  render(<JobCard job={mockJob} />);

  const saveButton = screen.getByRole("button", { name: /save job/i });
  await user.click(saveButton);

  expect(mockSaveJob).toHaveBeenCalledWith(mockJob.id);
});
```

### Visual Testing

- Use Storybook for component documentation
- Implement visual regression testing
- Test across different screen sizes
- Validate color contrast ratios
- Test with screen readers

---

_Tài liệu này sẽ được cập nhật theo sự phát triển của design system và phản hồi từ team._
