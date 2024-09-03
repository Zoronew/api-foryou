const axios = require('axios').default;
const simtalk = (text, language) => new Promise((resolve, reject) => {
    if (typeof text !== 'string') {
        console.error('Text must be string');
        process.exit(1);
    }
    let lang = [
        'vn',
        'en',
        'he',
        'zh',
        'ch',
        'id',
        'ko',
        'ph',
        'ru',
        'ar',
        'ms',
        'es',
        'pt',
        'de',
        'th',
        'ja',
        'fr',
        'sv',
        'tr',
        'da',
        'nb',
        'it',
        'nl',
        'fi',
        'ml',
        'hi',
        'kh',
        'ca',
        'ta',
        'rs',
        'mn',
        'fa',
        'pa',
        'cy',
        'hr',
        'el',
        'az',
        'sw',
        'te',
        'pl',
        'ro',
        'si',
        'fy',
        'kk',
        'cs',
        'hu',
        'lt',
        'be',
        'br',
        'af',
        'bg',
        'is',
        'uk',
        'jv',
        'eu',
        'rw',
        'or',
        'al',
        'bn',
        'gn',
        'kn',
        'my',
        'sk',
        'gl',
        'gu',
        'ps',
        'ka',
        'et',
        'tg',
        'as',
        'mr',
        'ne',
        'ur',
        'uz',
        'cx',
        'hy',
        'lv',
        'sl',
        'ku',
        'mk',
        'bs',
        'ig',
        'lb',
        'mg',
        'ny',
        'sn',
        'tt',
        'yo',
        'co',
        'eo',
        'ga',
        'hm',
        'hw',
        'lo',
        'mi',
        'so',
        'ug',
        'am',
        'gd'
    ];
let checkLanguage = lang.includes(language) ? language: '';
if (typeof checkLanguage !== 'string' || !checkLanguage) {
    console.error('Lang must be string or Lang Not Support');
    process.exit(1);
}
const params = new URLSearchParams();
params.append('text', text);
params.append('lc', checkLanguage);

// حساب طول البيانات
const contentLength = Buffer.byteLength(params.toString(), 'utf8');

axios({
    method: 'POST',
    url: 'https://api.simsimi.vn/v2/simtalk',
    data: params,
    headers: {
        'Content-Length': contentLength, // تحديد الطول بشكل صحيح
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
}).then(response => resolve(response.data)).catch(reject);
});

module.exports = {
simtalk
}
