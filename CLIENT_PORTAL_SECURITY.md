# Client Portal Security Documentation

## Overview

This document outlines the security measures implemented to ensure complete isolation of the client portal (`/client/:projectId`) from the main tour creator dashboard. Clients should NEVER be able to access the main dashboard, see TourCompanion branding, or be redirected to any creator-specific routes.

## Security Principles

1. **Complete Isolation**: Client portal operates independently at `/client/:projectId`
2. **No Redirects**: Never redirect clients to `/`, `/auth`, `/dashboard`, or any creator routes
3. **Agency-Only Branding**: Only show the actual agency's information, never TourCompanion
4. **Graceful Error Handling**: Error states handled without exposing internal routes

## Implemented Security Measures

### 1. Access Denied Handler
**File:** `src/pages/ClientDashboard.tsx` (Lines 509-527)

**Security Implementation:**
- ✅ No "Contact Support" button that redirects to main dashboard
- ✅ Simple text message telling client to contact project manager directly
- ✅ No `window.location.href` redirects
- ✅ Security comment added to prevent future regressions

**Code:**
```typescript
/**
 * SECURITY: Never redirect clients to main dashboard (/)
 * Clients should only see project manager contact message
 * NO window.location.href redirects allowed here
 */
if (accessDenied) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">This project is not accessible or has been deactivated. Please contact your project manager for assistance.</p>
        <div className="text-sm text-gray-500">
          <p>If you need assistance, please contact your project manager directly.</p>
        </div>
      </div>
    </div>
  );
}
```

### 2. Project Not Found Handler
**File:** `src/pages/ClientDashboard.tsx` (Lines 529-547)

**Security Implementation:**
- ✅ No "Contact Support" button that redirects to main dashboard
- ✅ Simple text message telling client to contact project manager directly
- ✅ No `window.location.href` redirects
- ✅ Security comment added to prevent future regressions

### 3. Error Boundary Protection
**Files:** 
- `src/components/ErrorBoundary.tsx` (Lines 69-76)
- `src/components/ErrorBoundary/ErrorBoundary.tsx` (Lines 89-96)

**Security Implementation:**
- ✅ Route detection prevents redirect to `/` for client portals
- ✅ For client portals (`/client/`), errors trigger page reload instead of redirect
- ✅ For main dashboard, normal redirect behavior maintained

**Code:**
```typescript
handleGoHome = () => {
  // For client portals, don't redirect to main dashboard
  if (window.location.pathname.startsWith('/client/')) {
    window.location.reload();
  } else {
    window.location.href = '/';
  }
};
```

### 4. Agency Context Branding
**File:** `src/contexts/AgencyContext.tsx` (Lines 41-47)

**Security Implementation:**
- ✅ Public client portal routes get generic "Your Agency" branding instead of "TourCompanion"
- ✅ No TourCompanion logo or branding exposed to clients
- ✅ Uses placeholder logo and generic contact email

**Code:**
```typescript
if (window.location.pathname.startsWith('/client/')) {
  console.log('[AgencyProvider] Skipping agency settings for public client portal');
  setAgencySettings({
    agency_name: 'Your Agency',
    agency_logo: '/placeholder-logo.png',
    current_user_email: 'contact@youragency.com'
  });
  setLoading(false);
  return;
}
```

### 5. ContactFloater Component
**File:** `src/components/ContactFloater.tsx`

**Security Implementation:**
- ✅ Fetches actual agency info from database (agency_name, contact_email, phone, website)
- ✅ No TourCompanion branding
- ✅ No redirects to main dashboard
- ✅ Shows agency-specific WhatsApp and email contact

### 6. Request Submission Handler
**File:** `src/pages/ClientDashboard.tsx` (Lines 327-394)

**Security Implementation:**
- ✅ Only submits to database and reloads data
- ✅ No redirects after successful submission
- ✅ Security comment added to prevent future regressions

**Code:**
```typescript
/**
 * SECURITY: This function only submits to database and reloads data
 * NO redirects to main dashboard or external URLs allowed
 */
const submitRequest = async () => {
  // ... implementation only does database operations
  // NO redirects anywhere
};
```

