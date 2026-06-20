import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, ShieldX, Globe, Lock } from 'lucide-react';
import { api } from '../services/api';
import type { FearProfile, SteamSummary, SteamBan } from '../types';

interface Player {
  steam_id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  kd: number;
  kills: number;
  deaths: number;
  server?: string;
  status: 'clean' | 'banned' | 'online';
  ban_type?: string;
  is_online?: boolean;
  flag?: string;
}

interface PlayerCardModalProps {
  player: Player;
  onClose: () => void;
}

export default function PlayerCardModal({ player, onClose }: PlayerCardModalProps) {
  const [profile, setProfile] = useState<FearProfile | null>(null);
  const [steamSummary, setSteamSummary] = useState<SteamSummary | null>(null);
  const [steamBan, setSteamBan] = useState<SteamBan | null>(null);
  const [yoomaBans, setYoomaBans] = useState<any[]>([]);
  const [steamLevel, setSteamLevel] = useState<number>(0);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [ccp, setCcp] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, summaryRes, banRes, levelRes, friendsRes, yoomaRes, skinRes] = await Promise.allSettled([
          api.getProfile(player.steam_id),
          api.getSteamSummary(player.steam_id),
          api.getSteamBans(player.steam_id),
          api.getSteamLevel(player.steam_id),
          api.getSteamFriends(player.steam_id),
          api.getYoomaBans(player.steam_id),
          api.getSkinchanger(player.steam_id),
        ]);

        if (profileRes.status === 'fulfilled') {
          const p = profileRes.value;
          setProfile(p);
          if (p?.balance !== undefined) setCcp(p.balance);
        }
        if (summaryRes.status === 'fulfilled') {
          const players = summaryRes.value?.response?.players;
          if (players?.length) setSteamSummary(players[0]);
        }
        if (banRes.status === 'fulfilled') {
          const bans = banRes.value?.players;
          if (bans?.length) setSteamBan(bans[0]);
        }
        if (levelRes.status === 'fulfilled') {
          setSteamLevel(levelRes.value?.response?.player_level || 0);
        }
        if (friendsRes.status === 'fulfilled') {
          setFriendsCount(friendsRes.value?.friendslist?.friends?.length || 0);
        }
        if (yoomaRes.status === 'fulfilled') {
          setYoomaBans(yoomaRes.value?.punishments || []);
        }
        if (skinRes.status === 'fulfilled') {
          const balance = skinRes.value?.profile?.balance;
          if (balance !== undefined && ccp === 0) setCcp(balance);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [player.steam_id]);

  const isPrivate = steamSummary && steamSummary.communityvisibilitystate !== 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-[480px] bg-[#161a25] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-[#1e2333] hover:bg-[#252a3a] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/10" />
            ) : (
              <div className="w-16 h-16 bg-[#1e2333] rounded-xl flex items-center justify-center ring-2 ring-white/10">
                <span className="text-xl font-bold text-gray-500">{player.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">{player.name || player.nickname || 'Unknown'}</h2>
              <p className="text-sm text-gray-500 font-mono">{player.steam_id}</p>
              <div className="flex items-center gap-2 mt-2">
                {player.is_online !== false && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    В игре
                  </span>
                )}
                {player.server && <span className="text-xs text-gray-400">на {player.server}</span>}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid — matches screenshot 3: K/D, Steam Lvl, CCP, Друзья, Профиль */}
            <div className="px-6 mb-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1e2333] rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">K/D</p>
                  <p className="text-lg font-bold text-white">{(player.kd || 0).toFixed(2)}</p>
                  <p className="text-[11px] text-gray-600">{player.kills || 0}/{player.deaths || 0}</p>
                </div>
                <div className="bg-[#1e2333] rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Steam Lvl</p>
                  <p className="text-lg font-bold text-white">{steamLevel}</p>
                </div>
                <div className="bg-[#1e2333] rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">CCP</p>
                  <p className="text-lg font-bold text-white">{ccp}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-[#1e2333] rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Друзья</p>
                  <p className="text-lg font-bold text-white">{friendsCount}</p>
                </div>
                <div className="bg-[#1e2333] rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Профиль</p>
                  <div className="flex items-center gap-1.5">
                    {isPrivate ? (
                      <><Lock className="w-3.5 h-3.5 text-red-400" /><p className="text-sm font-bold text-red-400">Приватный</p></>
                    ) : (
                      <><Globe className="w-3.5 h-3.5 text-emerald-400" /><p className="text-sm font-bold text-emerald-400">Публичный</p></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fear Ban Info */}
            {profile?.banInfo?.isBanned && (
              <div className="px-6 mb-4">
                <h3 className="text-sm font-semibold text-white mb-2">Баны</h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <ShieldX className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400 font-medium">{profile.banInfo.reason || 'Бан'}</span>
                  </div>
                  {profile.banInfo.date && <p className="text-xs text-gray-500 mt-1">{profile.banInfo.date}</p>}
                </div>
              </div>
            )}

            {/* Steam Ban Info */}
            {steamBan && (steamBan.vacBanned || steamBan.numberofGameBans > 0) && (
              <div className="px-6 mb-4">
                <h3 className="text-sm font-semibold text-white mb-2">Steam Бан</h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  {steamBan.vacBanned && (
                    <p className="text-sm text-red-400">VAC ({steamBan.numberofVACBans}) — {steamBan.daysSinceLastVACBan} дн.</p>
                  )}
                  {steamBan.numberofGameBans > 0 && (
                    <p className="text-sm text-red-400">Game Ban ({steamBan.numberofGameBans})</p>
                  )}
                </div>
              </div>
            )}

            {/* Yooma Bans */}
            {yoomaBans.length > 0 && (
              <div className="px-6 mb-4">
                <h3 className="text-sm font-semibold text-white mb-2">Yooma Баны ({yoomaBans.length})</h3>
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  {yoomaBans.slice(0, 5).map((b: any, i: number) => {
                    const nowTs = Date.now() / 1000;
                    const unpunish = b.unpunish_admin_id;
                    const expires = b.expires || 0;
                    let st = 'active';
                    if (unpunish && unpunish !== 0) st = 'unbanned';
                    else if (expires > 0 && expires < nowTs) st = 'expired';
                    const statusColor = st === 'active' ? 'text-red-400' : st === 'unbanned' ? 'text-emerald-400' : 'text-gray-400';
                    const statusText = st === 'active' ? 'Активен' : st === 'unbanned' ? 'Снят' : 'Истёк';
                    return (
                      <div key={i} className="bg-[#1e2333] border border-white/5 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-300">{b.reason || 'Без причины'}</p>
                          <span className={`text-[10px] font-medium ${statusColor}`}>{statusText}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {b.created ? new Date(b.created * 1000).toLocaleDateString('ru-RU') : '—'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6 pt-2 flex gap-3">
              <a
                href={`https://steamcommunity.com/profiles/${player.steam_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1b2838] hover:bg-[#1e2f42] border border-[#2a475e]/50 text-[#66c0f4] rounded-xl text-sm font-medium transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Steam
              </a>
              <a
                href={`https://fearproject.ru/profile/${player.steam_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#4f7cff] hover:bg-[#3d6aff] text-white rounded-xl text-sm font-medium transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                FEAR
              </a>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
