Dựa vào PRD và schema database, tôi sẽ liệt kê tất cả các server actions cần thiết cho hệ thống job board (chỉ bao gồm các table có trong database):

## **1. Authentication & User Management Actions**

### **Auth Actions (FR01, FR02, FR08, FR09, FR10)**

```typescript
// auth/register.ts
async function registerUser(
  email: string,
  password: string,
  role: "job_seeker" | "employer",
  fullName: string
);

// auth/login.ts
async function loginUser(email: string, password: string);

// auth/logout.ts
async function logoutUser();

// auth/change-password.ts
async function changePassword(currentPassword: string, newPassword: string);

// auth/forgot-password.ts
async function forgotPassword(email: string);

// auth/reset-password.ts
async function resetPassword(token: string, newPassword: string);
```

### **Profile Management (FR03, FR04)**

```typescript
// users/update-profile.ts
async function updateUserProfile(profileData: UserProfileUpdate);

// users/get-profile.ts
async function getUserProfile(userId: string);

// users/upload-avatar.ts
async function uploadAvatar(file: File);

// users/get-user-role.ts
async function getUserRole(userId: string);
```

## **2. Job Seeker Actions**

### **Job Search & Discovery (FR05, FR06, FR07, FR11)**

```typescript
// jobs/search-jobs.ts
async function searchJobs(filters: JobSearchFilters);

// jobs/get-jobs.ts
async function getJobs(pagination: PaginationParams, filters?: JobFilters);

// jobs/get-job-details.ts
async function getJobDetails(jobId: number);

// jobs/get-job-by-slug.ts
async function getJobBySlug(slug: string);

// categories/get-categories.ts
async function getJobCategories();

// categories/get-category-jobs.ts
async function getCategoryJobs(
  categoryId: number,
  pagination: PaginationParams
);
```

### **Job Applications (FR14, FR15, FR18, FR20)**

```typescript
// applications/create-application.ts
async function createApplication(applicationData: CreateApplicationData);

// applications/get-user-applications.ts
async function getUserApplications(
  userId: string,
  status?: ApplicationStatus,
  pagination?: PaginationParams
);

// applications/get-application-details.ts
async function getApplicationDetails(applicationId: number);

// applications/update-application.ts
async function updateApplication(
  applicationId: number,
  updateData: ApplicationUpdate
);

// applications/withdraw-application.ts
async function withdrawApplication(applicationId: number);

// applications/track-application-status.ts
async function trackApplicationStatus(applicationId: number);
```

### **Saved Jobs (FR16)**

```typescript
// saved-jobs/save-job.ts
async function saveJob(userId: string, jobId: number);

// saved-jobs/unsave-job.ts
async function unsaveJob(userId: string, jobId: number);

// saved-jobs/get-saved-jobs.ts
async function getSavedJobs(userId: string, pagination: PaginationParams);

// saved-jobs/check-job-saved.ts
async function checkJobSaved(userId: string, jobId: number);
```

## **3. Employer Actions**

### **Company Management (FR22)**

```typescript
// companies/create-company.ts
async function createCompany(companyData: CompanyData);

// companies/update-company.ts
async function updateCompany(companyId: number, companyData: CompanyUpdate);

// companies/delete-company.ts
async function deleteCompany(companyId: number);

// companies/get-company.ts
async function getCompany(companyId: number);

// companies/get-company-by-slug.ts
async function getCompanyBySlug(slug: string);

// companies/get-user-companies.ts
async function getUserCompanies();

// companies/upload-company-logo.ts
async function uploadCompanyLogo(companyId: number, file: File);

// companies/upload-company-banner.ts
async function uploadCompanyBanner(companyId: number, file: File);

// companies/verify-company.ts
async function verifyCompany(companyId: number);
```

### **Company Team Management**

```typescript
// company-members/invite-member.ts
async function inviteCompanyMember(
  companyId: number,
  email: string,
  role: string,
  permissions: string[]
);

// company-members/accept-invitation.ts
async function acceptCompanyInvitation(invitationId: number);

// company-members/remove-member.ts
async function removeCompanyMember(companyId: number, userId: string);

// company-members/update-member-permissions.ts
async function updateMemberPermissions(
  companyId: number,
  userId: string,
  permissions: string[]
);

// company-members/get-company-members.ts
async function getCompanyMembers(companyId: number);
```

### **Job Management (FR23, FR24)**

```typescript
// jobs/create-job.ts
async function createJob(jobData: CreateJobData);

// jobs/update-job.ts
async function updateJob(jobId: number, jobData: JobUpdate);

// jobs/delete-job.ts
async function deleteJob(jobId: number);

// jobs/publish-job.ts
async function publishJob(jobId: number);

// jobs/unpublish-job.ts
async function unpublishJob(jobId: number);

// jobs/extend-job-deadline.ts
async function extendJobDeadline(jobId: number, newDeadline: Date);

// jobs/get-company-jobs.ts
async function getCompanyJobs(
  companyId: number,
  status?: JobStatus,
  pagination?: PaginationParams
);

// jobs/duplicate-job.ts
async function duplicateJob(jobId: number);

// jobs/feature-job.ts
async function featureJob(jobId: number);
```

### **Application Management (FR25, FR26, FR27)**

```typescript
// applications/get-job-applications.ts
async function getJobApplications(
  jobId: number,
  status?: ApplicationStatus,
  pagination?: PaginationParams
);

// applications/get-company-applications.ts
async function getCompanyApplications(
  companyId: number,
  filters?: ApplicationFilters,
  pagination?: PaginationParams
);

// applications/view-application.ts
async function viewApplication(applicationId: number);

// applications/update-application-status.ts
async function updateApplicationStatus(
  applicationId: number,
  status: ApplicationStatus,
  feedback?: string
);

// applications/schedule-interview.ts
async function scheduleInterview(
  applicationId: number,
  interviewData: InterviewData
);

// applications/bulk-update-applications.ts
async function bulkUpdateApplications(
  applicationIds: number[],
  status: ApplicationStatus
);
```

