const express = require('express');
const { alldl } = require("abir-downloader");

const router = express.Router();

// تعريف راوتر API
router.get('/', async (req, res) => {
  const { url } = req.query; // استلام الرابط من الاستعلامات

  // التحقق من وجود الرابط
  if (!url) {
    return res.status(400).json({ 
      status: false, 
      creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
      message: "حط الرابط يبرووو" 
    });
  }

  try {
    // استخدام مكتبة abir-downloader لتحميل البيانات من الرابط مباشرة
    const data = await alldl(url);

    // تهيئة البيانات بنفس المسار المتوقع
    return res.status(200).json({ 
      status: true, 
      creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
      data: {
        data: [
          { path: data.data.high } // افترضنا أن مكتبة abir-downloader تعيد المسار داخل كائن البيانات
        ]
      }
    });
  } catch (error) {
    console.error("خطأ أثناء تحميل البيانات:", error.message);
    return res.status(500).json({ 
      status: false, 
      creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
      message: error.message 
    });
  }
});


module.exports = router;
