// SEO & Deep-Linking Router Utility for Polygraphy CRM (Edelveis)
// Allows sharing exact links to any module, calculator category, and product tab

export interface ParsedRoute {
  tab: string; // 'calculator' | 'dashboard' | 'clients' | 'warehouse' | ...
  category?: 'products' | 'offset' | 'digital' | 'wide' | 'roll' | 'films';
  subTab?: string; // 'overview' | 'sheets' | 'felling' | 'magazines' | 'multipage' | 'notebooks' | 'custom' | ...
  product?: string;
  params?: Record<string, string>;
}

// Map of tab IDs to SEO page titles and descriptions
const tabMetaMap: Record<string, { title: string; desc: string }> = {
  dashboard: {
    title: 'Робочий стіл | Поліграфія CRM',
    desc: 'Головна панель управління замовленнями, аналітика та швидкі дії'
  },
  calculator: {
    title: 'Поліграфічний калькулятор | Едельвейс Поліграфія',
    desc: 'Точний параметричний розрахунок вартості друку, матеріалів та технологічних операцій'
  },
  leads: {
    title: 'Запити та ліди | Поліграфія CRM',
    desc: 'Омніканальний вхідний потік звернень та воронка продажів'
  },
  clients: {
    title: 'База замовників 360° | Поліграфія CRM',
    desc: 'Реєстр контрагентів, історія взаєморозрахунків, баланси та договори'
  },
  employees: {
    title: 'Співробітники та персонал | Поліграфія CRM',
    desc: 'Картки працівників, розряди, допуски та виробіток'
  },
  designer: {
    title: 'Дизайн макетів та Prepress | Поліграфія CRM',
    desc: 'Префлайт валідація, спуск смуг та узгодження макетів'
  },
  pm: {
    title: 'Проджект менеджмент та KPI | Поліграфія CRM',
    desc: 'Контроль дедлайнів, завантаження команди та метрики ефективності'
  },
  deals: {
    title: 'Угоди та замовлення | Поліграфія CRM',
    desc: 'Канбан-дошка проходження тиражів від КП до відвантаження'
  },
  delivery: {
    title: 'Логістика та доставка | Поліграфія CRM',
    desc: 'Нова Пошта, кур\'єрська доставка та самовивіз готових тиражів'
  },
  warehouse: {
    title: 'Склад та матеріали | Поліграфія CRM',
    desc: 'Номенклатурний облік паперу, фарб, пластин CTP та рух сировини'
  },
  production: {
    title: 'Виробництво та цехи | Поліграфія CRM',
    desc: 'Диспетчеризація верстатів B2, черга замовлень та змінні завдання'
  },
  tasks: {
    title: 'Завдання команди | Поліграфія CRM',
    desc: 'Щоденний таск-менеджер, SLA нормативи та чеклисти'
  },
  chats: {
    title: 'Чати та комунікація | Поліграфія CRM',
    desc: 'Внутрішнє обговорення замовлень та листування з клієнтами'
  },
  documents: {
    title: 'Документи та акти | Поліграфія CRM',
    desc: 'Автогенерація рахунків, накладних, специфікацій та сертифікатів'
  },
  finance: {
    title: 'BAS Бухгалтерія та фінанси | Поліграфія CRM',
    desc: 'План-фактна собівартість, маржинальність та банківські виписки'
  },
  triggers: {
    title: 'Автоматизація та тригери | Поліграфія CRM',
    desc: 'Конструктор бізнес-правил, автосповіщення та Telegram-боти'
  },
  settings: {
    title: 'Налаштування системи | Поліграфія CRM',
    desc: 'Параметри доступу, тарифи, прайси сировини та інтеграції'
  },
  profile: {
    title: 'Профіль користувача | Поліграфія CRM',
    desc: 'Налаштування облікового запису та персональні параметри'
  }
};

