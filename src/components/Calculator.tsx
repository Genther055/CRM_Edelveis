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
  Calendar
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

          {/* Top Main Category Switcher (Matching Sborka Navigation) */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-card)',
            padding: '6px',
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
            gap: '6px',
            overflowX: 'auto'
          }}>
            {[
              { key: 'products', label: 'Продукти' },
              { key: 'offset', label: 'Офсетний друк' },
              { key: 'digital', label: 'Цифровий друк' },
              { key: 'wide', label: 'Широкоформатний друк' },
              { key: 'roll', label: 'Рулонний друк' },
              { key: 'films', label: 'Кольорові плівки' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMainCategoryTab(tab.key as any)}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: mainCategoryTab === tab.key ? '800' : '600',
                  backgroundColor: mainCategoryTab === tab.key ? 'var(--primary)' : 'transparent',
                  color: mainCategoryTab === tab.key ? '#ffffff' : 'var(--text-dark)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
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

          {/* TAB 2: OFFSET PRINTING (Matching Sborka Structure) */}
          {mainCategoryTab === 'offset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 4 Main Printing Technology Blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                <div onClick={() => handleSelectCategory('Листівки')} className="ios-card bg-white" style={{ padding: '16px', cursor: 'pointer', borderTop: '4px solid var(--primary)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '4px' }}>Листова</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Візитівки, листівки, бланки, буклети, наліпки, плакати…</p>
                </div>
                <div onClick={() => handleSelectCategory('Наклейки')} className="ios-card bg-white" style={{ padding: '16px', cursor: 'pointer', borderTop: '4px solid #af52de' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '4px' }}>Висічна</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Фігурні наліпки, візитівки, листівки, підставки, хенгери…</p>
                </div>
                <div onClick={() => handleSelectCategory('Книги')} className="ios-card bg-white" style={{ padding: '16px', cursor: 'pointer', borderTop: '4px solid #34c759' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '4px' }}>Багатосторінкова</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Брошури, журнали, каталоги, меню, звіти…</p>
                </div>
                <div onClick={() => handleSelectCategory('Бланки')} className="ios-card bg-white" style={{ padding: '16px', cursor: 'pointer', borderTop: '4px solid #ff9500' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '4px' }}>Індивідуальне</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-medium)', margin: 0 }}>Замовити прорахунок комплексного або нестандартного замовлення</p>
                </div>
              </div>

              {/* Quick Products Catalog Grid with formats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                {/* 1. Візитівка */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Візитівка</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['90х50', '85х55', '50х50', 'Кругла'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Візитки'); }} className="ios-badge ios-badge-blue" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Календар */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Календар</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['100х70', '90х60', '70х70'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Календарики кишенькові'); }} className="ios-badge ios-badge-red" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Флаєр */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Флаєр</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['210х99', '210х198', '99х99'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Флаєри'); }} className="ios-badge ios-badge-orange" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Листівка */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Листівка</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['А7', 'А6', 'А5', 'А4', 'А3'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Листівки'); }} className="ios-badge ios-badge-green" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Плакати */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Плакати</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['А3', 'В3', 'А2', 'В2', 'А1', 'B1'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Плакати'); }} className="ios-badge ios-badge-blue" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Сети */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Сети</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['А3', 'В3'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Бланки'); }} className="ios-badge ios-badge-purple" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Буклет */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Буклет</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['А4 в Євро', '2Євро в Євро', 'А6', 'А5', 'А4'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Буклети'); }} className="ios-badge ios-badge-orange" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8. Каталог */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Каталог</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['Скоба', 'Пружина', 'Клей'].map(st => (
                      <button key={st} type="button" onClick={() => { handleSelectCategory('Книги'); }} className="ios-badge ios-badge-green" style={{ cursor: 'pointer', border: 'none' }}>
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 9. Блокнот */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Блокнот</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['А6', 'А5', 'А4'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Блокноти'); }} className="ios-badge ios-badge-purple" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 10. Наліпка */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Наліпка</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['90х50', '50х50', 'Кругла', 'Овальна'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Наклейки'); }} className="ios-badge ios-badge-blue" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 11. Папка А4 */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Папка А4</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['Без корінця', 'Корінець 5мм', 'З резинкою'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { handleSelectCategory('Папки'); }} className="ios-badge ios-badge-red" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 12. Друк в листах */}
                <div className="ios-card bg-white" style={{ padding: '16px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>Друк в листах</h4>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['А2', 'В2', 'А1', 'В1'].map(fmt => (
                      <button key={fmt} type="button" onClick={() => { setSelectedFormat(fmt); handleSelectCategory('Бланки'); }} className="ios-badge ios-badge-orange" style={{ cursor: 'pointer', border: 'none' }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
