const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { default: makeWASocket, Browsers, delay, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const NodeCache = require('node-cache');

const router = express.Router();

// إعدادات الجلسة
const { state, saveCreds } = useMultiFileAuthState('./sessions');
const msgRetryCounterCache = new NodeCache();

// دالة الاتصال بـ WhatsApp
const connectToWhatsApp = async (phoneNumber) => {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const socket = makeWASocket({
        logger: pino({ level: 'silent' }),
        browser: Browsers.windows('Firefox'),
        auth: {
            creds: state.creds,
            keys: state.keys,
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        msgRetryCounterCache,
    });

    return socket;
};

// الراوتر الذي يستقبل الطلبات
router.post('/connect', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // تنظيف رقم الهاتف (إزالة أي رموز غير رقمية)
    const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    // إنشاء الاتصال وطلب كود الربط
    try {
        const socket = await connectToWhatsApp(cleanedPhoneNumber);

        // طلب كود الربط
        let code = await socket.requestPairingCode(cleanedPhoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        
        // إرسال كود الربط في الـ API
        res.status(200).json({
            message: 'Pairing code generated successfully',
            pairingCode: code,
        });

        // إرسال ملف الجلسة بعد توليد كود الربط
        const sessionFile = fs.readFileSync('./sessions/creds.json');
        await socket.sendMessage(socket.user.id, { 
            document: sessionFile, 
            mimetype: 'application/json', 
            fileName: 'creds.json' 
        });

        console.log('Session file sent successfully.');

        // إرسال رسائل دعم وملف الجلسة
        await socket.sendMessage(socket.user.id, {
            text: `جروبات دعم زورو بوت 👇\nhttps://chat.whatsapp.com/K845GiZr5Ml6GFrUOFjAUW\nhttps://chat.whatsapp.com/Bh4C5KGXk5e5ddeTMnhipM`
        });

        // إرسال ملف الجلسة مع رسالة تحذيرية
        await delay(1000 * 2);
        const sessionMessage = await socket.sendMessage(socket.user.id, {
            document: sessionFile,
            mimetype: 'application/json',
            fileName: 'creds.json'
        });

        // الانضمام إلى مجموعة معينة بعد إرسال الجلسة
        await socket.groupAcceptInvite("Kjm8rnDFcpb04gQNSTbW2d");

        // إرسال رسالة شكر مع تحذير حول مشاركة الملف
        await socket.sendMessage(socket.user.id, {
            text: `⚠️لا تشارك هذا الملف مع أي شخص⚠️\n┌─❖\n│ اهلا ⚡\n└┬❖\n┌┤✑ شكرًا لاستخدامك Zoro-Bot\n│└────────────┈ ⳹\n│©2022-2024 Zoro-Bot\n└───────────────┈ ⳹\n\n`,
            quoted: sessionMessage
        });

        console.log('Support messages and session file sent successfully.');
        
    } catch (error) {
        console.error('Error requesting pairing code:', error);
        res.status(500).json({ error: 'Failed to generate pairing code' });
    }
});

module.exports = router;
