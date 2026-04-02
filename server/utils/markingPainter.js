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
    // l_text:font_size_bold:text,co_rgb:hex,g_north_east,x_px,y_px
    const scoreText = encodeURIComponent(`${totalScore}/${maxScore}`);
    transformations.push(`l_text:Arial_80_bold:${scoreText},co_rgb:ff0000,g_north_east,x_40,y_40`);
    
    // Add a red circle around the score (using a builtin effect or another text layer)
    // For simplicity, we'll just use the bold red text which is standard WAEC style.
    
    // --- Add Ticks and Crosses ---
    scoreBreakdown.forEach((item) => {
        if (item.coord && typeof item.coord.x === 'number' && typeof item.coord.y === 'number') {
            const isCorrect = item.marksAwarded > 0;
            const mark = isCorrect ? '✓' : '✕';
            const markEncoded = encodeURIComponent(mark);
            
            // l_text:Arial_60_bold:✓,co_rgb:ff0000,g_north_west,x_0.5,y_0.4,fl_relative
            // Coordinates from AI are 0-100, Cloudinary fl_relative uses 0.0-1.0
            const x = (item.coord.x / 100).toFixed(3);
            const y = (item.coord.y / 100).toFixed(3);
            
            transformations.push(`l_text:Arial_60_bold:${markEncoded},co_rgb:ff0000,g_north_west,x_${x},y_${y},fl_relative`);
            
            // Optional: Add small marks/subscore next to the tick
            const subScore = encodeURIComponent(`${item.marksAwarded}/${item.maxMarks}`);
            transformations.push(`l_text:Arial_30:${subScore},co_rgb:ff0000,g_north_west,x_${(item.coord.x + 5) / 100},y_${(item.coord.y) / 100},fl_relative`);
        }
    });

    // 3. Join and return
    const transformString = transformations.join('/');
    return `${base}/${transformString}/${postFix}`;
};

module.exports = { getMarkedScriptUrl };
