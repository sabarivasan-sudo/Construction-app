# Crane Overlay Video

## Instructions

1. **Add Your Crane Video File Here**
   - Place your crane animation video in this folder
   - Recommended filename: `crane.webm`
   - Supported formats: WebM (with alpha channel recommended), MP4

2. **Video Specifications**
   - **Format**: WebM with alpha channel (transparent background) OR MP4
   - **Resolution**: 1920x1080 or 1280x720
   - **Duration**: 8-10 seconds (to match dropTimes)
   - **Background**: Transparent (for WebM) or solid color that can be keyed out
   - **Content**: Crane hook animation that drops cards

3. **Video Content Suggestions**
   - Crane hook moving horizontally
   - Hook lowering down
   - Hook "dropping" cards at specific timestamps
   - Smooth animation loop

4. **Drop Times Configuration**
   - Default drop times: `[1.8, 3.8, 5.8, 7.8]` seconds
   - These correspond to when cards should appear
   - Adjust in `Dashboard.jsx` if needed

5. **Where to Get Videos - FREE RESOURCES**

   **Free Stock Video Sites:**
   
   **Pixabay** (Free, no attribution required):
   - Gantry Crane Animation: https://pixabay.com/videos/gantry-crane-animation-3d-3985/
   - Search: "crane animation" or "construction crane"
   - Direct download available
   
   **Pexels Videos** (Free):
   - https://www.pexels.com/videos/search/construction-crane/
   - Search: "crane", "construction animation"
   - High quality, free to use
   
   **Videvo** (Free with attribution):
   - https://www.videvo.net/search/crane-animation/
   - Various crane animations available
   
   **Mixkit** (Free):
   - https://mixkit.co/free-stock-video/construction/
   - Construction and crane videos
   
   **YouTube** (Convert to WebM):
   - Search: "crane animation transparent background"
   - Use online converters to download as WebM
   - Example: https://www.youtube.com/watch?v=f1y9edN_H80

   **Recommended Search Terms:**
   - "crane animation transparent"
   - "construction crane animation"
   - "crane hook animation"
   - "tower crane animation"

6. **Video Conversion Tools**
   - **Online**: CloudConvert, FreeConvert (convert MP4 to WebM)
   - **Desktop**: FFmpeg, HandBrake
   - **Remove background**: Unscreen.com, Remove.bg (for video)

## Quick Setup

1. Download a crane animation video from above sources
2. Convert to WebM format (if needed)
3. Place in: `public/overlays/crane.webm`
4. The animation will automatically play when dashboard loads

## Alternative: Use External Video URL

You can also use external video URLs in `Dashboard.jsx`:
```jsx
<CraneOverlay
  src="https://your-cdn.com/crane-animation.webm"
  dropTimes={[1.8, 3.8, 5.8, 7.8]}
  onDrop={handleCardDrop}
  onComplete={() => setShowCards(true)}
/>
```