### **Candidate Search (FR28, FR29)**

```typescript
// candidates/search-candidates.ts
async function searchCandidates(searchCriteria: CandidateSearchCriteria);

// candidates/get-candidate-profile.ts
async function getCandidateProfile(candidateId: string);

// candidates/save-candidate.ts
async function saveCandidate(employerId: string, candidateId: string);

// candidates/get-saved-candidates.ts
async function getSavedCandidates(
  employerId: string,
  pagination: PaginationParams
);

// candidates/unsave-candidate.ts
async function unsaveCandidate(employerId: string, candidateId: string);
```

### **Communication (FR30)**

```typescript
// communication/send-candidate-email.ts
async function sendCandidateEmail(applicationId: number, emailData: EmailData);

// communication/send-interview-invitation.ts
async function sendInterviewInvitation(
  applicationId: number,
  interviewDetails: InterviewDetails
);

// communication/send-rejection-email.ts
async function sendRejectionEmail(
  applicationId: number,
  rejectionReason?: string
);

// communication/send-offer-email.ts
async function sendOfferEmail(
  applicationId: number,
  offerDetails: OfferDetails
);
```

### **Reports & Analytics (FR31, FR32)**

```typescript
// reports/get-recruitment-report.ts
async function getRecruitmentReport(companyId: number, dateRange: DateRange);

// reports/get-job-performance.ts
async function getJobPerformance(jobId: number);

// reports/get-application-analytics.ts
async function getApplicationAnalytics(companyId: number, dateRange: DateRange);

// reports/export-applications.ts
async function exportApplications(
  jobId: number,
  format: "excel" | "csv",
  filters?: ApplicationFilters
);

// reports/export-candidates.ts
async function exportCandidates(
  companyId: number,
  format: "excel" | "csv",
  filters?: CandidateFilters
);
```

## **4. Common System Actions**

### **Search & Filtering**

```typescript
// search/global-search.ts
async function globalSearch(query: string, filters: GlobalSearchFilters);

// search/autocomplete-search.ts
async function autocompleteSearch(query: string, type: SearchType);

// search/advanced-job-search.ts
async function advancedJobSearch(criteria: AdvancedSearchCriteria);

// search/get-search-suggestions.ts
async function getSearchSuggestions(query: string);
```

### **File Management**

```typescript
// files/upload-file.ts
async function uploadFile(file: File, bucket: string, path: string);

// files/delete-file.ts
async function deleteFile(filePath: string, bucket: string);

// files/get-file-url.ts
async function getFileUrl(filePath: string, bucket: string);

// files/get-signed-upload-url.ts
async function getSignedUploadUrl(fileName: string, bucket: string);
```

### **Analytics & Tracking**

```typescript
// analytics/track-job-view.ts
async function trackJobView(jobId: number, userId?: string);

// analytics/track-company-view.ts
async function trackCompanyView(companyId: number, userId?: string);

// analytics/track-search.ts
async function trackSearch(searchQuery: string, filters: any, userId?: string);

// analytics/get-job-analytics.ts
async function getJobAnalytics(jobId: number);

// analytics/get-company-analytics.ts
async function getCompanyAnalytics(companyId: number);
```

### **Content Management**

```typescript
// categories/create-category.ts
async function createJobCategory(categoryData: CategoryData);

// categories/update-category.ts
async function updateJobCategory(
  categoryId: number,
  categoryData: CategoryUpdate
);

// categories/delete-category.ts
async function deleteJobCategory(categoryId: number);

// categories/assign-job-category.ts
async function assignJobCategory(jobId: number, categoryId: number);

// categories/remove-job-category.ts
async function removeJobCategory(jobId: number, categoryId: number);
```

### **System Administration**

```typescript
// admin/get-system-stats.ts
async function getSystemStats();

// admin/moderate-content.ts
async function moderateContent(contentId: string, action: ModerationAction);

// admin/manage-featured-jobs.ts
async function manageFeaturedJobs(jobIds: number[], featured: boolean);

// admin/verify-companies.ts
async function verifyCompanies(companyIds: number[]);

// admin/export-system-data.ts
async function exportSystemData(dataType: string, filters: any);
```

### **Email & Communication**

```typescript
// email/send-welcome-email.ts
async function sendWelcomeEmail(userId: string, userType: UserRole);

// email/send-password-reset-email.ts
async function sendPasswordResetEmail(email: string, resetToken: string);

// email/send-application-confirmation.ts
async function sendApplicationConfirmation(applicationId: number);

// email/send-status-update-email.ts
async function sendStatusUpdateEmail(applicationId: number, newStatus: string);
```

### **Data Validation & Utilities**

```typescript
// validation/validate-email.ts
async function validateEmail(email: string);

// validation/check-slug-availability.ts
async function checkSlugAvailability(slug: string, type: "job" | "company");

// utils/generate-slug.ts
async function generateSlug(text: string);

// utils/sanitize-content.ts
async function sanitizeContent(content: string);
```

## **Tổng cộng: ~71 Server Actions**

Các server actions này đáp ứng các functional requirements trong PRD và tương thích với database schema hiện tại. Chúng được tổ chức theo:

- **Authentication & User Management**: 10 actions
- **Job Seeker Features**: 18 actions
- **Employer Features**: 31 actions
- **System & Common Features**: 12 actions
