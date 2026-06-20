import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Shield, Zap, Lock, Eye } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  const features = [
    { icon: Shield, title: 'Staff Management', desc: 'Управление персоналом и ролями' },
    { icon: Eye, title: 'Monitoring', desc: 'Мониторинг игроков в реальном времени' },
    { icon: Lock, title: 'Access Control', desc: 'Система прав и разрешений' },
    { icon: Zap, title: 'Real-time', desc: 'Обновления без перезагрузки' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[128px] animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-blue/20"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Fear<span className="gradient-text">Search</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-md mx-auto">
            Панель управления стаффом для CS2 проекта
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-8 max-w-md mx-auto mb-12"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Вход в панель</h2>
            <p className="text-gray-400 text-sm">
              Авторизуйтесь через Discord для доступа к панели стаффа
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(88, 101, 242, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#5865f2]/20"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561 19.9312 19.9312 0 005.9932 3.0294.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286 19.8975 19.8975 0 006.0022-3.0294.0771.0771 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            Войти через Discord
          </motion.button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Только для участников Discord сервера FearSearch
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card p-4 text-center"
            >
              <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 text-accent-blue" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
