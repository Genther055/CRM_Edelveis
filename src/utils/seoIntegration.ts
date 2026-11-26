/**
 * SEO Integration Module for Offset Magazine Printing
 * Друкарня «Едельвейс і К» — Офсетний друк журналів
 * 
 * Забезпечує:
 * 1. Синхронізацію URL-шляху (/offset/magazines) через HTML5 History API & popstate
 * 2. Динамічне оновлення <title>, <meta description>, <meta keywords>, <link canonical>
 * 3. Open Graph (og:title, og:description, og:url, og:image, og:type) та Twitter Cards
 * 4. Мікророзмітку Schema.org (JSON-LD): Service, Product, AggregateOffer, BreadcrumbList, FAQPage
 * 5. Підтримку резервних шляхів (Hash та Query params) для будь-яких статичних хостингів
 */

export interface MagazineSeoCalcProps {
  format?: string;
  pages?: number;
  quantity?: number;
  binding?: string;
  unitPrice?: number;
  finalPrice?: number;
  totalCost?: number;
  paperName?: string;
}

export const OFFSET_MAGAZINES_PATH = '/offset/magazines';
export const OFFSET_MAGAZINES_ALIASES = [
  '/offset/magazines',
  '/offset/zhurnaly',
  '/druk-zhurnaliv-offset',
  '/offset-magazines'
];

/**
 * Перевіряє, чи поточний URL відповідає шляху журналів на офсеті
 */
export function isOffsetMagazinesRoute(): boolean {
  if (typeof window === 'undefined') return false;

  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase().replace(/^#/, '').replace(/\/+$/, '');
  const searchParams = new URLSearchParams(window.location.search);
  const pathParam = searchParams.get('path')?.toLowerCase();
  const productParam = searchParams.get('product')?.toLowerCase();
  const subtabParam = searchParams.get('subtab')?.toLowerCase();

  // 1. Перевірка прямого pathname
  if (OFFSET_MAGAZINES_ALIASES.some(alias => pathname === alias || pathname.endsWith(alias))) {
    return true;
  }

  // 2. Перевірка hash (#/offset/magazines)
  if (OFFSET_MAGAZINES_ALIASES.some(alias => hash === alias || hash.includes('magazines'))) {
    return true;
  }

  // 3. Перевірка query параметрів (?path=/offset/magazines або ?subtab=magazines)
  if (pathParam && OFFSET_MAGAZINES_ALIASES.some(alias => pathParam.includes(alias))) {
    return true;
  }
  if (productParam === 'magazines' || productParam === 'offset-magazines') {
    return true;
  }
  if (subtabParam === 'magazines') {
    return true;
  }

  return false;
}

/**
 * Синхронізує URL браузера з поточним табом (шлях для журналів на офсеті)
 */
export function syncRouteWithBrowser(isMagazines: boolean, replace = false): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  if (isMagazines) {
    if (!OFFSET_MAGAZINES_ALIASES.some(alias => currentPath.endsWith(alias))) {
      const newUrl = `${OFFSET_MAGAZINES_PATH}${window.location.search}${window.location.hash}`;
      try {
        if (replace) {
          window.history.replaceState({ tab: 'offset', subTab: 'magazines' }, '', newUrl);
        } else {
          window.history.pushState({ tab: 'offset', subTab: 'magazines' }, '', newUrl);
        }
      } catch {
        // Fallback для середовищ із обмеженнями History API (iframe/sandbox)
        searchParams.set('subtab', 'magazines');
        window.history.replaceState(null, '', `?${searchParams.toString()}`);
      }
    }
  } else {
    // Якщо користувач перейшов на інший таб, очищуємо шлях журналів
    if (OFFSET_MAGAZINES_ALIASES.some(alias => currentPath.endsWith(alias))) {
      const fallbackPath = '/';
      try {
        window.history.pushState({ tab: 'overview' }, '', fallbackPath);
      } catch {
        // ігноруємо
      }
    }
  }
}

/**
 * Оновлює або створює meta-тег у <head>
 */
function setMetaTag(selector: string, attr: string, attrVal: string, content: string): void {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Оновлює або створює canonical link у <head>
 */
function setCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Встановлює повний комплекс SEO мета-тегів та JSON-LD мікророзмітки для шляху журналів на офсеті
 */
export function applyOffsetMagazinesSEO(calc?: MagazineSeoCalcProps): void {
  if (typeof document === 'undefined') return;

  const fmt = calc?.format || 'А4';
  const qty = calc?.quantity ? calc.quantity.toLocaleString('uk-UA') : '1 000';
  const pages = calc?.pages || 32;
  const unitPriceStr = calc?.unitPrice ? `${calc.unitPrice.toFixed(2)} ₴` : '28,91 ₴';
  const finalPriceStr = calc?.finalPrice ? `${calc.finalPrice.toLocaleString('uk-UA')} ₴` : '28 913 ₴';

  // 1. Page Title (оптимізовано під запити: друк журналів офсетом, офсетний друк журналів київ)
  document.title = `Офсетний друк журналів ${fmt} (Київ, Вінниця, Україна) — Ціна від ${unitPriceStr} | Друкарня «Едельвейс і К»`;

  // 2. Meta Description
  const metaDesc = `Професійний офсетний друк журналів та каталогів формату ${fmt} (${pages} сторінок, наклад ${qty} шт) за ${finalPriceStr} (${unitPriceStr}/од). Розрахунок собівартості по зошитах B2/B1 на Heidelberg, CTP-форми, ламінація, скоба та КБС. Онлайн-калькулятор та порівняння цін із провідними друкарнями України.`;
  setMetaTag('meta[name="description"]', 'name', 'description', metaDesc);

  // 3. Meta Keywords
  const metaKeywords = 'друк журналів офсетом, офсетний друк журналів, друк журналів київ, друк журналів вінниця, офсетні журнали ціна, калькулятор друку журналів, журнали на скобу, глянцеві журнали офсет, друк періодики, друкарня едельвейс';
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', metaKeywords);

  // 4. Robots
  setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  // 5. Canonical
  const canonicalUrl = 'https://edelweiss.ua/offset/magazines';
  setCanonicalLink(canonicalUrl);

  // 6. Open Graph (Facebook, Telegram, Viber, LinkedIn)
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', `Офсетний друк журналів ${fmt} — Калькулятор тиражу | Едельвейс і К`);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDesc);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'product');
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Друкарня «Едельвейс і К»');
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'uk_UA');

  // 7. Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', `Офсетний друк журналів ${fmt} — Друкарня «Едельвейс і К»`);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDesc);

  // 8. Schema.org JSON-LD Structured Data
  updateOffsetMagazinesJsonLd(calc);
}

