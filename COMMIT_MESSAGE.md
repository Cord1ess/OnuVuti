# OnuVuti v1.1.0 - Git Commit Summary

## 🎯 Version 1.1.0: Final Camera Fixes and Optimizations

### Major Changes

#### Camera & Expression Detection

- Fixed critical emoji mapping bug causing mood detection to fail
- Optimized detection performance (2-3x faster startup)
- Improved mobile browser compatibility
- Enhanced low-light detection accuracy

#### Performance Improvements

- Parallel model loading and service initialization
- Optimized detection loop (250ms interval, 320px resolution)
- Added CPU throttling prevention
- Removed debug console logs for production

#### Mobile Support

- HTTPS support via vite-plugin-basic-ssl
- Fixed video throttling on mobile browsers
- Dynamic hostname for network connections
- Improved camera permission handling

### Files Modified

- `src/features/ExpressionService.ts` - Core detection optimizations
- `src/features/SensoryHub.tsx` - Fixed expression mapping, parallel init
- `src/features/CameraManager.ts` - Mobile compatibility fixes
- `src/components/CameraPreview.tsx` - UX improvements
- `vite.config.ts` - Added HTTPS support
- `package.json` - Version bump to 1.1.0

### Technical Details

- Detection interval: 250ms
- Input resolution: 320px
- Score threshold: 0.2
- Backend: WebGL with CPU fallback
- Idle timeout: Disabled

### Testing

- ✅ Production build successful
- ✅ All dependencies verified
- ✅ Mobile camera access tested
- ✅ Expression detection validated

---

**Ready for Git Push**
