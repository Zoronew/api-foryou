__path = process.cwd()
color = require(__path + '/lib/color.js');
const canvas = require('canvas-constructor');
const Canvas = require('canvas');
var cheerio = require('cheerio');
const Discord = require('discord.js');
var fs = require('fs');
const express = require('express');
const router = express.Router();
const path = require('path');
const axios = require('axios');
const colors = ['ORANGE', '4169e1', 'ffcc99']; // يمكنك استبدال الألوان هنا بأي لون تريده
const mainColor = colors[Math.floor(Math.random() * colors.length)];


function  wrapText(ctx, text, maxWidth) {
        return new Promise(resolve => {
            if (ctx.measureText(text).width < maxWidth) return resolve([text]);
            if (ctx.measureText('W').width > maxWidth) return resolve(null);
            const words = text.split(' ');
            const lines = [];
            let line = '';
            while (words.length > 0) {
                let split = false;
                while (ctx.measureText(words[0]).width >= maxWidth) {
                    const temp = words[0];
                    words[0] = temp.slice(0, -1);
                    if (split) {
                        words[1] = `${temp.slice(-1)}${words[1]}`;
                    } else {
                        split = true;
                        words.splice(1, 0, temp.slice(-1));
                    }
                }
                if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
                    line += `${words.shift()} `;
                } else {
                    lines.push(line.trim());
                    line = '';
                }
                if (words.length === 0) lines.push(line.trim());
            }
            return resolve(lines);
        });
    }


router.get('/welcomecard', async (req, res, next) => {
  const q = req.query;
  let background = req.query.background;
  if (!background || !(background.endsWith(".png") || background.endsWith(".jpg"))) {
    return res.json({ error: "Please provide a background in png or jpg format!" });
  }

  if (background.endsWith(".jpg")) {
    background = background.replace(".jpg", ".png");
  }

  const avatar = req.query.avatar;
  if (!avatar) {
    return res.json({ error: "حط صوره البروفايل" });
  }

  let text_1 = q.text1;
  let text_2 = q.text2;
  let text_3 = q.text3;
  
  if (!text_1 || !text_2 || !text_3) {
    return res.json({ error: "حط التلات نصوص text1 و text2 و text3" });
  }

  // Remove '#' character from texts
  text_1 = text_1.replace("#", " ");
  text_2 = text_2.replace("#", " ");
  text_3 = text_3.replace("#", " ");

  let color = q.color || "#ffffff";

  try {
    const img = await welcomeImage(background, avatar, text_1, text_2, text_3, color);
    res.set({ 'Content-Type': 'image/png' });
    res.send(img);

    const embed = new Discord.MessageEmbed()
        .setTitle('New Endpoint Used')
        .addField('Endpoint', "Welcome Card", true)
        .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
        .setColor("ffcc99");

    hook.send(embed);
  } catch (error) {
    return res.json({ error: "تحتوي إحدى صورك (الخلفية/صوره البروفايل ) على تنسيق صورة غير مدعوم!" });
  }
})
async function welcomeImage(background, avatar, text_1, text_2, text_3, color) {

    let fonts = "Round Font"
    

    var welcomeCanvas = {};
    welcomeCanvas.create = Canvas.createCanvas(1024, 500)
    welcomeCanvas.context = welcomeCanvas.create.getContext('2d')
    const ctx = welcomeCanvas.context
    ctx.font = `72px ${fonts}`;
    ctx.fillStyle = color;

    const bg = await Canvas.loadImage(background)
    ctx.drawImage(bg, 0, 0, 1024, 500)
    ctx.textAlign = 'center'
    ctx.fillText(text_1, 512, 360);
    ctx.beginPath();
    ctx.arc(512, 166, 128, 0, Math.PI * 2, true);
    ctx.stroke()
    ctx.fill()
    

    let canvas = welcomeCanvas;
    canvas.context.font = `42px ${fonts}`,
    canvas.context.textAlign = 'center';
    canvas.context.fillText(text_2, 512, 410)
    canvas.context.font = `32px ${fonts}`
    canvas.context.fillText(text_3, 512, 455)
    canvas.context.beginPath()
    canvas.context.arc(512, 166, 119, 0, Math.PI * 2, true)
    canvas.context.closePath()
    canvas.context.clip()
    await Canvas.loadImage(avatar)
    .then(img => {
        canvas.context.drawImage(img, 393, 47, 238, 238);
    })
    
	return canvas.create.toBuffer()
}

