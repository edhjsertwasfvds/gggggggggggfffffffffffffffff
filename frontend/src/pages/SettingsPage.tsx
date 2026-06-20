import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const themes = [
  { id: 'dark', label: 'Тёмная', color: '#0c0e14' },
  { id: 'midnight', label: 'Midnight', color: '#0a0f1a' },
  { id: 'indigo', label: 'Indigo', color: '#0e0a1a' },
  { id: 'emerald', label: 'Emerald', color: '#0a1a0e' },
  { id: 'crimson', label: 'Crimson', color: '#1a0a0e' },
  { id: 'graphite', label: 'Graphite', color: '#141414' },
];

const animations = [
  { id: 'off', label: 'Выкл' },
  { id: 'soft', label: 'Мягкие' },
  { id: 'full', label: 'Полные' },
];

const scrollModes = [
  { id: 'off', label: 'Выкл' },
  { id: 'standard', label: 'Стандарт' },
  { id: 'smooth', label: 'Плавный' },
];

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [anim, setAnim] = useState('full');
  const [scroll, setScroll] = useState('standard');

  const handleSave = () => {
    localStorage.setItem('fearviewer_settings', JSON.stringify({ theme, anim, scroll }));
  };

  const handleReset = () => {
    setTheme('dark');
    setAnim('full');
    setScroll('standard');
  };

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold text-white">Локальные настройки</h1>
        </motion.div>
        <Link
          to="/players"
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] hover:bg-[#222840] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#12151e] rounded-xl border border-white/5 p-6"
      >
        {/* Theme */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-400" />
            Тема
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  theme === t.id
                    ? 'bg-[#1a1f2e] text-white border-blue-500/30'
                    : 'bg-[#0c0e14] text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: t.color }}
                />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animations */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Анимации
          </h3>
          <div className="flex gap-2">
            {animations.map(a => (
              <button
                key={a.id}
                onClick={() => setAnim(a.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  anim === a.id
                    ? 'bg-[#1a1f2e] text-white border-blue-500/30'
                    : 'bg-[#0c0e14] text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            Плавный скролл
          </h3>
          <div className="flex gap-2">
            {scrollModes.map(s => (
              <button
                key={s.id}
                onClick={() => setScroll(s.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  scroll === s.id
                    ? 'bg-[#1a1f2e] text-white border-blue-500/30'
                    : 'bg-[#0c0e14] text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-[#1a1f2e] hover:bg-[#222840] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
          >
            Сбросить
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4f7cff] hover:bg-[#3d6aff] text-white text-sm font-medium rounded-xl transition-all"
          >
            Сохранить
          </button>
        </div>
      </motion.div>
    </div>
  );
}
