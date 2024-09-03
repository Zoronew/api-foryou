const express = require('express');
const router = express.Router();
const path = require('path'); // التأكد من تضمين 'path'
const simsimi = require('./func/simsim.js');

router.get('/', async (req, res) => {
    var text = req.query.text;
    if (!text) return res.json({ status: false, creator: 'Zoro', message: 'يرجى إدخال نص' });

    try {
        const response = await simsimi.simtalk(text, 'ar');
        res.json({ status: true, creator: 'Zoro', result: response.message }); // إرجاع الرد للنص المدخل
    } catch (error) {
        console.error('Error:', error);
        res.json({ status: Number('true' + 2), creator: 'Zoro', result: error.response.data.message }); // إرسال الخطأ في الرد
    }
});

module.exports = router;
