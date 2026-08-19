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
  AlertTriangle
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
    } else if (cat === 'Візитки') {
      setQuantity(100);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('90x50 мм');
      setBindingType('none');
      setLaminationType('matte');
    } else if (cat === 'Буклети') {
      setQuantity(500);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('none');
      setCreaseCount(2);
    } else if (cat === 'Дипломи випускні') {
      setQuantity(50);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('gloss');
    } else if (cat === 'Календарики кишенькові') {
      setQuantity(500);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('70x100 мм');
      setBindingType('none');
      setLaminationType('gloss');
    } else if (cat === 'Книги') {
      setQuantity(200);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A5');
      setBindingType('staple');
      setLaminationType('gloss');
    } else if (cat === 'Листівки') {
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A5');
      setBindingType('none');
      setLaminationType('none');
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
    } else if (cat === 'Плакати') {
      setQuantity(100);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A3');
      setBindingType('none');
      setLaminationType('none');
    } else if (cat === 'Флаєри') {
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('Euro');
      setBindingType('none');
      setLaminationType('none');
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
            
            {templates.length > 0 && (
              <span className="ios-badge ios-badge-blue">
                {templates.length} збережених шаблонів
              </span>
            )}
          </div>

          {/* Top Main Category Switcher (Exact Sborka Header Styling) */}
          <div style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            borderBottom: '2px solid #dddddd',
            gap: '0px',
            overflowX: 'auto',
            marginBottom: '20px'
          }}>
            {[
              { key: 'products', label: 'ПРОДУКТИ' },
              { key: 'offset', label: 'ОФСЕТНИЙ ДРУК' },
              { key: 'digital', label: 'ЦИФРОВИЙ ДРУК' },
              { key: 'wide', label: 'ШИРОКОФОРМАТНИЙ ДРУК' },
              { key: 'roll', label: 'РУЛОННИЙ ДРУК', isRedBadge: true },
              { key: 'films', label: 'КОЛЬОРОВІ ПЛІВКИ' }
            ].map(tab => {
              const isActive = mainCategoryTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMainCategoryTab(tab.key as any)}
                  style={{
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    backgroundColor: tab.isRedBadge ? '#c00' : isActive ? '#666666' : 'transparent',
                    color: tab.isRedBadge ? '#ffffff' : isActive ? '#ffffff' : '#333333',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #c00' : '3px solid transparent',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    textTransform: 'uppercase'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: PRODUCTS (All Categories) */}
          {mainCategoryTab === 'products' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px'
            }}>
              {/* 1. Бланки та Листи */}
              <div 
                onClick={() => handleSelectCategory('Бланки')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FileText size={42} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Бланки та Листи</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Друк бланкової продукції на офсетному та самокопіювальному папері.
                </p>
              </div>

              {/* 2. Візитки */}
              <div 
                onClick={() => handleSelectCategory('Візитки')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Layout size={42} style={{ color: '#5856d6', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Візитки</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  90х50 мм або євро-формат, ламінація SoftTouch та скруглiння кутів.
                </p>
              </div>

              {/* 3. Буклети */}
              <div 
                onClick={() => handleSelectCategory('Буклети')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Layers size={42} style={{ color: '#ff9500', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Буклети</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Рекламні буклети з 1, 2 або 3 фальцями (згинами).
                </p>
              </div>

              {/* 4. Дипломи випускні */}
              <div 
                onClick={() => handleSelectCategory('Дипломи випускні')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BookOpen size={42} style={{ color: '#eab308', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Дипломи випускні</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Святкові дипломи, почесні грамоти та сертифікати випускників.
                </p>
              </div>

              {/* 5. Календарики кишенькові */}
              <div 
                onClick={() => handleSelectCategory('Календарики кишенькові')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Calendar size={42} style={{ color: '#ec4899', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Календарики кишенькові</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Кишенькові календарики 70х100мм з двосторонньою ламінацією.
                </p>
              </div>

              {/* 6. Книги */}
              <div 
                onClick={() => handleSelectCategory('Книги')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BookOpen size={42} style={{ color: '#34c759', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Книги / Брошури</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Багатосторінкові книги на скобу, термоклей або м'яку обкладинку.
                </p>
              </div>

              {/* 7. Листівки */}
              <div 
                onClick={() => handleSelectCategory('Листівки')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FileText size={42} style={{ color: '#06b6d4', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Листівки</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Рекламні листівки А6, А5, А4 на крейдованому папері.
                </p>
              </div>

              {/* 8. Меню */}
              <div 
                onClick={() => handleSelectCategory('Меню')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Layers size={42} style={{ color: '#8b5cf6', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Меню для ресторанів</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Меню з цупкою ламінацією, скріпленням пружиною або болтами.
                </p>
              </div>

              {/* 9. Наклейки */}
              <div 
                onClick={() => handleSelectCategory('Наклейки')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Layers size={42} style={{ color: '#af52de', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Наклейки та Стікери</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Самоклеючі наклейки з плотерною надсічкою на аркушах.
                </p>
              </div>

              {/* 10. Плакати */}
              <div 
                onClick={() => handleSelectCategory('Плакати')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Layout size={42} style={{ color: '#3b82f6', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Плакати та Афіші</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Великоформатний друк плакатів А3, А2, А1 для інтер'єру та реклами.
                </p>
              </div>

              {/* 11. Флаєри */}
              <div 
                onClick={() => handleSelectCategory('Флаєри')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FileText size={42} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Флаєри</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Єврофлаєри (99х210мм) яскравого Повноколірний 4+4 друку.
                </p>
              </div>

              {/* 12. Нотаріальні книги */}
              <div 
                onClick={() => handleSelectCategory('Нотаріальні книги')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BookOpen size={42} style={{ color: '#64748b', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Нотаріальні книги</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Спеціалізовані нотаріальні реєстри у твердій прошивній палітурці.
                </p>
              </div>

              {/* 13. Дипломи і палітурка */}
              <div 
                onClick={() => handleSelectCategory('Дипломи і палітурка')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BookOpen size={42} style={{ color: '#10b981', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Дипломи і палітурка</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Тверда палітурка дипломних робіт, дисертацій з тисненням фольгою.
                </p>
              </div>

              {/* 14. Логотипи виготовлення */}
              <div 
                onClick={() => handleSelectCategory('Логотипи виготовлення')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Layout size={42} style={{ color: '#6366f1', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Логотипи виготовлення</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Брендування логотипів на фірмовій айдентиці та матеріалах.
                </p>
              </div>

              {/* 15. Шкільні журнали */}
              <div 
                onClick={() => handleSelectCategory('Шкільні журнали')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BookOpen size={42} style={{ color: '#f43f5e', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Шкільні журнали</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Класні журнали успішності та шкільні облікові відомості.
                </p>
              </div>

              {/* 16. Етикетки */}
              <div 
                onClick={() => handleSelectCategory('Етикетки')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Layers size={42} style={{ color: '#14b8a6', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Етикетки та Бірки</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Товарні етикетки, маркувальні ярлики та фасувальні стікери.
                </p>
              </div>

              {/* 17. Календарі */}
              <div 
                onClick={() => handleSelectCategory('Календарі')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Calendar size={42} style={{ color: '#ff2d55', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Календарі</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Квартальні, настінні перекидні або будиночки на пружині.
                </p>
              </div>

              {/* 18. Блокноти */}
              <div 
                onClick={() => handleSelectCategory('Блокноти')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BookOpen size={42} style={{ color: '#00c7be', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Блокноти</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Фірмові блокноти А5, А4 з пружиною та персоналізованою обкладинкою.
                </p>
              </div>

              {/* 19. Папки */}
              <div 
                onClick={() => handleSelectCategory('Папки')}
                className="ios-card bg-white"
                style={{ padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FolderOpen size={42} style={{ color: '#8e8e93', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>Фірмові Папки</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8, margin: 0 }}>
                  Корпоративні папки з висічним замком для документів.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: OFFSET PRINTING (Overview & Sheet Detailed Calculator) */}
          {mainCategoryTab === 'offset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Offset Sub-Tab Navigation Header */}
              {(offsetSubTab === 'sheets' || offsetSubTab === 'felling' || offsetSubTab === 'multipage') ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 18px', borderRadius: '4px', border: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '700', color: '#333' }}>
                    <span onClick={() => setOffsetSubTab('overview')} style={{ color: '#c00', cursor: 'pointer' }}>Офсетний друк</span>
                    <span>/</span>
                    <span style={{ color: '#666' }}>
                      {offsetSubTab === 'sheets' && 'Листова (Збірні спуски)'}
                      {offsetSubTab === 'felling' && 'Висічна'}
                      {offsetSubTab === 'multipage' && 'Багатосторінкова'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOffsetSubTab('overview')}
                    style={{ border: '1px solid #ccc', backgroundColor: '#f8f9fa', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                  >
                    ← Назад до категорій
                  </button>
                </div>
              ) : (
                /* 4 Technology Header Columns */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                  {[
                    { title: 'ЛИСТОВА', desc: 'Візитівки, листівки, бланки, буклети, наліпки, плакати…', subTab: 'sheets' },
                    { title: 'ВИСІЧНА', desc: 'Фігурні наліпки, візитівки, листівки, підставки, хенгери…', subTab: 'felling' },
                    { title: 'БАГАТОСТОРОННЯ', desc: 'Брошури, журнали, каталоги, меню, звіти…', subTab: 'multipage' },
                    { title: 'ІНДИВІДУАЛЬНЕ ЗАМОВЛЕННЯ', desc: 'Замовити прорахунок комплексного або нестандартного замовлення', subTab: 'custom' }
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => setOffsetSubTab(item.subTab as any)}
                      style={{
                        cursor: 'pointer',
                        border: '1px solid #c8c7c7',
                        backgroundColor: '#f2f2f2',
                        textAlign: 'center',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        const h = e.currentTarget.querySelector('.type-hdr') as HTMLElement;
                        if (h) { h.style.backgroundColor = '#666666'; h.style.color = '#ffffff'; }
                      }}
                      onMouseLeave={(e) => {
                        const h = e.currentTarget.querySelector('.type-hdr') as HTMLElement;
                        if (h) { h.style.backgroundColor = '#dddddd'; h.style.color = '#333333'; }
                      }}
                    >
                      <div 
                        className="type-hdr"
                        style={{
                          backgroundColor: '#dddddd',
                          color: '#333333',
                          fontWeight: '700',
                          fontSize: '15px',
                          padding: '12px 10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ padding: '14px 16px', fontSize: '11px', color: '#555555', lineHeight: '1.4' }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* OVERVIEW SUBTAB: Sborka 18-Card Product Grid */}
              {offsetSubTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                  {/* Helper function to select size preset and navigate */}
                  {/* 1. Візитівка */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('1'); setSheetCustomWidth('90'); setSheetCustomHeight('50'); handleSelectCategory('Візитки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Візитівка
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: '90х50', preset: '1', w: '90', h: '50', kind: '1' },
                        { name: '85х55', preset: '5', w: '85', h: '55', kind: '1' },
                        { name: '50х50', preset: '5', w: '50', h: '50', kind: '2' },
                        { name: 'Кругла', preset: '5', w: '50', h: '50', kind: '7' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Візитки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 2. Календар */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('91'); setSheetCustomWidth('100'); setSheetCustomHeight('70'); handleSelectCategory('Календарі кишенькові'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Календар
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: '100х70', preset: '91', w: '100', h: '70', kind: '1' },
                        { name: '90х60', preset: '90', w: '90', h: '60', kind: '1' },
                        { name: '70х70', preset: '256', w: '70', h: '70', kind: '2' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Календарі кишенькові'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 3. Флаєр */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('25'); setSheetCustomWidth('99'); setSheetCustomHeight('210'); handleSelectCategory('Флаєри'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Флаєр
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: '210х99', preset: '25', w: '99', h: '210', kind: '1' },
                        { name: '210х198', preset: '26', w: '198', h: '210', kind: '6' },
                        { name: '99х99', preset: '24', w: '99', h: '99', kind: '2' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Флаєри'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4. Листівка */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('28'); setSheetCustomWidth('70'); setSheetCustomHeight('100'); handleSelectCategory('Листівки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Листівка
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'А7', preset: '28', w: '70', h: '100', kind: '1' },
                        { name: 'А6', preset: '312', w: '105', h: '148', kind: '1' },
                        { name: 'А5', preset: '32', w: '148', h: '210', kind: '1' },
                        { name: 'А4', preset: '34', w: '210', h: '297', kind: '1' },
                        { name: 'А3', preset: '36', w: '297', h: '420', kind: '1' },
                        { name: 'Кругла', preset: '37', w: '70', h: '70', kind: '7' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Листівки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 5. Плакати */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('36'); setSheetCustomWidth('297'); setSheetCustomHeight('420'); handleSelectCategory('Плакати'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Плакати
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'А3', preset: '36', w: '297', h: '420', kind: '1' },
                        { name: 'В3', preset: 'b3', w: '340', h: '490', kind: '1' },
                        { name: 'А2', preset: '15', w: '420', h: '594', kind: '1' },
                        { name: 'В2', preset: 'b2', w: '480', h: '690', kind: '1' },
                        { name: 'А1', preset: '16', w: '594', h: '841', kind: '1' },
                        { name: 'B1', preset: 'b1', w: '680', h: '980', kind: '1' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Плакати'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 6. Сети */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('sets_a3'); setSheetCustomWidth('420'); setSheetCustomHeight('297'); handleSelectCategory('Сети'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Сети
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'А3', preset: 'sets_a3', w: '420', h: '297', kind: '1' },
                        { name: 'В3', preset: 'sets_b3', w: '490', h: '340', kind: '1' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Сети'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 7. Буклет */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('6'); setSheetSizePreset('34'); setSheetCustomWidth('210'); setSheetCustomHeight('297'); handleSelectCategory('Буклети'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Буклет
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'А4 в Євро', preset: '34', w: '210', h: '297', kind: '6' },
                        { name: '2Євро в Євро', preset: '26', w: '198', h: '210', kind: '6' },
                        { name: 'А6', preset: '312', w: '105', h: '148', kind: '6' },
                        { name: 'А5', preset: '32', w: '148', h: '210', kind: '6' },
                        { name: 'А4', preset: '34', w: '210', h: '297', kind: '6' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Буклети'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 8. Каталог */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('multipage'); handleSelectCategory('Книги'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Каталог
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {['Скоба', 'Пружина', 'Клей'].map(st => (
                        <span
                          key={st}
                          onClick={() => { setOffsetSubTab('multipage'); handleSelectCategory('Книги'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 9. Блокнот */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('32'); setSheetCustomWidth('148'); setSheetCustomHeight('210'); handleSelectCategory('Блокноти'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Блокнот
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'А6', preset: '312', w: '105', h: '148' },
                        { name: 'А5', preset: '32', w: '148', h: '210' },
                        { name: 'А4', preset: '34', w: '210', h: '297' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Блокноти'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 10. Наліпка */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('1'); setSheetCustomWidth('90'); setSheetCustomHeight('50'); handleSelectCategory('Наклейки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Наліпка
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: '90х50', preset: '1', w: '90', h: '50', kind: '1' },
                        { name: '50х50', preset: '5', w: '50', h: '50', kind: '2' },
                        { name: 'Кругла', preset: '5', w: '50', h: '50', kind: '7' },
                        { name: 'Овальна', preset: '1', w: '90', h: '50', kind: '8' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Наклейки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 11. Папка А4 */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('34'); setSheetCustomWidth('210'); setSheetCustomHeight('297'); handleSelectCategory('Папки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Папка А4
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {['Без корінця', 'Корінець 5мм', 'З резинкою'].map(fmt => (
                        <span
                          key={fmt}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('34'); setSheetCustomWidth('210'); setSheetCustomHeight('297'); handleSelectCategory('Папки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 12. Листівка (проста/складна/кругла) */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('32'); setSheetCustomWidth('148'); setSheetCustomHeight('210'); handleSelectCategory('Листівки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Листівка
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'Одинарна', preset: '32', w: '148', h: '210', kind: '1' },
                        { name: 'Складна', preset: '34', w: '210', h: '297', kind: '6' },
                        { name: 'Кругла', preset: '37', w: '70', h: '70', kind: '7' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind(item.kind); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Листівки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 13. Календарні сітки */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('34'); setSheetCustomWidth('210'); setSheetCustomHeight('297'); handleSelectCategory('Календарі кишенькові'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 8px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Календарні сітки
                    </h4>
                    <div 
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('34'); setSheetCustomWidth('210'); setSheetCustomHeight('297'); handleSelectCategory('Календарі кишенькові'); }}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                    >
                      <Calendar size={22} style={{ color: '#c00' }} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>Сітки 2026</span>
                    </div>
                  </div>

                  {/* 14. Друк в листах */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('15'); setSheetCustomWidth('420'); setSheetCustomHeight('594'); handleSelectCategory('Бланки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Друк в листах
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'А2', preset: '15', w: '420', h: '594' },
                        { name: 'В2', preset: 'b2', w: '480', h: '690' },
                        { name: 'А1', preset: '16', w: '594', h: '841' },
                        { name: 'В1', preset: 'b1', w: '680', h: '980' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Бланки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 15. Конверт */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('25'); setSheetCustomWidth('110'); setSheetCustomHeight('220'); handleSelectCategory('Бланки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Конверт
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'Євро', preset: '25', w: '110', h: '220' },
                        { name: 'С6', preset: '21', w: '114', h: '162' },
                        { name: 'С5', preset: '32', w: '162', h: '229' },
                        { name: 'С4', preset: '34', w: '229', h: '324' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Бланки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 16. Хенгери */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('felling'); handleSelectCategory('Наклейки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Хенгери
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {['вид 1', 'вид 2'].map(v => (
                        <span
                          key={v}
                          onClick={() => { setOffsetSubTab('felling'); handleSelectCategory('Наклейки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          🔖 {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 17. Календарі висічні */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('felling'); setSheetSizePreset('160'); setSheetCustomWidth('210'); setSheetCustomHeight('300'); handleSelectCategory('Календарі кишенькові'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Календарі висічні
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'будинок', preset: '160', w: '210', h: '300' },
                        { name: 'пірамідка', preset: '161', w: '305', h: '134' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('felling'); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Календарі кишенькові'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          🏠 {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 18. Пакувальний папір */}
                  <div style={{ backgroundColor: '#f2f2f2', border: '1px solid #ddd', padding: '16px 12px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4
                      onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('36'); setSheetCustomWidth('297'); setSheetCustomHeight('420'); handleSelectCategory('Бланки'); }}
                      style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: '0 0 10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#222'}
                    >
                      Пакувальний папір
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#333' }}>
                      {[
                        { name: 'А3', preset: '36', w: '297', h: '420' },
                        { name: 'В3', preset: 'b3', w: '340', h: '490' },
                        { name: 'А2', preset: '15', w: '420', h: '594' },
                        { name: 'В2', preset: 'b2', w: '480', h: '690' },
                        { name: 'А1', preset: '16', w: '594', h: '841' },
                        { name: 'B1', preset: 'b1', w: '680', h: '980' }
                      ].map(item => (
                        <span
                          key={item.name}
                          onClick={() => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset(item.preset); setSheetCustomWidth(item.w); setSheetCustomHeight(item.h); handleSelectCategory('Бланки'); }}
                          style={{ cursor: 'pointer', fontWeight: '600', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#c00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DETAILED SHEET CALCULATOR (Офсетний друк / Листова) */}
              {offsetSubTab === 'sheets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Top Information Buttons Bar */}
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <button type="button" onClick={() => setActiveInfoModal('instr')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📄 Інструкція по оформленню замовлення
                    </button>
                    <button type="button" onClick={() => setActiveInfoModal('terms')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⏱️ Терміни друку
                    </button>
                    <button type="button" onClick={() => setActiveInfoModal('materials')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📚 Матеріали
                    </button>
                    <button type="button" onClick={() => setActiveInfoModal('samples')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🏷️ Зразки матеріалів з друком
                    </button>
                    <button type="button" onClick={() => setActiveInfoModal('review')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      💬 Ваш відгук
                    </button>
                    <button type="button" onClick={() => setActiveInfoModal('bug')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#c00', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⚠️ Знайшли помилку?
                    </button>
                  </div>

                  {/* Business Card & Calendar Kind Selection Bar */}
                  <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#222', margin: 0 }}>Вид візитівки / календаря / листової поліграфії</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {[
                        { id: '1', name: 'Стандартні', img: 'https://sborka.ua/cside/img/ico_size/products/viz.png', defaultSize: '1', w: '90', h: '50' },
                        { id: '2', name: 'Квадратні', img: 'https://sborka.ua/cside/img/ico_size/products/kvadr.png', defaultSize: '5', w: '50', h: '50' },
                        { id: '6', name: 'Складні', img: 'https://sborka.ua/cside/img/ico_size/products/big.png', defaultSize: '161', w: '90', h: '50' },
                        { id: '7', name: 'Круг', img: 'https://sborka.ua/cside/img/ico_size/products/circle.png', defaultSize: '1', w: '50', h: '50' },
                        { id: '8', name: 'Овал', img: 'https://sborka.ua/cside/img/Oval/31_21_n108.png', defaultSize: '1', w: '90', h: '50' },
                        { id: '9', name: 'Заокругленні кути', img: 'https://sborka.ua/cside/img/ico_size/products/cart.png', defaultSize: '1', w: '90', h: '50' },
                      ].map(kindItem => {
                        const isActive = cardKind === kindItem.id;
                        return (
                          <div
                            key={kindItem.id}
                            onClick={() => {
                              setCardKind(kindItem.id);
                              setSheetSizePreset(kindItem.defaultSize);
                              setSheetCustomWidth(kindItem.w);
                              setSheetCustomHeight(kindItem.h);
                            }}
                            style={{
                              cursor: 'pointer',
                              border: isActive ? '2px solid #c00' : '1px solid #ddd',
                              backgroundColor: isActive ? '#fff0f0' : '#f9f9f9',
                              borderRadius: '6px',
                              padding: '8px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              minWidth: '110px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <img src={kindItem.img} alt={kindItem.name} style={{ width: '55px', height: '40px', objectFit: 'contain' }} />
                            <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '600', color: isActive ? '#c00' : '#333', textAlign: 'center' }}>
                              {kindItem.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selector and Product Preview Block */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid #ddd' }}>
                    {/* Left: Size Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#222', margin: 0, borderBottom: '2px solid #c00', paddingBottom: '6px', display: 'inline-block' }}>Розмір</h4>
                      
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '6px', display: 'block' }}>Оберіть стандартний розмір:</label>
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
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', fontWeight: '600' }}
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
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '6px', display: 'block' }}>Введіть свій розмір:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            value={sheetCustomWidth}
                            onChange={(e) => { setSheetCustomWidth(e.target.value); setSheetSizePreset('custom'); }}
                            placeholder="Ширина"
                            style={{ width: '90px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center', fontSize: '13px' }}
                          />
                          <span style={{ fontWeight: '700', color: '#888' }}>×</span>
                          <input
                            type="number"
                            value={sheetCustomHeight}
                            onChange={(e) => { setSheetCustomHeight(e.target.value); setSheetSizePreset('custom'); }}
                            placeholder="Висота"
                            style={{ width: '90px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center', fontSize: '13px' }}
                          />
                          <select
                            value={sheetUnit}
                            onChange={(e) => setSheetUnit(e.target.value as any)}
                            style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                          >
                            <option value="mm">мм</option>
                            <option value="cm">см</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right: Layout Preview Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', border: '1px dashed #ccc', padding: '20px', borderRadius: '4px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#666', marginBottom: '12px' }}>Вид готового виробу</p>
                      
                      {/* Visual scaled representation rectangle */}
                      <div style={{
                        width: sheetOrientation === 'horiz' ? '180px' : '120px',
                        height: sheetOrientation === 'horiz' ? '120px' : '180px',
                        border: '2px dashed #c00',
                        backgroundColor: '#ffffff',
                        borderRadius: cardKind === '7' || cardKind === '8' ? '50%' : cardKind === '9' ? '16px' : '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s ease'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>
                          {sheetCustomWidth} × {sheetCustomHeight} {sheetUnit}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '600' }}>
                        <span style={{ color: sheetOrientation === 'horiz' ? '#c00' : '#666' }}>Горизонтальний</span>
                        <button
                          type="button"
                          onClick={() => setSheetOrientation(prev => prev === 'horiz' ? 'vert' : 'horiz')}
                          style={{ border: '1px solid #ccc', backgroundColor: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Повернути макет"
                        >
                          🔄
                        </button>
                        <span style={{ color: sheetOrientation === 'vert' ? '#c00' : '#666' }}>Вертикальний</span>
                      </div>
                    </div>
                  </div>

                  {/* Postpress Accordion Section */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      onClick={() => setShowPostpressAccordion(!showPostpressAccordion)}
                      style={{ padding: '14px 20px', backgroundColor: '#f2f2f2', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: showPostpressAccordion ? '1px solid #ddd' : 'none' }}
                    >
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: 0 }}>Післядрукарська обробка</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostPersonalization('0'); setPostLuvers('0'); setPostLuversCount(1);
                            setPostCorners('0'); setPostGluing('0'); setPostDrilling('0');
                            setPostFolding('0'); setPostCreasing('0'); setPostPerforation('0');
                            setPostPackingText('');
                          }}
                          style={{ border: 'none', background: 'none', color: '#c00', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          ✖ Очистити
                        </button>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#666' }}>{showPostpressAccordion ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {showPostpressAccordion && (
                      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {/* 1. Персоналізація */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Персоналізація</label>
                          <select value={postPersonalization} onChange={(e) => setPostPersonalization(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            <option value="1">Є — нумерація, змінні дані</option>
                          </select>
                        </div>

                        {/* 2. Люверс */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Люверс</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <select value={postLuvers} onChange={(e) => setPostLuvers(e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                              <option value="0">Ні</option>
                              <option value="93">Золотий</option>
                              <option value="92">Срібний</option>
                            </select>
                            {postLuvers !== '0' && (
                              <input type="number" value={postLuversCount} onChange={(e) => setPostLuversCount(parseInt(e.target.value) || 1)} min={1} style={{ width: '60px', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }} />
                            )}
                          </div>
                        </div>

                        {/* 3. Закруглення кутів */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Закруглення кутів</label>
                          <select value={postCorners} onChange={(e) => setPostCorners(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            <option value="4">4 кути</option>
                            <option value="1">1 кут</option>
                            <option value="2">2 кути</option>
                            <option value="3">3 кути</option>
                          </select>
                        </div>

                        {/* 4. Проклейка в блок */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Проклейка в блок</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <select value={postGluing} onChange={(e) => setPostGluing(e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                              <option value="0">Ні</option>
                              <option value="25">25 листів</option>
                              <option value="50">50 листів</option>
                              <option value="100">100 листів</option>
                              <option value="250">250 листів</option>
                            </select>
                            {postGluing !== '0' && (
                              <select value={postGluingSide} onChange={(e) => setPostGluingSide(e.target.value)} style={{ width: '120px', padding: '6px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                                <option value="1">По короткій</option>
                                <option value="2">По довгій</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* 5. Свердління */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Свердління</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <select value={postDrilling} onChange={(e) => setPostDrilling(e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                              <option value="0">Ні</option>
                              <option value="1">1 отвір</option>
                              <option value="2">2 отвори</option>
                              <option value="3">3 отвори</option>
                              <option value="4">4 отвори</option>
                            </select>
                            {postDrilling !== '0' && (
                              <select value={postDrillingDia} onChange={(e) => setPostDrillingDia(e.target.value)} style={{ width: '90px', padding: '6px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
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
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Згинання (Фальцовка)</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <select value={postFolding} onChange={(e) => setPostFolding(e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
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
                                style={{ width: '60px', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}
                              />
                            )}
                          </div>
                        </div>

                        {/* 7. Біговка */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Біговка</label>
                          <select value={postCreasing} onChange={(e) => setPostCreasing(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n.toString()}>{n} {n === 1 ? 'біг' : 'біги'}</option>
                            ))}
                          </select>
                        </div>

                        {/* 8. Перфорація */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Перфорація</label>
                          <select value={postPerforation} onChange={(e) => setPostPerforation(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n.toString()}>{n} {n === 1 ? 'прохід' : 'проходи'}</option>
                            ))}
                          </select>
                        </div>

                        {/* 9. Розфасовка */}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Розфасовка</label>
                          <input
                            type="text"
                            value={postPackingText}
                            onChange={(e) => setPostPackingText(e.target.value)}
                            placeholder="наприклад: 100, 200, 350"
                            style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sets Counter Bar */}
                  <div style={{ backgroundColor: '#ffffff', padding: '14px 20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#222' }}>Комплектів:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSheetSetsCount(prev => Math.max(1, prev - 1))}
                        style={{ width: '32px', height: '32px', border: '1px solid #ccc', backgroundColor: '#f2f2f2', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={sheetSetsCount}
                        onChange={(e) => setSheetSetsCount(parseInt(e.target.value) || 1)}
                        style={{ width: '50px', height: '32px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: '700' }}
                      />
                      <button
                        type="button"
                        onClick={() => setSheetSetsCount(prev => prev + 1)}
                        style={{ width: '32px', height: '32px', border: '1px solid #ccc', backgroundColor: '#f2f2f2', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      (Замовлень з однаковими параметрами, але різними макетами)
                    </span>
                  </div>

                  {/* Filter Options (Materials, Coating, Color Printing) */}
                  <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#222', margin: 0 }}>Фільтр специфікацій та матеріалів</h4>

                    {/* Material Options */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#555', display: 'block', marginBottom: '8px' }}>Матеріал паперу:</span>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {[
                          { id: '80', label: 'Офсет 80г' },
                          { id: '90', label: 'Крейд 90г' },
                          { id: '115', label: 'Крейд 115г' },
                          { id: '130', label: 'Крейд 130г' },
                          { id: '150', label: 'Крейд 150г' },
                          { id: '170', label: 'Крейд 170г' },
                          { id: '250', label: 'Крейд 250г' },
                          { id: '300', label: 'Крейд 300г' },
                          { id: '350', label: 'Крейд 350г' },
                          { id: 'kraft', label: 'Крафт 80г' }
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
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                borderRadius: '4px',
                                border: isSel ? '1px solid #c00' : '1px solid #ccc',
                                backgroundColor: isSel ? '#fff0f0' : '#f8f9fa',
                                color: isSel ? '#c00' : '#333',
                                cursor: 'pointer'
                              }}
                            >
                              {mat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Coating Options */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#555', display: 'block', marginBottom: '8px' }}>Покриття (Ламінація / Лак):</span>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {[
                          { id: '0', label: 'Без покриття' },
                          { id: '7', label: 'ГЛ лам 1+0' },
                          { id: '8', label: 'ГЛ лам 1+1' },
                          { id: '9', label: 'МАТ лам 1+0' },
                          { id: '10', label: 'МАТ лам 1+1' },
                          { id: '30', label: 'SOFT лам 1+0' },
                          { id: '31', label: 'SOFT лам 1+1' }
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
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                borderRadius: '4px',
                                border: isSel ? '1px solid #c00' : '1px solid #ccc',
                                backgroundColor: isSel ? '#fff0f0' : '#f8f9fa',
                                color: isSel ? '#c00' : '#333',
                                cursor: 'pointer'
                              }}
                            >
                              {cov.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color Printing Options */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#555', display: 'block', marginBottom: '8px' }}>Кольоровість друку:</span>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['4+0', '4+4', '1+0', '1+1'].map(col => {
                          const isSel = selectedPrintColors.includes(col);
                          return (
                            <button
                              key={col}
                              type="button"
                              onClick={() => {
                                setSelectedPrintColors(prev => 
                                  prev.includes(col) ? prev.filter(x => x !== col) : [...prev, col]
                                );
                              }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                borderRadius: '4px',
                                border: isSel ? '1px solid #c00' : '1px solid #ccc',
                                backgroundColor: isSel ? '#fff0f0' : '#f8f9fa',
                                color: isSel ? '#c00' : '#333',
                                cursor: 'pointer'
                              }}
                            >
                              {col}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Price Calculation Matrix Table */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#222', margin: 0 }}>Специфікація розрахунків та прайс-лист</h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={includeDelivery} onChange={(e) => setIncludeDelivery(e.target.checked)} />
                          З доставкою
                        </label>

                        <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_tirazh')}
                            style={{ border: 'none', padding: '4px 10px', fontSize: '11px', fontWeight: '700', backgroundColor: priceCostVar === 'per_tirazh' ? '#666' : '#fff', color: priceCostVar === 'per_tirazh' ? '#fff' : '#333', cursor: 'pointer' }}
                          >
                            За наклад
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_item')}
                            style={{ border: 'none', padding: '4px 10px', fontSize: '11px', fontWeight: '700', backgroundColor: priceCostVar === 'per_item' ? '#666' : '#fff', color: priceCostVar === 'per_item' ? '#fff' : '#333', cursor: 'pointer' }}
                          >
                            За екземпляр
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#666666', color: '#ffffff', fontWeight: '700' }}>
                            <th style={{ padding: '10px', border: '1px solid #555' }}>Матеріал та покриття</th>
                            <th style={{ padding: '10px', border: '1px solid #555' }}>Друк</th>
                            <th style={{ padding: '10px', border: '1px solid #555' }}>Готовність</th>
                            {[100, 250, 500, 1000, 1500, 2500, 5000, 10000].map(tir => (
                              <th key={tir} style={{ padding: '10px', border: '1px solid #555' }}>{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMaterials.flatMap(matId => 
                            selectedCoverings.flatMap(covId => 
                              selectedPrintColors.map((colStr, rowIdx) => {
                                const matLabels: Record<string, string> = {
                                  '80': 'Офсетний 80 г/м²', '90': 'Крейд ГЛ 90 г/м²', '115': 'Крейд ГЛ 115 г/м²',
                                  '130': 'Крейд ГЛ 130 г/м²', '150': 'Крейд ГЛ 150 г/м²', '170': 'Крейд ГЛ 170 г/м²',
                                  '250': 'Крейд МАТ 250 г/м²', '300': 'Крейд МАТ 300 г/м²', '350': 'Крейд МАТ 350 г/м²', 'kraft': 'Крафт 80 г/м²'
                                };
                                const covLabels: Record<string, string> = {
                                  '0': 'Без покриття', '7': 'ГЛ лам 1+0', '8': 'ГЛ лам 1+1',
                                  '9': 'МАТ лам 1+0', '10': 'МАТ лам 1+1', '30': 'SOFT лам 1+0', '31': 'SOFT лам 1+1'
                                };
                                const matName = matLabels[matId] || `Папір ${matId}г`;
                                const covName = covLabels[covId] || '';
                                const fullMatCover = covName ? `${matName} (${covName})` : matName;

                                // Base rate per sheet
                                const matDensity = parseInt(matId) || 130;
                                const areaM2 = (parseFloat(sheetCustomWidth) / 1000) * (parseFloat(sheetCustomHeight) / 1000);
                                const isDouble = colStr === '4+4' || colStr === '1+1';

                                return (
                                  <tr key={`${matId}-${covId}-${colStr}-${rowIdx}`} style={{ backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333', borderRight: '1px solid #ddd' }}>
                                      {fullMatCover}
                                    </td>
                                    <td style={{ padding: '10px', fontWeight: '700', color: '#c00', borderRight: '1px solid #ddd' }}>
                                      {colStr}
                                    </td>
                                    <td style={{ padding: '10px', fontSize: '11px', color: '#666', borderRight: '1px solid #ddd' }}>
                                      1-2 дні
                                    </td>
                                    {[100, 250, 500, 1000, 1500, 2500, 5000, 10000].map(tir => {
                                      const basePaperCost = areaM2 * (matDensity * 0.08) * tir;
                                      const printCost = (isDouble ? 0.35 : 0.20) * tir + 120;
                                      const lamCost = covId !== '0' ? areaM2 * 0.45 * tir : 0;
                                      const deliveryCost = includeDelivery ? 80 : 0;
                                      const rawTotal = (basePaperCost + printCost + lamCost + deliveryCost) * (marginPercent / 100);
                                      const itemCost = rawTotal / tir;
                                      const displayVal = priceCostVar === 'per_item' ? itemCost.toFixed(2) : Math.round(rawTotal).toString();

                                      return (
                                        <td
                                          key={tir}
                                          onClick={() => {
                                            setQuantity(tir);
                                            setPaperType(matId === '80' ? 'offset' : 'coated');
                                            setColors(colStr);
                                            setCategory('Листівки');
                                            setStep('editor');
                                          }}
                                          style={{ padding: '10px', fontWeight: '700', color: '#111', cursor: 'pointer', borderRight: '1px solid #ddd', transition: 'background-color 0.15s ease' }}
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
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* DETAILED DIE-CUT CALCULATOR (Офсетний друк / Висічна) */}
              {offsetSubTab === 'felling' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Top Information Buttons Bar */}
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('instr')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FileText size={16} style={{ color: '#c00' }} />
                      <span>Інструкція по оформленню замовлення</span>
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
                      style={{ textDecoration: 'none', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={16} style={{ color: '#c00' }} />
                      <span>Завантажити шаблон штампу</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('terms')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Clock size={16} style={{ color: '#c00' }} />
                      <span>Терміни друку</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('materials')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Layers size={16} style={{ color: '#c00' }} />
                      <span>Матеріали</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('samples')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Tag size={16} style={{ color: '#c00' }} />
                      <span>Зразки матеріалів з друком</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('review')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageSquare size={16} style={{ color: '#c00' }} />
                      <span>Ваш відгук</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('bug')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <AlertTriangle size={16} style={{ color: '#c00' }} />
                      <span>Знайшли помилку?</span>
                    </button>
                  </div>

                  {/* Form Selector Header Bar */}
                  <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#222', margin: 0 }}>Форма штампу</h4>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
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
                            style={{
                              cursor: 'pointer',
                              border: isActive ? '2px solid #c00' : '1px solid #ddd',
                              backgroundColor: isActive ? '#fff0f0' : '#f9f9f9',
                              borderRadius: '6px',
                              padding: '10px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              minWidth: '100px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <img src={formItem.img} alt={formItem.name} style={{ width: '60px', height: '40px', objectFit: 'contain' }} />
                            <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '600', color: isActive ? '#c00' : '#333', textAlign: 'center' }}>
                              {formItem.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stamp Selection & Interactive Product Preview */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {/* Left Column: Die-cut Stamp Selection */}
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#222', margin: 0 }}>Оберіть стандартний штамп</h4>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '6px' }}>Готовий штамп з каталогу:</label>
                        <select
                          value={fellingStamp}
                          onChange={(e) => setFellingStamp(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}
                        >
                          <option value="128">Хенгер вид 1 90 х 200 мм</option>
                          <option value="133">Хенгер вид 2 90 х 200 мм</option>
                          <option value="160">Будинок 210 х 300 мм</option>
                          <option value="161">Пірамідка 305 x 134 мм</option>
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
                          <div style={{ backgroundColor: '#f8f9fa', padding: '12px 14px', borderRadius: '4px', border: '1px solid #eee', fontSize: '13px' }}>
                            <div style={{ fontWeight: '700', color: '#111', marginBottom: '4px' }}>{info.title}</div>
                            <div style={{ color: '#666' }}>Габарити висічки: <strong style={{ color: '#c00' }}>{info.w} × {info.h} мм</strong></div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Right Column: Visual Stamp Preview */}
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вид готового виробу</span>
                      <div style={{ width: '100%', height: '200px', border: '1px dashed #ccc', backgroundColor: '#fafafa', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
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
                            <img src={imgUrl} alt="Прев'ю штампу" style={{ maxHeight: '180px', maxWidth: '90%', objectFit: 'contain' }} />
                          ) : (
                            <div style={{ width: '140px', height: '140px', border: '2px dashed #c00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c00', fontWeight: '700' }}>
                              Висічка
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Postpress Accordion section */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div
                      onClick={() => setShowPostpressAccordion(!showPostpressAccordion)}
                      style={{ padding: '14px 20px', backgroundColor: '#f8f9fa', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#222' }}>
                        {showPostpressAccordion ? '▼' : '►'} Післядрукарська обробка
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPostPersonalization('0');
                          setPostLuvers('0');
                          setPostLuversCount(1);
                          setPostCorners('0');
                          setPostGluing('0');
                          setPostDrilling('0');
                          setPostFolding('0');
                          setPostCreasing('0');
                          setPostPerforation('0');
                          setPostPackingText('');
                        }}
                        style={{ border: 'none', background: 'none', color: '#c00', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        ✕ Очистити
                      </button>
                    </div>

                    {showPostpressAccordion && (
                      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', borderTop: '1px solid #eee' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Персоналізація</label>
                          <select value={postPersonalization} onChange={(e) => setPostPersonalization(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            <option value="1">Є — нумерація, змінні дані</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Люверс</label>
                          <select value={postLuvers} onChange={(e) => setPostLuvers(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            <option value="93">Золотий</option>
                            <option value="92">Срібний</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Закруглення кутів</label>
                          <select value={postCorners} onChange={(e) => setPostCorners(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            <option value="4">4 кути</option>
                            <option value="1">1 кут</option>
                            <option value="2">2 кути</option>
                            <option value="3">3 кути</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Свердління</label>
                          <select value={postDrilling} onChange={(e) => setPostDrilling(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            <option value="1">1 отвір</option>
                            <option value="2">2 отвори</option>
                            <option value="3">3 отвори</option>
                            <option value="4">4 отвори</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '4px' }}>Біговка</label>
                          <select value={postCreasing} onChange={(e) => setPostCreasing(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
                            <option value="0">Ні</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n.toString()}>{n} {n === 1 ? 'біг' : 'біги'}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sets Counter Bar */}
                  <div style={{ backgroundColor: '#ffffff', padding: '14px 20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#222' }}>Комплектів:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSheetSetsCount(prev => Math.max(1, prev - 1))}
                        style={{ width: '32px', height: '32px', border: '1px solid #ccc', backgroundColor: '#f2f2f2', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={sheetSetsCount}
                        onChange={(e) => setSheetSetsCount(parseInt(e.target.value) || 1)}
                        style={{ width: '50px', height: '32px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: '700' }}
                      />
                      <button
                        type="button"
                        onClick={() => setSheetSetsCount(prev => prev + 1)}
                        style={{ width: '32px', height: '32px', border: '1px solid #ccc', backgroundColor: '#f2f2f2', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      (Замовлень з однаковими параметрами, але різними макетами)
                    </span>
                  </div>

                  {/* Pricing Matrix Table for Die-cut */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#222', margin: 0 }}>Специфікація розрахунків та прайс-лист висічки</h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={includeDelivery} onChange={(e) => setIncludeDelivery(e.target.checked)} />
                          З доставкою
                        </label>

                        <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_tirazh')}
                            style={{ border: 'none', padding: '4px 10px', fontSize: '11px', fontWeight: '700', backgroundColor: priceCostVar === 'per_tirazh' ? '#666' : '#fff', color: priceCostVar === 'per_tirazh' ? '#fff' : '#333', cursor: 'pointer' }}
                          >
                            За наклад
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_item')}
                            style={{ border: 'none', padding: '4px 10px', fontSize: '11px', fontWeight: '700', backgroundColor: priceCostVar === 'per_item' ? '#666' : '#fff', color: priceCostVar === 'per_item' ? '#fff' : '#333', cursor: 'pointer' }}
                          >
                            За екземпляр
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#eeeeee', borderBottom: '1px solid #ccc' }}>
                            <th style={{ padding: '10px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Матеріал та покриття</th>
                            <th style={{ padding: '10px', borderRight: '1px solid #ddd' }}>Друк</th>
                            <th style={{ padding: '10px', borderRight: '1px solid #ddd' }}>Готовність</th>
                            {[100, 250, 500, 1000, 2500, 5000, 10000].map(tir => (
                              <th key={tir} style={{ padding: '10px', borderRight: '1px solid #ddd' }}>{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { mat: 'Льон Icelite 300', cov: 'Ні', color: '4+0', time: '1-2 дні' },
                            { mat: 'Tintoretto crema 300', cov: 'Ні', color: '4+4', time: '1-2 дні' },
                            { mat: 'Stardream opal 285', cov: 'Ні', color: '4+0', time: '1-2 дні' },
                            { mat: 'Крейд МАТ 300', cov: 'ГЛ лам 1+0', color: '4+4', time: '1-2 дні' },
                            { mat: 'Крейд МАТ 350', cov: 'МАТ лам 1+1', color: '4+4', time: '1-2 дні' },
                            { mat: 'Крейд МАТ 450', cov: 'SOFT лам 1+1', color: '4+4', time: '1-2 дні' },
                          ].map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                              <td style={{ padding: '10px', textAlign: 'left', fontWeight: '700', color: '#222', borderRight: '1px solid #ddd' }}>
                                {row.mat} <span style={{ fontWeight: '400', color: '#666' }}>({row.cov})</span>
                              </td>
                              <td style={{ padding: '10px', fontWeight: '700', color: '#c00', borderRight: '1px solid #ddd' }}>{row.color}</td>
                              <td style={{ padding: '10px', color: '#555', borderRight: '1px solid #ddd' }}>{row.time}</td>
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
                                    style={{ padding: '10px', fontWeight: '700', color: '#111', cursor: 'pointer', borderRight: '1px solid #ddd', transition: 'background-color 0.15s ease' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff0f0'; e.currentTarget.style.color = '#c00'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#111'; }}
                                  >
                                    {itemVal} грн
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Top Information Buttons Bar */}
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('materials')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Layers size={16} style={{ color: '#c00' }} />
                      <span>Матеріали</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('terms')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Clock size={16} style={{ color: '#c00' }} />
                      <span>Терміни друку</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('tech_pur')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <BookOpen size={16} style={{ color: '#c00' }} />
                      <span>Технічні вимоги</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('instr')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FileText size={16} style={{ color: '#c00' }} />
                      <span>Інструкція по оформленню замовлення</span>
                    </button>
                  </div>

                  {/* Stitching Type Selector */}
                  <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#222', margin: 0 }}>Спосіб зшивання</h4>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {[
                        { id: '1', name: 'Скоба (8 — 64 стр)', img: 'https://sborka.ua/cside/img/skoba.png' },
                        { id: '2', name: 'Пружина (4 — 524 стр)', img: 'https://sborka.ua/cside/img/pr_prujina.png' },
                        { id: '3', name: 'Клей (30 — 608 стр)', img: 'https://sborka.ua/cside/img/pur_glue_img.png' },
                        { id: '4', name: 'Блокноти (30 — 608 стр)', img: 'https://sborka.ua/cside/img/pr_bloknot.png' },
                      ].map(stItem => {
                        const isActive = multiStitching === stItem.id;
                        return (
                          <div
                            key={stItem.id}
                            onClick={() => setMultiStitching(stItem.id)}
                            style={{
                              cursor: 'pointer',
                              border: isActive ? '2px solid #c00' : '1px solid #ddd',
                              backgroundColor: isActive ? '#fff0f0' : '#f9f9f9',
                              borderRadius: '6px',
                              padding: '10px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              minWidth: '130px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <img src={stItem.img} alt={stItem.name} style={{ width: '70px', height: '45px', objectFit: 'contain' }} />
                            <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '600', color: isActive ? '#c00' : '#333', textAlign: 'center' }}>
                              {stItem.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection & Canvas Visual Preview */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {/* Left Column: Size presets & Custom inputs */}
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#222', margin: 0 }}>Розмір видання</h4>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '6px' }}>Оберіть стандартний:</label>
                        <select
                          value={multiSizePreset}
                          onChange={(e) => setMultiSizePreset(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}
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
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'block', marginBottom: '6px' }}>Введіть свій розмір у розворот:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            value={sheetCustomWidth}
                            onChange={(e) => setSheetCustomWidth(e.target.value)}
                            placeholder="Ширина"
                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                          />
                          <span>×</span>
                          <input
                            type="number"
                            value={sheetCustomHeight}
                            onChange={(e) => setSheetCustomHeight(e.target.value)}
                            placeholder="Висота"
                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                          />
                          <select
                            value={sheetUnit}
                            onChange={(e) => setSheetUnit(e.target.value as any)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                          >
                            <option value="mm">мм</option>
                            <option value="cm">см</option>
                          </select>
                        </div>
                      </div>

                      {/* Orientation */}
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="radio" name="multi_orient" checked={sheetOrientation === 'vert'} onChange={() => setSheetOrientation('vert')} />
                          Вертикально
                        </label>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#444', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="radio" name="multi_orient" checked={sheetOrientation === 'horiz'} onChange={() => setSheetOrientation('horiz')} />
                          Горизонтально
                        </label>
                      </div>
                    </div>

                    {/* Right Column: Visual Preview Canvas */}
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вид готового виробу</span>
                      <div style={{ width: '100%', height: '220px', border: '1px dashed #ccc', backgroundColor: '#fafafa', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ width: '120px', height: '160px', border: '2px solid #333', backgroundColor: '#ffffff', borderRadius: '2px', position: 'relative', boxShadow: '2px 4px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px' }}>
                          <div style={{ width: '4px', height: '100%', backgroundColor: '#c00', position: 'absolute', left: 0, top: 0 }}></div>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#c00', textAlign: 'center', marginTop: '10px' }}>
                            {multiSizePreset === '3' ? 'А5' : multiSizePreset === '5' ? 'А4' : 'Брошура'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
                            {sheetOrientation === 'vert' ? '148 × 210 мм' : '210 × 148 мм'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Component Specification Options Breakdown */}
                  <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#222', margin: 0 }}>Деталізація складників багатосторінкового видання</h4>

                    {/* 1. Обкладинка */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '14px', borderRadius: '4px', border: '1px solid #eee' }}>
                      <div style={{ fontWeight: '700', color: '#111', fontSize: '14px' }}>Обкладинка:</div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Сторінок</label>
                        <select value={multiCoverPages} onChange={(e) => setMultiCoverPages(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          <option value="0">Без обкладинки</option>
                          <option value="1">4 стор (1 аркуш)</option>
                          <option value="2">8 стор (2 аркуші)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Папір / Матеріал</label>
                        <select value={multiCoverMaterial} onChange={(e) => setMultiCoverMaterial(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          <option value="80">Офсет 80</option>
                          <option value="90">Крейд 90</option>
                          <option value="115">Крейд 115</option>
                          <option value="130">Крейд 130</option>
                          <option value="150">Крейд 150</option>
                          <option value="170">Крейд 170</option>
                          <option value="200">Крейд 200</option>
                          <option value="250">Крейд 250</option>
                          <option value="2507">Крейд 250 + ГЛ лам 1+0</option>
                          <option value="2509">Крейд 250 + МАТ лам 1+0</option>
                          <option value="2508">Крейд 250 + ГЛ лам 1+1</option>
                          <option value="25010">Крейд 250 + МАТ лам 1+1</option>
                          <option value="300">Крейд 300</option>
                          <option value="3007">Крейд 300 + ГЛ лам 1+0</option>
                          <option value="3009">Крейд 300 + МАТ лам 1+0</option>
                          <option value="3008">Крейд 300 + ГЛ лам 1+1</option>
                          <option value="30010">Крейд 300 + МАТ лам 1+1</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Кольоровість</label>
                        <select value={multiCoverColor} onChange={(e) => setMultiCoverColor(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          <option value="1">4+0</option>
                          <option value="2">4+4</option>
                        </select>
                      </div>
                    </div>

                    {/* 2. Внутрішній блок */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '14px', borderRadius: '4px', border: '1px solid #eee' }}>
                      <div style={{ fontWeight: '700', color: '#111', fontSize: '14px' }}>Внутрішній блок:</div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Сторінок</label>
                        <select value={multiBlockPages} onChange={(e) => setMultiBlockPages(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          {[4,8,12,16,20,24,28,32,36,40,44,48,52,56,60,64].map((p, i) => (
                            <option key={p} value={(i + 1).toString()}>{p} стр ({i + 1} {i === 0 ? 'аркуш' : 'аркуші'})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Папір / Матеріал</label>
                        <select value={multiBlockMaterial} onChange={(e) => setMultiBlockMaterial(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          <option value="80">Офсет 80</option>
                          <option value="90">Крейд 90</option>
                          <option value="115">Крейд 115</option>
                          <option value="130">Крейд 130</option>
                          <option value="150">Крейд 150</option>
                          <option value="170">Крейд 170</option>
                          <option value="200">Крейд 200</option>
                          <option value="250">Крейд 250</option>
                          <option value="300">Крейд 300</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Кольоровість</label>
                        <select value={multiBlockColor} onChange={(e) => setMultiBlockColor(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          <option value="1">4+0</option>
                          <option value="2">4+4</option>
                        </select>
                      </div>
                    </div>

                    {/* 3. Вставка */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '14px', borderRadius: '4px', border: '1px solid #eee' }}>
                      <div style={{ fontWeight: '700', color: '#111', fontSize: '14px' }}>Вставка:</div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Сторінок</label>
                        <select value={multiInsertPages} onChange={(e) => setMultiInsertPages(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          <option value="0">Без вставки</option>
                          <option value="1">4 стр (1 аркуш)</option>
                          <option value="2">8 стор (2 аркуші)</option>
                          <option value="3">12 стр (3 аркуші)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Папір / Матеріал</label>
                        <select value={multiInsertMaterial} onChange={(e) => setMultiInsertMaterial(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          <option value="80">Офсет 80</option>
                          <option value="130">Крейд 130</option>
                          <option value="150">Крейд 150</option>
                          <option value="200">Крейд 200</option>
                          <option value="250">Крейд 250</option>
                          <option value="300">Крейд 300</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>Кольоровість</label>
                        <select value={multiInsertColor} onChange={(e) => setMultiInsertColor(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                          <option value="1">4+0</option>
                          <option value="2">4+4</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix Table for Multipage */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#222', margin: 0 }}>Специфікація розрахунків та прайс-лист багатосторінкової продукції</h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={includeDelivery} onChange={(e) => setIncludeDelivery(e.target.checked)} />
                          З доставкою
                        </label>

                        <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_tirazh')}
                            style={{ border: 'none', padding: '4px 10px', fontSize: '11px', fontWeight: '700', backgroundColor: priceCostVar === 'per_tirazh' ? '#666' : '#fff', color: priceCostVar === 'per_tirazh' ? '#fff' : '#333', cursor: 'pointer' }}
                          >
                            За наклад
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriceCostVar('per_item')}
                            style={{ border: 'none', padding: '4px 10px', fontSize: '11px', fontWeight: '700', backgroundColor: priceCostVar === 'per_item' ? '#666' : '#fff', color: priceCostVar === 'per_item' ? '#fff' : '#333', cursor: 'pointer' }}
                          >
                            За екземпляр
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#eeeeee', borderBottom: '1px solid #ccc' }}>
                            <th style={{ padding: '10px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Формат та параметри</th>
                            <th style={{ padding: '10px', borderRight: '1px solid #ddd' }}>Зшивання</th>
                            <th style={{ padding: '10px', borderRight: '1px solid #ddd' }}>Готовність</th>
                            {[100, 250, 500, 1000, 2500, 5000, 10000].map(tir => (
                              <th key={tir} style={{ padding: '10px', borderRight: '1px solid #ddd' }}>{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { fmt: 'А5 (16 стор, Крейд 130)', st: 'Скоба', time: '2-3 дні' },
                            { fmt: 'А5 (32 стор, Крейд 115)', st: 'Пружина', time: '2-3 дні' },
                            { fmt: 'А4 (16 стор, Крейд 150)', st: 'Скоба', time: '2-3 дні' },
                            { fmt: 'А4 (48 стор, Крейд 115)', st: 'Клей (PUR)', time: '3-4 дні' },
                          ].map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                              <td style={{ padding: '10px', textAlign: 'left', fontWeight: '700', color: '#222', borderRight: '1px solid #ddd' }}>
                                {row.fmt}
                              </td>
                              <td style={{ padding: '10px', fontWeight: '700', color: '#c00', borderRight: '1px solid #ddd' }}>{row.st}</td>
                              <td style={{ padding: '10px', color: '#555', borderRight: '1px solid #ddd' }}>{row.time}</td>
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
                                    style={{ padding: '10px', fontWeight: '700', color: '#111', cursor: 'pointer', borderRight: '1px solid #ddd', transition: 'background-color 0.15s ease' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff0f0'; e.currentTarget.style.color = '#c00'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#111'; }}
                                  >
                                    {itemVal} грн
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '550px', width: '100%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setActiveInfoModal(null)}
                      style={{ position: 'absolute', top: '14px', right: '16px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}
                    >
                      ✕
                    </button>
                    {activeInfoModal === 'instr' && (
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#c00' }}>Інструкція по оформленню замовлення</h3>
                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
                          1. Оберіть стандартний розмір виробу або введіть свій у міліметрах.<br/>
                          2. За потреби відкрийте блок «Післядрукарська обробка» та оберіть фальцовку, біговку, свердління тощо.<br/>
                          3. У таблиці розрахунків оберіть бажаний матеріал та тираж — клікніть на комірку з ціною для автоматичного формування замовлення.
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'terms' && (
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#c00' }}>Терміни друку</h3>
                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
                          Стандартний термін виконання збірного офсетного тиражу — 1-2 робочих дні. Для термінових замовлень скористайтесь розділом «Цифровий друк».
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'materials' && (
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#c00' }}>Матеріали</h3>
                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
                          Доступні папери: Офсетний 80 г/м², Крейдований матовий та глянцевий від 90 до 450 г/м², а також дизайнерські картони (Льон, Tintoretto, Stardream).
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'tech_pur' && (
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#c00' }}>Технічні вимоги</h3>
                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
                          Макет має бути у колірній моделі CMYK з роздільною здатністю 300 dpi. Виліти під порізку — 2 мм з кожного боку. Безпечне поле для важливих елементів та тексту — 5 мм від краю порізу.
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'samples' && (
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#c00' }}>Зразки матеріалів з друком</h3>
                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
                          Ви можете замовити комплект зразків у розділі «Зразки матеріалів» для точної оцінки щільності та фактури паперу.
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'review' && (
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#c00' }}>Ваш відгук</h3>
                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
                          Дякуємо за допомогу в розвитку системи! Залиште ваші побажання або зауваження до інтерфейсу калькулятора.
                        </p>
                      </div>
                    )}
                    {activeInfoModal === 'bug' && (
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#c00' }}>Знайшли помилку?</h3>
                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
                          Опишіть ситуацію, у якій виникла помилка, або невідповідність у розрахунку ціни, і ми оперативно її виправимо.
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveInfoModal(null)}
                      style={{ marginTop: '16px', backgroundColor: '#666', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              <div onClick={() => handleSelectCategory('Візитки')} className="ios-card bg-white" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                <Layout size={40} style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Термінові Візитки</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Цифровий оперативний друк від 100 шт за 1 годину.</p>
              </div>
              <div onClick={() => handleSelectCategory('Листівки')} className="ios-card bg-white" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                <FileText size={40} style={{ color: '#06b6d4', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Цифрові Листівки SRA3</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Оперативний листовий друк на Xerox Versant 180.</p>
              </div>
              <div onClick={() => handleSelectCategory('Меню')} className="ios-card bg-white" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                <Layers size={40} style={{ color: '#8b5cf6', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Конвертна ламінація</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Захищені меню та бейджи з посиленим ламінуванням 125мкм.</p>
              </div>
            </div>
          )}

          {/* TAB 4: WIDE FORMAT */}
          {mainCategoryTab === 'wide' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              <div onClick={() => handleSelectCategory('Плакати')} className="ios-card bg-white" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                <Layout size={40} style={{ color: '#3b82f6', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Банери та Тенти</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Литі та ламеновані банери для зовнішньої реклами з люверсами.</p>
              </div>
              <div onClick={() => handleSelectCategory('Наклейки')} className="ios-card bg-white" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                <Layers size={40} style={{ color: '#af52de', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Плівка ORAJET</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Широкоформатний друк на самоклейці для вітрин та авто.</p>
              </div>
            </div>
          )}

          {/* TAB 5: ROLL PRINTING */}
          {mainCategoryTab === 'roll' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              <div onClick={() => handleSelectCategory('Етикетки')} className="ios-card bg-white" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                <Layers size={40} style={{ color: '#14b8a6', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Рулонна Етикетка</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Самоклеючі етикетки у бобінах та рулонах для маркування.</p>
              </div>
            </div>
          )}

          {/* TAB 6: COLOR FILMS */}
          {mainCategoryTab === 'films' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              <div onClick={() => handleSelectCategory('Наклейки')} className="ios-card bg-white" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                <Layers size={40} style={{ color: '#ec4899', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Плотерна порізка плівок</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Порізка аплікацій з кольорових вінілових плівок ORACAL 641.</p>
              </div>
            </div>
          )}

          {/* Templates list under catalog */}
          {templates.length > 0 && (
            <div className="ios-card bg-white space-y-3">
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <FolderOpen size={16} style={{ color: 'var(--primary)' }} />
                Шаблони розрахунків
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {templates.map((tpl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleLoadTemplate(tpl)}
                    style={{ 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      border: '0.5px solid var(--border-light)', 
                      backgroundColor: 'var(--bg-card-subtle)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <strong style={{ display: 'block', marginBottom: '2px' }}>{tpl.name}</strong>
                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{tpl.category} | {tpl.quantity} шт</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Editor Header Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px' }}>
            <button 
              onClick={() => setStep('catalog')}
              className="ios-btn ios-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px' }}
            >
              <ArrowLeft size={14} />
              Каталог виробів
            </button>
            
            {/* Calculation Mode Selector */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', padding: '2px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setCalcMode('auto')}
                className="ios-btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  backgroundColor: calcMode === 'auto' ? 'var(--primary)' : 'transparent',
                  color: calcMode === 'auto' ? '#ffffff' : 'var(--text-dark)',
                  fontWeight: calcMode === 'auto' ? '700' : '500'
                }}
              >
                Параметричний конструктор
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('operations')}
                className="ios-btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  backgroundColor: calcMode === 'operations' ? 'var(--primary)' : 'transparent',
                  color: calcMode === 'operations' ? '#ffffff' : 'var(--text-dark)',
                  fontWeight: calcMode === 'operations' ? '700' : '500'
                }}
              >
                Поопераційний (1С)
              </button>
            </div>

            <button 
              onClick={() => setShowTemplateModal(true)}
              className="ios-btn ios-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '32px' }}
            >
              <Save size={14} />
              Зберегти шаблон
            </button>
          </div>

          {/* Detailed Constructor Calculator Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
            
            {/* Left Side details and options list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Product specifications specifications */}
              <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  Параметри тиражу
                </h3>

                {category === 'Бланки' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-card-subtle)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '850', color: 'var(--text-dark)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Вибір продукції:</span>
                    <div style={{ display: 'flex', gap: '8px', flexGrow: 1 }}>
                      <button
                        type="button"
                        onClick={() => handleSelectSubCategory('Бланки')}
                        className={`ios-btn ${subCategory === 'Бланки' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                        style={{ flexGrow: 1, fontSize: '12px', padding: '6px 12px', fontWeight: subCategory === 'Бланки' ? '800' : '500' }}
                      >
                        Бланки
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSubCategory('Листівки')}
                        className={`ios-btn ${subCategory === 'Листівки' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                        style={{ flexGrow: 1, fontSize: '12px', padding: '6px 12px', fontWeight: subCategory === 'Листівки' ? '800' : '500' }}
                      >
                        Листівки
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1.2fr', gap: '12px' }}>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>№ Замовлення</label>
                    <input 
                      value={`#${orderNumber}`} 
                      disabled 
                      readOnly
                      style={{ backgroundColor: 'var(--bg-card-subtle)', cursor: 'not-allowed', fontWeight: '800', color: 'var(--primary)', textAlign: 'center', border: '1px solid var(--border-light)' }} 
                    />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Замовник</label>
                    <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Продукція</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr', gap: '12px' }}>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Тираж (шт.)</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} 
                      onBlur={() => { if (quantity === '' || Number(quantity) < 1) setQuantity(100); }}
                      style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                    />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Штук в 1 упаковці</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={packingCount} 
                      onChange={(e) => setPackingCount(e.target.value === '' ? '' : Number(e.target.value))}
                      onBlur={() => { if (packingCount === '') setPackingCount(1); }} 
                      style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                    />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Матеріал паперу</label>
                    <select value={paperType} onChange={(e) => setPaperType(e.target.value as any)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                      <option value="offset">Офсетний 70г</option>
                      <option value="gazetka">Газетний 45г</option>
                      <option value="coated">Крейдований 130г</option>
                    </select>
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Кольоровість</label>
                    <select value={colors} onChange={(e) => setColors(e.target.value)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                      <option value="1+0">1+0 (ЧБ 1-стор)</option>
                      <option value="1+1">1+1 (ЧБ 2-стор)</option>
                      <option value="4+0">4+0 (Колір 1-стор)</option>
                      <option value="4+4">4+4 (Колір 2-стор)</option>
                    </select>
                  </div>
                </div>

                {/* Design selection: 1. Сам на себе, 2. Без обороту, 3. Чужий оборот + вільне поле */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-medium)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Спуск / Оборот:</span>
                  <div style={{ display: 'flex', gap: '6px', flexGrow: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => handleSelectTurnType('sam_na_sebe')}
                      className={`ios-btn ${turnType === 'sam_na_sebe' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '6px 12px', height: '32px' }}
                    >
                      1. Сам на себе
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSelectTurnType('bez_oborotu')}
                      className={`ios-btn ${turnType === 'bez_oborotu' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '6px 12px', height: '32px' }}
                    >
                      2. Без обороту
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSelectTurnType('chuzhyi_oborut')}
                      className={`ios-btn ${turnType === 'chuzhyi_oborut' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '6px 12px', height: '32px' }}
                    >
                      3. Чужий оборот
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        placeholder="Ціна макету (грн)"
                        value={customDesignPrice}
                        onChange={(e) => setCustomDesignPrice(e.target.value)}
                        style={{ width: '120px', height: '32px', fontSize: '11px', padding: '0 8px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive idruk Options Panel */}
              {calcMode === 'auto' && (
                <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    Технічні специфікації виробу
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Format and Orientation */}
                    <div className="ios-input-group">
                      <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Формат виробу</label>
                      <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                        <option value="A4">A4 (210х297 мм)</option>
                        <option value="A5">A5 (148х210 мм)</option>
                        <option value="A3">A3 (297х420 мм)</option>
                        <option value="90x50 мм">Візитка (90х50 мм)</option>
                        <option value="Euro">Єврофлаєр (99х210 мм)</option>
                      </select>
                    </div>

                    <div className="ios-input-group">
                      <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Орієнтація</label>
                      <select value={orientation} onChange={(e) => setOrientation(e.target.value as any)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                        <option value="portrait">Портретна (вертикальна)</option>
                        <option value="landscape">Альбомна (горизонтальна)</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-page / Book options */}
                  {category === 'Книги' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', backgroundColor: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div className="ios-input-group">
                        <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Обкладинка папір</label>
                        <select value={coverPaperType} onChange={(e) => setCoverPaperType(e.target.value as any)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                          <option value="coated">Крейда 300г</option>
                          <option value="cardboard">Картон 350г</option>
                          <option value="offset">Офсет 150г</option>
                        </select>
                      </div>
                      <div className="ios-input-group">
                        <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Кольори обкл.</label>
                        <select value={coverColors} onChange={(e) => setCoverColors(e.target.value)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                          <option value="4+4">4+4 (Повна)</option>
                          <option value="4+0">4+0</option>
                        </select>
                      </div>
                      <div className="ios-input-group">
                        <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Стор. блоку</label>
                        <input type="number" step="4" value={innerPages} onChange={(e) => setInnerPages(Number(e.target.value))} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                      </div>
                    </div>
                  )}

                  {/* Postpress / Prepress operations selection (Enabled for Листівки, hidden for Бланки) */}
                  {!(category === 'Бланки' && subCategory === 'Бланки') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', paddingTop: '10px' }}>
                      <div className="ios-input-group">
                        <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Тип скріплення</label>
                        <select value={bindingType} onChange={(e) => setBindingType(e.target.value as any)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                          <option value="none">Без скріплення</option>
                          <option value="staple">Скоба (шиття)</option>
                          <option value="spring">Металева пружина</option>
                          <option value="glue">Клейове (КБС)</option>
                          <option value="hardcover">Тверда палітурка</option>
                        </select>
                      </div>
                      <div className="ios-input-group">
                        <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Ламінування</label>
                        <select value={laminationType} onChange={(e) => setLaminationType(e.target.value as any)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                          <option value="none">Без ламінування</option>
                          <option value="gloss">Глянцева плівка</option>
                          <option value="matte">Матова плівка</option>
                          <option value="softtouch">Soft-touch оксамит</option>
                        </select>
                      </div>
                      <div className="ios-input-group">
                        <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Кількість бігів</label>
                        <input type="number" min="0" value={creaseCount} onChange={(e) => setCreaseCount(Number(e.target.value))} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {calcMode === 'auto' ? (
                /* Simple Business Logic Breakdown Output */
                <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    Склад собівартості
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)' }}>
                      <span>Переддрукарська підготовка:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>{designCost.toFixed(2)} грн</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)' }}>
                      <span>Витрати паперу:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>{calculatedOps.paperCost.toFixed(2)} грн</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)' }}>
                      <span>Прогін на машині ({calculatedOps.machine}):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>{calculatedOps.printingCost.toFixed(2)} грн</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)' }}>
                      <span>Порізка та упаковка:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>{(calculatedOps.cuttingCost + calculatedOps.packingCost).toFixed(2)} грн</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* Advanced Operations list - exact 1C Replica */
                <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '16px 0', overflow: 'hidden' }}>
                  <div style={{ padding: '0 16px 8px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)' }}>
                      Виробничі операції та калькуляція собівартості (1С)
                    </h3>
                    <span className="ios-badge ios-badge-purple" style={{ fontSize: '10px' }}>
                      Поопераційні тарифи
                    </span>
                  </div>

                  <div className="ios-table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="ios-table" style={{ fontSize: '12px' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-card-subtle)' }}>
                          <th style={{ width: '40px', padding: '10px' }}>[x]</th>
                          <th>Назва операції</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>Тариф (грн)</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Обсяг</th>
                          <th style={{ width: '140px', textAlign: 'right' }}>Вартість</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Form Making */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.formMaking} onChange={(e) => setActiveOps({ ...activeOps, formMaking: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.formMaking ? 'var(--text-dark)' : 'var(--text-medium)' }}>Копіювання форм / Виготовлення форми</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.formMaking !== undefined ? opCustomRates.formMaking : norms.formMakingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, formMaking: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.formMaking !== undefined ? opVolumes.formMaking : calculatedOps.actualVolumes.formMaking} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, formMaking: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.formMaking ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.formMaking.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Film Mounting */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.filmMounting} onChange={(e) => setActiveOps({ ...activeOps, filmMounting: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.filmMounting ? 'var(--text-dark)' : 'var(--text-medium)' }}>Монтаж плівок (лакофарбових)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.filmMounting !== undefined ? opCustomRates.filmMounting : norms.filmMountingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, filmMounting: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.filmMounting !== undefined ? opVolumes.filmMounting : calculatedOps.actualVolumes.filmMounting} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, filmMounting: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.filmMounting ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.filmMounting.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Printing Pass */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.printing} onChange={(e) => setActiveOps({ ...activeOps, printing: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.printing ? 'var(--text-dark)' : 'var(--text-medium)' }}>Прогон друкарської машини ({calculatedOps.machine})</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.printing !== undefined ? opCustomRates.printing : calculatedOps.rates.printing} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, printing: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', opacity: 0.8, fontSize: '11px', fontWeight: '600', color: 'var(--text-dark)' }}>{calculatedOps.actualVolumes.printing} арк</td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.printing ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.printing.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Lamination */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.lamination} onChange={(e) => setActiveOps({ ...activeOps, lamination: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.lamination ? 'var(--text-dark)' : 'var(--text-medium)' }}>Ламінування (мат / глянець)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.lamination !== undefined ? opCustomRates.lamination : calculatedOps.rates.lamination} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, lamination: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', opacity: 0.8, fontSize: '11px', fontWeight: '600', color: 'var(--text-dark)' }}>{calculatedOps.actualVolumes.lamination} арк</td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.lamination ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.lamination.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Embossing */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.embossing} onChange={(e) => setActiveOps({ ...activeOps, embossing: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.embossing ? 'var(--text-dark)' : 'var(--text-medium)' }}>Тиснення складне (фольгою)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.embossing !== undefined ? opCustomRates.embossing : norms.embossingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, embossing: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.embossing !== undefined ? opVolumes.embossing : calculatedOps.actualVolumes.embossing} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, embossing: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '60px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.embossing ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.embossing.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Die Cutting */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.dieCutting} onChange={(e) => setActiveOps({ ...activeOps, dieCutting: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.dieCutting ? 'var(--text-dark)' : 'var(--text-medium)' }}>Висечка штампом</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.dieCutting !== undefined ? opCustomRates.dieCutting : norms.dieCuttingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, dieCutting: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.dieCutting !== undefined ? opVolumes.dieCutting : calculatedOps.actualVolumes.dieCutting} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, dieCutting: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '60px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.dieCutting ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.dieCutting.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Folding */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.folding} onChange={(e) => setActiveOps({ ...activeOps, folding: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.folding ? 'var(--text-dark)' : 'var(--text-medium)' }}>Біговка / Фальцювання (згини)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.folding !== undefined ? opCustomRates.folding : norms.foldingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, folding: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.folding !== undefined ? opVolumes.folding : calculatedOps.actualVolumes.folding} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, folding: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '60px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.folding ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.folding.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Block Insertion */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.blockInsertion} onChange={(e) => setActiveOps({ ...activeOps, blockInsertion: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.blockInsertion ? 'var(--text-dark)' : 'var(--text-medium)' }}>Вставка блока брошури</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.blockInsertion !== undefined ? opCustomRates.blockInsertion : norms.blockInsertionPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, blockInsertion: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.blockInsertion !== undefined ? opVolumes.blockInsertion : calculatedOps.actualVolumes.blockInsertion} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, blockInsertion: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '60px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.blockInsertion ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.blockInsertion.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Cover Making */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.coverMaking} onChange={(e) => setActiveOps({ ...activeOps, coverMaking: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.coverMaking ? 'var(--text-dark)' : 'var(--text-medium)' }}>Виготовлення кришки твердої</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.coverMaking !== undefined ? opCustomRates.coverMaking : norms.coverMakingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, coverMaking: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.coverMaking !== undefined ? opVolumes.coverMaking : calculatedOps.actualVolumes.coverMaking} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, coverMaking: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '60px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.coverMaking ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.coverMaking.toFixed(8)} ₴
                          </td>
                        </tr>

                        {/* Block Processing */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.blockProcessing} onChange={(e) => setActiveOps({ ...activeOps, blockProcessing: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.blockProcessing ? 'var(--text-dark)' : 'var(--text-medium)' }}>Обробка блока (порізка, шліф)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              step="0.00000001"
                              value={opCustomRates.blockProcessing !== undefined ? opCustomRates.blockProcessing : norms.blockProcessingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, blockProcessing: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '95px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', opacity: 0.8, fontSize: '11px', fontWeight: '600', color: 'var(--text-dark)' }}>{calculatedOps.actualVolumes.blockProcessing} арк</td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.blockProcessing ? 'var(--text-dark)' : 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                            {calculatedOps.fullSums.blockProcessing.toFixed(8)} ₴
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Right Side Summary panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Підсумки прорахунку</span>
                
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Ціна продажу для клієнта:</span>
                  <p style={{ fontSize: '30px', fontWeight: '800', color: 'var(--primary)', margin: '2px 0 0 0' }}>
                    {calculatedOps.finalPrice.toFixed(2)} <span style={{ fontSize: '14px', fontWeight: '600' }}>грн</span>
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '10px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)' }}>
                      <span>Собівартість виробництва:</span>
                      <strong style={{ color: 'var(--text-dark)' }}>{calculatedOps.subtotal.toFixed(2)} грн</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)' }}>
                      <span>Маржа ({marginPercent}%):</span>
                      <strong style={{ color: 'var(--text-dark)' }}>+{calculatedOps.marginAmount.toFixed(2)} грн</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)' }}>
                      <span>Ціна за одиницю (шт):</span>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{calculatedOps.unitPrice.toFixed(8)} грн</strong>
                    </div>
                  </div>
                </div>

                {/* Warehouse Stock Check */}
                <div style={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: paperWarehouseStatus.hasEnough ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  color: paperWarehouseStatus.hasEnough ? 'var(--success)' : 'var(--warning)',
                  fontSize: '11px',
                  border: '1px solid var(--border-light)'
                }}>
                  <strong style={{ color: 'var(--text-dark)' }}>Склад:</strong> {paperWarehouseStatus.materialName} ({paperWarehouseStatus.available} доступно, потрібно {calculatedOps.physicalSheets})
                </div>

                {/* Margin manual percentage selector with Range Slider */}
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="ios-label" style={{ marginBottom: 0, color: 'var(--text-medium)' }}>Відсоток маржі / націнки:</label>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>{marginPercent}%</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input 
                      type="range"
                      min="0"
                      max="300"
                      step="5"
                      value={marginPercent}
                      onChange={(e) => setMarginPercent(Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input 
                        type="number"
                        min="0"
                        value={marginPercent}
                        onChange={(e) => setMarginPercent(Number(e.target.value))}
                        style={{ width: '70px', height: '28px', textAlign: 'center', fontSize: '12px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                      />
                      <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', padding: '2px', borderRadius: '6px', flexGrow: 1 }}>
                        {[0, 50, 100, 150, 200].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMarginPercent(m)}
                            className="ios-btn"
                            style={{
                              flexGrow: 1,
                              padding: '2px 4px',
                              fontSize: '10px',
                              backgroundColor: marginPercent === m ? 'var(--primary)' : 'transparent',
                              color: marginPercent === m ? '#ffffff' : 'var(--text-dark)',
                              borderRadius: '4px',
                              fontWeight: marginPercent === m ? '800' : '500'
                            }}
                          >
                            {m}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Send & Invoice Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button 
                    onClick={handleSendToProduction}
                    disabled={!paperWarehouseStatus.hasEnough}
                    className="ios-btn ios-btn-primary w-full"
                  >
                    Запустити у виробництво
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button type="button" onClick={() => setShowInvoice(true)} className="ios-btn ios-btn-secondary">Рахунок PDF</button>
                    <button type="button" onClick={() => {
                      const text = `Ціна: ${calculatedOps.finalPrice.toFixed(2)} грн за ${quantity} шт (ціна за шт: ${calculatedOps.unitPrice.toFixed(2)} грн). Розраховано в Едельвейс і К.`;
                      navigator.clipboard.writeText(text);
                      alert('Текст скопійовано!');
                    }} className="ios-btn ios-btn-secondary">Копіювати</button>
                  </div>
                </div>

              </div>

              {/* Tariffs settings button */}
              <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '8px 12px' }}>
                <button 
                  onClick={() => {
                    if (isAdmin) {
                      setTempNorms(norms);
                      setShowNorms(true);
                    } else {
                      alert('Тільки адміністратор може змінювати базові тарифи.');
                    }
                  }}
                  className="ios-btn ios-btn-secondary w-full"
                  style={{ border: '1px dashed var(--border-light)', backgroundColor: 'transparent' }}
                >
                  <Settings size={13} />
                  Змінити базові тарифи
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice preview modal */}
      {showInvoice && (
        <div className="ios-modal-overlay">
          <div className="ios-modal" style={{ maxWidth: '750px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div className="ios-modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="ios-modal-title" style={{ color: 'var(--text-dark)' }}>Рахунок-Специфікація замовлення</h3>
              <button onClick={() => setShowInvoice(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" id="invoice-preview-container" style={{ padding: '28px', backgroundColor: '#FFFFFF', color: '#1C1C1E', fontSize: '11px', lineHeight: '1.4', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              {/* Document Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1C1C1E', paddingBottom: '12px', marginBottom: '16px', gap: '16px' }}>
                <div style={{ flexShrink: 0 }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, color: '#1C1C1E' }}>РАХУНОК-СПЕЦИФІКАЦІЯ № {orderNumber}</h4>
                  <p style={{ fontSize: '11px', color: '#636366', margin: '2px 0 0 0' }}>Поліграфічна компанія «Едельвейс і К»</p>
                </div>
                <div style={{ textAlign: 'right', flexGrow: 1, minWidth: '220px', backgroundColor: '#F8FAFC', padding: '8px 14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', margin: 0, color: '#1C1C1E' }}>Дата: {new Date().toLocaleDateString('uk-UA')}</p>
                  <p style={{ fontSize: '12px', color: '#636366', margin: '4px 0 0 0', fontWeight: '600' }}>
                    Покупець (Замовник): <span style={{ fontWeight: '800', color: '#007AFF', fontSize: '13px' }}>{activeClient?.name || '—'}</span>
                  </p>
                </div>
              </div>

              {/* Product Specification & Quantity Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#636366', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Продукція / Специфікація</span>
                  <p style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#1C1C1E' }}>{name}</p>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', textAlign: 'right' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#636366', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Тираж замовлення</span>
                  <p style={{ fontSize: '14px', fontWeight: '900', margin: 0, color: '#007AFF' }}>{quantity} шт.</p>
                </div>
              </div>

              {/* 1. Матеріали та специфікація паперу */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  1. Матеріали та сировина
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Матеріал паперу:</span>
                    <strong style={{ fontSize: '11px', color: '#1C1C1E' }}>{paperType === 'offset' ? 'Офсетний 70г' : paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Розмір друкарського листа:</span>
                    <strong style={{ fontSize: '11px', color: '#1C1C1E' }}>{calculatedOps.format} ({calculatedOps.format === 'A1' ? '594x841 мм' : calculatedOps.format === 'A2' ? '420x594 мм' : '297x420 мм'})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Обсяг матеріалу:</span>
                    <strong style={{ fontSize: '11px', color: '#1C1C1E' }}>{calculatedOps.physicalSheets} арк. (+{Math.ceil(calculatedOps.physicalSheets * 0.05)} тех. відх.)</strong>
                  </div>
                </div>
              </div>

              {/* 2. Процес друку */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  2. Процес друку (Друкарська машина & Параметри)
                </h5>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #E2E8F0' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                      <td style={{ padding: '6px 10px', color: '#636366', width: '30%' }}>Друкарська машина:</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', color: '#1C1C1E', width: '20%' }}>{calculatedOps.machine}</td>
                      <td style={{ padding: '6px 10px', color: '#636366', width: '30%' }}>Красочність (кольоровість):</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', color: '#1C1C1E', width: '20%' }}>{colors} ({['1+1', '4+4'].includes(colors) ? '2-стор' : '1-стор'})</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '6px 10px', color: '#636366' }}>Однотипних листів (на арк):</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', color: '#1C1C1E' }}>{calculatedOps.itemsPerSheet} шт./арк</td>
                      <td style={{ padding: '6px 10px', color: '#636366' }}>Спуск макету / оборот:</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', color: '#1C1C1E' }}>{turnType === 'sam_na_sebe' ? 'Сам на себе (с/с)' : turnType === 'bez_oborotu' ? 'Без обороту' : 'Чужий оборот (ч/о)'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                      <td style={{ padding: '6px 10px', color: '#636366' }}>Кількість друкованих листів:</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', color: '#1C1C1E' }}>{calculatedOps.physicalSheets} арк</td>
                      <td style={{ padding: '6px 10px', color: '#636366' }}>Фактичні прогони (прогоно-відбитки):</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', color: '#1C1C1E' }}>{calculatedOps.physicalSheets * (['1+1', '4+4'].includes(colors) ? 2 : 1)} прогонів</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', color: '#636366' }}>Приладка / Форми:</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', color: '#1C1C1E' }}>{['1+1', '4+4'].includes(colors) ? 2 : 1} компл. форм</td>
                      <td style={{ padding: '6px 10px', color: '#636366' }}>Технічні відходи (приладка):</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', color: '#1C1C1E' }}>+{Math.ceil(calculatedOps.physicalSheets * 0.05)} арк. (5%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. Післядрукарська обробка (Післядрук) */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  3. Післядрукарська обробка (Післядрук)
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                  <div style={{ padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: '4px', backgroundColor: '#F8FAFC', color: '#1C1C1E' }}>
                    <span style={{ color: '#636366' }}>Порізка тиражу:</span> <strong style={{ color: '#1C1C1E' }}>Формат {selectedFormat}</strong>
                  </div>
                  <div style={{ padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: '4px', backgroundColor: '#F8FAFC', color: '#1C1C1E' }}>
                    <span style={{ color: '#636366' }}>Ламінування:</span> <strong style={{ color: '#1C1C1E' }}>{laminationType === 'none' ? 'Без ламінування' : laminationType === 'gloss' ? 'Глянцева плівка' : laminationType === 'matte' ? 'Матова плівка' : 'Soft-touch оксамит'}</strong>
                  </div>
                  <div style={{ padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: '4px', backgroundColor: '#F8FAFC', color: '#1C1C1E' }}>
                    <span style={{ color: '#636366' }}>Бігування / Фальцювання:</span> <strong style={{ color: '#1C1C1E' }}>{Number(creaseCount) > 0 ? `${creaseCount} бігів (згинів)` : 'Ні'}</strong>
                  </div>
                  <div style={{ padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: '4px', backgroundColor: '#F8FAFC', color: '#1C1C1E' }}>
                    <span style={{ color: '#636366' }}>Скріплення:</span> <strong style={{ color: '#1C1C1E' }}>{bindingType === 'none' ? 'Без скріплення' : bindingType === 'staple' ? 'Скоба (шиття)' : bindingType === 'spring' ? 'Пружина' : bindingType === 'glue' ? 'Клей (КБС)' : 'Тверда палітурка'}</strong>
                  </div>
                  <div style={{ padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: '4px', backgroundColor: '#F8FAFC', color: '#1C1C1E', gridColumn: 'span 2' }}>
                    <span style={{ color: '#636366' }}>Пакування та укладання:</span> <strong style={{ color: '#1C1C1E' }}>{Number(packingCount) > 0 ? `${calculatedOps.totalPackages} пак. по ${packingCount} шт.` : 'Стандартне пакування'}</strong>
                  </div>
                </div>
              </div>

              {/* 4. Фінансовий розрахунок вартості */}
              <div>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E5E5EA', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  4. Фінансовий підсумок
                </h5>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #1C1C1E', textAlign: 'left' }}>
                      <th style={{ padding: '6px 0', fontWeight: '700', color: '#1C1C1E' }}>Складова замовлення</th>
                      <th style={{ padding: '6px 0', textAlign: 'center', fontWeight: '700', color: '#1C1C1E' }}>Обсяг</th>
                      <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700', color: '#1C1C1E' }}>Сума (грн)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                      <td style={{ padding: '6px 0', color: '#1C1C1E' }}>Макет та переддрук (Оборот: {turnType === 'sam_na_sebe' ? 'с/с' : turnType === 'bez_oborotu' ? 'без обор.' : 'ч/о'})</td>
                      <td style={{ padding: '6px 0', textAlign: 'center', color: '#1C1C1E' }}>1 посл.</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: '#1C1C1E' }}>{designCost.toFixed(2)} ₴</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                      <td style={{ padding: '6px 0', color: '#1C1C1E' }}>Матеріали + Поліграфічний друк + Післядрукарські операції</td>
                      <td style={{ padding: '6px 0', textAlign: 'center', color: '#1C1C1E' }}>{quantity} шт.</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: '#1C1C1E' }}>{(calculatedOps.finalPrice - designCost).toFixed(2)} ₴</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ fontSize: '14px', fontWeight: '800' }}>
                      <td style={{ padding: '12px 0 0 0', color: '#1C1C1E' }}>РАЗОМ ДО СПЛАТИ:</td>
                      <td style={{ padding: '12px 0 0 0', textAlign: 'center', fontSize: '11px', color: '#636366' }}>Ціна за 1 шт: {calculatedOps.unitPrice.toFixed(2)} грн</td>
                      <td style={{ padding: '12px 0 0 0', textAlign: 'right', color: '#007AFF', fontSize: '16px' }}>{calculatedOps.finalPrice.toFixed(2)} грн</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="ios-modal-footer">
              <button onClick={() => setShowInvoice(false)} className="ios-btn ios-btn-secondary">Закрити</button>
              <button onClick={generatePDF} className="ios-btn ios-btn-primary">Завантажити PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleSaveAsTemplate} className="ios-modal" style={{ maxWidth: '400px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div className="ios-modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="ios-modal-title" style={{ color: 'var(--text-dark)' }}>Зберегти розрахунок як шаблон</h3>
              <button type="button" onClick={() => setShowTemplateModal(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="ios-modal-body">
              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Назва шаблону *</label>
                <input required placeholder="напр. Євробуклет 130г 500шт" value={templateName} onChange={(e) => setTemplateName(e.target.value)} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
              </div>
            </div>
            <div className="ios-modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button type="button" onClick={() => setShowTemplateModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти шаблон</button>
            </div>
          </form>
        </div>
      )}

      {/* Norms settings edit modal (Admin) */}
      {showNorms && isAdmin && (
        <div className="ios-modal-overlay">
          <div className="ios-modal" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div className="ios-modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="ios-modal-title" style={{ color: 'var(--text-dark)' }}>Базові тарифи підприємства</h3>
              <button onClick={() => setShowNorms(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateNorms(tempNorms); setShowNorms(false); alert('Тарифи оновлено!'); }}>
              <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase', display: 'block' }}>Папір та дизайн</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Офсет 70г</label>
                    <input type="number" step="any" value={tempNorms.paperOffsetPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperOffsetPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Газетка 45г</label>
                    <input type="number" step="any" value={tempNorms.paperGazetkaPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperGazetkaPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Крейдований 130г</label>
                    <input type="number" step="any" value={tempNorms.paperCoatedPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperCoatedPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                </div>

                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase', display: 'block' }}>Післядрукарські тарифи за операцію</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Виготовлення форм</label>
                    <input type="number" step="any" value={tempNorms.formMakingPrice} onChange={(e) => setTempNorms({ ...tempNorms, formMakingPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Монтаж плівок</label>
                    <input type="number" step="any" value={tempNorms.filmMountingPrice} onChange={(e) => setTempNorms({ ...tempNorms, filmMountingPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Мат ламінація</label>
                    <input type="number" step="any" value={tempNorms.laminationMattePrice} onChange={(e) => setTempNorms({ ...tempNorms, laminationMattePrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Глянець ламінація</label>
                    <input type="number" step="any" value={tempNorms.laminationGlossyPrice} onChange={(e) => setTempNorms({ ...tempNorms, laminationGlossyPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Складне тиснення</label>
                    <input type="number" step="any" value={tempNorms.embossingPrice} onChange={(e) => setTempNorms({ ...tempNorms, embossingPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Висічка штампом</label>
                    <input type="number" step="any" value={tempNorms.dieCuttingPrice} onChange={(e) => setTempNorms({ ...tempNorms, dieCuttingPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Біговка (згин)</label>
                    <input type="number" step="any" value={tempNorms.foldingPrice} onChange={(e) => setTempNorms({ ...tempNorms, foldingPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Вставка блока</label>
                    <input type="number" step="any" value={tempNorms.blockInsertionPrice} onChange={(e) => setTempNorms({ ...tempNorms, blockInsertionPrice: Number(e.target.value) })} style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
                  </div>
                </div>

              </div>
              <div className="ios-modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button type="button" onClick={() => setShowNorms(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
                <button type="submit" className="ios-btn ios-btn-primary">Зберегти зміни</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
