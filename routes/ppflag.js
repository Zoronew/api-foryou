const express = require('express');
const Canvas = require('canvas');
const router = express.Router();

const countryImages = {
  'فلسطين': './assets/فلسطين.png',
  'ايران': './assets/ايران.png',
  'الصومال': './assets/الصومال.png',
  'الاردن': './assets/الاردن.png',
  'مصر': './assets/مصر.png',
  'لبنان': './assets/لبنان.png',
  'السعودية': './assets/السعودية.png',
  'الامارات': './assets/الامارات.png',
  'العراق': './assets/العراق.png',
  'سوريا': './assets/سوريا.png',
  'الكويت': './assets/الكويت.png',
  'عمان': './assets/عمان.png',
  'قطر': './assets/قطر.png',
  'البحرين': './assets/البحرين.png',
  'اليمن': './assets/اليمن.png',
  'ليبيا': './assets/ليبيا.png',
  'الجزائر': './assets/الجزائر.png',
  'المغرب': './assets/المغرب.png',
  'تونس': './assets/تونس.png',
  'موريتانيا': './assets/موريتانيا.png',
};

router.get('/', async (req, res, next) => {
  const country = req.query.country;
  const image = req.query.image;

  if (!country || !image) {
    return res.status(400).send({ message: 'يرجى توفير اسم الدولة ورابط الصورة.' });
  }

  if (!countryImages[country]) {
    const availableCountries = Object.keys(countryImages).join(', ');
    return res.status(400).send({ 
      message: `البلد الذي أدخلته غير متوفر. الدول المتاحة هي: ${availableCountries}` 
    });
  }

  try {
    const canvas = Canvas.createCanvas(1280, 1280);
    const ctx = canvas.getContext('2d');
    const image1 = await Canvas.loadImage(image);
    const background = await Canvas.loadImage(countryImages[country]);

    // رسم الخلفية
    ctx.drawImage(background, 0, 0, 1280, 1280);

    // رسم صورة البروفايل كدائرة في الموقع الصحيح
    ctx.save();
    ctx.beginPath();
    ctx.arc(640, 640, 550, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // قم برسم صورة البروفايل داخل المسار الدائري المحدد
    ctx.drawImage(image1, 90, 90, 1100, 1100);
    ctx.restore();

    res.set({ 'Content-Type': 'image/png' });
    res.send(canvas.toBuffer());
  } catch (error) {
    console.error(error);
    if (!res.headersSent) { // تحقق مما إذا كانت الاستجابة قد أُرسلت
      return res.status(500).json({ message: "نوع الصورة غير صحيح" });
    }
  }
});

module.exports = router;
