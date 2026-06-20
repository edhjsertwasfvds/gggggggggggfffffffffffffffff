import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, ShieldX, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Punishment } from '../types';

export default function PunishmentsPage() {
  const { user } = useAuth();
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const id = steamId.trim();
    if (!id) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.getPunishmentsByAdmin(id);
      setPunishments(res.punishments || []);
      setTotal(res.total || 0);
    } catch {
      setPunishments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleShowOwn = async () => {
    if (!user?.steam_id) return;
    setLoading(true);
    setSearched(true);
    setSteamId(user.steam_id);
    try {
      const res = await api.getPunishmentsByAdmin(user.steam_id);
      setPunishments(res.punishments || []);
      setTotal(res.total || 0);
    } catch {
      setPunishments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const bansCount = punishments.filter(p => p.type === 0).length;
  const mutesCount = punishments.filter(p => p.type === 1).length;

  const getServerName = (id: number) => {
    const servers: Record<number, string> = {
      1: 'MIRAGE #1', 2: 'MIRAGE #2', 3: 'DUST2 #1',
      4: 'NUKE #1', 5: 'INFERNO #1',
    };
    return servers[id] || `Server #${id}`;
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">Наказания</h1>
        <p className="text-sm text-gray-500 mt-1">Статистика наказаний администратора</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#12151e] rounded-xl border border-white/5 p-4 mb-6"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="SteamID администратора"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-11 pr-4 py-3 bg-[#0c0e14] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/30 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={loading || !steamId.trim()}
            className="px-6 py-3 bg-[#4f7cff] hover:bg-[#3d6aff] text-white font-medium rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Проверить'}
          </motion.button>
          {user?.steam_id && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShowOwn}
              disabled={loading}
              className="px-6 py-3 bg-[#1a1f2e] hover:bg-[#222840] border border-white/10 text-gray-300 font-medium rounded-xl transition-all disabled:opacity-50"
            >
              Мои наказания
            </motion.button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] rounded-lg border border-white/5">
            <ShieldX className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-400">{bansCount}</span>
            <span className="text-sm text-red-400 font-medium">банов</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] rounded-lg border border-white/5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-gray-400">{mutesCount}</span>
            <span className="text-sm text-amber-400 font-medium">мутов</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] rounded-lg border border-white/5">
            <span className="text-sm text-gray-400">{total}</span>
            <span className="text-sm text-gray-400">всего</span>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#12151e] rounded-xl border border-white/5 overflow-hidden"
      >
        <div className="grid grid-cols-[40px_1fr_1fr_1fr_120px_100px_120px] gap-4 px-5 py-3 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider font-semibold">
          <span>№</span>
          <span>Игрок</span>
          <span>SteamID</span>
          <span>Причина</span>
          <span>Сервер</span>
          <span>Тип</span>
          <span>Дата</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : punishments.length > 0 ? (
          <div className="divide-y divide-white/[0.03] max-h-[calc(100vh-380px)] overflow-y-auto">
            {punishments.map((p) => (
              <div key={p.id} className="grid grid-cols-[40px_1fr_1fr_1fr_120px_100px_120px] gap-4 px-5 py-3 hover:bg-[#161a25] transition-colors items-center">
                <span className="text-sm text-gray-600">{p.id}</span>
                <span className="text-sm text-white truncate">{p.steamid}</span>
                <span className="text-sm text-gray-400 font-mono truncate">{p.steamid}</span>
                <span className="text-sm text-gray-300 truncate">{p.reason || '—'}</span>
                <span className="text-xs text-gray-400">{getServerName(p.server_id)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  p.type === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {p.type === 0 ? 'BAN' : 'MUTE'}
                </span>
                <span className="text-xs text-gray-500">
                  {p.time ? new Date(p.time).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {searched ? (
              <p className="text-gray-500">Наказания не найдены</p>
            ) : (
              <p className="text-gray-500">Введите SteamID администратора или нажмите «Мои наказания»</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
