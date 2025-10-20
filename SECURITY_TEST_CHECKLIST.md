# Client Portal Security Test Checklist

## Quick Security Verification

Use this checklist to verify that the client portal is completely isolated from the main tour creator dashboard.

### 1. Access Control Tests

**Test Client Portal Access:**
- [ ] Navigate to `/client/[any-project-id]`
- [ ] Should show client dashboard without requiring login
- [ ] Should NOT redirect to `/auth` or `/dashboard`

**Test Main Dashboard Protection:**
- [ ] Try to access `/` without authentication
- [ ] Should redirect to `/auth` (not accessible to clients)
- [ ] Try to access `/dashboard` without authentication  
- [ ] Should redirect to `/auth` (not accessible to clients)

### 2. Error State Security Tests

**Access Denied Scenario:**
- [ ] Trigger access denied (invalid project ID or deactivated project)
- [ ] Should show "Access Denied" message
- [ ] Should NOT have "Contact Support" button that redirects
- [ ] Should only show message to contact project manager

**Project Not Found Scenario:**
- [ ] Trigger project not found (non-existent project ID)
- [ ] Should show "Project Not Found" message
- [ ] Should NOT have "Contact Support" button that redirects
- [ ] Should only show message to contact project manager

**JavaScript Error Scenario:**
- [ ] Trigger a JavaScript error (open browser console, cause error)
- [ ] Error boundary should catch error
- [ ] Should reload page, NOT redirect to main dashboard
- [ ] Should stay within client portal

### 3. User Interaction Security Tests

**Button Click Tests:**
- [ ] Click "Submit Request" button - should change to requests tab
- [ ] Click "View Media" button - should change to media tab  
- [ ] Click "View Analytics" button - should change to analytics tab
- [ ] All buttons should stay within client portal

**Tab Navigation Tests:**
- [ ] Click all desktop tabs (Overview, Analytics, Media, Requests)
- [ ] Click all mobile tabs
- [ ] All should change local state only, no redirects

**Asset Download Tests:**
- [ ] Click "Download" button on any file asset
- [ ] Should download file or open in new tab
- [ ] Should NOT redirect to main dashboard
- [ ] Click "Open Link" button on any URL asset
- [ ] Should open URL in new tab
- [ ] Should NOT redirect to main dashboard

**Request Submission Test:**
- [ ] Fill out request form and submit
- [ ] Should show success message
- [ ] Should stay on same page/tab
- [ ] Should NOT redirect to login or main dashboard

### 4. Branding Security Tests

**TourCompanion Branding Check:**
- [ ] Search page for "TourCompanion" text - should NOT appear
- [ ] Check page title - should show project/agency name, not "TourCompanion"
- [ ] Check any logos - should show agency logo or placeholder, not TourCompanion logo

**Agency-Specific Information:**
- [ ] Contact information should show agency details
- [ ] WhatsApp button should use agency phone number
- [ ] Email contact should use agency email
- [ ] Should NOT show generic "support@tourcompanion.com"

### 5. URL and Navigation Security Tests

**Direct URL Tests:**
- [ ] Try accessing `/client/invalid-id` - should show appropriate error
- [ ] Try accessing `/client/` - should show 404 or error
- [ ] Try accessing `/client/../dashboard` - should not work
- [ ] Try accessing `/client/../auth` - should not work

**Browser Navigation Tests:**
- [ ] Use browser back button - should stay within client portal
- [ ] Use browser forward button - should stay within client portal
- [ ] Try to bookmark and revisit - should work correctly
- [ ] Try to refresh page - should reload client portal

### 6. Data Isolation Tests

**Project Data Isolation:**
- [ ] Verify only project-specific data is shown
- [ ] Analytics should be for this project only
- [ ] Media assets should be for this project only
- [ ] Requests should be for this project only

**Cross-Client Data Protection:**
- [ ] Try accessing different project ID
- [ ] Should show different project data or access denied
- [ ] Should NOT show data from other projects

## Automated Security Checks

### Console Error Check
```javascript
// Run in browser console on client portal page
// Should NOT see any errors about redirects or authentication
console.log('Current URL:', window.location.href);
console.log('Should start with /client/ and NOT redirect anywhere');
```

### Network Request Check
```javascript
// Check network tab in browser dev tools
// Should NOT see requests to:
// - /auth
// - /dashboard  
// - /api/auth
// - Any creator-specific endpoints
```

### DOM Content Check
```javascript
// Search for any TourCompanion references
document.body.innerText.includes('TourCompanion'); // Should return false
document.body.innerHTML.includes('tourcompanion'); // Should return false
```

## Security Violations to Report

If you find any of these, it's a security issue:

1. **Redirects to Main Dashboard**: Any button/link that goes to `/`, `/auth`, `/dashboard`
2. **TourCompanion Branding**: Any visible "TourCompanion" text or logo
3. **Generic Support Links**: Links to generic support instead of agency contact
4. **Cross-Client Data**: Seeing data from other clients' projects
5. **Authentication Prompts**: Being asked to login on client portal
6. **Error Redirects**: Error states that redirect to main dashboard

## Test Results Template

```
Date: ___________
Tester: ___________
Project ID Tested: ___________

Access Control: [ ] PASS [ ] FAIL
Error States: [ ] PASS [ ] FAIL  
User Interactions: [ ] PASS [ ] FAIL
Branding: [ ] PASS [ ] FAIL
URL/Navigation: [ ] PASS [ ] FAIL
Data Isolation: [ ] PASS [ ] FAIL

Overall Security Status: [ ] SECURE [ ] VULNERABLE

Issues Found:
- [List any security issues discovered]

Notes:
[Additional observations]
```

---

**Remember**: The client portal must be completely isolated. If ANY test fails, it's a security issue that needs immediate attention.


