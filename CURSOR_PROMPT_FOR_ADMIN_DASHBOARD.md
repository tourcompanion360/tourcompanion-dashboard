# 🤖 **CURSOR PROMPT: Admin Dashboard - Chatbot Deletion System Integration**

## **PROJECT OVERVIEW**
You need to integrate the chatbot deletion system into the admin dashboard. The deletion system has been implemented with soft delete (creator) and hard delete (admin) functionality. Your task is to ensure the admin dashboard properly handles and displays the deletion status.

## **WHAT HAS BEEN IMPLEMENTED (DON'T CHANGE THESE)**

### ✅ **Database Schema (Already Done):**
```sql
-- Deletion tracking fields added to chatbot_requests table:
deleted_by_creator BOOLEAN DEFAULT FALSE
deleted_by_admin BOOLEAN DEFAULT FALSE  
creator_deleted_at TIMESTAMP WITH TIME ZONE
admin_deleted_at TIMESTAMP WITH TIME ZONE
deletion_reason TEXT

-- Database functions created:
soft_delete_chatbot_request(request_id UUID, deletion_reason TEXT)
hard_delete_chatbot_request(request_id UUID)
```

### ✅ **Creator Side (Already Done):**
- Tour creators can "soft delete" their requests
- Deleted requests disappear from creator UI
- Creator deletion is tracked in database
- RLS policies updated to hide soft-deleted requests from creators

### ✅ **Admin Side (Already Done):**
- Admin can see deletion status in request cards
- Admin can see "Deleted by Creator" badge
- Admin can perform "hard delete" (permanent removal)
- Admin UI shows deletion details and timestamps

## **WHAT YOU NEED TO IMPLEMENT**

### **1. Update Admin Dashboard Queries**

**File:** `src/components/AdminChatbotRequests.tsx` (or your admin component)

**Current Query (Update This):**
```typescript
// OLD - This hides deleted requests from admin
const { data, error } = await supabase
  .from('chatbot_requests')
  .select(`
    *,
    projects!inner(
      id,
      title,
      end_clients!inner(
        id,
        name,
        email,
        company,
        creators!inner(
          id,
          agency_name,
          contact_email
        )
      )
    )
  `)
  .order('created_at', { ascending: false });
```

**NEW - This shows ALL requests including deleted ones:**
```typescript
// NEW - Admin should see everything including deleted requests
const { data, error } = await supabase
  .from('chatbot_requests')
  .select(`
    *,
    projects!inner(
      id,
      title,
      end_clients!inner(
        id,
        name,
        email,
        company,
        creators!inner(
          id,
          agency_name,
          contact_email
        )
      )
    )
  `)
  .order('created_at', { ascending: false });
```

### **2. Add Deletion Status Display**

**In your request cards, add:**
```typescript
// Add this to your request card rendering
{request.deleted_by_creator && (
  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
    Deleted by Creator
  </Badge>
)}
```

### **3. Add Hard Delete Functionality**

**Add this function to your admin component:**
```typescript
const handleHardDelete = async (requestId: string) => {
  try {
    setHardDeletingId(requestId);
    
    const { error } = await supabase.rpc('hard_delete_chatbot_request', {
      request_id: requestId
    });

    if (error) throw error;

    toast({
      title: 'Request Permanently Deleted',
      description: 'The chatbot request has been permanently removed from the system.',
    });

    // Remove from local state
    setRequests(prev => prev.filter(req => req.id !== requestId));
    setSelectedRequest(null);
  } catch (error: any) {
    console.error('Error hard deleting request:', error);
    toast({
      title: 'Delete Failed',
      description: error.message || 'Failed to permanently delete the request.',
      variant: 'destructive'
    });
  } finally {
    setHardDeletingId(null);
  }
};
```

### **4. Add Hard Delete Button**

**In your detailed request view, add:**
```typescript
{/* Hard Delete Section */}
<div className="space-y-2 border-t pt-4">
  <Label className="text-red-600">Danger Zone</Label>
  <div className="space-y-2">
    {selectedRequest.deleted_by_creator && (
      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">
            Deleted by Creator
          </span>
        </div>
        <p className="text-sm text-orange-700">
          This request was deleted by the creator on{' '}
          {selectedRequest.creator_deleted_at && 
            format(new Date(selectedRequest.creator_deleted_at), 'MMM d, yyyy HH:mm')
          }
        </p>
        {selectedRequest.deletion_reason && (
          <p className="text-sm text-orange-600 mt-1">
            Reason: {selectedRequest.deletion_reason}
          </p>
        )}
      </div>
    )}
    <Button
      variant="destructive"
      size="sm"
      onClick={() => handleHardDelete(selectedRequest.id)}
      disabled={hardDeletingId === selectedRequest.id}
      className="w-full"
    >
      {hardDeletingId === selectedRequest.id ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      )}
      Permanently Delete Request
    </Button>
  </div>
</div>
```

