import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Shield, ShieldCheck, ShieldAlert, ShieldX, X, Loader2,
  ExternalLink, Copy, Check, AlertTriangle, Users, Gamepad2,
  ChevronDown, FileText, Trash2, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface AccountResult {
  steam_id: string;
  name: string;
  avatar: string;
  status: 'clean' | 'banned' | 'not_found' | 'error';
  ban_type?: string;
  ban_reason?: string;
  ban_days_ago?: number;
  ban_date?: string;
  fear_status?: string;
  steam_status?: string;
  kd?: number;
  playtime?: number;
}

interface CheckSummary {
  total: number;
  clean: number;
  banned: number;
  not_found: number;
}

type TabType = 'all' | 'clean' | 'banned' | 'not_found';

export default function VDFCheckerPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AccountResult[]>([]);
  const [summary, setSummary] = useState<CheckSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = useCallback(async () => {
    const steamIds = input
      .split(/[\n,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && /^\d{17}$/.test(s));

    if (steamIds.length === 0) {
      setError('Введите корректные SteamID (17 цифр)');
      return;
    }

    if (steamIds.length > 50) {
      setError('Максимум 50 аккаунтов за раз');
      return;
    }

    setError('');
    setLoading(true);
    setResults([]);
    setShowResults(false);

    try {
      const res = await api.checkAccounts(steamIds);
      const data = res.data || [];
      setResults(data);

      const s: CheckSummary = {
        total: data.length,
        clean: data.filter((a: AccountResult) => a.status === 'clean').length,
        banned: data.filter((a: AccountResult) => a.status === 'banned').length,
        not_found: data.filter((a: AccountResult) => a.status === 'not_found' || a.status === 'error').length,
      };
      setSummary(s);
      setShowResults(true);
    } catch (err) {
      setError('Ошибка проверки. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const filtered = results.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'clean') return r.status === 'clean';
    if (activeTab === 'banned') return r.status === 'banned';
    if (activeTab === 'not_found') return r.status === 'not_found' || r.status === 'error';
    return true;
  });

  const parseFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      // clipboard not available
    }
  };

  const clearAll = () => {
    setInput('');
    setResults([]);
    setShowResults(false);
    setSummary(null);
    setActiveTab('all');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-blue/20"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            VDF <span className="gradient-text">Checker</span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Проверка аккаунтов на баны VAC,_GAME и статус в базе FearSearch
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-accent-blue" />
            <h2 className="text-lg font-semibold text-white">SteamID ввод</h2>
            <span className="text-xs text-gray-500 ml-auto">
              {input.split(/[\n,;\s]+/).filter((s) => /^\d{17}$/.test(s.trim())).length} аккаунтов
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder={"Вставьте SteamID (по одному на строку, через запятую или пробел):\n\n76561198000000000\n76561198000000001, 76561198000000002"}
            className="w-full h-40 px-4 py-3 bg-dark-800/80 border border-white/10 rounded-xl text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all resize-none"
          />

          <div className="flex flex-wrap gap-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheck}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-blue/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? 'Проверяю...' : 'Проверить'}
            </motion.button>

            <button
              onClick={parseFromClipboard}
              className="flex items-center gap-2 px-4 py-3 bg-dark-600 hover:bg-dark-500 border border-white/10 text-gray-300 rounded-xl transition-all text-sm"
            >
              <Copy className="w-4 h-4" />
              Из буфера
            </button>

            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-3 bg-dark-600 hover:bg-dark-500 border border-white/10 text-gray-300 rounded-xl transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Очистить
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-red-400 flex items-center gap-1"
            >
              <AlertTriangle className="w-4 h-4" />
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {showResults && summary && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <SummaryCard
                  label="Всего"
                  value={summary.total}
                  icon={Users}
                  color="from-blue-500/20 to-blue-600/20"
                  textColor="text-blue-400"
                  borderColor="border-blue-500/30"
                  delay={0}
                />
                <SummaryCard
                  label="Чистых"
                  value={summary.clean}
                  icon={ShieldCheck}
                  color="from-emerald-500/20 to-emerald-600/20"
                  textColor="text-emerald-400"
                  borderColor="border-emerald-500/30"
                  delay={0.05}
                />
                <SummaryCard
                  label="С банами"
                  value={summary.banned}
                  icon={ShieldX}
                  color="from-red-500/20 to-red-600/20"
                  textColor="text-red-400"
                  borderColor="border-red-500/30"
                  delay={0.1}
                />
                <SummaryCard
                  label="Не найдено"
                  value={summary.not_found}
                  icon={ShieldAlert}
                  color="from-amber-500/20 to-amber-600/20"
                  textColor="text-amber-400"
                  borderColor="border-amber-500/30"
                  delay={0.15}
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {([
                  { key: 'all', label: 'Все', count: summary.total },
                  { key: 'clean', label: 'Чистые', count: summary.clean },
                  { key: 'banned', label: 'С банами', count: summary.banned },
                  { key: 'not_found', label: 'Не найдено', count: summary.not_found },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? tab.key === 'clean'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : tab.key === 'banned'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : tab.key === 'not_found'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30'
                        : 'bg-dark-700/50 text-gray-400 border border-white/5 hover:text-white hover:bg-dark-600'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                      activeTab === tab.key
                        ? 'bg-white/10'
                        : 'bg-dark-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((account, i) => (
                    <AccountCard key={account.steam_id} account={account} index={i} />
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Shield className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Нет аккаунтов в этой категории</p>
                </motion.div>
              )}

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={clearAll}
                className="w-full mt-6 py-4 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-accent-blue/25"
              >
                Закрыть и начать заново
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SummaryCard({
  label, value, icon: Icon, color, textColor, borderColor, delay,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  textColor: string;
  borderColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, scale: 1.02 }}
      className={`bg-gradient-to-br ${color} border ${borderColor} rounded-2xl p-4 text-center`}
    >
      <Icon className={`w-6 h-6 ${textColor} mx-auto mb-2 opacity-70`} />
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

function AccountCard({ account, index }: { account: AccountResult; index: number }) {
  const isClean = account.status === 'clean';
  const isBanned = account.status === 'banned';
  const isNotFound = account.status === 'not_found' || account.status === 'error';

  const borderColor = isBanned
    ? 'border-red-500/30 hover:border-red-500/50'
    : isClean
    ? 'border-emerald-500/30 hover:border-emerald-500/50'
    : 'border-amber-500/30 hover:border-amber-500/50';

  const glowColor = isBanned
    ? 'hover:shadow-red-500/10'
    : isClean
    ? 'hover:shadow-emerald-500/10'
    : 'hover:shadow-amber-500/10';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`glass-card border ${borderColor} ${glowColor} p-5 transition-all duration-300 hover:shadow-xl`}
    >
      {/* Header: Avatar + Name + Status */}
      <div className="flex items-center gap-3 mb-4">
        {account.avatar ? (
          <img
            src={account.avatar}
            alt={account.name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-dark-600 rounded-xl flex items-center justify-center ring-2 ring-white/10">
            <Users className="w-6 h-6 text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{account.name || 'Неизвестно'}</p>
          <p className="text-xs text-gray-500 font-mono truncate">{account.steam_id}</p>
        </div>
        <StatusBadge status={account.status} />
      </div>

      {/* Ban Details */}
      {isBanned && account.ban_reason && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">
                {account.ban_type} {account.ban_days_ago !== undefined ? `${account.ban_days_ago} дн. назад` : ''}
              </p>
              {account.ban_date && (
                <p className="text-xs text-red-400/60 mt-0.5">{account.ban_date}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Clean Status */}
      {isClean && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <p className="text-sm text-emerald-400">
              {account.fear_status || 'Аккаунт чист'}
            </p>
          </div>
        </div>
      )}

      {/* Not Found */}
      {isNotFound && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <p className="text-sm text-amber-400">Аккаунт не найден в базе</p>
          </div>
        </div>
      )}

      {/* Extra Stats */}
      {(account.kd !== undefined || account.playtime !== undefined) && (
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
          {account.kd !== undefined && (
            <span>K/D: <span className="text-white font-medium">{account.kd.toFixed(2)}</span></span>
          )}
          {account.playtime !== undefined && (
            <span>Часы: <span className="text-white font-medium">{Math.floor(account.playtime / 3600)}ч</span></span>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex gap-2">
        <a
          href={`https://fearproject.ru/profile/${account.steam_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 text-accent-blue rounded-lg text-xs font-medium transition-all"
        >
          <ExternalLink className="w-3 h-3" />
          Fear
        </a>
        <a
          href={`https://steamcommunity.com/profiles/${account.steam_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2838]/80 hover:bg-[#1b2838] border border-[#2a475e]/50 text-[#66c0f4] rounded-lg text-xs font-medium transition-all"
        >
          <ExternalLink className="w-3 h-3" />
          Steam
        </a>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: AccountResult['status'] }) {
  if (status === 'clean') {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">
        <ShieldCheck className="w-3.5 h-3.5" />
        Чист
      </span>
    );
  }
  if (status === 'banned') {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider">
        <ShieldX className="w-3.5 h-3.5" />
        Бан
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider">
      <ShieldAlert className="w-3.5 h-3.5" />
      ?
    </span>
  );
}
