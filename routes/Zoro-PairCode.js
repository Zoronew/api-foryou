const express = require('express');
const fs = require('fs').promises;
const pino = require('pino');
const { default: makeWASocket, Browsers, delay, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, PHONENUMBER_MCC, jidNormalizedUser } = require('@whiskeysockets/baileys');
const NodeCache = require('node-cache');
const path = require('path');

const router = express.Router();
const msgRetryCounterCache = new NodeCache();

let phoneNumber;
let qrCode = '';
let XeonBotInc;

const sessionsPath = path.join(__dirname, 'sessions');

// Function to reset the sessions folder
async function resetSessionFolder() {
    try {
        await fs.rm(sessionsPath, { recursive: true, force: true });
        console.log('Session folder deleted successfully.');
    } catch (err) {
        console.error('Error deleting session folder:', err);
    }

    try {
        await fs.mkdir(sessionsPath);
        console.log('Session folder created successfully.');
    } catch (err) {
        console.error('Error creating session folder:', err);
    }
}

// QR Code generation function
async function qr() {
    let { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionsPath);

    if (XeonBotInc) {
        try {
            if (XeonBotInc.ws?.readyState === WebSocket.OPEN) {
                await XeonBotInc.logout();
                console.log('Previous session closed successfully.');
            } else {
                console.log('Connection already closed or not established.');
            }
            await delay(5000);
        } catch (error) {
            console.error('Error closing previous session:', error);
            await delay(10000);
        }

        await resetSessionFolder();
    }

    XeonBotInc = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.windows('Firefox'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);
            return msg?.message || "";
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    });

    await delay(5000);

    if (phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            throw new Error('Invalid phone number');
        }
        try {
            let code = await XeonBotInc.requestPairingCode(phoneNumber);
            qrCode = code?.match(/.{1,4}/g)?.join('-') || code;
        } catch (error) {
            console.error('Error requesting pairing code:', error);
        }
    }

    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection === 'open') {
            await delay(10000);
            try {
                let sessionXeon = await fs.readFile(path.join(sessionsPath, 'creds.json'));
                const xeonses = await XeonBotInc.sendMessage(XeonBotInc.user.id, {
                    document: sessionXeon,
                    mimetype: 'application/json',
                    fileName: 'creds.json',
                });
                await XeonBotInc.groupAcceptInvite('Kjm8rnDFcpb04gQNSTbW2d');
                await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: '⚠️لا تشارك هذا الملف مع أي شخص⚠️\n\nأهلاً بك في Zoro-Bot' }, { quoted: xeonses });
            } catch (err) {
                console.error('Error sending session file:', err);
            }
            process.exit(0);
        }
        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
            console.error('Connection closed. Attempting to restart QR generation...');
            await delay(10000);
            await qr();
        }
    });
    XeonBotInc.ev.on('creds.update', saveCreds);
    XeonBotInc.ev.on('messages.upsert', () => {});
}

// Endpoint to set the phone number
router.get('/set-phone-number', async (req, res) => {
    phoneNumber = req.query.phoneNumber;
    try {
        await qr();
        res.status(200).json({ message: 'Phone number received and QR code generated.', qrCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get WhatsApp session
router.get('/session', async (req, res) => {
    try {
        const sessionXeon = await fs.readFile(path.join(sessionsPath, 'creds.json'));
        res.setHeader('Content-Type', 'application/json');
        res.send(sessionXeon);
    } catch (error) {
        res.status(500).json({ error: 'Unable to read session file.' });
    }
});

module.exports = router;
