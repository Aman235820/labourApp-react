# API Debug Test

## Issue
The API `https://labourapp.onrender.com/labourapp/labour/updateAdditionalLabourData` is returning "Failed to save profile settings. Please try again."

## Debugging Steps

### 1. Check API Endpoint
The service is now configured to use:
- Base URL: `https://labourapp.onrender.com` (fallback if env var not set)
- Full endpoint: `https://labourapp.onrender.com/labourapp/labour/updateAdditionalLabourData`

### 2. Enhanced Logging
The service now includes detailed logging:
- Base URL being used
- Full endpoint URL
- Request data being sent
- API response received
- Error details if any

### 3. Error Handling Improvements
- Better error structure with detailed messages
- Network error detection
- Server error details
- Validation for missing labourId

### 4. Test the API Manually
You can test the API manually using curl:

```bash
curl -X PATCH \
  https://labourapp.onrender.com/labourapp/labour/updateAdditionalLabourData \
  -H "Content-Type: application/json" \
  -d '{
    "labourId": 22,
    "timestamp": "2025-01-21T18:45:39.887Z",
    "profileSettings": {
      "hourlyRates": {
        "Home Deep Cleaning": {
          "min": "100",
          "max": "600"
        }
      },
      "satisfactionGuarantee": true,
      "workingHours": {
        "monday": {
          "start": "09:00",
          "end": "17:00",
          "available": true
        }
      }
    }
  }'
```

### 5. Check Browser Console
When you try to save profile settings, check the browser console for:
- Base URL being used
- Full endpoint URL
- Request data structure
- API response or error details

### 6. Common Issues to Check

#### Environment Variable
Make sure `REACT_APP_API_BASEURL` is set correctly in your `.env` file:
```
REACT_APP_API_BASEURL=https://labourapp.onrender.com
```

#### CORS Issues
The API might have CORS restrictions. Check if the request is being blocked.

#### API Authentication
The API might require authentication. Check if you need to include auth headers.

#### Data Validation
The API might be rejecting the data structure. Check the console logs for the exact data being sent.

### 7. Expected Response
The API should return something like:
```json
{
  "success": true,
  "message": "Profile settings updated successfully",
  "data": {
    "labourId": 22,
    "updatedAt": "2025-01-21T18:45:39.887Z"
  }
}
```

### 8. Next Steps
1. Check the browser console when saving
2. Try the manual curl test
3. Verify the environment variable
4. Check if the API requires authentication
5. Contact the API provider if the issue persists

## Debug Information
The enhanced logging will show:
- ✅ Base URL being used
- ✅ Full endpoint URL
- ✅ Request data structure
- ✅ API response or error
- ✅ Detailed error information

This will help identify exactly where the issue is occurring. 