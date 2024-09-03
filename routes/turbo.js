const express = require('express');
const router = express.Router();
const { Hercai } = require('hercai');
const herc = new Hercai(); //new Hercai("your api key"); => Optional

/* Available Models */
/* "v3" , "v3-32k" , "turbo" , "turbo-16k" , "gemini" */
/* Default Model; "v3" */
/* Premium Parameter; personality => Optional */

router.get('/', async (req, res) => {
  const text = req.query.text;
  if (!text) {
    return res.json({
      status: false,
      creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
      message: 'يرجي ادخال نص'
    });
  }

  try {
    const response = await herc.question({ model: "turbo", content: text });
    res.json({
      status: true,
      creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
      result: response.reply
    });
  } catch (error) {
    console.error(error);
    const errorResponse = {
      status: false,
      creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
      message: 'حدث خطأ أثناء معالجة طلبك'
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
});

module.exports = router;