const calcSubMetaMap: Record<string, { title: string; desc: string }> = {
  magazines: {
    title: 'Калькулятор журналів та каталогів (Офсет) | Едельвейс',
    desc: 'Параметричний розрахунок журналів А4/А5 на скобу, термоклей PUR або нитку. Позошитний спуск B2, вартість 1С.'
  },
  sheets: {
    title: 'Листовий офсетний друк (Флаєри, листівки, візитки) | Калькулятор',
    desc: 'Розрахунок офсетного листового друку формату B2, папір 80-350г, ламінація, порізка.'
  },
  felling: {
    title: 'Висічна продукція (Папки, хенгери, коробочки) | Калькулятор',
    desc: 'Розрахунок друку з висічкою штампом, CTP-форми, приладка тигельного пресу.'
  },
  multipage: {
    title: 'Багатосторінкова продукція (Буклети, брошури) | Калькулятор',
    desc: 'Розрахунок брошур, євробуклетів та каталогів із фальцюванням та скріпленням.'
  },
  notebooks: {
    title: 'Блокноти на металеву пружину | Калькулятор',
    desc: 'Розрахунок корпоративних блокнотів А4/А5 з перфорацією та пружиною Wire-O.'
  },
  custom: {
    title: 'Власний прорахунок та спуск смуг | Калькулятор',
    desc: 'Гнучкий індивідуальний калькулятор зі спеціальними технічними параметрами.'
  },
  banner: {
    title: 'Широкоформатний друк банерів | Калькулятор',
    desc: 'Друк ламінованих та литих банерів Frontlit, люверси, проклейка підворотів.'
  },
  film: {
    title: 'Друк на самоклейній плівці Oracal / Ritrama | Калькулятор',
    desc: 'Широкоформатний друк на плівці, плотерна порізка та матова/глянцева ламінація.'
  },
  paper: {
    title: 'Широкоформатний друк постерів та афіш | Калькулятор',
    desc: 'Друк плакатів на папері Citylight та Blueback з високою роздільною здатністю.'
  }
};

/**
 * Parses current window.location into a structured ParsedRoute.
 * Supports:
 *  1. Path-based: /calculator/offset/magazines
 *  2. Search-params: /?tab=calculator&category=offset&sub=magazines
 *  3. Hash-based: #/calculator/offset/magazines
 */
export function parseCurrentRoute(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { tab: 'dashboard' };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#\/?/, '');
  const pathname = window.location.pathname.replace(/^\/|\/$/g, '');

  let tab = searchParams.get('tab') || '';
  let category = (searchParams.get('category') || searchParams.get('cat') || '') as any;
  let subTab = searchParams.get('sub') || searchParams.get('subTab') || searchParams.get('product') || '';

  // If path segments exist and no query tab specified
  const pathParts = pathname ? pathname.split('/') : (hash ? hash.split('/') : []);

  if (!tab && pathParts.length > 0 && pathParts[0]) {
    tab = pathParts[0].toLowerCase();
    if (tab === 'calc') tab = 'calculator';

    if (tab === 'calculator') {
      if (pathParts[1]) {
        const p1 = pathParts[1].toLowerCase();
        if (['products', 'offset', 'digital', 'wide', 'roll', 'films'].includes(p1)) {
          category = p1 as any;
          if (pathParts[2]) {
            subTab = pathParts[2].toLowerCase();
          }
        } else if (['magazines', 'sheets', 'felling', 'multipage', 'notebooks', 'custom'].includes(p1)) {
          // Shortcut: /calculator/magazines
          category = 'offset';
          subTab = p1;
        } else if (['banner', 'film', 'paper', 'canvas'].includes(p1)) {
          category = 'wide';
          subTab = p1;
        }
      }
    }
  }

  // Fallback defaults
  if (!tab || tab === 'index.html' || tab === 'index') {
    tab = 'dashboard';
  }

  // Extra query params
  const extraParams: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    if (!['tab', 'category', 'cat', 'sub', 'subTab', 'product'].includes(key)) {
      extraParams[key] = val;
    }
  });

  return {
    tab,
    category: category || undefined,
    subTab: subTab || undefined,
    params: Object.keys(extraParams).length > 0 ? extraParams : undefined
  };
}

/**
 * Builds a clean canonical URL for a given route.
 */
