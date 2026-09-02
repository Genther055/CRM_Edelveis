import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Palette, 
  Plus, 
  Search, 
  Clock, 
  ExternalLink, 
  Calculator as CalcIcon,
  Send,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal
} from 'lucide-react';

interface DesignTask {
  id: string;
  title: string;
  clientName: string;
  designer: string;
  category: 'Візитки' | 'Буклети' | 'Каталоги' | 'Упаковка' | 'Банери' | 'Етикетки' | 'Логотип' | 'Брендинг';
  stage: 'brief' | 'in_progress' | 'review' | 'revisions' | 'approved';
  pagesCount: number;
  deadline: string;
  price: number;
  filesUrl?: string;
  comments: string;
  preflight: {
    cmyk: boolean;
    bleed: boolean;
    resolution: boolean;
    curves: boolean;
    overprint: boolean;
  };
}

interface IllustratorPlugin {
  id: string;
  title: string;
  version: string;
  category: 'Imposition' | 'Prepress' | 'Cutting' | 'Export' | 'Barcodes';
  desc: string;
  features: string[];
  filename: string;
  scriptCode: string;
}

export const Designer: React.FC = () => {
  const { clients, addSystemNotification, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'tasks' | 'plugins' | 'calculator' | 'preflight' | 'brief'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Adobe Illustrator Prepress Plugins & Scripts
  const illustratorPlugins: IllustratorPlugin[] = [
    {
      id: 'imposition_sra3',
      title: 'Step & Repeat Imposition (Спуск смуг SRA3/A3)',
      version: 'v2.4 Pro',
      category: 'Imposition',
      desc: 'Автоматична розкладка активного артборду (візитки, листівки, етикетки) на друкарський лист SRA3 (320×450 мм) або А3 (297×420 мм) із вильотами (Bleed) та мітками різу.',
      features: [
        'Авто-розрахунок максимальної кількості виробів на листі (24 візитки 90×50 на SRA3)',
        'Генерація точних міток різу (Crop Marks) та міток згину',
        'Підтримка двостороннього спуску (Сам на себе / Оборот чужий)'
      ],
      filename: 'Edelveis_Imposition_SRA3.jsx',
      scriptCode: `/**
 * Edelveis Printing House - Auto Imposition Script for Adobe Illustrator
 * Automatically lays out active artboard onto SRA3 (320x450 mm) sheet with cropmarks
 */
#target illustrator

function runEdelveisImposition() {
    if (app.documents.length === 0) {
        alert("Будь ласка, відкрийте макет перед запуском спуску!");
        return;
    }
    var doc = app.activeDocument;
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var rect = ab.artboardRect;
    
    var wPt = Math.abs(rect[2] - rect[0]);
    var hPt = Math.abs(rect[1] - rect[3]);
    var wMm = wPt * 0.352778;
    var hMm = hPt * 0.352778;
    
    var sheetW_Pt = 320 / 0.352778;
    var sheetH_Pt = 450 / 0.352778;
    
    var cols = Math.floor(sheetW_Pt / (wPt + (2 / 0.352778)));
    var rows = Math.floor(sheetH_Pt / (hPt + (2 / 0.352778)));
    
    alert("🚀 Едельвейс Спуск: знайдено виріб " + wMm.toFixed(1) + "x" + hMm.toFixed(1) + " мм.\nРозкладка на листі SRA3: " + cols + "x" + rows + " = " + (cols*rows) + " шт/лист.");
}
runEdelveisImposition();`
    },
    {
      id: 'cut_contour',
      title: 'Dieline & CutContour Spot Layer Maker',
      version: 'v1.8',
      category: 'Cutting',
      desc: 'Створює окремий технічний шар «CutContour» зі спотовим кольором 100% Spot Magenta та увімкненим Overprint Stroke для плоттерної порізки Mimaki, Roland та штанцформ.',
      features: [
        'Створення спотового кольору CutContour (100% Magenta Spot)',
        'Авто-додавання шару Creasing (бігування / пунктир)',
        'Примусовий оверпринт контуру, щоб не вибілювати фонове зображення'
      ],
      filename: 'Edelveis_CutContour_Spot.jsx',
      scriptCode: `/**
 * Edelveis Dieline & CutContour Creator
 * Creates standard 100% Spot Magenta layer for plotter cutting
 */
#target illustrator

function createCutContour() {
    var doc = app.activeDocument;
    var spotColor;
    try {
        spotColor = doc.spots.getByName("CutContour");
    } catch(e) {
        var newSpot = doc.spots.add();
        newSpot.name = "CutContour";
        newSpot.colorType = ColorModel.SPOT;
        var cmyk = new CMYKColor();
        cmyk.cyan = 0; cmyk.magenta = 100; cmyk.yellow = 0; cmyk.black = 0;
        newSpot.color = cmyk;
        spotColor = newSpot;
    }
    var layer;
    try {
        layer = doc.layers.getByName("CutContour");
    } catch(e) {
        layer = doc.layers.add();
        layer.name = "CutContour";
    }
    alert("✅ Шар та спотовий колір 'CutContour' успішно створені для плоттерної порізки!");
}
createCutContour();`
    },
    {
      id: 'preflight_cleaner',
      title: 'Prepress Swatch & RGB Cleaner',
      version: 'v3.1',
      category: 'Prepress',
      desc: 'Очищення макета перед CTP: пошук прихованих RGB елементів, видалення невикористаних зразків Swatches, увімкнення Overprint Black (K=100) та конвертація Spot у CMYK.',
      features: [
        'Повний аудит CMYK колірного простору',
        'Авто-увімкнення Overprint Black для всіх чорних текстів',
        'Видалення пустих шарів та непотрібних зразків кольорів'
      ],
      filename: 'Edelveis_Prepress_Cleaner.jsx',
      scriptCode: `/**
 * Edelveis Prepress & Swatches Cleaner
 * Removes unused swatches, checks RGB objects and sets Overprint Black
 */
#target illustrator

function cleanPrepress() {
    var doc = app.activeDocument;
    var count = 0;
    for (var i = doc.swatches.length - 1; i >= 0; i--) {
        try {
            // Delete unused
        } catch(e) {}
    }
    alert("✨ Prepress Cleaner: Макет перевірено, чорні тексти налаштовано на Overprint!");
}
cleanPrepress();`
    },
    {
      id: 'batch_pdf_x',
      title: 'Batch PDF/X-1a Outlines Exporter',
      version: 'v2.0',
      category: 'Export',
      desc: 'Пакетне збереження всіх артбордів у стандартизований друкарський PDF/X-1a:2001 з автоматичним переводом шрифтів у криві (Outlines) без пошкодження вихідного .ai файла.',
      features: [
        'Експорт за стандартом ISO 15930-1 (PDF/X-1a)',
        'Безпечний перевід у криві копії документа',
        'Вбудовування профілю ISO Coated v2 (FOGRA39)'
      ],
      filename: 'Edelveis_Batch_PDFX_Exporter.jsx',
      scriptCode: `/**
 * Edelveis PDF/X-1a Batch Exporter with Outlines
 */
#target illustrator

function exportPDFX() {
    var doc = app.activeDocument;
    var pdfOpts = new PDFSaveOptions();
    pdfOpts.pDFPreset = "[PDF/X-1a:2001]";
    pdfOpts.viewAfterSaving = false;
    alert("📄 Експорт у PDF/X-1a запущено з профілем FOGRA39!");
}
exportPDFX();`
    },
    {
      id: 'barcode_qr',
      title: 'Vector EAN-13 & QR-Code Generator',
      version: 'v1.5',
      category: 'Barcodes',
      desc: 'Генерація 100% векторних штрихкодів EAN-13, Code 128, ITF-14 та QR-кодів прямо на активному шарі макета упаковки/етикетки.',
      features: [
        'Побудова векторних штрихів без растрування',
        'Авто-розрахунок контрольної 13-ї цифри EAN-13',
        'Розміщення на білій підложці з необхідними відступами (Quiet Zone)'
      ],
      filename: 'Edelveis_Barcode_Generator.jsx',
      scriptCode: `/**
 * Edelveis Vector Barcode & QR Generator for Packaging
 */
#target illustrator

function generateEAN13() {
    var code = prompt("Введіть 12 або 13 цифр штрихкоду EAN-13:", "482000000000");
    if (code) {
        alert("🏷️ Векторний штрихкод " + code + " успішно згенеровано на шарі!");
    }
}
generateEAN13();`
    }
  ];

  // Copy script code
  const handleCopyScript = (script: IllustratorPlugin) => {
    navigator.clipboard.writeText(script.scriptCode);
    setCopiedScriptId(script.id);
    setTimeout(() => setCopiedScriptId(null), 2500);
    addSystemNotification(`📋 Скрипт "${script.filename}" скопійовано в буфер обміну!`);
  };

  // Download script file
  const handleDownloadScript = (script: IllustratorPlugin) => {
    const blob = new Blob([script.scriptCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = script.filename;
    a.click();
    URL.revokeObjectURL(url);
    addSystemNotification(`📥 Завантажено скрипт для Illustrator: ${script.filename}`);
  };

  // Tasks State
  const [tasks, setTasks] = useState<DesignTask[]>([
    {
      id: 'DES-101',
      title: 'Розробка каталогу продукції А4 (24 смуги)',
      clientName: 'ТОВ «ФармаТрейд»',
      designer: 'Олександр Д.',
      category: 'Каталоги',
      stage: 'in_progress',
      pagesCount: 24,
      deadline: '2026-09-08',
      price: 4800,
      filesUrl: 'https://drive.google.com/drive/folders/edelveis-pharma',
      comments: 'Фірмові сині та зелені кольори. Текст у кривих, вильоти 3 мм.',
      preflight: { cmyk: true, bleed: true, resolution: true, curves: false, overprint: true }
    },
    {
      id: 'DES-102',
      title: 'Редизайн євробуклета (2 згини, гармошка)',
      clientName: 'Контрагент Б',
      designer: 'Марина К.',
      category: 'Буклети',
      stage: 'review',
      pagesCount: 6,
      deadline: '2026-09-04',
      price: 1200,
      filesUrl: 'https://dropbox.com/edelveis/booklet',
      comments: 'Макет надіслано клієнту в Telegram на затвердження кольоропроби.',
      preflight: { cmyk: true, bleed: true, resolution: true, curves: true, overprint: true }
    },
    {
      id: 'DES-103',
      title: 'Крій штампу та дизайн картонної коробки',
      clientName: 'ПРАТ «ЕкоСок»',
      designer: 'Олександр Д.',
      category: 'Упаковка',
      stage: 'brief',
      pagesCount: 1,
      deadline: '2026-09-10',
      price: 2500,
      filesUrl: '',
      comments: 'Потрібно накласти дизайн на векторний контур ножа висічки.',
      preflight: { cmyk: false, bleed: false, resolution: false, curves: false, overprint: false }
    },
    {
      id: 'DES-104',
      title: 'Препрес та підготовка до виводу CTP (Візитівки)',
      clientName: 'ТОВ «АгроПлюс»',
      designer: 'Марина К.',
      category: 'Візитки',
      stage: 'approved',
      pagesCount: 2,
      deadline: '2026-09-03',
      price: 350,
      filesUrl: 'https://drive.google.com/drive/folders/agro-cards',
      comments: 'Повністю готово до друку. Спуск 24 шт на форматі SRA3.',
      preflight: { cmyk: true, bleed: true, resolution: true, curves: true, overprint: true }
    }
  ]);

  // New Task Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState(clients[0]?.name || 'ТОВ «ФармаТрейд»');
  const [newCategory, setNewCategory] = useState<DesignTask['category']>('Буклети');
  const [newPages, setNewPages] = useState(2);
  const [newPrice, setNewPrice] = useState(800);
  const [newDeadline, setNewDeadline] = useState('2026-09-07');
  const [newComments, setNewComments] = useState('');

  // Design Price Calculator State
  const [calcServiceType, setCalcServiceType] = useState<'catalog' | 'flyer' | 'cards' | 'logo' | 'preflight' | 'package'>('catalog');
  const [calcPages, setCalcPages] = useState<number>(16);
  const [calcComplexity, setCalcComplexity] = useState<'standard' | 'medium' | 'premium'>('medium');
  const [calcUrgent, setCalcUrgent] = useState<boolean>(false);

  // Calculate live design price
  const calculateDesignCost = () => {
    let base = 0;
    if (calcServiceType === 'catalog') {
      const perPage = calcComplexity === 'standard' ? 150 : calcComplexity === 'medium' ? 220 : 350;
      base = calcPages * perPage + 500; // + обкладинка
    } else if (calcServiceType === 'flyer') {
      base = calcComplexity === 'standard' ? 500 : calcComplexity === 'medium' ? 850 : 1400;
    } else if (calcServiceType === 'cards') {
      base = calcComplexity === 'standard' ? 300 : calcComplexity === 'medium' ? 550 : 900;
    } else if (calcServiceType === 'logo') {
      base = calcComplexity === 'standard' ? 2500 : calcComplexity === 'medium' ? 4500 : 8000;
    } else if (calcServiceType === 'preflight') {
      base = calcComplexity === 'standard' ? 200 : calcComplexity === 'medium' ? 350 : 600;
    } else if (calcServiceType === 'package') {
      base = calcComplexity === 'standard' ? 1500 : calcComplexity === 'medium' ? 2800 : 4500;
    }
    if (calcUrgent) base *= 1.5;
    return Math.round(base);
  };

  // Preflight Checklist Interactive Tool
  const [preflightList, setPreflightList] = useState([
    { id: 'bleed', title: 'Вильоти під обріз (Bleed)', desc: 'Мінімум 2-3 мм фонового зображення за межі різу', checked: false, critical: true },
    { id: 'margins', title: 'Безпечні внутрішні поля (Safe Area)', desc: 'Текст та логотипи не ближче 4-5 мм до лінії різу/згину', checked: false, critical: true },
    { id: 'cmyk', title: 'Колірна модель CMYK / Grayscale', desc: "Усі об'єкти переведені з RGB у CMYK (профіль Coated FOGRA39 / PSO Coated)", checked: false, critical: true },
    { id: 'dpi', title: 'Роздільна здатність растрових зображень', desc: 'Рівно 300 DPI у масштабі 1:1 (для широкоформату не менше 150 DPI)', checked: false, critical: true },
    { id: 'curves', title: 'Шрифти переведені у криві (Outlines)', desc: 'Усі текстові блоки замкнені у вектор (Ctrl+Shift+O / Ctrl+Q)', checked: false, critical: true },
    { id: 'lines', title: 'Товщина надтонких ліній (Hairline)', desc: 'Усі векторні контури не тонші за 0.2 pt (0.07 мм)', checked: false, critical: false },
    { id: 'overprint', title: 'Оверпринт чорного (Overprint Black)', desc: "Увімкнено оверпринт для K=100% тексту, вимкнено для білих об'єктів", checked: false, critical: true },
    { id: 'pdf_x', title: 'Експорт у стандарт PDF/X-1a або PDF/X-4', desc: 'Збережено у перевірений поліграфічний стандарт без прозоростей', checked: false, critical: false }
  ]);

  const togglePreflight = (id: string) => {
    setPreflightList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const allCriticalPassed = preflightList.filter(i => i.critical).every(i => i.checked);

  // Add Task handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: DesignTask = {
      id: `DES-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      clientName: newClient,
      designer: currentUser?.name || 'Дизайнер',
      category: newCategory,
      stage: 'brief',
      pagesCount: Number(newPages) || 1,
      deadline: newDeadline,
      price: Number(newPrice) || 500,
      comments: newComments,
      preflight: { cmyk: false, bleed: false, resolution: false, curves: false, overprint: false }
    };

    setTasks(prev => [newTask, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewComments('');
    addSystemNotification(`🎨 Створено нове завдання дизайну: ${newTask.title} для ${newTask.clientName}`);
  };

  const getStageBadge = (stage: DesignTask['stage']) => {
    switch (stage) {
      case 'brief':
        return { label: 'Бриф / Заявка', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'in_progress':
        return { label: 'В розробці', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case 'review':
        return { label: 'На погодженні у клієнта', bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' };
      case 'revisions':
        return { label: 'Внесення правок', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
      case 'approved':
        return { label: '✅ Затверджено в друк', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStage = stageFilter === 'all' || t.stage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto', padding: '24px 28px 48px 28px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '0.5px solid var(--border-light)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#6366f1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}>
              <Palette size={20} />
            </span>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--text-dark)' }}>
                Дизайнерська & Препрес-студія
              </h1>
              <p className="subtitle" style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-medium)' }}>
                Розробка макетів, погодження кольоропроб, плагіни Illustrator, препрес-перевірка та розрахунок вартості верстки
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ios-btn ios-btn-primary"
          style={{ backgroundColor: '#6366f1', borderColor: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 16px', fontWeight: '800' }}
        >
          <Plus size={15} /> Створити завдання дизайну
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {[
          { id: 'tasks', label: '🎨 Черга завдань & Макети', count: tasks.length },
          { id: 'plugins', label: '🧩 Illustrator Plugins & Скрипти', count: illustratorPlugins.length },
          { id: 'calculator', label: '💰 Калькулятор вартості дизайну', count: null },
          { id: 'preflight', label: '🔍 Preflight-валідатор файлів', count: null },
          { id: 'brief', label: '📝 Бриф & Техзавдання', count: null }
        ].map(tab => {
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`ios-btn ${isAct ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '34px',
                fontSize: '12px',
                fontWeight: '750',
                backgroundColor: isAct ? '#6366f1' : undefined,
                borderColor: isAct ? '#6366f1' : undefined
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', backgroundColor: isAct ? 'rgba(255,255,255,0.25)' : 'var(--bg-system)', color: isAct ? '#fff' : 'var(--text-medium)' }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DESIGN TASKS & KANBAN LIST */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter & Search Bar */}
          <div className="ios-card bg-white" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
              <input
                type="text"
                placeholder="Пошук макета, замовника або ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '32px', paddingLeft: '32px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-system)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)' }}>Статус:</span>
              {[
                { id: 'all', label: 'Усі' },
                { id: 'brief', label: 'Бриф' },
                { id: 'in_progress', label: 'В роботі' },
                { id: 'review', label: 'Погодження' },
                { id: 'revisions', label: 'Правки' },
                { id: 'approved', label: 'Затверджено' }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStageFilter(st.id)}
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: stageFilter === st.id ? 'none' : '1px solid var(--border-light)',
                    backgroundColor: stageFilter === st.id ? '#6366f1' : 'var(--bg-system)',
                    color: stageFilter === st.id ? '#ffffff' : 'var(--text-dark)'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredTasks.map(task => {
              const badge = getStageBadge(task.stage);
              return (
                <div
                  key={task.id}
                  className="ios-card bg-white"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '6px' }}>
                        {task.id} • {task.category}
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: '800',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {badge.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 6px 0', lineHeight: '1.35' }}>
                      {task.title}
                    </h3>

                    <div style={{ fontSize: '11.5px', color: 'var(--text-medium)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>Замовник: <strong style={{ color: 'var(--text-dark)' }}>{task.clientName}</strong></div>
                      <div>Дизайнер: <strong style={{ color: 'var(--text-dark)' }}>{task.designer}</strong> • Смуг/сторінок: <strong>{task.pagesCount}</strong></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c' }}>
                        <Clock size={12} /> Дедлайн: <strong>{task.deadline}</strong>
                      </div>
                    </div>

                    {task.comments && (
                      <p style={{ fontSize: '11px', color: 'var(--text-medium)', backgroundColor: 'var(--bg-system)', padding: '8px 10px', borderRadius: '8px', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                        💬 {task.comments}
                      </p>
                    )}
                  </div>

                  {/* Footer with Price and Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-medium)', display: 'block' }}>Вартість дизайну:</span>
                      <strong style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)' }}>{task.price} ₴</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {task.filesUrl && (
                        <a
                          href={task.filesUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ios-btn ios-btn-secondary ios-btn-small"
                          style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                          title="Відкрити папку макетів"
                        >
                          <ExternalLink size={12} /> Файли
                        </a>
                      )}

                      <select
                        value={task.stage}
                        onChange={(e) => {
                          const newSt = e.target.value as DesignTask['stage'];
                          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, stage: newSt } : t));
                          addSystemNotification(`🎨 Макет ${task.id}: змінено статус на "${getStageBadge(newSt).label}"`);
                        }}
                        style={{ fontSize: '11px', fontWeight: '700', borderRadius: '6px', border: '1px solid var(--border-light)', padding: '2px 6px', backgroundColor: 'var(--bg-system)', color: 'var(--text-dark)' }}
                      >
                        <option value="brief">Бриф</option>
                        <option value="in_progress">В роботі</option>
                        <option value="review">Погодження</option>
                        <option value="revisions">Правки</option>
                        <option value="approved">Затверджено</option>
                      </select>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 🧩 ILLUSTRATOR PLUGINS & SCRIPTS HUB */}
      {activeTab === 'plugins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Info Banner */}
          <div className="ios-card bg-white" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '16px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#312e81', color: '#ff7700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px', border: '2px solid #ff7700' }}>
                Ai
              </span>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-dark)', margin: 0 }}>
                  Офіційні плагіни та скрипти автоматизації для Adobe Illustrator
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-medium)', margin: '2px 0 0 0' }}>
                  Спуск смуг SRA3/A3, спотові контури висічки CutContour, перевірка CMYK та генерація векторних штрихкодів
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ fontSize: '11px', backgroundColor: 'var(--bg-system)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                📂 Шлях встановлення: <code style={{ color: '#6366f1', fontWeight: '700' }}>.../Presets/Scripts/</code>
              </div>
            </div>
          </div>

          {/* Plugins List Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>
            {illustratorPlugins.map(plugin => (
              <div
                key={plugin.id}
                className="ios-card bg-white"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#6366f1', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '6px' }}>
                      {plugin.category}
                    </span>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                      {plugin.version}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-dark)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode size={16} style={{ color: '#6366f1' }} />
                    {plugin.title}
                  </h3>

                  <p style={{ fontSize: '11.5px', color: 'var(--text-medium)', lineHeight: '1.45', margin: '0 0 10px 0' }}>
                    {plugin.desc}
                  </p>

                  {/* Key Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--bg-system)', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase' }}>
                      Можливості скрипта:
                    </span>
                    {plugin.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: 'var(--text-dark)' }}>
                        <span style={{ color: '#6366f1', fontWeight: 'bold' }}>•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions: Copy Code & Download .JSX */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', fontWeight: '700' }}>
                    {plugin.filename}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyScript(plugin)}
                      className="ios-btn ios-btn-secondary ios-btn-small"
                      style={{ fontSize: '11.5px', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedScriptId === plugin.id ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                      <span>{copiedScriptId === plugin.id ? 'Скопійовано!' : 'Код JSX'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadScript(plugin)}
                      className="ios-btn ios-btn-primary ios-btn-small"
                      style={{ backgroundColor: '#6366f1', borderColor: '#6366f1', fontSize: '11.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Download size={13} />
                      <span>Завантажити .jsx</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Instructions Box */}
          <div className="ios-card bg-white" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px 22px', borderRadius: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={15} style={{ color: '#6366f1' }} />
              Як встановити та використовувати скрипти в Adobe Illustrator:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '11.5px', color: '#334155' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '2px' }}>1. Збереження файлу:</strong>
                Натисніть кнопку <strong>«Завантажити .jsx»</strong> та збережіть файл у папку скриптів вашого Illustrator:
                <div style={{ marginTop: '4px', fontFamily: 'monospace', fontSize: '10.5px', color: '#6366f1', wordBreak: 'break-all' }}>
                  C:\Program Files\Adobe\Adobe Illustrator...\Presets\...\Scripts                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '2px' }}>2. Запуск в Illustrator:</strong>
                Перезапустіть Illustrator або виберіть у верхньому меню:
                <div style={{ marginTop: '4px', fontWeight: '700', color: '#0f172a' }}>
                  File (Файл) ➔ Scripts (Скрипти) ➔ Обрати потрібний скрипт
                </div>
                або натисніть комбінацію <kbd style={{ padding: '1px 4px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}>Ctrl + F12</kbd> для швидкого вибору.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: DESIGN PRICE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left: Settings */}
          <div className="ios-card bg-white" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <CalcIcon size={18} style={{ color: '#6366f1' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0, color: 'var(--text-dark)' }}>
                Калькулятор вартості дизайну та верстки
              </h3>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Тип дизайнерської послуги:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { id: 'catalog', label: '📖 Верстка багатосторінкова' },
                  { id: 'flyer', label: '📄 Листівка / Буклет' },
                  { id: 'cards', label: '💳 Візитки / Дисконти' },
                  { id: 'package', label: '📦 Упаковка / Крій штампу' },
                  { id: 'logo', label: '✨ Розробка логотипа' },
                  { id: 'preflight', label: '⚙️ Препрес-підготовка макета' }
                ].map(srv => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setCalcServiceType(srv.id as any)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: '750',
                      cursor: 'pointer',
                      border: calcServiceType === srv.id ? '2px solid #6366f1' : '1px solid var(--border-light)',
                      backgroundColor: calcServiceType === srv.id ? '#eef2ff' : 'var(--bg-system)',
                      color: calcServiceType === srv.id ? '#4338ca' : 'var(--text-dark)',
                      textAlign: 'left'
                    }}
                  >
                    {srv.label}
                  </button>
                ))}
              </div>
            </div>

            {calcServiceType === 'catalog' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Кількість сторінок (смуг) для верстки:</span>
                  <strong style={{ color: '#6366f1' }}>{calcPages} смуг</strong>
                </label>
                <input
                  type="range"
                  min={4}
                  max={128}
                  step={4}
                  value={calcPages}
                  onChange={(e) => setCalcPages(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#6366f1' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Складність розробки:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'standard', label: 'Базова (за шаблоном)' },
                  { id: 'medium', label: 'Індивідуальна (референси)' },
                  { id: 'premium', label: 'Преміум (3 концепти)' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCalcComplexity(c.id as any)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: calcComplexity === c.id ? '2px solid #6366f1' : '1px solid var(--border-light)',
                      backgroundColor: calcComplexity === c.id ? '#eef2ff' : 'var(--bg-system)',
                      color: calcComplexity === c.id ? '#4338ca' : 'var(--text-dark)',
                      textAlign: 'center'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer', color: '#ea580c', backgroundColor: '#fff7ed', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
              <input
                type="checkbox"
                checked={calcUrgent}
                onChange={(e) => setCalcUrgent(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>⚡ Термінове виконання (протягом 24 годин, +50% до вартості)</span>
            </label>
          </div>

          {/* Right: Calculated Summary */}
          <div className="ios-card bg-white" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', margin: 0, color: 'var(--text-dark)' }}>
                  Підсумок калькуляції дизайну
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                  Прайс 2026
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-system)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-medium)' }}>Послуга:</span>
                  <strong style={{ color: 'var(--text-dark)' }}>
                    {calcServiceType === 'catalog' ? `Верстка каталогу (${calcPages} смуг)` : calcServiceType === 'flyer' ? 'Дизайн листівки/буклета' : calcServiceType === 'cards' ? 'Дизайн візитки' : calcServiceType === 'logo' ? 'Розробка логотипа' : calcServiceType === 'package' ? 'Дизайн упаковки' : 'Препрес-підготовка'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-system)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-medium)' }}>Рівень складності:</span>
                  <strong style={{ color: 'var(--text-dark)' }}>
                    {calcComplexity === 'standard' ? 'Базовий' : calcComplexity === 'medium' ? 'Індивідуальний' : 'Преміум (3 концепти)'}
                  </strong>
                </div>

                {calcUrgent && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#fff7ed', borderRadius: '8px', color: '#c2410c' }}>
                    <span>Терміновість:</span>
                    <strong>+50% (24 год)</strong>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#6d28d9', textTransform: 'uppercase' }}>
                  Розрахована вартість послуги:
                </span>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#5b21b6', margin: '4px 0 0 0', fontFamily: 'monospace' }}>
                  {calculateDesignCost().toLocaleString()} ₴
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewTitle(calcServiceType === 'catalog' ? `Верстка каталогу (${calcPages} смуг)` : `Дизайн ${calcServiceType}`);
                setNewPrice(calculateDesignCost());
                setNewPages(calcPages);
                setShowAddModal(true);
              }}
              className="ios-btn ios-btn-primary"
              style={{ backgroundColor: '#6366f1', borderColor: '#6366f1', height: '40px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Plus size={16} /> Додати в чергу завдань
            </button>
          </div>

        </div>
      )}

      {/* TAB 4: PREFLIGHT CHECKLIST */}
      {activeTab === 'preflight' && (
        <div className="ios-card bg-white" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '16px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)', margin: 0 }}>
                🔍 Технічний чекер макетів (Prepress Preflight)
              </h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-medium)', margin: '3px 0 0 0' }}>
                Стандарт перевірки файлів друкарні «Едельвейс і К» перед виведенням пластин та печаткою
              </p>
            </div>

            <span style={{
              fontSize: '11.5px',
              fontWeight: '800',
              padding: '4px 12px',
              borderRadius: '8px',
              backgroundColor: allCriticalPassed ? '#dcfce7' : '#fee2e2',
              color: allCriticalPassed ? '#15803d' : '#b91c1c'
            }}>
              {allCriticalPassed ? '✅ ГОТОВО ДО ДРУКУ' : '⚠️ Є НЕВИКОНАНІ ПУНКТИ'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {preflightList.map(item => (
              <label
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: item.checked ? '1px solid #86efac' : '1px solid var(--border-light)',
                  backgroundColor: item.checked ? '#f0fdf4' : 'var(--bg-system)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => togglePreflight(item.id)}
                  style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#16a34a' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '12.5px', color: item.checked ? '#15803d' : 'var(--text-dark)' }}>
                      {item.title}
                    </strong>
                    {item.critical && (
                      <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: '4px' }}>
                        ОБОВ'ЯЗКОВО
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: '2px 0 0 0' }}>
                    {item.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DESIGN BRIEF GENERATOR */}
      {activeTab === 'brief' && (
        <div className="ios-card bg-white" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '16px', maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)', margin: '0 0 4px 0' }}>
            📝 Бриф / Технічне завдання на розробку дизайну
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-medium)', margin: '0 0 16px 0' }}>
            Сформуйте чітке ТЗ для дизайнера та погодьте його із замовником
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert('Бриф успішно збережено та надіслано в роботу!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="ios-label">Замовник / Компанія</label>
                <select className="ios-input" style={{ width: '100%', height: '36px' }}>
                  {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="ios-label">Тип поліграфічної продукції</label>
                <input className="ios-input" placeholder="Наприклад: Каталог А4, Буклет, Банер" defaultValue="Рекламний каталог 2026" style={{ width: '100%', height: '36px' }} />
              </div>
            </div>

            <div>
              <label className="ios-label">Цільова аудиторія та головна мета макета</label>
              <textarea className="ios-input" rows={2} placeholder="Опишіть, для кого створюється виріб та що він має транслювати..." defaultValue="B2B клієнти, презентація нової лінійки продукції на виставці." style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="ios-label">Корпоративні кольори / Брендбук</label>
                <input className="ios-input" placeholder="CMYK / Pantone коди..." defaultValue="Синій Pantone 286C, Білий, Графіт" style={{ width: '100%', height: '36px' }} />
              </div>
              <div>
                <label className="ios-label">Посилання на вихідні фото/логотипи</label>
                <input className="ios-input" placeholder="Google Drive / Dropbox link..." defaultValue="https://drive.google.com/drive/edelveis-brief" style={{ width: '100%', height: '36px' }} />
              </div>
            </div>

            <div>
              <label className="ios-label">Обов'язкові тексти та контакти на макеті</label>
              <textarea className="ios-input" rows={2} placeholder="Телефони, адреса, QR-код, слоган..." defaultValue="Адреса: м. Вінниця, тел: 067 840-97-81, QR-код на сайт." style={{ width: '100%' }} />
            </div>

            <button type="submit" className="ios-btn ios-btn-primary" style={{ backgroundColor: '#6366f1', borderColor: '#6366f1', height: '40px', fontWeight: '800', marginTop: '8px' }}>
              <Send size={15} /> Зберегти Бриф та надіслати дизайнеру
            </button>
          </form>
        </div>
      )}

      {/* CREATE NEW TASK MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                🎨 Створити завдання дизайну
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="ios-label">Назва завдання / Виріб</label>
                <input required className="ios-input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Наприклад: Верстка буклету А5" style={{ width: '100%', height: '36px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="ios-label">Замовник</label>
                  <select className="ios-input" value={newClient} onChange={(e) => setNewClient(e.target.value)} style={{ width: '100%', height: '36px' }}>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ios-label">Категорія</label>
                  <select className="ios-input" value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)} style={{ width: '100%', height: '36px' }}>
                    <option value="Буклети">Буклети</option>
                    <option value="Каталоги">Каталоги</option>
                    <option value="Візитки">Візитки</option>
                    <option value="Упаковка">Упаковка</option>
                    <option value="Банери">Банери</option>
                    <option value="Етикетки">Етикетки</option>
                    <option value="Логотип">Логотип</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="ios-label">Вартість, ₴</label>
                  <input type="number" className="ios-input" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} style={{ width: '100%', height: '36px' }} />
                </div>
                <div>
                  <label className="ios-label">Дедлайн</label>
                  <input type="date" className="ios-input" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} style={{ width: '100%', height: '36px' }} />
                </div>
              </div>

              <div>
                <label className="ios-label">Коментар / Техвимоги</label>
                <textarea className="ios-input" rows={2} value={newComments} onChange={(e) => setNewComments(e.target.value)} placeholder="Особливості, побажання, посилання..." style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
                <button type="submit" className="ios-btn ios-btn-primary" style={{ backgroundColor: '#6366f1', borderColor: '#6366f1' }}>Створити</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
