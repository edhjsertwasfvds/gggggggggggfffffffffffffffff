const { UAParser } = require('ua-parser-js');

function parseUserAgent(ua) {
    if (!ua) return { device: null, os: null, browser: null };
    try {
        const parser = new UAParser(ua);
        const result = parser.getResult();
        const device = result.device?.model || result.device?.vendor || result.device?.type || 'desktop';
        const os = result.os?.name ? `${result.os.name}${result.os.version ? ' ' + result.os.version : ''}` : null;
        const browser = result.browser?.name ? `${result.browser.name}${result.browser.version ? ' ' + result.browser.version : ''}` : null;
        return { device, os, browser };
    } catch (err) {
        console.error('[UA] parse error:', err.message);
        return { device: null, os: null, browser: null };
    }
}

module.exports = { parseUserAgent };
