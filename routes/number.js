const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// نقطة النهاية للحصول على قائمة الدول
router.get('/countries', async (req, res) => {
    try {
        const response = await axios.get('https://temporary-phone-number.com/countrys/');
        const html = response.data;
        const $ = cheerio.load(html);

        let countries = [];
        $('a.checkout-box').each((i, el) => {
            const href = $(el).attr('href');
            const countryName = $(el).text().trim();

            if (href) {
                const parts = countryName.split('\n');
                let name, number;
                if (parts.length === 2) {
                    name = parts[0];
                    number = parts[1].replace(/\s+/g, '');
                } else {
                    name = countryName;
                    number = '';
                }

                countries.push({ name: name, number: number, shortLink: href, fullLink: `https://temporary-phone-number.com${href}` });
            }
        });

        res.json(countries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// نقطة النهاية للحصول على قائمة الأرقام لدولة معينة
router.get('/numbers', async (req, res) => {
    const countryLink = req.query.link;
    if (!countryLink) {
        return res.status(400).json({ error: 'Missing country link' });
    }

    try {
        const response = await axios.get(countryLink);
        const html = response.data;
        const $ = cheerio.load(html);

        let numbers = [];
        $('.col-sm-6.col-md-4.col-lg-3.col-xs-12').each((i, el) => {
            const href = $(el).find('a').attr('href');
            const numberText = $(el).find('.info-box-number').text().trim();
            const latestText = $(el).find('.info-box-time').text().trim();

            if (href && numberText) {
                numbers.push({ number: numberText, shortLink: href, fullLink: `https://temporary-phone-number.com${href}`, latest: latestText });
            }
        });

        res.json(numbers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch numbers' });
    }
});

// نقطة النهاية للحصول على قائمة الرسائل لرقم معين
router.get('/messages', async (req, res) => {
    const numberLink = req.query.link;
    if (!numberLink) {
        return res.status(400).json({ error: 'Missing number link' });
    }

    try {
        const response = await axios.get(numberLink);
        const html = response.data;
        const $ = cheerio.load(html);

        let messages = [];
        $('.direct-chat-msg.left').each((i, el) => {
            const from = $(el).find('.direct-chat-info span.pull-right').text().trim();
            const time = $(el).find('.direct-chat-timestamp').text().trim();
            const text = $(el).find('.direct-chat-text').text().trim();

            messages.push({ from: from, time: time, text: text });
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;
