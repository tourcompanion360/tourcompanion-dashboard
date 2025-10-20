# Admin Panel Test Checklist

## Before Migration:
- [ ] Record baseline page load times
- [ ] Verify all admin functions work
- [ ] Export test data for comparison

## After Migration:
- [ ] Test all admin panel pages
- [ ] Compare page load times (expect 50-70% improvement)
- [ ] Verify data matches pre-migration exports
- [ ] Check RLS policies with `SELECT * FROM pg_policies`

## Critical Tests (manual testing checklist):

1. **Database Overview**: ✓ Can view all tables
2. **Creator Management**: ✓ Can view all creators
3. **Client Management**: ✓ Can view all end clients
4. **Project Management**: ✓ Can view all projects
5. **Chatbot Management**: ✓ Can view all chatbots and requests
6. **Support Requests**: ✓ Can view all support requests (`get_all_support_requests` function)
7. **Contact Submissions**: ✓ Can view all contact submissions (`get_all_contact_submissions` function)
8. **Analytics**: ✓ Can view all analytics data (`get_client_analytics` function)
9. **Performance**: ✓ Pages load 2-3x faster than before