export function buildRouteUrl(route: Partial<ParsedRoute>): string {
  const tab = route.tab || 'dashboard';

  let path = '/';
  if (tab !== 'dashboard') {
    path = `/${tab}`;
    if (tab === 'calculator' && route.category && route.category !== 'products') {
      path += `/${route.category}`;
      if (route.subTab && route.subTab !== 'overview') {
        path += `/${route.subTab}`;
      }
    }
  }

  // If there are extra calculation params (e.g. format, pages, qty)
  const searchParams = new URLSearchParams();
  if (route.params) {
    Object.entries(route.params).forEach(([k, v]) => {
      if (v) searchParams.set(k, v);
    });
  }

  const queryStr = searchParams.toString();
  return queryStr ? `${path}?${queryStr}` : path;
}

/**
 * Updates the browser address bar, document title, and SEO meta tags
 * without reloading the page.
 */
export function syncRouteUrl(route: Partial<ParsedRoute>, replace: boolean = false): void {
  if (typeof window === 'undefined') return;

  const targetUrl = buildRouteUrl(route);
  const currentFullUrl = window.location.pathname + window.location.search;

  if (targetUrl !== currentFullUrl) {
    if (replace) {
      window.history.replaceState({ ...route }, '', targetUrl);
    } else {
      window.history.pushState({ ...route }, '', targetUrl);
    }
  }

  // Update Page Title and Meta Tags
  updateDocumentMeta(route);
}

/**
 * Updates browser tab title and dynamic meta tags for SEO and link previews.
 */
export function updateDocumentMeta(route: Partial<ParsedRoute>): void {
  if (typeof document === 'undefined') return;

  let title = 'Поліграфія CRM | Едельвейс і К';
  let desc = 'Професійна автоматизована ERP/MIS система для друкарні: калькуляція, склад, виробництво, логістика.';

  if (route.tab === 'calculator') {
    if (route.subTab && calcSubMetaMap[route.subTab]) {
      title = calcSubMetaMap[route.subTab].title;
      desc = calcSubMetaMap[route.subTab].desc;
    } else if (route.category === 'offset') {
      title = 'Офсетний друк (B2/B1) | Калькулятор | Едельвейс';
      desc = 'Розрахунок офсетних тиражів: журнали, каталоги, флаєри, папки, блокноти з урахуванням вартості CTP та паперу.';
    } else if (route.category === 'digital') {
      title = 'Цифровий оперативний друк (SRA3) | Калькулятор';
      desc = 'Терміновий цифровий друк малотиражної продукції, наліпок та меню.';
    } else if (route.category === 'wide') {
      title = 'Широкоформатний та інтер\'єрний друк | Калькулятор';
      desc = 'Друк банерів, плівок, постерів, полотен та табличок.';
    } else if (route.category === 'roll') {
      title = 'Рулонний друк етикеток та стікерів | Калькулятор';
      desc = 'Флексодрук рулонної самоклейки, висічні ножі, намотка в бобіни.';
    } else {
      title = tabMetaMap.calculator.title;
      desc = tabMetaMap.calculator.desc;
    }
  } else if (route.tab && tabMetaMap[route.tab]) {
    title = tabMetaMap[route.tab].title;
    desc = tabMetaMap[route.tab].desc;
  }

  document.title = title;

  // Update or create meta tags
  setMetaTag('description', desc);
  setMetaTag('og:title', title);
  setMetaTag('og:description', desc);
  setMetaTag('og:url', window.location.href);
}

function setMetaTag(nameOrProp: string, content: string): void {
  const isOg = nameOrProp.startsWith('og:');
  const attr = isOg ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Copies the current full direct link to clipboard and returns success boolean.
 */
export async function copyDirectLink(): Promise<{ success: boolean; url: string }> {
  if (typeof window === 'undefined') {
    return { success: false, url: '' };
  }

  const url = window.location.href;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return { success: true, url };
    }
  } catch (err) {
    console.warn('Clipboard writeText failed, trying fallback...', err);
  }

  // Fallback using textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success: successful, url };
  } catch (err) {
    console.error('Fallback clipboard copy failed', err);
    return { success: false, url };
  }
}
