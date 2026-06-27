/**
 * Discord OAuth2 авторизация
 * 1. /api/auth/discord — редирект на Discord OAuth
 * 2. /api/auth/discord/callback — получение токена, профиля, ролей сервера
 * 3. Определение уровня: user_levels.discord_id -> Discord-роли -> env default
 */

const https = require('https');
const querystring = require('querystring');
const crypto = require('crypto');

const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    DISCORD_GUILD_ID,
    DISCORD_DEFAULT_LEVEL,
    DISCORD_ROLE_LEVELS,
    DISCORD_FORCE_LEVEL_5_IDS,
    DISCORD_BLOCKED_ROLE_IDS,
    DISCORD_BOT_TOKEN,
    DISCORD_STATE_SECRET
} = require('./config');

function discordRequest(method, path, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        // Если body уже строка (например, form-urlencoded), отправляем как есть.
        const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
        const qs = body && method === 'POST' ? null : querystring.stringify(body);
        const fullPath = (method === 'GET' && qs) ? `${path}?${qs}` : path;
        const req = https.request({
            hostname: 'discord.com',
            port: 443,
            path: fullPath,
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'FearPanel/1.0',
                ...headers,
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = data ? JSON.parse(data) : null;
                    resolve({ statusCode: res.statusCode || 500, body: json });
                } catch (e) {
                    resolve({ statusCode: res.statusCode || 500, body: data });
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => req.destroy(new Error('Discord API timeout')));
        if (payload) req.write(payload);
        req.end();
    });
}

function signState(redirectPath) {
    if (!DISCORD_STATE_SECRET) return null;
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const payload = `${timestamp}:${random}:${redirectPath}`;
    const signature = crypto.createHmac('sha256', DISCORD_STATE_SECRET).update(payload).digest('hex');
    return `${timestamp}:${random}:${signature}:${Buffer.from(redirectPath, 'utf8').toString('base64url')}`;
}

function verifyState(state) {
    if (!state || !DISCORD_STATE_SECRET) return null;
    const parts = String(state).split(':');
    if (parts.length !== 4) return null;
    const [timestampStr, random, signature, redirectB64] = parts;
    const timestamp = Number(timestampStr);
    if (!Number.isFinite(timestamp) || Date.now() - timestamp > 5 * 60 * 1000) return null;
    const redirect = Buffer.from(redirectB64, 'base64url').toString('utf8');
    const payload = `${timestamp}:${random}:${redirect}`;
    const expected = crypto.createHmac('sha256', DISCORD_STATE_SECRET).update(payload).digest('hex');
    if (signature !== expected) return null;
    return redirect || '/';
}

function getDiscordLoginUrl(redirectPath = '/') {
    if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) return null;
    const state = signState(redirectPath);
    if (!state) return null;
    const params = {
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds.members.read',
        state,
        prompt: 'consent'
    };
    return {
        url: 'https://discord.com/oauth2/authorize?' + querystring.stringify(params),
        state
    };
}

async function exchangeCode(code) {
    const body = querystring.stringify({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI
    });
    const res = await discordRequest('POST', '/api/oauth2/token', {
        'Content-Type': 'application/x-www-form-urlencoded'
    }, body);
    if (res.statusCode !== 200 || !res.body?.access_token) {
        throw new Error(`Discord token error ${res.statusCode}: ${JSON.stringify(res.body)}`);
    }
    return res.body;
}

async function getDiscordUser(accessToken) {
    const res = await discordRequest('GET', '/api/users/@me', {
        'Authorization': `Bearer ${accessToken}`
    });
    if (res.statusCode !== 200 || !res.body?.id) {
        throw new Error(`Discord user error ${res.statusCode}: ${JSON.stringify(res.body)}`);
    }
    return res.body;
}

async function getGuildMember(discordId) {
    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) return null;
    const res = await discordRequest('GET', `/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
    });
    if (res.statusCode !== 200 || !res.body?.roles) return null;
    return res.body;
}

function resolveLevelFromRoles(roles) {
    if (!roles || roles.length === 0) return 0;
    let best = 0;
    for (const roleId of roles) {
        const level = DISCORD_ROLE_LEVELS[roleId];
        if (level && level > best) best = level;
    }
    return best;
}

function hasBlockedRole(roles) {
    if (!roles || roles.length === 0) return false;
    for (const roleId of roles) {
        if (DISCORD_BLOCKED_ROLE_IDS.includes(String(roleId))) return true;
    }
    return false;
}

function resolveUserLevel(discordId, dbLevel, roles) {
    // 0. Хардкод: эти discord_id всегда имеют максимальный уровень
    if (DISCORD_FORCE_LEVEL_5_IDS.includes(String(discordId))) return 5;
    // 1. Блокирующие роли (например, роль "забанен на сайте") — не пускаем
    if (hasBlockedRole(roles)) return 0;
    // 2. Явно назначенный уровень в БД
    if (Number.isFinite(dbLevel) && dbLevel > 0) return dbLevel;
    // 3. Discord-роли на сервере
    const roleLevel = resolveLevelFromRoles(roles);
    if (roleLevel > 0) return roleLevel;
    // 4. Env default
    return DISCORD_DEFAULT_LEVEL;
}

function validateState(state) {
    return verifyState(state);
}

function getDiscordAvatarUrl(discordId, avatarHash) {
    if (!discordId || !avatarHash) return '';
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=256`;
}

function getDiscordDefaultAvatarUrl(discordId) {
    if (!discordId) return '';
    const index = Number(discordId) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function isDiscordAuthConfigured() {
    return Boolean(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && DISCORD_REDIRECT_URI);
}

module.exports = {
    getDiscordLoginUrl,
    exchangeCode,
    getDiscordUser,
    getGuildMember,
    resolveUserLevel,
    resolveLevelFromRoles,
    validateState,
    getDiscordAvatarUrl,
    getDiscordDefaultAvatarUrl,
    isDiscordAuthConfigured
};
