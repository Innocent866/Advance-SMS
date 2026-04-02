/**
 * Generates a Cloudinary transformation URL that overlays red ink marks (ticks/crosses)
 * and a total score stamp onto an original image.
 * 
 * @param {string} originalUrl - The original Cloudinary secure_url
 * @param {Array} scoreBreakdown - Array of objects with marksAwarded, maxMarks, and coord {x, y}
 * @param {number} totalScore - Final score
 * @param {number} maxScore - Maximum possible score
 * @returns {string} - The transformed URL
 */
const getMarkedScriptUrl = (originalUrl, scoreBreakdown, totalScore, maxScore) => {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) return originalUrl;

    // 1. Separate the base URL from the public ID
    // Example: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/public_id.jpg
    const parts = originalUrl.split('/upload/');
    if (parts.length !== 2) return originalUrl;

    const base = parts[0] + '/upload';
    const postFix = parts[1]; // includes version and public_id

    // 2. Build Transformations
    let transformations = [];

    // --- Add Score Stamp (Top Right) ---
    // Cloudinary text overlays strictly require double URL-encoding for slashes.
    const scoreText = encodeURIComponent(encodeURIComponent(`${totalScore}/${maxScore}`));
    transformations.push(`l_text:Arial_80_bold:${scoreText},co_rgb:ff0000,g_north_east,x_40,y_40`);
    
    // --- Add Ticks and Crosses ---
    scoreBreakdown.forEach((item) => {
        if (item.coord && typeof item.coord.x === 'number' && typeof item.coord.y === 'number') {
            const isCorrect = item.marksAwarded > 0;
            // Use bold unicode characters since the URL double-encoding handles symbols properly now.
            const mark = isCorrect ? '✓' : '✕';
            const markEncoded = encodeURIComponent(encodeURIComponent(mark));
            
            // Coordinates from AI are 0-100, Cloudinary fl_relative uses 0.0-1.0
            const x = (item.coord.x / 100).toFixed(3);
            const y = (item.coord.y / 100).toFixed(3);
            
            transformations.push(`l_text:Arial_60_bold:${markEncoded},co_rgb:ff0000,g_north_west,x_${x},y_${y},fl_relative`);
            
            // Add small marks subscore next to the mark (shifted right by +0.06 relative width)
            const subScore = encodeURIComponent(encodeURIComponent(`${item.marksAwarded}/${item.maxMarks}`));
            const subX = (parseFloat(x) + 0.06).toFixed(3);
            transformations.push(`l_text:Arial_30:${subScore},co_rgb:ff0000,g_north_west,x_${subX},y_${y},fl_relative`);
        }
    });

    // 3. Join and return
    const transformString = transformations.join('/');
    return `${base}/${transformString}/${postFix}`;
};

module.exports = { getMarkedScriptUrl };