router.get('/Palestine', async (req, res, next) => {
  let image = req.query.image;
  if (!image) return res.status(400).send({ message: 'Please provide a valid image of png or jpg format.' });
  try {
    const canvas = Canvas.createCanvas(1280, 1280);
    const ctx = canvas.getContext('2d');
    const image1 = await Canvas.loadImage(image);
    const background = await Canvas.loadImage('./assets/Palestine.png');
    
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

    const embed = new Discord.MessageEmbed()
      .setTitle('New Endpoint Used')
      .addField('Endpoint', "AD", true)
      .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
      .addField('Query', `• image - Link`, true)
      .setColor(color);
    
    hook.send(embed);
  } catch (error) {
    return res.status(500).json({ message: "Invalid Image Type" });
  }
});



router.get('/myheart', async (req, res, next) => {
    const normal = req.query.text1;
    const tuxedo = req.query.text2;
    const zoro = req.query.text3;
    if (!normal || !tuxedo || !zoro) return res.json({ error: "يرجى توفير text1 و text2! و text3" });
    try {
        const base = await Canvas.loadImage('./assets/myheart.png');
        const canvas = Canvas.createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // تحديد حجم الخط للنص العادي
        const normalFontSize = req.query.fontSize1 ? parseInt(req.query.fontSize1) : 100;
        ctx.font = `${normalFontSize}px Arial`;

        const normalLines = await wrapText(ctx, normal, 1200);
        const normalTopMost = 350 - (((normalFontSize * normalLines.length) / 2) + ((10 * (normalLines.length - 1)) / 2));
        for (let i = 0; i < normalLines.length; i++) {
            const height = normalTopMost + ((normalFontSize + 10) * i);
            ctx.fillText(normalLines[i], 1700, height);
        }

	// تحديد حجم الخط لنص البدلة (نفس حجم الخط للنص العادي في هذه الحالة)
        const tuxedoFontSize = req.query.fontSize2 ? parseInt(req.query.fontSize2) : 100;
        ctx.font = `${tuxedoFontSize}px Arial`;

        const tuxedoLines = await wrapText(ctx, tuxedo, 1200);
        const tuxedoTopMost = 950 - (((tuxedoFontSize * tuxedoLines.length) / 2) + ((10 * (tuxedoLines.length - 1)) / 2));
        for (let i = 0; i < tuxedoLines.length; i++) {
            const height = tuxedoTopMost + ((tuxedoFontSize + 10) * i);
            ctx.fillText(tuxedoLines[i], 1700, height);
        }

	const zoroFontSize = req.query.fontSize3 ? parseInt(req.query.fontSize3) : 100;
        ctx.font = `${normalFontSize}px Arial`;

        const zoroLines = await wrapText(ctx, zoro, 1200);
        const zoroTopMost = 1550 - (((zoroFontSize * zoroLines.length) / 2) + ((10 * (zoroLines.length - 1)) / 2));
        for (let i = 0; i < zoroLines.length; i++) {
            const height = zoroTopMost + ((zoroFontSize + 10) * i);
            ctx.fillText(zoroLines[i], 1700, height);
        }


        res.set({ 'Content-Type': 'image/png' });
        res.send(canvas.toBuffer());
        const embed = new Discord.MessageEmbed()
            .setTitle('استخدام نقطة النهاية الجديدة')
            .addField('نقطة النهاية', "Pooh", true)
            .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
            .addField('الاستعلامات', `• text1 - ${normal}\n• text2 - ${tuxedo}\n• text3 - ${zoro}`, true)
            .setColor(color)
        hook.send(embed);
    } catch (err) {
        res.json({ error: `عذرًا، حدث خطأ: ${err.message}` });
    }
});

