import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldX, Check, AlertTriangle, ExternalLink, Users } from 'lucide-react';
import { api } from '../services/api';
import type { AccountResult } from '../types';

interface AccountCheckResult extends AccountResult {
  steam_id: string;
  name: string;
  avatar: string;
  status: string;
  ban_type?: string;
  ban_reason?: string;
  ban_days_ago?: number;
  ban_date?: string;
  fear_status?: string;
  kd?: number;
  playtime?: number;
}

export default function CheckerPage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<AccountCheckResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCheck = useCallback(async () => {
    const ids = input.split(/[\n,;\s]+/).map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await api.checkAccounts(ids);
      setResults(res.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'clean': return { label: 'Чист', color: 'text-emerald-400 bg-emerald-400/10', icon: Check };
      case 'banned': return { label: 'Забанен', color: 'text-red-400 bg-red-400/10', icon: ShieldX };
      case 'not_found': return { label: 'Не найден', color: 'text-gray-400 bg-gray-400/10', icon: AlertTriangle };
      default: return { label: status, color: 'text-gray-400 bg-gray-400/10', icon: AlertTriangle };
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">Проверка</h1>
        <p className="text-sm text-gray-500 mt-1">Проверка аккаунтов на баны и статус</p>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#12151e] rounded-xl border border-white/5 p-4 mb-6"
      >
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Введите SteamID (через запятую или пробел)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              className="w-full pl-11 pr-4 py-3 bg-[#0c0e14] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/30 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheck}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-[#4f7cff] hover:bg-[#3d6aff] text-white font-medium rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Проверить'
            )}
          </motion.button>
        </div>
        <p className="text-xs text-gray-600">Максимум 50 аккаунтов за раз</p>
      </motion.div>

      {/* Results */}
      <div className="space-y-3">
        <AnimatePresence>
          {results.map((r, i) => {
            const statusInfo = getStatusInfo(r.status);
            const StatusIcon = statusInfo.icon;
            return (
              <motion.div
                key={r.steam_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#12151e] rounded-xl border border-white/5 p-4"
              >
                <div className="flex items-center gap-4">
                  {r.avatar ? (
                    <img src={r.avatar} alt={r.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10" />
                  ) : (
                    <div className="w-12 h-12 bg-[#1e2333] rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 font-mono">{r.steam_id}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusInfo.label}
                  </span>
                </div>

                {r.status === 'banned' && (
                  <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <p className="text-sm text-red-400">
                      {r.ban_type}: {r.ban_reason || 'Без причины'}
                      {r.ban_days_ago != null && ` (${r.ban_days_ago} дней назад)`}
                    </p>
                    {r.ban_date && <p className="text-xs text-gray-500 mt-1">{r.ban_date}</p>}
                  </div>
                )}

                {r.fear_status && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">FEAR:</span>
                    <span className="text-xs text-blue-400">{r.fear_status}</span>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://steamcommunity.com/profiles/${r.steam_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2838] hover:bg-[#1e2f42] border border-[#2a475e]/50 text-[#66c0f4] rounded-lg text-xs font-medium transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Steam
                  </a>
                  <a
                    href={`https://fearproject.ru/profile/${r.steam_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4f7cff] hover:bg-[#3d6aff] text-white rounded-lg text-xs font-medium transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    FEAR
                  </a>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {results.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">Введите SteamID для проверки</p>
          </div>
        )}
      </div>
    </div>
  );
}
