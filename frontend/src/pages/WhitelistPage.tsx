import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, Trash2, Plus, X } from 'lucide-react';
import { api } from '../services/api';

interface WhitelistEntry {
  id: string;
  name: string;
  steam_id: string;
  added_by: string;
  date: string;
}

export default function WhitelistPage() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addSteamId, setAddSteamId] = useState('');
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.getWhitelist();
      setEntries(res.data || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAdd = async () => {
    if (!addSteamId.trim()) return;
    setAdding(true);
    try {
      await api.addToWhitelist(addSteamId.trim(), addName.trim());
      setAddSteamId('');
      setAddName('');
      await fetchEntries();
    } catch (err) {
      console.error('Failed to add:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deleteFromWhitelist(id);
      await fetchEntries();
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = entries.filter(e =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.steam_id.includes(search) ||
    e.added_by.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Белый список</h1>
        </div>
        <p className="text-sm text-[#8a8a93]">
          Проверенные игроки • {entries.length} записей
        </p>
      </motion.div>

      {/* Add Entry */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#12151e] rounded-xl border border-white/5 p-4 mb-6"
      >
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Добавить в whitelist
        </h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Steam ID (например: 76561198000000000)"
              value={addSteamId}
              onChange={(e) => setAddSteamId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && addSteamId.trim()) {
                  handleAdd();
                }
              }}
              className="w-full px-4 py-3 bg-[#0c0e14] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/30 transition-all"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Имя (необязательно)"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && addSteamId.trim()) {
                  handleAdd();
                }
              }}
              className="w-full px-4 py-3 bg-[#0c0e14] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/30 transition-all"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!addSteamId.trim() || adding}
            className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#12151e] rounded-xl border border-white/5 p-4 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по нику / SteamID / добавил..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#0c0e14] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#12151e] rounded-xl border border-white/5 overflow-hidden"
      >
        <div className="grid grid-cols-[50px_1fr_1fr_1fr_140px_80px] gap-4 px-5 py-3 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider font-semibold">
          <span>№</span>
          <span>Игрок</span>
          <span>SteamID</span>
          <span>Добавил</span>
          <span>Дата</span>
          <span className="text-right">Действия</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-white/[0.03] max-h-[calc(100vh-420px)] overflow-y-auto">
            <AnimatePresence>
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  className="grid grid-cols-[50px_1fr_1fr_1fr_140px_80px] gap-4 px-5 py-3 hover:bg-[#161a25] transition-colors items-center"
                >
                  <span className="text-sm text-gray-600">{i + 1}</span>
                  <span className="text-sm text-white truncate">{entry.name || '—'}</span>
                  <span className="text-xs text-gray-400 font-mono truncate">{entry.steam_id}</span>
                  <span className="text-xs text-gray-400 truncate">{entry.added_by}</span>
                  <span className="text-xs text-gray-500">{entry.date}</span>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-all group disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShieldCheck className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">
              {search ? 'Ничего не найдено' : 'Whitelist пуст'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {search ? 'Попробуйте другой запрос' : 'Добавьте первого игрока выше'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