router.get('/shfek', async (req, res, next) => {
 const normal = req.query.text1;
    const tuxedo = req.query.text2;
    if (!normal || !tuxedo) return res.json({ error: "يرجى توفير text1 و text2!" });
    try {
        const base = await Canvas.loadImage('./assets/Shfek.png');
        const canvas = Canvas.createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // تحديد حجم الخط للنص العادي
        const normalFontSize = req.query.fontSize1 ? parseInt(req.query.fontSize1) : 30;
        ctx.font = `${normalFontSize}px Arial`;

        const normalLines = await wrapText(ctx, normal, 350);
        const normalTopMost = 50 - (((normalFontSize * normalLines.length) / 2) + ((10 * (normalLines.length - 1)) / 2));
        for (let i = 0; i < normalLines.length; i++) {
            const height = normalTopMost + ((normalFontSize + 10) * i);
            ctx.fillText(normalLines[i], 540, height);
        }

        // تحديد حجم الخط لنص البدلة (نفس حجم الخط للنص العادي في هذه الحالة)
        const tuxedoFontSize = req.query.fontSize2 ? parseInt(req.query.fontSize2) : 30;
        ctx.font = `${tuxedoFontSize}px Arial`;

        const tuxedoLines = await wrapText(ctx, tuxedo, 350);
        const tuxedoTopMost = 430 - (((tuxedoFontSize * tuxedoLines.length) / 2) + ((10 * (tuxedoLines.length - 1)) / 2));
        for (let i = 0; i < tuxedoLines.length; i++) {
            const height = tuxedoTopMost + ((tuxedoFontSize + 10) * i);
            ctx.fillText(tuxedoLines[i], 540, height);
        }

        res.set({ 'Content-Type': 'image/png' });
        res.send(canvas.toBuffer());
        const embed = new Discord.MessageEmbed()
            .setTitle('استخدام نقطة النهاية الجديدة')
            .addField('نقطة النهاية', "Pooh", true)
            .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
            .addField('الاستعلامات', `• text1 - ${normal}\n• text2 - ${tuxedo}`, true)
            .setColor(color)
        hook.send(embed);
    } catch (err) {
        res.json({ error: `عذرًا، حدث خطأ: ${err.message}` });
    }
});

router.get('/wanted', async (req, res, next) => {
  let image = req.query.image;
  if (!image) return res.status(400).send({ message: 'يرجى تقديم صورة بتنسيق png أو jpg.' });
  try {
    const canvas = Canvas.createCanvas(736, 959);
    const ctx = canvas.getContext('2d');
    const image1 = await Canvas.loadImage(image);
    const background = await Canvas.loadImage('./database/background1.png');
    ctx.drawImage(background, 0, 0, 736, 959);
    ctx.drawImage(image1, 140, 280, 460, 460);
    res.set({ 'Content-Type': 'image/png' });
    res.send(canvas.toBuffer());
    const embed = new Discord.MessageEmbed()
      .setTitle('New Endpoint Used')
      .addField('Endpoint', "AD", true)
      .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
      .addField('Query', `• image - Link`, true)
      .setColor(color);
    hook.send(embed);
  } catch (error) {
    return res.status(500).json({ message: "نوع الصورة غير صالح" });
  }
});



