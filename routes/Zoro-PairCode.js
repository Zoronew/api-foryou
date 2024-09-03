const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { default: makeWASocket, Browsers, delay, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, PHONENUMBER_MCC, jidNormalizedUser } = require('@whiskeysockets/baileys');
const NodeCache = require('node-cache');
const path = require('path');
const { exec } = require('child_process');

const router = express.Router();
const msgRetryCounterCache = new NodeCache();

let phoneNumber;
let qrCode = '';
let XeonBotInc;

async function resetSessionFolder() {
    const sessionsPath = path.join(__dirname, 'sessions');
    
    // Delete the sessions folder and its contents
    fs.rm(sessionsPath, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error('Error deleting session folder:', err);
        } else {
            console.log('Session folder deleted successfully.');
            // Recreate the sessions folder
            fs.mkdir(sessionsPath, (err) => {
                if (err) {
                    console.error('Error creating session folder:', err);
                } else {
                    console.log('Session folder created successfully.');
                }
            });
        }
    });
}

async function qr() {
    let { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions`);

    if (XeonBotInc) {
        try {
            // Check if the connection is open before trying to log out
            const connectionState = XeonBotInc.ws?.readyState;
            if (connectionState === WebSocket.OPEN) {
                await XeonBotInc.logout();
                console.log("Previous session closed successfully.");
            } else {
                console.log("Connection already closed or not established.");
            }
            await delay(5000); // Wait for 5 seconds before opening a new session
        } catch (error) {
            console.error("Error closing previous session:", error);
            await delay(10000); // Delay longer if necessary
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

    await delay(5000);  // Delay for 5 seconds to ensure connection

    if (phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            throw new Error("Invalid phone number");
        }
        try {
            let code = await XeonBotInc.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            qrCode = code;
        } catch (error) {
            console.error("Error requesting pairing code:", error);
        }
    }
    
    XeonBotInc.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection === "open") {
            await delay(10000); // Delay to ensure all processes are finished
            let sessionXeon = fs.readFileSync('./sessions/creds.json');
            await delay(2000); // Additional delay before sending message
            const xeonses = await XeonBotInc.sendMessage(XeonBotInc.user.id, { document: sessionXeon, mimetype: `application/json`, fileName: `creds.json` });
            await XeonBotInc.groupAcceptInvite("Kjm8rnDFcpb04gQNSTbW2d");
            await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: `⚠️لا تشارك هذا الملف مع أي شخص⚠️\n\nأهلاً بك في Zoro-Bot` }, { quoted: xeonses });
            await delay(2000);
            
            // Close the process to restart it
            process.exit(0);
        }
        if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
            console.error("Connection closed. Attempting to restart QR generation...");
            await delay(10000);  // Wait before retrying
            await qr(); // Restart the QR generation process
        }
    });
    XeonBotInc.ev.on('creds.update', saveCreds);
    XeonBotInc.ev.on("messages.upsert", () => { });
}
// Endpoint to set the phone number
router.get('/set-phone-number', async (req, res) => {
    phoneNumber = req.query.phoneNumber; // Get phone number from query
    try {
        await qr();
        res.status(200).json({ message: 'Phone number received and QR code generated.', qrCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get WhatsApp session
router.get('/session', (req, res) => {
    try {
        let sessionXeon = fs.readFileSync('./sessions/creds.json');
        res.setHeader('Content-Type', 'application/json');
        res.send(sessionXeon);
    } catch (error) {
        res.status(500).json({ error: 'Unable to read session file.' });
    }
});

module.exports = router;
