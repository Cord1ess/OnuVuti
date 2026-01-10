# OnuVuti v1.1.0 - Release Notes

## Final Fixes and Camera Optimizations

### 🎥 Camera & Expression Detection

- **Fixed Critical Bug**: Restored correct facial expression emoji mapping (was using gesture map)
- **Optimized Performance**: Parallel model loading reduces startup time by 2-3x
- **Mobile Compatibility**: Fixed video throttling issue on mobile browsers
- **Detection Speed**: Optimized to 250ms interval with 320px resolution for balanced performance
- **Accuracy Improvements**: Lowered thresholds for better detection in poor lighting conditions
- **CPU Optimization**: Added semaphore to prevent overlapping detection calls

### 🚀 Performance Enhancements

- Parallel service initialization (Camera + Gestures + Expressions)
- Concurrent model loading (TinyFace + ExpressionNet)
- Disabled idle timeout to prevent AI from sleeping
- Optimized detection loop with overlap prevention

### 🔧 Technical Improvements

- Changed video element rendering to prevent browser throttling
- Added fault tolerance to service initialization
- Improved error handling for camera permissions
- Cleaned up debug console logs for production

### 🎨 UX Improvements

- Changed "Scanning..." to "ACTIVE" for neutral state clarity
- Faster initial mood detection
- Smoother mood transitions
- Better visual feedback

### 📱 Mobile Support

- HTTPS enabled via vite-plugin-basic-ssl
- Dynamic hostname for network connections
- iOS playsinline attribute support
- Flexible camera resolution constraints
- Fallback camera access strategy

### 🐛 Bug Fixes

- Fixed emoji rendering corruption
- Fixed GIF search functionality
- Restored proper expression-to-emoji mapping
- Fixed gesture detection display

## Configuration

```typescript
Detection Interval: 250ms
Input Size: 320px
Score Threshold: 0.2
Probability Filter: 0.2
Backend: WebGL (fallback to CPU)
```

## Deployment

- Production build optimized and tested
- All dependencies verified
- HTTPS support for mobile camera access
- Ready for deployment to static hosting

---

**Version**: 1.1.0  
**Release Date**: January 10, 2026  
**Focus**: Camera Optimization & Mobile Support