router.get('/burn', async (req, res, next) => {

  let image = req.query.image;
  if (!image) return res.send({ message: 'يرجى تقديم صورة بتنسيق png أو jpg.' })
  try {
        const canvas = Canvas.createCanvas(347, 426);
        const ctx = canvas.getContext(`2d`);
      const image1 = await Canvas.loadImage(image);
        const background = await Canvas.loadImage(`./assets/burn.png`);
        ctx.drawImage(image1, 19, 31, 113, 154);
        ctx.drawImage(background, 0, 0, 347, 426);
        res.set({ 'Content-Type': 'image/png' })
        res.send(canvas.toBuffer())
       
  } catch (error) {
    return res.json({ message: "نوع الصورة غير صالح" })

  }
})

router.get("/biden", async (req, res, next) => {
   const img = await canvas.resolveImage('./assets/biden.png')

    let Msg = req.query.text;
    if(!Msg) return res.json({
      error: "لم يتم توفير النص!"
    })
	
if (Msg.length >= 67) {
	Msg = Msg.slice(0, 67) + "\n" + Msg.slice(67)
}
if (Msg.length > 134) {
	Msg = Msg.slice(0, 134) + "\n" + Msg.slice(134)
}

  let mage = new canvas.Canvas(900, 497)
      .setColor("#ffffff")
      .printImage(img, 0, 0, 900, 497) 
      .setColor("#000000")
      .setTextFont("30px Noto") 
			.printText(Msg, 20, 139)
      .setColor("#000000")
      .toBuffer();
        res.set({ 'Content-Type': 'image/png' })
        res.send(mage)
        db.add(`reqs`, 1)
    db.add(`reqsbiden`, 1)
     const embed = new Discord.MessageEmbed()
        .setTitle('New Endpoint Used')
        .addField('Endpoint', "Biden", true)
        .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
        .addField('Query', `• text - ${Msg}`, true)
        .setColor(color)
        hook.send(embed)
})

router.get("/elsisi", async (req, res, next) => {
   const img = await canvas.resolveImage('./assets/Elsisi.png')

    let Msg = req.query.text;
    if(!Msg) return res.json({
      error: "لم يتم توفير النص!"
    })
	
if (Msg.length >= 67) {
	Msg = Msg.slice(0, 67) + "\n" + Msg.slice(67)
}
if (Msg.length > 134) {
	Msg = Msg.slice(0, 134) + "\n" + Msg.slice(134)
}

  let mage = new canvas.Canvas(900, 497)
      .setColor("#ffffff")
      .printImage(img, 0, 0, 900, 497) 
      .setColor("#000000")
      .setTextFont("30px Noto") 
			.printText(Msg, 20, 139)
      .setColor("#000000")
      .toBuffer();
        res.set({ 'Content-Type': 'image/png' })
        res.send(mage)
        db.add(`reqs`, 1)
    db.add(`reqsbiden`, 1)
     const embed = new Discord.MessageEmbed()
        .setTitle('New Endpoint Used')
        .addField('Endpoint', "Biden", true)
        .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
        .addField('Query', `• text - ${Msg}`, true)
        .setColor(color)
        hook.send(embed)
})

