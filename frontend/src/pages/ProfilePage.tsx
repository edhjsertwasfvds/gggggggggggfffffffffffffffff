import { motion } from 'framer-motion';
import { UserCircle, Shield, Key, Clock, ExternalLink, Check, X, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const permissionLabels: Record<string, string> = {
  'staff.manage': 'Управление стаффом',
  'staff.view': 'Просмотр стаффа',
  'punishments.manage': 'Управление наказаниями',
  'punishments.view': 'Просмотр наказаний',
  'dashboard.admin': 'Админ. панель',
  'dashboard.view': 'Просмотр дашборда',
  'settings.manage': 'Управление настройками',
  'users.manage': 'Управление пользователями',
  'reports.view': 'Просмотр репортов',
  'logs.view': 'Просмотр логов',
  'announcements.create': 'Создание объявлений',
};

const roleBadgeColors: Record<string, string> = {
  OWNER: 'bg-red-500/20 text-red-400 border-red-500/30',
  GLADMIN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  STADMIN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ADMIN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ADMIN_PLUS: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  STMODER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MODER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MLMODER: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  CURATOR: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  USER: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const discordAvatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png?size=256`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-accent-blue/30 via-accent-purple/30 to-accent-cyan/30 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-700/80 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 -mt-16 relative z-10">
          <div className="flex items-end gap-6 mb-6">
            {discordAvatar ? (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                src={discordAvatar}
                alt={user.username}
                className="w-28 h-28 rounded-2xl ring-4 ring-dark-700 shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 bg-dark-600 rounded-2xl ring-4 ring-dark-700 flex items-center justify-center">
                <UserCircle className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="flex-1 pb-1">
              <h1 className="text-3xl font-bold text-white mb-1">{user.display_name || user.username}</h1>
              <p className="text-gray-400">@{user.username}</p>
            </div>
            {user.discord_id && (
              <a
                href={`https://discord.com/users/${user.discord_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#5865f2]/10 hover:bg-[#5865f2]/20 border border-[#5865f2]/30 text-[#5865f2] rounded-xl transition-all text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Discord Profile
              </a>
            )}
          </div>

          {/* Role & Level Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {user.staff_group && user.staff_group !== 'USER' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${roleBadgeColors[user.staff_group] || roleBadgeColors.USER}`}
              >
                <Shield className="w-4 h-4" />
                {user.staff_role || user.staff_group}
              </motion.span>
            )}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-xl text-sm font-semibold"
            >
              <Award className="w-4 h-4" />
              Level {user.level}
            </motion.span>
            {user.steam_id && (
              <a
                href={`https://steamcommunity.com/profiles/${user.steam_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark-600 hover:bg-dark-500 border border-white/10 text-gray-300 rounded-xl transition-all text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Steam Profile
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-accent-blue" />
            Account Info
          </h2>
          <div className="space-y-3">
            <InfoRow label="Discord ID" value={user.discord_id} />
            <InfoRow label="Username" value={user.username} />
            {user.email && <InfoRow label="Email" value={user.email} />}
            {user.steam_id && <InfoRow label="SteamID" value={user.steam_id} mono />}
            {user.last_login && (
              <InfoRow
                label="Last Login"
                value={new Date(user.last_login).toLocaleString('ru-RU')}
              />
            )}
          </div>
        </motion.div>

        {/* Discord Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-purple" />
            Discord Roles
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.guild_roles && user.guild_roles.length > 0 ? (
              user.guild_roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 bg-dark-600 border border-white/10 rounded-lg text-sm text-gray-300 font-mono"
                >
                  {role}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No Discord roles loaded</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Permissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-accent-cyan" />
          Your Permissions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(permissionLabels).map(([key, label]) => {
            const has = user.permissions?.includes(key) || user.permissions?.includes('staff.manage');
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  has
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-dark-800/50 border-white/5 opacity-50'
                }`}
              >
                {has ? (
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${has ? 'text-white' : 'text-gray-500'}`}>{label}</p>
                  <p className="text-xs text-gray-600 font-mono">{key}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm text-gray-300 ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}
