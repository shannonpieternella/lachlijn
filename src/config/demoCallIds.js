// NOTE: This file is no longer used!
// The homepage now automatically uses the first 3 scenarios from your admin panel.

// 🎵 AUDIO SETUP:
// The system now uses the audioUrl field from your scenarios database.
// In your admin panel:
// 1. Go to scenarios management
// 2. Edit each scenario you want to show as demo
// 3. Add the audioUrl (can be any URL - hosted file, ElevenLabs, etc.)
// 4. The homepage will automatically use these audio URLs

// The system will automatically:
// ✅ Fetch scenarios from /api/scenarios
// ✅ Use the first 3 scenarios for the demo section  
// ✅ Use scenario.audioUrl for audio playback (if available)
// ✅ Show "Demo Niet Beschikbaar" if no audioUrl
// ✅ Display scenario.name, scenario.icon, and scenario.description

// If scenario.audioUrl is empty, it falls back to:
// /public/audio/{scenario.id}-demo.mp3

// Just upload your audio URLs in the admin panel and they'll work immediately! 🚀