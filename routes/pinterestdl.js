const express = require('express');
const router = express.Router();
const path = require('path');
const { pinterestdl } = require('./func/functions');

router.get('/', async (req, res) => {
    const url = req.query.url; 
    try {
        if (!url) {
            const errorResponse = {
                status: false,
                message: 'حط رابط فيديو ال من pinterest'
            };
            const formattedResults_e = JSON.stringify(errorResponse, null, 2);
            res.setHeader('Content-Type', 'application/json');
            res.send(formattedResults_e);
            return;
        }        

        const pint = await pinterestdl(url);

        // Extracting data from the response
        const data = pint.data || {}; // Fallback to an empty object if data is not present

        // Check the media type (video or image)
        const mediaType = data.media_type;

        if (mediaType === 'video') {
            // If media type is video, construct response for video
            const responseData = {
                status: true,
                creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
                data: {
                    poster: data.poster,
                    video: data.video
                }
            };
            const formattedResults = JSON.stringify(responseData, null, 2);
            res.setHeader('Content-Type', 'application/json');
            res.send(formattedResults);
        } else if (mediaType === 'image') {
            // If media type is image, construct response for image
            const responseData = {
                status: true,
                creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
                data: {
                    image: data.image
                }
            };
            const formattedResults = JSON.stringify(responseData, null, 2);
            res.setHeader('Content-Type', 'application/json');
            res.send(formattedResults);
        } else {
            // If media type is not recognized, throw an error
            throw new Error('نوع الوسائط غير مدعوم');
        }
    } catch (error) {
        res.sendFile(path.join(__dirname, '../public/500.html'));
    }
});

module.exports = router;
