/**
 * База знань та верифіковані бенчмарки друкарень України
 * 
 * Дані сформовані на основі прямих витягів, офіційних рахунків (PDF), 
 * скріншотів та реальних запитів до калькуляторів друкарень.
 */

export interface CompetitorTierPrice {
  quantity: number;
  totalMinUah: number;
  totalMaxUah: number;
  unitMinUah: number;
  unitMaxUah: number;
  termStandardDays?: number;
  termUrgentDays?: number;
}

export interface CompetitorRecord {
  id: string;
  name: string;
  shortName: string;
  city: string;
  productionType: string;
  equipmentNote: string;
  verifiedSource: string;
  verifiedDate: string;
  configurations: {
    configId: string;
    description: string;
    format: string;
    totalBrochurePages: number;
    blockPages: number;
    coverPages: number;
    blockPaper: string;
    coverPaper: string;
    coverFinish: string;
    packaging: boolean;
    directUrl: string;
    hashOrToken?: string;
    tiers: CompetitorTierPrice[];
    technicalNotes: string;
  }[];
}

export const COMPETITOR_KNOWLEDGE_BASE: Record<string, CompetitorRecord> = {
  wolf: {
    id: 'wolf',
    name: 'Друкарня Вольф (Wolf.ua)',
    shortName: 'Wolf.ua',
    city: 'Київ',
    productionType: 'Збірний офсетний друк (Speedmaster B1/B2)',
    equipmentNote: 'Автоматизовані збірні офсетні спуски B1. Ціна залежить від терміну видачі (1-3 робочі дні).',
    verifiedSource: 'Офіційний конфігуратор digit-calc-saddle-stiched + AJAX API priceLoadDigital',
    verifiedDate: '2026-11-09',
    configurations: [
      {
        configId: 'wolf-a4-32p-total-no-pkg',
        description: 'Брошура А4 на скобу, 32 сторінки разом (28 блок + 4 обкладинка), без ПЕТ-упаковки',
        format: 'A4',
        totalBrochurePages: 32,
        blockPages: 28,
        coverPages: 4,
        blockPaper: 'Офсетний 80 г/м², 4+4',
        coverPaper: 'Крейдований 250 г/м², 4+4',
        coverFinish: 'Матова ламінація 1+0 (25 мкм)',
        packaging: false,
        directUrl: 'https://wolf.ua/uk/digit-calc-saddle-stiched/?&params=NqBpz',
        hashOrToken: 'NqBpz',
        tiers: [
          { quantity: 50, totalMinUah: 8577, totalMaxUah: 8924, unitMinUah: 171.54, unitMaxUah: 178.48, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 100, totalMinUah: 17080, totalMaxUah: 17774, unitMinUah: 170.80, unitMaxUah: 177.74, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 200, totalMinUah: 26453, totalMaxUah: 27107, unitMinUah: 132.27, unitMaxUah: 135.54, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 500, totalMinUah: 47291, totalMaxUah: 48536, unitMinUah: 94.58, unitMaxUah: 97.07, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 1000, totalMinUah: 62721, totalMaxUah: 63943, unitMinUah: 62.72, unitMaxUah: 63.94, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 2500, totalMinUah: 98470, totalMaxUah: 100351, unitMinUah: 39.39, unitMaxUah: 40.14, termStandardDays: 3, termUrgentDays: 1 },
        ],
        technicalNotes: 'У Вольфа параметр "32 сторінки" в заголовку означає загальний обсяг брошури: 28 стор. блоку (7 розворотів) + 4 стор. обкладинки. Розраховано без упаковки в термозбіжну ПЕТ-плівку.'
      },
      {
        configId: 'wolf-a4-32p-block-with-pkg',
        description: 'Брошура А4 на скобу, 32 сторінки БЛОКУ + 4 обкладинка (36 стор. разом), з ПЕТ-упаковкою',
        format: 'A4',
        totalBrochurePages: 36,
        blockPages: 32,
        coverPages: 4,
        blockPaper: 'Офсетний 80 г/м², 4+4',
        coverPaper: 'Крейдований 250 г/м², 4+4',
        coverFinish: 'Матова ламінація 1+0 (25 мкм)',
        packaging: true,
        directUrl: 'https://wolf.ua/uk/digit-calc-saddle-stiched/?&params=pYpLm',
        hashOrToken: 'pYpLm',
        tiers: [
          { quantity: 50, totalMinUah: 9714, totalMaxUah: 10104, unitMinUah: 194.28, unitMaxUah: 202.08, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 100, totalMinUah: 19352, totalMaxUah: 20126, unitMinUah: 193.52, unitMaxUah: 201.26, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 200, totalMinUah: 29447, totalMaxUah: 30147, unitMinUah: 147.24, unitMaxUah: 150.74, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 500, totalMinUah: 52832, totalMaxUah: 54158, unitMinUah: 105.66, unitMaxUah: 108.32, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 1000, totalMinUah: 70543, totalMaxUah: 71863, unitMinUah: 70.54, unitMaxUah: 71.86, termStandardDays: 3, termUrgentDays: 1 },
          { quantity: 2500, totalMinUah: 112869, totalMaxUah: 114908, unitMinUah: 45.15, unitMaxUah: 45.96, termStandardDays: 3, termUrgentDays: 1 },
        ],
        technicalNotes: 'Повна конфігурація: 8 повноцінних розворотів блоку (32 сторінки) + 4 сторінки окремої крейдованої обкладинки 250 г з ламінацією + увімкнена опція індивідуальної ПЕТ-упаковки в пачки.'
      }
    ]
  },
  printstore: {
    id: 'printstore',
    name: 'PrintStore Group',
    shortName: 'PrintStore Group',
    city: 'Київ',
    productionType: 'Комерційний офсет (Man Roland 74 / Heidelberg CD 102)',
    equipmentNote: 'Повноформатний офсетний друк журналів та каталогів. Розрахунок виконується клієнтським AJAX-скриптом catalog.js без збереження параметрів у URL GET.',
    verifiedSource: 'Офіційний Рахунок № 29336 (Info_order_29336.pdf) + повний HTML-код форми калькулятора catalog/',
    verifiedDate: '2026-11-11',
    configurations: [
      {
        configId: 'printstore-a4-32p-offset80-cover250',
        description: 'Журнал/каталог А4, 32 сторінки блоку офсет 80г (4+4) + обкладинка 4 стор 250г з матовою ламінацією, скоба',
        format: 'A4',
        totalBrochurePages: 36,
        blockPages: 32,
        coverPages: 4,
        blockPaper: 'Офсетний 80 г/м² (tippapmain=3, plotnmain=4), 4+4',
        coverPaper: 'Крейдований глянець 250 г/м² (tippapoblozh=1, plotnoblozh=11), 4+4',
        coverFinish: 'Матова ламінація 1+0 (otdelkaf=6, otdelkab=1)',
        packaging: true,
        directUrl: 'https://printstore.com.ua/on-lajn-kalkulyatory/catalog/',
        tiers: [
          { quantity: 100, totalMinUah: 22750, totalMaxUah: 23100, unitMinUah: 227.50, unitMaxUah: 231.00 },
          { quantity: 200, totalMinUah: 38670, totalMaxUah: 39150, unitMinUah: 193.35, unitMaxUah: 195.75 },
          { quantity: 500, totalMinUah: 43060, totalMaxUah: 43650, unitMinUah: 86.12, unitMaxUah: 87.30 },
          { quantity: 1000, totalMinUah: 52870, totalMaxUah: 53570, unitMinUah: 52.87, unitMaxUah: 53.57 }, // 52 870 ₴ (4+0 обкл) / 53 570 ₴ (4+4 обкл) — точний витяг з Рахунку № 29336
          { quantity: 2000, totalMinUah: 72470, totalMaxUah: 73500, unitMinUah: 36.24, unitMaxUah: 36.75 },
          { quantity: 3000, totalMinUah: 92080, totalMaxUah: 93200, unitMinUah: 30.69, unitMaxUah: 31.07 },
          { quantity: 5000, totalMinUah: 131300, totalMaxUah: 132800, unitMinUah: 26.26, unitMaxUah: 26.56 },
        ],
        technicalNotes: 'Верифіковано за офіційним файлом D:\\Info_order_29336.pdf (Замовлення № 29336 від PrintStore Group): наклад 1000 прим, 32 стор. блок 80г офсет 4+4, обкладинка 4 стор. глянець 250г 4+4, ламінація мат 1+0, скоба. Вага тиражу: 114 кг. Підсумкова вартість: рівно 53 570 грн (53.57 ₴/шт). Калькулятор PrintStore працює через WordPress/AJAX (catalog.js) і НЕ підставляє параметри з GET URL при відкритті сторінки — форму потрібно заповнювати вручну або передавати через POST.'
      }
    ]
  },
  artpress: {
    id: 'artpress',
    name: 'Арт-Прес (Art-Press)',
    shortName: 'Арт-Прес',
    city: 'Дніпро',
    productionType: 'Листовий офсетний друк (Heidelberg Speedmaster B1/B2)',
    equipmentNote: 'Спеціалізується на листовому друку та стандартизованих брошурах. Калькулятор підтримує лише брошури на матеріалі однієї щільності.',
    verifiedSource: 'Офіційний сайт art-press.com.ua/uk/products/magazine/ та API /api/web/costs/brochures/',
    verifiedDate: '2026-11-10',
    configurations: [
      {
        configId: 'artpress-a4-32p-uniform-offset80',
        description: 'Брошура А4 на скобу, 32 сторінки (8 листів), єдиний офсетний папір 80 г/м² 4+4 (без окремої цупкої обкладинки та без ламінації)',
        format: 'A4',
        totalBrochurePages: 32,
        blockPages: 32,
        coverPages: 0,
        blockPaper: 'Офсетний 80 г/м², 4+4',
        coverPaper: 'Такий же офсет 80 г/м² (самообкладинка)',
        coverFinish: 'Без ламінації',
        packaging: true,
        directUrl: 'https://art-press.com.ua/uk/products/brochures/format/a3-in-a4/',
        tiers: [
          { quantity: 100, totalMinUah: 25138, totalMaxUah: 25138, unitMinUah: 251.38, unitMaxUah: 251.38 },
          { quantity: 200, totalMinUah: 27648, totalMaxUah: 27648, unitMinUah: 138.24, unitMaxUah: 138.24 },
          { quantity: 500, totalMinUah: 32767, totalMaxUah: 32767, unitMinUah: 65.53, unitMaxUah: 65.53 },
          { quantity: 1000, totalMinUah: 41317, totalMaxUah: 41317, unitMinUah: 41.32, unitMaxUah: 41.32 },
          { quantity: 2000, totalMinUah: 58730, totalMaxUah: 58730, unitMinUah: 29.37, unitMaxUah: 29.37 },
          { quantity: 3000, totalMinUah: 75938, totalMaxUah: 75938, unitMinUah: 25.31, unitMaxUah: 25.31 },
          { quantity: 5000, totalMinUah: 111576, totalMaxUah: 111576, unitMinUah: 22.32, unitMaxUah: 22.32 },
        ],
        technicalNotes: 'Згідно з офіційною специфікацією калькулятора Арт-Прес: "Обкладинка та блок брошури друкуються на матеріалі однієї щільності". Онлайн-вибір комбінованих паперів (окремої цупкої обкладинки 250 г з ламінацією) відсутній. Повноцінний журнал розраховується лише індивідуально через пошту/менеджера.'
      }
    ]
  },
  poligrafika: {
    id: 'poligrafika',
    name: 'Поліграфіка (Poligrafika.com.ua)',
    shortName: 'Poligrafika.com.ua',
    city: 'Чернівці / Київ',
    productionType: 'Цифровий рулонний/листовий друк (Konica Minolta AccurioPress)',
    equipmentNote: 'Оперативний листовий цифровий друк поаркушно. Платформа Nuxt 3 / Web2Print (компонент A4: 8852, опція сторінок 59356).',
    verifiedSource: 'Повний витяг HTML /brosura-na-skobi та стан гідратації __NUXT_DATA__',
    verifiedDate: '2026-11-09',
    configurations: [
      {
        configId: 'poligrafika-a4-32p-offset80-cover200-lam',
        description: 'Брошура А4 на скобу, 32 сторінки блоку офсет 80г (364547, 4+4) + обкладинка крейда 200г (364449, 4+4) з односторонньою матовою ламінацією (364657)',
        format: 'A4',
        totalBrochurePages: 36,
        blockPages: 32,
        coverPages: 4,
        blockPaper: 'Офсетний 80 г/м² (id 364547), 4+4 (id 364430)',
        coverPaper: 'Крейдований 200 г/м² матовий (id 364449), 4+4 (id 364426)',
        coverFinish: 'Матова ламінація лицьова (id 364657)',
        packaging: true,
        directUrl: 'https://poligrafika.com.ua/uk/brosura-na-skobi?params[productComponentId]=8852&params[quantity]=1000&params[options][59356]=32&params[options][59357]=364426&params[options][59358]=364430&params[options][59359]=364449&params[options][59360]=364543&params[options][59361]=364547&params[options][59362]=364653&params[options][59363]=364654&params[options][59364]=364655&params[options][59365]=364657&params[options][59367]=364674&params[options][59368]=364679&params[options][59369]=364680&params[options][59370]=364681&params[options][59372]=364684&params[options][59375]=364693',
        tiers: [
          { quantity: 100, totalMinUah: 20660, totalMaxUah: 20660, unitMinUah: 206.60, unitMaxUah: 206.60, termStandardDays: 4, termUrgentDays: 2 },
          { quantity: 200, totalMinUah: 37620, totalMaxUah: 37620, unitMinUah: 188.10, unitMaxUah: 188.10, termStandardDays: 4, termUrgentDays: 2 },
          { quantity: 500, totalMinUah: 80840, totalMaxUah: 80840, unitMinUah: 161.68, unitMaxUah: 161.68, termStandardDays: 4, termUrgentDays: 2 },
          { quantity: 1000, totalMinUah: 131150, totalMaxUah: 131150, unitMinUah: 131.15, unitMaxUah: 131.15, termStandardDays: 4, termUrgentDays: 2 },
        ],
        technicalNotes: 'Повна відповідність скріншоту замовника: вартість 131 150 грн (131.15 ₴/шт). Формула розрахунку: базова сітка (4 стор. = 27 070 грн) + 7 додаткових розворотів по 4 сторінки (7 × 13 563 грн = 94 941 грн) + вартість матової ламінації обкладинки 9 139 грн (9.14 ₴/примірник).'
      },
      {
        configId: 'poligrafika-a4-32p-offset80-cover200-no-lam',
        description: 'Брошура А4 на скобу, 32 сторінки блоку офсет 80г + обкладинка крейда 200г БЕЗ ламінації (params[options][59365]=0)',
        format: 'A4',
        totalBrochurePages: 36,
        blockPages: 32,
        coverPages: 4,
        blockPaper: 'Офсетний 80 г/м², 4+4',
        coverPaper: 'Крейдований 200 г/м² матовий, 4+4',
        coverFinish: 'Без ламінації (0)',
        packaging: true,
        directUrl: 'https://poligrafika.com.ua/uk/brosura-na-skobi?params[productComponentId]=8852&params[quantity]=1000&params[options][59356]=32&params[options][59357]=364426&params[options][59358]=364430&params[options][59359]=364449&params[options][59360]=364543&params[options][59361]=364547&params[options][59362]=364653&params[options][59363]=364654&params[options][59364]=364655&params[options][59365]=0&params[options][59367]=364674&params[options][59368]=364679&params[options][59369]=364680&params[options][59370]=364681&params[options][59372]=364684&params[options][59375]=364693',
        tiers: [
          { quantity: 100, totalMinUah: 19746, totalMaxUah: 19746, unitMinUah: 197.46, unitMaxUah: 197.46 },
          { quantity: 200, totalMinUah: 35792, totalMaxUah: 35792, unitMinUah: 178.96, unitMaxUah: 178.96 },
          { quantity: 500, totalMinUah: 76270, totalMaxUah: 76270, unitMinUah: 152.54, unitMaxUah: 152.54 },
          { quantity: 1000, totalMinUah: 122011, totalMaxUah: 122011, unitMinUah: 122.01, unitMaxUah: 122.01 },
        ],
        technicalNotes: 'Варіант без опції ламінації (економія 9 139 грн на 1000 шт).'
      }
    ]
  },
  gnozis: {
    id: 'gnozis',
    name: 'Гнозіс (Gnozis)',
    shortName: 'Гнозіс',
    city: 'Київ',
    productionType: 'Корпоративний повноформатний офсетний друк (B1/B2)',
    equipmentNote: 'Офсетні друкарські машини Heidelberg/Komori. Спеціалізація на брошурах та каталогах середніми та великими накладами (від 500 шт).',
    verifiedSource: 'Офіційний клієнтський калькулятор /uslugi/katalogi/#gn-calculator, AJAX get-config-data та скрипт CatalogStrategy',
    verifiedDate: '2026-11-11',
    configurations: [
      {
        configId: 'gnozis-a4-32p-offset80-cover250-binder-matted',
        description: 'Каталог А4, 32 сторінки офсет 80г (4+4) + обкладинка 4 стор 250г (4+4) з матовою ламінацією, кріплення біндер (КБС)',
        format: 'A4',
        totalBrochurePages: 36,
        blockPages: 32,
        coverPages: 4,
        blockPaper: 'Офсетний 80 г/м², 4+4',
        coverPaper: 'Крейдований 250 г/м², 4+4',
        coverFinish: 'Матова ламінація (matted: 2.40 грн/аркуш)',
        packaging: true,
        directUrl: 'https://gnozis.com.ua/uslugi/katalogi/#gn-calculator',
        tiers: [
          { quantity: 100, totalMinUah: 11930, totalMaxUah: 14402, unitMinUah: 119.30, unitMaxUah: 144.02 },
          { quantity: 200, totalMinUah: 12260, totalMaxUah: 15400, unitMinUah: 61.30, unitMaxUah: 77.00 },
          { quantity: 300, totalMinUah: 12590, totalMaxUah: 16500, unitMinUah: 41.97, unitMaxUah: 55.00 },
          { quantity: 500, totalMinUah: 13250, totalMaxUah: 18061, unitMinUah: 26.50, unitMaxUah: 36.12 },
          { quantity: 1000, totalMinUah: 14900, totalMaxUah: 22636, unitMinUah: 14.90, unitMaxUah: 22.64 },
          { quantity: 2000, totalMinUah: 18200, totalMaxUah: 31784, unitMinUah: 9.10, unitMaxUah: 15.89 },
          { quantity: 5000, totalMinUah: 28100, totalMaxUah: 59228, unitMinUah: 5.62, unitMaxUah: 11.85 },
        ],
        technicalNotes: 'Розраховано за формулою CatalogStrategy (jquery.pglight.js). Важливий технічний нюанс: у живому AJAX get-config-data поле вартості паперу в гривнях (uaPerTone) встановлено у 0 (ціна паперу $perTone зберігається у доларах $1080/т без конвертації). Через це онлайн-калькулятор на сайті рахує лише вартість роботи, форм, біндера та ламінації (totalMin = 14 900 ₴ за 1000 шт). При додаванні реальної вартості офсетного та крейдованого паперу (~45 грн/кг) вартість становить 22 636 ₴ (22.64 грн/шт).'
      },
      {
        configId: 'gnozis-a4-64p-offset80-cover250-binder',
        description: 'Каталог А4, 64 сторінки офсет 80г 4+0, обкладинка крейда 250г 4+0, біндер, 500 шт.',
        format: 'A4',
        totalBrochurePages: 64,
        blockPages: 64,
        coverPages: 4,
        blockPaper: 'Офсетний 80 г/м², 4+0',
        coverPaper: 'Крейдований 250 г/м², 4+0',
        coverFinish: 'Без ламінації',
        packaging: true,
        directUrl: 'https://gnozis.com.ua/uslugi/katalogi/#gn-calculator',
        tiers: [
          { quantity: 500, totalMinUah: 14575, totalMaxUah: 14575, unitMinUah: 29.15, unitMaxUah: 29.15 },
        ],
        technicalNotes: 'Точний збіг зі скріншотом замовлення: вага 112 кг, ціна 14 575 грн (29.15 грн/екз).'
      }
    ]
  },
  printto: {
    id: 'printto',
    name: 'Прінтто (Printto.ua)',
    shortName: 'Printto.ua',
    city: 'Київ',
    productionType: 'Цифровий лазерний та струменевий друк Print-on-Demand',
    equipmentNote: 'Промислові повноколірні цифрові друкарські системи. Спеціалізація на малих накладах журналів та книг від 1 до 200 шт.',
    verifiedSource: 'Офіційний POST API https://printto.ua/prices (форма form-prices)',
    verifiedDate: '2026-11-11',
    configurations: [
      {
        configId: 'printto-a4-32p-laser-color-saddle',
        description: 'Журнал А4, 32 сторінки, кольоровий лазерний друк (block_color=3), офсет 80г, скоба (mounting=1), глянець/мат ламінація',
        format: 'A4',
        totalBrochurePages: 36,
        blockPages: 32,
        coverPages: 4,
        blockPaper: 'Офсетний 80 г/м² (block_paper=1), колір лазерний 4+4',
        coverPaper: 'Крейдований 250 г/м²',
        coverFinish: 'Глянцева ламінація (входить у вартість) або матова (+15 грн/шт)',
        packaging: true,
        directUrl: 'https://printto.ua/services/printing-magazines',
        tiers: [
          { quantity: 1, totalMinUah: 334, totalMaxUah: 349, unitMinUah: 334.00, unitMaxUah: 349.00 },
          { quantity: 2, totalMinUah: 512, totalMaxUah: 542, unitMinUah: 256.00, unitMaxUah: 271.00 },
          { quantity: 5, totalMinUah: 1060, totalMaxUah: 1135, unitMinUah: 212.00, unitMaxUah: 227.00 },
          { quantity: 10, totalMinUah: 2010, totalMaxUah: 2160, unitMinUah: 201.00, unitMaxUah: 216.00 },
          { quantity: 20, totalMinUah: 3620, totalMaxUah: 3920, unitMinUah: 181.00, unitMaxUah: 196.00 },
          { quantity: 50, totalMinUah: 8450, totalMaxUah: 9200, unitMinUah: 169.00, unitMaxUah: 184.00 },
          { quantity: 100, totalMinUah: 16200, totalMaxUah: 17700, unitMinUah: 162.00, unitMaxUah: 177.00 },
          { quantity: 200, totalMinUah: 30200, totalMaxUah: 33200, unitMinUah: 151.00, unitMaxUah: 166.00 },
          { quantity: 500, totalMinUah: 75500, totalMaxUah: 83000, unitMinUah: 151.00, unitMaxUah: 166.00 },
          { quantity: 1000, totalMinUah: 151000, totalMaxUah: 166000, unitMinUah: 151.00, unitMaxUah: 166.00 },
        ],
        technicalNotes: 'Розраховано через офіційний ендпоінт POST /prices. Глянцева ламінація обкладинки включена у базову ціну, матова ламінація становить +15 грн/примірник. Автоматична знижка прогресує до 200 шт (знижка сягає 55%, ціна 151 грн/шт). Понад 200 примірників алгоритм онлайн-калькулятора зупиняється на 151 грн/шт, а виробник рекомендує індивідуальне звернення до менеджерів.'
      }
    ]
  }
};
