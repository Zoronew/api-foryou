const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { 
    default: makeWASocket, 
    Browsers, 
    delay, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    PHONENUMBER_MCC, 
    DisconnectReason, 
    makeCacheableSignalKeyStore 
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const chalk = require("chalk");
const router = express.Router();

// التأكد من إعداد مجلد الجلسات
function setupSessionsFolder() {
    const sessionsPath = './sessions';
    if (fs.existsSync(sessionsPath)) {
        fs.rmSync(sessionsPath, { recursive: true, force: true }); // حذف المجلد إذا كان موجودًا
    }
    fs.mkdirSync(sessionsPath); // إنشاء المجلد من جديد
}

// نقطة البداية في الراوتر
router.post('/start', async (req, res) => {
    const phoneNumber = req.body.phoneNumber; // احصل على الرقم من الطلب
    if (!phoneNumber || !Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        return res.status(400).send({ error: "يرجى إدخال رقم هاتف صحيح مع رمز البلد" });
    }

    try {
        setupSessionsFolder(); // إعداد مجلد الجلسات عند كل طلب
        let { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions`);
        const msgRetryCounterCache = new NodeCache();
        
        const XeonBotInc = makeWASocket({
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: Browsers.windows('Firefox'),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            msgRetryCounterCache,
        });

        XeonBotInc.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
                await delay(1000 * 10);
                const sessionData = JSON.stringify(state.creds);
                fs.writeFileSync('./sessions/creds.json', sessionData);

                await XeonBotInc.sendMessage(XeonBotInc.user.id, { 
                    text: `جروبات دعم زورو بوت 👇\nhttps://chat.whatsapp.com/K845GiZr5Ml6GFrUOFjAUW\nhttps://chat.whatsapp.com/Bh4C5KGXk5e5ddeTMnhipM` 
                });
                
                await XeonBotInc.sendMessage(XeonBotInc.user.id, { 
                    document: Buffer.from(sessionData), 
                    mimetype: 'application/json', 
                    fileName: 'creds.json' 
                });

                await XeonBotInc.sendMessage(XeonBotInc.user.id, { 
                    text: `⚠️لا تشارك هذا الملف مع أي شخص⚠️\n
┌─❖
│ اهلا ⚡
└┬❖
┌┤✑ شكرًا لاستخدامك Zoro-Bot
│└────────────┈ ⳹
│©2022-2024 Zoro-Bot
└───────────────┈ ⳹\n\n` 
                });

                return res.status(200).send({ message: "تم الاتصال بنجاح!" });
            }

            if (
                connection === "close" &&
                lastDisconnect?.error?.output?.statusCode !== 401
            ) {
                qr();
            }
        });

        XeonBotInc.ev.on('creds.update', saveCreds);
        XeonBotInc.ev.on("messages.upsert", () => { });

    } catch (error) {
        console.error("Error during WhatsApp connection:", error);
        return res.status(500).send({ error: "حدث خطأ أثناء الاتصال بـ WhatsApp" });
    }
});

module.exports = router;