### 7. Asset Download Links
**File:** `src/pages/ClientDashboard.tsx` (Lines 947-963)

**Security Implementation:**
- ✅ Uses `window.open(asset.file_url, '_blank')` - safe, opens files in new tab
- ✅ No redirects to main dashboard
- ✅ File URLs are validated to be actual file URLs, not dashboard routes

### 8. Tab Navigation
**File:** `src/pages/ClientDashboard.tsx` (Lines 600-675)

**Security Implementation:**
- ✅ All tabs use `setActiveTab()` - safe, just changes local state
- ✅ No external links or redirects
- ✅ Desktop and mobile tab implementations both secure

## What Clients CAN Access

1. **Project Information**: Title, description, status, type
2. **Analytics Data**: Views, visitors, time spent, conversion rates
3. **Media Assets**: Download/view files and URLs shared by agency
4. **Request Submission**: Submit requests for project changes
5. **Request History**: View status of submitted requests
6. **Agency Contact**: WhatsApp and email contact for their specific agency

## What Clients CANNOT Access

1. **Main Dashboard**: `/`, `/dashboard`, `/auth` routes
2. **Tour Creator Features**: Project creation, client management, settings
3. **TourCompanion Branding**: Any reference to the platform name
4. **Other Clients' Data**: Only their own project data
5. **Admin Functions**: User management, billing, system settings
6. **Creator Analytics**: Only see their own project analytics

## Testing Checklist

### Manual Security Testing

1. **Access Test**
   - [ ] Access `/client/:projectId` - should show client dashboard
   - [ ] Try accessing `/` - should redirect to auth (for non-authenticated)
   - [ ] Try accessing `/dashboard` - should redirect to auth

2. **Error State Testing**
   - [ ] Trigger "Access Denied" - should NOT redirect, show contact message
   - [ ] Trigger "Project Not Found" - should NOT redirect, show contact message
   - [ ] Trigger JavaScript error - should reload page, NOT redirect to main dashboard

3. **Button/Interaction Testing**
   - [ ] Click all Quick Action buttons - should change tabs only
   - [ ] Submit request - should submit and stay on same page
   - [ ] Download asset - should download file, not redirect
   - [ ] Open URL asset - should open in new tab, not redirect

4. **Branding Testing**
   - [ ] Check for any "TourCompanion" text - should show "Your Agency"
   - [ ] Check contact info - should show agency-specific details
   - [ ] Check logos - should show agency logo or placeholder

5. **Navigation Testing**
   - [ ] Try browser back/forward - should stay within client portal
   - [ ] Try direct URL manipulation - should not access creator routes
   - [ ] Check all links and buttons - none should leave client portal

### Automated Security Testing

1. **Route Protection**
   - [ ] Verify `/client/:projectId` is publicly accessible
   - [ ] Verify all creator routes require authentication
   - [ ] Verify no client portal routes redirect to creator routes

2. **Data Isolation**
   - [ ] Verify clients only see their own project data
   - [ ] Verify no cross-client data leakage
   - [ ] Verify analytics are project-specific

## Security Monitoring

### What to Watch For

1. **New Redirects**: Any new `window.location.href` or `navigate()` calls
2. **TourCompanion References**: Any hardcoded platform branding
3. **External Links**: Links that could lead to creator dashboard
4. **Error Handling**: Error states that might expose internal routes

### Code Review Checklist

Before any changes to client portal code:

- [ ] No new redirects to `/`, `/auth`, `/dashboard`
- [ ] No TourCompanion branding added
- [ ] Error states handled gracefully
- [ ] All user interactions stay within client portal
- [ ] Contact information remains agency-specific

## Emergency Response

If a security breach is discovered:

1. **Immediate**: Remove any redirects or external links
2. **Document**: Record what was exposed and to whom
3. **Fix**: Implement proper security measures
4. **Test**: Verify fix with security checklist
5. **Monitor**: Watch for any similar issues

## Contact Information

For security concerns or questions about this documentation:
- **Technical Lead**: [Your contact info]
- **Security Team**: [Security contact info]

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Status**: Active