router.get('/drake', async (req, res, next) => {
   
		let msg1 = req.query.text1;
		let msg2 = req.query.text2;
    if(!msg1) return res.json({
      error: "لم يتم توفير النص 1!"
    })
    if(!msg2) return res.json({
      error: "لم يتم توفير النص 2!"
    })
const img = await canvas.resolveImage('./assets/drake.png')
 if (msg1.length >= 25) {
		msg1 = msg1.slice(0, 25) + "\n" + msg1.slice(25);
	}
  if (msg1.length >= 48) {
		msg1 = msg1.slice(0, 48) + "\n" + msg1.slice(48);
	}
   if (msg1.length >= 72) {
		msg1 = msg1.slice(0, 72) + "\n" + msg1.slice(72);
	}
  if (msg1.length >= 96) {
		msg1 = msg1.slice(0, 96) + "\n" + msg1.slice(96);
	}
	if (msg2.length > 25) {
		msg2 = msg2.slice(0, 25) + "\n" + msg2.slice(25);

	}
  if (msg2.length >= 48) {
		msg2 = msg2.slice(0, 48) + "\n" + msg2.slice(48);
	}	
  if (msg2.length > 72) {
		msg2 = msg2.slice(0, 72) + "\n" + msg2.slice(72);

	}
  if (msg2.length >= 96) {
		msg2 = msg2.slice(0, 96) + "\n" + msg2.slice(96);
	}
 
  let mage = new canvas.Canvas(670, 435)
      .setColor("#ffffff")
      .printImage(img, 0, 0, 670, 435) 
      .setColor("#000000")
      .setTextFont("30px Noto") 
      .printText(msg1, 252, 36)
			.printText(msg2, 252, 258)
      .setColor("#000000")
      .toBuffer();
       res.set({ 'Content-Type': 'image/png' })
        res.send(mage)
	db.add(`reqs`, 1)
        db.add(`reqsdrake`, 1)
        
        const embed = new Discord.MessageEmbed()
        .setTitle('New Endpoint Used')
        .addField('Endpoint', "Drake", true)
        .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
        .addField('Queries', `• text1 - ${msg1}\n• text2 - ${msg2}`, true)
        .setColor(color)
        hook.send(embed)
    })
router.get('/pooh', async (req, res, next) => {
    const normal = req.query.text1;
    const tuxedo = req.query.text2;
    if (!normal || !tuxedo) return res.json({ error: "يرجى توفير text1 و text2!" });
    try {
        let background = req.query.background;
        if (!background || !(background.endsWith(".png") || background.endsWith(".jpg"))) {
            return res.json({ error: "يرجى توفير خلفية بتنسيق png أو jpg!" });
        }

        if (background.endsWith(".jpg")) {
            background = background.replace(".jpg", ".png");
        }

        const base = await Canvas.loadImage(background);
        const canvas = Canvas.createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // تحديد حجم الخط للنص العادي
        const normalFontSize = req.query.fontSize1 ? parseInt(req.query.fontSize1) : 30;
        ctx.font = `${normalFontSize}px Arial`;

        const normalLines = await wrapText(ctx, normal, 350);
        const normalTopMost = 120 - (((normalFontSize * normalLines.length) / 2) + ((10 * (normalLines.length - 1)) / 2));
        for (let i = 0; i < normalLines.length; i++) {
            const height = normalTopMost + ((normalFontSize + 10) * i);
            ctx.fillText(normalLines[i], 420, height);
        }

        // تحديد حجم الخط لنص البدلة (نفس حجم الخط للنص العادي في هذه الحالة)
        const tuxedoFontSize = req.query.fontSize2 ? parseInt(req.query.fontSize2) : 30;
        ctx.font = `${tuxedoFontSize}px Arial`;

        const tuxedoLines = await wrapText(ctx, tuxedo, 350);
        const tuxedoTopMost = 320 - (((tuxedoFontSize * tuxedoLines.length) / 2) + ((10 * (tuxedoLines.length - 1)) / 2));
        for (let i = 0; i < tuxedoLines.length; i++) {
            const height = tuxedoTopMost + ((tuxedoFontSize + 10) * i);
            ctx.fillText(tuxedoLines[i], 420, height);
        }

        res.set({ 'Content-Type': 'image/png' });
        res.send(canvas.toBuffer());
        const embed = new Discord.MessageEmbed()
            .setTitle('استخدام نقطة النهاية الجديدة')
            .addField('نقطة النهاية', "Pooh", true)
            .setThumbnail('https://cdn.discordapp.com/avatars/804341143092985886/02ddf76ce417a496f49a502ee80c7290.png')
            .addField('الاستعلامات', `• text1 - ${normal}\n• text2 - ${tuxedo}`, true)
            .setColor(color)
        hook.send(embed);
    } catch (err) {
        res.json({ error: `عذرًا، حدث خطأ: ${err.message}` });
    }
})

module.exports = router;
