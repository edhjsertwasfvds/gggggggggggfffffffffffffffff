import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: 'ОБЩИЕ',
    items: [
      {
        q: 'Почему иногда «прыгают» данные или обновляется список игроков?',
        a: 'Клиент держит постоянное WebSocket-соединение и периодически запрашивает свежие данные. Если соединение обрывается, оно переподключается и повторно запрашивает статистику. Теперь стоит экспоненциальный реконнект, поэтому переподключения происходят реже и мягче.',
      },
      {
        q: 'Что означают уровни доступа 1-5?',
        a: '1-2 — просмотр, 3 — работа с whitelist и логами, 4 — админ-панель и настройки, 5 — суперадмин (сброс пользователей, инвайт-коды и т.п.). Конкретные права заданы на API, интерфейс их только отображает.',
      },
      {
        q: 'Почему некоторые данные загружаются не сразу?',
        a: 'Часть данных приходит отдельными пакетами: возраст аккаунта, Faceit-уровень, репорты и некоторые внешние проверки. Поэтому список сначала может открыться быстро, а细节 подтянутся через долю секунды.',
      },
    ],
  },
  {
    title: 'ВКЛАДКА «ИГРОКИ»',
    items: [
      {
        q: 'Что делает кнопка «Фильтры»?',
        a: 'Она открывает компактное меню со всеми настройками отбора игроков: шаблоны, скрытие, свои фильтры и сохранённые наборы. Меню закрывается по клику вне него или по клавише Esc.',
      },
      {
        q: 'Что такое шаблоны 3 / 2 / 1 уровень?',
        a: 'Это готовые пресеты. Они сразу выставляют несколько параметров: ограничение по Faceit, минимум по репортам, скрытие игроков без флагов и для самого жёсткого варианта, показ «нулевых» профилей. Чем меньше номер, тем строже отбор.',
      },
      {
        q: 'Как работает блок «Скрытие»?',
        a: 'Поля Faceit ≥ / ≤, репорты и «Без флагов» относятся именно к блоку скрытия. Эти параметры применяются только когда активирован переключатель «Скрытие вкл».',
      },
      {
        q: 'Что значит фильтр «Нулевые»?',
        a: 'Это отдельный фильтр, не зависящий от блока скрытия. Он оставляет только ненастроенные профили: пустые или с дефолтной аватаркой, где профиль выглядит «сырым» или почти не оформленным.',
      },
      {
        q: 'Что такое «Свои фильтры»?',
        a: 'Это ручной отбор по игровым цифрам: K/D, килы и смерти. Они нужны, когда хочется убрать шум и показать только нестандартные профили с нестандартной статистикой.',
      },
      {
        q: 'Как сохранить свои настройки фильтров?',
        a: 'В поле «Название набора» введи имя и нажми «Сохранить». Набор появится ниже и будет храниться в браузере. Его можно применить одной кнопкой или удалить крестиком.',
      },
    ],
  },
  {
    title: 'ПРОВЕРКА',
    items: [
      {
        q: 'Как работает проверка SteamID?',
        a: 'Введите SteamID в поле и нажмите «Проверить». Система запросит данные из Steam API и FearSearch, покажет профиль, статистику, баны и другую информацию.',
      },
      {
        q: 'Какие данные показываются при проверке?',
        a: 'Имя, аватар, онлайн-статус, сервер, K/D, уровень Steam, количество друзей, приватность профиля, баны (VAC, GAME, Fear) и комментарии.',
      },
    ],
  },
  {
    title: 'НАКАЗАНИЯ',
    items: [
      {
        q: 'Как посмотреть наказания?',
        a: 'Введите SteamID админа или игрока в поле поиска и нажмите «Обновить». Появится таблица со всеми наказаниями за выбранный период.',
      },
      {
        q: 'Что означают статусы наказаний?',
        a: '«Активно» — наказание действует. «Истекло» — срок истёк. «Разбан» — снятие бана.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold text-white">FAQ по Fear Project Viewer</h1>
          <p className="text-sm text-gray-500 mt-1">Краткие ответы для стаффа и администраторов</p>
        </motion.div>
        <Link
          to="/players"
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] hover:bg-[#222840] border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад на главную
        </Link>
      </div>

      {/* FAQ Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#12151e] rounded-xl border border-white/5 p-6"
      >
        {faqData.map((section, si) => (
          <div key={section.title} className={si > 0 ? 'mt-8' : ''}>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item, ii) => {
                const id = `${si}-${ii}`;
                const isOpen = openIndex === id;
                return (
                  <div key={id} className="border border-white/5 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggle(id)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#161a25] transition-colors"
                    >
                      <HelpCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors ${isOpen ? 'text-blue-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-semibold flex-1 ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                        {item.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 mt-0.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pl-12">
                            <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