/**
 * Генерує та впроваджує структуровані мікродані Schema.org (JSON-LD)
 */
function updateOffsetMagazinesJsonLd(calc?: MagazineSeoCalcProps): void {
  const scriptId = 'schema-offset-magazines';
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = scriptId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const fmt = calc?.format || 'А4';
  const price = calc?.finalPrice || 28913;
  const unitPrice = calc?.unitPrice || 28.91;

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Послуга / Продукт (Product & Service)
      {
        '@type': 'Product',
        '@id': 'https://edelweiss.ua/offset/magazines#product',
        'name': `Офсетний друк журналів та періодичних видань ${fmt}`,
        'description': `Професійне виготовлення та листовий офсетний друк журналів, каталогів і періодики форматів А4 та А5 на німецькому обладнанні Heidelberg. Повноколірний друк 4+4, розкладка на зошити (сигнатури), скріплення на 2 скоби або термоклей (КБС), захисна ламінація обкладинки.`,
        'category': 'Поліграфічні послуги / Офсетний друк',
        'image': 'https://edelweiss.ua/assets/magazine-offset.jpg',
        'brand': {
          '@type': 'Brand',
          'name': 'Едельвейс і К'
        },
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'UAH',
          'lowPrice': unitPrice,
          'highPrice': price,
          'offerCount': calc?.quantity || 1000,
          'priceValidUntil': '2027-12-31',
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'PrintingService',
            'name': 'Друкарня «Едельвейс і К»',
            'url': 'https://edelweiss.ua',
            'telephone': '+38 (0432) 65-55-55',
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'Вінниця',
              'addressRegion': 'Вінницька область',
              'addressCountry': 'UA'
            }
          }
        }
      },
      // 2. Хлібні крихти (BreadcrumbList)
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://edelweiss.ua/offset/magazines#breadcrumb',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Головна',
            'item': 'https://edelweiss.ua/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Офсетний друк',
            'item': 'https://edelweiss.ua/offset'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Журнали (Офсет)',
            'item': 'https://edelweiss.ua/offset/magazines'
          }
        ]
      },
      // 3. Часті запитання (FAQPage)
      {
        '@type': 'FAQPage',
        '@id': 'https://edelweiss.ua/offset/magazines#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Від якого накладу вигідно замовляти офсетний друк журналів?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Офсетний друк журналів стає економічно вигіднішим за цифровий починаючи від 200–300 примірників. На накладах від 500 до 1 000+ шт собівартість одного журналу суттєво знижується завдяки амортизації приладки офсетної машини та вартості CTP-форм.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Який папір найкраще обрати для внутрішнього блоку та обкладинки журналу?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Для блоку найпопулярнішим є крейдований глянцевий або матовий папір щільністю 80–115 г/м² (для тонких видань) або 130–150 г/м² (для іміджевих каталогів). Для обкладинки зазвичай обирають крейдований папір 200–250 г/м² із захисною ламінацією.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Які способи скріплення доступні для офсетних журналів?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Основні варіанти: металева скоба (2 скоби) — ідеально для журналів обсягом від 8 до 64–80 сторінок; або клейове безшвейне скріплення (КБС / термоклей) — для товстих каталогів і журналів від 48–60 сторінок.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Як формується собівартість у калькуляторі «Едельвейс і К»?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Розрахунок базується на прямих виробничих нормах: вага паперу в кг, кількість CTP-форм за зошитами B2/B1, листопрогони машин Heidelberg, захисна ламінація, листопідбір, шиття на автоматичній лінії Horizon та упакування в крафт-папір.'
            }
          }
        ]
      }
    ]
  };

  scriptEl.textContent = JSON.stringify(schemaData, null, 2);
}

/**
 * Відновлює базові налаштування мета-тегів при переході на інші сторінки
 */
export function restoreDefaultSEO(): void {
  if (typeof document === 'undefined') return;

  document.title = 'Поліграфічний калькулятор — Друкарня «Едельвейс і К»';
  setMetaTag(
    'meta[name="description"]',
    'name',
    'description',
    'Виробничий калькулятор вартості поліграфічної продукції: офсетний, цифровий та широкоформатний друк від друкарні «Едельвейс і К». Розрахунок собівартості та аналітика ринку.'
  );

  // Видаляємо специфічний JSON-LD
  const scriptEl = document.getElementById('schema-offset-magazines');
  if (scriptEl) {
    scriptEl.remove();
  }
}
