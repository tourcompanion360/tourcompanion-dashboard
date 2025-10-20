# 🤖 **CURSOR PROMPT: Support Requests Admin Panel Integration**

## **PROJECT OVERVIEW**
You need to integrate the support request system into the admin dashboard. The support request system has been **FULLY IMPLEMENTED** and is working perfectly. Your task is to connect the admin dashboard to view and manage support requests from tour creators.

## **✅ WHAT HAS BEEN COMPLETED (DON'T CHANGE THESE)**

### **Database System (100% Complete):**
```sql
-- Support requests table created and working:
CREATE TABLE public.support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_response TEXT,
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database functions created and working:
get_all_support_requests() ✅ WORKING
create_support_request() ✅ WORKING

-- RLS policies configured:
- Creators can only see their own requests ✅
- Admins can see ALL requests ✅
```

### **Creator Side (100% Complete):**
- ✅ Support form working in `src/components/Support.tsx`
- ✅ Form submission to `support_requests` table
- ✅ Success/error handling implemented
- ✅ Form validation and loading states
- ✅ Uses `create_support_request()` function

### **Admin Component (100% Complete):**
- ✅ `src/components/admin/SupportRequestsManagement.tsx` created
- ✅ Complete admin interface with all features
- ✅ Status management, priority updates, admin responses
- ✅ Statistics dashboard and filtering
- ✅ Real-time updates and error handling

### **Test Data (Ready):**
- ✅ 2 test support requests in database
- ✅ Different subjects: technical_support, client_portal
- ✅ Different priorities: medium, high
- ✅ Both in "open" status for testing

## **🎯 WHAT YOU NEED TO IMPLEMENT**

### **1. Add Support Requests to Admin Dashboard Navigation**

**Add to your admin dashboard navigation:**
```typescript
// Add this to your admin navigation menu
{
  id: 'support-requests',
  label: 'Support Requests',
  icon: MessageSquare,
  path: '/admin/support-requests'
}
```

### **2. Create Admin Route for Support Requests**

**Add to your admin routes:**
```typescript
// Add this route to your admin dashboard
<Route path="/admin/support-requests" element={<SupportRequestsManagement />} />
```

### **3. Import the Admin Component**

**Add this import to your admin dashboard:**
```typescript
import SupportRequestsManagement from '@/components/admin/SupportRequestsManagement';
```

### **4. Update Admin Dashboard Main Component**

**Add support requests section to your main admin dashboard:**
```typescript
// Add this to your admin dashboard main component
const AdminDashboard = () => {
  // ... existing code ...

  return (
    <div className="space-y-6">
      {/* Existing content */}
      
      {/* Add Support Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Support Requests
          </CardTitle>
          <CardDescription>
            Manage support requests from tour creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {supportRequests.filter(r => r.status === 'open').length}
              </div>
              <div className="text-sm text-muted-foreground">Open Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {supportRequests.filter(r => r.status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {supportRequests.filter(r => r.status === 'resolved').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </div>
          <Button onClick={() => navigate('/admin/support-requests')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Manage Support Requests
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
```

### **5. Add Support Requests Data Loading**

**Add this to your admin dashboard data loading:**
```typescript
// Add this to your admin dashboard data loading
const [supportRequests, setSupportRequests] = useState([]);

useEffect(() => {
  const loadSupportRequests = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_support_requests');
      if (error) throw error;
      setSupportRequests(data || []);
    } catch (error) {
      console.error('Error loading support requests:', error);
    }
  };

  loadSupportRequests();
}, []);
```

## **🎯 COMPLETE IMPLEMENTATION EXAMPLE**

### **File: `src/pages/AdminDashboard.tsx` (or your main admin page)**

```typescript
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot, Users, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SupportRequestsManagement from '@/components/admin/SupportRequestsManagement';
import ChatbotRequestsManagement from '@/components/admin/ChatbotRequestsManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [supportRequests, setSupportRequests] = useState([]);
  const [chatbotRequests, setChatbotRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load support requests
      const { data: supportData, error: supportError } = await supabase.rpc('get_all_support_requests');
      if (supportError) throw supportError;
      setSupportRequests(supportData || []);

      // Load chatbot requests
      const { data: chatbotData, error: chatbotError } = await supabase.rpc('get_all_chatbot_requests');
      if (chatbotError) throw chatbotError;
      setChatbotRequests(chatbotData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage support requests and chatbot requests
          </p>
        </div>
      </div>

      {/* Support Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Support Requests
          </CardTitle>
          <CardDescription>
            Manage support requests from tour creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {supportRequests.filter(r => r.status === 'open').length}
              </div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {supportRequests.filter(r => r.status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {supportRequests.filter(r => r.status === 'resolved').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {supportRequests.length}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
          <Button onClick={() => navigate('/admin/support-requests')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Manage Support Requests
          </Button>
        </CardContent>
      </Card>

      {/* Chatbot Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chatbot Requests
          </CardTitle>
          <CardDescription>
            Manage chatbot development requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {chatbotRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {chatbotRequests.filter(r => r.status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {chatbotRequests.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {chatbotRequests.length}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
          <Button onClick={() => navigate('/admin/chatbot-requests')}>
            <Bot className="h-4 w-4 mr-2" />
            Manage Chatbot Requests
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
```

