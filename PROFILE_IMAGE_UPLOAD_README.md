# Profile Image Upload Feature

## Overview
The Labour Dashboard now includes a profile image upload feature that allows labour users to upload and manage their profile pictures. This feature helps build trust with customers by displaying professional profile images.

## Features

### 1. Profile Image Upload
- **Supported Formats**: JPEG, JPG, PNG, WebP
- **Maximum File Size**: 5MB
- **Upload Locations**: 
  - Header profile badge (camera icon overlay)
  - Profile Settings section (dedicated upload area)

### 2. Image Management
- **Upload**: Click the camera icon or upload button to select an image
- **Preview**: Real-time preview of the uploaded image
- **Remove**: Option to remove the current profile image
- **Validation**: File type and size validation with user feedback

### 3. User Experience
- **Loading States**: Spinner indicators during upload
- **Success Messages**: Confirmation when upload is successful
- **Error Handling**: Clear error messages for validation failures
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## API Integration

### Endpoint
```
POST /labourapp/labour/uploadImage/{labourId}
```

### Request Format
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: FormData with 'file' field containing the image

### Response Format
```json
{
  "labourId": 21,
  "url": "https://res.cloudinary.com/dxkskrlrn/image/upload/v1753207425/labour/21/e384b265-ebc9-4cc5-b462-306d77140730.png"
}
```

### Error Handling
- File type validation
- File size validation (max 5MB)
- Network error handling
- Server error handling

## Implementation Details

### Service Layer (`src/services/labourService.js`)
```javascript
uploadProfileImage: async (labourId, imageFile) => {
  const endpoint = `${baseurl}/labour/uploadImage/${labourId}`;
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await axios.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
}
```

### Component Integration (`src/components/LabourDashboard.js`)
- State management for upload status
- File validation
- Error handling
- Success feedback
- Image preview and management

### CSS Styling (`src/styles/LabourDashboard.css`)
- Professional upload button design
- Loading state animations
- Responsive design for mobile devices
- Hover effects and transitions

## Usage Instructions

### For Labour Users

1. **Upload via Header**:
   - Click the camera icon on your profile picture in the header
   - Select an image file (JPEG, PNG, or WebP)
   - Wait for upload to complete
   - See success confirmation

2. **Upload via Settings**:
   - Go to Profile Settings section
   - Click "Upload Image" button
   - Select an image file
   - Preview the image
   - Click "Remove" if you want to remove the current image

### File Requirements
- **Formats**: JPEG, JPG, PNG, WebP
- **Size**: Maximum 5MB
- **Quality**: High-quality professional images recommended

## Technical Features

### Validation
- Client-side file type validation
- File size validation
- Server-side validation and error handling

### State Management
- Upload progress tracking
- Image URL storage in localStorage
- Real-time UI updates

### Error Handling
- Network connectivity issues
- File validation errors
- Server response errors
- User-friendly error messages

### Performance
- Optimized image upload
- Efficient state updates
- Minimal re-renders

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations
- File type validation prevents malicious uploads
- File size limits prevent abuse
- Server-side validation ensures security
- HTTPS required for production

## Future Enhancements
- Image cropping and editing
- Multiple image uploads
- Image compression
- Social media integration
- Profile image analytics

## Troubleshooting

### Common Issues

1. **Upload Fails**:
   - Check file format (JPEG, PNG, WebP only)
   - Ensure file size is under 5MB
   - Check internet connection
   - Try refreshing the page

2. **Image Not Displaying**:
   - Check if image URL is valid
   - Clear browser cache
   - Try uploading again

3. **Mobile Issues**:
   - Ensure mobile browser supports file uploads
   - Check if camera/gallery access is granted
   - Try using a different browser

### Support
For technical issues, check the browser console for error messages and contact support with the error details. 