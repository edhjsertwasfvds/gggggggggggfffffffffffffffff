/**
 * Модуль авторизации и управления сессиями
 * Сессии хранятся в БД — переживают перезапуск сервера и обновление страницы
 */

const crypto = require('crypto');
const db = require('./database');
const { lookupIp } = require('./geoip');
const { parseUserAgent } = require('./ua-parser');

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 дней

function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

function rowToSession(row) {
    if (!row) return null;
    return {
        token: row.token,
        userId: row.user_id,
        username: row.username,
        displayName: row.display_name,
        level: row.level,
        ipAddress: row.ip_address || null,
        userAgent: row.user_agent || null,
        country: row.country || null,
        city: row.city || null,
        device: row.device || null,
        os: row.os || null,
        browser: row.browser || null,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        lastActivity: row.last_activity
    };
}

async function enrichSessionInfo(ip, userAgent) {
    const geo = await Promise.race([
        lookupIp(ip),
        new Promise(resolve => setTimeout(() => resolve({ country: null, city: null }), 3000))
    ]);
    const { country, city } = geo || {};
    const { device, os, browser } = parseUserAgent(userAgent);
    return {
        ip: ip || null,
        userAgent: userAgent || null,
        country: country || null,
        city: city || null,
        device: device || null,
        os: os || null,
        browser: browser || null
    };
}

async function createSession(userData, requestInfo = {}) {
    const sessionToken = generateSessionToken();
    const now = Date.now();
    const expiresAt = now + SESSION_TTL;
    const sessionInfo = await enrichSessionInfo(requestInfo.ip, requestInfo.userAgent);

    await db.saveSession(
        sessionToken,
        userData.id,
        userData.username,
        userData.displayName || userData.username,
        userData.level,
        expiresAt,
        now,
        now,
        sessionInfo
    );

    await db.logLoginEvent(userData.id, 'login', null, sessionInfo);

    return {
        token: sessionToken,
        userId: userData.id,
        username: userData.username,
        displayName: userData.displayName || userData.username,
        level: userData.level,
        ...sessionInfo,
        createdAt: now,
        expiresAt,
        lastActivity: now
    };
}

async function getSession(sessionToken) {
    if (!sessionToken) return null;

    const row = await db.getSessionFromDb(sessionToken);
    const session = rowToSession(row);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
        await db.deleteSessionFromDb(sessionToken);
        return null;
    }

    try {
        const user = await db.getUserById(session.userId);
        if (!user) {
            await db.deleteSessionFromDb(sessionToken);
            return null;
        }
        if (Number.isFinite(Number(user.level))) session.level = Number(user.level);
    } catch (_) {}

    const sessionInfo = {
        ip: session.ipAddress,
        userAgent: session.userAgent,
        country: session.country,
        city: session.city,
        device: session.device,
        os: session.os,
        browser: session.browser
    };
    await db.saveSession(
        sessionToken,
        session.userId,
        session.username,
        session.displayName,
        session.level,
        session.expiresAt,
        session.createdAt,
        Date.now(),
        sessionInfo
    );
    session.lastActivity = Date.now();
    return session;
}

async function deleteSession(sessionToken) {
    await db.deleteSessionFromDb(sessionToken);
    return true;
}

async function validateSession(sessionToken, requiredLevel = 0) {
    const session = await getSession(sessionToken);

    if (!session) {
        return { valid: false, error: 'Сессия не найдена или истекла' };
    }

    if (session.level < requiredLevel) {
        return { valid: false, error: 'Недостаточно прав' };
    }

    return { valid: true, session };
}

async function cleanupExpiredSessions() {
    const cleaned = await db.cleanupExpiredSessionsDb();
    if (cleaned > 0) {
        console.log(`[Auth] Очищено истекших сессий: ${cleaned}`);
    }
    return cleaned;
}

async function getSessionStats() {
    const now = Date.now();
    const rows = await db.getActiveSessionsFromDb();
    const activeSessions = rows.map((row) => rowToSession(row));

    return {
        total: activeSessions.length,
        active: activeSessions.filter((s) => now - s.lastActivity < 5 * 60 * 1000).length,
        oldest: activeSessions.length > 0 ? Math.min(...activeSessions.map((s) => s.createdAt)) : null,
        newest: activeSessions.length > 0 ? Math.max(...activeSessions.map((s) => s.createdAt)) : null
    };
}

async function getUserSessions(userId) {
    const rows = await db.getSessionsByUserId(userId);
    return rows.map(row => rowToSession(row));
}

async function getAllSessions() {
    const rows = await db.getActiveSessionsFromDb();
    return rows.map(row => rowToSession(row));
}

async function deleteUserSessions(userId, exceptToken = null) {
    const sessions = await getUserSessions(userId);
    let deleted = 0;
    for (const s of sessions) {
        if (exceptToken && s.token === exceptToken) continue;
        await deleteSession(s.token);
        deleted++;
    }
    return deleted;
}

async function getUserLoginLogs(userId, limit = 50) {
    return db.getLoginLogsByUserId(userId, limit);
}

setInterval(() => {
    cleanupExpiredSessions().catch(() => {});
}, 60 * 60 * 1000);

module.exports = {
    createSession,
    getSession,
    deleteSession,
    validateSession,
    cleanupExpiredSessions,
    getSessionStats,
    getUserSessions,
    getAllSessions,
    deleteUserSessions,
    getUserLoginLogs,
    enrichSessionInfo
};
