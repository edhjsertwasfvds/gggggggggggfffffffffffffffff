const maxmind = require('maxmind');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'GeoLite2-City.mmdb');

let readerPromise = null;

async function getReader() {
    if (readerPromise) return readerPromise;
    readerPromise = new Promise((resolve, reject) => {
        if (!fs.existsSync(DB_PATH)) {
            return reject(new Error('GeoLite2-City.mmdb not found'));
        }
        maxmind.open(DB_PATH, { watchForUpdates: true })
            .then(reader => resolve(reader))
            .catch(err => reject(err));
    });
    return readerPromise;
}

async function lookupIp(ip) {
    try {
        const reader = await getReader();
        const result = reader.get(ip);
        if (!result) return { country: null, city: null };
        const country = result.country?.names?.en || result.country?.iso_code || null;
        const city = result.city?.names?.en || null;
        return { country, city };
    } catch (err) {
        console.error('[GeoIP] lookup error:', err.message);
        return { country: null, city: null };
    }
}

module.exports = { lookupIp, DB_PATH };