### **File: `src/App.tsx` (Add Routes)**

```typescript
// Add these routes to your App.tsx
import SupportRequestsManagement from '@/components/admin/SupportRequestsManagement';
import ChatbotRequestsManagement from '@/components/admin/ChatbotRequestsManagement';

// In your Routes section, add:
<Route path="/admin/support-requests" element={<SupportRequestsManagement />} />
<Route path="/admin/chatbot-requests" element={<ChatbotRequestsManagement />} />
```

## **🎯 TESTING THE INTEGRATION**

### **Test Data Available:**
```sql
-- Current support requests in database:
ID: 87182252-572e-4935-920d-492f53f5d18a
Subject: technical_support
Message: "I need help with creating my first virtual tour project..."
Status: open, Priority: medium

ID: 16fe1326-a4a9-495f-9ca4-afa366ade493
Subject: client_portal
Message: "My client is having trouble accessing their portal..."
Status: open, Priority: high
```

### **Test Steps:**
1. **Access Admin Dashboard** → Should see support requests statistics
2. **Click "Manage Support Requests"** → Should navigate to support requests page
3. **View Request Details** → Click on any request to see details
4. **Update Status** → Change status from "open" to "in_progress"
5. **Add Admin Response** → Type response and send to creator
6. **Add Internal Notes** → Add notes for internal tracking

## **🎯 SUCCESS CRITERIA**

- [ ] **Admin Dashboard** shows support requests statistics
- [ ] **Navigation** to support requests management works
- [ ] **Support Requests Page** loads and displays all requests
- [ ] **Request Details** can be viewed and updated
- [ ] **Status Updates** work (open → in_progress → resolved)
- [ ] **Admin Responses** can be added and saved
- [ ] **Internal Notes** can be added for tracking
- [ ] **Filtering** by status works correctly
- [ ] **Real-time Updates** when status changes
- [ ] **Error Handling** for failed operations

## **⚠️ IMPORTANT NOTES**

1. **Don't modify the database schema** - it's complete and working
2. **Don't change the RLS policies** - they're working correctly
3. **Don't modify the creator-side code** - it's fully implemented
4. **The admin component is ready** - just needs integration
5. **Test with existing data** before creating new requests
6. **Use the provided test data** for initial testing

## **📁 FILES TO MODIFY**

- `src/pages/AdminDashboard.tsx` (or your main admin page)
- `src/App.tsx` (add routes)
- Add navigation links to support requests
- Import and use `SupportRequestsManagement` component

## **🚀 WHAT TO SAY TO CURSOR AI**

**Copy and paste this exact message:**

---

**"Integrate the support request system into the admin dashboard. The support request system is already built and working perfectly with database, creator form, and admin component ready. I need you to:**

**1. Add support requests section to the main admin dashboard with statistics**
**2. Add navigation to the support requests management page**
**3. Import and use the SupportRequestsManagement component**
**4. Add routes for /admin/support-requests**
**5. Connect the admin dashboard to load support requests data**

**The database schema, functions, creator-side, and admin component are all complete and working. Focus only on the admin dashboard integration. Test with the existing support requests in the database."**

---

## **🎯 CURRENT STATUS**

- ✅ **Database**: Complete with support_requests table and functions
- ✅ **Creator Side**: Support form working perfectly
- ✅ **Admin Component**: SupportRequestsManagement ready
- ✅ **Test Data**: 2 support requests available for testing
- 🔄 **Admin Integration**: Needs connection to main dashboard

## **📞 SUPPORT**

If you encounter any issues:
1. **Database functions are working** - test them directly if needed
2. **Creator form is working** - test it first to verify
3. **Admin component is ready** - just needs integration
4. **Use existing test data** - don't create new requests initially

---

**The support request system is production-ready and just needs admin dashboard integration! 🚀**


