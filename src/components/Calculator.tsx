import React, { useState, useMemo } from 'react';
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

export const Calculator: React.FC = () => {
  const { clients, materials, norms, addOrder, currentUser, updateNorms } = useApp();

  // Selection step: 'catalog' | 'editor'
  const [step, setStep] = useState<'catalog' | 'editor'>('catalog');
  
  // Calculation mode: 'auto' (Adapted Business Logic) | 'operations' (Pooperatsiyniy 1C)
  const [calcMode, setCalcMode] = useState<'auto' | 'operations'>('auto');

  // Input states
  const [orderNumber, setOrderNumber] = useState<number>(() => Math.floor(10000 + Math.random() * 90000));
  const [subCategory, setSubCategory] = useState<'Бланки' | 'Листівки'>('Бланки');
  const [name, setName] = useState('Бланки А4');
  const [category, setCategory] = useState<'Візитки' | 'Бланки' | 'Буклети' | 'Книги' | 'Наліпки' | 'Календарі' | 'Блокноти' | 'Папки'>('Бланки');
  const [quantity, setQuantity] = useState(1000);
  const [packingCount, setPackingCount] = useState(1);
  const [paperType, setPaperType] = useState<'offset' | 'gazetka' | 'coated'>('offset');
  const [colors, setColors] = useState('1+0');
  const [isSamNaSebe, setIsSamNaSebe] = useState(true);
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

  const [customDesignPrice, setCustomDesignPrice] = useState<string>('');

  // Determine standard or sam na sebe or custom design cost
  const designCost = useMemo(() => {
    if (customDesignPrice.trim() !== '') {
      const parsed = parseFloat(customDesignPrice.replace(',', '.'));
      return isNaN(parsed) ? 0 : parsed;
    }
    return isSamNaSebe ? norms.designSamNaSebe : norms.designStandard;
  }, [isSamNaSebe, norms, customDesignPrice]);

  const handleSelectSubCategory = (sub: 'Бланки' | 'Листівки') => {
    setSubCategory(sub);
    if (sub === 'Бланки') {
      setPaperType('offset');
      setColors('1+0');
      setName('Бланки А4');
      setSelectedFormat('A4');
      setLaminationType('none');
      setCreaseCount(0);
    } else {
      setPaperType('coated');
      setColors('4+4');
      setName('Листівки А5');
      setSelectedFormat('A5');
      setLaminationType('none');
      setCreaseCount(0);
    }
  };

  // Select Product from Catalog
  const handleSelectCategory = (cat: 'Візитки' | 'Бланки' | 'Буклети' | 'Книги' | 'Наліпки' | 'Календарі' | 'Блокноти' | 'Папки') => {
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
      setActiveOps({
        formMaking: true,
        filmMounting: false,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: false,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Буклети') {
      setQuantity(500);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('none');
      setCreaseCount(2);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: false,
        embossing: false,
        dieCutting: false,
        folding: true,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
      setOpVolumes(prev => ({ ...prev, folding: 2 }));
    } else if (cat === 'Книги') {
      setQuantity(200);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A5');
      setBindingType('staple');
      setLaminationType('gloss');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: false,
        folding: true,
        blockInsertion: true,
        coverMaking: true,
        blockProcessing: true
      });
    } else if (cat === 'Наліпки') {
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('gloss');
      setActiveOps({
        formMaking: true,
        filmMounting: false,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: true,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: false
      });
    } else if (cat === 'Календарі') {
      setQuantity(100);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A3');
      setBindingType('spring');
      setLaminationType('none');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: false,
        embossing: false,
        dieCutting: false,
        folding: false,
        blockInsertion: true,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Блокноти') {
      setQuantity(300);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A5');
      setBindingType('spring');
      setLaminationType('matte');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: false,
        folding: false,
        blockInsertion: true,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Папки') {
      setQuantity(500);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('matte');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: true,
        folding: true,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: false
      });
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

    if (quantity < 1000) {
      machine = 'Різограф';
      format = 'A3';
      printRate = norms.printRates.rizograph;
      itemsPerSheet = selectedFormat.includes('90x50') ? 24 : (selectedFormat === 'A3' ? 1 : 2);
    } else if (quantity < 3000) {
      machine = 'Опція 1';
      format = 'A3';
      printRate = norms.printRates.option1;
      itemsPerSheet = selectedFormat.includes('90x50') ? 24 : (selectedFormat === 'A3' ? 1 : 2);
    } else if (quantity < 7000) {
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

    const physicalSheets = Math.ceil(quantity / itemsPerSheet);
    
    // Choose paper rate
    let paperPrice = norms.paperOffsetPrice;
    if (paperType === 'gazetka') paperPrice = norms.paperGazetkaPrice;
    if (paperType === 'coated') paperPrice = norms.paperCoatedPrice;
    const paperCost = physicalSheets * paperPrice;

    const passes = ['1+1', '4+4'].includes(colors) ? 2 : 1;
    const cuttingCost = quantity * norms.cuttingRate;
    const packingCost = packingCount * norms.packingRate;

    let subtotal = 0;
    let printingCost = 0;

    // Build operation prices mapping (for manual overrides if in operational mode)
    const getSafeRate = (key: string, defaultRate: number) => {
      const val = opCustomRates[key];
      const rate = (val !== undefined && !isNaN(val)) ? val : defaultRate;
      return Math.max(0.01, rate || 0.50);
    };

    const getVol = (key: string) => Math.max(1, opVolumes[key] || 1);

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
      formMaking: rates.formMaking * getVol('formMaking') * passes,
      filmMounting: rates.filmMounting * getVol('filmMounting'),
      printing: rates.printing * Math.max(1, physicalSheets) * passes,
      lamination: rates.lamination * Math.max(1, physicalSheets),
      embossing: rates.embossing * quantity * getVol('embossing'),
      dieCutting: rates.dieCutting * quantity * getVol('dieCutting'),
      folding: rates.folding * quantity * getVol('folding'),
      blockInsertion: rates.blockInsertion * quantity * getVol('blockInsertion'),
      coverMaking: rates.coverMaking * quantity * getVol('coverMaking'),
      blockProcessing: rates.blockProcessing * Math.max(1, physicalSheets)
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
      if (bindingType === 'staple') extraBindingCost = quantity * 1.5;
      if (bindingType === 'spring') extraBindingCost = quantity * 6.5;
      if (bindingType === 'glue') extraBindingCost = quantity * 12.0;
      if (bindingType === 'hardcover') extraBindingCost = quantity * 45.0;

      let extraLaminationCost = 0;
      if (laminationType !== 'none') {
        const factor = laminationType === 'softtouch' ? 2.5 : 1.2;
        extraLaminationCost = physicalSheets * factor;
      }

      let extraFoldingCost = creaseCount * 0.15 * quantity;

      subtotal = designCost + paperCost + printingCost + cuttingCost + packingCost + extraBindingCost + extraLaminationCost + extraFoldingCost;
    } else {
      // 1С OPERATIONAL LOGIC
      const opsCostTotal = Object.values(sums).reduce((acc, curr) => acc + curr, 0);
      subtotal = designCost + paperCost + opsCostTotal + cuttingCost + packingCost;
    }

    const marginAmount = subtotal * (marginPercent / 100);
    const finalPrice = subtotal + marginAmount;
    const unitPrice = finalPrice / quantity;

    return {
      machine,
      format,
      physicalSheets,
      itemsPerSheet,
      paperCost,
      rates,
      sums,
      fullSums,
      printingCost,
      subtotal,
      marginAmount,
      finalPrice,
      unitPrice,
      cuttingCost,
      packingCost
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
      quantity,
      packingCount,
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
      quantity,
      packingCount,
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

    const opt = {
      margin:       10,
      filename:     `invoice-${name.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="main-content bg-[#f2f2f7]">
      {step === 'catalog' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header */}
          <div className="header-title-container">
            <div>
              <h2 className="page-title text-slate-900">Поліграфічний калькулятор</h2>
              <p className="subtitle">Оберіть категорію продукції для детального прорахунку</p>
            </div>
            
            {templates.length > 0 && (
              <span className="ios-badge ios-badge-blue">
                {templates.length} збережених шаблонів
              </span>
            )}
          </div>

          {/* Grid Catalog Options - Clean idruk Accents */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            <div 
              onClick={() => handleSelectCategory('Бланки')}
              className="ios-card bg-white"
              style={{ padding: '30px 24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FileText size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Бланки та Листи</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Односторонній/двосторонній листовий друк форматів A4, A5, A3.
              </p>
            </div>

            <div 
              onClick={() => handleSelectCategory('Візитки')}
              className="ios-card bg-white"
              style={{ padding: '30px 24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Layout size={48} style={{ color: '#5856d6', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Візитки</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Стандартні 90х50 мм або євро-формат на щільному крейдованому папері.
              </p>
            </div>

            <div 
              onClick={() => handleSelectCategory('Буклети')}
              className="ios-card bg-white"
              style={{ padding: '30px 24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Layers size={48} style={{ color: '#ff9500', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Буклети</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Рекламні буклети в 1, 2 або 3 згини (фальцювання, біговка).
              </p>
            </div>

            <div 
              onClick={() => handleSelectCategory('Книги')}
              className="ios-card bg-white"
              style={{ padding: '30px 24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <BookOpen size={48} style={{ color: '#34c759', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Книги / Брошури</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Багатосторінкова продукція зі скріпленням блока на скобу або клей.
              </p>
            </div>

            <div 
              onClick={() => handleSelectCategory('Наліпки')}
              className="ios-card bg-white"
              style={{ padding: '30px 24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Layers size={48} style={{ color: '#af52de', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Наліпки та Етикетки</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Друк етикеток та стікерів будь-яких форм з плотерною висічкою.
              </p>
            </div>

            <div 
              onClick={() => handleSelectCategory('Календарі')}
              className="ios-card bg-white"
              style={{ padding: '30px 24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Calendar size={48} style={{ color: '#ff2d55', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Календарі</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Квартальні, настінні перекидні або календарі-будиночки на пружині.
              </p>
            </div>

            <div 
              onClick={() => handleSelectCategory('Блокноти')}
              className="ios-card bg-white"
              style={{ padding: '30px 24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <BookOpen size={48} style={{ color: '#00c7be', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Блокноти</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Фірмові блокноти А5, А4 з обкладинкою та скріпленням на металеву пружину.
              </p>
            </div>

            <div 
              onClick={() => handleSelectCategory('Папки')}
              className="ios-card bg-white"
              style={{ padding: '30px 24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FolderOpen size={48} style={{ color: '#8e8e93', margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Фірмові Папки</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Папки для документів з висічним замком на крейдованому картоні.
              </p>
            </div>
          </div>

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
                      backgroundColor: '#f9f9f9',
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
            <div style={{ display: 'flex', backgroundColor: 'rgba(120, 120, 128, 0.12)', padding: '2px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setCalcMode('auto')}
                className="ios-btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  backgroundColor: calcMode === 'auto' ? '#ffffff' : 'transparent',
                  color: 'var(--text-dark)',
                  fontWeight: calcMode === 'auto' ? '700' : '500',
                  boxShadow: calcMode === 'auto' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
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
                  backgroundColor: calcMode === 'operations' ? '#ffffff' : 'transparent',
                  color: 'var(--text-dark)',
                  fontWeight: calcMode === 'operations' ? '700' : '500',
                  boxShadow: calcMode === 'operations' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
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
              <div className="ios-card bg-white space-y-4">
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  Параметри тиражу
                </h3>

                {category === 'Бланки' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '4px' }}>
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
                    <label className="ios-label">№ Замовлення</label>
                    <input 
                      value={`#${orderNumber}`} 
                      disabled 
                      readOnly
                      style={{ backgroundColor: '#f2f2f7', cursor: 'not-allowed', fontWeight: '800', color: 'var(--primary)', textAlign: 'center' }} 
                    />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Замовник</label>
                    <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Продукція</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr', gap: '12px' }}>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Тираж (шт.)</label>
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Пачки (шт)</label>
                    <input type="number" min="0" value={packingCount} onChange={(e) => setPackingCount(Number(e.target.value))} />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Матеріал паперу</label>
                    <select value={paperType} onChange={(e) => setPaperType(e.target.value as any)}>
                      <option value="offset">Офсетний 70г</option>
                      <option value="gazetka">Газетний 45г</option>
                      <option value="coated">Крейдований 130г</option>
                    </select>
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Кольоровість</label>
                    <select value={colors} onChange={(e) => setColors(e.target.value)}>
                      <option value="1+0">1+0 (ЧБ 1-стор)</option>
                      <option value="1+1">1+1 (ЧБ 2-стор)</option>
                      <option value="4+0">4+0 (Колір 1-стор)</option>
                      <option value="4+4">4+4 (Колір 2-стор)</option>
                    </select>
                  </div>
                </div>

                {/* Design selection: 1. Сам на себе, 2. Верстка + вільне поле */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px', borderTop: '0.5px solid var(--border-light)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-medium)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Макет / Дизайн:</span>
                  <div style={{ display: 'flex', gap: '6px', flexGrow: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => { setIsSamNaSebe(true); setCustomDesignPrice(''); }}
                      className={`ios-btn ${isSamNaSebe && !customDesignPrice ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '6px 12px', height: '32px' }}
                    >
                      1. Сам на себе ({norms.designSamNaSebe} грн)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setIsSamNaSebe(false); setCustomDesignPrice(''); }}
                      className={`ios-btn ${!isSamNaSebe && !customDesignPrice ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '6px 12px', height: '32px' }}
                    >
                      2. Верстка ({norms.designStandard} грн)
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        placeholder="Своя ціна (грн)"
                        value={customDesignPrice}
                        onChange={(e) => setCustomDesignPrice(e.target.value)}
                        style={{ width: '130px', height: '32px', fontSize: '11px', padding: '0 8px', backgroundColor: customDesignPrice ? 'rgba(0,122,255,0.08)' : undefined }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive idruk Options Panel */}
              {calcMode === 'auto' && (
                <div className="ios-card bg-white space-y-4">
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    Технічні специфікації виробу
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Format and Orientation */}
                    <div className="ios-input-group">
                      <label className="ios-label">Формат виробу</label>
                      <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
                        <option value="A4">A4 (210х297 мм)</option>
                        <option value="A5">A5 (148х210 мм)</option>
                        <option value="A3">A3 (297х420 мм)</option>
                        <option value="90x50 мм">Візитка (90х50 мм)</option>
                        <option value="Euro">Єврофлаєр (99х210 мм)</option>
                      </select>
                    </div>

                    <div className="ios-input-group">
                      <label className="ios-label">Орієнтація</label>
                      <select value={orientation} onChange={(e) => setOrientation(e.target.value as any)}>
                        <option value="portrait">Портретна (вертикальна)</option>
                        <option value="landscape">Альбомна (горизонтальна)</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-page / Book options */}
                  {category === 'Книги' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <div className="ios-input-group">
                        <label className="ios-label">Обкладинка папір</label>
                        <select value={coverPaperType} onChange={(e) => setCoverPaperType(e.target.value as any)}>
                          <option value="coated">Крейда 300г</option>
                          <option value="cardboard">Картон 350г</option>
                          <option value="offset">Офсет 150г</option>
                        </select>
                      </div>
                      <div className="ios-input-group">
                        <label className="ios-label">Кольори обкл.</label>
                        <select value={coverColors} onChange={(e) => setCoverColors(e.target.value)}>
                          <option value="4+4">4+4 (Повна)</option>
                          <option value="4+0">4+0</option>
                        </select>
                      </div>
                      <div className="ios-input-group">
                        <label className="ios-label">Стор. блоку</label>
                        <input type="number" step="4" value={innerPages} onChange={(e) => setInnerPages(Number(e.target.value))} />
                      </div>
                    </div>
                  )}

                  {/* Postpress / Prepress operations selection (Enabled for Листівки, hidden for Бланки) */}
                  {!(category === 'Бланки' && subCategory === 'Бланки') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', paddingTop: '10px' }}>
                      <div className="ios-input-group">
                        <label className="ios-label">Тип скріплення</label>
                        <select value={bindingType} onChange={(e) => setBindingType(e.target.value as any)}>
                          <option value="none">Без скріплення</option>
                          <option value="staple">Скоба (шиття)</option>
                          <option value="spring">Металева пружина</option>
                          <option value="glue">Клейове (КБС)</option>
                          <option value="hardcover">Тверда палітурка</option>
                        </select>
                      </div>
                      <div className="ios-input-group">
                        <label className="ios-label">Ламінування</label>
                        <select value={laminationType} onChange={(e) => setLaminationType(e.target.value as any)}>
                          <option value="none">Без ламінування</option>
                          <option value="gloss">Глянцева плівка</option>
                          <option value="matte">Матова плівка</option>
                          <option value="softtouch">Soft-touch оксамит</option>
                        </select>
                      </div>
                      <div className="ios-input-group">
                        <label className="ios-label">Кількість бігів</label>
                        <input type="number" min="0" value={creaseCount} onChange={(e) => setCreaseCount(Number(e.target.value))} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {calcMode === 'auto' ? (
                /* Simple Business Logic Breakdown Output */
                <div className="ios-card bg-white space-y-4">
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    Склад собівартості
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Переддрукарська підготовка:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{designCost.toFixed(2)} грн</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Витрати паперу:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{calculatedOps.paperCost.toFixed(2)} грн</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Прогін на машині ({calculatedOps.machine}):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{calculatedOps.printingCost.toFixed(2)} грн</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Порізка та упаковка:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{(calculatedOps.cuttingCost + calculatedOps.packingCost).toFixed(2)} грн</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* Advanced Operations list - exact 1C Replica */
                <div className="ios-card bg-white" style={{ padding: '16px 0', overflow: 'hidden' }}>
                  <div style={{ padding: '0 16px 8px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th style={{ width: '40px', padding: '10px' }}>[x]</th>
                          <th>Назва операції</th>
                          <th style={{ width: '100px', textAlign: 'right' }}>Тариф (грн)</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Обсяг</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>Вартість</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Form Making */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.formMaking} onChange={(e) => setActiveOps({ ...activeOps, formMaking: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.formMaking ? 'var(--text-dark)' : '#94a3b8' }}>Копіювання форм / Виготовлення форми</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.formMaking !== undefined ? opCustomRates.formMaking : norms.formMakingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, formMaking: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.formMaking} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, formMaking: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.formMaking ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.formMaking.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Film Mounting */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.filmMounting} onChange={(e) => setActiveOps({ ...activeOps, filmMounting: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.filmMounting ? 'var(--text-dark)' : '#94a3b8' }}>Монтаж плівок (лакофарбових)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.filmMounting !== undefined ? opCustomRates.filmMounting : norms.filmMountingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, filmMounting: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.filmMounting} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, filmMounting: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.filmMounting ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.filmMounting.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Printing Pass */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.printing} onChange={(e) => setActiveOps({ ...activeOps, printing: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.printing ? 'var(--text-dark)' : '#94a3b8' }}>Прогон друкарської машини ({calculatedOps.machine})</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.printing !== undefined ? opCustomRates.printing : calculatedOps.rates.printing} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, printing: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', opacity: 0.6 }}>{calculatedOps.physicalSheets} арк</td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.printing ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.printing.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Lamination */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.lamination} onChange={(e) => setActiveOps({ ...activeOps, lamination: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.lamination ? 'var(--text-dark)' : '#94a3b8' }}>Ламінування (мат / глянець)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.lamination !== undefined ? opCustomRates.lamination : calculatedOps.rates.lamination} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, lamination: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', opacity: 0.6 }}>{calculatedOps.physicalSheets} арк</td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.lamination ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.lamination.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Embossing */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.embossing} onChange={(e) => setActiveOps({ ...activeOps, embossing: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.embossing ? 'var(--text-dark)' : '#94a3b8' }}>Тиснення складне (фольгою)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.embossing !== undefined ? opCustomRates.embossing : norms.embossingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, embossing: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.embossing} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, embossing: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.embossing ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.embossing.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Die Cutting */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.dieCutting} onChange={(e) => setActiveOps({ ...activeOps, dieCutting: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.dieCutting ? 'var(--text-dark)' : '#94a3b8' }}>Висечка штампом</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.dieCutting !== undefined ? opCustomRates.dieCutting : norms.dieCuttingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, dieCutting: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.dieCutting} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, dieCutting: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.dieCutting ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.dieCutting.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Folding */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.folding} onChange={(e) => setActiveOps({ ...activeOps, folding: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.folding ? 'var(--text-dark)' : '#94a3b8' }}>Біговка / Фальцювання (згини)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.folding !== undefined ? opCustomRates.folding : norms.foldingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, folding: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.folding} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, folding: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.folding ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.folding.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Block Insertion */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.blockInsertion} onChange={(e) => setActiveOps({ ...activeOps, blockInsertion: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.blockInsertion ? 'var(--text-dark)' : '#94a3b8' }}>Вставка блока брошури</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.blockInsertion !== undefined ? opCustomRates.blockInsertion : norms.blockInsertionPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, blockInsertion: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.blockInsertion} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, blockInsertion: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.blockInsertion ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.blockInsertion.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Cover Making */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.coverMaking} onChange={(e) => setActiveOps({ ...activeOps, coverMaking: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.coverMaking ? 'var(--text-dark)' : '#94a3b8' }}>Виготовлення кришки твердої</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.coverMaking !== undefined ? opCustomRates.coverMaking : norms.coverMakingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, coverMaking: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={opVolumes.coverMaking} 
                              onChange={(e) => setOpVolumes({ ...opVolumes, coverMaking: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'center', fontSize: '11px', width: '50px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.coverMaking ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.coverMaking.toFixed(2)} ₴
                          </td>
                        </tr>

                        {/* Block Processing */}
                        <tr>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={activeOps.blockProcessing} onChange={(e) => setActiveOps({ ...activeOps, blockProcessing: e.target.checked })} />
                          </td>
                          <td style={{ fontWeight: '700', color: activeOps.blockProcessing ? 'var(--text-dark)' : '#94a3b8' }}>Обробка блока (порізка, шліф)</td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={opCustomRates.blockProcessing !== undefined ? opCustomRates.blockProcessing : norms.blockProcessingPrice} 
                              onChange={(e) => setOpCustomRates({ ...opCustomRates, blockProcessing: Number(e.target.value) })}
                              style={{ height: '24px', padding: '0 4px', textAlign: 'right', fontSize: '11px', width: '80px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', opacity: 0.6 }}>{calculatedOps.physicalSheets} арк</td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: activeOps.blockProcessing ? 'var(--text-dark)' : '#94a3b8' }}>
                            {calculatedOps.fullSums.blockProcessing.toFixed(2)} ₴
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
              <div className="ios-card bg-white space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Підсумки прорахунку</span>
                
                <div>
                  <span style={{ fontSize: '12px', color: '#636366' }}>Ціна продажу для клієнта:</span>
                  <p style={{ fontSize: '30px', fontWeight: '800', color: 'var(--primary)' }}>
                    {calculatedOps.finalPrice.toFixed(2)} <span style={{ fontSize: '14px', fontWeight: '600' }}>грн</span>
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '0.5px solid var(--border-light)', paddingTop: '10px', marginTop: '10px', fontSize: '11px' }}>
                    <div className="flex justify-between">
                      <span>Собівартість виробництва:</span>
                      <strong>{calculatedOps.subtotal.toFixed(2)} грн</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Маржа ({marginPercent}%):</span>
                      <strong>+{calculatedOps.marginAmount.toFixed(2)} грн</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Ціна за одиницю (шт):</span>
                      <strong style={{ color: 'var(--primary)' }}>{calculatedOps.unitPrice.toFixed(2)} грн</strong>
                    </div>
                  </div>
                </div>

                {/* Warehouse Stock Check */}
                <div style={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: paperWarehouseStatus.hasEnough ? 'rgba(52, 199, 89, 0.08)' : 'rgba(255, 149, 0, 0.08)',
                  fontSize: '11px'
                }}>
                  <strong>Склад:</strong> {paperWarehouseStatus.materialName} ({paperWarehouseStatus.available} доступно, потрібно {calculatedOps.physicalSheets})
                </div>

                {/* Margin manual percentage selector with Range Slider */}
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="ios-label" style={{ marginBottom: 0 }}>Відсоток маржі / націнки:</label>
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
                        style={{ width: '70px', height: '28px', textAlign: 'center', fontSize: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f2f2f7', padding: '2px', borderRadius: '6px', flexGrow: 1 }}>
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
                              backgroundColor: marginPercent === m ? '#ffffff' : 'transparent',
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
              <div className="ios-card bg-white" style={{ padding: '8px 12px' }}>
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
                  style={{ border: '1px dashed var(--border-heavy)', backgroundColor: 'transparent' }}
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
          <div className="ios-modal" style={{ maxWidth: '650px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Рахунок на оплату</h3>
              <button onClick={() => setShowInvoice(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" id="invoice-preview-container" style={{ padding: '36px', backgroundColor: '#FFFFFF', color: '#1C1C1E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic' }}>РАХУНОК-ФАКТУРА</h4>
                  <p style={{ fontSize: '12px', color: '#8E8E93' }}>Категорія продукції: {category.toUpperCase()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700' }}>{name}</p>
                  <p style={{ fontSize: '11px', color: '#8E8E93' }}>Дата: {new Date().toLocaleDateString('uk-UA')}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginBottom: '32px', fontSize: '12px' }}>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: '750', color: '#8e8e93', textTransform: 'uppercase', marginBottom: '4px' }}>Специфікація замовлення</p>
                  <p><strong>Покупець:</strong> {activeClient?.name || '—'}</p>
                  <p><strong>Тираж:</strong> {quantity.toLocaleString()} шт. (Упаковка: {packingCount} пак.)</p>
                  <p><strong>Машина:</strong> {calculatedOps.machine} | Друк: {colors}</p>
                  <p><strong>Папір:</strong> {paperType === 'offset' ? 'Офсет 70г' : paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '9px', fontWeight: '750', color: '#8e8e93', textTransform: 'uppercase' }}>Ціна за одиницю</p>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)', margin: '4px 0' }}>{calculatedOps.unitPrice.toFixed(2)} грн</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #1c1c1e', textAlign: 'left' }}>
                    <th style={{ padding: '6px 0', fontWeight: '700' }}>Назва робіт/послуг</th>
                    <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700' }}>Сума (грн)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                    <td style={{ padding: '8px 0' }}>Переддрукарська підготовка та дизайн</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>{designCost.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                    <td style={{ padding: '8px 0' }}>Матеріали, поліграфічний друк та поопераційна збірка тиражу</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      {(calculatedOps.finalPrice - designCost).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ fontSize: '16px', fontWeight: '800' }}>
                    <td style={{ padding: '16px 0 0 0' }}>ВСЬОГО ДО СПЛАТИ:</td>
                    <td style={{ padding: '16px 0 0 0', textAlign: 'right', color: 'var(--primary)' }}>{calculatedOps.finalPrice.toFixed(2)} грн</td>
                  </tr>
                </tfoot>
              </table>
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
          <form onSubmit={handleSaveAsTemplate} className="ios-modal" style={{ maxWidth: '400px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Зберегти розрахунок як шаблон</h3>
              <button type="button" onClick={() => setShowTemplateModal(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>
            <div className="ios-modal-body">
              <div className="ios-input-group">
                <label className="ios-label">Назва шаблону *</label>
                <input required placeholder="напр. Євробуклет 130г 500шт" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
              </div>
            </div>
            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowTemplateModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти шаблон</button>
            </div>
          </form>
        </div>
      )}

      {/* Norms settings edit modal (Admin) */}
      {showNorms && isAdmin && (
        <div className="ios-modal-overlay">
          <div className="ios-modal" style={{ maxWidth: '500px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Базові тарифи підприємства</h3>
              <button onClick={() => setShowNorms(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateNorms(tempNorms); setShowNorms(false); alert('Тарифи оновлено!'); }}>
              <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Папір та дизайн</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label">Офсет 70г</label>
                    <input type="number" step="any" value={tempNorms.paperOffsetPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperOffsetPrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Газетка 45г</label>
                    <input type="number" step="any" value={tempNorms.paperGazetkaPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperGazetkaPrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Крейдований 130г</label>
                    <input type="number" step="any" value={tempNorms.paperCoatedPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperCoatedPrice: Number(e.target.value) })} />
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Післядрукарські тарифи за операцію</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label">Виготовлення форм</label>
                    <input type="number" step="any" value={tempNorms.formMakingPrice} onChange={(e) => setTempNorms({ ...tempNorms, formMakingPrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Монтаж плівок</label>
                    <input type="number" step="any" value={tempNorms.filmMountingPrice} onChange={(e) => setTempNorms({ ...tempNorms, filmMountingPrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Мат ламінація</label>
                    <input type="number" step="any" value={tempNorms.laminationMattePrice} onChange={(e) => setTempNorms({ ...tempNorms, laminationMattePrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Глянець ламінація</label>
                    <input type="number" step="any" value={tempNorms.laminationGlossyPrice} onChange={(e) => setTempNorms({ ...tempNorms, laminationGlossyPrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Складне тиснення</label>
                    <input type="number" step="any" value={tempNorms.embossingPrice} onChange={(e) => setTempNorms({ ...tempNorms, embossingPrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Висічка штампом</label>
                    <input type="number" step="any" value={tempNorms.dieCuttingPrice} onChange={(e) => setTempNorms({ ...tempNorms, dieCuttingPrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Біговка (згин)</label>
                    <input type="number" step="any" value={tempNorms.foldingPrice} onChange={(e) => setTempNorms({ ...tempNorms, foldingPrice: Number(e.target.value) })} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Вставка блока</label>
                    <input type="number" step="any" value={tempNorms.blockInsertionPrice} onChange={(e) => setTempNorms({ ...tempNorms, blockInsertionPrice: Number(e.target.value) })} />
                  </div>
                </div>

              </div>
              <div className="ios-modal-footer">
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
