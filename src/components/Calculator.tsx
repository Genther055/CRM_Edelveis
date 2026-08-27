import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  FileText,
  BookOpen,
  Layout,
  Layers,
  ArrowLeft,
  Save,
  FolderOpen,
  Calendar,
  Download,
  Clock,
  Tag,
  MessageSquare,
  AlertTriangle,
  SlidersHorizontal
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface CalcTemplate {
  name: string;
  category: string;
  quantity: number;
  packingCount: number;
  paperType: 'offset' | 'gazetka' | 'coated';
  colors: string;
  isSamNaSebe: boolean;
  marginPercent: number;
  calcMode: 'auto' | 'operations';
  activeOps: Record<string, boolean>;
  opCustomRates: Record<string, number>;
  opVolumes: Record<string, number>;
  // Expanded options
  format: string;
  orientation: 'portrait' | 'landscape';
  coverPaperType?: 'offset' | 'coated' | 'cardboard';
  coverColors?: string;
  bindingType?: 'none' | 'staple' | 'spring' | 'glue' | 'hardcover';
  laminationType?: 'none' | 'gloss' | 'matte' | 'softtouch';
  creaseCount?: number;
}

// Clean restored Calculator version 1.0.5
export const Calculator: React.FC = () => {
  const { clients, materials, norms, addOrder, currentUser, updateNorms } = useApp();

  // Selection step: 'catalog' | 'editor'
  const [step, setStep] = useState<'catalog' | 'editor'>('catalog');
  
  // Main Category Tab: 'products' | 'offset' | 'digital' | 'wide' | 'roll' | 'films'
  const [mainCategoryTab, setMainCategoryTab] = useState<'products' | 'offset' | 'digital' | 'wide' | 'roll' | 'films'>('products');

  // Sub-tabs in Offset printing: 'overview' | 'sheets' | 'felling' | 'multipage' | 'custom'
  const [offsetSubTab, setOffsetSubTab] = useState<'overview' | 'sheets' | 'felling' | 'multipage' | 'custom'>('overview');

  // Sheet Offset Calculator specific states
  const [sheetSizePreset, setSheetSizePreset] = useState<string>('1'); // Default Business Card 90x50
  const [sheetCustomWidth, setSheetCustomWidth] = useState<string>('90');
  const [sheetCustomHeight, setSheetCustomHeight] = useState<string>('50');
  const [sheetUnit, setSheetUnit] = useState<'mm' | 'cm'>('mm');
  const [sheetOrientation, setSheetOrientation] = useState<'horiz' | 'vert'>('horiz');
  const [cardKind, setCardKind] = useState<string>('1'); // '1': Стандартні, '2': Квадратні, '6': Складні, '7': Круг, '8': Овал, '9': Заокругленні кути

  // Die-cut (Felling) Offset Calculator specific states
  const [fellingForm, setFellingForm] = useState<string>('1'); // '1': Стандартна, '2': Кругла, '3': Овальна, '4': Прямокутна, '5': Етикетка
  const [fellingStamp, setFellingStamp] = useState<string>('128'); // Default stamp '128' (Хенгер вид 1)

  // Multipage Offset Calculator specific states
  const [multiStitching, setMultiStitching] = useState<string>('1'); // '1': Скоба, '2': Пружина, '3': Клей, '4': Блокноти
  const [multiSizePreset, setMultiSizePreset] = useState<string>('3'); // Default A5 (148x210)
  const [multiCoverPages, setMultiCoverPages] = useState<string>('1'); // '0': Без обкладинки, '1': 4 стор, '2': 8 стор
  const [multiCoverMaterial, setMultiCoverMaterial] = useState<string>('250');
  const [multiCoverColor, setMultiCoverColor] = useState<string>('2'); // 4+4
  const [multiBlockPages, setMultiBlockPages] = useState<string>('4'); // 16 стор
  const [multiBlockMaterial, setMultiBlockMaterial] = useState<string>('130');
  const [multiBlockColor, setMultiBlockColor] = useState<string>('2'); // 4+4
  const [multiInsertPages, setMultiInsertPages] = useState<string>('0'); // Без вставки
  const [multiInsertMaterial, setMultiInsertMaterial] = useState<string>('130');
  const [multiInsertColor, setMultiInsertColor] = useState<string>('2');

  // Notepad specific states
  const [notepadSpringColor, setNotepadSpringColor] = useState<'white' | 'black' | 'silver'>('white');
  const [notepadBindingEdge, setNotepadBindingEdge] = useState<'short' | 'long'>('short');
  const [notepadCoverPaper, setNotepadCoverPaper] = useState<string>('250');
  const [notepadCoverLam, setNotepadCoverLam] = useState<string>('none');
  const [notepadPodkladka, setNotepadPodkladka] = useState<string>('250');
  const [notepadBlockPages, setNotepadBlockPages] = useState<number>(50);
  const [notepadBlockRuling, setNotepadBlockRuling] = useState<'blank' | 'grid_1_0' | 'grid_1_1' | 'lines_1_0' | 'custom_4_4'>('grid_1_0');

  // Folder A4 specific states
  const [folderSpine, setFolderSpine] = useState<'0' | '5' | '7'>('5');
  const [folderRezinka, setFolderRezinka] = useState<'none' | 'blue' | 'red' | 'white' | 'black'>('none');
  const [folderFinish, setFolderFinish] = useState<'sheets' | 'assembled'>('sheets');
  const [folderVizSlot, setFolderVizSlot] = useState<boolean>(true);

  // Envelope specific states
  const [envelopeFormat, setEnvelopeFormat] = useState<'E65' | 'C6' | 'C5' | 'C4'>('E65');
  const [envelopeWindow, setEnvelopeWindow] = useState<boolean>(false);

  // Calendar Grids specific states
  const [gridType, setGridType] = useState<'standart' | 'gold' | 'metallic' | '3in1'>('standart');
  const [gridYear, setGridYear] = useState<'2026' | '2027'>('2026');
  const [gridCursor, setGridCursor] = useState<boolean>(true);

  // Helper to transition into specific offset product calculator
  const openOffsetProduct = (params: {
    category: any;
    subCategory?: string;
    subTab?: 'sheets' | 'felling' | 'multipage' | 'custom';
    preset?: string;
    w?: string;
    h?: string;
    kind?: string;
    stitching?: string;
    stamp?: string;
    folderSpine?: '0' | '5' | '7';
    folderRezinka?: 'none' | 'blue' | 'red' | 'white' | 'black';
    envelopeFormat?: 'E65' | 'C6' | 'C5' | 'C4';
  }) => {
    setMainCategoryTab('offset');
    setOffsetSubTab(params.subTab || 'sheets');
    setCategory(params.category);
    if (params.subCategory) {
      setSubCategory(params.subCategory as any);
      setName(`${params.subCategory} ${params.w ? `${params.w}×${params.h} мм` : ''}`);
    }
    if (params.preset) setSheetSizePreset(params.preset);
    if (params.w) setSheetCustomWidth(params.w);
    if (params.h) setSheetCustomHeight(params.h);
    if (params.kind) setCardKind(params.kind);
    if (params.stitching) setMultiStitching(params.stitching);
    if (params.stamp) setFellingStamp(params.stamp);
    if (params.folderSpine) setFolderSpine(params.folderSpine);
    if (params.folderRezinka) setFolderRezinka(params.folderRezinka);
    if (params.envelopeFormat) setEnvelopeFormat(params.envelopeFormat);
  };

  // Postpress options states
  const [showPostpressAccordion, setShowPostpressAccordion] = useState<boolean>(false);
  const [postPersonalization, setPostPersonalization] = useState<string>('0');
  const [postLuvers, setPostLuvers] = useState<string>('0');
  const [postLuversCount, setPostLuversCount] = useState<number>(1);
  const [postCorners, setPostCorners] = useState<string>('0');
  const [postGluing, setPostGluing] = useState<string>('0');
  const [postGluingSide, setPostGluingSide] = useState<string>('1');
  const [postDrilling, setPostDrilling] = useState<string>('0');
  const [postDrillingDia, setPostDrillingDia] = useState<string>('5');
  const [postFolding, setPostFolding] = useState<string>('0');
  const [postFoldingOffset, setPostFoldingOffset] = useState<string>('0');
  const [postCreasing, setPostCreasing] = useState<string>('0');
  const [postPerforation, setPostPerforation] = useState<string>('0');
  const [postPackingText, setPostPackingText] = useState<string>('');

  const [sheetSetsCount, setSheetSetsCount] = useState<number>(1);

  // Filters for Sheet Calculator
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['80', '130', '300']);
  const [selectedCoverings, setSelectedCoverings] = useState<string[]>(['0', '7', '10']);
  const [selectedPrintColors, setSelectedPrintColors] = useState<string[]>(['4+0', '4+4']);

  // Table options
  const [includeDelivery, setIncludeDelivery] = useState<boolean>(false);
  const [priceCostVar, setPriceCostVar] = useState<'per_item' | 'per_tirazh'>('per_tirazh');

  // Active info modal state ('instruction' | 'terms' | 'materials' | 'samples' | 'review' | 'bug' | null)
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

  // Calculation mode: 'auto' (Adapted Business Logic) | 'operations' (Pooperatsiyniy 1C)
  const [calcMode, setCalcMode] = useState<'auto' | 'operations'>('auto');

  // Input states
  const [orderNumber, setOrderNumber] = useState<number>(() => Math.floor(10000 + Math.random() * 90000));
  const [subCategory, setSubCategory] = useState<'Бланки' | 'Листівки'>('Бланки');
  const [name, setName] = useState('Бланки А4');
  const [category, setCategory] = useState<
    | 'Візитки' 
    | 'Буклети' 
    | 'Дипломи випускні' 
    | 'Календарики кишенькові' 
    | 'Книги' 
    | 'Листівки' 
    | 'Меню' 
    | 'Наклейки' 
    | 'Плакати' 
    | 'Бланки' 
    | 'Флаєри' 
    | 'Нотаріальні книги' 
    | 'Дипломи і палітурка' 
    | 'Логотипи виготовлення' 
    | 'Шкільні журнали' 
    | 'Етикетки'
    | 'Календарі'
    | 'Блокноти'
    | 'Папки'
  >('Бланки');
  const [quantity, setQuantity] = useState<number | ''>(1000);
  const [packingCount, setPackingCount] = useState<number | ''>(1);
  const [paperType, setPaperType] = useState<'offset' | 'gazetka' | 'coated'>('offset');
  const [colors, setColors] = useState('1+0');
  const [isSamNaSebe, setIsSamNaSebe] = useState(true);
  const [turnType, setTurnType] = useState<'sam_na_sebe' | 'bez_oborotu' | 'chuzhyi_oborut'>('sam_na_sebe');
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [marginPercent, setMarginPercent] = useState<number>(100);

  // EXPANDED PREMIUM IDRUK OPTIONS
  const [selectedFormat, setSelectedFormat] = useState<string>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  // Cover options (used for Books/Brochures)
  const [coverPaperType, setCoverPaperType] = useState<'offset' | 'coated' | 'cardboard'>('coated');
  const [coverColors, setCoverColors] = useState<string>('4+4');
  
  // Inner block options (used for Books/Brochures)
  const [innerPages, setInnerPages] = useState<number>(16);

  // Postpress choices
  const [bindingType, setBindingType] = useState<'none' | 'staple' | 'spring' | 'glue' | 'hardcover'>('none');
  const [laminationType, setLaminationType] = useState<'none' | 'gloss' | 'matte' | 'softtouch'>('none');
  const [creaseCount, setCreaseCount] = useState<number>(0);

  // Operations checkbox state
  const [activeOps, setActiveOps] = useState<Record<string, boolean>>({
    formMaking: true,
    filmMounting: true,
    printing: true,
    lamination: false,
    embossing: false,
    dieCutting: false,
    folding: false,
    blockInsertion: false,
    coverMaking: false,
    blockProcessing: true
  });

  // Custom operation rates/costs (defaults loaded from norms)
  const [opCustomRates, setOpCustomRates] = useState<Record<string, number>>({});
  
  // Custom operation volumes
  const [opVolumes, setOpVolumes] = useState<Record<string, number>>({
    formMaking: 1,
    filmMounting: 1,
    printing: 1,
    lamination: 1,
    embossing: 1,
    dieCutting: 1,
    folding: 1,
    blockInsertion: 1,
    coverMaking: 1,
    blockProcessing: 1
  });

  // Templates list
  const [templates, setTemplates] = useState<CalcTemplate[]>(() => {
    const saved = localStorage.getItem('crm_calc_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [templateName, setTemplateName] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [showNorms, setShowNorms] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [tempNorms, setTempNorms] = useState(norms);

  const isAdmin = currentUser?.role === 'admin';

  const activeClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const [customDesignPrice, setCustomDesignPrice] = useState<string>('34');

  // Determine standard or sam na sebe or custom design cost
  const designCost = useMemo(() => {
    if (customDesignPrice.trim() !== '') {
      const parsed = parseFloat(customDesignPrice.replace(',', '.'));
      return isNaN(parsed) ? 0 : parsed;
    }
    if (turnType === 'sam_na_sebe') return norms.designSamNaSebe;
    if (turnType === 'chuzhyi_oborut') return norms.designStandard;
    return 0; // Без обороту
  }, [turnType, norms, customDesignPrice]);

  const handleSelectTurnType = (type: 'sam_na_sebe' | 'bez_oborotu' | 'chuzhyi_oborut') => {
    setTurnType(type);
    if (type === 'sam_na_sebe') {
      setIsSamNaSebe(true);
      setCustomDesignPrice('34');
      if (colors === '1+0') setColors('1+1');
      if (colors === '4+0') setColors('4+4');
    } else if (type === 'bez_oborotu') {
      setIsSamNaSebe(false);
      setCustomDesignPrice('0');
      if (colors === '1+1') setColors('1+0');
      if (colors === '4+4') setColors('4+0');
    } else if (type === 'chuzhyi_oborut') {
      setIsSamNaSebe(false);
      setCustomDesignPrice('50');
      if (colors === '1+0') setColors('1+1');
      if (colors === '4+0') setColors('4+4');
    }
  };

  // Automatically compose full descriptive product title with customer and chosen options
  useEffect(() => {
    const paperName = paperType === 'offset' ? 'Офс. 70г' : paperType === 'gazetka' ? 'Газ. 45г' : 'Крейд. 130г';
    const clientTitle = activeClient ? activeClient.name : '';
    const baseProd = category === 'Бланки' ? subCategory : category;
    const turnLabel = turnType === 'sam_na_sebe' ? 'с/с' : turnType === 'bez_oborotu' ? 'без обор.' : 'ч/о';
    const qtyStr = quantity !== '' ? `${quantity} шт.` : '0 шт.';
    
    const optionsSummary = `${selectedFormat}, ${paperName}, ${colors}, ${turnLabel}, ${qtyStr}`;
    const autoTitle = clientTitle 
      ? `${baseProd} — ${clientTitle} (${optionsSummary})`
      : `${baseProd} (${optionsSummary})`;

    setName(autoTitle);
  }, [category, subCategory, selectedClientId, selectedFormat, paperType, colors, turnType, quantity, activeClient]);

  const handleSelectSubCategory = (sub: 'Бланки' | 'Листівки') => {
    setSubCategory(sub);
    setTurnType('sam_na_sebe');
    setCustomDesignPrice('34');
    setIsSamNaSebe(true);
    if (sub === 'Бланки') {
      setPaperType('offset');
      setColors('1+0');
      setSelectedFormat('A4');
      setLaminationType('none');
      setCreaseCount(0);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: false,
        embossing: false,
        dieCutting: false,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    } else {
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A5');
      setLaminationType('none');
      setCreaseCount(0);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: false,
        embossing: false,
        dieCutting: false,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    }
  };

  // Select Product from Catalog
  const handleSelectCategory = (cat: any) => {
    setCategory(cat);
    setStep('editor');
    setCalcMode('auto');
    
    if (cat === 'Бланки') {
      setQuantity(1000);
      setPaperType('offset');
      setColors('1+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('none');
      setName('Бланки А4');
      setSubCategory('Бланки');
      setSelectedMaterials(['80', 'kraft']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['1+0', '4+0']);
    } else if (cat === 'Візитки') {
      setQuantity(100);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('90x50 мм');
      setBindingType('none');
      setLaminationType('matte');
      setSelectedMaterials(['350', '300', 'linen', 'kraft']);
      setSelectedCoverings(['0', '7', '9', '30']);
      setSelectedPrintColors(['4+4', '4+0']);
    } else if (cat === 'Буклети') {
      setQuantity(500);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('none');
      setCreaseCount(2);
      setSelectedMaterials(['130', '150', '170']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['4+4']);
    } else if (cat === 'Дипломи випускні') {
      setQuantity(50);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('gloss');
      setSelectedMaterials(['300', '350']);
      setSelectedCoverings(['7', '9']);
      setSelectedPrintColors(['4+0']);
    } else if (cat === 'Календарі кишенькові') {
      setQuantity(500);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('70x100 мм');
      setBindingType('none');
      setLaminationType('gloss');
      setSelectedMaterials(['350', '450']);
      setSelectedCoverings(['8', '10']);
      setSelectedPrintColors(['4+4']);
    } else if (cat === 'Книги') {
      setQuantity(200);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A5');
      setBindingType('staple');
      setLaminationType('gloss');
      setSelectedMaterials(['80', '130']);
      setSelectedCoverings(['0', '7']);
      setSelectedPrintColors(['1+1', '4+4']);
    } else if (cat === 'Листівки') {
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A5');
      setBindingType('none');
      setLaminationType('none');
      setSelectedMaterials(['130', '150', '90', '115', '300']);
      setSelectedCoverings(['0', '7', '9']);
      setSelectedPrintColors(['4+4', '4+0']);
    } else if (cat === 'Сети') {
      setQuantity(1000);
      setPaperType('offset');
      setColors('1+0');
      setSelectedFormat('A3');
      setBindingType('none');
      setLaminationType('none');
      setSelectedMaterials(['80', 'kraft', '250']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['1+0', '4+0']);
    } else if (cat === 'Папки') {
      setQuantity(100);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('matte');
      setSelectedMaterials(['350', '300', 'karton_250']);
      setSelectedCoverings(['0', '9', '30']);
      setSelectedPrintColors(['4+0', '4+4']);
    } else if (cat === 'Блокноти') {
      setQuantity(100);
      setPaperType('offset');
      setColors('4+0');
      setSelectedFormat('A5');
      setBindingType('spring');
      setLaminationType('none');
      setSelectedMaterials(['300', '350', '80']);
      setSelectedCoverings(['0', '7', '9']);
      setSelectedPrintColors(['4+0', '4+4', '1+0']);
    } else if (cat === 'Меню') {
      setQuantity(30);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A4');
      setBindingType('spring');
      setLaminationType('matte');
    } else if (cat === 'Наклейки') {
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('gloss');
      setSelectedMaterials(['sk_kreyd_pros', 'sk_kreyd_bez', 'sk_ofset_pros']);
      setSelectedCoverings(['0', '7', '9']);
      setSelectedPrintColors(['4+0']);
    } else if (cat === 'Плакати') {
      setQuantity(100);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A3');
      setBindingType('none');
      setLaminationType('none');
      setSelectedMaterials(['130', '115', '150', '90', '80', 'kraft']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['4+0']);
    } else if (cat === 'Флаєри') {
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('Euro');
      setBindingType('none');
      setLaminationType('none');
      setSelectedMaterials(['130', '150', '90', '115', '250']);
      setSelectedCoverings(['0', '7', '9']);
      setSelectedPrintColors(['4+4', '4+0']);
    } else if (cat === 'Нотаріальні книги') {
      setQuantity(10);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A4');
      setBindingType('hardcover');
      setLaminationType('none');
    } else if (cat === 'Дипломи і палітурка') {
      setQuantity(20);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('hardcover');
      setLaminationType('matte');
    } else if (cat === 'Логотипи виготовлення') {
      setQuantity(100);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('softtouch');
    } else if (cat === 'Шкільні журнали') {
      setQuantity(50);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A4');
      setBindingType('hardcover');
      setLaminationType('none');
    } else if (cat === 'Етикетки') {
      setQuantity(2000);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('90x50 мм');
      setBindingType('none');
      setLaminationType('none');
    } else if (cat === 'Календарі') {
      setQuantity(100);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A3');
      setBindingType('spring');
      setLaminationType('none');
    } else if (cat === 'Блокноти') {
      setQuantity(300);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A5');
      setBindingType('spring');
      setLaminationType('matte');
    } else if (cat === 'Папки') {
      setQuantity(500);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
    } else {
      // Бланки standard
      setQuantity(1000);
      setPaperType('offset');
      setColors('1+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('none');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: false,
        embossing: false,
        dieCutting: false,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    }
  };

  // Calculations logic (handles both auto & operational calculations)
  const calculatedOps = useMemo(() => {
    // Machine calculation
    let machine = 'Різограф';
    let format = 'A3';
    let printRate = norms.printRates.rizograph;
    let itemsPerSheet = 2;

    const numQty = Math.max(1, Number(quantity) || 1);
    const numPack = Math.max(0, Number(packingCount) || 0);

    if (numQty < 1000) {
      machine = 'Різограф';
      format = 'A3';
      printRate = norms.printRates.rizograph;
      itemsPerSheet = selectedFormat.includes('90x50') ? 24 : (selectedFormat === 'A3' ? 1 : 2);
    } else if (numQty < 3000) {
      machine = 'Опція 1';
      format = 'A3';
      printRate = norms.printRates.option1;
      itemsPerSheet = selectedFormat.includes('90x50') ? 24 : (selectedFormat === 'A3' ? 1 : 2);
    } else if (numQty < 7000) {
      machine = 'Опція 2';
      format = 'A2';
      printRate = norms.printRates.option2;
      itemsPerSheet = selectedFormat.includes('90x50') ? 48 : (selectedFormat === 'A3' ? 2 : 4);
    } else {
      machine = 'ПЛАНЕТА';
      format = 'A1';
      printRate = norms.printRates.planeta;
      itemsPerSheet = selectedFormat.includes('90x50') ? 96 : (selectedFormat === 'A3' ? 4 : 8);
    }

    const physicalSheets = Math.ceil(numQty / itemsPerSheet);
    
    // Choose paper rate
    let paperPrice = norms.paperOffsetPrice;
    if (paperType === 'gazetka') paperPrice = norms.paperGazetkaPrice;
    if (paperType === 'coated') paperPrice = norms.paperCoatedPrice;
    const paperCost = physicalSheets * paperPrice;

    const passes = ['1+1', '4+4'].includes(colors) ? 2 : 1;
    const cuttingCost = numQty * norms.cuttingRate;
    const itemsPerPackage = numPack > 0 ? numPack : numQty;
    const totalPackages = Math.ceil(numQty / itemsPerPackage);
    const packingCost = totalPackages * norms.packingRate;

    let subtotal = 0;
    let printingCost = 0;

    // Build operation prices mapping (for manual overrides if in operational mode)
    const getSafeRate = (key: string, defaultRate: number) => {
      const val = opCustomRates[key];
      const rate = (val !== undefined && !isNaN(val)) ? val : defaultRate;
      return Math.max(0.01, rate || 0.50);
    };

    const getVol = (key: string, autoDefault: number) => {
      const val = opVolumes[key];
      return (val !== undefined && !isNaN(val)) ? val : autoDefault;
    };

    const actualVolumes = {
      formMaking: getVol('formMaking', passes),
      filmMounting: getVol('filmMounting', 1),
      printing: getVol('printing', physicalSheets),
      lamination: getVol('lamination', physicalSheets),
      embossing: getVol('embossing', numQty),
      dieCutting: getVol('dieCutting', numQty),
      folding: getVol('folding', (Number(creaseCount) || 1) * numQty),
      blockInsertion: getVol('blockInsertion', numQty),
      coverMaking: getVol('coverMaking', numQty),
      blockProcessing: getVol('blockProcessing', physicalSheets)
    };

    const rates = {
      formMaking: getSafeRate('formMaking', norms.formMakingPrice),
      filmMounting: getSafeRate('filmMounting', norms.filmMountingPrice),
      printing: getSafeRate('printing', printRate),
      lamination: getSafeRate('lamination', paperType === 'coated' ? norms.laminationMattePrice : norms.laminationGlossyPrice),
      embossing: getSafeRate('embossing', norms.embossingPrice),
      dieCutting: getSafeRate('dieCutting', norms.dieCuttingPrice),
      folding: getSafeRate('folding', norms.foldingPrice),
      blockInsertion: getSafeRate('blockInsertion', norms.blockInsertionPrice),
      coverMaking: getSafeRate('coverMaking', norms.coverMakingPrice),
      blockProcessing: getSafeRate('blockProcessing', norms.blockProcessingPrice)
    };

    const fullSums = {
      formMaking: rates.formMaking * actualVolumes.formMaking,
      filmMounting: rates.filmMounting * actualVolumes.filmMounting,
      printing: rates.printing * actualVolumes.printing * passes,
      lamination: rates.lamination * actualVolumes.lamination,
      embossing: rates.embossing * actualVolumes.embossing,
      dieCutting: rates.dieCutting * actualVolumes.dieCutting,
      folding: rates.folding * actualVolumes.folding,
      blockInsertion: rates.blockInsertion * actualVolumes.blockInsertion,
      coverMaking: rates.coverMaking * actualVolumes.coverMaking,
      blockProcessing: rates.blockProcessing * actualVolumes.blockProcessing
    };

    const sums = {
      formMaking: activeOps.formMaking ? fullSums.formMaking : 0,
      filmMounting: activeOps.filmMounting ? fullSums.filmMounting : 0,
      printing: activeOps.printing ? fullSums.printing : 0,
      lamination: activeOps.lamination ? fullSums.lamination : 0,
      embossing: activeOps.embossing ? fullSums.embossing : 0,
      dieCutting: activeOps.dieCutting ? fullSums.dieCutting : 0,
      folding: activeOps.folding ? fullSums.folding : 0,
      blockInsertion: activeOps.blockInsertion ? fullSums.blockInsertion : 0,
      coverMaking: activeOps.coverMaking ? fullSums.coverMaking : 0,
      blockProcessing: activeOps.blockProcessing ? fullSums.blockProcessing : 0
    };

    if (calcMode === 'auto') {
      // EXACT ORIGINAL ADAPTED BUSINESS LOGIC
      printingCost = physicalSheets * printRate * passes;
      
      // Additional premium factors
      let extraBindingCost = 0;
      if (bindingType === 'staple') extraBindingCost = numQty * 1.5;
      if (bindingType === 'spring') extraBindingCost = numQty * 6.5;
      if (bindingType === 'glue') extraBindingCost = numQty * 12.0;
      if (bindingType === 'hardcover') extraBindingCost = numQty * 45.0;

      let extraLaminationCost = 0;
      if (laminationType !== 'none') {
        const factor = laminationType === 'softtouch' ? 2.5 : 1.2;
        extraLaminationCost = physicalSheets * factor;
      }

      let extraFoldingCost = creaseCount * 0.15 * numQty;

      subtotal = designCost + paperCost + printingCost + cuttingCost + packingCost + extraBindingCost + extraLaminationCost + extraFoldingCost;
    } else {
      // 1С OPERATIONAL LOGIC
      const opsCostTotal = Object.values(sums).reduce((acc, curr) => acc + curr, 0);
      subtotal = designCost + paperCost + opsCostTotal + cuttingCost + packingCost;
    }

    const marginAmount = subtotal * (marginPercent / 100);
    const finalPrice = subtotal + marginAmount;
    const unitPrice = finalPrice / numQty;

    return {
      machine,
      format,
      physicalSheets,
      itemsPerSheet,
      paperCost,
      rates,
      actualVolumes,
      sums,
      fullSums,
      printingCost,
      subtotal,
      marginAmount,
      finalPrice,
      unitPrice,
      cuttingCost,
      packingCost,
      totalPackages
    };
  }, [quantity, paperType, colors, designCost, norms, packingCount, marginPercent, activeOps, opCustomRates, opVolumes, category, calcMode, selectedFormat, bindingType, laminationType, creaseCount]);

  // Check if warehouse has enough paper
  const paperWarehouseStatus = useMemo(() => {
    const material = materials.find(m => m.type === paperType);
    if (!material) return { available: 0, hasEnough: false };
    const availableStock = material.quantity - material.reserved;
    return {
      available: availableStock,
      hasEnough: availableStock >= calculatedOps.physicalSheets,
      materialName: material.name
    };
  }, [materials, paperType, calculatedOps.physicalSheets]);


  const handleSendToProduction = () => {
    const specNotes = `Формат: ${selectedFormat} (${orientation}), Скріплення: ${bindingType}, Ламінація: ${laminationType}, Бігів: ${creaseCount} ст.`;
    
    addOrder({
      name: `№ ${orderNumber} - ${name} [${category === 'Бланки' ? subCategory : category}]`,
      clientId: selectedClientId,
      category: category === 'Бланки' ? subCategory : category,
      quantity: Number(quantity) || 1,
      packingCount: Number(packingCount) || 1,
      paperType,
      colors,
      isSamNaSebe,
      designCost,
      margin: marginPercent,
      machine: calculatedOps.machine,
      format: calculatedOps.format,
      physicalSheets: calculatedOps.physicalSheets,
      itemsPerSheet: calculatedOps.itemsPerSheet,
      subtotal: calculatedOps.subtotal,
      marginAmount: calculatedOps.marginAmount,
      finalPrice: calculatedOps.finalPrice,
      unitPrice: calculatedOps.unitPrice,
      paymentStatus: 'unpaid',
      prepayment: 0,
      notes: specNotes
    });

    alert(`Замовлення № ${orderNumber} успішно створено та надіслано у виробництво!`);
    const nextOrderNum = Math.floor(10000 + Math.random() * 90000);
    setOrderNumber(nextOrderNum);
    setName(category === 'Бланки' ? subCategory + ' А4' : category);
  };

  const handleSaveAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    const newTpl: CalcTemplate = {
      name: templateName,
      category,
      quantity: Number(quantity) || 1,
      packingCount: Number(packingCount) || 1,
      paperType,
      colors,
      isSamNaSebe,
      marginPercent,
      calcMode,
      activeOps,
      opCustomRates,
      opVolumes,
      format: selectedFormat,
      orientation,
      coverPaperType,
      coverColors,
      bindingType,
      laminationType,
      creaseCount
    };

    const updated = [newTpl, ...templates];
    setTemplates(updated);
    localStorage.setItem('crm_calc_templates', JSON.stringify(updated));
    setTemplateName('');
    setShowTemplateModal(false);
    alert('Шаблон розрахунку збережено!');
  };

  const handleLoadTemplate = (tpl: CalcTemplate) => {
    setCategory(tpl.category as any);
    setQuantity(tpl.quantity);
    setPackingCount(tpl.packingCount);
    setPaperType(tpl.paperType);
    setColors(tpl.colors);
    setIsSamNaSebe(tpl.isSamNaSebe);
    setMarginPercent(tpl.marginPercent);
    setCalcMode(tpl.calcMode || 'auto');
    setActiveOps(tpl.activeOps);
    setOpCustomRates(tpl.opCustomRates);
    setOpVolumes(tpl.opVolumes);
    
    if (tpl.format) setSelectedFormat(tpl.format);
    if (tpl.orientation) setOrientation(tpl.orientation);
    if (tpl.bindingType) setBindingType(tpl.bindingType);
    if (tpl.laminationType) setLaminationType(tpl.laminationType);
    if (tpl.creaseCount !== undefined) setCreaseCount(tpl.creaseCount);

    setStep('editor');
    alert(`Завантажено шаблон: ${tpl.name}`);
  };
  void handleLoadTemplate;

  const generatePDF = () => {
    const element = document.getElementById('invoice-preview-container');
    if (!element) return;

    const matchNum = (name || '').match(/№\s*(\d+)/);
    const num = matchNum ? matchNum[1] : (orderNumber || '33811');

    let rawProd = subCategory || category || 'Бланки';
    if (!rawProd || (rawProd as string) === 'Основна' || (rawProd as string).includes('Угода')) {
      if ((name || '').toLowerCase().includes('бланк')) {
        rawProd = 'Бланки';
      } else if ((name || '').toLowerCase().includes('листівк')) {
        rawProd = 'Листівки';
      } else {
        rawProd = 'Бланки';
      }
    }
    const safeProdName = rawProd.replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_');

    const rawClient = activeClient?.name || 'Замовник №1';
    const safeClientName = rawClient.replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_');

    const paperShort = paperType === 'offset' ? 'Офс._70г' : paperType === 'gazetka' ? 'Газ._45г' : 'Крейда_130г';
    const turnShort = turnType === 'sam_na_sebe' ? 'сс' : turnType === 'bez_oborotu' ? 'без_обор' : 'чо';

    const fileName = `№${num}_${safeProdName}_—_${safeClientName}_(${selectedFormat},_${paperShort},_${colors},_${turnShort},_${quantity}_шт.).pdf`;

    // Clone element to a temporary clean container on document.body to eliminate modal position Y-offset blank page bug
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0px';
    tempContainer.style.width = '750px';
    tempContainer.style.backgroundColor = '#FFFFFF';
    tempContainer.style.color = '#1C1C1E';

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.margin = '0';
    clone.style.padding = '24px';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    clone.style.backgroundColor = '#FFFFFF';
    clone.style.color = '#1C1C1E';

    // Traverse clone and replace any CSS variables with explicit high-contrast print colors so sheet stays white in Dark Theme
    const allElements = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];
    allElements.forEach(el => {
      const style = el.getAttribute('style') || '';
      if (style.includes('var(')) {
        const newStyle = style
          .replace(/var\(--bg-card-subtle\)/g, '#F8FAFC')
          .replace(/var\(--bg-card\)/g, '#FFFFFF')
          .replace(/var\(--bg-system\)/g, '#FFFFFF')
          .replace(/var\(--border-light\)/g, '#E2E8F0')
          .replace(/var\(--text-dark\)/g, '#1C1C1E')
          .replace(/var\(--text-medium\)/g, '#636366')
          .replace(/var\(--primary\)/g, '#007AFF');
        el.setAttribute('style', newStyle);
      }
    });

    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    const opt = {
      margin:       [6, 6, 6, 6] as [number, number, number, number],
      filename:     fileName,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#FFFFFF'
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak:    { mode: ['avoid-all', 'css'] }
    };

    html2pdf().from(clone).set(opt).save().then(() => {
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }).catch(() => {
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    });
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      {step === 'catalog' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header */}
          <div className="header-title-container">
            <div>
              <h2 className="page-title">Поліграфічний калькулятор</h2>
              <p className="subtitle">Оберіть категорію продукції для детального прорахунку</p>
            </div>
          </div>

          {/* Top Main Category Switcher (Exact Sborka Header Styling) */}
          {/* Top Category Tabs Navigation */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-xl overflow-x-auto shadow-inner mb-6">
            {[
              { key: 'products', label: 'Усі Продукти' },
              { key: 'offset', label: 'Офсетний друк', badge: '1С Авторозрахунок' },
              { key: 'digital', label: 'Цифровий друк' },
              { key: 'wide', label: 'Широкоформатний' },
              { key: 'roll', label: 'Рулонний друк' },
              { key: 'films', label: 'Кольорові плівки' }
            ].map(tab => {
              const isActive = mainCategoryTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMainCategoryTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: PRODUCTS (All Categories) */}
          {mainCategoryTab === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { title: 'Бланки та Листи', desc: 'Друк бланкової продукції на офсетному та самокопіювальному папері.', icon: FileText, color: 'text-blue-600 bg-blue-50', cat: 'Бланки' },
                { title: 'Візитки', desc: '90х50 мм або євро-формат, ламінація SoftTouch та скруглiння кутів.', icon: Layout, color: 'text-indigo-600 bg-indigo-50', cat: 'Візитки' },
                { title: 'Буклети', desc: 'Рекламні буклети з 1, 2 або 3 фальцями (згинами).', icon: Layers, color: 'text-amber-600 bg-amber-50', cat: 'Буклети' },
                { title: 'Дипломи випускні', desc: 'Святкові дипломи, почесні грамоти та сертифікати випускників.', icon: BookOpen, color: 'text-yellow-600 bg-yellow-50', cat: 'Дипломи випускні' },
                { title: 'Календарики кишенькові', desc: 'Кишенькові календарики 70х100мм з двосторонньою ламінацією.', icon: Calendar, color: 'text-pink-600 bg-pink-50', cat: 'Календарики кишенькові' },
                { title: 'Книги / Брошури', desc: 'Багатосторінкові книги на скобу, термоклей або м\'яку обкладинку.', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50', cat: 'Книги' },
                { title: 'Листівки', desc: 'Рекламні листівки А6, А5, А4 на крейдованому папері.', icon: FileText, color: 'text-cyan-600 bg-cyan-50', cat: 'Листівки' },
                { title: 'Меню для ресторанів', desc: 'Меню з цупкою ламінацією, скріпленням пружиною або болтами.', icon: Layers, color: 'text-purple-600 bg-purple-50', cat: 'Меню' },
                { title: 'Наклейки та Стікери', desc: 'Самоклеючі наклейки з плотерною надсічкою на аркушах.', icon: Layers, color: 'text-fuchsia-600 bg-fuchsia-50', cat: 'Наклейки' },
                { title: 'Плакати та Афіші', desc: 'Великоформатний друк плакатів А3, А2, А1 для інтер\'єру та реклами.', icon: Layout, color: 'text-blue-600 bg-blue-50', cat: 'Плакати' },
                { title: 'Флаєри', desc: 'Єврофлаєри (99х210мм) яскравого повноколірного 4+4 друку.', icon: FileText, color: 'text-amber-600 bg-amber-50', cat: 'Флаєри' },
                { title: 'Нотаріальні книги', desc: 'Спеціалізовані нотаріальні реєстри у твердій прошивній палітурці.', icon: BookOpen, color: 'text-slate-600 bg-slate-100', cat: 'Нотаріальні книги' },
                { title: 'Дипломи і палітурка', desc: 'Тверда палітурка дипломних робіт, дисертацій з тисненням фольгою.', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50', cat: 'Дипломи і палітурка' },
                { title: 'Логотипи виготовлення', desc: 'Брендування логотипів на фірмовій айдентиці та матеріалах.', icon: Layout, color: 'text-indigo-600 bg-indigo-50', cat: 'Логотипи виготовлення' },
                { title: 'Шкільні журнали', desc: 'Класні журнали успішності та шкільні облікові відомості.', icon: BookOpen, color: 'text-rose-600 bg-rose-50', cat: 'Шкільні журнали' },
                { title: 'Етикетки та Бірки', desc: 'Товарні етикетки, маркувальні ярлики та фасувальні стікери.', icon: Layers, color: 'text-teal-600 bg-teal-50', cat: 'Етикетки' },
                { title: 'Календарі', desc: 'Квартальні, настінні перекидні або будиночки на пружині.', icon: Calendar, color: 'text-red-600 bg-red-50', cat: 'Календарі' },
                { title: 'Блокноти', desc: 'Фірмові блокноти А5, А4 з пружиною та персоналізованою обкладинкою.', icon: BookOpen, color: 'text-teal-600 bg-teal-50', cat: 'Блокноти' },
                { title: 'Фірмові Папки', desc: 'Корпоративні папки з висічним замком для документів.', icon: FolderOpen, color: 'text-slate-600 bg-slate-100', cat: 'Папки' }
              ].map(item => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={item.title}
                    onClick={() => handleSelectCategory(item.cat)}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${item.color}`}>
                        <IconComponent size={24} />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed m-0">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Перейти до розрахунку</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: OFFSET PRINTING (Overview & Sheet Detailed Calculator) */}
          {mainCategoryTab === 'offset' && (
            <div className="flex flex-col gap-6">
              {/* Offset Sub-Tab Navigation Header */}
              {(offsetSubTab === 'sheets' || offsetSubTab === 'felling' || offsetSubTab === 'multipage') ? (
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <button
                      type="button"
                      onClick={() => setOffsetSubTab('overview')}
                      className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span>Офсетний друк</span>
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-extrabold">
                      {offsetSubTab === 'sheets' && 'Листова продукція (Збірні спуски)'}
                      {offsetSubTab === 'felling' && 'Висічна продукція (Штампи)'}
                      {offsetSubTab === 'multipage' && 'Багатосторінкова продукція'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOffsetSubTab('overview')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all"
                  >
                    ← Всі 16 категорій
                  </button>
                </div>
              ) : (
                /* 4 Technology Header Columns */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Листова продукція', badge: 'Збірні спуски', desc: 'Візитівки, листівки, бланки, буклети, наліпки, плакати, флаєри…', subTab: 'sheets', icon: <FileText size={20} className="text-blue-500" /> },
                    { title: 'Висічна продукція', badge: 'Штампи', desc: 'Фігурні наліпки, хенгери, папки, кишенькові календарі, підставки…', subTab: 'felling', icon: <Layers size={20} className="text-amber-500" /> },
                    { title: 'Багатосторінкова', badge: 'Брошурування', desc: 'Каталоги, журнали, брошури, блокноти на пружині, ресторанні меню…', subTab: 'multipage', icon: <BookOpen size={20} className="text-emerald-500" /> },
                    { title: 'Індивідуальний розрахунок', badge: 'Нестандартні', desc: 'Комплексні комерційні пропозиції з ручним підбором операцій', subTab: 'custom', icon: <Settings size={20} className="text-purple-500" /> }
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => setOffsetSubTab(item.subTab as any)}
                      className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            {item.icon}
                            <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</span>
                          </div>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed m-0 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* OVERVIEW SUBTAB: 16-Card Modern Product Grid */}
              {offsetSubTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* 1. Візитівка */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Візитки', subCategory: 'Візитівка', subTab: 'sheets', preset: '1', w: '90', h: '50', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Візитівка
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">Швидкий вибір</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: '90×50', preset: '1', w: '90', h: '50', kind: '1' },
                          { name: '85×55', preset: '5', w: '85', h: '55', kind: '1' },
                          { name: '50×50', preset: '5', w: '50', h: '50', kind: '2' },
                          { name: 'Кругла', preset: '5', w: '50', h: '50', kind: '7' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Візитки', subCategory: 'Візитівка', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. Календар */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календар', subTab: 'sheets', preset: '91', w: '100', h: '70', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Календар кишеньковий
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Ламінація</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: '100×70', preset: '91', w: '100', h: '70', kind: '1' },
                          { name: '90×60', preset: '90', w: '90', h: '60', kind: '1' },
                          { name: '70×70', preset: '256', w: '70', h: '70', kind: '2' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календар', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Флаєр */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Флаєри', subCategory: 'Флаєр', subTab: 'sheets', preset: '25', w: '99', h: '210', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Флаєр
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-600">Євроформат</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: '210×99', preset: '25', w: '99', h: '210', kind: '1' },
                          { name: '210×198', preset: '26', w: '198', h: '210', kind: '6' },
                          { name: '99×99', preset: '24', w: '99', h: '99', kind: '2' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Флаєри', subCategory: 'Флаєр', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. Листівка */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '28', w: '70', h: '100', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Листівка
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-600">А-формати</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'А7', preset: '28', w: '70', h: '100', kind: '1' },
                          { name: 'А6', preset: '312', w: '105', h: '148', kind: '1' },
                          { name: 'А5', preset: '32', w: '148', h: '210', kind: '1' },
                          { name: 'А4', preset: '34', w: '210', h: '297', kind: '1' },
                          { name: 'А3', preset: '36', w: '297', h: '420', kind: '1' },
                          { name: 'Кругла', preset: '37', w: '70', h: '70', kind: '7' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5. Плакати */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: '36', w: '297', h: '420', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Плакати та постери
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">Великий формат</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'А3', preset: '36', w: '297', h: '420', kind: '1' },
                          { name: 'В3', preset: 'b3', w: '340', h: '490', kind: '1' },
                          { name: 'А2', preset: '15', w: '420', h: '594', kind: '1' },
                          { name: 'В2', preset: 'b2', w: '480', h: '690', kind: '1' },
                          { name: 'А1', preset: '16', w: '594', h: '841', kind: '1' },
                          { name: 'B1', preset: 'b1', w: '680', h: '980', kind: '1' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 6. Сети */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Сети', subCategory: 'Сети', subTab: 'sheets', preset: 'sets_a3', w: '420', h: '297', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Сети / Плейсмати
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">HoReCa</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'А3 (420×297)', preset: 'sets_a3', w: '420', h: '297', kind: '1' },
                          { name: 'В3 (490×340)', preset: 'sets_b3', w: '490', h: '340', kind: '1' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Сети', subCategory: 'Сети', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 7. Буклет */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Буклети', subCategory: 'Буклет', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '6' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Буклет (12 видів)
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">Фальцовка</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'А4 в Євро', preset: '34', w: '210', h: '297', kind: '6' },
                          { name: '2Євро в Євро', preset: '26', w: '198', h: '210', kind: '6' },
                          { name: 'А6', preset: '312', w: '105', h: '148', kind: '6' },
                          { name: 'А5', preset: '32', w: '148', h: '210', kind: '6' },
                          { name: 'А4', preset: '34', w: '210', h: '297', kind: '6' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Буклети', subCategory: 'Буклет', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 8. Каталог */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Книги', subCategory: 'Каталог', subTab: 'multipage', stitching: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Каталог / Брошура
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-600">Багатосторінкова</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'Скоба', id: '1' },
                          { label: 'Пружина', id: '2' },
                          { label: 'Клей', id: '3' }
                        ].map(st => (
                          <button
                            key={st.label}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Книги', subCategory: 'Каталог', subTab: 'multipage', stitching: st.id })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 9. Блокнот */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Блокноти', subCategory: 'Блокнот', subTab: 'sheets', preset: '32', w: '148', h: '210', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Блокнот на пружині
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-600">Пружина</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'А6', preset: '312', w: '105', h: '148' },
                          { name: 'А5', preset: '32', w: '148', h: '210' },
                          { name: 'А4', preset: '34', w: '210', h: '297' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Блокноти', subCategory: 'Блокнот', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: '1' })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 10. Наліпка */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Наклейки', subCategory: 'Наліпка', subTab: 'sheets', preset: '1', w: '90', h: '50', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Наліпка / Стікер
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-600">Самоклейка</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: '90×50', preset: '1', w: '90', h: '50', kind: '1' },
                          { name: '50×50', preset: '5', w: '50', h: '50', kind: '2' },
                          { name: 'Кругла', preset: '5', w: '50', h: '50', kind: '7' },
                          { name: 'Овальна', preset: '1', w: '90', h: '50', kind: '8' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Наклейки', subCategory: 'Наліпка', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 11. Папка А4 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Папки', subCategory: 'Папка А4', subTab: 'sheets', preset: '34', w: '210', h: '297', folderSpine: '5' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Папка А4
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">Висічний замок</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Без корінця', spine: '0' as const, rezinka: 'none' as const },
                          { name: 'Корінець 5мм', spine: '5' as const, rezinka: 'none' as const },
                          { name: 'З резинкою', spine: '5' as const, rezinka: 'blue' as const }
                        ].map(fmt => (
                          <button
                            key={fmt.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Папки', subCategory: 'Папка А4', subTab: 'sheets', preset: '34', w: '210', h: '297', folderSpine: fmt.spine, folderRezinka: fmt.rezinka })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {fmt.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 12. Листівка (Одинарна/Складна/Кругла) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '32', w: '148', h: '210', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Листівка фігурна
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Біговка</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Одинарна', preset: '32', w: '148', h: '210', kind: '1' },
                          { name: 'Складна', preset: '34', w: '210', h: '297', kind: '6' },
                          { name: 'Кругла', preset: '37', w: '70', h: '70', kind: '7' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: item.kind })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 13. Календарні сітки */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарні сітки', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Календарні сітки
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">2026/2027</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарні сітки', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '1' })}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all flex items-center gap-1.5"
                        >
                          <Calendar size={13} className="text-blue-600" />
                          <span>Сітки 2026</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 14. Друк в листах */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Бланки', subCategory: 'Друк в листах', subTab: 'sheets', preset: '15', w: '420', h: '594', kind: '1' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Друк в листах
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-600">Без порізки</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'А2', preset: '15', w: '420', h: '594' },
                          { name: 'В2', preset: 'b2', w: '480', h: '690' },
                          { name: 'А1', preset: '16', w: '594', h: '841' },
                          { name: 'B1', preset: 'b1', w: '680', h: '980' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Бланки', subCategory: 'Друк в листах', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, kind: '1' })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 15. Конверт */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Бланки', subCategory: 'Конверт', subTab: 'sheets', preset: '25', w: '110', h: '220', envelopeFormat: 'E65' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Конверт
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">Корпоративний</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Євро', preset: '25', w: '110', h: '220', fmt: 'E65' as const },
                          { name: 'С6', preset: '21', w: '114', h: '162', fmt: 'C6' as const },
                          { name: 'С5', preset: '32', w: '162', h: '229', fmt: 'C5' as const },
                          { name: 'С4', preset: '34', w: '229', h: '324', fmt: 'C4' as const }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Бланки', subCategory: 'Конверт', subTab: 'sheets', preset: item.preset, w: item.w, h: item.h, envelopeFormat: item.fmt })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 16. Календарі висічні */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарі висічні', subTab: 'felling', preset: '160', w: '210', h: '300', stamp: '160' })}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Календарі висічні
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-600">Настільні</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Будинок', preset: '160', w: '210', h: '300' },
                          { name: 'Пірамідка', preset: '161', w: '305', h: '134' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарі висічні', subTab: 'felling', preset: item.preset, w: item.w, h: item.h, stamp: item.preset })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 17. Пакувальний папір */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('36'); setSheetCustomWidth('297'); setSheetCustomHeight('420'); handleSelectCategory('Бланки'); }}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors m-0"
                        >
                          Пакувальний папір
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-600">Крафт / Офсет</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'А3', preset: '36', w: '297', h: '420' },
                          { name: 'В3', preset: 'b3', w: '340', h: '490' },
                          { name: 'А2', preset: '15', w: '420', h: '594' },
                          { name: 'В2', preset: 'b2', w: '480', h: '690' },
                          { name: 'А1', preset: '16', w: '594', h: '841' },
                          { name: 'B1', preset: 'b1', w: '680', h: '980' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Бланки'); }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/60 text-slate-700 transition-all"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DETAILED SHEET CALCULATOR (Офсетний друк / Листова) */}
              {offsetSubTab === 'sheets' && (
                <div className="flex flex-col gap-6">
                  {/* Top Product Header & Quick Links Bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <span>Офсетний друк</span>
                            <span>/</span>
                            <span className="text-blue-600 font-bold">Листова продукція</span>
                          </div>
                          <h3 className="text-xl font-extrabold text-slate-900 m-0 mt-0.5">
                            {(category as string) || 'Візитівки'}
                          </h3>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOffsetSubTab('overview')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all"
                      >
                        ← Назад до категорій
                      </button>
                    </div>

                    {/* Quick Info Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      <button type="button" onClick={() => setActiveInfoModal('instr')} className="flex items-center gap-2 p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 text-xs font-semibold transition-colors">
                        <FileText size={15} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">Інструкція</span>
                      </button>
                      <button type="button" onClick={() => setActiveInfoModal('materials')} className="flex items-center gap-2 p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 text-xs font-semibold transition-colors">
                        <Layers size={15} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">Матеріали</span>
                      </button>
                      <button type="button" onClick={() => setActiveInfoModal('review')} className="flex items-center gap-2 p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 text-xs font-semibold transition-colors">
                        <MessageSquare size={15} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">Ваш відгук</span>
                      </button>
                      <button type="button" onClick={() => setActiveInfoModal('terms')} className="flex items-center gap-2 p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 text-xs font-semibold transition-colors">
                        <Clock size={15} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">Термін друку</span>
                      </button>
                      <button type="button" onClick={() => setActiveInfoModal('samples')} className="flex items-center gap-2 p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 text-xs font-semibold transition-colors">
                        <Tag size={15} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">Зразки матеріалів</span>
                      </button>
                      <button type="button" onClick={() => setActiveInfoModal('bug')} className="flex items-center gap-2 p-2 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50/60 text-xs font-semibold transition-colors">
                        <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
                        <span className="truncate">Знайшли помилку?</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Kind / Folding Type Selection Bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">
                        {(category as string) === 'Буклети' ? 'Вид складання' :
                         (category as string) === 'Візитки' ? 'Вид готового виробу' :
                         (category as string) === 'Папки' ? 'Конструкція папки' :
                         'Вид продукції'}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">Оберіть базовий вид або геометрію</span>
                    </div>

                    {/* 1. Буклети: 12 Folding styles */}
                    {category === 'Буклети' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {[
                          { id: '1', name: 'Книжка', sub: '1 складання', folding: '1', creases: 1 },
                          { id: '121', name: 'Асиметричний', sub: '1 складання', folding: '121', creases: 1 },
                          { id: '21', name: 'Намотування', sub: '2 складання', folding: '21', creases: 2 },
                          { id: '23', name: 'Вікно', sub: '2 складання', folding: '23', creases: 2 },
                          { id: '22', name: 'Гармошка', sub: '2 складання', folding: '22', creases: 2 },
                          { id: '34', name: 'Комбінований', sub: '2 складання', folding: '34', creases: 2 },
                          { id: '31', name: 'Намотування', sub: '3 складання', folding: '31', creases: 3 },
                          { id: '32', name: 'Гармошка', sub: '3 складання', folding: '32', creases: 3 },
                          { id: '33', name: 'Вікно', sub: '3 складання', folding: '33', creases: 3 },
                          { id: '41', name: 'Намотування', sub: '4 складання', folding: '41', creases: 4 },
                          { id: '42', name: 'Гармошка', sub: '4 складання', folding: '42', creases: 4 },
                          { id: '52', name: 'Гармошка', sub: '5 складань', folding: '52', creases: 5 },
                        ].map(fold => {
                          const isActive = postFolding === fold.folding || cardKind === fold.id;
                          return (
                            <div
                              key={fold.id + fold.name}
                              onClick={() => {
                                setCardKind('6');
                                setPostFolding(fold.folding);
                                setPostCreasing(fold.creases.toString());
                              }}
                              className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                                isActive
                                  ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-9 h-11 rounded border flex justify-between p-0.5 bg-white ${isActive ? 'border-blue-500' : 'border-slate-400'}`}>
                                <div className="flex-1 border-r border-dashed border-slate-300 h-full"></div>
                                {fold.creases >= 2 && <div className="flex-1 border-r border-dashed border-slate-300 h-full"></div>}
                                {fold.creases >= 3 && <div className="flex-1 border-r border-dashed border-slate-300 h-full"></div>}
                              </div>
                              <span className={`text-xs font-bold text-center leading-tight ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                                {fold.name}
                              </span>
                              <span className={`text-[10px] ${isActive ? 'text-blue-500 font-semibold' : 'text-slate-400'}`}>
                                {fold.sub}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 2. Візитівки: 6 Visual SVG Cards */}
                    {(category as string) === 'Візитки' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          {
                            id: '1',
                            name: 'Стандартні',
                            preset: '1',
                            w: '90',
                            h: '50',
                            renderSvg: (active: boolean) => (
                              <svg width="60" height="38" viewBox="0 0 64 42" fill="none">
                                <rect x="4" y="6" width="56" height="30" rx="3" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" fill={active ? '#eff6ff' : '#ffffff'} />
                                <rect x="27" y="16" width="10" height="10" stroke={active ? '#2563eb' : '#cbd5e1'} strokeWidth="1.2" fill="none" />
                              </svg>
                            )
                          },
                          {
                            id: '2',
                            name: 'Квадратні',
                            preset: '5',
                            w: '50',
                            h: '50',
                            renderSvg: (active: boolean) => (
                              <svg width="60" height="38" viewBox="0 0 64 42" fill="none">
                                <rect x="17" y="6" width="30" height="30" rx="3" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" fill={active ? '#eff6ff' : '#ffffff'} />
                                <rect x="27" y="16" width="10" height="10" stroke={active ? '#2563eb' : '#cbd5e1'} strokeWidth="1.2" fill="none" />
                              </svg>
                            )
                          },
                          {
                            id: '6',
                            name: 'Складні',
                            preset: '3',
                            w: '90',
                            h: '100',
                            renderSvg: (active: boolean) => (
                              <svg width="60" height="38" viewBox="0 0 64 42" fill="none">
                                <rect x="10" y="4" width="32" height="34" rx="3" stroke="#cbd5e1" strokeWidth="1.2" fill="#f8fafc" />
                                <rect x="20" y="8" width="34" height="28" rx="3" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" fill={active ? '#eff6ff' : '#ffffff'} />
                                <line x1="20" y1="22" x2="54" y2="22" stroke={active ? '#2563eb' : '#94a3b8'} strokeDasharray="2 2" strokeWidth="1.2" />
                              </svg>
                            )
                          },
                          {
                            id: '7',
                            name: 'Круг',
                            preset: '5',
                            w: '50',
                            h: '50',
                            renderSvg: (active: boolean) => (
                              <svg width="60" height="38" viewBox="0 0 64 42" fill="none">
                                <circle cx="32" cy="21" r="16" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" fill={active ? '#eff6ff' : '#ffffff'} />
                                <rect x="27" y="16" width="10" height="10" stroke={active ? '#2563eb' : '#cbd5e1'} strokeWidth="1.2" fill="none" />
                              </svg>
                            )
                          },
                          {
                            id: '8',
                            name: 'Овал',
                            preset: '1',
                            w: '90',
                            h: '50',
                            renderSvg: (active: boolean) => (
                              <svg width="60" height="38" viewBox="0 0 64 42" fill="none">
                                <ellipse cx="32" cy="21" rx="26" ry="16" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" fill={active ? '#eff6ff' : '#ffffff'} />
                                <rect x="27" y="16" width="10" height="10" stroke={active ? '#2563eb' : '#cbd5e1'} strokeWidth="1.2" fill="none" />
                              </svg>
                            )
                          },
                          {
                            id: '9',
                            name: 'Заокруглені кути',
                            preset: '1',
                            w: '90',
                            h: '50',
                            renderSvg: (active: boolean) => (
                              <svg width="60" height="38" viewBox="0 0 64 42" fill="none">
                                <rect x="4" y="6" width="56" height="30" rx="8" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth="1.5" fill={active ? '#eff6ff' : '#ffffff'} />
                                <rect x="27" y="16" width="10" height="10" stroke={active ? '#2563eb' : '#cbd5e1'} strokeWidth="1.2" fill="none" />
                              </svg>
                            )
                          }
                        ].map(item => {
                          const isActive = cardKind === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setCardKind(item.id);
                                setSheetSizePreset(item.preset);
                                setSheetCustomWidth(item.w);
                                setSheetCustomHeight(item.h);
                              }}
                              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                isActive
                                  ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {item.renderSvg(isActive)}
                              <span className={`text-xs font-bold text-center ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>
                                {item.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 3. Other Categories Format Buttons */}
                    {category !== 'Буклети' && (category as string) !== 'Візитки' && (
                      <div className="flex gap-2 flex-wrap">
                        {(() => {
                          const catStr = category as string;
                          let items: Array<{ id: string; name: string; preset: string; w: string; h: string }> = [];

                          if (catStr === 'Календарики кишенькові' || catStr === 'Календарі') {
                            items = [
                              { id: '1', name: 'Кишеньковий (100×70)', preset: '91', w: '100', h: '70' },
                              { id: '2', name: 'Календар (90×60)', preset: '90', w: '90', h: '60' },
                              { id: '3', name: 'Квадратний (70×70)', preset: '256', w: '70', h: '70' },
                              { id: '4', name: 'Календар «Будинок» (210×300)', preset: '160', w: '210', h: '300' },
                              { id: '5', name: 'Календар «Пірамідка» (305×134)', preset: '161', w: '305', h: '134' }
                            ];
                          } else if (catStr === 'Плакати') {
                            items = [
                              { id: '1', name: 'Плакат А3 (297×420)', preset: '36', w: '297', h: '420' },
                              { id: '2', name: 'Плакат В3 (340×490)', preset: 'b3', w: '340', h: '490' },
                              { id: '3', name: 'Плакат А2 (420×594)', preset: '15', w: '420', h: '594' },
                              { id: '4', name: 'Плакат В2 (480×690)', preset: 'b2', w: '480', h: '690' },
                              { id: '5', name: 'Плакат А1 (594×841)', preset: '16', w: '594', h: '841' },
                              { id: '6', name: 'Плакат В1 (680×980)', preset: 'b1', w: '680', h: '980' }
                            ];
                          } else if (catStr === 'Сети') {
                            items = [
                              { id: '1', name: 'Сети А3 (420×297)', preset: 'sets_a3', w: '420', h: '297' },
                              { id: '2', name: 'Сети В3 (490×340)', preset: 'sets_b3', w: '490', h: '340' }
                            ];
                          } else if (catStr === 'Наклейки') {
                            items = [
                              { id: '1', name: 'Стікер 50×50 мм', preset: '5', w: '50', h: '50' },
                              { id: '2', name: 'Стікер 90×50 мм', preset: '1', w: '90', h: '50' },
                              { id: '3', name: 'Єврофлаєр стікер (99×210)', preset: '25', w: '99', h: '210' },
                              { id: '4', name: 'Наклейка А6 (105×148)', preset: '312', w: '105', h: '148' },
                              { id: '5', name: 'Наклейка А5 (148×210)', preset: '32', w: '148', h: '210' },
                              { id: '6', name: 'Наклейка А4 (210×297)', preset: '34', w: '210', h: '297' }
                            ];
                          } else if (catStr === 'Папки') {
                            items = [
                              { id: '1', name: 'Без корінця (2 клапани)', preset: '34', w: '210', h: '297' },
                              { id: '2', name: 'Корінець 5 мм (2 клапани)', preset: '34', w: '210', h: '297' },
                              { id: '3', name: 'Корінець 5 мм (3 клапани з резинкою)', preset: '34', w: '210', h: '297' }
                            ];
                          } else if (catStr === 'Флаєри' || catStr === 'Листівки') {
                            items = [
                              { id: '1', name: 'Єврофлаєр (99×210)', preset: '25', w: '99', h: '210' },
                              { id: '2', name: '1/2 Флаєра (99×99)', preset: '24', w: '99', h: '99' },
                              { id: '3', name: 'Листівка А7 (70×100)', preset: '28', w: '70', h: '100' },
                              { id: '4', name: 'Подвійний флаєр (198×210)', preset: '26', w: '198', h: '210' },
                              { id: '5', name: 'Листівка А6 (105×148)', preset: '312', w: '105', h: '148' },
                              { id: '6', name: 'Листівка А5 (148×210)', preset: '32', w: '148', h: '210' },
                              { id: '7', name: 'Листівка А4 (210×297)', preset: '34', w: '210', h: '297' }
                            ];
                          } else if (catStr === 'Блокноти') {
                            items = [
                              { id: '1', name: 'Блокнот А6 (105×148)', preset: '312', w: '105', h: '148' },
                              { id: '2', name: 'Блокнот А5 (148×210)', preset: '32', w: '148', h: '210' },
                              { id: '3', name: 'Блокнот А4 (210×297)', preset: '34', w: '210', h: '297' }
                            ];
                          } else {
                            items = [
                              { id: '1', name: 'Формат А4 (210×297)', preset: '34', w: '210', h: '297' },
                              { id: '2', name: 'Формат А3 (297×420)', preset: '36', w: '297', h: '420' },
                              { id: '3', name: 'Формат А2 (420×594)', preset: '15', w: '420', h: '594' },
                              { id: '4', name: 'Формат В3 (340×490)', preset: 'b3', w: '340', h: '490' }
                            ];
                          }

                          return items.map(kindItem => {
                            const isActive = sheetSizePreset === kindItem.preset || cardKind === kindItem.id;
                            return (
                              <button
                                key={kindItem.id + kindItem.name}
                                type="button"
                                onClick={() => {
                                  setCardKind(kindItem.id);
                                  setSheetSizePreset(kindItem.preset);
                                  setSheetCustomWidth(kindItem.w);
                                  setSheetCustomHeight(kindItem.h);
                                }}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700 border-blue-400 font-bold ring-2 ring-blue-500/20'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/60'
                                }`}
                              >
                                {kindItem.name}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}

                    {/* Specialized Product Options Configurator */}
                    {category === 'Папки' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0">📁 Параметри висічної папки А4</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Штамп та корінець:</label>
                            <select value={folderSpine} onChange={(e) => setFolderSpine(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Без корінця (штамп №57)</option>
                              <option value="5">Корінець 5 мм (штамп №58)</option>
                              <option value="7">Корінець 7 мм (штамп №59)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Фіксуюча резинка:</label>
                            <select value={folderRezinka} onChange={(e) => setFolderRezinka(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="none">Без резинки</option>
                              <option value="blue">Синя резинка (+4.50 грн)</option>
                              <option value="red">Червона резинка (+4.50 грн)</option>
                              <option value="white">Біла резинка (+4.50 грн)</option>
                              <option value="black">Чорна резинка (+4.50 грн)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Вигляд відвантаження:</label>
                            <select value={folderFinish} onChange={(e) => setFolderFinish(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="sheets">В листах (самозбірна)</option>
                              <option value="assembled">Складена готова (+1.00 грн)</option>
                            </select>
                          </div>
                          <div className="flex items-center pt-5">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={folderVizSlot} onChange={(e) => setFolderVizSlot(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                              <span>Прорізи для візитки</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {category === 'Блокноти' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0">📒 Конфігуратор фірмового блокнота на пружині</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Колір пружини:</label>
                            <select value={notepadSpringColor} onChange={(e) => setNotepadSpringColor(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="white">⚪ Біла металева</option>
                              <option value="black">⚫ Чорна металева</option>
                              <option value="silver">🔘 Срібляста металева</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Сторона кріплення:</label>
                            <select value={notepadBindingEdge} onChange={(e) => setNotepadBindingEdge(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="short">По короткій стороні (зверху)</option>
                              <option value="long">По довгій стороні (збоку)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Обкладинка папір:</label>
                            <select value={notepadCoverPaper} onChange={(e) => setNotepadCoverPaper(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="250">Крейдований 250г</option>
                              <option value="300">Крейдований 300г</option>
                              <option value="350">Крейдований 350г</option>
                              <option value="kraft">Крафт 300г</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Ламінація обкладинки:</label>
                            <select value={notepadCoverLam} onChange={(e) => setNotepadCoverLam(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="none">Без ламінації</option>
                              <option value="gloss">Глянцева 1+0</option>
                              <option value="matte">Матова 1+0</option>
                              <option value="softtouch">Soft-touch 1+0</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Обсяг блоку:</label>
                            <select value={notepadBlockPages} onChange={(e) => setNotepadBlockPages(parseInt(e.target.value))} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="25">25 аркушів (50 стор.)</option>
                              <option value="50">50 аркушів (100 стор.)</option>
                              <option value="75">75 аркушів (150 стор.)</option>
                              <option value="100">100 аркушів (200 стор.)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Друк внутрішнього блоку:</label>
                            <select value={notepadBlockRuling} onChange={(e) => setNotepadBlockRuling(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="grid_1_0">Клітинка сіра (1+0)</option>
                              <option value="grid_1_1">Клітинка 2 сторони (1+1)</option>
                              <option value="lines_1_0">Лінійка сіра (1+0)</option>
                              <option value="blank">Чисті листи (0+0)</option>
                              <option value="custom_4_4">Кольоровий з логотипом (4+4)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Підкладка (задник):</label>
                            <select value={notepadPodkladka} onChange={(e) => setNotepadPodkladka(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="250">Картон білий 250г</option>
                              <option value="350">Картон білий 350г</option>
                              <option value="kraft">Крафт картон 300г</option>
                              <option value="grey">Палітурний картон 1.5мм</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {(category === 'Бланки' && ((subCategory as string) === 'Конверт' || (name || '').includes('Конверт'))) && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0">✉️ Параметри фірмового конверта</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Формат конверта:</label>
                            <select value={envelopeFormat} onChange={(e) => setEnvelopeFormat(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="E65">Євро DL (110×220 мм) — під лист А4 втричі</option>
                              <option value="C6">С6 (114×162 мм) — під лист А4 вчетверо (А6)</option>
                              <option value="C5">С5 (162×229 мм) — під лист А4 навпіл (А5)</option>
                              <option value="C4">С4 (229×324 мм) — під повний лист А4 без згину</option>
                            </select>
                          </div>
                          <div className="flex items-center pt-5">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={envelopeWindow} onChange={(e) => setEnvelopeWindow(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                              <span>Прозоре віконце під адресу</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {(category === 'Календарики кишенькові' || category === 'Календарі' || ((subCategory as string) === 'Календарні сітки' || (name || '').includes('сітки'))) && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0">📅 Параметри календарної сітки для квартальних календарів</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Рік календарної сітки:</label>
                            <select value={gridYear} onChange={(e) => setGridYear(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="2026">2026 рік (Поточний)</option>
                              <option value="2027">2027 рік (Новий сезон)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1">Дизайн та кольорова гама:</label>
                            <select value={gridType} onChange={(e) => setGridType(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="standart">Стандартна трисекційна (Синій/Сірий)</option>
                              <option value="gold">Преміум Золото (Gold edition)</option>
                              <option value="metallic">Срібло / Металік (Metallic edition)</option>
                              <option value="3in1">3 в 1 компактна сітка</option>
                            </select>
                          </div>
                          <div className="flex items-center pt-5">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={gridCursor} onChange={(e) => setGridCursor(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                              <span>Курсор з червоним віконцем</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {((category as string) === 'Сети' || (name || '').includes('Сети') || (name || '').includes('плейсмат')) && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0">🍽️ Параметри ресторанних сетів (плейсматів)</h4>
                        <p className="text-xs text-slate-500 m-0">
                          Одноразові підкладки на столи з крафт-паперу або офсетного паперу для захисту столів та меню.
                        </p>
                      </div>
                    )}

                    {((subCategory as string) === 'Друк в листах' || (name || '').includes('листах')) && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0">📄 Офсетний друк у листах без порізки</h4>
                        <p className="text-xs text-slate-500 m-0">
                          Продукція відвантажується на палетах у повних друкарських листах з приладними шкалами, мітками різу та хрестами суміщення для власної висічки або післядруку.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Size Selector and Product Preview Block */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Size Controls */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0 border-b border-slate-100 pb-2">Розмір</h4>
                      
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Оберіть стандартний розмір:</label>
                        <select
                          value={sheetSizePreset}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSheetSizePreset(val);
                            // Set custom width/height from preset
                            const presets: Record<string, [number, number]> = {
                              '1': [90, 50], '4': [45, 50], '3': [90, 100], '2': [180, 50],
                              '5': [50, 50], '7': [85, 110], '6': [170, 55],
                              '9': [100, 70], '91': [100, 70], '90': [90, 60], '256': [70, 70],
                              '12': [50, 70], '11': [100, 140], '10': [200, 70],
                              '160': [210, 300], '161': [305, 134],
                              '17': [99, 210], '20': [99, 99], '18': [198, 210], '181': [420, 99],
                              '21': [105, 148], '22': [148, 210], '23': [210, 297], '24': [99, 99], '25': [99, 210], '26': [198, 210],
                              '27': [50, 70], '28': [70, 100], '29': [52, 148], '31': [74, 210], '32': [148, 210],
                              '33': [105, 297], '34': [210, 297], '35': [148, 420], '36': [297, 420], '312': [105, 148],
                              '15': [420, 594], '16': [594, 841],
                              'b3': [340, 490], 'b2': [480, 690], 'b1': [680, 980],
                              'sets_a3': [420, 297], 'sets_b3': [490, 340],
                              '37': [70, 70], '38': [90, 90], '39': [105, 105], '40': [145, 145], '41': [210, 210], '42': [295, 295]
                            };
                            if (presets[val]) {
                              setSheetCustomWidth(presets[val][0].toString());
                              setSheetCustomHeight(presets[val][1].toString());
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                        >
                          <optgroup label="Візитівка">
                            <option value="1">90 × 50 (Візитка)</option>
                            <option value="4">45 × 50 (Піввізитки)</option>
                            <option value="3">90 × 100 (Подвійна візитка)</option>
                            <option value="2">180 × 50 (Подвійна візитка)</option>
                          </optgroup>
                          <optgroup label="Євровізитівка">
                            <option value="5">55 × 85 (Євровізитка)</option>
                            <option value="7">85 × 110 (Подвійна євровізитка)</option>
                            <option value="6">170 × 55 (Подвійна євровізитка)</option>
                          </optgroup>
                          <optgroup label="Сети (плейсмати)">
                            <option value="sets_a3">420 × 297 (Сети А3)</option>
                            <option value="sets_b3">490 × 340 (Сети В3)</option>
                          </optgroup>
                          <optgroup label="Календарі кишенькові та настільні">
                            <option value="91">100 × 70 (Календар кишеньковий)</option>
                            <option value="90">90 × 60 (Календар)</option>
                            <option value="256">70 × 70 (Квадратний календар)</option>
                            <option value="12">50 × 70 (Півкалендаря)</option>
                            <option value="11">100 × 140 (Подвійний календар)</option>
                            <option value="10">200 × 70 (Подвійний календар)</option>
                            <option value="160">210 × 300 (Календар «Будинок»)</option>
                            <option value="161">305 × 134 (Календар «Пірамідка»)</option>
                          </optgroup>
                          <optgroup label="Плакати та Афіші">
                            <option value="36">297 × 420 (А3)</option>
                            <option value="b3">340 × 490 (В3)</option>
                            <option value="15">420 × 594 (А2)</option>
                            <option value="b2">480 × 690 (В2)</option>
                            <option value="16">594 × 841 (А1)</option>
                            <option value="b1">680 × 980 (В1)</option>
                          </optgroup>
                          <optgroup label="Флаєр">
                            <option value="25">99 × 210 (Єврофлаєр)</option>
                            <option value="24">99 × 99 (1/2 Флаєра)</option>
                            <option value="26">198 × 210 (Подвійний флаєр)</option>
                            <option value="181">420 × 99 (Подвійний флаєр подовжений)</option>
                          </optgroup>
                          <optgroup label="Листівки стандартні">
                            <option value="28">70 × 100 (А7)</option>
                            <option value="27">50 × 70 (1/2 А7)</option>
                            <option value="312">105 × 148 (А6)</option>
                            <option value="29">52 × 148 (1/2 А6)</option>
                            <option value="32">148 × 210 (А5)</option>
                            <option value="31">74 × 210 (1/2 А5)</option>
                            <option value="34">210 × 297 (А4)</option>
                            <option value="33">105 × 297 (1/2 А4)</option>
                            <option value="36">297 × 420 (А3)</option>
                            <option value="35">148 × 420 (1/2 А3)</option>
                            <option value="15">420 × 594 (А2)</option>
                            <option value="16">594 × 841 (А1)</option>
                          </optgroup>
                          <optgroup label="Квадратні листівки">
                            <option value="5">50 × 50 мм</option>
                            <option value="37">70 × 70 мм</option>
                            <option value="38">90 × 90 мм</option>
                            <option value="39">105 × 105 мм</option>
                            <option value="40">145 × 145 мм</option>
                            <option value="41">210 × 210 мм</option>
                            <option value="42">295 × 295 мм</option>
                          </optgroup>
                          <optgroup label="Інші">
                            <option value="custom">Індивідуальний розмір</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Введіть свій розмір:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={sheetCustomWidth}
                            onChange={(e) => { setSheetCustomWidth(e.target.value); setSheetSizePreset('custom'); }}
                            placeholder="Ширина"
                            className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-center"
                          />
                          <span className="font-bold text-slate-400">×</span>
                          <input
                            type="number"
                            value={sheetCustomHeight}
                            onChange={(e) => { setSheetCustomHeight(e.target.value); setSheetSizePreset('custom'); }}
                            placeholder="Висота"
                            className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-center"
                          />
                          <select
                            value={sheetUnit}
                            onChange={(e) => setSheetUnit(e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                          >
                            <option value="mm">мм</option>
                            <option value="cm">см</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right: Layout Preview Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Вид готового виробу</p>
                      
                      {/* Visual scaled representation rectangle */}
                      <div
                        style={{
                          width: sheetOrientation === 'horiz' ? '180px' : '120px',
                          height: sheetOrientation === 'horiz' ? '120px' : '180px',
                          borderRadius: cardKind === '7' || cardKind === '8' ? '50%' : cardKind === '9' ? '16px' : '8px'
                        }}
                        className="border-2 border-dashed border-blue-500 bg-white flex items-center justify-center mb-3 shadow-sm transition-all"
                      >
                        <span className="text-xs font-bold text-slate-900 bg-slate-100/90 px-2.5 py-1 rounded-md">
                          {sheetCustomWidth} × {sheetCustomHeight} {sheetUnit}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className={sheetOrientation === 'horiz' ? 'text-blue-600 font-bold' : 'text-slate-500'}>Горизонтальний</span>
                        <button
                          type="button"
                          onClick={() => setSheetOrientation(prev => prev === 'horiz' ? 'vert' : 'horiz')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm flex items-center justify-center text-slate-700 transition-colors"
                          title="Повернути макет"
                        >
                          🔄
                        </button>
                        <span className={sheetOrientation === 'vert' ? 'text-blue-600 font-bold' : 'text-slate-500'}>Вертикальний</span>
                      </div>
                    </div>
                  </div>

                  {/* Postpress Accordion Section */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div
                      onClick={() => setShowPostpressAccordion(!showPostpressAccordion)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <SlidersHorizontal size={18} className="text-blue-600" />
                        <h4 className="text-sm font-bold text-slate-900 m-0">Післядрукарська обробка (Нормативи 1С)</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostPersonalization('0'); setPostLuvers('0'); setPostLuversCount(1);
                            setPostCorners('0'); setPostGluing('0'); setPostDrilling('0');
                            setPostFolding('0'); setPostCreasing('0'); setPostPerforation('0');
                            setPostPackingText('');
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
                        >
                          Очистити
                        </button>
                        <span className="text-xs text-slate-400">{showPostpressAccordion ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {showPostpressAccordion && (
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* 1. Персоналізація */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Персоналізація</label>
                          <select value={postPersonalization} onChange={(e) => setPostPersonalization(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                            <option value="0">Ні</option>
                            <option value="1">Є — нумерація, змінні дані</option>
                          </select>
                        </div>

                        {/* 2. Люверс */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Люверс</label>
                          <div className="flex gap-2">
                            <select value={postLuvers} onChange={(e) => setPostLuvers(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Ні</option>
                              <option value="93">Золотий</option>
                              <option value="92">Срібний</option>
                            </select>
                            {postLuvers !== '0' && (
                              <input type="number" value={postLuversCount} onChange={(e) => setPostLuversCount(parseInt(e.target.value) || 1)} min={1} className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-center" />
                            )}
                          </div>
                        </div>

                        {/* 3. Закруглення кутів */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Закруглення кутів (0.035 ₴/шт)</label>
                          <select value={postCorners} onChange={(e) => setPostCorners(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                            <option value="0">Ні</option>
                            <option value="4">4 кути</option>
                            <option value="1">1 кут</option>
                            <option value="2">2 кути</option>
                            <option value="3">3 кути</option>
                          </select>
                        </div>

                        {/* 4. Проклейка в блок */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Проклейка в блок</label>
                          <div className="flex gap-2">
                            <select value={postGluing} onChange={(e) => setPostGluing(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Ні</option>
                              <option value="25">25 листів</option>
                              <option value="50">50 листів</option>
                              <option value="100">100 листів</option>
                              <option value="250">250 листів</option>
                            </select>
                            {postGluing !== '0' && (
                              <select value={postGluingSide} onChange={(e) => setPostGluingSide(e.target.value)} className="w-28 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                                <option value="1">По короткій</option>
                                <option value="2">По довгій</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* 5. Свердління */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Свердління</label>
                          <div className="flex gap-2">
                            <select value={postDrilling} onChange={(e) => setPostDrilling(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Ні</option>
                              <option value="1">1 отвір</option>
                              <option value="2">2 отвори</option>
                              <option value="3">3 отвори</option>
                              <option value="4">4 отвори</option>
                            </select>
                            {postDrilling !== '0' && (
                              <select value={postDrillingDia} onChange={(e) => setPostDrillingDia(e.target.value)} className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                                <option value="3">Ø 3 мм</option>
                                <option value="4">Ø 4 мм</option>
                                <option value="5">Ø 5 мм</option>
                                <option value="6">Ø 6 мм</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* 6. Згинання (Фальцовка) */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Згинання / Фальцовка (0.122 ₴/згин)</label>
                          <div className="flex gap-2">
                            <select value={postFolding} onChange={(e) => setPostFolding(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Ні</option>
                              <option value="1">1 Згинання — навпіл</option>
                              <option value="121">1 Згинання — асиметричне</option>
                              <option value="21">2 Згинання — намотка</option>
                              <option value="22">2 Згинання — гармошка</option>
                              <option value="23">2 Згинання — вікно</option>
                              <option value="34">2 Згинання — комбіноване</option>
                              <option value="31">3 Згинання — намотка</option>
                              <option value="32">3 Згинання — гармошка</option>
                              <option value="33">3 Згинання — вікно</option>
                              <option value="41">4 Згинання — намотка</option>
                              <option value="42">4 Згинання — гармошка</option>
                              <option value="52">5 Згинання — гармошка</option>
                            </select>
                            {postFolding === '121' && (
                              <input
                                type="number"
                                value={postFoldingOffset}
                                onChange={(e) => setPostFoldingOffset(e.target.value)}
                                placeholder="мм"
                                className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-center"
                              />
                            )}
                          </div>
                        </div>

                        {/* 7. Біговка */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Біговка (0.122 ₴/біг)</label>
                          <select value={postCreasing} onChange={(e) => setPostCreasing(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                            <option value="0">Ні</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n.toString()}>{n} {n === 1 ? 'біг' : 'біги'}</option>
                            ))}
                          </select>
                        </div>

                        {/* 8. Перфорація */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Перфорація</label>
                          <select value={postPerforation} onChange={(e) => setPostPerforation(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                            <option value="0">Ні</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n.toString()}>{n} {n === 1 ? 'прохід' : 'проходи'}</option>
                            ))}
                          </select>
                        </div>

                        {/* 9. Розфасовка */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Розфасовка (упаковка)</label>
                          <input
                            type="text"
                            value={postPackingText}
                            onChange={(e) => setPostPackingText(e.target.value)}
                            placeholder="наприклад: по 100, 200 шт"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sets Counter Bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Комплектів макетів:</span>
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setSheetSetsCount(prev => Math.max(1, prev - 1))}
                          className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={sheetSetsCount}
                          onChange={(e) => setSheetSetsCount(parseInt(e.target.value) || 1)}
                          className="w-12 h-7 rounded-md border border-slate-200 bg-white text-center font-bold text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setSheetSetsCount(prev => prev + 1)}
                          className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      (Кількість однакових замовлень з різними макетами)
                    </span>
                  </div>

                  {/* Filter Options (Materials, Coating, Color Printing) */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 m-0">
                        Фільтр специфікацій та матеріалів
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">Оберіть параметри для формування матриці цін</span>
                    </div>

                    <div className="flex flex-col divide-y divide-slate-100">
                      {/* Row 1: Material Options */}
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-36 bg-slate-50/70 p-3.5 border-b md:border-b-0 md:border-r border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                          МАТЕРІАЛ:
                        </div>
                        <div className="flex-1 p-3.5 flex gap-1.5 flex-wrap items-center">
                          {[
                            { id: 'kraft_70', label: 'Крафт бурий 70' },
                            { id: '80', label: 'Офсет 80' },
                            { id: 'linen_300', label: 'Льон білий 300' },
                            { id: 'tintoretto_crema', label: 'Tintoretto crema 300' },
                            { id: 'tintoretto_gesso', label: 'Tintoretto gesso 300' },
                            { id: 'stardream_opal', label: 'Stardream opal 285' },
                            { id: 'stardream_diamond', label: 'Stardream diamond 285' },
                            { id: 'stardream_topaz', label: 'Stardream topaz 285' },
                            { id: '90', label: 'Крейда МАТ 90' },
                            { id: '115', label: 'Крейда МАТ 115' },
                            { id: '130', label: 'Крейда МАТ 130' },
                            { id: '150', label: 'Крейда МАТ 150' },
                            { id: '170', label: 'Крейда МАТ 170' },
                            { id: '250', label: 'Крейда МАТ 250' },
                            { id: '300', label: 'Крейда МАТ 300' },
                            { id: '350', label: 'Крейда МАТ 350' },
                            { id: '450', label: 'Крейда МАТ 450' }
                          ].map(mat => {
                            const isSel = selectedMaterials.includes(mat.id);
                            return (
                              <button
                                key={mat.id}
                                type="button"
                                onClick={() => {
                                  setSelectedMaterials(prev => 
                                    prev.includes(mat.id) ? prev.filter(x => x !== mat.id) : [...prev, mat.id]
                                  );
                                }}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                                  isSel
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/60'
                                }`}
                              >
                                {mat.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 2: Coating Options */}
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-36 bg-slate-50/70 p-3.5 border-b md:border-b-0 md:border-r border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                          ПОКРИТТЯ:
                        </div>
                        <div className="flex-1 p-3.5 flex gap-1.5 flex-wrap items-center">
                          {[
                            { id: '0', label: 'БП' },
                            { id: '7', label: 'ГЛ лам 1+0' },
                            { id: '8', label: 'ГЛ лам 1+1' },
                            { id: '9', label: 'МАТ лам 1+0' },
                            { id: '10', label: 'МАТ лам 1+1' },
                            { id: '30', label: 'SOFT лам 1+0' },
                            { id: '31', label: 'SOFT лам 1+1' },
                            { id: 'uv_10', label: 'УФ ЛАК 1+0' },
                            { id: 'uv_11', label: 'УФ ЛАК 1+1' },
                            { id: 'gibrid_10', label: 'Гібрид 1+0' }
                          ].map(cov => {
                            const isSel = selectedCoverings.includes(cov.id);
                            return (
                              <button
                                key={cov.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCoverings(prev => 
                                    prev.includes(cov.id) ? prev.filter(x => x !== cov.id) : [...prev, cov.id]
                                  );
                                }}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                                  isSel
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/60'
                                }`}
                              >
                                {cov.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 3: Color Printing Options */}
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-36 bg-slate-50/70 p-3.5 border-b md:border-b-0 md:border-r border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                          ДРУК:
                        </div>
                        <div className="flex-1 p-3.5 flex gap-1.5 flex-wrap items-center">
                          {[
                            { id: '4+0', label: 'Односторонній 4+0' },
                            { id: '4+4', label: 'Двосторонній 4+4' },
                            { id: '1+0', label: 'Одноколірний 1+0' },
                            { id: '1+1', label: 'Одноколірний 1+1' }
                          ].map(col => {
                            const isSel = selectedPrintColors.includes(col.id);
                            return (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPrintColors(prev => 
                                    prev.includes(col.id) ? prev.filter(x => x !== col.id) : [...prev, col.id]
                                  );
                                }}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                                  isSel
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/60'
                                }`}
                              >
                                {col.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Calculation Matrix Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Banner Controls Bar */}
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          ВАРТІСТЬ ТА СТРОКИ ВИГОТОВЛЕННЯ
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={includeDelivery}
                            onChange={(e) => setIncludeDelivery(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                          />
                          <span>{includeDelivery ? 'З доставкою' : 'Без доставки'}</span>
                        </label>

                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_tirazh')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              priceCostVar === 'per_tirazh'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            за наклад
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_item')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              priceCostVar === 'per_item'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            за екземпляр
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/95 text-slate-200 text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Матеріал та покриття</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Друк</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Готовність</th>
                            {[100, 250, 500, 1000, 1500, 2500, 5000, 10000].map(tir => (
                              <th key={tir} style={{ padding: '9px 8px', border: '1px solid #a00000' }}>{tir}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMaterials.length === 0 || selectedCoverings.length === 0 || selectedPrintColors.length === 0 ? (
                            <tr>
                              <td colSpan={11} style={{ padding: '30px', color: '#888', fontStyle: 'italic', backgroundColor: '#fafafa' }}>
                                Щоб сформувати прайс оберіть матеріал, покриття, тип друку у фільтрі вище
                              </td>
                            </tr>
                          ) : (
                            selectedMaterials.flatMap(matId => 
                              selectedCoverings.flatMap(covId => 
                                selectedPrintColors.map((colStr, rowIdx) => {
                                  const matLabels: Record<string, string> = {
                                    'kraft_70': 'Крафт бурий 70г',
                                    '80': 'Офсет 80г',
                                    'linen_300': 'Льон білий 300г',
                                    'tintoretto_crema': 'Tintoretto crema 300г',
                                    'tintoretto_gesso': 'Tintoretto gesso 300г',
                                    'stardream_opal': 'Stardream opal 285г',
                                    'stardream_diamond': 'Stardream diamond 285г',
                                    'stardream_topaz': 'Stardream topaz 285г',
                                    '90': 'Крейда МАТ 90г',
                                    '115': 'Крейда МАТ 115г',
                                    '130': 'Крейда МАТ 130г',
                                    '150': 'Крейда МАТ 150г',
                                    '170': 'Крейда МАТ 170г',
                                    '250': 'Крейда МАТ 250г',
                                    '300': 'Крейда МАТ 300г',
                                    '350': 'Крейда МАТ 350г',
                                    '450': 'Крейда МАТ 450г'
                                  };
                                  const covLabels: Record<string, string> = {
                                    '0': 'БП',
                                    '7': 'ГЛ лам 1+0',
                                    '8': 'ГЛ лам 1+1',
                                    '9': 'МАТ лам 1+0',
                                    '10': 'МАТ лам 1+1',
                                    '30': 'SOFT лам 1+0',
                                    '31': 'SOFT лам 1+1',
                                    'uv_10': 'УФ ЛАК 1+0',
                                    'uv_11': 'УФ ЛАК 1+1',
                                    'gibrid_10': 'Гібрид 1+0'
                                  };
                                  const matName = matLabels[matId] || `Папір ${matId}г`;
                                  const covName = covLabels[covId] || 'БП';
                                  const fullMatCover = covName && covName !== 'БП' ? `${matName} (${covName})` : matName;

                                  // Base calculations
                                  const matDensity = parseInt(matId.replace(/\D/g, '')) || 300;
                                  const areaM2 = (parseFloat(sheetCustomWidth) / 1000) * (parseFloat(sheetCustomHeight) / 1000);
                                  const isDouble = colStr === '4+4' || colStr === '1+1';

                                  // 1C Postpress calculation rates
                                  const foldingCostPerItem = postFolding !== '0' ? norms.foldingPrice : 0;
                                  const creasingCostPerItem = postCreasing !== '0' ? parseInt(postCreasing) * norms.foldingPrice : 0;
                                  const dieCutCostPerItem = cardKind === '7' || cardKind === '8' || cardKind === '9' ? norms.dieCuttingPrice : 0;
                                  const postpressTotalPerItem = foldingCostPerItem + creasingCostPerItem + dieCutCostPerItem;

                                  return (
                                    <tr key={`${matId}-${covId}-${colStr}-${rowIdx}`} style={{ backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
                                      <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#222', borderRight: '1px solid #e0e0e0' }}>
                                        {fullMatCover}
                                      </td>
                                      <td style={{ padding: '8px', fontWeight: '700', color: '#c00', borderRight: '1px solid #e0e0e0' }}>
                                        {colStr}
                                      </td>
                                      <td style={{ padding: '8px', fontSize: '11px', color: '#666', borderRight: '1px solid #e0e0e0' }}>
                                        1-2 дні
                                      </td>
                                      {[100, 250, 500, 1000, 1500, 2500, 5000, 10000].map(tir => {
                                        const basePaperCost = areaM2 * (matDensity * 0.08) * tir;
                                        const printCost = (isDouble ? 0.35 : 0.20) * tir + (tir > 500 ? 80 : 120);
                                        const lamCost = (covId !== '0' && covId !== '') ? areaM2 * norms.laminationMattePrice * tir * (covId.includes('1+1') ? 2 : 1) : 0;
                                        const postpressSum = postpressTotalPerItem * tir;
                                        const deliveryCost = includeDelivery ? 80 : 0;
                                        
                                        const rawTotal = (basePaperCost + printCost + lamCost + postpressSum + deliveryCost) * (marginPercent / 100) * (sheetSetsCount || 1);
                                        const itemCost = rawTotal / tir;
                                        const displayVal = priceCostVar === 'per_item' ? itemCost.toFixed(2) : Math.round(rawTotal).toString();

                                        return (
                                          <td
                                            key={tir}
                                            onClick={() => {
                                              setQuantity(tir);
                                              setPaperType(matId === '80' ? 'offset' : 'coated');
                                              setColors(colStr);
                                              setCategory('Візитки');
                                              setStep('editor');
                                            }}
                                            style={{ padding: '8px', fontWeight: '700', color: '#111', cursor: 'pointer', borderRight: '1px solid #e0e0e0', transition: 'all 0.12s ease' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff0f0'; e.currentTarget.style.color = '#c00'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#111'; }}
                                          >
                                            {displayVal} грн
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })
                              )
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* DETAILED DIE-CUT CALCULATOR (Офсетний друк / Висічна) */}
              {offsetSubTab === 'felling' && (
                <div className="flex flex-col gap-6">
                  {/* Top Information Buttons Bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                        ✂️
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 m-0">Висічна продукція (Штампи)</h4>
                        <span className="text-xs text-slate-400">Оберіть готовий штамп з бази або введіть параметри</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setActiveInfoModal('instr')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
                      >
                        <FileText size={14} className="text-blue-600" />
                        <span>Інструкція</span>
                      </button>

                      <a
                        href={
                          {
                            '128': 'https://sborka.ua/cside/img/shablon/henger1.pdf',
                            '133': 'https://sborka.ua/cside/img/shablon/henger2.pdf',
                            '160': 'https://sborka.ua/cside/img/shablon/domik.pdf',
                            '161': 'https://sborka.ua/cside/img/shablon/piramid.pdf',
                            '58': 'https://sborka.ua/cside/img/shablon/papka.pdf',
                            '59': 'https://sborka.ua/cside/img/shablon/papka2.pdf'
                          }[fellingStamp] || '#'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold shadow-sm transition-colors"
                      >
                        <Download size={14} />
                        <span>Шаблон штампу (PDF)</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setActiveInfoModal('materials')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Layers size={14} className="text-blue-600" />
                        <span>Матеріали</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Selector Header Bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">Форма штампу</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {[
                        { id: '1', name: 'Стандартна', img: 'https://sborka.ua/cside/img/Standart/standart.png' },
                        { id: '2', name: 'Кругла', img: 'https://sborka.ua/cside/img/Circle/s245_245.png' },
                        { id: '3', name: 'Овальна', img: 'https://sborka.ua/cside/img/Oval/31_21_n108.png' },
                        { id: '4', name: 'Прямокутна', img: 'https://sborka.ua/cside/img/Priam/119_89_n112.png' },
                        { id: '5', name: 'Етикетка, кольєретка', img: 'https://sborka.ua/cside/img/Etiket/65_113_n56.png' },
                      ].map(formItem => {
                        const isActive = fellingForm === formItem.id;
                        return (
                          <div
                            key={formItem.id}
                            onClick={() => setFellingForm(formItem.id)}
                            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                              isActive
                                ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <img src={formItem.img} alt={formItem.name} className="w-14 h-10 object-contain" />
                            <span className={`text-xs font-bold text-center ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                              {formItem.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stamp Selection & Interactive Product Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Die-cut Stamp Selection */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0 border-b border-slate-100 pb-2">
                        Оберіть стандартний штамп
                      </h4>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Готовий штамп з каталогу:</label>
                        <select
                          value={fellingStamp}
                          onChange={(e) => setFellingStamp(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                        >
                          <option value="128">Хенгер вид 1 (90 × 200 мм)</option>
                          <option value="133">Хенгер вид 2 (90 × 200 мм)</option>
                          <option value="160">Будинок (210 × 300 мм)</option>
                          <option value="161">Пірамідка (305 × 134 мм)</option>
                          <option value="58">Папка А4 корінець 5 мм</option>
                          <option value="59">Папка А4 корінець 7 мм</option>
                        </select>
                      </div>

                      {/* Selected Stamp Details */}
                      {(() => {
                        const stampInfo: Record<string, { title: string; w: number; h: number }> = {
                          '128': { title: 'Хенгер вид 1', w: 90, h: 200 },
                          '133': { title: 'Хенгер вид 2', w: 90, h: 200 },
                          '160': { title: 'Будинок (Календар)', w: 210, h: 300 },
                          '161': { title: 'Пірамідка', w: 305, h: 134 },
                          '58': { title: 'Папка А4 (корінець 5мм)', w: 484, h: 377 },
                          '59': { title: 'Папка А4 (корінець 7мм)', w: 544, h: 393 },
                        };
                        const info = stampInfo[fellingStamp] || { title: 'Стандартний штамп', w: 90, h: 200 };
                        return (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                            <div className="font-bold text-slate-900 mb-1">{info.title}</div>
                            <div className="text-slate-600">Габарити висічки: <strong className="text-blue-600">{info.w} × {info.h} мм</strong></div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Right Column: Visual Stamp Preview */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center gap-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Вид готового виробу</span>
                      <div className="w-full h-48 border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl flex items-center justify-center p-4">
                        {(() => {
                          const stampImgs: Record<string, string> = {
                            '128': 'https://sborka.ua/cside/img/Standart/henger1.png',
                            '133': 'https://sborka.ua/cside/img/Standart/henger2.png',
                            '160': 'https://sborka.ua/cside/img/Standart/domik.png',
                            '161': 'https://sborka.ua/cside/img/Standart/piramid.png',
                            '58': 'https://sborka.ua/cside/img/Standart/papka.png',
                            '59': 'https://sborka.ua/cside/img/Standart/papka2.png',
                          };
                          const imgUrl = stampImgs[fellingStamp];
                          return imgUrl ? (
                            <img src={imgUrl} alt="Прев'ю штампу" className="max-h-40 max-w-full object-contain" />
                          ) : (
                            <div className="w-28 h-28 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs">
                              Висічка
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix Table for Die-cut */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between flex-wrap gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">Специфікація розрахунків та прайс-лист висічки</h4>

                      <div className="flex items-center gap-4">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer hover:text-white">
                          <input type="checkbox" checked={includeDelivery} onChange={(e) => setIncludeDelivery(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                          <span>З доставкою</span>
                        </label>

                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_tirazh')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              priceCostVar === 'per_tirazh' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            За наклад
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_item')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              priceCostVar === 'per_item' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            За екземпляр
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/95 text-slate-200 text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Матеріал та покриття</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Друк</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Готовність</th>
                            {[100, 250, 500, 1000, 2500, 5000, 10000].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-bold">{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { mat: 'Льон Icelite 300', cov: 'Ні', color: '4+0', time: '1-2 дні' },
                            { mat: 'Tintoretto crema 300', cov: 'Ні', color: '4+4', time: '1-2 дні' },
                            { mat: 'Stardream opal 285', cov: 'Ні', color: '4+0', time: '1-2 дні' },
                            { mat: 'Крейд МАТ 300', cov: 'ГЛ лам 1+0', color: '4+4', time: '1-2 дні' },
                            { mat: 'Крейд МАТ 350', cov: 'МАТ лам 1+1', color: '4+4', time: '1-2 дні' },
                            { mat: 'Крейд МАТ 450', cov: 'SOFT лам 1+1', color: '4+4', time: '1-2 дні' },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100">
                                {row.mat} <span className="font-normal text-slate-500">({row.cov})</span>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-600 border-r border-slate-100">{row.color}</td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px] border-r border-slate-100">{row.time}</td>
                              {[100, 250, 500, 1000, 2500, 5000, 10000].map(tir => {
                                const baseCost = tir * 2.5 + 250;
                                const itemVal = priceCostVar === 'per_item' ? (baseCost / tir).toFixed(2) : Math.round(baseCost).toString();
                                return (
                                  <td
                                    key={tir}
                                    onClick={() => {
                                      setQuantity(tir);
                                      setCategory('Етикетки');
                                      setStep('editor');
                                    }}
                                    className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all duration-150"
                                  >
                                    {itemVal} ₴
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* DETAILED MULTIPAGE CALCULATOR (Офсетний друк / Багатосторінкова) */}
              {offsetSubTab === 'multipage' && (
                <div className="flex flex-col gap-6">
                  {/* Top Information Buttons Bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        📖
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 m-0">Багатосторінкова продукція (Каталоги, Журнали)</h4>
                        <span className="text-xs text-slate-400">Гнучке налаштування обкладинки, блоку та вставки</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveInfoModal('tech_pur')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
                      >
                        <BookOpen size={14} className="text-blue-600" />
                        <span>Технічні вимоги</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveInfoModal('materials')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Layers size={14} className="text-blue-600" />
                        <span>Матеріали</span>
                      </button>
                    </div>
                  </div>

                  {/* Stitching Type Selector */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">Спосіб зшивання</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: '1', name: 'Скоба (8 — 64 стр)', img: 'https://sborka.ua/cside/img/skoba.png' },
                        { id: '2', name: 'Пружина (4 — 524 стр)', img: 'https://sborka.ua/cside/img/pr_prujina.png' },
                        { id: '3', name: 'Клей PUR (30 — 608 стр)', img: 'https://sborka.ua/cside/img/pur_glue_img.png' },
                        { id: '4', name: 'Блокноти (30 — 608 стр)', img: 'https://sborka.ua/cside/img/pr_bloknot.png' },
                      ].map(stItem => {
                        const isActive = multiStitching === stItem.id;
                        return (
                          <div
                            key={stItem.id}
                            onClick={() => setMultiStitching(stItem.id)}
                            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                              isActive
                                ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <img src={stItem.img} alt={stItem.name} className="w-16 h-10 object-contain" />
                            <span className={`text-xs font-bold text-center ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                              {stItem.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection & Canvas Visual Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Size presets & Custom inputs */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0 border-b border-slate-100 pb-2">Розмір видання</h4>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Оберіть стандартний:</label>
                        <select
                          value={multiSizePreset}
                          onChange={(e) => setMultiSizePreset(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                        >
                          <option value="1">Євро (198 × 210 в 99 × 210 мм)</option>
                          <option value="2">1/2 А4 (210 × 297 в 105 × 297 мм)</option>
                          <option value="3">А5 (210 × 297 в 148 × 210 мм)</option>
                          <option value="5">А4 (420 × 297 в 210 × 297 мм)</option>
                          <option value="6">Квадрат А5 (296 × 148 в 148 × 148 мм)</option>
                          <option value="7">Квадрат А4 (420 × 210 в 210 × 210 мм)</option>
                          <option value="8">А6 (148 × 210 в 105 × 148 мм)</option>
                        </select>
                      </div>

                      {/* Custom Dimensions */}
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Введіть свій розмір у розворот:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={sheetCustomWidth}
                            onChange={(e) => setSheetCustomWidth(e.target.value)}
                            placeholder="Ширина"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                          />
                          <span className="text-slate-400 font-bold">×</span>
                          <input
                            type="number"
                            value={sheetCustomHeight}
                            onChange={(e) => setSheetCustomHeight(e.target.value)}
                            placeholder="Висота"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                          />
                          <select
                            value={sheetUnit}
                            onChange={(e) => setSheetUnit(e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                          >
                            <option value="mm">мм</option>
                            <option value="cm">см</option>
                          </select>
                        </div>
                      </div>

                      {/* Orientation */}
                      <div className="flex gap-4 pt-2">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="multi_orient" checked={sheetOrientation === 'vert'} onChange={() => setSheetOrientation('vert')} className="text-blue-600 focus:ring-blue-500" />
                          <span>Вертикально</span>
                        </label>
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="multi_orient" checked={sheetOrientation === 'horiz'} onChange={() => setSheetOrientation('horiz')} className="text-blue-600 focus:ring-blue-500" />
                          <span>Горизонтально</span>
                        </label>
                      </div>
                    </div>

                    {/* Right Column: Visual Preview Canvas */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center gap-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Вид готового виробу</span>
                      <div className="w-full h-48 border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl flex flex-col items-center justify-center gap-2 p-4">
                        <div className="w-28 h-36 border-2 border-slate-800 bg-white rounded-md relative shadow-md flex flex-col justify-between p-2">
                          <div className="w-1.5 h-full bg-blue-600 absolute left-0 top-0 rounded-l-sm"></div>
                          <span className="text-xs font-extrabold text-blue-600 text-center mt-2">
                            {multiSizePreset === '3' ? 'А5' : multiSizePreset === '5' ? 'А4' : 'Брошура'}
                          </span>
                          <span className="text-[10px] text-slate-500 text-center">
                            {sheetOrientation === 'vert' ? '148 × 210 мм' : '210 × 148 мм'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Component Specification Options Breakdown */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0 border-b border-slate-100 pb-2">
                      Деталізація складників багатосторінкового видання
                    </h4>

                    {/* 1. Обкладинка */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-xs flex items-center">Обкладинка:</div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Сторінок</label>
                        <select value={multiCoverPages} onChange={(e) => setMultiCoverPages(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          <option value="0">Без обкладинки</option>
                          <option value="1">4 стор (1 аркуш)</option>
                          <option value="2">8 стор (2 аркуші)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Папір / Матеріал</label>
                        <select value={multiCoverMaterial} onChange={(e) => setMultiCoverMaterial(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          <option value="80">Офсет 80г</option>
                          <option value="90">Крейд 90г</option>
                          <option value="115">Крейд 115г</option>
                          <option value="130">Крейд 130г</option>
                          <option value="150">Крейд 150г</option>
                          <option value="170">Крейд 170г</option>
                          <option value="200">Крейд 200г</option>
                          <option value="250">Крейд 250г</option>
                          <option value="2507">Крейд 250 + ГЛ лам 1+0</option>
                          <option value="2509">Крейд 250 + МАТ лам 1+0</option>
                          <option value="300">Крейд 300г</option>
                          <option value="3007">Крейд 300 + ГЛ лам 1+0</option>
                          <option value="3009">Крейд 300 + МАТ лам 1+0</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Кольоровість</label>
                        <select value={multiCoverColor} onChange={(e) => setMultiCoverColor(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          <option value="1">4+0 (Односторонній)</option>
                          <option value="2">4+4 (Двосторонній)</option>
                        </select>
                      </div>
                    </div>

                    {/* 2. Внутрішній блок */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-xs flex items-center">Внутрішній блок:</div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Сторінок</label>
                        <select value={multiBlockPages} onChange={(e) => setMultiBlockPages(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          {[4,8,12,16,20,24,28,32,36,40,44,48,52,56,60,64].map((p, i) => (
                            <option key={p} value={(i + 1).toString()}>{p} стр ({i + 1} {i === 0 ? 'аркуш' : 'аркуші'})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Папір / Матеріал</label>
                        <select value={multiBlockMaterial} onChange={(e) => setMultiBlockMaterial(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          <option value="80">Офсет 80г</option>
                          <option value="90">Крейд 90г</option>
                          <option value="115">Крейд 115г</option>
                          <option value="130">Крейд 130г</option>
                          <option value="150">Крейд 150г</option>
                          <option value="170">Крейд 170г</option>
                          <option value="200">Крейд 200г</option>
                          <option value="250">Крейд 250г</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Кольоровість</label>
                        <select value={multiBlockColor} onChange={(e) => setMultiBlockColor(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          <option value="1">4+0</option>
                          <option value="2">4+4</option>
                        </select>
                      </div>
                    </div>

                    {/* 3. Вставка */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-xs flex items-center">Вставка:</div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Сторінок</label>
                        <select value={multiInsertPages} onChange={(e) => setMultiInsertPages(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          <option value="0">Без вставки</option>
                          <option value="1">4 стр (1 аркуш)</option>
                          <option value="2">8 стор (2 аркуші)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Папір / Матеріал</label>
                        <select value={multiInsertMaterial} onChange={(e) => setMultiInsertMaterial(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          <option value="80">Офсет 80г</option>
                          <option value="130">Крейд 130г</option>
                          <option value="150">Крейд 150г</option>
                          <option value="200">Крейд 200г</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Кольоровість</label>
                        <select value={multiInsertColor} onChange={(e) => setMultiInsertColor(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                          <option value="1">4+0</option>
                          <option value="2">4+4</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix Table for Multipage */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between flex-wrap gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">Специфікація розрахунків та прайс-лист багатосторінкової продукції</h4>

                      <div className="flex items-center gap-4">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer hover:text-white">
                          <input type="checkbox" checked={includeDelivery} onChange={(e) => setIncludeDelivery(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                          <span>З доставкою</span>
                        </label>

                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_tirazh')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              priceCostVar === 'per_tirazh' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            За наклад
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_item')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              priceCostVar === 'per_item' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            За екземпляр
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/95 text-slate-200 text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Формат та параметри</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Зшивання</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Готовність</th>
                            {[100, 250, 500, 1000, 2500, 5000, 10000].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-bold">{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { fmt: 'А5 (16 стор, Крейд 130)', st: 'Скоба', time: '2-3 дні' },
                            { fmt: 'А5 (32 стор, Крейд 115)', st: 'Пружина', time: '2-3 дні' },
                            { fmt: 'А4 (16 стор, Крейд 150)', st: 'Скоба', time: '2-3 дні' },
                            { fmt: 'А4 (48 стор, Крейд 115)', st: 'Клей (PUR)', time: '3-4 дні' },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100">
                                {row.fmt}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-blue-600 border-r border-slate-100">{row.st}</td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px] border-r border-slate-100">{row.time}</td>
                              {[100, 250, 500, 1000, 2500, 5000, 10000].map(tir => {
                                const baseCost = tir * (idx * 5 + 12) + 800;
                                const itemVal = priceCostVar === 'per_item' ? (baseCost / tir).toFixed(2) : Math.round(baseCost).toString();
                                return (
                                  <td
                                    key={tir}
                                    onClick={() => {
                                      setQuantity(tir);
                                      setCategory('Буклети');
                                      setStep('editor');
                                    }}
                                    className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all duration-150"
                                  >
                                    {itemVal} ₴
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Info Modal Popup */}
              {activeInfoModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
                    <button
                      type="button"
                      onClick={() => setActiveInfoModal(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                    {activeInfoModal === 'instr' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                          <FileText size={20} />
                          <span>Інструкція по оформленню замовлення</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed m-0">
                          1. Оберіть стандартний розмір виробу або введіть свій у міліметрах.<br/>
                          2. За потреби відкрийте блок «Післядрукарська обробка» та оберіть фальцовку, біговку, свердління тощо.<br/>
                          3. У таблиці розрахунків оберіть бажаний матеріал та тираж — клікніть на комірку з ціною для автоматичного формування замовлення.
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'terms' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                          <Clock size={20} />
                          <span>Терміни друку</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed m-0">
                          Стандартний термін виконання збірного офсетного тиражу — 1-2 робочих дні. Для термінових замовлень скористайтесь розділом «Цифровий друк».
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'materials' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                          <Layers size={20} />
                          <span>Матеріали</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed m-0">
                          Доступні папери: Офсетний 80 г/м², Крейдований матовий та глянцевий від 90 до 450 г/м², а також дизайнерські картони (Льон, Tintoretto, Stardream).
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'tech_pur' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                          <BookOpen size={20} />
                          <span>Технічні вимоги</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed m-0">
                          Макет має бути у колірній моделі CMYK з роздільною здатністю 300 dpi. Виліти під порізку — 2 мм з кожного боку. Безпечне поле для важливих елементів та тексту — 5 мм від краю порізу.
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'samples' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                          <Tag size={20} />
                          <span>Зразки матеріалів з друком</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed m-0">
                          Ви можете замовити комплект зразків у розділі «Зразки матеріалів» для точної оцінки щільності та фактури паперу.
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'review' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                          <MessageSquare size={20} />
                          <span>Ваш відгук</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed m-0">
                          Дякуємо за допомогу в розвитку системи! Залиште ваші побажання або зауваження до інтерфейсу калькулятора.
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'bug' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
                          <AlertTriangle size={20} />
                          <span>Знайшли помилку?</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed m-0">
                          Опишіть ситуацію, у якій виникла помилка, або невідповідність у розрахунку ціни, і ми оперативно її виправимо.
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveInfoModal(null)}
                      className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Зрозуміло
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIGITAL PRINTING */}
          {mainCategoryTab === 'digital' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div onClick={() => handleSelectCategory('Візитки')} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Layout size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">Термінові Візитки</h4>
                <p className="text-xs text-slate-500 m-0">Цифровий оперативний друк від 100 шт за 1 годину.</p>
              </div>
              <div onClick={() => handleSelectCategory('Листівки')} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center group">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">Цифрові Листівки SRA3</h4>
                <p className="text-xs text-slate-500 m-0">Оперативний листовий друк на Xerox Versant 180.</p>
              </div>
              <div onClick={() => handleSelectCategory('Меню')} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center group">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">Конвертна ламінація</h4>
                <p className="text-xs text-slate-500 m-0">Захищені меню та бейджи з посиленим ламінуванням 125мкм.</p>
              </div>
            </div>
          )}

          {/* TAB 4: WIDE FORMAT */}
          {mainCategoryTab === 'wide' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => handleSelectCategory('Плакати')} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Layout size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">Банери та Тенти</h4>
                <p className="text-xs text-slate-500 m-0">Литі та ламеновані банери для зовнішньої реклами з люверсами.</p>
              </div>
              <div onClick={() => handleSelectCategory('Наклейки')} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center group">
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">Плівка ORAJET</h4>
                <p className="text-xs text-slate-500 m-0">Широкоформатний друк на самоклейці для вітрин та авто.</p>
              </div>
            </div>
          )}

          {/* TAB 5: ROLL PRINTING */}
          {mainCategoryTab === 'roll' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div onClick={() => handleSelectCategory('Етикетки')} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center group">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">Рулонна Етикетка</h4>
                <p className="text-xs text-slate-500 m-0">Самоклеючі етикетки у бобінах та рулонах для маркування.</p>
              </div>
            </div>
          )}

          {/* TAB 6: COLOR FILMS */}
          {mainCategoryTab === 'films' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div onClick={() => handleSelectCategory('Наклейки')} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center group">
                <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">Плотерна порізка плівок</h4>
                <p className="text-xs text-slate-500 m-0">Порізка аплікацій з кольорових вінілових плівок ORACAL 641.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Editor Header Navigation */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <button 
              onClick={() => setStep('catalog')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              <ArrowLeft size={14} className="text-blue-600" />
              <span>Каталог виробів</span>
            </button>
            
            {/* Calculation Mode Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCalcMode('auto')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  calcMode === 'auto'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Параметричний конструктор
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('operations')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  calcMode === 'operations'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Поопераційний (1С)
              </button>
            </div>

            <button 
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Save size={14} />
              <span>Зберегти шаблон</span>
            </button>
          </div>

          {/* Detailed Constructor Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Side details and options list (span 2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Product specifications */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 m-0">
                  Параметри тиражу
                </h3>

                {category === 'Бланки' && (
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">Вибір продукції:</span>
                    <div className="flex gap-2 flex-grow">
                      <button
                        type="button"
                        onClick={() => handleSelectSubCategory('Бланки')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                          subCategory === 'Бланки'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Бланки
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSubCategory('Листівки')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                          subCategory === 'Листівки'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Листівки
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">№ Замовлення</label>
                    <input 
                      value={`#${orderNumber}`} 
                      disabled 
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-blue-600 text-center text-xs cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Замовник</label>
                    <select 
                      value={selectedClientId} 
                      onChange={(e) => setSelectedClientId(e.target.value)} 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Продукція</label>
                    <input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Тираж (шт.)</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} 
                      onBlur={() => { if (quantity === '' || Number(quantity) < 1) setQuantity(100); }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Штук в 1 упаковці</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={packingCount} 
                      onChange={(e) => setPackingCount(e.target.value === '' ? '' : Number(e.target.value))}
                      onBlur={() => { if (packingCount === '') setPackingCount(1); }} 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Матеріал паперу</label>
                    <select 
                      value={paperType} 
                      onChange={(e) => setPaperType(e.target.value as any)} 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="offset">Офсетний 70г</option>
                      <option value="gazetka">Газетний 45г</option>
                      <option value="coated">Крейдований 130г</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Кольоровість</label>
                    <select 
                      value={colors} 
                      onChange={(e) => setColors(e.target.value)} 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="1+0">1+0 (ЧБ 1-стор)</option>
                      <option value="1+1">1+1 (ЧБ 2-стор)</option>
                      <option value="4+0">4+0 (Колір 1-стор)</option>
                      <option value="4+4">4+4 (Колір 2-стор)</option>
                    </select>
                  </div>
                </div>

                {/* Design selection: 1. Сам на себе, 2. Без обороту, 3. Чужий оборот + вільне поле */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 flex-wrap">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Спуск / Оборот:</span>
                  <div className="flex gap-2 flex-grow items-center flex-wrap">
                    <button 
                      type="button" 
                      onClick={() => handleSelectTurnType('sam_na_sebe')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        turnType === 'sam_na_sebe'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      1. Сам на себе
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSelectTurnType('bez_oborotu')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        turnType === 'bez_oborotu'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      2. Без обороту
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSelectTurnType('chuzhyi_oborut')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        turnType === 'chuzhyi_oborut'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      3. Чужий оборот
                    </button>
                    <div className="flex items-center gap-1.5">
                      <input 
                        placeholder="Ціна макету (грн)"
                        value={customDesignPrice}
                        onChange={(e) => setCustomDesignPrice(e.target.value)}
                        className="w-32 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive Options Panel */}
              {calcMode === 'auto' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 m-0">
                    Технічні специфікації виробу
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Format and Orientation */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Формат виробу</label>
                      <select 
                        value={selectedFormat} 
                        onChange={(e) => setSelectedFormat(e.target.value)} 
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                      >
                        <option value="A4">A4 (210х297 мм)</option>
                        <option value="A5">A5 (148х210 мм)</option>
                        <option value="A3">A3 (297х420 мм)</option>
                        <option value="90x50 мм">Візитка (90х50 мм)</option>
                        <option value="Euro">Єврофлаєр (99х210 мм)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Орієнтація</label>
                      <select 
                        value={orientation} 
                        onChange={(e) => setOrientation(e.target.value as any)} 
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                      >
                        <option value="portrait">Портретна (вертикальна)</option>
                        <option value="landscape">Альбомна (горизонтальна)</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-page / Book options */}
                  {category === 'Книги' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Обкладинка папір</label>
                        <select 
                          value={coverPaperType} 
                          onChange={(e) => setCoverPaperType(e.target.value as any)} 
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        >
                          <option value="coated">Крейда 300г</option>
                          <option value="cardboard">Картон 350г</option>
                          <option value="offset">Офсет 150г</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Кольори обкл.</label>
                        <select 
                          value={coverColors} 
                          onChange={(e) => setCoverColors(e.target.value)} 
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        >
                          <option value="4+4">4+4 (Повна)</option>
                          <option value="4+0">4+0</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Стор. блоку</label>
                        <input 
                          type="number" 
                          step="4" 
                          value={innerPages} 
                          onChange={(e) => setInnerPages(Number(e.target.value))} 
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Postpress / Prepress operations selection (Enabled for Листівки, hidden for Бланки) */}
                  {!(category === 'Бланки' && subCategory === 'Бланки') && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Тип скріплення</label>
                        <select 
                          value={bindingType} 
                          onChange={(e) => setBindingType(e.target.value as any)} 
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                        >
                          <option value="none">Без скріплення</option>
                          <option value="staple">Скоба (шиття)</option>
                          <option value="spring">Металева пружина</option>
                          <option value="glue">Клейове (КБС)</option>
                          <option value="hardcover">Тверда палітурка</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Ламінування</label>
                        <select 
                          value={laminationType} 
                          onChange={(e) => setLaminationType(e.target.value as any)} 
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                        >
                          <option value="none">Без ламінування</option>
                          <option value="gloss">Глянцева плівка</option>
                          <option value="matte">Матова плівка</option>
                          <option value="softtouch">Soft-touch оксамит</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Кількість бігів</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={creaseCount} 
                          onChange={(e) => setCreaseCount(Number(e.target.value))} 
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {calcMode === 'auto' ? (
                /* Simple Business Logic Breakdown Output */
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 m-0">
                    Склад собівартості
                  </h3>
                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Переддрукарська підготовка:</span>
                      <strong className="font-mono text-slate-900">{designCost.toFixed(2)} ₴</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Витрати паперу:</span>
                      <strong className="font-mono text-slate-900">{calculatedOps.paperCost.toFixed(2)} ₴</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Прогін на машині ({calculatedOps.machine}):</span>
                      <strong className="font-mono text-slate-900">{calculatedOps.printingCost.toFixed(2)} ₴</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Порізка та упаковка:</span>
                      <strong className="font-mono text-slate-900">{(calculatedOps.cuttingCost + calculatedOps.packingCost).toFixed(2)} ₴</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* Advanced Operations list - exact 1C Replica */
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">
                      Виробничі операції та калькуляція собівартості (1С)
                    </h3>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-400/30">
                      Поопераційні тарифи
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-300 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-700">
                          <th className="w-10 text-center py-2.5 px-2">[x]</th>
                          <th className="py-2.5 px-3">Назва операції</th>
                          <th className="w-28 text-right py-2.5 px-3">Тариф (₴)</th>
                          <th className="w-24 text-center py-2.5 px-3">Обсяг</th>
                          <th className="w-32 text-right py-2.5 px-3">Вартість</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Form Making */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.formMaking} onChange={(e) => setActiveOps({ ...activeOps, formMaking: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.formMaking ? 'text-slate-900' : 'text-slate-400'}`}>Копіювання форм / Виготовлення форми</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.formMaking !== undefined ? opCustomRates.formMaking : norms.formMakingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, formMaking: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3">
                            <input 
                              type="number" 
                              value={opVolumes.formMaking !== undefined ? opVolumes.formMaking : calculatedOps.actualVolumes.formMaking} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, formMaking: Number(e.target.value) })}
                              className="w-14 h-6 px-1 text-center text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.formMaking ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.formMaking.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Film Mounting */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.filmMounting} onChange={(e) => setActiveOps({ ...activeOps, filmMounting: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.filmMounting ? 'text-slate-900' : 'text-slate-400'}`}>Монтаж плівок (лакофарбових)</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.filmMounting !== undefined ? opCustomRates.filmMounting : norms.filmMountingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, filmMounting: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3">
                            <input 
                              type="number" 
                              value={opVolumes.filmMounting !== undefined ? opVolumes.filmMounting : calculatedOps.actualVolumes.filmMounting} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, filmMounting: Number(e.target.value) })}
                              className="w-14 h-6 px-1 text-center text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.filmMounting ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.filmMounting.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Printing Pass */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.printing} onChange={(e) => setActiveOps({ ...activeOps, printing: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.printing ? 'text-slate-900' : 'text-slate-400'}`}>Прогон друкарської машини ({calculatedOps.machine})</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.printing !== undefined ? opCustomRates.printing : calculatedOps.rates.printing} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, printing: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3 text-slate-600 font-semibold text-xs">{calculatedOps.actualVolumes.printing} арк</td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.printing ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.printing.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Lamination */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.lamination} onChange={(e) => setActiveOps({ ...activeOps, lamination: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.lamination ? 'text-slate-900' : 'text-slate-400'}`}>Ламінування (мат / глянець)</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.lamination !== undefined ? opCustomRates.lamination : calculatedOps.rates.lamination} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, lamination: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3 text-slate-600 font-semibold text-xs">{calculatedOps.actualVolumes.lamination} арк</td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.lamination ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.lamination.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Embossing */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.embossing} onChange={(e) => setActiveOps({ ...activeOps, embossing: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.embossing ? 'text-slate-900' : 'text-slate-400'}`}>Тиснення складне (фольгою)</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.embossing !== undefined ? opCustomRates.embossing : norms.embossingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, embossing: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3">
                            <input 
                              type="number" 
                              value={opVolumes.embossing !== undefined ? opVolumes.embossing : calculatedOps.actualVolumes.embossing} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, embossing: Number(e.target.value) })}
                              className="w-14 h-6 px-1 text-center text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.embossing ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.embossing.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Die Cutting */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.dieCutting} onChange={(e) => setActiveOps({ ...activeOps, dieCutting: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.dieCutting ? 'text-slate-900' : 'text-slate-400'}`}>Висічка штампом</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.dieCutting !== undefined ? opCustomRates.dieCutting : norms.dieCuttingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, dieCutting: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3">
                            <input 
                              type="number" 
                              value={opVolumes.dieCutting !== undefined ? opVolumes.dieCutting : calculatedOps.actualVolumes.dieCutting} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, dieCutting: Number(e.target.value) })}
                              className="w-14 h-6 px-1 text-center text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.dieCutting ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.dieCutting.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Folding */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.folding} onChange={(e) => setActiveOps({ ...activeOps, folding: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.folding ? 'text-slate-900' : 'text-slate-400'}`}>Біговка / Фальцювання (згини)</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.folding !== undefined ? opCustomRates.folding : norms.foldingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, folding: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3">
                            <input 
                              type="number" 
                              value={opVolumes.folding !== undefined ? opVolumes.folding : calculatedOps.actualVolumes.folding} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, folding: Number(e.target.value) })}
                              className="w-14 h-6 px-1 text-center text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.folding ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.folding.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Block Insertion */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.blockInsertion} onChange={(e) => setActiveOps({ ...activeOps, blockInsertion: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.blockInsertion ? 'text-slate-900' : 'text-slate-400'}`}>Вставка блока брошури</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.blockInsertion !== undefined ? opCustomRates.blockInsertion : norms.blockInsertionPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, blockInsertion: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3">
                            <input 
                              type="number" 
                              value={opVolumes.blockInsertion !== undefined ? opVolumes.blockInsertion : calculatedOps.actualVolumes.blockInsertion} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, blockInsertion: Number(e.target.value) })}
                              className="w-14 h-6 px-1 text-center text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.blockInsertion ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.blockInsertion.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Cover Making */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.coverMaking} onChange={(e) => setActiveOps({ ...activeOps, coverMaking: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.coverMaking ? 'text-slate-900' : 'text-slate-400'}`}>Виготовлення кришки твердої</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.coverMaking !== undefined ? opCustomRates.coverMaking : norms.coverMakingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, coverMaking: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3">
                            <input 
                              type="number" 
                              value={opVolumes.coverMaking !== undefined ? opVolumes.coverMaking : calculatedOps.actualVolumes.coverMaking} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, coverMaking: Number(e.target.value) })}
                              className="w-14 h-6 px-1 text-center text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.coverMaking ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.coverMaking.toFixed(6)} ₴
                          </td>
                        </tr>

                        {/* Block Processing */}
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="text-center py-2 px-2">
                            <input type="checkbox" checked={activeOps.blockProcessing} onChange={(e) => setActiveOps({ ...activeOps, blockProcessing: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className={`py-2 px-3 font-semibold ${activeOps.blockProcessing ? 'text-slate-900' : 'text-slate-400'}`}>Обробка блока (порізка, шліф)</td>
                          <td className="text-right py-2 px-3">
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.blockProcessing !== undefined ? opCustomRates.blockProcessing : norms.blockProcessingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, blockProcessing: Number(e.target.value) })}
                              className="w-24 h-6 px-1.5 text-right text-xs rounded border border-slate-200 bg-white text-slate-800"
                            />
                          </td>
                          <td className="text-center py-2 px-3 text-slate-600 font-semibold text-xs">{calculatedOps.actualVolumes.blockProcessing} арк</td>
                          <td className={`text-right py-2 px-3 font-mono font-bold ${activeOps.blockProcessing ? 'text-slate-900' : 'text-slate-400'}`}>
                            {calculatedOps.fullSums.blockProcessing.toFixed(6)} ₴
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Right Side Summary panel (span 1 col) */}
            <div className="flex flex-col gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 sticky top-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Підсумки прорахунку</span>
                
                <div>
                  <span className="text-xs text-slate-500">Ціна продажу для клієнта:</span>
                  <p className="text-3xl font-extrabold text-blue-600 my-1">
                    {calculatedOps.finalPrice.toFixed(2)} <span className="text-sm font-bold text-slate-500">₴</span>
                  </p>
                  
                  <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3 mt-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Собівартість виробництва:</span>
                      <strong className="text-slate-900 font-semibold">{calculatedOps.subtotal.toFixed(2)} ₴</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Маржа ({marginPercent}%):</span>
                      <strong className="text-emerald-600 font-semibold">+{calculatedOps.marginAmount.toFixed(2)} ₴</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Ціна за одиницю (шт):</span>
                      <strong className="text-blue-600 font-mono font-bold">{calculatedOps.unitPrice.toFixed(4)} ₴</strong>
                    </div>
                  </div>
                </div>

                {/* Warehouse Stock Check */}
                <div className={`p-3 rounded-xl border text-xs ${
                  paperWarehouseStatus.hasEnough 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <strong className="font-bold">Склад:</strong> {paperWarehouseStatus.materialName} ({paperWarehouseStatus.available} доступно, потрібно {calculatedOps.physicalSheets})
                </div>

                {/* Margin manual percentage selector with Range Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">Відсоток націнки (маржа):</label>
                    <span className="text-sm font-extrabold text-blue-600">{marginPercent}%</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <input 
                      type="range"
                      min="0"
                      max="300"
                      step="5"
                      value={marginPercent}
                      onChange={(e) => setMarginPercent(Number(e.target.value))}
                      className="w-full cursor-pointer accent-blue-600"
                    />
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number"
                        min="0"
                        value={marginPercent}
                        onChange={(e) => setMarginPercent(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-800"
                      />
                      <div className="flex gap-1 bg-slate-100 border border-slate-200 p-1 rounded-lg flex-grow">
                        {[0, 50, 100, 150, 200].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMarginPercent(m)}
                            className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${
                              marginPercent === m
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {m}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Send & Invoice Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={handleSendToProduction}
                    disabled={!paperWarehouseStatus.hasEnough}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                      paperWarehouseStatus.hasEnough
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Запустити у виробництво
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowInvoice(true)} 
                      className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors text-center"
                    >
                      Рахунок PDF
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const text = `Ціна: ${calculatedOps.finalPrice.toFixed(2)} грн за ${quantity} шт (ціна за шт: ${calculatedOps.unitPrice.toFixed(2)} грн). Розраховано в Едельвейс і К.`;
                        navigator.clipboard.writeText(text);
                        alert('Текст скопійовано!');
                      }} 
                      className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors text-center"
                    >
                      Копіювати
                    </button>
                  </div>
                </div>

              </div>

              {/* Tariffs settings button */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <button 
                  onClick={() => {
                    if (isAdmin) {
                      setTempNorms(norms);
                      setShowNorms(true);
                    } else {
                      alert('Тільки адміністратор може змінювати базові тарифи.');
                    }
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Settings size={14} />
                  <span>Змінити базові тарифи</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice preview modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 m-0">Рахунок-Специфікація замовлення</h3>
              <button onClick={() => setShowInvoice(false)} className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto" id="invoice-preview-container">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4 gap-4">
                <div>
                  <h4 className="text-lg font-black tracking-tight text-slate-900 m-0">РАХУНОК-СПЕЦИФІКАЦІЯ № {orderNumber}</h4>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">Поліграфічна компанія «Едельвейс і К»</p>
                </div>
                <div className="text-right bg-slate-50 p-2.5 px-3.5 rounded-xl border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900 m-0">Дата: {new Date().toLocaleDateString('uk-UA')}</p>
                  <p className="text-slate-500 m-0 mt-1 font-medium">
                    Покупець: <span className="font-bold text-blue-600">{activeClient?.name || '—'}</span>
                  </p>
                </div>
              </div>

              {/* Product Specification & Quantity Banner */}
              <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Продукція / Специфікація</span>
                  <p className="text-sm font-bold text-slate-900 m-0">{name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Тираж замовлення</span>
                  <p className="text-sm font-black text-blue-600 m-0">{quantity} шт.</p>
                </div>
              </div>

              {/* 1. Матеріали та специфікація паперу */}
              <div className="mb-4">
                <h5 className="text-xs font-bold border-b border-slate-100 pb-1 mb-2 text-blue-600 uppercase tracking-wider m-0">
                  1. Матеріали та сировина
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Матеріал паперу:</span>
                    <strong className="text-slate-900">{paperType === 'offset' ? 'Офсетний 70г' : paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Розмір друкарського листа:</span>
                    <strong className="text-slate-900">{calculatedOps.format} ({calculatedOps.format === 'A1' ? '594x841 мм' : calculatedOps.format === 'A2' ? '420x594 мм' : '297x420 мм'})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Обсяг матеріалу:</span>
                    <strong className="text-slate-900">{calculatedOps.physicalSheets} арк. (+{Math.ceil(calculatedOps.physicalSheets * 0.05)} тех. відх.)</strong>
                  </div>
                </div>
              </div>

              {/* 2. Процес друку */}
              <div className="mb-4">
                <h5 className="text-xs font-bold border-b border-slate-100 pb-1 mb-2 text-blue-600 uppercase tracking-wider m-0">
                  2. Процес друку (Друкарська машина & Параметри)
                </h5>
                <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <tbody>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 w-1/3">Друкарська машина:</td>
                      <td className="py-2 px-3 font-bold text-slate-900 w-1/6">{calculatedOps.machine}</td>
                      <td className="py-2 px-3 text-slate-500 w-1/3">Красочність (кольоровість):</td>
                      <td className="py-2 px-3 font-bold text-slate-900 w-1/6">{colors} ({['1+1', '4+4'].includes(colors) ? '2-стор' : '1-стор'})</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 px-3 text-slate-500">Однотипних листів (на арк):</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{calculatedOps.itemsPerSheet} шт./арк</td>
                      <td className="py-2 px-3 text-slate-500">Спуск макету / оборот:</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{turnType === 'sam_na_sebe' ? 'Сам на себе (с/с)' : turnType === 'bez_oborotu' ? 'Без обороту' : 'Чужий оборот (ч/о)'}</td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <td className="py-2 px-3 text-slate-500">Кількість друкованих листів:</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{calculatedOps.physicalSheets} арк</td>
                      <td className="py-2 px-3 text-slate-500">Фактичні прогони:</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{calculatedOps.physicalSheets * (['1+1', '4+4'].includes(colors) ? 2 : 1)} прог.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-500">Приладка / Форми:</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{['1+1', '4+4'].includes(colors) ? 2 : 1} компл.</td>
                      <td className="py-2 px-3 text-slate-500">Технічні відходи:</td>
                      <td className="py-2 px-3 font-bold text-slate-900">+{Math.ceil(calculatedOps.physicalSheets * 0.05)} арк. (5%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. Післядрукарська обробка (Післядрук) */}
              <div className="mb-4">
                <h5 className="text-xs font-bold border-b border-slate-100 pb-1 mb-2 text-blue-600 uppercase tracking-wider m-0">
                  3. Післядрукарська обробка (Післядрук)
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Порізка тиражу:</span> <strong className="text-slate-900">Формат {selectedFormat}</strong>
                  </div>
                  <div className="p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Ламінування:</span> <strong className="text-slate-900">{laminationType === 'none' ? 'Без ламінування' : laminationType === 'gloss' ? 'Глянцева плівка' : laminationType === 'matte' ? 'Матова плівка' : 'Soft-touch оксамит'}</strong>
                  </div>
                  <div className="p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Бігування / Фальцювання:</span> <strong className="text-slate-900">{Number(creaseCount) > 0 ? `${creaseCount} бігів (згинів)` : 'Ні'}</strong>
                  </div>
                  <div className="p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Скріплення:</span> <strong className="text-slate-900">{bindingType === 'none' ? 'Без скріплення' : bindingType === 'staple' ? 'Скоба (шиття)' : bindingType === 'spring' ? 'Пружина' : bindingType === 'glue' ? 'Клей (КБС)' : 'Тверда палітурка'}</strong>
                  </div>
                  <div className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 col-span-2">
                    <span className="text-slate-500">Пакування та укладання:</span> <strong className="text-slate-900">{Number(packingCount) > 0 ? `${calculatedOps.totalPackages} пак. по ${packingCount} шт.` : 'Стандартне пакування'}</strong>
                  </div>
                </div>
              </div>

              {/* 4. Фінансовий розрахунок вартості */}
              <div>
                <h5 className="text-xs font-bold border-b border-slate-100 pb-1 mb-2 text-blue-600 uppercase tracking-wider m-0">
                  4. Фінансовий підсумок
                </h5>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-left">
                      <th className="py-2 font-bold text-slate-900">Складова замовлення</th>
                      <th className="py-2 text-center font-bold text-slate-900">Обсяг</th>
                      <th className="py-2 text-right font-bold text-slate-900">Сума (грн)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 text-slate-800">Макет та переддрук (Оборот: {turnType === 'sam_na_sebe' ? 'с/с' : turnType === 'bez_oborotu' ? 'без обор.' : 'ч/о'})</td>
                      <td className="py-2 text-center text-slate-600">1 посл.</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">{designCost.toFixed(2)} ₴</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-800">Матеріали + Поліграфічний друк + Післядрукарські операції</td>
                      <td className="py-2 text-center text-slate-600">{quantity} шт.</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">{(calculatedOps.finalPrice - designCost).toFixed(2)} ₴</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="text-sm font-bold border-t-2 border-slate-900">
                      <td className="pt-3 text-slate-900">РАЗОМ ДО СПЛАТИ:</td>
                      <td className="pt-3 text-center text-xs text-slate-500">Ціна за 1 шт: {calculatedOps.unitPrice.toFixed(2)} ₴</td>
                      <td className="pt-3 text-right text-blue-600 text-base font-extrabold">{calculatedOps.finalPrice.toFixed(2)} ₴</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowInvoice(false)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors">Закрити</button>
              <button onClick={generatePDF} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all">Завантажити PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveAsTemplate} className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 m-0">Зберегти розрахунок як шаблон</h3>
              <button type="button" onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">✕</button>
            </div>
            <div className="p-6">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Назва шаблону *</label>
                <input required placeholder="напр. Євробуклет 130г 500шт" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800" />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setShowTemplateModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors">Скасувати</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all">Зберегти шаблон</button>
            </div>
          </form>
        </div>
      )}

      {/* Norms settings edit modal (Admin) */}
      {showNorms && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 m-0">Базові тарифи підприємства</h3>
              <button onClick={() => setShowNorms(false)} className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateNorms(tempNorms); setShowNorms(false); alert('Тарифи оновлено!'); }} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Папір та дизайн</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Офсет 70г</label>
                    <input type="number" step="any" value={tempNorms.paperOffsetPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperOffsetPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Газетка 45г</label>
                    <input type="number" step="any" value={tempNorms.paperGazetkaPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperGazetkaPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Крейдований 130г</label>
                    <input type="number" step="any" value={tempNorms.paperCoatedPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperCoatedPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block pt-2 border-t border-slate-100">Післядрукарські тарифи за операцію</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Виготовлення форм</label>
                    <input type="number" step="any" value={tempNorms.formMakingPrice} onChange={(e) => setTempNorms({ ...tempNorms, formMakingPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Монтаж плівок</label>
                    <input type="number" step="any" value={tempNorms.filmMountingPrice} onChange={(e) => setTempNorms({ ...tempNorms, filmMountingPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Мат ламінація</label>
                    <input type="number" step="any" value={tempNorms.laminationMattePrice} onChange={(e) => setTempNorms({ ...tempNorms, laminationMattePrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Глянець ламінація</label>
                    <input type="number" step="any" value={tempNorms.laminationGlossyPrice} onChange={(e) => setTempNorms({ ...tempNorms, laminationGlossyPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Складне тиснення</label>
                    <input type="number" step="any" value={tempNorms.embossingPrice} onChange={(e) => setTempNorms({ ...tempNorms, embossingPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Висічка штампом</label>
                    <input type="number" step="any" value={tempNorms.dieCuttingPrice} onChange={(e) => setTempNorms({ ...tempNorms, dieCuttingPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Біговка (згин)</label>
                    <input type="number" step="any" value={tempNorms.foldingPrice} onChange={(e) => setTempNorms({ ...tempNorms, foldingPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Вставка блока</label>
                    <input type="number" step="any" value={tempNorms.blockInsertionPrice} onChange={(e) => setTempNorms({ ...tempNorms, blockInsertionPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                </div>

              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowNorms(false)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors">Скасувати</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all">Зберегти зміни</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

