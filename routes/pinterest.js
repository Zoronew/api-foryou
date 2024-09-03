const express = require('express');
const router = express.Router();
const path = require('path');
const { pinterest } = require('./func/functions');

router.get('/', async (req, res) => {
  const text1 = req.query.text; 
  try {
    if (!text1) {
      const errorResponse = {
        status: false,
        message: 'عليك تحديد نص البحث.'
      };
      const formattedResults_e = JSON.stringify(errorResponse, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(formattedResults_e);
      return;
    }        
    const pint = await pinterest(text1);
    
    // تحويل كل عنصر في المصفوفة إلى كائن يحتوي على الرابط وعنوان النتيجة (رقم النتيجة)
    const formattedResults = pint.map((result, index) => ({
      src: result,
      alt: `النتيجه رقم ${index + 1}` // عنوان النتيجة يتم تحديده هنا برقم النتيجة
    }));
    
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(formattedResults, null, 2));
  } catch (error) {
    res.sendFile(path.join(__dirname, '../public/500.html'));
  }
});

module.exports = router;