### **5. Update TypeScript Interface**

**Add these fields to your ChatbotRequest interface:**
```typescript
interface ChatbotRequest {
  // ... existing fields ...
  
  // Deletion tracking:
  deleted_by_creator?: boolean;
  deleted_by_admin?: boolean;
  creator_deleted_at?: string;
  admin_deleted_at?: string;
  deletion_reason?: string;
}
```

### **6. Add Required Imports**

**Add these imports to your admin component:**
```typescript
import { 
  // ... existing imports ...
  AlertCircle,
  Trash2,
  Loader2
} from 'lucide-react';
```

## **HOW THE DELETION SYSTEM WORKS**

### **Creator Deletion (Soft Delete):**
1. **Creator clicks "Delete Request"** → Calls `soft_delete_chatbot_request()`
2. **Database updates:** `deleted_by_creator = TRUE`, `creator_deleted_at = NOW()`
3. **Creator UI:** Request disappears (RLS policy hides it)
4. **Admin UI:** Request still visible with "Deleted by Creator" badge

### **Admin Deletion (Hard Delete):**
1. **Admin clicks "Permanently Delete"** → Calls `hard_delete_chatbot_request()`
2. **Database:** Request is completely removed from database
3. **Both UIs:** Request disappears permanently

## **TESTING THE SYSTEM**

### **Test Creator Deletion:**
1. Go to creator dashboard → Chatbots section
2. Click "Delete Request" on any request
3. Verify request disappears from creator UI
4. Go to admin dashboard
5. Verify request still shows with "Deleted by Creator" badge

### **Test Admin Deletion:**
1. In admin dashboard, find a request with "Deleted by Creator" badge
2. Click on the request to view details
3. Scroll to "Danger Zone" section
4. Click "Permanently Delete Request"
5. Verify request disappears from admin UI permanently

## **CURRENT TEST DATA**

**Available for testing:**
- Request ID: `ab3bba39-5bba-4d62-9323-bf0b40f3ce49` (Status: completed)
- Request ID: `9ba1f851-8ecd-4cc0-ba14-b13712e51dac` (Status: rejected)  
- Request ID: `c3e7220b-c5d3-418a-b22c-626fbd8ffa71` (Status: pending)

**All currently have:** `deleted_by_creator = false`

## **SUCCESS CRITERIA**

✅ **Admin sees all requests** (including soft-deleted ones)
✅ **"Deleted by Creator" badge** appears on soft-deleted requests
✅ **Deletion details** shown in request details (timestamp, reason)
✅ **Hard delete button** works and permanently removes requests
✅ **Real-time updates** when creators delete requests
✅ **Proper error handling** for deletion operations

## **IMPORTANT NOTES**

1. **Don't modify the database schema** - it's already complete
2. **Don't change the RLS policies** - they're working correctly
3. **Don't modify creator-side code** - it's already implemented
4. **Focus only on admin dashboard** integration
5. **Test with the existing data** before creating new requests

## **FILES TO MODIFY**

- `src/components/AdminChatbotRequests.tsx` (or your main admin component)
- Add deletion status display to request cards
- Add hard delete functionality to detailed view
- Update queries to show all requests (including deleted)

## **WHAT TO SAY TO CURSOR AI**

"Implement the chatbot deletion system integration for the admin dashboard. The deletion system is already built with soft delete (creator) and hard delete (admin) functionality. I need you to:

1. Update admin queries to show ALL requests including soft-deleted ones
2. Add 'Deleted by Creator' badge to request cards  
3. Add hard delete functionality with confirmation
4. Show deletion details (timestamp, reason) in request details
5. Add proper error handling and loading states

The database schema and functions are already complete. Focus only on the admin dashboard UI integration. Test with the existing requests in the database."

---

**This system provides complete deletion control: creators can hide their requests, admins can see everything and permanently delete when needed.**


