const express = require('express');
const router = express.Router();

/**
 * GET /api/app/version
 * Returns the latest app release info for auto-updating.
 */
router.get('/version', (req, res) => {
  res.json({
    latestVersion: "1.0.2",
    latestVersionCode: 4,
    minSupportedVersionCode: 1,
    forceUpdate: false,
    title: "New Update Available!",
    message: "A new version of Almaas (1.0.2) is available with performance improvements and bug fixes.",
    releaseNotes: [
      "Improved PDF reading experience",
      "Enhanced app launch speed and stability",
      "Bug fixes and UI improvements"
    ],
    downloadUrl: process.env.APP_DOWNLOAD_URL || "https://play.google.com/store/apps/details?id=org.almaas.magazine"
  });
});

module.exports = router;
