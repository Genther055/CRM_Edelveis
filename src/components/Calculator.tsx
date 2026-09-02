import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  FileText,
  LayoutTemplate,
  FileDown,
  Send,
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
  SlidersHorizontal,
  CreditCard,
  Sparkles,
  Palette,
  Image,
  Utensils,
  Mail,
  Package,
  Scissors,
  ChevronRight,
  Zap,
  Bookmark,
  Printer,
  Crop,
  ShieldCheck,
  ChevronDown,
  Menu,
  FileSpreadsheet,
  Check,
  Search,
  RotateCcw,
  ArrowLeftRight
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

export interface MaterialPriceItem {
  id: string;
  name: string;
  category: 'paper_offset' | 'paper_coated' | 'cardboard' | 'adhesive' | 'wide' | 'rigid' | 'film';
  unit: string;
  price: number;
}

export const defaultMaterialPrices: MaterialPriceItem[] = [
  // 1. Папір офсетний та газетний
  { id: 'off_70', name: 'Офсетний папір 70 г/м²', category: 'paper_offset', unit: 'грн/лист А1', price: 0.28 },
  { id: 'off_80', name: 'Офсетний папір 80 г/м²', category: 'paper_offset', unit: 'грн/лист А1', price: 0.30 },
  { id: 'off_90', name: 'Офсетний папір 90 г/м²', category: 'paper_offset', unit: 'грн/лист А1', price: 0.35 },
  { id: 'gaz_45', name: 'Газетний папір 45 г/м²', category: 'paper_offset', unit: 'грн/лист А1', price: 0.18 },

  // 2. Папір крейдований (мат / глянець)
  { id: 'c_90', name: 'Крейдований 90 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 0.42 },
  { id: 'c_115', name: 'Крейдований 115 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 0.48 },
  { id: 'c_130', name: 'Крейдований 130 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 0.60 },
  { id: 'c_150', name: 'Крейдований 150 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 0.68 },
  { id: 'c_200', name: 'Крейдований 200 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 0.85 },
  { id: 'c_250', name: 'Крейдований 250 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 1.10 },
  { id: 'c_300', name: 'Крейдований 300 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 1.35 },
  { id: 'c_350', name: 'Крейдований 350 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 1.65 },
  { id: 'c_450', name: 'Крейдований 450 г/м²', category: 'paper_coated', unit: 'грн/лист А1', price: 2.40 },

  // 3. Картони спеціальні та дизайнерські
  { id: 'kraft_300', name: 'Крафт-картон 300 г/м²', category: 'cardboard', unit: 'грн/лист А1', price: 1.90 },
  { id: 'beer_card', name: 'Пивний картон 1.5 мм', category: 'cardboard', unit: 'грн/лист А1', price: 4.50 },
  { id: 'design_linen', name: 'Дизайнерський картон «Льон» 300г', category: 'cardboard', unit: 'грн/лист SRA3', price: 5.20 },
  { id: 'design_dali', name: 'Дизайнерський картон «Dali / Flora» 285г', category: 'cardboard', unit: 'грн/лист SRA3', price: 6.00 },

  // 4. Самоклейні матеріали
  { id: 'raf_paper', name: 'Самоклейка Raflatac напівглянець (папір)', category: 'adhesive', unit: 'грн/лист SRA3', price: 1.80 },
  { id: 'rit_white', name: 'Самоклейка Ritrama плівка біла', category: 'adhesive', unit: 'грн/лист SRA3', price: 3.20 },
  { id: 'rit_trans', name: 'Самоклейка Ritrama плівка прозора', category: 'adhesive', unit: 'грн/лист SRA3', price: 3.50 },

  // 5. Широкоформатний друк & Банери
  { id: 'ban_440', name: 'Банер Frontlit 440 г/м² (ламінований)', category: 'wide', unit: 'грн/м²', price: 85.00 },
  { id: 'ban_510', name: 'Банер Cast 510 г/м² (литий посилений)', category: 'wide', unit: 'грн/м²', price: 120.00 },
  { id: 'ban_mesh', name: 'Банерна сітка Mesh 360 г/м²', category: 'wide', unit: 'грн/м²', price: 110.00 },
  { id: 'post_city', name: 'Папір Citylight 150 г/м² (для лайтбоксів)', category: 'wide', unit: 'грн/м²', price: 75.00 },
  { id: 'post_blue', name: 'Папір Blueback 115 г/м² (для білбордів)', category: 'wide', unit: 'грн/м²', price: 45.00 },
  { id: 'canvas_nat', name: 'Художнє натуральне полотно (Canvas)', category: 'wide', unit: 'грн/м²', price: 220.00 },

  // 6. Тверді матеріали & Пластики
  { id: 'pvc_3', name: 'Пластик ПВХ 3 мм', category: 'rigid', unit: 'грн/м²', price: 160.00 },
  { id: 'pvc_5', name: 'Пластик ПВХ 5 мм', category: 'rigid', unit: 'грн/м²', price: 240.00 },
  { id: 'composite_3', name: 'Алюмінієвий композит 3 мм', category: 'rigid', unit: 'грн/м²', price: 420.00 },
  { id: 'acrylic_3', name: 'Прозорий акрил 3 мм', category: 'rigid', unit: 'грн/м²', price: 550.00 },

  // 7. Кольорові плівки
  { id: 'oracal_641', name: 'Плівка ORACAL 641 (глянець/мат 60 кольорів)', category: 'film', unit: 'грн/м²', price: 95.00 },
  { id: 'oramask_810', name: 'Трафаретна плівка ORAMASK 810', category: 'film', unit: 'грн/м²', price: 110.00 },
  { id: 'oralite_ref', name: 'Світловідбиваюча спецплівка Oralite', category: 'film', unit: 'грн/м²', price: 380.00 },
  { id: 'mount_film', name: 'Монтажна плівка з підкладкою', category: 'film', unit: 'грн/м²', price: 45.00 },
];

// Helper: Custom SVG Mini-Thumbnails for 12 Booklet Folding Types
const renderFoldThumbnail = (foldId: string, isActive: boolean) => {
  const stroke = isActive ? '#2563eb' : '#64748b';
  const fillLight = isActive ? '#eff6ff' : '#ffffff';
  const fillMid = isActive ? '#dbeafe' : '#f1f5f9';
  const fillDark = isActive ? '#bfdbfe' : '#e2e8f0';
  const dashStroke = isActive ? '#3b82f6' : '#94a3b8';
  const arrowColor = isActive ? '#2563eb' : '#64748b';

  switch (foldId) {
    case '1': // Книжка (1 складання / Half Fold)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="6,9 27,13 27,33 6,29" fill={fillMid} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="27,13 48,9 48,29 27,33" fill={fillLight} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <line x1="27" y1="13" x2="27" y2="33" stroke={dashStroke} strokeWidth="1.4" strokeDasharray="2 1.5" />
          <path d="M44 6 C38 3 31 4 28 9" stroke={arrowColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <polygon points="27,11 27,7 31,8" fill={arrowColor} />
        </svg>
      );

    case '121': // Асиметричний (1 складання)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="6,9 48,9 48,31 6,31" fill={fillMid} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="6,12 24,14 24,31 6,31" fill={fillLight} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <line x1="24" y1="9" x2="24" y2="31" stroke={dashStroke} strokeWidth="1.4" strokeDasharray="2 1.5" />
          <path d="M10 6 C15 3 21 4 23 9" stroke={arrowColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      );

    case '21': // Намотування (2 складання / C-Fold / Tri-Fold)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="19,11 35,11 35,31 19,31" fill={fillDark} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="6,8 19,11 19,31 6,28" fill={fillMid} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="35,11 48,8 48,28 35,31" fill={fillLight} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <line x1="19" y1="11" x2="19" y2="31" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <line x1="35" y1="11" x2="35" y2="31" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <path d="M46 5 C37 2 27 3 23 8" stroke={arrowColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <polygon points="22,10 23,6 26,8" fill={arrowColor} />
        </svg>
      );

    case '23': // Вікно (2 складання / Gate Fold)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <rect x="16" y="10" width="22" height="20" fill={fillDark} stroke={stroke} strokeWidth="1.3" />
          <polygon points="6,7 16,10 16,30 6,27" fill={fillLight} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="48,7 38,10 38,30 48,27" fill={fillLight} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <line x1="16" y1="10" x2="16" y2="30" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <line x1="38" y1="10" x2="38" y2="30" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <path d="M10 5 L15 8" stroke={arrowColor} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M44 5 L39 8" stroke={arrowColor} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case '22': // Гармошка (2 складання / Z-Fold)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="6,9 19,13 19,33 6,29" fill={fillLight} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="19,13 34,8 34,28 19,33" fill={fillMid} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="34,8 48,12 48,32 34,28" fill={fillDark} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <line x1="19" y1="13" x2="19" y2="33" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <line x1="34" y1="8" x2="34" y2="28" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
        </svg>
      );

    case '34': // Комбінований (2 складання / Cross Fold)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <rect x="7" y="7" width="40" height="22" rx="2" fill={fillLight} stroke={stroke} strokeWidth="1.3" />
          <line x1="27" y1="7" x2="27" y2="29" stroke={dashStroke} strokeWidth="1.3" strokeDasharray="2 1.5" />
          <line x1="7" y1="18" x2="47" y2="18" stroke={dashStroke} strokeWidth="1.3" strokeDasharray="2 1.5" />
          <rect x="27" y="7" width="20" height="11" fill={fillMid} fillOpacity="0.7" />
        </svg>
      );

    case '31': // Намотування (3 складання / 4-Panel Roll)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="6,12 15,14 15,32 6,30" fill={fillDark} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="15,14 26,12 26,30 15,32" fill={fillMid} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="26,12 37,14 37,32 26,30" fill={fillLight} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="37,14 48,11 48,29 37,32" fill={fillMid} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="15" y1="14" x2="15" y2="32" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <line x1="26" y1="12" x2="26" y2="30" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <line x1="37" y1="14" x2="37" y2="32" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
        </svg>
      );

    case '32': // Гармошка (3 складання / W-Fold)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="5,8 15,13 15,33 5,28" fill={fillLight} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="15,13 26,8 26,28 15,33" fill={fillMid} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="26,8 37,13 37,33 26,28" fill={fillLight} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="37,13 48,8 48,28 37,33" fill={fillDark} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="15" y1="13" x2="15" y2="33" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <line x1="26" y1="8" x2="26" y2="28" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <line x1="37" y1="13" x2="37" y2="33" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
        </svg>
      );

    case '33': // Вікно (3 складання / Double Gate Fold)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="6,9 16,11 16,31 6,29" fill={fillLight} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="16,11 27,13 27,33 16,31" fill={fillMid} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="27,13 38,11 38,31 27,33" fill={fillMid} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="38,11 48,9 48,29 38,31" fill={fillLight} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="16" y1="11" x2="16" y2="31" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
          <line x1="27" y1="13" x2="27" y2="33" stroke={dashStroke} strokeWidth="1.4" strokeDasharray="2 1.5" />
          <line x1="38" y1="11" x2="38" y2="31" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
        </svg>
      );

    case '41': // Намотування (4 складання / 5-Panel Roll)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <rect x="6" y="9" width="42" height="19" rx="1.5" fill={fillLight} stroke={stroke} strokeWidth="1.2" />
          <line x1="14" y1="9" x2="14" y2="28" stroke={dashStroke} strokeWidth="1.1" strokeDasharray="1.5 1.5" />
          <line x1="22" y1="9" x2="22" y2="28" stroke={dashStroke} strokeWidth="1.1" strokeDasharray="1.5 1.5" />
          <line x1="30" y1="9" x2="30" y2="28" stroke={dashStroke} strokeWidth="1.1" strokeDasharray="1.5 1.5" />
          <line x1="38" y1="9" x2="38" y2="28" stroke={dashStroke} strokeWidth="1.1" strokeDasharray="1.5 1.5" />
        </svg>
      );

    case '42': // Гармошка (4 складання / 5-Panel Accordion)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="5,8 13,12 13,32 5,28" fill={fillLight} stroke={stroke} strokeWidth="1.1" strokeLinejoin="round" />
          <polygon points="13,12 21,8 21,28 13,32" fill={fillMid} stroke={stroke} strokeWidth="1.1" strokeLinejoin="round" />
          <polygon points="21,8 29,12 29,32 21,28" fill={fillLight} stroke={stroke} strokeWidth="1.1" strokeLinejoin="round" />
          <polygon points="29,12 37,8 37,28 29,32" fill={fillMid} stroke={stroke} strokeWidth="1.1" strokeLinejoin="round" />
          <polygon points="37,8 48,12 48,32 37,28" fill={fillDark} stroke={stroke} strokeWidth="1.1" strokeLinejoin="round" />
          <line x1="13" y1="12" x2="13" y2="32" stroke={dashStroke} strokeWidth="1" strokeDasharray="2 1.5" />
          <line x1="21" y1="8" x2="21" y2="28" stroke={dashStroke} strokeWidth="1" strokeDasharray="2 1.5" />
          <line x1="29" y1="12" x2="29" y2="32" stroke={dashStroke} strokeWidth="1" strokeDasharray="2 1.5" />
          <line x1="37" y1="8" x2="37" y2="28" stroke={dashStroke} strokeWidth="1" strokeDasharray="2 1.5" />
        </svg>
      );

    case '52': // Гармошка (5 складань / 6-Panel Accordion)
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <polygon points="4,8 11,12 11,32 4,28" fill={fillLight} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
          <polygon points="11,12 18,8 18,28 11,32" fill={fillMid} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
          <polygon points="18,8 25,12 25,32 18,28" fill={fillLight} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
          <polygon points="25,12 32,8 32,28 25,32" fill={fillMid} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
          <polygon points="32,8 39,12 39,32 32,28" fill={fillLight} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
          <polygon points="39,12 48,8 48,28 39,32" fill={fillDark} stroke={stroke} strokeWidth="1" strokeLinejoin="round" />
          <line x1="11" y1="12" x2="11" y2="32" stroke={dashStroke} strokeWidth="0.9" strokeDasharray="1.5 1.5" />
          <line x1="18" y1="8" x2="18" y2="28" stroke={dashStroke} strokeWidth="0.9" strokeDasharray="1.5 1.5" />
          <line x1="25" y1="12" x2="25" y2="32" stroke={dashStroke} strokeWidth="0.9" strokeDasharray="1.5 1.5" />
          <line x1="32" y1="8" x2="32" y2="28" stroke={dashStroke} strokeWidth="0.9" strokeDasharray="1.5 1.5" />
          <line x1="39" y1="12" x2="39" y2="32" stroke={dashStroke} strokeWidth="0.9" strokeDasharray="1.5 1.5" />
        </svg>
      );

    default:
      return (
        <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
          <rect x="7" y="7" width="40" height="22" rx="2" fill={fillLight} stroke={stroke} strokeWidth="1.2" />
          <line x1="27" y1="7" x2="27" y2="29" stroke={dashStroke} strokeWidth="1.2" strokeDasharray="2 1.5" />
        </svg>
      );
  }
};

// Helper: Rich Interactive 3D & Blueprint Visualizer for Folding Booklets
const renderBookletFoldBlueprint = (
  foldCode: string,
  widthStr: string,
  heightStr: string,
  unit: string,
  orientation: 'horiz' | 'vert',
  toggleOrientation: () => void
) => {
  const wNum = parseFloat(widthStr) || 297;
  const hNum = parseFloat(heightStr) || 210;

  interface FoldMeta {
    title: string;
    sub: string;
    creases: number;
    pages: number;
    crossSection: string;
    isometricSvg: React.ReactNode;
    getPanels: (w: number) => { name: string; width: number; ratio: number }[];
    getClosedDimensions: (w: number, h: number) => { w: number; h: number; desc: string };
  }

  const foldMap: Record<string, FoldMeta> = {
    '1': {
      title: 'Книжка (Half Fold)',
      sub: '1 згин навпіл',
      creases: 1,
      pages: 4,
      crossSection: 'V-подібний (1 згин)',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <polygon points="25,18 90,28 90,70 25,60" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="90,28 155,16 155,58 90,70" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2" strokeLinejoin="round" />
          <line x1="90" y1="28" x2="90" y2="70" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="102" y1="34" x2="142" y2="27" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="102" y1="42" x2="135" y2="36" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="102" y1="48" x2="125" y2="43" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M145 11 C125 3 100 6 93 19" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <polygon points="90,22 93,15 97,20" fill="#007AFF" />
        </svg>
      ),
      getPanels: (w) => [
        { name: 'Оборотка', width: Math.round(w / 2 * 10) / 10, ratio: 0.5 },
        { name: 'Титул (Лицьова)', width: Math.round(w / 2 * 10) / 10, ratio: 0.5 }
      ],
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 2 * 10) / 10, h, desc: 'А5 / Стандарт' })
    },
    '121': {
      title: 'Асиметричний буклет',
      sub: '1 згин із відкритим полем',
      creases: 1,
      pages: 4,
      crossSection: 'L-подібний клапан',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <rect x="25" y="16" width="130" height="52" rx="2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          <polygon points="25,16 75,21 75,73 25,68" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2" strokeLinejoin="round" />
          <line x1="75" y1="16" x2="75" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="33" y1="28" x2="65" y2="31" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="33" y1="36" x2="58" y2="39" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M45 8 C58 4 70 8 74 18" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <polygon points="75,21 72,15 77,16" fill="#007AFF" />
        </svg>
      ),
      getPanels: (w) => {
        const flap = Math.round(w * 0.35 * 10) / 10;
        return [
          { name: 'Клапан', width: flap, ratio: 0.35 },
          { name: 'Основне поле (Титул)', width: Math.round((w - flap) * 10) / 10, ratio: 0.65 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w * 0.65 * 10) / 10, h, desc: 'Широке поле' })
    },
    '21': {
      title: 'Намотування (Євробуклет / C-Fold)',
      sub: '2 згини у спіраль',
      creases: 2,
      pages: 6,
      crossSection: 'C-подібна спіраль',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <rect x="62" y="16" width="56" height="52" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <polygon points="20,22 62,16 62,68 20,74" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="118,16 160,22 160,74 118,68" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2" strokeLinejoin="round" />
          <line x1="62" y1="16" x2="62" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="118" y1="16" x2="118" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="126" y1="28" x2="152" y2="32" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="126" y1="36" x2="146" y2="39" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M152 12 C135 2 85 4 68 14" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <polygon points="65,16 68,10 71,14" fill="#007AFF" />
        </svg>
      ),
      getPanels: (w) => {
        const flap = Math.floor(w / 3) - 2;
        const mid = Math.floor(w / 3) + 1;
        const front = w - (flap + mid);
        return [
          { name: 'Внутрішній клапан', width: flap, ratio: flap / w },
          { name: 'Задня обкладинка', width: mid, ratio: mid / w },
          { name: 'Титул (Лицьова)', width: front, ratio: front / w }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 3 * 10) / 10, h, desc: 'Євро 100×210' })
    },
    '23': {
      title: 'Вікно (Gate Fold)',
      sub: '2 стулки до центру',
      creases: 2,
      pages: 6,
      crossSection: 'П-подібні стулки',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <rect x="55" y="16" width="70" height="52" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <polygon points="18,22 55,16 55,68 18,74" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.8" strokeLinejoin="round" />
          <polygon points="125,16 162,22 162,74 125,68" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="55" y1="16" x2="55" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="125" y1="16" x2="125" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M28 10 L46 13" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" />
          <polygon points="49,14 43,10 44,16" fill="#007AFF" />
          <path d="M152 10 L134 13" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" />
          <polygon points="131,14 136,16 137,10" fill="#007AFF" />
        </svg>
      ),
      getPanels: (w) => {
        const shutter = Math.round(w * 0.25 * 10) / 10;
        const center = Math.round((w - 2 * shutter) * 10) / 10;
        return [
          { name: 'Ліва стулка', width: shutter, ratio: 0.25 },
          { name: 'Центральний розворот', width: center, ratio: 0.5 },
          { name: 'Права стулка', width: shutter, ratio: 0.25 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 2 * 10) / 10, h, desc: 'А5 / Закрите вікно' })
    },
    '22': {
      title: 'Гармошка (Z-Fold)',
      sub: '2 згини зигзагом (3 секції)',
      creases: 2,
      pages: 6,
      crossSection: 'Z-подібний зигзаг',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <polygon points="18,20 62,28 62,74 18,66" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2" strokeLinejoin="round" />
          <line x1="26" y1="32" x2="54" y2="37" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="40" x2="48" y2="44" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points="62,28 112,16 112,62 62,74" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="112,16 162,24 162,70 112,62" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="62" y1="28" x2="62" y2="74" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="112" y1="16" x2="112" y2="62" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      ),
      getPanels: (w) => {
        const sec = Math.round(w / 3 * 10) / 10;
        return [
          { name: 'Титул (Секція 1)', width: sec, ratio: 0.333 },
          { name: 'Центральна секція', width: sec, ratio: 0.333 },
          { name: 'Задня секція', width: sec, ratio: 0.333 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 3 * 10) / 10, h, desc: 'Євро 99×210' })
    },
    '34': {
      title: 'Комбінований (Cross Fold)',
      sub: '2 згини: горизонтальний + вертикальний',
      creases: 2,
      pages: 8,
      crossSection: 'Хрестовий (4 квадранти)',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <rect x="25" y="14" width="130" height="54" rx="2" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="90" y1="14" x2="90" y2="68" stroke="#007AFF" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="25" y1="41" x2="155" y2="41" stroke="#007AFF" strokeWidth="2" strokeDasharray="3 2" />
          <rect x="90" y="14" width="65" height="27" rx="1" fill="#EFF6FF" stroke="#007AFF" strokeWidth="1.8" />
          <line x1="100" y1="22" x2="140" y2="22" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="30" x2="130" y2="30" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      getPanels: (w) => [
        { name: 'Ліва частина (50%)', width: Math.round(w / 2 * 10) / 10, ratio: 0.5 },
        { name: 'Права частина (50%)', width: Math.round(w / 2 * 10) / 10, ratio: 0.5 }
      ],
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 2 * 10) / 10, h: Math.round(h / 2 * 10) / 10, desc: 'А6 (1/4 листа)' })
    },
    '31': {
      title: 'Намотування (3 згини / 4 секції)',
      sub: '3 згини у спіраль',
      creases: 3,
      pages: 8,
      crossSection: '4-секційна спіраль',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <rect x="25" y="16" width="130" height="52" rx="2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="57" y1="16" x2="57" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="90" y1="16" x2="90" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="122" y1="16" x2="122" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <rect x="122" y="16" width="33" height="52" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2" />
          <line x1="128" y1="26" x2="148" y2="26" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="128" y1="34" x2="142" y2="34" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M145 8 C120 0 70 2 50 12" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <polygon points="47,14 50,8 54,12" fill="#007AFF" />
        </svg>
      ),
      getPanels: (w) => {
        const p1 = Math.round(w * 0.235 * 10) / 10;
        const p2 = Math.round(w * 0.245 * 10) / 10;
        const p3 = Math.round(w * 0.26 * 10) / 10;
        const p4 = Math.round((w - p1 - p2 - p3) * 10) / 10;
        return [
          { name: 'Клапан 1', width: p1, ratio: 0.235 },
          { name: 'Клапан 2', width: p2, ratio: 0.245 },
          { name: 'Оборотка', width: p3, ratio: 0.26 },
          { name: 'Титул', width: p4, ratio: 0.26 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 4 * 10) / 10, h, desc: '1/4 ширини' })
    },
    '32': {
      title: 'Гармошка (W-Fold / 3 згини)',
      sub: '3 згини зигзагом (4 секції)',
      creases: 3,
      pages: 8,
      crossSection: 'W-зигзаг (4 секції)',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <polygon points="15,20 48,28 48,72 15,64" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="48,28 82,18 82,62 48,72" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="82,18 120,28 120,72 82,62" fill="#EFF6FF" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="120,28 165,18 165,62 120,72" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="48" y1="28" x2="48" y2="72" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="82" y1="18" x2="82" y2="62" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="120" y1="28" x2="120" y2="72" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      ),
      getPanels: (w) => {
        const sec = Math.round(w / 4 * 10) / 10;
        return [
          { name: 'Титул (1)', width: sec, ratio: 0.25 },
          { name: 'Секція 2', width: sec, ratio: 0.25 },
          { name: 'Секція 3', width: sec, ratio: 0.25 },
          { name: 'Задник (4)', width: sec, ratio: 0.25 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 4 * 10) / 10, h, desc: '1/4 ширини' })
    },
    '33': {
      title: 'Подвійне вікно (Double Gate)',
      sub: '3 згини: стулки + навпіл',
      creases: 3,
      pages: 8,
      crossSection: 'Подвійні закриті двері',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <rect x="25" y="16" width="130" height="52" rx="2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="57" y1="16" x2="57" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="90" y1="16" x2="90" y2="68" stroke="#007AFF" strokeWidth="2" />
          <line x1="123" y1="16" x2="123" y2="68" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3 2" />
          <polygon points="25,16 57,20 57,72 25,68" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.8" />
          <polygon points="123,20 155,16 155,68 123,72" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.8" />
        </svg>
      ),
      getPanels: (w) => {
        const sec = Math.round(w / 4 * 10) / 10;
        return [
          { name: 'Ліва стулка', width: sec, ratio: 0.25 },
          { name: 'Центр лівий', width: sec, ratio: 0.25 },
          { name: 'Центр правий', width: sec, ratio: 0.25 },
          { name: 'Права стулка', width: sec, ratio: 0.25 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 4 * 10) / 10, h, desc: '1/4 ширини' })
    },
    '41': {
      title: 'Намотування (4 згини / 5 секцій)',
      sub: '4 згини спіраллю',
      creases: 4,
      pages: 10,
      crossSection: '5-секційна спіраль',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <rect x="20" y="16" width="140" height="52" rx="2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="48" y1="16" x2="48" y2="68" stroke="#007AFF" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="76" y1="16" x2="76" y2="68" stroke="#007AFF" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="104" y1="16" x2="104" y2="68" stroke="#007AFF" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="132" y1="16" x2="132" y2="68" stroke="#007AFF" strokeWidth="1.2" strokeDasharray="3 2" />
          <rect x="132" y="16" width="28" height="52" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2" />
        </svg>
      ),
      getPanels: (w) => {
        const sec = Math.round(w / 5 * 10) / 10;
        return [
          { name: 'Клапан 1', width: sec, ratio: 0.2 },
          { name: 'Клапан 2', width: sec, ratio: 0.2 },
          { name: 'Клапан 3', width: sec, ratio: 0.2 },
          { name: 'Оборотка', width: sec, ratio: 0.2 },
          { name: 'Титул', width: sec, ratio: 0.2 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 5 * 10) / 10, h, desc: '1/5 ширини' })
    },
    '42': {
      title: 'Гармошка (4 згини / 5 секцій)',
      sub: '4 згини зигзагом',
      creases: 4,
      pages: 10,
      crossSection: 'M-зигзаг (5 секцій)',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <polygon points="15,20 42,26 42,70 15,64" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.8" />
          <polygon points="42,26 70,18 70,62 42,70" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.3" />
          <polygon points="70,18 98,26 98,70 70,62" fill="#EFF6FF" stroke="#94A3B8" strokeWidth="1.3" />
          <polygon points="98,26 126,18 126,62 98,70" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.3" />
          <polygon points="126,18 165,26 165,70 126,62" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.3" />
          <line x1="42" y1="26" x2="42" y2="70" stroke="#007AFF" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="70" y1="18" x2="70" y2="62" stroke="#007AFF" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="98" y1="26" x2="98" y2="70" stroke="#007AFF" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="126" y1="18" x2="126" y2="62" stroke="#007AFF" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
      ),
      getPanels: (w) => {
        const sec = Math.round(w / 5 * 10) / 10;
        return [
          { name: 'Титул (1)', width: sec, ratio: 0.2 },
          { name: 'Секція 2', width: sec, ratio: 0.2 },
          { name: 'Секція 3', width: sec, ratio: 0.2 },
          { name: 'Секція 4', width: sec, ratio: 0.2 },
          { name: 'Секція 5', width: sec, ratio: 0.2 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 5 * 10) / 10, h, desc: '1/5 ширини' })
    },
    '52': {
      title: 'Гармошка (5 згинів / 6 секцій)',
      sub: '5 згинів зигзагом',
      creases: 5,
      pages: 12,
      crossSection: 'MM-зигзаг (6 секцій)',
      isometricSvg: (
        <svg width="180" height="85" viewBox="0 0 180 85" fill="none">
          <ellipse cx="90" cy="76" rx="65" ry="7" fill="rgba(0,0,0,0.04)" />
          <rect x="15" y="16" width="150" height="52" rx="2" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="40" y1="16" x2="40" y2="68" stroke="#007AFF" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="65" y1="16" x2="65" y2="68" stroke="#007AFF" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="90" y1="16" x2="90" y2="68" stroke="#007AFF" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="115" y1="16" x2="115" y2="68" stroke="#007AFF" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="140" y1="16" x2="140" y2="68" stroke="#007AFF" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="140" y="16" width="25" height="52" fill="#EFF6FF" stroke="#007AFF" strokeWidth="1.8" />
        </svg>
      ),
      getPanels: (w) => {
        const sec = Math.round(w / 6 * 10) / 10;
        return [
          { name: 'Секція 1', width: sec, ratio: 0.166 },
          { name: 'Секція 2', width: sec, ratio: 0.166 },
          { name: 'Секція 3', width: sec, ratio: 0.166 },
          { name: 'Секція 4', width: sec, ratio: 0.166 },
          { name: 'Секція 5', width: sec, ratio: 0.166 },
          { name: 'Титул (6)', width: sec, ratio: 0.166 }
        ];
      },
      getClosedDimensions: (w, h) => ({ w: Math.round(w / 6 * 10) / 10, h, desc: '1/6 ширини' })
    }
  };

  const fold = foldMap[foldCode] || foldMap['21'];
  const panels = fold.getPanels(wNum);
  const closed = fold.getClosedDimensions(wNum, hNum);


  return (
    <div className="flex flex-col justify-between w-full h-full text-left gap-3.5">
      {/* 1. Header with Title & Page count */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide m-0">
            {fold.title}
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">{fold.sub}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
            {fold.pages} сторінок
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
            {fold.creases} {fold.creases === 1 ? 'згин' : fold.creases < 5 ? 'згини' : 'згинів'}
          </span>
        </div>
      </div>

      {/* 2. 3D Model Centerpiece */}
      <div className="flex flex-col items-center justify-center py-1">
        {fold.isometricSvg}
        <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-slate-100/90 text-[11px] font-semibold text-slate-600">
          <span>Профіль згину:</span>
          <strong className="text-blue-600">{fold.crossSection}</strong>
        </div>
      </div>

      {/* 3. Clean Flat Blueprint (Розгортка листа) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>Розгортка листа:</span>
          <span className="font-bold text-slate-800 font-mono">
            {wNum} × {hNum} {unit}
          </span>
        </div>

        {/* Clean Blueprint Bar */}
        <div className="w-full flex border border-blue-300 rounded-lg overflow-hidden bg-white shadow-xs" style={{ height: '44px' }}>
          {panels.map((p, idx) => (
            <div
              key={idx}
              style={{ flex: p.ratio }}
              className={`h-full flex flex-col justify-center items-center text-center px-1 border-r border-dashed border-blue-300 last:border-r-0 ${
                idx % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-900 font-mono leading-none">
                {p.width} {unit}
              </span>
              <span className="text-[9.5px] font-medium text-slate-500 truncate w-full mt-0.5">
                {p.name}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-1">
          <span>← Зовнішня сторона</span>
          <span>Пунктир: лінії фальцювання (бігу)</span>
          <span>Внутрішня сторона →</span>
        </div>
      </div>

      {/* 4. Closed Dimensions & Rotation */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">У складеному вигляді:</span>
          <span className="font-extrabold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {closed.w} × {closed.h} {unit}
          </span>
          <span className="text-slate-400 font-medium text-[11px]">({closed.desc})</span>
        </div>

        <button
          type="button"
          onClick={toggleOrientation}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 shadow-xs transition-all"
        >
          <span></span>
          <span>{orientation === 'horiz' ? 'Горизонтальний' : 'Вертикальний'}</span>
        </button>
      </div>
    </div>
  );
};

// Clean restored Calculator version 1.0.5
export const Calculator: React.FC = () => {
  const { clients, materials, norms, addOrder, currentUser, updateNorms } = useApp();

  // Selection step: 'catalog' | 'editor'
  const [step, setStep] = useState<'catalog' | 'editor'>('catalog');
  
  // Main Category Tab: 'products' | 'offset' | 'digital' | 'wide' | 'roll' | 'films' | 'notebooks'
  const [mainCategoryTab, setMainCategoryTab] = useState<'products' | 'offset' | 'digital' | 'wide' | 'roll' | 'films'>('products');

  // Sub-tabs in Offset printing: 'overview' | 'sheets' | 'felling' | 'multipage' | 'custom'
  const [offsetSubTab, setOffsetSubTab] = useState<'overview' | 'sheets' | 'felling' | 'multipage' | 'notebooks' | 'custom'>('overview');

  // Sheet Offset Calculator specific states
  const [sheetSizePreset, setSheetSizePreset] = useState<string>('1'); // Default Business Card 90x50
  const [sheetCustomWidth, setSheetCustomWidth] = useState<string>('90');
  const [sheetCustomHeight, setSheetCustomHeight] = useState<string>('50');
  const [sheetUnit, setSheetUnit] = useState<'mm' | 'cm'>('mm');
  const [sheetOrientation, setSheetOrientation] = useState<'horiz' | 'vert'>('horiz');
  const [cardKind, setCardKind] = useState<string>('1'); // '1': Стандартні, '2': Квадратні, '6': Складні, '7': Круг, '8': Овал, '9': Заокругленні кути

  // Die-cut (Felling) Offset Calculator specific states
  const [fellingForm, setFellingForm] = useState<string>('1'); // '1': Стандартна, '2': Кругла, '3': Овальна, '4': Прямокутна, '5': Етикетка
  const [fellingStamp, setFellingStamp] = useState<string>('160'); // Default stamp '160' (Будинок)

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
  const [multiCustomWidth, setMultiCustomWidth] = useState<string>('99');
  const [multiCustomHeight, setMultiCustomHeight] = useState<string>('210');
  const [multiOrientation, setMultiOrientation] = useState<'vert' | 'horiz'>('vert');
  const [multiScobaCount, setMultiScobaCount] = useState<string>('2');
  const [multiCoverLam, setMultiCoverLam] = useState<string>('0');
  const [multiBlockLam, setMultiBlockLam] = useState<string>('0');
  const [multiInsertLam, setMultiInsertLam] = useState<string>('0');
  const [multiPerforation, setMultiPerforation] = useState<string>('0');
  const [multiPetPacking, setMultiPetPacking] = useState<string>('0');
  const [multiWithDelivery, setMultiWithDelivery] = useState<boolean>(false);
  const [multiPerPiece, setMultiPerPiece] = useState<boolean>(false);

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

  // Roll Label Calculator specific states
  const [rollWidth, setRollWidth] = useState<string>('25');
  const [rollHeight, setRollHeight] = useState<string>('25');
  const [rollQuantity, setRollQuantity] = useState<number>(1000);
  const [rollGap, setRollGap] = useState<string>('4');
  const [rollCore, setRollCore] = useState<string>('76');
  const [rollOrientation, setRollOrientation] = useState<string>('1');
  const [rollMaterial, setRollMaterial] = useState<string>('209');
  const [rollColor, setRollColor] = useState<string>('1');
  const [rollCoating, setRollCoating] = useState<string>('0');

  // Mega Menu Interactive Dropdown States
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState<boolean>(false);
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [hoveredMegaProduct, setHoveredMegaProduct] = useState<string>('cards');

  // Sub-tabs in Digital printing: 'overview' | 'sheets' | 'felling' | 'multipage' | 'custom' | 'mounted' | 'in_sheets' | 'pouch_lam' | 'plotter_cut' | 'die_cut_custom' | 'folders'
  const [digitalSubTab, setDigitalSubTab] = useState<'overview' | 'sheets' | 'felling' | 'multipage' | 'notebooks' | 'custom' | 'mounted' | 'in_sheets' | 'pouch_lam' | 'plotter_cut' | 'die_cut_custom' | 'folders'>('overview');

  // Digital Specific States
  const [digitalMountedLayers, setDigitalMountedLayers] = useState<'2' | '3' | '4'>('2');
  const [digitalMountedCore, setDigitalMountedCore] = useState<string>('black');
  const [digitalInSheetsFormat, setDigitalInSheetsFormat] = useState<'sra3' | 'sra3_plus' | 'banner'>('sra3');
  const [digitalPouchThickness, setDigitalPouchThickness] = useState<'125' | '175' | '250'>('125');
  const [digitalPouchFormat, setDigitalPouchFormat] = useState<string>('a4');
  const [digitalPlotterMaterial, setDigitalPlotterMaterial] = useState<string>('raflatac_paper');
  const [digitalPlotterCutType, setDigitalPlotterCutType] = useState<'kiss_cut' | 'through_cut'>('kiss_cut');
  const [digitalCncType, setDigitalCncType] = useState<'package' | 'folder' | 'wobbler' | 'custom_shape'>('custom_shape');

  // Digital Sheets Specific Detailed States (as shown in reference)
  const digitalSheetSets = 1;
  const [digitalSheetWithDelivery, setDigitalSheetWithDelivery] = useState<boolean>(false);
  const [digitalSheetPerPiece, setDigitalSheetPerPiece] = useState<boolean>(false);
  const [digitalSheetCornerCurve, setDigitalSheetCornerCurve] = useState<string>('0');
  const [digitalSheetDrilling, setDigitalSheetDrilling] = useState<string>('0');
  const [digitalSheetLuvers, setDigitalSheetLuvers] = useState<string>('0');
  const [digitalSheetPersonalization, setDigitalSheetPersonalization] = useState<string>('0');
  const [digitalSheetFolding, setDigitalSheetFolding] = useState<string>('0');
  const [digitalSheetGluingBlock, setDigitalSheetGluingBlock] = useState<string>('0');

  // Multi-selection Filter States for Digital Sheets & Felling (Matching Offset Style)
  const [digitalSelectedMaterials, setDigitalSelectedMaterials] = useState<string[]>(['300']);
  const [digitalSelectedCoverings, setDigitalSelectedCoverings] = useState<string[]>(['0']);
  const [digitalSelectedPrints, setDigitalSelectedPrints] = useState<string[]>(['4+4']);

  const [fellingSelectedMaterials, setFellingSelectedMaterials] = useState<string[]>(['350']);
  const [fellingSelectedCoverings, setFellingSelectedCoverings] = useState<string[]>(['0']);
  const [fellingSelectedPrints, setFellingSelectedPrints] = useState<string[]>(['4+4']);

  // Wide Format Specific States
  const [wideSubTab, setWideSubTab] = useState<'overview' | 'banner' | 'film' | 'paper' | 'custom' | 'pvc' | 'foam_board' | 'composite' | 'acrylic' | 'canvas' | 'stands'>('overview');
  const [wideWidth, setWideWidth] = useState<string>('2000');
  const [wideHeight, setWideHeight] = useState<string>('1000');
  const [wideUnit, setWideUnit] = useState<'mm' | 'cm' | 'm'>('mm');
  const wideSets = 1;
  const [wideWithDelivery, setWideWithDelivery] = useState<boolean>(false);
  const [widePriceCostVar, setWidePriceCostVar] = useState<'per_tirazh' | 'per_sqm' | 'per_item'>('per_tirazh');

  // Wide Format Post-Press States
  const [wideLuvers, setWideLuvers] = useState<string>('30cm');
  const [wideHemming, setWideHemming] = useState<string>('perimeter');
  const [widePocket, setWidePocket] = useState<string>('0');
  const [wideLamination, setWideLamination] = useState<string>('0');
  const [widePlotterCut, setWidePlotterCut] = useState<string>('0');
  const [wideMountFilm, setWideMountFilm] = useState<string>('0');
  const [wideMilling, setWideMilling] = useState<string>('0');
  const [wideHolders, setWideHolders] = useState<string>('0');
  const [wideTape3M, setWideTape3M] = useState<string>('0');
  const [wideStretcher, setWideStretcher] = useState<string>('gallery');
  const [wideArtGel, setWideArtGel] = useState<string>('0');
  const [wideStandModel, setWideStandModel] = useState<string>('rollup_80x200');

  // Multi-selection Filter States for Wide Format
  const [wideSelectedMaterials, setWideSelectedMaterials] = useState<string[]>(['frontlit_440']);
  const [wideSelectedResolutions, setWideSelectedResolutions] = useState<string[]>(['1440']);

  // Notepad (Блокноти) State Hooks
  const [notebookPrintMethod, setNotebookPrintMethod] = useState<'digital' | 'offset'>('digital');
  const [notebookStandardSize, setNotebookStandardSize] = useState<string>('105x148');
  const [notebookWidth, setNotebookWidth] = useState<string>('105');
  const [notebookHeight, setNotebookHeight] = useState<string>('148');
  const [notebookUnit, setNotebookUnit] = useState<'mm' | 'cm'>('mm');

  const [notebookSpringColor, setNotebookSpringColor] = useState<string>('white'); // 'white', 'black', 'silver'
  const [notebookBindingSide, setNotebookBindingSide] = useState<string>('short'); // 'short' (по короткій), 'long' (по довгій)

  const [notebookCoverPages, setNotebookCoverPages] = useState<string>('2'); // '2' (1 аркуш), '4' (2 аркуші)
  const [notebookCoverMaterial, setNotebookCoverMaterial] = useState<string>('coat_300'); // 'coat_300', 'coat_350', 'coat_450', 'kraft_275', 'card_250', 'mondi_300', 'dali_285', 'flora_350'
  const [notebookCoverCovering, setNotebookCoverCovering] = useState<string>('none'); // 'none', 'gloss_10', 'gloss_11', 'mat_10', 'mat_11', 'soft_touch', 'antiscaf'
  const [notebookCoverPrint, setNotebookCoverPrint] = useState<string>('4+4'); // '4+4', '4+0', '1+0', '1+1', '0+0'

  const [notebookBlockPages, setNotebookBlockPages] = useState<number>(50); // 25, 50, 80, 100
  const [notebookBlockMaterial, setNotebookBlockMaterial] = useState<string>('offset_80'); // 'offset_80', 'offset_70', 'coat_90', 'kraft_80'
  const [notebookBlockPrint, setNotebookBlockPrint] = useState<string>('4+4'); // '4+4', '4+0', '1+0', '1+1', '0+0'

  const [notebookInsert, setNotebookInsert] = useState<string>('none'); // 'none', '1', '2'
  const [notebookInsertMaterial, setNotebookInsertMaterial] = useState<string>('coat_80');
  const [notebookInsertCovering, setNotebookInsertCovering] = useState<string>('none');
  const [notebookInsertPrint, setNotebookInsertPrint] = useState<string>('4+4');

  const [notebookBackPages, setNotebookBackPages] = useState<string>('2'); // '2', '4', '0'
  const [notebookBackMaterial, setNotebookBackMaterial] = useState<string>('coat_300');
  const [notebookBackCovering, setNotebookBackCovering] = useState<string>('none');
  const [notebookBackPrint, setNotebookBackPrint] = useState<string>('4+4');

  const [notebookPerforation, setNotebookPerforation] = useState<string>('no'); // 'no', 'yes'
  const [notebookPerforationScope, setNotebookPerforationScope] = useState<string>('1'); // '1', 'all'
  const [notebookPackaging, setNotebookPackaging] = useState<string>('no'); // 'no', 'yes'

  const [notebookWithDelivery, setNotebookWithDelivery] = useState<boolean>(false);
  const [notebookPriceCostVar, setNotebookPriceCostVar] = useState<'per_tirazh' | 'per_item'>('per_tirazh');

  // Helper to transition into specific offset product calculator
  const openOffsetProduct = (params: {
    category: any;
    subCategory?: string;
    subTab?: 'sheets' | 'felling' | 'multipage' | 'notebooks' | 'custom';
    preset?: string;
    w?: string;
    h?: string;
    kind?: string;
    stitching?: string;
    stamp?: string;
    folderSpine?: '0' | '5' | '7';
    folderRezinka?: 'none' | 'blue' | 'red' | 'white' | 'black';
    envelopeFormat?: 'E65' | 'C6' | 'C5' | 'C4';
    materials?: string[];
    coverings?: string[];
    prints?: string[];
  }) => {
    setMainCategoryTab('offset');
    setOffsetSubTab(params.subTab || 'sheets');
    setCategory(params.category);
    if (params.category === 'Буклети') {
      setTurnType('chuzhyi_oborut');
    }
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

    // Set intelligent product-specific single defaults
    if (params.materials) {
      setSelectedMaterials(params.materials);
    } else if (params.category === 'Візитки') {
      setSelectedMaterials(['350']);
    } else if (params.category === 'Флаєри' || params.category === 'Буклети') {
      setSelectedMaterials(['130']);
    } else if (params.category === 'Листівки') {
      setSelectedMaterials(['300']);
    } else if (params.category === 'Плакати') {
      setSelectedMaterials(['130']);
    } else if (params.category === 'Бланки' || params.category === 'Сети') {
      setSelectedMaterials(['80']);
    } else if (params.category === 'Календарі кишенькові') {
      setSelectedMaterials(['350']);
    } else if (params.category === 'Папки') {
      setSelectedMaterials(['350']);
    } else {
      setSelectedMaterials(['300']);
    }

    if (params.coverings) {
      setSelectedCoverings(params.coverings);
    } else if (params.category === 'Календарі кишенькові') {
      setSelectedCoverings(['10']);
    } else if (params.category === 'Папки') {
      setSelectedCoverings(['9']);
    } else {
      setSelectedCoverings(['0']);
    }

    if (params.prints) {
      setSelectedPrintColors(params.prints);
    } else if (params.category === 'Плакати' || params.category === 'Бланки' || params.category === 'Папки') {
      setSelectedPrintColors(['4+0']);
    } else {
      setSelectedPrintColors(['4+4']);
    }

    setSelectedSheetCalc(null);
  };

  // Postpress options states
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

  const sheetSetsCount = 1;

  // Filters for Sheet Calculator
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['300']);
  const [selectedCoverings, setSelectedCoverings] = useState<string[]>(['0']);
  const [selectedPrintColors, setSelectedPrintColors] = useState<string[]>(['4+4']);

  // Table options
  const [includeDelivery, setIncludeDelivery] = useState<boolean>(false);
  const [priceCostVar, setPriceCostVar] = useState<'per_item' | 'per_tirazh'>('per_tirazh');
  const [selectedSheetCalc, setSelectedSheetCalc] = useState<{
    matId: string;
    matName: string;
    covId: string;
    covName: string;
    colStr: string;
    tirazh: number;
    basePaperCost: number;
    printCost: number;
    lamCost: number;
    postpressSum: number;
    deliveryCost: number;
    rawCost: number;
    finalPrice: number;
    unitPrice: number;
  } | null>(null);

  // Active info modal state ('instruction' | 'terms' | 'materials' | 'samples' | 'review' | 'bug' | null)
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

  // Calculation mode: 'auto' (Adapted Business Logic) | 'operations' (Pooperatsiyniy 1C)
  const [calcMode, setCalcMode] = useState<'auto' | 'operations'>('auto');

  // Input states
  const [orderNumber, setOrderNumber] = useState<number>(() => Math.floor(10000 + Math.random() * 90000));
  const [subCategory, setSubCategory] = useState<'Бланки' | 'Листівки'>('Бланки');
  const [name, setName] = useState('');
  const [customTitleMap, setCustomTitleMap] = useState<Record<string, string>>({});
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
  const [customClientName, setCustomClientName] = useState<string>('');
  const [isNewClientMode, setIsNewClientMode] = useState<boolean>(false);
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

  // Automatically activate postpress operations when relevant options are configured
  useEffect(() => {
    setActiveOps(prev => {
      let updated = false;
      const next = { ...prev };
      
      if (laminationType !== 'none' && !next.lamination) {
        next.lamination = true;
        updated = true;
      }
      if (creaseCount > 0 && !next.folding) {
        next.folding = true;
        updated = true;
      }
      if (['staple', 'spring', 'glue', 'hardcover'].includes(bindingType) && !next.blockInsertion) {
        next.blockInsertion = true;
        updated = true;
      }
      if (bindingType === 'hardcover' && !next.coverMaking) {
        next.coverMaking = true;
        updated = true;
      }
      
      return updated ? next : prev;
    });
  }, [bindingType, laminationType, creaseCount]);

  // Templates list
  const [templates, setTemplates] = useState<CalcTemplate[]>(() => {
    const saved = localStorage.getItem('crm_calc_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [templateName, setTemplateName] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMaterialPricesModal, setShowMaterialPricesModal] = useState(false);
  const [materialPricesTab, setMaterialPricesTab] = useState<'paper' | 'postpress' | 'print'>('paper');

  const [showNorms, setShowNorms] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [tempNorms, setTempNorms] = useState(norms);

  // Material Pricing & Custom Rates state
  const [materialPrices, setMaterialPrices] = useState<MaterialPriceItem[]>(() => {
    const saved = localStorage.getItem('crm_custom_materials_pricing');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultMaterialPrices;
  });
  const [materialPriceCategory, setMaterialPriceCategory] = useState<string>('all');
  const [materialSearch, setMaterialSearch] = useState<string>('');
  const [materialSavedToast, setMaterialSavedToast] = useState<boolean>(false);
  const [customPaperPrice, setCustomPaperPrice] = useState<string>('');

  const isAdmin = currentUser?.role === 'admin';

  const activeClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const effectiveClientName = isNewClientMode && customClientName.trim() 
    ? customClientName.trim() 
    : (activeClient?.name || 'Замовник');

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
    setCalcMode('auto');
    
    if (cat === 'Бланки') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('34');
      setSheetCustomWidth('210');
      setSheetCustomHeight('297');
      setCardKind('1');
      setQuantity(1000);
      setPaperType('offset');
      setColors('1+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('none');
      setName('Бланки А4');
      setSubCategory('Бланки');
      setSelectedMaterials(['offset_70']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['1+0']);
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
    } else if (cat === 'Візитки') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('1');
      setSheetCustomWidth('90');
      setSheetCustomHeight('50');
      setCardKind('1');
      setQuantity(100);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('90x50 мм');
      setBindingType('none');
      setLaminationType('matte');
      setSelectedMaterials(['350']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['4+4']);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
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
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setTurnType('chuzhyi_oborut');
      setSheetSizePreset('34');
      setSheetCustomWidth('210');
      setSheetCustomHeight('297');
      setCardKind('6');
      setQuantity(500);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('none');
      setCreaseCount(2);
      setSelectedMaterials(['130']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['4+4']);
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
    } else if (cat === 'Дипломи випускні') {
      setStep('editor');
      setQuantity(50);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('gloss');
      setSelectedMaterials(['350']);
      setSelectedCoverings(['7']);
      setSelectedPrintColors(['4+0']);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: true,
        dieCutting: false,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Календарики кишенькові') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('91');
      setSheetCustomWidth('100');
      setSheetCustomHeight('70');
      setCardKind('1');
      setQuantity(500);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('70x100 мм');
      setBindingType('none');
      setLaminationType('gloss');
      setSelectedMaterials(['350']);
      setSelectedCoverings(['8', '10']);
      setSelectedPrintColors(['4+4']);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: true,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Книги') {
      setMainCategoryTab('offset');
      setOffsetSubTab('multipage');
      setStep('catalog');
      setMultiStitching('1');
      setQuantity(200);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A5');
      setBindingType('staple');
      setLaminationType('gloss');
      setSelectedMaterials(['80']);
      setSelectedCoverings(['0', '7']);
      setSelectedPrintColors(['1+1', '4+4']);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: false,
        folding: true,
        blockInsertion: true,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Листівки') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('32');
      setSheetCustomWidth('148');
      setSheetCustomHeight('210');
      setCardKind('1');
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A5');
      setBindingType('none');
      setLaminationType('none');
      setSelectedMaterials(['130']);
      setSelectedCoverings(['0', '7', '9']);
      setSelectedPrintColors(['4+4']);
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
    } else if (cat === 'Сети') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('sets_a3');
      setSheetCustomWidth('420');
      setSheetCustomHeight('297');
      setCardKind('1');
      setQuantity(1000);
      setPaperType('offset');
      setColors('1+0');
      setSelectedFormat('A3');
      setBindingType('none');
      setLaminationType('none');
      setSelectedMaterials(['offset_70']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['1+0']);
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
    } else if (cat === 'Папки') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('34');
      setSheetCustomWidth('210');
      setSheetCustomHeight('297');
      setFolderSpine('5');
      setQuantity(100);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('matte');
      setSelectedMaterials(['350']);
      setSelectedCoverings(['0', '9', '30']);
      setSelectedPrintColors(['4+0', '4+4']);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: true,
        folding: true,
        blockInsertion: false,
        coverMaking: true,
        blockProcessing: true
      });
    } else if (cat === 'Блокноти') {
      setMainCategoryTab('offset');
      setOffsetSubTab('notebooks');
      setNotebookPrintMethod('offset');
      setStep('catalog');
      setNotebookStandardSize('105x148');
      setNotebookWidth('105');
      setNotebookHeight('148');
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
    } else if (cat === 'Меню') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('34');
      setSheetCustomWidth('210');
      setSheetCustomHeight('297');
      setQuantity(30);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('A4');
      setBindingType('spring');
      setLaminationType('matte');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: true,
        folding: false,
        blockInsertion: true,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Наклейки') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('1');
      setSheetCustomWidth('90');
      setSheetCustomHeight('50');
      setCardKind('1');
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('gloss');
      setSelectedMaterials(['sk_kreyd_pros']);
      setSelectedCoverings(['0', '7', '9']);
      setSelectedPrintColors(['4+0']);
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: true,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Плакати') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('36');
      setSheetCustomWidth('297');
      setSheetCustomHeight('420');
      setCardKind('1');
      setQuantity(100);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A3');
      setBindingType('none');
      setLaminationType('none');
      setSelectedMaterials(['130']);
      setSelectedCoverings(['0']);
      setSelectedPrintColors(['4+0']);
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
    } else if (cat === 'Флаєри') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('25');
      setSheetCustomWidth('99');
      setSheetCustomHeight('210');
      setCardKind('1');
      setQuantity(1000);
      setPaperType('coated');
      setColors('4+4');
      setSelectedFormat('Euro');
      setBindingType('none');
      setLaminationType('none');
      setSelectedMaterials(['130']);
      setSelectedCoverings(['0', '7', '9']);
      setSelectedPrintColors(['4+4']);
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
    } else if (cat === 'Нотаріальні книги') {
      setStep('editor');
      setQuantity(10);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A4');
      setBindingType('hardcover');
      setLaminationType('none');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: false,
        embossing: true,
        dieCutting: false,
        folding: true,
        blockInsertion: true,
        coverMaking: true,
        blockProcessing: true
      });
    } else if (cat === 'Дипломи і палітурка') {
      setStep('editor');
      setQuantity(20);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('hardcover');
      setLaminationType('matte');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: true,
        dieCutting: false,
        folding: true,
        blockInsertion: true,
        coverMaking: true,
        blockProcessing: true
      });
    } else if (cat === 'Логотипи виготовлення') {
      setStep('editor');
      setQuantity(100);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('A4');
      setBindingType('none');
      setLaminationType('softtouch');
      setActiveOps({
        formMaking: false,
        filmMounting: true,
        printing: true,
        lamination: true,
        embossing: false,
        dieCutting: true,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Шкільні журнали') {
      setStep('editor');
      setQuantity(50);
      setPaperType('offset');
      setColors('1+1');
      setSelectedFormat('A4');
      setBindingType('hardcover');
      setLaminationType('none');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: false,
        embossing: false,
        dieCutting: false,
        folding: true,
        blockInsertion: true,
        coverMaking: true,
        blockProcessing: true
      });
    } else if (cat === 'Етикетки') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('1');
      setSheetCustomWidth('90');
      setSheetCustomHeight('50');
      setCardKind('1');
      setQuantity(2000);
      setPaperType('coated');
      setColors('4+0');
      setSelectedFormat('90x50 мм');
      setBindingType('none');
      setLaminationType('none');
      setActiveOps({
        formMaking: true,
        filmMounting: true,
        printing: true,
        lamination: false,
        embossing: false,
        dieCutting: true,
        folding: false,
        blockInsertion: false,
        coverMaking: false,
        blockProcessing: true
      });
    } else if (cat === 'Календарі') {
      setMainCategoryTab('offset');
      setOffsetSubTab('sheets');
      setStep('catalog');
      setSheetSizePreset('36');
      setSheetCustomWidth('297');
      setSheetCustomHeight('420');
      setCardKind('1');
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
        lamination: true,
        embossing: false,
        dieCutting: false,
        folding: false,
        blockInsertion: true,
        coverMaking: false,
        blockProcessing: true
      });
    } else {
      // Бланки standard
      setStep('editor');
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

    if (customPaperPrice.trim() !== '') {
      const parsedCustom = parseFloat(customPaperPrice.replace(',', '.'));
      if (!isNaN(parsedCustom) && parsedCustom >= 0) {
        paperPrice = parsedCustom;
      }
    }
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
  }, [quantity, paperType, colors, designCost, norms, packingCount, marginPercent, activeOps, opCustomRates, opVolumes, category, calcMode, selectedFormat, bindingType, laminationType, creaseCount, customPaperPrice]);

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

    const safeClient = (effectiveClientName || 'Замовник').replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_');
    const safeProd = (category === 'Бланки' ? subCategory : (category as string) || 'Продукція').replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_');
    const fileName = `№${orderNumber}_Рахунок_${safeProd}_${safeClient}.pdf`;

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
      margin:       [8, 8, 8, 8] as [number, number, number, number],
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


  const renderNotebooksCalculator = (parentTab: 'offset' | 'digital') => {

            const wNum = Number(notebookWidth || 105);
            const hNum = Number(notebookHeight || 148);
            const mult = notebookUnit === 'mm' ? 1 : 10;
            const wMm = wNum * mult;
            const hMm = hNum * mult;

            const formatTitle = (wMm === 105 && hMm === 148) ? 'А6' : 
                                (wMm === 148 && hMm === 210) ? 'А5' : 
                                (wMm === 210 && hMm === 297) ? 'А4' : 
                                (wMm === 99 && hMm === 210) ? 'Євро' : 
                                (wMm === 105 && hMm === 105) ? 'Квадрат А6' : 
                                (wMm === 148 && hMm === 148) ? 'Квадрат А5' : 
                                (wMm === 210 && hMm === 210) ? 'Квадрат А4' : 'Свій розмір';

            const blockThickness = (notebookBlockPages || 50) * 0.1;
            const coverThickness = (Number(notebookCoverPages) / 2) * 0.28;
            const backThickness = notebookBackPages === '0' ? 0 : (Number(notebookBackPages) / 2) * 0.28;
            const insertThickness = (notebookInsert === 'none' ? 0 : Number(notebookInsert)) * 0.09;
            const totalSpineThickness = (blockThickness + coverThickness + backThickness + insertThickness + 0.38).toFixed(2);
            
            const totalSheets = (notebookBlockPages || 50) + (Number(notebookCoverPages)/2) + (notebookBackPages === '0' ? 0 : Number(notebookBackPages)/2) + (notebookInsert === 'none' ? 0 : Number(notebookInsert));
            const spiralPitch = Number(totalSpineThickness) <= 6.5 ? '3:1' : Number(totalSpineThickness) <= 12 ? '3:1' : '2:1';

            const springFill = notebookSpringColor === 'white' ? '#FFFFFF' : notebookSpringColor === 'black' ? '#1E293B' : '#94A3B8';
            const springStroke = notebookSpringColor === 'white' ? '#CBD5E1' : notebookSpringColor === 'black' ? '#0F172A' : '#64748B';

            const getFormattedFutureDate = (daysToAdd: number) => {
              const d = new Date();
              d.setDate(d.getDate() + daysToAdd);
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const weekdays = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
              const dayName = weekdays[d.getDay()];
              return `${day}.${month}, ${dayName}`;
            };

            const computeNotepadPrice = (qty: number, days: number): number => {
              const areaFactor = Math.max(0.6, (wMm * hMm) / (105 * 148));
              const blockSheets = notebookBlockPages || 50;

              // Cover
              let coverMatCost = 3.0;
              if (notebookCoverMaterial === 'coat_350') coverMatCost = 3.8;
              else if (notebookCoverMaterial === 'coat_450') coverMatCost = 5.2;
              else if (notebookCoverMaterial === 'kraft_275') coverMatCost = 4.2;
              else if (notebookCoverMaterial === 'card_250') coverMatCost = 3.6;
              else if (notebookCoverMaterial === 'mondi_300') coverMatCost = 6.0;
              else if (notebookCoverMaterial === 'dali_285') coverMatCost = 7.5;
              else if (notebookCoverMaterial === 'flora_350') coverMatCost = 8.0;

              let coverPrintCost = 5.0;
              if (notebookCoverPrint === '4+0') coverPrintCost = 3.2;
              else if (notebookCoverPrint === '1+0') coverPrintCost = 1.4;
              else if (notebookCoverPrint === '1+1') coverPrintCost = 2.0;
              else if (notebookCoverPrint === '0+0') coverPrintCost = 0.0;

              let coverLamCost = 0;
              if (notebookCoverCovering === 'gloss_10' || notebookCoverCovering === 'mat_10') coverLamCost = 2.4;
              else if (notebookCoverCovering === 'gloss_11' || notebookCoverCovering === 'mat_11') coverLamCost = 4.4;
              else if (notebookCoverCovering === 'soft_touch') coverLamCost = 6.0;
              else if (notebookCoverCovering === 'antiscaf') coverLamCost = 7.0;

              const unitCover = (coverMatCost + coverPrintCost + coverLamCost) * areaFactor;

              // Block
              let blockMatCost = 0.12;
              if (notebookBlockMaterial === 'offset_70') blockMatCost = 0.10;
              else if (notebookBlockMaterial === 'coat_90') blockMatCost = 0.18;
              else if (notebookBlockMaterial === 'kraft_80') blockMatCost = 0.20;

              let blockPrintCost = 0.28;
              if (notebookBlockPrint === '4+0') blockPrintCost = 0.18;
              else if (notebookBlockPrint === '1+1') blockPrintCost = 0.10;
              else if (notebookBlockPrint === '1+0') blockPrintCost = 0.06;
              else if (notebookBlockPrint === '0+0') blockPrintCost = 0.0;

              const unitBlock = blockSheets * (blockMatCost + blockPrintCost) * areaFactor;

              // Backing
              let unitBack = 0;
              if (notebookBackPages !== '0') {
                unitBack = (2.8 + (notebookBackPrint === '4+4' ? 4.0 : notebookBackPrint === '4+0' ? 2.5 : 0) + (notebookBackCovering !== 'none' ? 2.2 : 0)) * areaFactor;
              }

              // Insert
              let unitInsert = 0;
              if (notebookInsert === '1') unitInsert = 3.0 * areaFactor;
              else if (notebookInsert === '2') unitInsert = 5.5 * areaFactor;

              // Spring, punching & binding
              const unitSpring = 15.0 * (wMm > 160 || hMm > 230 ? 1.35 : 1.0);

              // Extra finishing
              const unitPerf = notebookPerforation === 'yes' ? 3.5 : 0;
              const unitPack = notebookPackaging === 'yes' ? 2.8 : 0;

              // Total raw unit cost
              const rawUnit = unitCover + unitBlock + unitBack + unitInsert + unitSpring + unitPerf + unitPack;

              // Setup base overhead
              const setupCost = notebookPrintMethod === 'digital' ? 320 : 650;

              let tierMultiplier = 1.0;
              if (qty === 1) tierMultiplier = 1.0;
              else if (qty === 25) tierMultiplier = 0.65;
              else if (qty === 50) tierMultiplier = 0.62;
              else if (qty === 75) tierMultiplier = 0.60;
              else if (qty === 100) tierMultiplier = 0.57;
              else if (qty === 200) tierMultiplier = 0.55;
              else if (qty === 500) tierMultiplier = 0.53;

              let baseTotal = (setupCost + (rawUnit * qty * 3.8)) * tierMultiplier;
              if (days === 2) baseTotal *= 1.20;
              if (notebookWithDelivery) baseTotal += 90;

              return Math.round(baseTotal * 100) / 100;
            };

            const handleAddNotepadToOrder = (qty: number, days: number, price: number) => {
              const specNotes = `Блокнот ${formatTitle} (${wMm}×${hMm} мм), ${notebookBlockPages} аркушів (${notebookBlockMaterial}, ${notebookBlockPrint}), Обкладинка: ${notebookCoverPages} стор (${notebookCoverMaterial}, ламінація: ${notebookCoverCovering}, друк: ${notebookCoverPrint}), Пружина: ${notebookSpringColor} (${notebookBindingSide === 'short' ? 'по короткій' : 'по довгій'}), Підкладка: ${notebookBackMaterial}, Перфорація: ${notebookPerforation === 'yes' ? 'Так' : 'Ні'}, Пакування: ${notebookPackaging === 'yes' ? 'ПЕТ' : 'Ні'}, Термін: ${days} дні`;

              addOrder({
                name: `№ ${orderNumber} - Блокнот ${formatTitle} (${qty} шт)`,
                clientId: selectedClientId || clients[0]?.id || '1',
                category: 'Блокноти',
                quantity: qty,
                packingCount: 1,
                paperType: 'offset',
                colors: notebookBlockPrint,
                isSamNaSebe: false,
                designCost: 0,
                margin: 20,
                machine: notebookPrintMethod === 'digital' ? 'Цифровий друк' : 'Офсетний друк',
                format: formatTitle,
                physicalSheets: qty * notebookBlockPages,
                itemsPerSheet: 1,
                subtotal: Math.round(price * 0.8),
                marginAmount: Math.round(price * 0.2),
                finalPrice: Math.round(price),
                unitPrice: Number((price / qty).toFixed(2)),
                paymentStatus: 'unpaid',
                prepayment: 0,
                notes: specNotes
              });

              alert(`Блокноти (${qty} шт, ${formatTitle}) на суму ${price.toFixed(2)} ₴ успішно додано до замовлень!`);
              const nextOrderNum = Math.floor(10000 + Math.random() * 90000);
              setOrderNumber(nextOrderNum);
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header & 6 Info Links */}
                <div className="flex flex-col gap-3">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-dark)', margin: 0 }}>
                      Блокноти
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => parentTab === 'offset' ? setOffsetSubTab('overview') : setDigitalSubTab('overview')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '0.5px solid var(--border-light)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-dark)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {parentTab === 'offset' ? '← Всі 18 категорій' : '← Всі 11 категорій'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Спосіб виготовлення */}
                <div>
                  <h3 style={{ fontSize: '12.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                    Спосіб виготовлення
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {/* ЦИФРОВИЙ ДРУК */}
                    <div
                      onClick={() => setNotebookPrintMethod('digital')}
                      style={{
                        borderRadius: '8px',
                        border: notebookPrintMethod === 'digital' ? '2px solid #C00000' : '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: notebookPrintMethod === 'digital' ? '0 4px 14px rgba(192, 0, 0, 0.12)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        backgroundColor: notebookPrintMethod === 'digital' ? '#C00000' : '#F1F5F9',
                        color: notebookPrintMethod === 'digital' ? '#FFFFFF' : '#334155',
                        padding: '8px 16px',
                        fontWeight: '800',
                        fontSize: '13px',
                        letterSpacing: '0.5px'
                      }}>
                        ЦИФРОВИЙ ДРУК
                      </div>
                      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                            ⏱ Друк за 3 години
                          </span>
                          <span style={{ backgroundColor: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                            📄 від 1 екземпляра
                          </span>
                        </div>
                        <ul style={{ margin: '4px 0 0 0', padding: 0, listStyle: 'none', fontSize: '11.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: '1.4' }}>
                          <li>— Стандартні та ексклюзивні матеріали</li>
                          <li>— Ламінація глянцева, матова, Soft Velvet з ефектом пластика Soft-touch, Antiscaf стійка до царапин, щільна конвертна</li>
                          <li>— Персоналізація номером або текстом</li>
                        </ul>
                      </div>
                    </div>

                    {/* ОФСЕТНИЙ ДРУК */}
                    <div
                      onClick={() => setNotebookPrintMethod('offset')}
                      style={{
                        borderRadius: '8px',
                        border: notebookPrintMethod === 'offset' ? '2px solid #C00000' : '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: notebookPrintMethod === 'offset' ? '0 4px 14px rgba(192, 0, 0, 0.12)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        backgroundColor: notebookPrintMethod === 'offset' ? '#C00000' : '#E2E8F0',
                        color: notebookPrintMethod === 'offset' ? '#FFFFFF' : '#334155',
                        padding: '8px 16px',
                        fontWeight: '800',
                        fontSize: '13px',
                        letterSpacing: '0.5px'
                      }}>
                        ОФСЕТНИЙ ДРУК
                      </div>
                      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ backgroundColor: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                            ⏱ Друк на завтра
                          </span>
                          <span style={{ backgroundColor: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                            📄 Від 100 екземплярів
                          </span>
                        </div>
                        <ul style={{ margin: '4px 0 0 0', padding: 0, listStyle: 'none', fontSize: '11.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: '1.4' }}>
                          <li>— Стандартні матеріали</li>
                          <li>— Ламінація глянцева, матова</li>
                          <li>— УФ лак, гібридний вибірковий лак</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Розмір & Visual Preview */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                  alignItems: 'center'
                }}>
                  {/* Left Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0 }}>
                      Розмір
                    </h3>

                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
                        Оберіть стандартний:
                      </label>
                      <select
                        value={notebookStandardSize}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNotebookStandardSize(val);
                          if (val !== 'custom') {
                            const [w, h] = val.split('x');
                            setNotebookWidth(w);
                            setNotebookHeight(h);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#1E293B'
                        }}
                      >
                        <option value="99x210">Євро (99 × 210)</option>
                        <option value="105x148">А6 (105 × 148)</option>
                        <option value="148x210">А5 (148 × 210)</option>
                        <option value="210x297">А4 (210 × 297)</option>
                        <option value="105x105">Квадрат А6 (105 × 105)</option>
                        <option value="148x148">Квадрат А5 (148 × 148)</option>
                        <option value="210x210">Квадрат А4 (210 × 210)</option>
                        <option value="custom">Свій розмір...</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
                        Введіть свій:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={notebookWidth}
                          onChange={(e) => {
                            setNotebookWidth(e.target.value);
                            setNotebookStandardSize('custom');
                          }}
                          placeholder="Ширина"
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700' }}
                        />
                        <span style={{ fontWeight: '800', color: '#94A3B8' }}>×</span>
                        <input
                          type="number"
                          value={notebookHeight}
                          onChange={(e) => {
                            setNotebookHeight(e.target.value);
                            setNotebookStandardSize('custom');
                          }}
                          placeholder="Висота"
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700' }}
                        />
                        <select
                          value={notebookUnit}
                          onChange={(e) => setNotebookUnit(e.target.value as any)}
                          style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontSize: '12px', fontWeight: '700' }}
                        >
                          <option value="mm">мм</option>
                          <option value="cm">см</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Preview */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px dashed #CBD5E1',
                    padding: '24px 16px',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', position: 'absolute', top: '10px', left: '14px' }}>
                      Вигляд готового виробу:
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '12px' }}>
                      {/* Left Dimension */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{ width: '1px', height: '36px', backgroundColor: '#94A3B8' }}></div>
                        <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap' }}>
                          {hMm} мм
                        </span>
                        <div style={{ width: '1px', height: '36px', backgroundColor: '#94A3B8' }}></div>
                      </div>

                      {/* SVG Vector Notepad */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <svg width="180" height="220" viewBox="0 0 180 220" fill="none" style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.08))' }}>
                          <rect x="22" y="18" width="138" height="190" rx="4" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
                          <rect x="20" y="16" width="138" height="190" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                          <rect x="18" y="14" width="138" height="190" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />
                          
                          <line x1="30" y1="44" x2="144" y2="44" stroke="#F1F5F9" strokeWidth="2" />
                          <line x1="30" y1="60" x2="144" y2="60" stroke="#F1F5F9" strokeWidth="2" />
                          <line x1="30" y1="76" x2="144" y2="76" stroke="#F1F5F9" strokeWidth="2" />
                          <line x1="30" y1="92" x2="144" y2="92" stroke="#F1F5F9" strokeWidth="2" />
                          <line x1="30" y1="108" x2="144" y2="108" stroke="#F1F5F9" strokeWidth="2" />
                          <line x1="30" y1="124" x2="144" y2="124" stroke="#F1F5F9" strokeWidth="2" />
                          <line x1="30" y1="140" x2="144" y2="140" stroke="#F1F5F9" strokeWidth="2" />
                          <line x1="30" y1="156" x2="144" y2="156" stroke="#F1F5F9" strokeWidth="2" />
                          <line x1="30" y1="172" x2="144" y2="172" stroke="#F1F5F9" strokeWidth="2" />

                          <rect x="60" y="88" width="54" height="34" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
                          <text x="87" y="110" fill="#1E293B" fontSize="13.5" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                            {formatTitle}
                          </text>

                          {notebookBindingSide === 'short' ? (
                            [28, 40, 52, 64, 76, 88, 100, 112, 124, 136, 148].map((xPos, idx) => (
                              <g key={idx}>
                                <rect
                                  x={xPos - 3}
                                  y="9"
                                  width="6"
                                  height="12"
                                  rx="3"
                                  fill={springFill}
                                  stroke={springStroke}
                                  strokeWidth="1.5"
                                />
                                <circle cx={xPos} cy="18" r="1.5" fill="#334155" />
                              </g>
                            ))
                          ) : (
                            [26, 42, 58, 74, 90, 106, 122, 138, 154, 170, 186].map((yPos, idx) => (
                              <g key={idx}>
                                <rect
                                  x="13"
                                  y={yPos - 3}
                                  width="12"
                                  height="6"
                                  rx="3"
                                  fill={springFill}
                                  stroke={springStroke}
                                  strokeWidth="1.5"
                                />
                                <circle cx="22" cy={yPos} r="1.5" fill="#334155" />
                              </g>
                            ))
                          )}
                        </svg>

                        {/* Bottom Dimension */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                          <div style={{ width: '36px', height: '1px', backgroundColor: '#94A3B8' }}></div>
                          <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap' }}>
                            {wMm} мм
                          </span>
                          <div style={{ width: '36px', height: '1px', backgroundColor: '#94A3B8' }}></div>
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginTop: '8px' }}>
                      Пружина: {notebookSpringColor === 'white' ? 'Біла' : notebookSpringColor === 'black' ? 'Чорна' : 'Срібло'}, {notebookBindingSide === 'short' ? 'по короткій стороні' : 'по довгій стороні'}
                    </span>
                  </div>
                </div>

                {/* Опції */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0 }}>
                    Опції
                  </h3>

                  {/* Row 1: Пружина */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Колір пружини
                      </label>
                      <select
                        value={notebookSpringColor}
                        onChange={(e) => setNotebookSpringColor(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="white">Біла</option>
                        <option value="black">Чорна</option>
                        <option value="silver">Срібло</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Сторона зшивання
                      </label>
                      <select
                        value={notebookBindingSide}
                        onChange={(e) => setNotebookBindingSide(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="short">Зшивання по короткій стороні</option>
                        <option value="long">Зшивання по довгій стороні</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Обкладинка */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'flex-end', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Обкладинка (стор)
                      </label>
                      <select
                        value={notebookCoverPages}
                        onChange={(e) => setNotebookCoverPages(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="2">2 стор (1 аркуш)</option>
                        <option value="4">4 стор (2 аркуші)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Матеріал обкладинки
                      </label>
                      <select
                        value={notebookCoverMaterial}
                        onChange={(e) => setNotebookCoverMaterial(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="coat_300">Крейд МАТ 300 г/м²</option>
                        <option value="coat_350">Крейд МАТ 350 г/м²</option>
                        <option value="coat_450">Крейд МАТ 450 г/м²</option>
                        <option value="kraft_275">Крафт 275 г/м²</option>
                        <option value="card_250">Картон 250 г/м² (білий зворот)</option>
                        <option value="mondi_300">Mondi DNS 300 г/м²</option>
                        <option value="dali_285">Dali bianco 285 г/м²</option>
                        <option value="flora_350">Flora avorio 350 г/м²</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Ламінація обкладинки
                      </label>
                      <select
                        value={notebookCoverCovering}
                        onChange={(e) => setNotebookCoverCovering(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="none">Без покриття</option>
                        <option value="gloss_10">Глянцева 1+0</option>
                        <option value="gloss_11">Глянцева 1+1</option>
                        <option value="mat_10">Матова 1+0</option>
                        <option value="mat_11">Матова 1+1</option>
                        <option value="soft_touch">Soft Velvet (Soft-Touch)</option>
                        <option value="antiscaf">Anti-Scratch (стійка)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Колірність обкладинки
                      </label>
                      <select
                        value={notebookCoverPrint}
                        onChange={(e) => setNotebookCoverPrint(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="4+4">4+4</option>
                        <option value="4+0">4+0</option>
                        <option value="1+0">1+0</option>
                        <option value="1+1">1+1</option>
                        <option value="0+0">Без друку</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Внутрішній блок */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'flex-end', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Кількість аркушів блоку
                      </label>
                      <select
                        value={notebookBlockPages}
                        onChange={(e) => setNotebookBlockPages(Number(e.target.value))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value={25}>25 аркушів</option>
                        <option value={50}>50 аркушів</option>
                        <option value={80}>80 аркушів</option>
                        <option value={100}>100 аркушів</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Папір блоку
                      </label>
                      <select
                        value={notebookBlockMaterial}
                        onChange={(e) => setNotebookBlockMaterial(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="offset_80">Офсет 80 г/м²</option>
                        <option value="offset_70">Офсет 70 г/м²</option>
                        <option value="coat_90">Крейд МАТ 90 г/м²</option>
                        <option value="kraft_80">Крафт 80 г/м²</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Колірність блоку
                      </label>
                      <select
                        value={notebookBlockPrint}
                        onChange={(e) => setNotebookBlockPrint(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="4+4">4+4</option>
                        <option value="4+0">4+0</option>
                        <option value="1+0">1+0</option>
                        <option value="1+1">1+1</option>
                        <option value="0+0">Без друку</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Вставка */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'flex-end', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Вставка
                      </label>
                      <select
                        value={notebookInsert}
                        onChange={(e) => setNotebookInsert(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="none">Без вставки</option>
                        <option value="1">1 вставка (1 аркуш)</option>
                        <option value="2">2 вставки (2 аркуші)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Папір вставки
                      </label>
                      <select
                        disabled={notebookInsert === 'none'}
                        value={notebookInsertMaterial}
                        onChange={(e) => setNotebookInsertMaterial(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: notebookInsert === 'none' ? '#F8FAFC' : '#FFFFFF', opacity: notebookInsert === 'none' ? 0.6 : 1 }}
                      >
                        <option value="coat_80">Крейд МАТ 80 г/м²</option>
                        <option value="coat_115">Крейд МАТ 115 г/м²</option>
                        <option value="coat_150">Крейд МАТ 150 г/м²</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Покриття вставки
                      </label>
                      <select
                        disabled={notebookInsert === 'none'}
                        value={notebookInsertCovering}
                        onChange={(e) => setNotebookInsertCovering(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: notebookInsert === 'none' ? '#F8FAFC' : '#FFFFFF', opacity: notebookInsert === 'none' ? 0.6 : 1 }}
                      >
                        <option value="none">Без покриття</option>
                        <option value="gloss_10">Глянцева 1+0</option>
                        <option value="mat_10">Матова 1+0</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Колірність вставки
                      </label>
                      <select
                        disabled={notebookInsert === 'none'}
                        value={notebookInsertPrint}
                        onChange={(e) => setNotebookInsertPrint(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: notebookInsert === 'none' ? '#F8FAFC' : '#FFFFFF', opacity: notebookInsert === 'none' ? 0.6 : 1 }}
                      >
                        <option value="4+4">4+4</option>
                        <option value="4+0">4+0</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5: Підкладка */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'flex-end', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Підкладка (стор)
                      </label>
                      <select
                        value={notebookBackPages}
                        onChange={(e) => setNotebookBackPages(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="2">2 стор (1 аркуш)</option>
                        <option value="4">4 стор (2 аркуші)</option>
                        <option value="0">Без підкладки</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Матеріал підкладки
                      </label>
                      <select
                        disabled={notebookBackPages === '0'}
                        value={notebookBackMaterial}
                        onChange={(e) => setNotebookBackMaterial(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: notebookBackPages === '0' ? '#F8FAFC' : '#FFFFFF', opacity: notebookBackPages === '0' ? 0.6 : 1 }}
                      >
                        <option value="coat_300">Крейд МАТ 300 г/м²</option>
                        <option value="card_250">Картон 250 г/м²</option>
                        <option value="kraft_275">Крафт 275 г/м²</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Покриття підкладки
                      </label>
                      <select
                        disabled={notebookBackPages === '0'}
                        value={notebookBackCovering}
                        onChange={(e) => setNotebookBackCovering(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: notebookBackPages === '0' ? '#F8FAFC' : '#FFFFFF', opacity: notebookBackPages === '0' ? 0.6 : 1 }}
                      >
                        <option value="none">Без покриття</option>
                        <option value="mat_10">Матова 1+0</option>
                        <option value="gloss_10">Глянцева 1+0</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Колірність підкладки
                      </label>
                      <select
                        disabled={notebookBackPages === '0'}
                        value={notebookBackPrint}
                        onChange={(e) => setNotebookBackPrint(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: notebookBackPages === '0' ? '#F8FAFC' : '#FFFFFF', opacity: notebookBackPages === '0' ? 0.6 : 1 }}
                      >
                        <option value="4+4">4+4</option>
                        <option value="4+0">4+0</option>
                        <option value="0+0">Без друку</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 6: Перфорація & Пакування */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Перфорація на листах блока
                      </label>
                      <select
                        value={notebookPerforation}
                        onChange={(e) => setNotebookPerforation(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="no">Ні</option>
                        <option value="yes">Так (лінія відриву)</option>
                      </select>
                    </div>

                    {notebookPerforation === 'yes' && (
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                          Обсяг перфорації
                        </label>
                        <select
                          value={notebookPerforationScope}
                          onChange={(e) => setNotebookPerforationScope(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                        >
                          <option value="1">1 лист</option>
                          <option value="all">Усі листи блоку</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                        Пакування в ПЕТ
                      </label>
                      <select
                        value={notebookPackaging}
                        onChange={(e) => setNotebookPackaging(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="no">Ні</option>
                        <option value="yes">Поштучно в термозбіжну плівку (ПЕТ)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Blue Info Alert */}
                <div style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#1E40AF',
                  fontSize: '13px',
                  fontWeight: '700'
                }}>
                  <span style={{ fontSize: '16px' }}>ℹ️</span>
                  <span>
                    Для розробки макету — товщина корінця ~ {totalSpineThickness} мм . Пружина — {spiralPitch}
                  </span>
                </div>

                {/* Red Price Matrix Table */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                }}>
                  {/* Red Top Bar */}
                  <div style={{
                    backgroundColor: '#C00000',
                    color: '#FFFFFF',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' }}>
                        ВАРТІСТЬ ЗАМОВЛЕННЯ
                      </span>
                      {/* Delivery toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={notebookWithDelivery}
                          onChange={(e) => setNotebookWithDelivery(e.target.checked)}
                          style={{ cursor: 'pointer', accentColor: '#FFFFFF' }}
                        />
                        <span>з доставкою</span>
                      </label>
                      {/* Price Var toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setNotebookPriceCostVar('per_tirazh')}
                          style={{
                            border: 'none',
                            backgroundColor: notebookPriceCostVar === 'per_tirazh' ? '#FFFFFF' : 'transparent',
                            color: notebookPriceCostVar === 'per_tirazh' ? '#C00000' : '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          За тираж
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotebookPriceCostVar('per_item')}
                          style={{
                            border: 'none',
                            backgroundColor: notebookPriceCostVar === 'per_item' ? '#FFFFFF' : 'transparent',
                            color: notebookPriceCostVar === 'per_item' ? '#C00000' : '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          За екземпляр
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert('Експорт прайсу блокнотів у Excel згенеровано')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(255,255,255,0.4)',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: '#FFFFFF',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <FileText size={13} />
                      <span>Excel</span>
                    </button>
                  </div>

                  {/* Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '700' }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left', minWidth: '180px' }}>Розмір / Опис</th>
                          <th style={{ padding: '10px 14px', minWidth: '130px' }}>Готовність</th>
                          {[1, 25, 50, 75, 100, 200, 500].map(qty => (
                            <th key={qty} style={{ padding: '10px 12px', minWidth: '95px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{qty}</span>
                              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>шт ▼</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Row 1: Urgent 2 Days */}
                        <tr style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.1s' }} className="hover:bg-amber-50/40">
                          <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '700', color: '#1E293B' }}>
                            {formatTitle} ({wMm} × {hMm}) {totalSheets} листів
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                              2д на {getFormattedFutureDate(2)}
                            </span>
                          </td>
                          {[1, 25, 50, 75, 100, 200, 500].map(qty => {
                            const price = computeNotepadPrice(qty, 2);
                            return (
                              <td
                                key={qty}
                                onClick={() => handleAddNotepadToOrder(qty, 2, price)}
                                style={{
                                  padding: '12px 10px',
                                  fontWeight: '800',
                                  color: '#C00000',
                                  cursor: 'pointer',
                                  fontSize: '12.5px'
                                }}
                                className="hover:bg-red-50 hover:underline"
                                title={`Замовити ${qty} шт за ${price.toFixed(2)} ₴`}
                              >
                                {notebookPriceCostVar === 'per_tirazh' ? price.toFixed(2) : (price / qty).toFixed(2)} ₴
                              </td>
                            );
                          })}
                        </tr>

                        {/* Row 2: Standard 3 Days */}
                        <tr style={{ transition: 'background-color 0.1s' }} className="hover:bg-blue-50/40">
                          <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '700', color: '#1E293B' }}>
                            {formatTitle} ({wMm} × {hMm}) {totalSheets} листів
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                              3д на {getFormattedFutureDate(3)}
                            </span>
                          </td>
                          {[1, 25, 50, 75, 100, 200, 500].map(qty => {
                            const price = computeNotepadPrice(qty, 3);
                            return (
                              <td
                                key={qty}
                                onClick={() => handleAddNotepadToOrder(qty, 3, price)}
                                style={{
                                  padding: '12px 10px',
                                  fontWeight: '800',
                                  color: '#0F172A',
                                  cursor: 'pointer',
                                  fontSize: '12.5px'
                                }}
                                className="hover:bg-blue-50 hover:underline"
                                title={`Замовити ${qty} шт за ${price.toFixed(2)} ₴`}
                              >
                                {notebookPriceCostVar === 'per_tirazh' ? price.toFixed(2) : (price / qty).toFixed(2)} ₴
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      {step === 'catalog' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Row: Title on Left, Search Bar on Right */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '0.5px solid var(--border-light)',
            width: '100%'
          }}>
            <div>
              <h2 className="page-title" style={{ margin: 0 }}>Поліграфічний калькулятор</h2>
              <p className="subtitle" style={{ margin: '3px 0 0 0' }}>Оберіть категорію продукції для детального прорахунку</p>
            </div>

            {/* Prominent Live Search Bar on the Right side */}
            <div style={{ position: 'relative', width: '380px', flexShrink: 0 }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#007AFF', pointerEvents: 'none' }} />
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => {
                  setProductSearchQuery(e.target.value);
                  if (mainCategoryTab !== 'products' && e.target.value.trim()) {
                    setMainCategoryTab('products');
                  }
                }}
                placeholder="Пошук продукції (Журнали, Бланки, Буклети...)"
                style={{
                  width: '100%',
                  padding: '9px 34px 9px 38px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-dark)',
                  boxShadow: 'var(--shadow-flat)',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
                className="focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {productSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProductSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-medium)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Top Category Tabs Navigation - Cupertino iOS Switcher with Mega Menu Trigger */}
          <div style={{ position: 'relative', zIndex: 40 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              backgroundColor: 'var(--bg-card)',
              padding: '6px',
              borderRadius: 'var(--radius-lg)',
              border: '0.5px solid var(--border-light)',
              boxShadow: 'var(--shadow-flat)',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1 }}>
                {/* Catalog Mega Menu Button Trigger */}
                <button
                  type="button"
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: isMegaMenuOpen ? 'var(--primary)' : 'var(--bg-system)',
                    color: isMegaMenuOpen ? '#ffffff' : 'var(--text-dark)',
                    boxShadow: isMegaMenuOpen ? '0 2px 8px rgba(0, 122, 255, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Menu size={16} />
                  <span>Каталог меню</span>
                  <ChevronDown size={14} style={{ transform: isMegaMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>

                {[
                  { key: 'products', label: 'Усі Продукти', count: 34 },
                  { key: 'offset', label: 'Офсетний друк', count: 18 },
                  { key: 'digital', label: 'Цифровий друк', count: 11 },
                  { key: 'wide', label: 'Широкоформатний', count: 10 },
                  { key: 'roll', label: 'Рулонний друк', count: 4 },
                  { key: 'films', label: 'Кольорові плівки', count: 5 }
                ].map(tab => {
                  const isActive = mainCategoryTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setMainCategoryTab(tab.key as any);
                        setIsMegaMenuOpen(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-dark)',
                        boxShadow: isActive ? '0 2px 8px rgba(0, 122, 255, 0.25)' : 'none',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: '600',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(120, 120, 128, 0.1)',
                        color: isActive ? '#ffffff' : 'var(--text-medium)'
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>


            </div>

            {/* INTERACTIVE MEGA MENU DROPDOWN PANEL (3 COLUMNS LIST + 4TH COLUMN LIVE PREVIEW ON THE RIGHT) */}
            {isMegaMenuOpen && (
              <div
                className="ios-card bg-white"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  padding: '24px 28px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.16)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '20px',
                  zIndex: 100,
                  animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflowX: 'auto'
                }}
              >
                {/* Mega Menu Top Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-dark)' }}>
                      Каталог поліграфічної продукції
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: '600' }}>
                      (Наведіть курсор для перегляду схеми виробу)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMegaMenuOpen(false)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-system)',
                      border: '0.5px solid var(--border-light)',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      color: 'var(--text-dark)',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Закрити
                  </button>
                </div>

                {/* Mega Menu 4-Column Horizontal Layout (Side by Side) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(180px, 1fr)) minmax(260px, 1.4fr)',
                  gap: '24px',
                  alignItems: 'start',
                  minWidth: '860px'
                }}>
                  {/* Column 1 */}
                  <div className="flex flex-col gap-1">
                    {[
                      { id: 'banners', title: 'БАНЕРИ', tab: 'wide', sub: 'banner' },
                      { id: 'blanks', title: 'БЛАНКИ, ОГОЛОШЕННЯ', tab: 'digital', sub: 'sheets' },
                      { id: 'notebooks', title: 'БЛОКНОТИ', tab: 'offset', sub: 'notebooks' },
                      { id: 'brochures', title: 'БРОШУРИ, КАТАЛОГИ', tab: 'offset', sub: 'multipage' },
                      { id: 'booklets', title: 'БУКЛЕТИ, КАРТИ', tab: 'offset', sub: 'sheets' },
                      { id: 'tags', title: 'БІРКИ, ЦІННИКИ', tab: 'digital', sub: 'felling' },
                      { id: 'cards', title: 'ВІЗИТІВКИ', tab: 'offset', sub: 'sheets' },
                      { id: 'samples', title: 'ЗРАЗКИ МАТЕРІАЛІВ', modal: 'samples' },
                      { id: 'calendar_grid', title: 'КАЛЕНДАРНІ СІТКИ', tab: 'offset', sub: 'sheets' },
                      { id: 'calendars', title: 'КАЛЕНДАРІ', tab: 'offset', sub: 'sheets' },
                      { id: 'mounted', title: 'КАШИРОВАНА ПРОДУКЦІЯ', tab: 'digital', sub: 'mounted' },
                      { id: 'tickets', title: 'КВИТКИ, КУПОНИ', tab: 'digital', sub: 'felling' },
                    ].map(item => {
                      const isHovered = hoveredMegaProduct === item.id;
                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setHoveredMegaProduct(item.id)}
                          onClick={() => {
                            if (item.modal) {
                              setActiveInfoModal(item.modal as any);
                            } else {
                              setMainCategoryTab(item.tab as any);
                              if (item.tab === 'digital' && item.sub) setDigitalSubTab(item.sub as any);
                              if (item.tab === 'offset' && item.sub) setOffsetSubTab(item.sub as any);
                              if (item.tab === 'wide' && item.sub) setWideSubTab(item.sub as any);
                            }
                            setIsMegaMenuOpen(false);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: isHovered ? '800' : '700',
                            letterSpacing: '0.3px',
                            color: isHovered ? '#ffffff' : '#334155',
                            backgroundColor: isHovered ? '#475569' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.1s ease'
                          }}
                        >
                          <span>{item.title}</span>
                          {isHovered && <ChevronRight size={13} style={{ color: '#ffffff' }} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Column 2 */}
                  <div className="flex flex-col gap-1">
                    {[
                      { id: 'color_films', title: 'КОЛЬОРОВІ ПЛІВКИ', tab: 'films' },
                      { id: 'envelopes', title: 'КОНВЕРТИ', tab: 'offset', sub: 'sheets' },
                      { id: 'cubes', title: 'ЛИСТИ ДЛЯ ЗАПИСУ', tab: 'offset', sub: 'sheets' },
                      { id: 'postcards', title: 'ЛИСТІВКИ, ЗАПРОШЕННЯ', tab: 'offset', sub: 'sheets' },
                      { id: 'flyers', title: 'ЛИСТІВКИ, ФЛАЄРИ', tab: 'offset', sub: 'sheets' },
                      { id: 'magnets', title: 'МАГНІТИ', tab: 'digital', sub: 'felling' },
                      { id: 'menu', title: 'МЕНЮ', tab: 'digital', sub: 'pouch_lam' },
                      { id: 'stands', title: 'МОБІЛЬНІ СТЕНДИ', tab: 'wide', sub: 'stands' },
                      { id: 'stickers', title: 'НАЛІПКИ, СТІКЕРИ, ЕТИКЕТКИ', tab: 'digital', sub: 'plotter_cut' },
                      { id: 'folders', title: 'ПАПКИ, З ВКЛЕЄНОЮ КИШЕНЕЮ', tab: 'digital', sub: 'folders' },
                      { id: 'posters', title: 'ПЛАКАТИ, АФІШИ', tab: 'wide', sub: 'paper' },
                      { id: 'plastic_cards', title: 'ПЛАСТИКОВІ КАРТИ', tab: 'digital', sub: 'felling' },
                    ].map(item => {
                      const isHovered = hoveredMegaProduct === item.id;
                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setHoveredMegaProduct(item.id)}
                          onClick={() => {
                            setMainCategoryTab(item.tab as any);
                            if (item.tab === 'digital' && item.sub) setDigitalSubTab(item.sub as any);
                              if (item.tab === 'offset' && item.sub) setOffsetSubTab(item.sub as any);
                            if (item.tab === 'wide' && item.sub) setWideSubTab(item.sub as any);
                            setIsMegaMenuOpen(false);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: isHovered ? '800' : '700',
                            letterSpacing: '0.3px',
                            color: isHovered ? '#ffffff' : '#334155',
                            backgroundColor: isHovered ? '#475569' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.1s ease'
                          }}
                        >
                          <span>{item.title}</span>
                          {isHovered && <ChevronRight size={13} style={{ color: '#ffffff' }} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Column 3 */}
                  <div className="flex flex-col gap-1">
                    {[
                      { id: 'canvas', title: 'ПОЛОТНА, КАРТИНИ', tab: 'wide', sub: 'canvas' },
                      { id: 'posters_paper', title: 'ПОСТЕРИ', tab: 'wide', sub: 'paper' },
                      { id: 'roll_label', title: 'РУЛОННА ЕТИКЕТКА', tab: 'roll' },
                      { id: 'self_adhesive_film', title: 'САМОКЛЕЮЧА ПЛІВКА', tab: 'wide', sub: 'film' },
                      { id: 'scratch', title: 'СКРЕТЧ-КАРТИ, ЛОТЕРЕЇ', tab: 'digital', sub: 'felling' },
                      { id: 'signs', title: 'ТАБЛИЧКИ, ВИВІСКИ', tab: 'wide', sub: 'pvc' },
                      { id: 'all_products', title: 'ВСІ ПРОДУКТИ', tab: 'products', isRed: true },
                    ].map(item => {
                      const isHovered = hoveredMegaProduct === item.id;
                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setHoveredMegaProduct(item.id)}
                          onClick={() => {
                            setMainCategoryTab(item.tab as any);
                            if (item.tab === 'digital' && item.sub) setDigitalSubTab(item.sub as any);
                              if (item.tab === 'offset' && item.sub) setOffsetSubTab(item.sub as any);
                            if (item.tab === 'wide' && item.sub) setWideSubTab(item.sub as any);
                            setIsMegaMenuOpen(false);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: isHovered ? '800' : '700',
                            letterSpacing: '0.3px',
                            color: isHovered ? '#ffffff' : (item.isRed ? '#e11d48' : '#334155'),
                            backgroundColor: isHovered ? (item.isRed ? '#e11d48' : '#475569') : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.1s ease'
                          }}
                        >
                          <span>{item.title}</span>
                          {isHovered && <ChevronRight size={13} style={{ color: '#ffffff' }} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Column 4: Dynamic Live Vector Mockup Display on the Right Side */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '340px',
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: '#fafbfc',
                    border: '1px solid var(--border-light)',
                    position: 'relative'
                  }}>
                    {/* 1. Cards (ВІЗИТІВКИ) */}
                    {hoveredMegaProduct === 'cards' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="220" height="150" viewBox="0 0 220 150" fill="none">
                          {/* Back Card (Tilted) */}
                          <g transform="rotate(8 135 65)">
                            <rect x="55" y="15" width="130" height="80" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2"/>
                            <line x1="72" y1="36" x2="168" y2="36" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round"/>
                            <line x1="72" y1="48" x2="145" y2="48" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                          </g>
                          {/* Front Card (Straight) */}
                          <rect x="25" y="48" width="135" height="82" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          {/* Clean circular monogram / icon placeholder */}
                          <circle cx="52" cy="72" r="14" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="1.8"/>
                          <path d="M48 72L51 75L57 69" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          {/* Card text lines */}
                          <line x1="74" y1="68" x2="140" y2="68" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round"/>
                          <line x1="74" y1="78" x2="120" y2="78" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="45" y1="104" x2="140" y2="104" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round"/>
                          <line x1="45" y1="114" x2="110" y2="114" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Візитівки (90×50 / 85×55 мм)
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Офсетний та цифровий друк, SoftTouch ламінація, вибірковий УФ-лак, округлення кутів.
                        </p>
                      </div>
                    )}

                    {/* 2. Roll Label (РУЛОННА ЕТИКЕТКА) */}
                    {hoveredMegaProduct === 'roll_label' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <ellipse cx="100" cy="36" rx="55" ry="16" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M45 36V100C45 110 70 118 100 118C130 118 155 110 155 100V36" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <ellipse cx="100" cy="100" rx="55" ry="16" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8"/>
                          {/* Unwinding label tape */}
                          <path d="M48 88L12 125H72L108 88" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2"/>
                          <rect x="25" y="98" width="30" height="10" rx="2" fill="#007AFF" fillOpacity="0.15" stroke="#007AFF" strokeWidth="1.5"/>
                          <line x1="28" y1="116" x2="55" y2="116" stroke="#1E293B" strokeWidth="2"/>
                          <circle cx="100" cy="36" r="14" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.8"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Рулонна етикетка
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Самоклейка в рулонах на втулці 76/40/25 мм під ручні та автоматичні аплікатори.
                        </p>
                      </div>
                    )}

                    {/* 3. Banners (БАНЕРИ) */}
                    {hoveredMegaProduct === 'banners' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="210" height="140" viewBox="0 0 210 140" fill="none">
                          <rect x="20" y="25" width="170" height="85" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          {/* Eyelets */}
                          <circle cx="32" cy="37" r="4.5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.8"/>
                          <circle cx="178" cy="37" r="4.5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.8"/>
                          <circle cx="32" cy="98" r="4.5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.8"/>
                          <circle cx="178" cy="98" r="4.5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.8"/>
                          {/* Banner graphic */}
                          <rect x="48" y="42" width="114" height="50" rx="3" fill="#007AFF" fillOpacity="0.08" stroke="#007AFF" strokeWidth="1.8"/>
                          <text x="74" y="73" fill="#007AFF" fontSize="14" fontWeight="900" letterSpacing="2">BANNER</text>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Широкоформатні банери
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Frontlit, Blockout, сітка Mesh з люверсами та проклейкою по периметру.
                        </p>
                      </div>
                    )}

                    {/* 4. Blanks & Forms (БЛАНКИ, ОГОЛОШЕННЯ) */}
                    {hoveredMegaProduct === 'blanks' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="45" y="15" width="110" height="120" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          {/* Clean corporate header mark */}
                          <circle cx="62" cy="34" r="7" fill="#007AFF" fillOpacity="0.2" stroke="#007AFF" strokeWidth="1.8"/>
                          <line x1="76" y1="34" x2="142" y2="34" stroke="#1E293B" strokeWidth="2.2"/>
                          <line x1="58" y1="56" x2="142" y2="56" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="58" y1="70" x2="142" y2="70" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="58" y1="84" x2="142" y2="84" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="58" y1="98" x2="120" y2="98" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Фірмові бланки А4
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Офсетний та цифровий друк на папері 80–120г або самокопіювальних бланках.
                        </p>
                      </div>
                    )}

                    {/* 5. Notebooks (БЛОКНОТИ) */}
                    {hoveredMegaProduct === 'notebooks' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="50" y="25" width="105" height="105" rx="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          {[62, 74, 86, 98, 110, 122, 134, 146].map(x => (
                            <ellipse key={x} cx={x} cy="25" rx="3.5" ry="7" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.8"/>
                          ))}
                          <rect x="65" y="52" width="75" height="28" rx="3" fill="#007AFF" fillOpacity="0.08" stroke="#007AFF" strokeWidth="1.8"/>
                          <line x1="65" y1="95" x2="140" y2="95" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="65" y1="108" x2="120" y2="108" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Блокноти на металевій пружині
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Формати А6, А5, А4 з повноколірною обкладинкою та блоком у клітинку/лінію.
                        </p>
                      </div>
                    )}

                    {/* 6. Booklets & Catalogs (БРОШУРИ, КАТАЛОГИ) */}
                    {hoveredMegaProduct === 'brochures' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <path d="M100 25C70 20 35 22 25 28V118C35 112 70 110 100 115V25Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M100 25C130 20 165 22 175 28V118C165 112 130 110 100 115V25Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <line x1="100" y1="25" x2="100" y2="115" stroke="#007AFF" strokeWidth="3"/>
                          <line x1="40" y1="50" x2="85" y2="48" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="40" y1="65" x2="85" y2="63" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="115" y1="48" x2="160" y2="50" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="115" y1="63" x2="160" y2="65" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Брошури та Каталоги
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Зшивання на скобу, металеву пружину або термоклейове скріплення (PUR).
                        </p>
                      </div>
                    )}

                    {/* 7. Booklets / Tri-folds (БУКЛЕТИ, КАРТИ) */}
                    {hoveredMegaProduct === 'booklets' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="25" y="30" width="48" height="90" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="73" y="30" width="54" height="90" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="127" y="30" width="48" height="90" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <line x1="73" y1="30" x2="73" y2="120" stroke="#007AFF" strokeWidth="2" strokeDasharray="3 3"/>
                          <line x1="127" y1="30" x2="127" y2="120" stroke="#007AFF" strokeWidth="2" strokeDasharray="3 3"/>
                          <rect x="83" y="45" width="34" height="20" rx="2" fill="#007AFF" fillOpacity="0.12"/>
                          <line x1="83" y1="75" x2="117" y2="75" stroke="#1E293B" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Буклети та Євробуклети
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          А4 з 2 згинами (євробуклет), гармошка або 1 фальц на крейдованому папері.
                        </p>
                      </div>
                    )}

                    {/* 8. Tags & Labels (БІРКИ, ЦІННИКИ) */}
                    {hoveredMegaProduct === 'tags' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <path d="M80 20L135 20L155 45V125H80V20Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <circle cx="130" cy="40" r="5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <path d="M130 35C130 15 160 10 160 25C160 40 135 35 130 45" stroke="#64748B" strokeWidth="2"/>
                          <rect x="95" y="60" width="45" height="15" rx="2" fill="#007AFF" fillOpacity="0.1"/>
                          <line x1="95" y1="90" x2="140" y2="90" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="95" y1="102" x2="125" y2="102" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Бірки та Цінники
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          З отвором під люверс, шнурок або біркотримач для одягу та сувенірів.
                        </p>
                      </div>
                    )}

                    {/* 9. Samples (ЗРАЗКИ МАТЕРІАЛІВ) */}
                    {hoveredMegaProduct === 'samples' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <g transform="rotate(-25 50 120)">
                            <rect x="50" y="30" width="55" height="90" rx="3" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          </g>
                          <g transform="rotate(-10 50 120)">
                            <rect x="50" y="30" width="55" height="90" rx="3" fill="#CBD5E1" stroke="#1E293B" strokeWidth="2"/>
                          </g>
                          <g transform="rotate(5 50 120)">
                            <rect x="50" y="30" width="55" height="90" rx="3" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2"/>
                            <circle cx="70" cy="50" r="8" fill="#007AFF" fillOpacity="0.2" stroke="#007AFF" strokeWidth="1.5"/>
                          </g>
                          <g transform="rotate(20 50 120)">
                            <rect x="50" y="30" width="55" height="90" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                            <line x1="58" y1="45" x2="95" y2="45" stroke="#1E293B" strokeWidth="2"/>
                            <line x1="58" y1="55" x2="85" y2="55" stroke="#94A3B8" strokeWidth="2"/>
                          </g>
                          <circle cx="50" cy="115" r="6" fill="#334155" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="47" y1="115" x2="53" y2="115" stroke="#FFFFFF" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Віяло зразків матеріалів
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Зразки крейдованого, офсетного, дизайнерського паперу, плівок та ламінації.
                        </p>
                      </div>
                    )}

                    {/* 10. Calendar Grids (КАЛЕНДАРНІ СІТКИ) */}
                    {hoveredMegaProduct === 'calendar_grid' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="30" y="20" width="140" height="105" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="30" y="20" width="140" height="24" fill="#007AFF"/>
                          <text x="40" y="36" fill="#FFFFFF" fontSize="11" fontWeight="bold">2026 СІЧЕНЬ</text>
                          {[42, 68, 94, 120, 146].map(x => (
                            [54, 74, 94, 114].map(y => (
                              <rect key={`${x}-${y}`} x={x} y={y} width="16" height="12" rx="2" fill="#F1F5F9"/>
                            ))
                          ))}
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Календарні сітки
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Стандартні, золоті та металізовані сітки для квартальних настінних календарів.
                        </p>
                      </div>
                    )}

                    {/* 11. Calendars (КАЛЕНДАРІ) */}
                    {hoveredMegaProduct === 'calendars' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <path d="M40 120L100 30L160 120H40Z" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="65" y="45" width="70" height="65" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8"/>
                          <rect x="65" y="45" width="70" height="16" fill="#007AFF"/>
                          <line x1="72" y1="72" x2="128" y2="72" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="72" y1="84" x2="128" y2="84" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="72" y1="96" x2="115" y2="96" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Настільні та Настінні Календарі
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Календарі-будиночки, перекидні настінні А3/А2 та кишенькові календарики.
                        </p>
                      </div>
                    )}

                    {/* 12. Mounted Box / Hardcover (КАШИРОВАНА ПРОДУКЦІЯ) */}
                    {hoveredMegaProduct === 'mounted' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <path d="M100 22L165 52L100 82L35 52L100 22Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M35 52V105L100 135V82L35 52Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M165 52V105L100 135V82L165 52Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2.2"/>
                          {/* Elegant Royal Blue Ribbon */}
                          <path d="M92 26L157 56L147 61L82 31L92 26Z" fill="#007AFF"/>
                          <path d="M152 59V112L142 116V63L152 59Z" fill="#0056B3"/>
                          <circle cx="100" cy="80" r="8" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Каширована продукція та Упаковка
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Тверда палітурка на палітурному картоні 1.5–3 мм, преміум коробки кришка-дно.
                        </p>
                      </div>
                    )}

                    {/* 13. Tickets & Vouchers (КВИТКИ, КУПОНИ) */}
                    {hoveredMegaProduct === 'tickets' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="25" y="40" width="150" height="75" rx="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <line x1="75" y1="40" x2="75" y2="115" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4"/>
                          <circle cx="75" cy="40" r="5" fill="#FAFBFC" stroke="#1E293B" strokeWidth="2"/>
                          <circle cx="75" cy="115" r="5" fill="#FAFBFC" stroke="#1E293B" strokeWidth="2"/>
                          <rect x="35" y="52" width="28" height="12" rx="2" fill="#007AFF"/>
                          <text x="38" y="61" fill="#FFFFFF" fontSize="7" fontWeight="bold">PASS</text>
                          <line x1="35" y1="85" x2="65" y2="85" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="35" y1="95" x2="58" y2="95" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="90" y1="55" x2="160" y2="55" stroke="#1E293B" strokeWidth="2.5"/>
                          <line x1="90" y1="67" x2="145" y2="67" stroke="#94A3B8" strokeWidth="2"/>
                          {[90, 94, 97, 102, 105, 110, 113, 118, 122].map((bx, i) => (
                            <line key={i} x1={bx} y1="85" x2={bx} y2="105" stroke="#1E293B" strokeWidth={i % 2 === 0 ? 2.5 : 1.5}/>
                          ))}
                          <text x="135" y="98" fill="#007AFF" fontSize="10" fontWeight="extrabold">№00482</text>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Квитки та Купони
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          З відривною перфорацією, індивідуальною нумерацією та захисними штрих-кодами.
                        </p>
                      </div>
                    )}

                    {/* 14. Color Films / Oracal (КОЛЬОРОВІ ПЛІВКИ) */}
                    {hoveredMegaProduct === 'color_films' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <ellipse cx="50" cy="45" rx="18" ry="8" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <path d="M32 45V115C32 119.5 40 123 50 123C60 123 68 119.5 68 115V45" fill="#CBD5E1" stroke="#1E293B" strokeWidth="2"/>
                          <ellipse cx="50" cy="115" rx="18" ry="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5"/>
                          <path d="M50 85L170 55V125L50 123" fill="#007AFF" fillOpacity="0.12" stroke="#007AFF" strokeWidth="2"/>
                          <path d="M90 75L135 65L125 105L80 115Z" fill="#007AFF" stroke="#1E293B" strokeWidth="2"/>
                          <path d="M148 50L135 65L140 70Z" fill="#1E293B"/>
                          <line x1="148" y1="50" x2="165" y2="33" stroke="#1E293B" strokeWidth="3"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Плотерна порізка ORACAL 641
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Контурна порізка написів, логотипів та графіки з 60 кольорів глянцевих і матових плівок.
                        </p>
                      </div>
                    )}

                    {/* 15. Envelopes (КОНВЕРТИ) */}
                    {hoveredMegaProduct === 'envelopes' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="25" y="35" width="150" height="85" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M25 35L100 85L175 35" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="135" y="45" width="26" height="30" rx="2" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="1.5"/>
                          <line x1="45" y1="95" x2="110" y2="95" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="45" y1="105" x2="90" y2="105" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Брендовані конверти
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Формати DL (євро), С6, С5, С4 з клейовою стрічкою та прозорим віконцем.
                        </p>
                      </div>
                    )}

                    {/* 16. Sticky Notes / Cubes (ЛИСТИ ДЛЯ ЗАПИСУ) */}
                    {hoveredMegaProduct === 'cubes' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <path d="M100 20L160 45L100 70L40 45L100 20Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M40 45V105L100 130V70L40 45Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M160 45V105L100 130V70L160 45Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2.2"/>
                          <line x1="40" y1="60" x2="100" y2="85" stroke="#007AFF" strokeWidth="1.5"/>
                          <line x1="40" y1="75" x2="100" y2="100" stroke="#CBD5E1" strokeWidth="1.5"/>
                          <line x1="40" y1="90" x2="100" y2="115" stroke="#CBD5E1" strokeWidth="1.5"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Кубарики (Листи для запису)
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Блоки для нотаток 90×90 мм з проклейкою торця або в картонному диспенсері.
                        </p>
                      </div>
                    )}

                    {/* 17. Postcards & Invitations (ЛИСТІВКИ, ЗАПРОШЕННЯ) */}
                    {hoveredMegaProduct === 'postcards' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <path d="M40 120L75 35L145 25L110 110L40 120Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M145 25L170 45L135 128L110 110L145 25Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="2"/>
                          <circle cx="95" cy="65" r="14" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="1.8"/>
                          <text x="89" y="70" fill="#007AFF" fontSize="13" fontWeight="bold">❦</text>
                          <line x1="68" y1="90" x2="120" y2="83" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="72" y1="98" x2="112" y2="92" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Листівки та Запрошення
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Весільні, святкові та корпоративні запрошення з тисненням фольгою або калькою.
                        </p>
                      </div>
                    )}

                    {/* 18. Flyers (ЛИСТІВКИ, ФЛАЄРИ) */}
                    {hoveredMegaProduct === 'flyers' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="55" y="18" width="90" height="115" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="65" y="28" width="70" height="35" rx="3" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="1.5"/>
                          <circle cx="80" cy="45" r="7" fill="#007AFF"/>
                          <line x1="65" y1="74" x2="135" y2="74" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round"/>
                          <line x1="65" y1="84" x2="125" y2="84" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="65" y1="94" x2="130" y2="94" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                          <rect x="110" y="105" width="26" height="18" rx="2" fill="#007AFF"/>
                          <text x="114" y="118" fill="#FFFFFF" fontSize="9" fontWeight="bold">-%</text>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Рекламні Флаєри та Листівки
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Єврофлаєри (210×100 мм), А6, А5, А4 на глянцевому або матовому папері 130–350г.
                        </p>
                      </div>
                    )}

                    {/* 19. Magnets (МАГНІТИ) */}
                    {hoveredMegaProduct === 'magnets' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <path d="M60 40V80C60 102 78 120 100 120C122 120 140 102 140 80V40H115V80C115 88 108 95 100 95C92 95 85 88 85 80V40H60Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="60" y="40" width="25" height="18" fill="#334155" stroke="#1E293B" strokeWidth="2"/>
                          <text x="68" y="53" fill="#FFFFFF" fontSize="10" fontWeight="bold">N</text>
                          <rect x="115" y="40" width="25" height="18" fill="#007AFF" stroke="#1E293B" strokeWidth="2"/>
                          <text x="124" y="53" fill="#FFFFFF" fontSize="10" fontWeight="bold">S</text>
                          <path d="M48 40C40 60 40 100 65 125" stroke="#334155" strokeWidth="2" strokeDasharray="3 3"/>
                          <path d="M152 40C160 60 160 100 135 125" stroke="#007AFF" strokeWidth="2" strokeDasharray="3 3"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Сувенірні та Плоскі Магніти
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Магнітний вініл 0.4–0.7 мм з глянцевою ламінацією та прямою або фігурною висічкою.
                        </p>
                      </div>
                    )}

                    {/* 20. Menu (МЕНЮ) */}
                    {hoveredMegaProduct === 'menu' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="45" y="20" width="110" height="110" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="45" y="20" width="15" height="110" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <circle cx="52" cy="35" r="3" fill="#007AFF"/>
                          <circle cx="52" cy="75" r="3" fill="#007AFF"/>
                          <circle cx="52" cy="115" r="3" fill="#007AFF"/>
                          <circle cx="100" cy="50" r="14" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="1.5"/>
                          <text x="92" y="56" fill="#007AFF" fontSize="14" fontWeight="bold">🍴</text>
                          <line x1="72" y1="78" x2="138" y2="78" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="72" y1="90" x2="128" y2="90" stroke="#94A3B8" strokeWidth="2"/>
                          <line x1="72" y1="102" x2="134" y2="102" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Меню для ресторанів та HoReCa
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Меню-папки на болтах, пружині, плейсмати або водостійка пакетна ламінація.
                        </p>
                      </div>
                    )}

                    {/* 21. Mobile Stands (МОБІЛЬНІ СТЕНДИ) */}
                    {hoveredMegaProduct === 'stands' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="55" y="125" width="90" height="14" rx="3" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="45" y1="139" x2="155" y2="139" stroke="#1E293B" strokeWidth="2.5"/>
                          <line x1="100" y1="20" x2="100" y2="125" stroke="#1E293B" strokeWidth="2" strokeDasharray="3 3"/>
                          <rect x="70" y="20" width="60" height="105" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2"/>
                          <rect x="68" y="18" width="64" height="6" rx="2" fill="#1E293B"/>
                          <rect x="78" y="32" width="44" height="25" rx="2" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="1.5"/>
                          <text x="83" y="48" fill="#007AFF" fontSize="8" fontWeight="bold">ROLL-UP</text>
                          <line x1="78" y1="68" x2="122" y2="68" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="78" y1="78" x2="114" y2="78" stroke="#94A3B8" strokeWidth="1.5"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Мобільні стенди Roll-Up та Павук
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Алюмінієві касети Roll-Up 80×200 / 100×200 см та X-Banner стенди з сумкою-чохлом.
                        </p>
                      </div>
                    )}

                    {/* 22. Stickers & Labels (НАЛІПКИ, СТІКЕРИ, ЕТИКЕТКИ) */}
                    {hoveredMegaProduct === 'stickers' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="35" y="25" width="130" height="95" rx="5" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M55 45H125V85L105 105H55V45Z" fill="#FFFFFF" stroke="#007AFF" strokeWidth="2.2"/>
                          <path d="M125 85L105 105L105 85H125Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.8"/>
                          <circle cx="80" cy="65" r="12" fill="#007AFF" fillOpacity="0.8"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Наліпки та Стікерпаки
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Плотерна порізка по контуру будь-якої складності на плівці Orajet або Ritrama.
                        </p>
                      </div>
                    )}

                    {/* 23. Folders (ПАПКИ, З ВКЛЕЄНОЮ КИШЕНЕЮ) */}
                    {hoveredMegaProduct === 'folders' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <path d="M30 25H105L125 42H170V125H30V25Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M30 85H115V125H30V85Z" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="2"/>
                          <rect x="42" y="95" width="36" height="18" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5"/>
                          <line x1="50" y1="52" x2="95" y2="52" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="50" y1="62" x2="85" y2="62" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Папки А4 з кишенею
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Фірмові картонні папки з суцільновисічною або вклеєною кишенею під візитку.
                        </p>
                      </div>
                    )}

                    {/* 24. Posters & Billboards (ПЛАКАТИ, АФІШИ) */}
                    {hoveredMegaProduct === 'posters' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <line x1="50" y1="18" x2="100" y2="8" stroke="#1E293B" strokeWidth="1.5"/>
                          <line x1="150" y1="18" x2="100" y2="8" stroke="#1E293B" strokeWidth="1.5"/>
                          <circle cx="100" cy="8" r="3" fill="#007AFF"/>
                          <rect x="45" y="18" width="110" height="8" rx="2" fill="#1E293B"/>
                          <rect x="50" y="26" width="100" height="100" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2"/>
                          <rect x="45" y="126" width="110" height="8" rx="2" fill="#1E293B"/>
                          <rect x="62" y="38" width="76" height="40" rx="2" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="1.5"/>
                          <text x="76" y="62" fill="#007AFF" fontSize="12" fontWeight="bold">POSTER</text>
                          <line x1="62" y1="90" x2="138" y2="90" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="62" y1="102" x2="120" y2="102" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Плакати та Афіші (А3–А0)
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Інтер'єрний та широкоформатний фотодрук на папері Citylight 150г або фотопапері 200г.
                        </p>
                      </div>
                    )}

                    {/* 25. Plastic Cards (ПЛАСТИКОВІ КАРТИ) */}
                    {hoveredMegaProduct === 'plastic_cards' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="30" y="32" width="140" height="86" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2.2"/>
                          <rect x="30" y="48" width="140" height="18" fill="#0F172A"/>
                          <rect x="45" y="78" width="28" height="20" rx="3" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
                          <text x="85" y="92" fill="#FFFFFF" fontSize="12" fontWeight="bold" letterSpacing="1">VIP CARD</text>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Пластикові картки
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Товщина 0.76 мм, магнітна смуга HiCo, ембосування та безконтактні чипи RFID.
                        </p>
                      </div>
                    )}

                    {/* 26. Canvas & Paintings (ПОЛОТНА, КАРТИНИ) */}
                    {hoveredMegaProduct === 'canvas' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="35" y="25" width="130" height="95" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <path d="M35 100L75 55L110 85L135 65L165 100H35Z" fill="#007AFF" fillOpacity="0.15" stroke="#007AFF" strokeWidth="2"/>
                          <circle cx="65" cy="50" r="10" fill="#F59E0B"/>
                          <path d="M165 28L175 35V128L165 120V28Z" fill="#CBD5E1" stroke="#1E293B" strokeWidth="1.8"/>
                          <path d="M38 120L48 128H175L165 120H38Z" fill="#94A3B8" stroke="#1E293B" strokeWidth="1.8"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Друк картин на полотні
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Натуральне бавовняне полотно, галерейна натяжка на дерев'яний підрамник.
                        </p>
                      </div>
                    )}

                    {/* 27. Paper Posters (ПОСТЕРИ) */}
                    {hoveredMegaProduct === 'posters_paper' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="40" y="18" width="120" height="114" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5"/>
                          <rect x="48" y="26" width="104" height="98" rx="3" fill="#FFFFFF"/>
                          <rect x="58" y="38" width="84" height="42" rx="2" fill="#007AFF" fillOpacity="0.1" stroke="#007AFF" strokeWidth="1.5"/>
                          <circle cx="72" cy="52" r="8" fill="#007AFF"/>
                          <line x1="58" y1="92" x2="130" y2="92" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="58" y1="104" x2="115" y2="104" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Постери Citylight
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Світлорозсіювальний папір для сітілайтів, лайтбоксів та інтер'єрних постерів.
                        </p>
                      </div>
                    )}

                    {/* 28. Self Adhesive Film (САМОКЛЕЮЧА ПЛІВКА) */}
                    {hoveredMegaProduct === 'self_adhesive_film' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <ellipse cx="40" cy="40" rx="16" ry="8" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <path d="M24 40V110C24 114.5 31 118 40 118C49 118 56 114.5 56 110V40" fill="#CBD5E1" stroke="#1E293B" strokeWidth="2"/>
                          <ellipse cx="40" cy="110" rx="16" ry="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5"/>
                          <path d="M40 85L170 50V120L40 115" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2"/>
                          <path d="M120 70L155 60L165 75L130 85Z" fill="#007AFF" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="120" y1="70" x2="130" y2="85" stroke="#FFFFFF" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Самоклеюча плівка ORAJET
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Біла, прозора, перфорована (One Way Vision) плівка з матовою/глянцевою ламінацією.
                        </p>
                      </div>
                    )}

                    {/* 29. Scratch Cards (СКРЕТЧ-КАРТИ, ЛОТЕРЕЇ) */}
                    {hoveredMegaProduct === 'scratch' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="30" y="28" width="140" height="90" rx="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2"/>
                          <rect x="45" y="45" width="90" height="30" rx="3" fill="#CBD5E1" stroke="#94A3B8" strokeDasharray="4 4"/>
                          <circle cx="145" cy="85" r="18" fill="#F59E0B" stroke="#D97706" strokeWidth="2.2"/>
                          <text x="140" y="91" fill="#FFFFFF" fontSize="14" fontWeight="bold">₴</text>
                          <line x1="45" y1="90" x2="110" y2="90" stroke="#1E293B" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Скретч-карти та Лотереї
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Зі стираним захисним срібним шаром, персоналізацією та змінними промокодами.
                        </p>
                      </div>
                    )}

                    {/* 30. Signs & Plates (ТАБЛИЧКИ, ВИВІСКИ) */}
                    {hoveredMegaProduct === 'signs' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          <rect x="30" y="30" width="140" height="90" rx="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5"/>
                          <circle cx="42" cy="42" r="5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <circle cx="158" cy="42" r="5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <circle cx="42" cy="108" r="5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <circle cx="158" cy="108" r="5" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2"/>
                          <rect x="65" y="48" width="70" height="24" rx="3" fill="#1E293B"/>
                          <text x="73" y="64" fill="#FFFFFF" fontSize="10" fontWeight="bold">OFFICE 204</text>
                          <line x1="55" y1="88" x2="145" y2="88" stroke="#1E293B" strokeWidth="2"/>
                          <line x1="65" y1="98" x2="135" y2="98" stroke="#94A3B8" strokeWidth="2"/>
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', marginTop: '12px' }}>
                          Таблички та Фасадні Вивіски
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          ПВХ пластик 3–5 мм, алюмінієвий композит, прозорий акрил з дистанційними кріпленнями.
                        </p>
                      </div>
                    )}

                    {/* 32. All Products (ВСІ ПРОДУКТИ) */}
                    {hoveredMegaProduct === 'all_products' && (
                      <div className="flex flex-col items-center text-center animate-fadeIn">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                          {[
                            { x: 45, y: 25, col: '#007AFF' }, { x: 85, y: 25, col: '#3B82F6' }, { x: 125, y: 25, col: '#10B981' },
                            { x: 45, y: 60, col: '#F59E0B' }, { x: 85, y: 60, col: '#8B5CF6' }, { x: 125, y: 60, col: '#06B6D4' },
                            { x: 45, y: 95, col: '#64748B' }, { x: 85, y: 95, col: '#6366F1' }, { x: 125, y: 95, col: '#007AFF' }
                          ].map((t, idx) => (
                            <rect key={idx} x={t.x} y={t.y} width="30" height="26" rx="4" fill={t.col} fillOpacity="0.15" stroke={t.col} strokeWidth="2"/>
                          ))}
                        </svg>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#007AFF', marginTop: '12px' }}>
                          Повний каталог продукції
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', maxWidth: '220px' }}>
                          Перейти до повного списку всіх категорій та послуг друкарні.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: PRODUCTS (All Categories - Exact Dashboard iOS Card Grid) */}
          {mainCategoryTab === 'products' && (() => {
            const allProducts = [
                {
                  title: 'Банери',
                  desc: 'Банерні вивіски, розтяжки, тенти, брандмауери, вітростійка сітка Mesh.',
                  icon: <Layout size={30} style={{ color: 'var(--primary)' }} />,
                  color: 'rgba(0, 122, 255, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Широкоформат',
                  metric: 'Frontlit / Mesh',
                  onClick: () => { setMainCategoryTab('wide'); setWideSubTab('banner'); }
                },
                {
                  title: 'Бланки та Листи',
                  desc: 'Друк бланкової продукції на офсетному та самокопіювальному папері.',
                  icon: <FileText size={30} style={{ color: 'var(--primary)' }} />,
                  color: 'rgba(0, 122, 255, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Бланки',
                  metric: 'Офсет / самоклейка',
                  keywords: ['бланк', 'бланки', 'газетка', 'газетний', 'офсет', 'офсетний', 'самокопірка', 'самокопіювальний', 'лист', 'листи'],
                  onClick: () => handleSelectCategory('Бланки')
                },
                {
                  title: 'Блокноти',
                  desc: 'Фірмові блокноти А5, А4 з пружиною та персоналізованою обкладинкою.',
                  icon: <Bookmark size={30} style={{ color: '#0ea5e9' }} />,
                  color: 'rgba(14, 165, 233, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Блокноти',
                  metric: 'Пружина',
                  onClick: () => handleSelectCategory('Блокноти')
                },
                {
                  title: 'Брошури, Каталоги, Журнали',
                  desc: 'Багатосторінкові брошури, каталоги, журнали, періодичні видання, річні звіти на скобу або PUR-клей.',
                  icon: <BookOpen size={30} style={{ color: '#34c759' }} />,
                  color: 'rgba(52, 199, 89, 0.1)',
                  badgeClass: 'ios-badge-green',
                  badge: 'Каталоги / Журнали',
                  metric: 'Скоба / PUR клей',
                  keywords: ['журнал', 'журнали', 'каталог', 'каталоги', 'брошура', 'брошури', 'книга', 'книги', 'періодика', 'звіт', 'звіти', 'багатосторінкова'],
                  onClick: () => handleSelectCategory('Книги')
                },
                {
                  title: 'Буклети, Карти',
                  desc: 'Рекламні буклети та карти з 1, 2 або 3 згинами (фальцами).',
                  icon: <BookOpen size={30} style={{ color: '#ff9500' }} />,
                  color: 'rgba(255, 149, 0, 0.1)',
                  badgeClass: 'ios-badge-orange',
                  badge: 'Буклети',
                  metric: '1-3 Фальці',
                  onClick: () => handleSelectCategory('Буклети')
                },
                {
                  title: 'Бірки, Цінники',
                  desc: 'Висічні товарні бірки, маркувальні цінники з отвором для шнурка або люверсом.',
                  icon: <Tag size={30} style={{ color: '#0ea5e9' }} />,
                  color: 'rgba(14, 165, 233, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Висічка',
                  metric: 'Отвори / Люверси',
                  onClick: () => { setMainCategoryTab('digital'); setDigitalSubTab('felling'); }
                },
                {
                  title: 'Візитівки',
                  desc: '90х50 мм або євро-формат, ламінація SoftTouch, вибірковий УФ-лак та скруглення кутів.',
                  icon: <CreditCard size={30} style={{ color: '#5856d6' }} />,
                  color: 'rgba(88, 86, 214, 0.1)',
                  badgeClass: 'ios-badge-purple',
                  badge: 'Візитки',
                  metric: 'SoftTouch / Золото',
                  onClick: () => handleSelectCategory('Візитки')
                },
                {
                  title: 'Зразки матеріалів',
                  desc: 'Віяла зразків паперів, дизайнерських картонів, плівок та видів оздоблення.',
                  icon: <Palette size={30} style={{ color: '#af52de' }} />,
                  color: 'rgba(175, 82, 222, 0.1)',
                  badgeClass: 'ios-badge-purple',
                  badge: 'Матеріали',
                  metric: 'Віяла зразків',
                  onClick: () => setActiveInfoModal('samples')
                },
                {
                  title: 'Календарні сітки',
                  desc: 'Стандартні квартальні календарні блоки 297х140 мм на крейдованому або офсетному папері.',
                  icon: <Calendar size={30} style={{ color: '#34c759' }} />,
                  color: 'rgba(52, 199, 89, 0.1)',
                  badgeClass: 'ios-badge-green',
                  badge: 'Сітки',
                  metric: 'Квартальні блоки',
                  onClick: () => openOffsetProduct({ category: 'Календарі', subCategory: 'Календарні сітки', subTab: 'sheets', preset: '34', w: '297', h: '140', kind: '1' })
                },
                {
                  title: 'Календарі',
                  desc: 'Квартальні триблочні, настінні перекидні або будиночки на пружині.',
                  icon: <Calendar size={30} style={{ color: '#ff3b30' }} />,
                  color: 'rgba(255, 59, 48, 0.1)',
                  badgeClass: 'ios-badge-red',
                  badge: 'Календарі',
                  metric: 'Квартальні / Настінні',
                  onClick: () => handleSelectCategory('Календарі')
                },
                {
                  title: 'Календарики кишенькові',
                  desc: 'Кишенькові календарики 70х100мм або 50х70мм з двосторонньою ламінацією та скругленням.',
                  icon: <Calendar size={30} style={{ color: '#34c759' }} />,
                  color: 'rgba(52, 199, 89, 0.1)',
                  badgeClass: 'ios-badge-green',
                  badge: 'Кишенькові',
                  metric: 'Ламінація 2+2',
                  onClick: () => handleSelectCategory('Календарики кишенькові')
                },
                {
                  title: 'Каширована продукція',
                  desc: 'Каширування друкованих лайнерів на твердий палітурний картон від 1.5 до 3 мм.',
                  icon: <Layers size={30} style={{ color: '#f59e0b' }} />,
                  color: 'rgba(245, 158, 11, 0.1)',
                  badgeClass: 'ios-badge-orange',
                  badge: 'Каширування',
                  metric: 'Палітурний картон',
                  onClick: () => { setMainCategoryTab('digital'); setDigitalSubTab('mounted'); }
                },
                {
                  title: 'Квитки, Купони',
                  desc: 'Вхідні квитки, флаєри-купони, подарункові сертифікати з перфорацією та нумерацією.',
                  icon: <Sparkles size={30} style={{ color: '#0ea5e9' }} />,
                  color: 'rgba(14, 165, 233, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Нумерація',
                  metric: 'Перфорація',
                  onClick: () => { setMainCategoryTab('digital'); setDigitalSubTab('felling'); }
                },
                {
                  title: 'Кольорові плівки',
                  desc: 'Аплікаційні кольорові плівки ORACAL 641, плотерна порізка, вибірка та монтажка.',
                  icon: <Palette size={30} style={{ color: '#ec4899' }} />,
                  color: 'rgba(236, 72, 153, 0.1)',
                  badgeClass: 'ios-badge-purple',
                  badge: 'ORACAL 641',
                  metric: 'Плотерна порізка',
                  onClick: () => setMainCategoryTab('films')
                },
                {
                  title: 'Конверти фірмові',
                  desc: 'Друк логотипів на конвертах формату DL (євро), С5, С4 з клейовою смужкою.',
                  icon: <FileText size={30} style={{ color: '#6366f1' }} />,
                  color: 'rgba(99, 102, 241, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Конверти',
                  metric: 'DL / C5 / C4',
                  onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Конверти', subTab: 'sheets', preset: '25', w: '220', h: '110', kind: '1' })
                },
                {
                  title: 'Листи для запису',
                  desc: 'Фірмові кубарики та блоки для запису у пластикових боксах або проклеєні.',
                  icon: <Bookmark size={30} style={{ color: '#0ea5e9' }} />,
                  color: 'rgba(14, 165, 233, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Кубарики',
                  metric: 'Блоки для запису',
                  onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Кубарики', subTab: 'sheets', preset: '38', w: '90', h: '90', kind: '1' })
                },
                {
                  title: 'Листівки, Запрошення',
                  desc: 'Рекламні та святкові листівки А6, А5, А4 на крейдованому або дизайнерському папері.',
                  icon: <Image size={30} style={{ color: '#0ea5e9' }} />,
                  color: 'rgba(14, 165, 233, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Листівки',
                  metric: 'А-формати',
                  onClick: () => handleSelectCategory('Листівки')
                },
                {
                  title: 'Листівки, Флаєри',
                  desc: 'Єврофлаєри (99х210мм), подвійні флаєри повноколірного 4+4 або 4+0 друку.',
                  icon: <Zap size={30} style={{ color: '#ff9500' }} />,
                  color: 'rgba(255, 149, 0, 0.1)',
                  badgeClass: 'ios-badge-orange',
                  badge: 'Флаєри',
                  metric: 'Євроформат',
                  onClick: () => handleSelectCategory('Флаєри')
                },
                {
                  title: 'Магніти сувенірні',
                  desc: 'Вінілові магніти з повноколірним друком, глянцевою ламінацією та фігурною висічкою.',
                  icon: <Sparkles size={30} style={{ color: '#ec4899' }} />,
                  color: 'rgba(236, 72, 153, 0.1)',
                  badgeClass: 'ios-badge-purple',
                  badge: 'Сувенірка',
                  metric: 'Магнітний вініл',
                  onClick: () => { setMainCategoryTab('digital'); setDigitalSubTab('felling'); }
                },
                {
                  title: 'Меню для ресторанів',
                  desc: 'Меню HoReCa з цупкою пакетною ламінацією, скріпленням пружиною або болтами.',
                  icon: <Utensils size={30} style={{ color: '#af52de' }} />,
                  color: 'rgba(175, 82, 222, 0.1)',
                  badgeClass: 'ios-badge-purple',
                  badge: 'HoReCa',
                  metric: 'Пакетна ламінація',
                  onClick: () => handleSelectCategory('Меню')
                },
                {
                  title: 'Мобільні стенди',
                  desc: 'Виставкові стенди Roll-Up, X-Banner (павук), банери для презентацій та промо.',
                  icon: <Layout size={30} style={{ color: 'var(--primary)' }} />,
                  color: 'rgba(0, 122, 255, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Стенди',
                  metric: 'Roll-Up / X-Banner',
                  onClick: () => { setMainCategoryTab('wide'); setWideSubTab('stands'); }
                },
                {
                  title: 'Наліпки, Стікери',
                  desc: 'Самоклеючі наклейки з плотерною надсічкою на аркушах Raflatac або Ritrama.',
                  icon: <Tag size={30} style={{ color: '#ff9500' }} />,
                  color: 'rgba(255, 149, 0, 0.1)',
                  badgeClass: 'ios-badge-orange',
                  badge: 'Самоклейка',
                  metric: 'Raflatac / плотер',
                  onClick: () => handleSelectCategory('Наклейки')
                },
                {
                  title: 'Папки з кишенею',
                  desc: 'Корпоративні фірмові папки формату А4 з висічним замком або вклеєною кишенею.',
                  icon: <FolderOpen size={30} style={{ color: 'var(--primary)' }} />,
                  color: 'rgba(0, 122, 255, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Папки',
                  metric: 'Висічний замок',
                  onClick: () => handleSelectCategory('Папки')
                },
                {
                  title: 'Плакати, Афіші',
                  desc: 'Великоформатний друк афіш А3, А2, А1, сітілайтів, бігбордів для реклами.',
                  icon: <Layout size={30} style={{ color: 'var(--primary)' }} />,
                  color: 'rgba(0, 122, 255, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Плакати',
                  metric: 'Великий формат',
                  onClick: () => handleSelectCategory('Плакати')
                },
                {
                  title: 'Пластикові карти',
                  desc: 'Дисконтні та клубні картки, магнітна смуга, ембосування, штрих-код.',
                  icon: <CreditCard size={30} style={{ color: '#6366f1' }} />,
                  color: 'rgba(99, 102, 241, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Пластик',
                  metric: 'Магнітна смуга',
                  onClick: () => { setMainCategoryTab('digital'); setDigitalSubTab('felling'); }
                },
                {
                  title: 'Полотна, Картини',
                  desc: 'Інтер\'єрний друк на натуральному художньому полотні з натяжкою на підрамник.',
                  icon: <Image size={30} style={{ color: '#0ea5e9' }} />,
                  color: 'rgba(14, 165, 233, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Полотно',
                  metric: 'Галерейна натяжка',
                  onClick: () => { setMainCategoryTab('wide'); setWideSubTab('canvas'); }
                },
                {
                  title: 'Постери',
                  desc: 'Якісні інтер\'єрні постери та плакати на преміальному матовому або фотопапері.',
                  icon: <Image size={30} style={{ color: '#3b82f6' }} />,
                  color: 'rgba(59, 130, 246, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Постери',
                  metric: 'Фотоякість',
                  onClick: () => { setMainCategoryTab('wide'); setWideSubTab('paper'); }
                },
                {
                  title: 'Рулонна етикетка',
                  desc: 'Флексодрук та цифровий друк самоклеючих етикеток у рулонах для автоматів.',
                  icon: <Tag size={30} style={{ color: '#f59e0b' }} />,
                  color: 'rgba(245, 158, 11, 0.1)',
                  badgeClass: 'ios-badge-orange',
                  badge: 'Рулон',
                  metric: 'Флексодрук',
                  onClick: () => setMainCategoryTab('roll')
                },
                {
                  title: 'Самоклеюча плівка',
                  desc: 'Друк на плівках ORACAL, Ritrama, прозорій, матовій, перфорованій One Way Vision.',
                  icon: <Tag size={30} style={{ color: '#ff9500' }} />,
                  color: 'rgba(255, 149, 0, 0.1)',
                  badgeClass: 'ios-badge-orange',
                  badge: 'Плівка',
                  metric: 'ORACAL / Ritrama',
                  onClick: () => { setMainCategoryTab('wide'); setWideSubTab('film'); }
                },
                {
                  title: 'Скретч-карти, Лотереї',
                  desc: 'Купони та акційні картки зі захисним скретч-шаром, що стирається монеткою.',
                  icon: <Sparkles size={30} style={{ color: '#ec4899' }} />,
                  color: 'rgba(236, 72, 153, 0.1)',
                  badgeClass: 'ios-badge-purple',
                  badge: 'Скретч',
                  metric: 'Стирання монетою',
                  onClick: () => { setMainCategoryTab('digital'); setDigitalSubTab('felling'); }
                },
                {
                  title: 'Таблички, Вивіски',
                  desc: 'Рекламні та навігаційні таблички з ПВХ-пластику, оргскла, алюмінієвого композиту.',
                  icon: <Layout size={30} style={{ color: 'var(--primary)' }} />,
                  color: 'rgba(0, 122, 255, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'ПВХ / Композит',
                  metric: 'Прямий УФ-друк',
                  onClick: () => { setMainCategoryTab('wide'); setWideSubTab('pvc'); }
                },
                {
                  title: 'Дипломи і палітурка',
                  desc: 'Тверда палітурка дипломних робіт, дисертацій з тисненням золотою фольгою.',
                  icon: <Sparkles size={30} style={{ color: '#34c759' }} />,
                  color: 'rgba(52, 199, 89, 0.1)',
                  badgeClass: 'ios-badge-green',
                  badge: 'Палітурка',
                  metric: 'Тиснення фольгою',
                  onClick: () => handleSelectCategory('Дипломи і палітурка')
                },
                {
                  title: 'Нотаріальні книги',
                  desc: 'Спеціалізовані нотаріальні реєстри у твердій прошивній палітурці за стандартами.',
                  icon: <BookOpen size={30} style={{ color: '#64748b' }} />,
                  color: 'rgba(100, 116, 139, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Реєстри',
                  metric: 'Тверда палітурка',
                  onClick: () => handleSelectCategory('Нотаріальні книги')
                },
                {
                  title: 'Шкільні журнали',
                  desc: 'Класні журнали успішності та шкільні облікові відомості у твердій палітурці.',
                  icon: <BookOpen size={30} style={{ color: '#ff3b30' }} />,
                  color: 'rgba(255, 59, 48, 0.1)',
                  badgeClass: 'ios-badge-red',
                  badge: 'Журнали',
                  metric: 'Шкільні реєстри',
                  keywords: ['журнал', 'журнали', 'класний', 'школа', 'облік', 'реєстр'],
                  onClick: () => handleSelectCategory('Шкільні журнали')
                }
              ];

              const q = productSearchQuery.trim().toLowerCase();
              const filteredProducts = q
                ? allProducts.filter(item => 
                    item.title.toLowerCase().includes(q) ||
                    item.desc.toLowerCase().includes(q) ||
                    item.badge.toLowerCase().includes(q) ||
                    item.metric.toLowerCase().includes(q) ||
                    (item.keywords && item.keywords.some((k: string) => k.toLowerCase().includes(q)))
                  )
                : allProducts;

              return (
                <div className="flex flex-col gap-4">
                  {productSearchQuery && (
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-700">
                        Результати пошуку за запитом <span className="text-blue-600">"{productSearchQuery}"</span> ({filteredProducts.length}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setProductSearchQuery('')}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Скинути фільтр
                      </button>
                    </div>
                  )}

                  {filteredProducts.length === 0 ? (
                    <div className="ios-card bg-white p-12 text-center rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
                      <Search size={32} className="text-slate-400" />
                      <p className="text-sm font-bold text-slate-700 m-0">Нічого не знайдено за запитом "{productSearchQuery}"</p>
                      <button
                        type="button"
                        onClick={() => setProductSearchQuery('')}
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100"
                      >
                        Показати всі вироби
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '20px'
                    }}>
                      {filteredProducts.map(item => (
                        <div 
                          key={item.title}
                          onClick={item.onClick}
                          className="ios-card bg-white"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: '200px',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                backgroundColor: item.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {item.icon}
                              </div>
                              <span className={`ios-badge ${item.badgeClass}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                                {item.badge}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                              {item.title}
                            </h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.4' }}>
                              {item.desc}
                            </p>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '0.5px solid var(--border-light)',
                            paddingTop: '12px',
                            marginTop: '16px'
                          }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-medium)' }}>
                              {item.metric}
                            </span>
                            <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '700' }}>
                              Відкрити <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          {/* TAB 2: OFFSET PRINTING (Overview & Sheet Detailed Calculator) */}
          {mainCategoryTab === 'offset' && (
            <div className="flex flex-col gap-6 md:gap-7">
              {offsetSubTab === 'overview' && (
                /* 4 Universal Technology Hero Cards - Unified Cupertino Blue Style */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                        Базові універсальні калькулятори
                      </h4>
                    </div>
                    <span className="ios-badge ios-badge-blue" style={{ fontSize: '11px', padding: '3px 9px' }}>
                      4 основні напрямки
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {[
                      { 
                        title: 'Листова продукція', 
                        badge: 'Збірні спуски', 
                        desc: 'Візитівки, листівки, бланки, буклети, наліпки, плакати, флаєри…', 
                        subTab: 'sheets', 
                        icon: <FileText size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Офсетні спуски'
                      },
                      { 
                        title: 'Висічна продукція', 
                        badge: 'Штампи', 
                        desc: 'Фігурні наліпки, папки, кишенькові календарі, бирки, підставки…', 
                        subTab: 'felling', 
                        icon: <Scissors size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Готові штампи'
                      },
                      { 
                        title: 'Багатосторінкова', 
                        badge: 'Брошурування', 
                        desc: 'Каталоги, журнали, брошури, блокноти на пружині, ресторанні меню…', 
                        subTab: 'multipage', 
                        icon: <BookOpen size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Скоба, PUR клей'
                      },
                      { 
                        title: 'Індивідуальний розрахунок', 
                        badge: 'Нестандартні', 
                        desc: 'Комплексні комерційні пропозиції з ручним підбором технологічних операцій.', 
                        subTab: 'custom', 
                        icon: <Settings size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Конструктор розрахунку'
                      }
                    ].map(item => (
                      <div
                        key={item.title}
                        onClick={() => setOffsetSubTab(item.subTab as any)}
                        className="ios-card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '22px 24px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          minHeight: '195px',
                          position: 'relative',
                          background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
                          border: '1.5px solid rgba(0, 122, 255, 0.22)',
                          boxShadow: '0 4px 18px rgba(0, 122, 255, 0.05)'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = 'translateY(-3px)'; 
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.12)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = 'translateY(0)'; 
                          e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.22)';
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 122, 255, 0.05)';
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '16px',
                              backgroundColor: 'rgba(0, 122, 255, 0.1)',
                              border: '1px solid rgba(0, 122, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0, 122, 255, 0.08)'
                            }}>
                              {item.icon}
                            </div>
                            <span className="ios-badge ios-badge-blue" style={{ fontSize: '11px', padding: '3px 8px' }}>
                              {item.badge}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.45' }}>
                            {item.desc}
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '0.5px solid rgba(0, 122, 255, 0.15)',
                          paddingTop: '12px',
                          marginTop: '16px'
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)' }}>
                            {item.metric}
                          </span>
                          <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '800', gap: '2px' }}>
                            Відкрити <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px 0 4px', borderTop: '0.5px solid var(--border-light)', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-medium)' }} />
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                        Каталог готової продукції
                      </h4>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: '600' }}>
                      17 окремих виробів
                    </span>
                  </div>
                </div>
              )}

              {/* OVERVIEW SUBTAB: 17 Offset Products in Exact Dashboard iOS Card Style */}
              {offsetSubTab === 'overview' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {[
                    {
                      id: 'vizitka',
                      title: 'Візитівка',
                      desc: 'Стандартні (90х50), євро (85х55), квадратні та круглі з ламінацією.',
                      icon: <CreditCard size={30} style={{ color: 'var(--primary)' }} />,
                      color: 'rgba(0, 122, 255, 0.1)',
                      badgeClass: 'ios-badge-blue',
                      badge: 'Візитки',
                      metric: 'Збірний спуск',
                      onClick: () => openOffsetProduct({ category: 'Візитки', subCategory: 'Візитівка', subTab: 'sheets', preset: '1', w: '90', h: '50', kind: '1' }),
                      formats: [
                        { name: '90×50', onClick: () => openOffsetProduct({ category: 'Візитки', subCategory: 'Візитівка', subTab: 'sheets', preset: '1', w: '90', h: '50', kind: '1' }) },
                        { name: '85×55', onClick: () => openOffsetProduct({ category: 'Візитки', subCategory: 'Візитівка', subTab: 'sheets', preset: '5', w: '85', h: '55', kind: '1' }) },
                        { name: '50×50', onClick: () => openOffsetProduct({ category: 'Візитки', subCategory: 'Візитівка', subTab: 'sheets', preset: '5', w: '50', h: '50', kind: '2' }) },
                        { name: 'Кругла', onClick: () => openOffsetProduct({ category: 'Візитки', subCategory: 'Візитівка', subTab: 'sheets', preset: '5', w: '50', h: '50', kind: '7' }) }
                      ]
                    },
                    {
                      id: 'calendar',
                      title: 'Календар кишеньковий',
                      desc: 'Кишенькові календарі 100х70 та 90х60 з двосторонньою ламінацією та скругленням.',
                      icon: <Calendar size={30} style={{ color: '#34c759' }} />,
                      color: 'rgba(52, 199, 89, 0.1)',
                      badgeClass: 'ios-badge-green',
                      badge: 'Ламінація',
                      metric: 'Ламінація 2+2',
                      onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календар', subTab: 'sheets', preset: '91', w: '100', h: '70', kind: '1' }),
                      formats: [
                        { name: '100×70', onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календар', subTab: 'sheets', preset: '91', w: '100', h: '70', kind: '1' }) },
                        { name: '90×60', onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календар', subTab: 'sheets', preset: '90', w: '90', h: '60', kind: '1' }) },
                        { name: '70×70', onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календар', subTab: 'sheets', preset: '256', w: '70', h: '70', kind: '2' }) }
                      ]
                    },
                    {
                      id: 'flyer',
                      title: 'Флаєр',
                      desc: 'Єврофлаєри (210х99) та міні-флаєри для промоакцій і рекламної роздачі.',
                      icon: <Zap size={30} style={{ color: '#af52de' }} />,
                      color: 'rgba(175, 82, 222, 0.1)',
                      badgeClass: 'ios-badge-purple',
                      badge: 'Євроформат',
                      metric: 'Євроформат',
                      onClick: () => openOffsetProduct({ category: 'Флаєри', subCategory: 'Флаєр', subTab: 'sheets', preset: '25', w: '99', h: '210', kind: '1' }),
                      formats: [
                        { name: '210×99', onClick: () => openOffsetProduct({ category: 'Флаєри', subCategory: 'Флаєр', subTab: 'sheets', preset: '25', w: '99', h: '210', kind: '1' }) },
                        { name: '210×198', onClick: () => openOffsetProduct({ category: 'Флаєри', subCategory: 'Флаєр', subTab: 'sheets', preset: '26', w: '198', h: '210', kind: '6' }) },
                        { name: '99×99', onClick: () => openOffsetProduct({ category: 'Флаєри', subCategory: 'Флаєр', subTab: 'sheets', preset: '24', w: '99', h: '99', kind: '2' }) }
                      ]
                    },
                    {
                      id: 'listivka',
                      title: 'Листівка',
                      desc: 'Рекламні листівки стандартних А-форматів (А7, А6, А5, А4, А3) на крейді.',
                      icon: <Image size={30} style={{ color: '#ff9500' }} />,
                      color: 'rgba(255, 149, 0, 0.1)',
                      badgeClass: 'ios-badge-orange',
                      badge: 'А-формати',
                      metric: 'А7-А3 формати',
                      onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '28', w: '70', h: '100', kind: '1' }),
                      formats: [
                        { name: 'А7', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '28', w: '70', h: '100', kind: '1' }) },
                        { name: 'А6', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '312', w: '105', h: '148', kind: '1' }) },
                        { name: 'А5', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '32', w: '148', h: '210', kind: '1' }) },
                        { name: 'А4', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '1' }) },
                        { name: 'А3', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '36', w: '297', h: '420', kind: '1' }) },
                        { name: 'Кругла', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '37', w: '70', h: '70', kind: '7' }) }
                      ]
                    },
                    {
                      id: 'plakat',
                      title: 'Плакати та постери',
                      desc: 'Великоформатний офсетний друк А3, В3, А2, В2, А1, В1 для реклами.',
                      icon: <Layout size={30} style={{ color: 'var(--primary)' }} />,
                      color: 'rgba(0, 122, 255, 0.1)',
                      badgeClass: 'ios-badge-blue',
                      badge: 'Великий формат',
                      metric: 'До В1 формату',
                      onClick: () => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: '36', w: '297', h: '420', kind: '1' }),
                      formats: [
                        { name: 'А3', onClick: () => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: '36', w: '297', h: '420', kind: '1' }) },
                        { name: 'В3', onClick: () => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: 'b3', w: '340', h: '490', kind: '1' }) },
                        { name: 'А2', onClick: () => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: '15', w: '420', h: '594', kind: '1' }) },
                        { name: 'В2', onClick: () => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: 'b2', w: '480', h: '690', kind: '1' }) },
                        { name: 'А1', onClick: () => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: '16', w: '594', h: '841', kind: '1' }) },
                        { name: 'B1', onClick: () => openOffsetProduct({ category: 'Плакати', subCategory: 'Плакати', subTab: 'sheets', preset: 'b1', w: '680', h: '980', kind: '1' }) }
                      ]
                    },
                    {
                      id: 'sets',
                      title: 'Сети / Плейсмати',
                      desc: 'Одноразові ресторанні підкладки на стіл з офсетного або крафт-паперу.',
                      icon: <Utensils size={30} style={{ color: '#34c759' }} />,
                      color: 'rgba(52, 199, 89, 0.1)',
                      badgeClass: 'ios-badge-green',
                      badge: 'HoReCa',
                      metric: 'Ресторанні сети',
                      onClick: () => openOffsetProduct({ category: 'Сети', subCategory: 'Сети', subTab: 'sheets', preset: 'sets_a3', w: '420', h: '297', kind: '1' }),
                      formats: [
                        { name: 'А3 (420×297)', onClick: () => openOffsetProduct({ category: 'Сети', subCategory: 'Сети', subTab: 'sheets', preset: 'sets_a3', w: '420', h: '297', kind: '1' }) },
                        { name: 'В3 (490×340)', onClick: () => openOffsetProduct({ category: 'Сети', subCategory: 'Сети', subTab: 'sheets', preset: 'sets_b3', w: '490', h: '340', kind: '1' }) }
                      ]
                    },
                    {
                      id: 'buklet',
                      title: 'Буклет (12 видів)',
                      desc: 'Рекламні буклети: книжка, намотування, гармошка, вікно, комбіновані.',
                      icon: <BookOpen size={30} style={{ color: 'var(--primary)' }} />,
                      color: 'rgba(0, 122, 255, 0.1)',
                      badgeClass: 'ios-badge-blue',
                      badge: 'Фальцовка',
                      metric: '1-5 фальців',
                      onClick: () => openOffsetProduct({ category: 'Буклети', subCategory: 'Буклет', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '6' }),
                      formats: [
                        { name: 'А4 в Євро', onClick: () => openOffsetProduct({ category: 'Буклети', subCategory: 'Буклет', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '6' }) },
                        { name: '2Євро в Євро', onClick: () => openOffsetProduct({ category: 'Буклети', subCategory: 'Буклет', subTab: 'sheets', preset: '26', w: '198', h: '210', kind: '6' }) },
                        { name: 'А6', onClick: () => openOffsetProduct({ category: 'Буклети', subCategory: 'Буклет', subTab: 'sheets', preset: '312', w: '105', h: '148', kind: '6' }) },
                        { name: 'А5', onClick: () => openOffsetProduct({ category: 'Буклети', subCategory: 'Буклет', subTab: 'sheets', preset: '32', w: '148', h: '210', kind: '6' }) },
                        { name: 'А4', onClick: () => openOffsetProduct({ category: 'Буклети', subCategory: 'Буклет', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '6' }) }
                      ]
                    },
                    {
                      id: 'katalog',
                      title: 'Каталог / Брошура',
                      desc: 'Багатосторінкові видання зі скріпленням на скобу, пружину або PUR термоклей.',
                      icon: <BookOpen size={30} style={{ color: '#af52de' }} />,
                      color: 'rgba(175, 82, 222, 0.1)',
                      badgeClass: 'ios-badge-purple',
                      badge: 'Багатосторінкова',
                      metric: 'Скоба / PUR клей',
                      onClick: () => openOffsetProduct({ category: 'Книги', subCategory: 'Каталог', subTab: 'multipage', stitching: '1' }),
                      formats: [
                        { name: 'Скоба', onClick: () => openOffsetProduct({ category: 'Книги', subCategory: 'Каталог', subTab: 'multipage', stitching: '1' }) },
                        { name: 'Пружина', onClick: () => openOffsetProduct({ category: 'Книги', subCategory: 'Каталог', subTab: 'multipage', stitching: '2' }) },
                        { name: 'PUR Клей', onClick: () => openOffsetProduct({ category: 'Книги', subCategory: 'Каталог', subTab: 'multipage', stitching: '3' }) }
                      ]
                    },
                    {
                      id: 'bloknot',
                      title: 'Блокнот на пружині',
                      desc: 'Фірмові корпоративні блокноти з кольоровою обкладинкою та пружиною.',
                      icon: <Bookmark size={30} style={{ color: '#0ea5e9' }} />,
                      color: 'rgba(14, 165, 233, 0.1)',
                      badgeClass: 'ios-badge-blue',
                      badge: 'Пружина',
                      metric: '25-100 аркушів',
                      onClick: () => { setOffsetSubTab('notebooks'); setNotebookPrintMethod('offset'); },
                      formats: [
                        { name: 'А6', onClick: () => { setOffsetSubTab('notebooks'); setNotebookPrintMethod('offset'); setNotebookWidth('105'); setNotebookHeight('148'); setNotebookStandardSize('105x148'); } },
                        { name: 'А5', onClick: () => { setOffsetSubTab('notebooks'); setNotebookPrintMethod('offset'); setNotebookWidth('148'); setNotebookHeight('210'); setNotebookStandardSize('148x210'); } },
                        { name: 'А4', onClick: () => { setOffsetSubTab('notebooks'); setNotebookPrintMethod('offset'); setNotebookWidth('210'); setNotebookHeight('297'); setNotebookStandardSize('210x297'); } },
                        { name: 'Євро', onClick: () => { setOffsetSubTab('notebooks'); setNotebookPrintMethod('offset'); setNotebookWidth('99'); setNotebookHeight('210'); setNotebookStandardSize('99x210'); } }
                      ]
                    },
                    {
                      id: 'nalipka',
                      title: 'Наліпка / Стікер',
                      desc: 'Самоклеючі етикетки на папері Raflatac з просічкою або плотерною надсічкою.',
                      icon: <Tag size={30} style={{ color: '#ff9500' }} />,
                      color: 'rgba(255, 149, 0, 0.1)',
                      badgeClass: 'ios-badge-orange',
                      badge: 'Самоклейка',
                      metric: 'Raflatac / плівка',
                      onClick: () => openOffsetProduct({ category: 'Наклейки', subCategory: 'Наліпка', subTab: 'sheets', preset: '1', w: '90', h: '50', kind: '1' }),
                      formats: [
                        { name: '90×50', onClick: () => openOffsetProduct({ category: 'Наклейки', subCategory: 'Наліпка', subTab: 'sheets', preset: '1', w: '90', h: '50', kind: '1' }) },
                        { name: '50×50', onClick: () => openOffsetProduct({ category: 'Наклейки', subCategory: 'Наліпка', subTab: 'sheets', preset: '5', w: '50', h: '50', kind: '2' }) },
                        { name: 'Кругла', onClick: () => openOffsetProduct({ category: 'Наклейки', subCategory: 'Наліпка', subTab: 'sheets', preset: '5', w: '50', h: '50', kind: '7' }) },
                        { name: 'Овальна', onClick: () => openOffsetProduct({ category: 'Наклейки', subCategory: 'Наліпка', subTab: 'sheets', preset: '1', w: '90', h: '50', kind: '8' }) }
                      ]
                    },
                    {
                      id: 'papka',
                      title: 'Папка А4',
                      desc: 'Корпоративні фірмові папки для документів з висічним замком та кишенею.',
                      icon: <FolderOpen size={30} style={{ color: 'var(--primary)' }} />,
                      color: 'rgba(0, 122, 255, 0.1)',
                      badgeClass: 'ios-badge-blue',
                      badge: 'Висічний замок',
                      metric: 'Висічний замок',
                      onClick: () => openOffsetProduct({ category: 'Папки', subCategory: 'Папка А4', subTab: 'sheets', preset: '34', w: '210', h: '297', folderSpine: '5' }),
                      formats: [
                        { name: 'Без корінця', onClick: () => openOffsetProduct({ category: 'Папки', subCategory: 'Папка А4', subTab: 'sheets', preset: '34', w: '210', h: '297', folderSpine: '0', folderRezinka: 'none' }) },
                        { name: 'Корінець 5мм', onClick: () => openOffsetProduct({ category: 'Папки', subCategory: 'Папка А4', subTab: 'sheets', preset: '34', w: '210', h: '297', folderSpine: '5', folderRezinka: 'none' }) },
                        { name: 'З резинкою', onClick: () => openOffsetProduct({ category: 'Папки', subCategory: 'Папка А4', subTab: 'sheets', preset: '34', w: '210', h: '297', folderSpine: '5', folderRezinka: 'blue' }) }
                      ]
                    },
                    {
                      id: 'listivka_fig',
                      title: 'Листівка фігурна',
                      desc: 'Листівки з індивідуальною висічкою, біговкою, скругленням або європідвісом.',
                      icon: <Scissors size={30} style={{ color: '#34c759' }} />,
                      color: 'rgba(52, 199, 89, 0.1)',
                      badgeClass: 'ios-badge-green',
                      badge: 'Біговка',
                      metric: 'Штамп / біговка',
                      onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '32', w: '148', h: '210', kind: '1' }),
                      formats: [
                        { name: 'Одинарна', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '32', w: '148', h: '210', kind: '1' }) },
                        { name: 'Складна', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '6' }) },
                        { name: 'Кругла', onClick: () => openOffsetProduct({ category: 'Листівки', subCategory: 'Листівка', subTab: 'sheets', preset: '37', w: '70', h: '70', kind: '7' }) }
                      ]
                    },
                    {
                      id: 'sitky',
                      title: 'Календарні сітки',
                      desc: 'Стандартні та металізовані 3-секційні календарні сітки на 2026/2027 роки.',
                      icon: <Calendar size={30} style={{ color: 'var(--primary)' }} />,
                      color: 'rgba(0, 122, 255, 0.1)',
                      badgeClass: 'ios-badge-blue',
                      badge: '2026/2027',
                      metric: '2026/2027 рік',
                      onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарні сітки', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '1' }),
                      formats: [
                        { name: 'Сітки 2026', onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарні сітки', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '1' }) },
                        { name: 'Металік / Золото', onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарні сітки', subTab: 'sheets', preset: '34', w: '210', h: '297', kind: '1' }) }
                      ]
                    },
                    {
                      id: 'sheets_print',
                      title: 'Друк в листах',
                      desc: 'Офсетний друк на повних друкарських листах А2, В2, А1, В1 без порізки на вироби.',
                      icon: <Layers size={30} style={{ color: '#af52de' }} />,
                      color: 'rgba(175, 82, 222, 0.1)',
                      badgeClass: 'ios-badge-purple',
                      badge: 'Без порізки',
                      metric: 'Повні листи',
                      onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Друк в листах', subTab: 'sheets', preset: '15', w: '420', h: '594', kind: '1' }),
                      formats: [
                        { name: 'А2', onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Друк в листах', subTab: 'sheets', preset: '15', w: '420', h: '594', kind: '1' }) },
                        { name: 'В2', onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Друк в листах', subTab: 'sheets', preset: 'b2', w: '480', h: '690', kind: '1' }) },
                        { name: 'А1', onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Друк в листах', subTab: 'sheets', preset: '16', w: '594', h: '841', kind: '1' }) },
                        { name: 'B1', onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Друк в листах', subTab: 'sheets', preset: 'b1', w: '680', h: '980', kind: '1' }) }
                      ]
                    },
                    {
                      id: 'envelope',
                      title: 'Конверт',
                      desc: 'Фірмовий офсетний друк на готових конвертах: Євро (DL), С6, С5, С4.',
                      icon: <Mail size={30} style={{ color: 'var(--primary)' }} />,
                      color: 'rgba(0, 122, 255, 0.1)',
                      badgeClass: 'ios-badge-blue',
                      badge: 'Корпоративний',
                      metric: 'Євро DL, C6-C4',
                      onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Конверт', subTab: 'sheets', preset: '25', w: '110', h: '220', envelopeFormat: 'E65' }),
                      formats: [
                        { name: 'Євро DL', onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Конверт', subTab: 'sheets', preset: '25', w: '110', h: '220', envelopeFormat: 'E65' }) },
                        { name: 'С6', onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Конверт', subTab: 'sheets', preset: '21', w: '114', h: '162', envelopeFormat: 'C6' }) },
                        { name: 'С5', onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Конверт', subTab: 'sheets', preset: '32', w: '162', h: '229', envelopeFormat: 'C5' }) },
                        { name: 'С4', onClick: () => openOffsetProduct({ category: 'Бланки', subCategory: 'Конверт', subTab: 'sheets', preset: '34', w: '229', h: '324', envelopeFormat: 'C4' }) }
                      ]
                    },
                    {
                      id: 'calendar_vis',
                      title: 'Календарі висічні',
                      desc: 'Настільні об\'ємні календарі-будиночки та пірамідки з висічним замком.',
                      icon: <Clock size={30} style={{ color: '#ff9500' }} />,
                      color: 'rgba(255, 149, 0, 0.1)',
                      badgeClass: 'ios-badge-orange',
                      badge: 'Настільні',
                      metric: 'Готові штампи',
                      onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарі висічні', subTab: 'felling', preset: '160', w: '210', h: '300', stamp: '160' }),
                      formats: [
                        { name: 'Будинок', onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарі висічні', subTab: 'felling', preset: '160', w: '210', h: '300', stamp: '160' }) },
                        { name: 'Пірамідка', onClick: () => openOffsetProduct({ category: 'Календарі кишенькові', subCategory: 'Календарі висічні', subTab: 'felling', preset: '161', w: '305', h: '134', stamp: '161' }) }
                      ]
                    },
                    {
                      id: 'wrap_paper',
                      title: 'Пакувальний папір',
                      desc: 'Друк подарункового та пакувального паперу на крафті чи офсеті в листах.',
                      icon: <Package size={30} style={{ color: '#0ea5e9' }} />,
                      color: 'rgba(14, 165, 233, 0.1)',
                      badgeClass: 'ios-badge-blue',
                      badge: 'Крафт / Офсет',
                      metric: 'Крафт в листах',
                      onClick: () => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('36'); setSheetCustomWidth('297'); setSheetCustomHeight('420'); handleSelectCategory('Бланки'); },
                      formats: [
                        { name: 'А3', onClick: () => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('36'); setSheetCustomWidth('297'); setSheetCustomHeight('420'); handleSelectCategory('Бланки'); } },
                        { name: 'В3', onClick: () => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('b3'); setSheetCustomWidth('340'); setSheetCustomHeight('490'); handleSelectCategory('Бланки'); } },
                        { name: 'А2', onClick: () => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('15'); setSheetCustomWidth('420'); setSheetCustomHeight('594'); handleSelectCategory('Бланки'); } },
                        { name: 'В2', onClick: () => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('b2'); setSheetCustomWidth('480'); setSheetCustomHeight('690'); handleSelectCategory('Бланки'); } },
                        { name: 'А1', onClick: () => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('16'); setSheetCustomWidth('594'); setSheetCustomHeight('841'); handleSelectCategory('Бланки'); } },
                        { name: 'B1', onClick: () => { setOffsetSubTab('sheets'); setCardKind('1'); setSheetSizePreset('b1'); setSheetCustomWidth('680'); setSheetCustomHeight('980'); handleSelectCategory('Бланки'); } }
                      ]
                    }
                  ].map(item => (
                    <div
                      key={item.id}
                      onClick={item.onClick}
                      className="ios-card bg-white"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minHeight: '200px',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            backgroundColor: item.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {item.icon}
                          </div>
                          <span className={`ios-badge ${item.badgeClass}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                            {item.badge}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.4' }}>
                          {item.desc}
                        </p>

                        {/* Format Chips */}
                        {item.formats && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                            {item.formats.map(fmt => (
                              <button
                                key={fmt.name}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fmt.onClick();
                                }}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--bg-system)',
                                  border: '0.5px solid var(--border-light)',
                                  color: 'var(--text-dark)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                                  e.currentTarget.style.color = '#ffffff';
                                  e.currentTarget.style.borderColor = 'var(--primary)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-system)';
                                  e.currentTarget.style.color = 'var(--text-dark)';
                                  e.currentTarget.style.borderColor = 'var(--border-light)';
                                }}
                              >
                                {fmt.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer of card */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '0.5px solid var(--border-light)',
                        paddingTop: '12px',
                        marginTop: '16px'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-medium)' }}>
                          {item.metric}
                        </span>
                        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '700' }}>
                          Розрахувати <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DETAILED SHEET CALCULATOR (Офсетний друк / Листова) */}
              {offsetSubTab === 'sheets' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  {/* Sub-header Bar: [ ← ] Back | ОПЦІЯ / КАТЕГОРІЯ | [ X ] Close */}
                  <div className="ios-card bg-white" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', border: '1px solid #e2e8f0' }}>
                    <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                      <button
                        type="button"
                        onClick={() => setOffsetSubTab('overview')}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Повернутися до каталогу"
                      >
                        <ArrowLeft size={16} />
                        <span>Назад</span>
                      </button>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                          <span>Офсетний друк</span>
                          <span>/</span>
                          <span className="text-blue-600">{(category as string) || 'Листова продукція'}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 leading-tight">
                          {(category as string) === 'Бланки' ? subCategory : (category as string)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTempNorms(norms);
                          setShowMaterialPricesModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-2xs"
                        title="Прайс та тарифи на папери і післядрукарські роботи"
                      >
                        <Layers size={14} className="text-blue-600" />
                        <span>Ціни на матеріали</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById('detailed-sheet-calculation')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-100 transition-colors shadow-2xs"
                      >
                        <Settings size={14} />
                        <span>Кошторис</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOffsetSubTab('overview')}
                        className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 font-bold text-sm flex items-center justify-center transition-colors shadow-2xs"
                        title="Закрити сторінку продукту"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Product Kind / Folding Type Selection Bar */}
                  <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                        ВИД / ГЕОМЕТРІЯ
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">Оберіть базовий вид або геометрію виробу</span>
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
                              {renderFoldThumbnail(fold.folding, isActive)}
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
                                    : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
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
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0"> Параметри висічної папки А4</h4>
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
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0"> Конфігуратор фірмового блокнота на пружині</h4>
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
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0"> Параметри фірмового конверта</h4>
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
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider m-0"> Параметри календарної сітки для квартальних календарів</h4>
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
                  <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7">
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
                          <button
                            type="button"
                            onClick={() => {
                              const temp = sheetCustomWidth;
                              setSheetCustomWidth(sheetCustomHeight);
                              setSheetCustomHeight(temp);
                              setSheetSizePreset('custom');
                              const newW = Number(sheetCustomHeight) || 0;
                              const newH = Number(temp) || 0;
                              setSheetOrientation(newW >= newH ? 'horiz' : 'vert');
                            }}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                            title="Поміняти ширину та висоту місцями (⇄)"
                          >
                            <ArrowLeftRight size={13} />
                          </button>
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

                      {/* Standard Format Pills to Fill Layout Space */}
                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                            {(category as string) === 'Буклети' ? 'Стандартні розміри буклетів:' : 'Стандартні формати:'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">Швидкий вибір</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {((category as string) === 'Буклети'
                            ? [
                                { label: 'Євробуклет А4 (2 згини)', w: '297', h: '210', fold: '21', desc: 'У згині 100×210' },
                                { label: 'Міні-буклет А5 (2 згини)', w: '210', h: '148', fold: '21', desc: 'У згині 70×148' },
                                { label: 'Буклет А3 (2 згини)', w: '420', h: '297', fold: '21', desc: 'У згині 140×297' },
                                { label: 'Книжка А4 в А5 (1 згин)', w: '297', h: '210', fold: '20', desc: 'У згині 148×210' },
                                { label: 'Книжка А3 в А4 (1 згин)', w: '420', h: '297', fold: '20', desc: 'У згині 210×297' },
                                { label: 'Книжка А5 в А6 (1 згин)', w: '210', h: '148', fold: '20', desc: 'У згині 105×148' },
                                { label: 'Квадрат 200×200 (2 згини)', w: '600', h: '200', fold: '21', desc: 'У згині 200×200' },
                                { label: 'Квадрат 150×150 (2 згини)', w: '450', h: '150', fold: '21', desc: 'У згині 150×150' },
                                { label: 'Гармошка 3 згини (4 пол.)', w: '396', h: '210', fold: '23', desc: 'У згині 99×210' },
                                { label: 'Віконце Gate-fold', w: '297', h: '210', fold: '22', desc: 'У згині 148×210' },
                                { label: 'Мапа / План 4 згини', w: '420', h: '594', fold: '24', desc: 'Складна схема' },
                              ]
                            : [
                                { label: 'А4 (210 × 297 мм)', w: '210', h: '297', fold: '', desc: 'Стандарт' },
                                { label: 'А5 (148 × 210 мм)', w: '148', h: '210', fold: '', desc: 'Листівка' },
                                { label: 'А6 (105 × 148 мм)', w: '105', h: '148', fold: '', desc: 'Флаєр А6' },
                                { label: 'Єврофлаєр (99 × 210 мм)', w: '99', h: '210', fold: '', desc: 'DL формат' },
                                { label: 'А3 (297 × 420 мм)', w: '297', h: '420', fold: '', desc: 'Плакат' },
                                { label: 'Візитка (90 × 50 мм)', w: '90', h: '50', fold: '', desc: 'Стандарт' },
                                { label: 'Євровізитка (85 × 55 мм)', w: '85', h: '55', fold: '', desc: 'Євро' },
                                { label: 'Календарик (100 × 70 мм)', w: '100', h: '70', fold: '', desc: 'Кишеньковий' },
                                { label: 'Квадрат (105 × 105 мм)', w: '105', h: '105', fold: '', desc: 'Кубик' },
                              ]
                          ).map((sz, idx) => {
                            const isCurrent = sheetCustomWidth === sz.w && sheetCustomHeight === sz.h && (!sz.fold || postFolding === sz.fold);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSheetCustomWidth(sz.w);
                                  setSheetCustomHeight(sz.h);
                                  setSheetSizePreset('custom');
                                  if ((category as string) === 'Буклети' || sz.fold) {
                                    setTurnType('chuzhyi_oborut');
                                  }
                                  if (sz.fold) {
                                    setPostFolding(sz.fold);
                                  }
                                }}
                                className={`px-3 py-2 rounded-xl text-left flex flex-col justify-center transition-all border ${
                                  isCurrent
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20 font-black'
                                    : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 text-slate-700 shadow-2xs'
                                }`}
                              >
                                <span className={`text-[11px] font-extrabold truncate ${isCurrent ? 'text-white' : 'text-slate-800'}`}>{sz.label}</span>
                                <span className={`text-[9.5px] font-semibold ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>{sz.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: ВІЗУАЛ / РОЗГОРТКА */}
                    <div className="bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-between text-center min-h-[220px]">
                      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-200/60">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                          ВІЗУАЛІЗАЦІЯ & РОЗГОРТКА
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {(Number(sheetCustomWidth) || 0) >= (Number(sheetCustomHeight) || 0) ? 'Горизонтальний' : 'Вертикальний'}
                        </span>
                      </div>

                      {(category as string) === 'Буклети' ? (
                        <div className="py-2 w-full flex items-center justify-center">
                          {renderBookletFoldBlueprint(
                            postFolding || '21',
                            sheetCustomWidth || '297',
                            sheetCustomHeight || '210',
                            sheetUnit || 'мм',
                            (Number(sheetCustomWidth) || 0) >= (Number(sheetCustomHeight) || 0) ? 'horiz' : 'vert',
                            () => {
                              const temp = sheetCustomWidth;
                              setSheetCustomWidth(sheetCustomHeight);
                              setSheetCustomHeight(temp);
                              setSheetSizePreset('custom');
                              const newW = Number(sheetCustomHeight) || 0;
                              const newH = Number(temp) || 0;
                              setSheetOrientation(newW >= newH ? 'horiz' : 'vert');
                            }
                          )}
                        </div>
                      ) : (
                        <div className="py-3 flex flex-col items-center justify-center">
                          {/* Visual scaled representation rectangle */}
                          <div
                            style={{
                              width: (Number(sheetCustomWidth) || 0) >= (Number(sheetCustomHeight) || 0) ? '185px' : '125px',
                              height: (Number(sheetCustomWidth) || 0) >= (Number(sheetCustomHeight) || 0) ? '120px' : '175px',
                              borderRadius: cardKind === '7' || cardKind === '8' ? '50%' : cardKind === '9' ? '16px' : '6px'
                            }}
                            className="border-2 border-dashed border-blue-500 bg-white flex flex-col items-center justify-center shadow-sm transition-all relative"
                          >
                            <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                              {sheetCustomWidth} × {sheetCustomHeight} {sheetUnit}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 mt-1">
                              Розмір готового виробу
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                const temp = sheetCustomWidth;
                                setSheetCustomWidth(sheetCustomHeight);
                                setSheetCustomHeight(temp);
                                setSheetSizePreset('custom');
                                const newW = Number(sheetCustomHeight) || 0;
                                const newH = Number(temp) || 0;
                                setSheetOrientation(newW >= newH ? 'horiz' : 'vert');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
                            >
                              <RotateCcw size={13} />
                              <span>Змінити орієнтацію</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Strip: Розгортка / Розмір у розкладці */}
                      <div className="w-full bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="text-slate-500 font-semibold">Розмір у розкладці (з вильотами 2мм):</span>
                        </div>
                        <strong className="text-slate-900 font-mono font-bold">
                          {Number(sheetCustomWidth) + 4} × {Number(sheetCustomHeight) + 4} {sheetUnit}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side 2 Columns (50% / 50%): Left = Materials Filter & Sets, Right = Postpress */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 items-stretch">
                    {/* Left Column (50%): Filter Options & Sets Counter */}
                    <div className="flex flex-col gap-4">
                      {/* Filter Options (Materials, Coating, Color Printing) */}
                      <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex-1">
                        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 m-0">
                            Фільтр специфікацій та матеріалів
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">Параметри матриці</span>
                        </div>

                        <div className="flex flex-col divide-y divide-slate-100">
                          {/* Row 1: Material Options */}
                          <div className="p-3.5 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">МАТЕРІАЛ:</span>
                            <div className="flex gap-1.5 flex-wrap items-center">
                              {[
                                { id: 'gazetka_45', label: 'Газетка 45' },
                                { id: 'offset_65', label: 'Офсет 65' },
                                { id: 'offset_70', label: 'Офсет 70' },
                                { id: '80', label: 'Офсет 80' },
                                { id: 'offset_100', label: 'Офсет 100' },
                                { id: 'offset_120', label: 'Офсет 120' },
                                { id: 'offset_160', label: 'Офсет 160' },
                                { id: 'samokopir_55', label: 'Самокопірка 55' },
                                { id: 'kraft_70', label: 'Крафт 70' },
                                { id: '90', label: 'Крейда МАТ 90' },
                                { id: '115', label: 'Крейда МАТ 115' },
                                { id: '130', label: 'Крейда МАТ 130' },
                                { id: '150', label: 'Крейда МАТ 150' },
                                { id: '170', label: 'Крейда МАТ 170' },
                                { id: '250', label: 'Крейда МАТ 250' },
                                { id: '300', label: 'Крейда МАТ 300' },
                                { id: '350', label: 'Крейда МАТ 350' },
                                { id: '450', label: 'Крейда МАТ 450' },
                                { id: 'linen_300', label: 'Льон 300' },
                                { id: 'tintoretto_crema', label: 'Tintoretto 300' },
                                { id: 'stardream_opal', label: 'Stardream 285' }
                              ].map(mat => {
                                const isSel = selectedMaterials.includes(mat.id);
                                return (
                                  <button
                                    key={mat.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedMaterials(prev => 
                                        prev.includes(mat.id) ? [] : [mat.id]
                                      );
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                      isSel
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-black'
                                        : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
                                    }`}
                                  >
                                    {mat.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Row 2: Coating Options */}
                          <div className="p-3.5 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">ПОКРИТТЯ:</span>
                            <div className="flex gap-1.5 flex-wrap items-center">
                              {[
                                { id: '0', label: 'БП' },
                                { id: '7', label: 'ГЛ лам 1+0' },
                                { id: '8', label: 'ГЛ лам 1+1' },
                                { id: '9', label: 'МАТ лам 1+0' },
                                { id: '10', label: 'МАТ лам 1+1' },
                                { id: '30', label: 'SOFT лам 1+0' },
                                { id: '31', label: 'SOFT лам 1+1' },
                                { id: 'uv_10', label: 'УФ ЛАК 1+0' },
                                { id: 'uv_11', label: 'УФ ЛАК 1+1' }
                              ].map(cov => {
                                const isSel = selectedCoverings.includes(cov.id);
                                return (
                                  <button
                                    key={cov.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCoverings(prev => 
                                        prev.includes(cov.id)
                                          ? (prev.length > 1 ? prev.filter(c => c !== cov.id) : prev)
                                          : [...prev, cov.id]
                                      );
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                      isSel
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-black'
                                        : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
                                    }`}
                                  >
                                    {cov.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Row 3: Color Printing Options */}
                          <div className="p-3.5 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">ДРУК:</span>
                            <div className="flex gap-1.5 flex-wrap items-center">
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
                                        prev.includes(col.id)
                                          ? (prev.length > 1 ? prev.filter(c => c !== col.id) : prev)
                                          : [...prev, col.id]
                                      );
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                      isSel
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-black'
                                        : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
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


                    </div>

                    {/* Right Column (50%): Післядрукарська обробка */}
                    <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col h-full">
                      <div className="px-5 py-3.5 bg-slate-50/90 flex items-center justify-between border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <SlidersHorizontal size={18} className="text-blue-600" />
                          <h4 className="text-sm font-bold text-slate-900 m-0">Післядрукарська обробка (Нормативи 1С)</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPostPersonalization('0'); setPostLuvers('0'); setPostLuversCount(1);
                            setPostCorners('0'); setPostGluing('0'); setPostDrilling('0');
                            setPostFolding('0'); setPostCreasing('0'); setPostPerforation('0');
                            setPostPackingText('');
                          }}
                          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors shadow-2xs"
                        >
                          Очистити
                        </button>
                      </div>

                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white flex-1">
                        {/* 1. Персоналізація */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Персоналізація</label>
                          <select value={postPersonalization} onChange={(e) => setPostPersonalization(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                            <option value="0">Ні</option>
                            <option value="1">Є — змінні дані (+0.35 ₴/шт)</option>
                          </select>
                        </div>

                        {/* 2. Люверс */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Люверс</label>
                          <div className="flex gap-1.5">
                            <select value={postLuvers} onChange={(e) => setPostLuvers(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Ні</option>
                              <option value="93">Золотий (+1.20 ₴/шт)</option>
                              <option value="92">Срібний (+1.20 ₴/шт)</option>
                            </select>
                            {postLuvers !== '0' && (
                              <input type="number" value={postLuversCount} onChange={(e) => setPostLuversCount(parseInt(e.target.value) || 1)} min={1} className="w-14 px-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-center" />
                            )}
                          </div>
                        </div>

                        {/* 3. Закруглення кутів */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Закруглення кутів</label>
                          <select value={postCorners} onChange={(e) => setPostCorners(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                            <option value="0">Ні</option>
                            <option value="4">4 кути (+0.15 ₴/шт)</option>
                            <option value="1">1 кут (+0.15 ₴/шт)</option>
                            <option value="2">2 кути (+0.15 ₴/шт)</option>
                            <option value="3">3 кути (+0.15 ₴/шт)</option>
                          </select>
                        </div>

                        {/* 4. Проклейка в блок */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Проклейка в блок</label>
                          <div className="flex gap-1.5">
                            <select value={postGluing} onChange={(e) => setPostGluing(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Ні</option>
                              <option value="25">25 листів (+0.20 ₴)</option>
                              <option value="50">50 листів (+0.20 ₴)</option>
                              <option value="100">100 листів (+0.20 ₴)</option>
                            </select>
                            {postGluing !== '0' && (
                              <select value={postGluingSide} onChange={(e) => setPostGluingSide(e.target.value)} className="w-24 px-1.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                                <option value="1">По короткій</option>
                                <option value="2">По довгій</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* 5. Свердління */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Свердління</label>
                          <div className="flex gap-1.5">
                            <select value={postDrilling} onChange={(e) => setPostDrilling(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Ні</option>
                              <option value="1">1 отвір (+0.15 ₴)</option>
                              <option value="2">2 отвори (+0.30 ₴)</option>
                              <option value="3">3 отвори (+0.45 ₴)</option>
                              <option value="4">4 отвори (+0.60 ₴)</option>
                            </select>
                            {postDrilling !== '0' && (
                              <select value={postDrillingDia} onChange={(e) => setPostDrillingDia(e.target.value)} className="w-20 px-1.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                                <option value="3">Ø 3 мм</option>
                                <option value="4">Ø 4 мм</option>
                                <option value="5">Ø 5 мм</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* 6. Згинання (Фальцовка) */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Згинання / Фальцовка</label>
                          <div className="flex gap-1.5">
                            <select value={postFolding} onChange={(e) => setPostFolding(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                              <option value="0">Ні</option>
                              <option value="1">1 Згинання навпіл ({norms.foldingPrice} ₴)</option>
                              <option value="121">1 Згинання асиметрія ({norms.foldingPrice} ₴)</option>
                              <option value="21">2 Згинання намотка ({norms.foldingPrice * 2} ₴)</option>
                              <option value="22">2 Згинання гармошка ({norms.foldingPrice * 2} ₴)</option>
                              <option value="23">2 Згинання вікно ({norms.foldingPrice * 2} ₴)</option>
                              <option value="31">3 Згинання намотка ({norms.foldingPrice * 3} ₴)</option>
                              <option value="32">3 Згинання гармошка ({norms.foldingPrice * 3} ₴)</option>
                              <option value="41">4 Згинання ({norms.foldingPrice * 4} ₴)</option>
                              <option value="52">5 Згинань ({norms.foldingPrice * 5} ₴)</option>
                            </select>
                            {postFolding === '121' && (
                              <input
                                type="number"
                                value={postFoldingOffset}
                                onChange={(e) => setPostFoldingOffset(e.target.value)}
                                placeholder="мм"
                                className="w-14 px-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-center"
                              />
                            )}
                          </div>
                        </div>

                        {/* 7. Біговка */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Біговка</label>
                          <select value={postCreasing} onChange={(e) => setPostCreasing(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                            <option value="0">Ні</option>
                            {[1,2,3,4,5,6].map(n => (
                              <option key={n} value={n.toString()}>{n} {n === 1 ? 'біг' : 'біги'} ({n * norms.foldingPrice} ₴)</option>
                            ))}
                          </select>
                        </div>

                        {/* 8. Перфорація */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Перфорація</label>
                          <select value={postPerforation} onChange={(e) => setPostPerforation(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                            <option value="0">Ні</option>
                            {[1,2,3,4].map(n => (
                              <option key={n} value={n.toString()}>{n} {n === 1 ? 'прохід' : 'проходи'} ({n * 0.15} ₴)</option>
                            ))}
                          </select>
                        </div>

                        {/* 9. Розфасовка (full span in right card) */}
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Розфасовка (упаковка)</label>
                          <input
                            type="text"
                            value={postPackingText}
                            onChange={(e) => setPostPackingText(e.target.value)}
                            placeholder="наприклад: по 100, 200 шт"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Calculation Matrix Table */}
                  <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
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
                            за тираж
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
                        <thead className="bg-slate-200/95 border-b-2 border-slate-300">
                          <tr className="text-slate-800 text-xs font-black uppercase tracking-wider">
                            <th className="py-3 px-4 text-left border-r border-slate-300 min-w-[140px] text-slate-900 font-black">Матеріал та покриття</th>
                            <th className="py-3 px-3 border-r border-slate-300 text-slate-900 font-black">Друк</th>
                            <th className="py-3 px-3 border-r border-slate-300 min-w-[70px] text-slate-900 font-black">Готовність</th>
                            {(category === 'Бланки'
                              ? [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000]
                              : [100, 250, 500, 1000, 1500, 2500, 5000, 10000]
                            ).map(tir => (
                              <th key={tir} className="py-2.5 px-2 font-black border-r border-slate-300 text-slate-900 whitespace-nowrap">{tir}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMaterials.length === 0 || selectedCoverings.length === 0 || selectedPrintColors.length === 0 ? (
                            <tr>
                              <td colSpan={24} style={{ padding: '30px', color: '#888', fontStyle: 'italic', backgroundColor: '#fafafa' }}>
                                Щоб сформувати прайс оберіть матеріал, покриття, тип друку у фільтрі вище
                              </td>
                            </tr>
                          ) : (
                            selectedMaterials.flatMap(matId => 
                              selectedCoverings.flatMap(covId => 
                                selectedPrintColors.map((colStr, rowIdx) => {
                                  const matLabels: Record<string, string> = {
                                    'gazetka_45': 'Газетний 45г',
                                    'offset_65': 'Офсетний 65г',
                                    'offset_70': 'Офсетний 70г',
                                    '80': 'Офсетний 80г',
                                    'offset_100': 'Офсетний 100г',
                                    'offset_120': 'Офсетний 120г',
                                    'offset_160': 'Офсетний 160г',
                                    'samokopir_55': 'Самокопіювальний 55г',
                                    'kraft_70': 'Крафт бурий 70г',
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
                                  const personalizationCost = postPersonalization !== '0' ? 0.35 : 0;
                                  const luversCost = postLuvers !== '0' ? (postLuversCount || 1) * 1.20 : 0;
                                  const cornersCost = postCorners !== '0' ? 0.15 : 0;
                                  const gluingCost = postGluing !== '0' ? 0.20 : 0;
                                  const drillingCost = postDrilling !== '0' ? 0.15 : 0;
                                  const foldingCostPerItem = postFolding !== '0' ? norms.foldingPrice : 0;
                                  const creasingCostPerItem = postCreasing !== '0' ? parseInt(postCreasing) * norms.foldingPrice : 0;
                                  const perforationCost = postPerforation !== '0' ? 0.15 : 0;
                                  const dieCutCostPerItem = (cardKind === '7' || cardKind === '8' || cardKind === '9') ? norms.dieCuttingPrice : 0;
                                  const postpressTotalPerItem = personalizationCost + luversCost + cornersCost + gluingCost + drillingCost + foldingCostPerItem + creasingCostPerItem + perforationCost + dieCutCostPerItem;

                                  // Exact calibrated price list for Blanks (Бланки А4, Офсет 70г, 1+0)
                                  const blankExactMap: Record<number, number> = {
                                    50: 4.19,
                                    100: 2.47,
                                    150: 1.88,
                                    200: 1.58,
                                    250: 1.41,
                                    300: 1.29,
                                    350: 1.20,
                                    400: 1.14,
                                    450: 1.09,
                                    500: 1.05,
                                    550: 1.02,
                                    600: 0.99,
                                    650: 0.97,
                                    700: 0.95,
                                    750: 0.93,
                                    800: 0.92,
                                    850: 0.90,
                                    900: 0.894,
                                    950: 0.886,
                                    1000: 0.776
                                  };

                                  const activeTirList = (category === 'Бланки'
                                    ? [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000]
                                    : [100, 250, 500, 1000, 1500, 2500, 5000, 10000]
                                  );

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
                                      {activeTirList.map(tir => {
                                        let itemCost = 0;
                                        let rawTotal = 0;
                                        let basePaperCost = 0;
                                        let printCost = 0;
                                        let lamCost = 0;
                                        let postpressSum = 0;
                                        let deliveryCost = includeDelivery ? 80 : 0;

                                        if (category === 'Бланки' && blankExactMap[tir]) {
                                          let baseUnit = blankExactMap[tir];
                                          let matMod = matId === 'offset_70' ? 1.0 : matId === 'gazetka_45' ? 0.90 : matId === 'offset_65' ? 0.95 : matId === '80' ? 1.05 : matId === 'offset_100' ? 1.18 : matId === 'samokopir_55' ? 1.60 : 1.15;
                                          let colMod = colStr === '1+0' ? 1.0 : colStr === '1+1' ? 1.25 : colStr === '4+0' ? 1.50 : 1.90;
                                          let areaMod = Math.max(0.25, areaM2 / (0.210 * 0.297));
                                          itemCost = baseUnit * matMod * colMod * areaMod;
                                          rawTotal = Math.round(itemCost * tir);
                                          postpressSum = postpressTotalPerItem * tir;
                                          rawTotal += postpressSum + deliveryCost;
                                          itemCost = rawTotal / tir;
                                          const costShare = rawTotal;
                                          basePaperCost = costShare * 0.48;
                                          printCost = costShare * 0.52;
                                        } else {
                                          basePaperCost = areaM2 * (matDensity * 0.08) * tir;
                                          printCost = (isDouble ? 0.35 : 0.20) * tir + (tir > 500 ? 80 : 120);
                                          lamCost = (covId !== '0' && covId !== '') ? areaM2 * norms.laminationMattePrice * tir * (covId.includes('1+1') ? 2 : 1) : 0;
                                          postpressSum = postpressTotalPerItem * tir;
                                          const calcRaw = (basePaperCost + printCost + lamCost + postpressSum + deliveryCost) * (sheetSetsCount || 1);
                                          rawTotal = Math.round(calcRaw * (marginPercent / 100));
                                          itemCost = rawTotal / tir;
                                        }

                                        const isThreeDec = (itemCost * 100) % 1 !== 0;
                                        const displayVal = priceCostVar === 'per_item'
                                          ? (isThreeDec ? itemCost.toFixed(3) : itemCost.toFixed(2))
                                          : Math.round(rawTotal).toString();

                                        const isSelectedCell = selectedSheetCalc && 
                                          selectedSheetCalc.matId === matId && 
                                          selectedSheetCalc.covId === covId && 
                                          selectedSheetCalc.colStr === colStr && 
                                          selectedSheetCalc.tirazh === tir;

                                        return (
                                          <td
                                            key={tir}
                                            onClick={() => {
                                              const finalTargetPrice = Math.round(rawTotal);
                                              const exactCostBasis = finalTargetPrice;
                                              setSelectedSheetCalc({
                                                matId,
                                                matName,
                                                covId,
                                                covName,
                                                colStr,
                                                tirazh: tir,
                                                basePaperCost: exactCostBasis * 0.48,
                                                printCost: exactCostBasis * 0.52,
                                                lamCost,
                                                postpressSum,
                                                deliveryCost,
                                                rawCost: exactCostBasis,
                                                finalPrice: finalTargetPrice,
                                                unitPrice: itemCost
                                              });
                                              setTimeout(() => {
                                                document.getElementById('detailed-sheet-calculation')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                              }, 50);
                                            }}
                                            style={{
                                              padding: '8px',
                                              fontWeight: '700',
                                              cursor: 'pointer',
                                              borderRight: '1px solid #e0e0e0',
                                              transition: 'all 0.15s ease',
                                              backgroundColor: isSelectedCell ? '#e0f2fe' : (rowIdx % 2 === 0 ? '#ffffff' : '#fafafa'),
                                              color: isSelectedCell ? '#0284c7' : '#111',
                                              outline: isSelectedCell ? '2px solid #0284c7' : 'none',
                                              zIndex: isSelectedCell ? 1 : 0,
                                              position: isSelectedCell ? 'relative' : 'static'
                                            }}
                                            onMouseEnter={(e) => { 
                                              if (!isSelectedCell) {
                                                e.currentTarget.style.backgroundColor = '#fff0f0'; 
                                                e.currentTarget.style.color = '#c00'; 
                                              }
                                            }}
                                            onMouseLeave={(e) => { 
                                              if (!isSelectedCell) {
                                                e.currentTarget.style.backgroundColor = rowIdx % 2 === 0 ? '#ffffff' : '#fafafa'; 
                                                e.currentTarget.style.color = '#111'; 
                                              }
                                            }}
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

                  {/* Detailed Interactive Calculation & Order Generation Card directly on the SAME page */}
                  {(() => {
                    const hasMaterial = selectedMaterials.length > 0;
                    const matId = hasMaterial ? selectedMaterials[0] : '';
                    const covId = selectedCoverings[0] || '0';
                    const colStr = selectedPrintColors[0] || '4+4';
                    const tir = 1000;
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
                      '0': 'БП (Без покриття)',
                      '7': 'Глянцева ламінація 1+0',
                      '8': 'Глянцева ламінація 1+1',
                      '9': 'Матова ламінація 1+0',
                      '10': 'Матова ламінація 1+1',
                      '30': 'SoftTouch ламінація 1+0',
                      '31': 'SoftTouch ламінація 1+1',
                      'uv_10': 'УФ ЛАК 1+0',
                      'uv_11': 'УФ ЛАК 1+1',
                      'gibrid_10': 'Гібрид 1+0'
                    };
                    const defaultMatName = matLabels[matId] || `Папір ${matId}г`;
                    const defaultCovName = covLabels[covId] || 'Без покриття';
                    const matDensity = parseInt(matId.replace(/\D/g, '')) || 300;
                    const areaM2 = (parseFloat(sheetCustomWidth) / 1000) * (parseFloat(sheetCustomHeight) / 1000);
                    const isDouble = colStr === '4+4' || colStr === '1+1';
                    const personalizationCost = postPersonalization !== '0' ? 0.35 : 0;
                    const luversCost = postLuvers !== '0' ? (postLuversCount || 1) * 1.20 : 0;
                    const cornersCost = postCorners !== '0' ? 0.15 : 0;
                    const gluingCost = postGluing !== '0' ? 0.20 : 0;
                    const drillingCost = postDrilling !== '0' ? 0.15 : 0;
                    const foldingCostPerItem = postFolding !== '0' ? norms.foldingPrice : 0;
                    const creasingCostPerItem = postCreasing !== '0' ? parseInt(postCreasing) * norms.foldingPrice : 0;
                    const perforationCost = postPerforation !== '0' ? 0.15 : 0;
                    const dieCutCostPerItem = (cardKind === '7' || cardKind === '8' || cardKind === '9') ? norms.dieCuttingPrice : 0;
                    const parsedPackSizeAct = parseInt(postPackingText.replace(/\D/g, '')) || 0;
                    const packCostPerItemAct = postPackingText.trim() ? (parsedPackSizeAct > 0 ? (4.5 / parsedPackSizeAct) : 0.045) : 0;
                    const postpressTotalPerItem = personalizationCost + luversCost + cornersCost + gluingCost + drillingCost + foldingCostPerItem + creasingCostPerItem + perforationCost + dieCutCostPerItem + packCostPerItemAct;

                    let defPaperCost = 0;
                    let defPrintCost = 0;
                    let defLamCost = (hasMaterial && covId !== '0' && covId !== '') ? areaM2 * norms.laminationMattePrice * tir * (covId.includes('1+1') ? 2 : 1) : 0;
                    let defPostCost = hasMaterial ? postpressTotalPerItem * tir : 0;
                    let defDelivCost = (hasMaterial && includeDelivery) ? 80 : 0;
                    let defRawCost = 0;
                    let defFinalPrice = 0;
                    let defUnitPrice = 0;

                    if (category === 'Бланки') {
                      const bMap: Record<number, number> = {
                        50: 4.19, 100: 2.47, 150: 1.88, 200: 1.58, 250: 1.41,
                        300: 1.29, 350: 1.20, 400: 1.14, 450: 1.09, 500: 1.05,
                        550: 1.02, 600: 0.99, 650: 0.97, 700: 0.95, 750: 0.93,
                        800: 0.92, 850: 0.90, 900: 0.894, 950: 0.886, 1000: 0.776
                      };
                      const unitP = bMap[tir] || 0.776;
                      defUnitPrice = unitP;
                      defRawCost = Math.round(unitP * tir);
                      defPaperCost = defRawCost * 0.48;
                      defPrintCost = defRawCost * 0.52;
                      defFinalPrice = Math.round((defRawCost + defPostCost + defDelivCost) * (marginPercent / 100));
                    } else {
                      defPaperCost = hasMaterial ? areaM2 * (matDensity * 0.08) * tir : 0;
                      defPrintCost = hasMaterial ? (isDouble ? 0.35 : 0.20) * tir + (tir > 500 ? 80 : 120) : 0;
                      defRawCost = (defPaperCost + defPrintCost + defLamCost + defPostCost + defDelivCost) * (sheetSetsCount || 1);
                      defFinalPrice = hasMaterial ? Math.round(defRawCost * (marginPercent / 100)) : 0;
                      defUnitPrice = hasMaterial && tir > 0 ? defFinalPrice / tir : 0;
                    }

                    const activeCalc = selectedSheetCalc || {
                      matId,
                      matName: defaultMatName,
                      covId,
                      covName: defaultCovName,
                      colStr,
                      tirazh: tir,
                      basePaperCost: defPaperCost,
                      printCost: defPrintCost,
                      lamCost: defLamCost,
                      postpressSum: defPostCost,
                      deliveryCost: defDelivCost,
                      rawCost: defRawCost,
                      finalPrice: defFinalPrice,
                      unitPrice: defUnitPrice
                    };

                    // Recompute live with current margin
                    const liveFinalPrice = marginPercent === 100 && activeCalc.finalPrice
                      ? activeCalc.finalPrice
                      : Math.round(activeCalc.rawCost * (marginPercent / 100));
                    const liveUnitPrice = liveFinalPrice / activeCalc.tirazh;
                    const liveMarginAmount = Math.max(0, liveFinalPrice - activeCalc.rawCost);

                    const effectiveClient = isNewClientMode && customClientName.trim()
                      ? customClientName.trim()
                      : (activeClient?.name || 'Замовник');
                    const turnShortLabel = turnType === 'sam_na_sebe' ? 'с/с' : turnType === 'bez_oborotu' ? 'без обор.' : 'ч/о';
                    const fullComposedName = `№ ${orderNumber} - ${category === 'Бланки' ? subCategory : (category as string)} ${sheetCustomWidth}×${sheetCustomHeight} ${sheetUnit} — ${effectiveClient} (${activeCalc.matName}, ${activeCalc.covName}, ${activeCalc.colStr}, ${turnShortLabel}, ${activeCalc.tirazh} шт.)`;

                    return (
                      <div id="detailed-sheet-calculation" className="ios-card bg-white p-6 md:p-7 rounded-2xl border border-blue-200 shadow-lg shadow-blue-500/5 flex flex-col gap-6 md:gap-7">
                        {/* Section Header */}
                        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                              <FileText size={18} />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-slate-900 m-0">
                                Оформлення та кошторис замовлення: {category === 'Бланки' ? subCategory : (category as string)}
                              </h4>
                              <span className="text-xs text-slate-500 font-medium">
                                Параметри розрахунку, розцінки 1С та формування документів
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {activeCalc.tirazh} шт
                            </span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                              {activeCalc.colStr} ({turnShortLabel})
                            </span>
                          </div>
                        </div>

                        {/* Top 3-Field Strip: [ № ] [ ЗАМОВНИК ] [ ПРОДУКЦІЯ (авто) ] */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                          {/* 1. Номер замовлення (Фіксований ID рахунку) */}
                          <div className="md:col-span-3 flex flex-col gap-1">
                            <label className="text-[11px] font-extrabold text-slate-700 uppercase">№ Замовлення (ID):</label>
                            <div className="w-full px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-black text-blue-700 font-mono flex items-center select-none cursor-default shadow-2xs">
                              № {orderNumber}
                            </div>
                          </div>

                          {/* 2. Замовник */}
                          <div className="md:col-span-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-700 uppercase">Замовник:</label>
                              <button
                                type="button"
                                onClick={() => setIsNewClientMode(!isNewClientMode)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                              >
                                {isNewClientMode ? 'Вибрати з бази' : '+ Вписати нового'}
                              </button>
                            </div>

                            {isNewClientMode ? (
                              <input
                                type="text"
                                placeholder="Введіть назву клієнта"
                                value={customClientName}
                                onChange={(e) => setCustomClientName(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-blue-400 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                              >
                                <option value="">-- Оберіть замовника з бази --</option>
                                {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* 3. Продукція (авто) */}
                          <div className="md:col-span-5 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-700 uppercase">Продукція:</label>
                              
                            </div>
                            <input
                              type="text"
                              value={customTitleMap['digital'] ?? fullComposedName}
                              onChange={(e) => {
                                setCustomTitleMap(prev => ({ ...prev, digital: e.target.value }));
                                setName(e.target.value);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                            />
                          </div>
                        </div>

                        {/* 2-Column Main Section: Left = ОБОРОТ (СПУСК) | Right = РОЗРАХУНОК + Горизонтальні кнопки */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 items-stretch">
                          {/* 1. Left Column (50%): ОБОРОТ (СПУСК) & Параметри тиражу */}
                          <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                            <div className="flex flex-col gap-4">
                              {/* Header */}
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">ОБОРОТ (СПУСК):</span>
                                <span className="text-[11px] font-bold text-slate-400">Схема друку</span>
                              </div>
                              
                              {/* Turn Type Pill Selector */}
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'sam_na_sebe', label: 'Сам на себе (с/с)' },
                                  { id: 'chuzhyi_oborut', label: 'Чужий оборот (ч/о)' },
                                  { id: 'bez_oborotu', label: 'Без обороту' }
                                ].map(t => {
                                  const isSel = turnType === t.id;
                                  return (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() => handleSelectTurnType(t.id as any)}
                                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 border ${
                                        isSel
                                          ? 'bg-blue-50 text-blue-700 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs'
                                          : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                                      }`}
                                    >
                                      <span>{t.label}</span>
                                      {isSel && <Check size={13} className="text-blue-600 font-bold" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Tirazh Input */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-extrabold text-slate-700 uppercase">ТИРАЖ (ШТ):</label>
                                <input
                                  type="number"
                                  value={activeCalc.tirazh}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 0);
                                    setQuantity(val);
                                    setSelectedSheetCalc(prev => {
                                      const base = prev || activeCalc;
                                      const bMap: Record<number, number> = {
                                        50: 4.19, 100: 2.47, 150: 1.88, 200: 1.58, 250: 1.41,
                                        300: 1.29, 350: 1.20, 400: 1.14, 450: 1.09, 500: 1.05,
                                        550: 1.02, 600: 0.99, 650: 0.97, 700: 0.95, 750: 0.93,
                                        800: 0.92, 850: 0.90, 900: 0.894, 950: 0.886, 1000: 0.776
                                      };
                                      if (category === 'Бланки') {
                                        let unitP = bMap[val];
                                        if (!unitP) {
                                          const keys = Object.keys(bMap).map(Number).sort((a,b) => a - b);
                                          let l = 50, u = 1000;
                                          for (const k of keys) {
                                            if (k <= val) l = k;
                                            if (k >= val && u === 1000) { u = k; break; }
                                          }
                                          unitP = l === u ? bMap[l] : bMap[l] + ((val - l) / (u - l)) * (bMap[u] - bMap[l]);
                                        }
                                        const finP = Math.round(unitP * val);
                                        const cBasis = finP / (marginPercent / 100 || 1);
                                        return {
                                          ...base,
                                          tirazh: val,
                                          basePaperCost: cBasis * 0.48,
                                          printCost: cBasis * 0.52,
                                          rawCost: cBasis,
                                          finalPrice: finP,
                                          unitPrice: unitP
                                        };
                                      }
                                      const oldTir = base.tirazh || 1;
                                      const perItemPaper = (base.basePaperCost / oldTir);
                                      const perItemLam = (base.lamCost / oldTir);
                                      const perItemPost = (base.postpressSum / oldTir);
                                      const newPaper = perItemPaper * val;
                                      const newLam = perItemLam * val;
                                      const newPost = perItemPost * val;
                                      const newRaw = newPaper + base.printCost + newLam + newPost + (base.deliveryCost || 0);
                                      return {
                                        ...base,
                                        tirazh: val,
                                        basePaperCost: newPaper,
                                        lamCost: newLam,
                                        postpressSum: newPost,
                                        rawCost: newRaw,
                                        finalPrice: Math.round(newRaw * (marginPercent / 100)),
                                        unitPrice: val > 0 ? (newRaw * (marginPercent / 100)) / val : 0
                                      };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                                />
                              </div>

                              {/* Margin slider & presets */}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs">
                                  <label className="text-xs font-extrabold text-slate-700 uppercase">НАЦІНКА (МАРЖА):</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="500"
                                      value={marginPercent}
                                      onChange={(e) => setMarginPercent(Math.max(0, parseInt(e.target.value) || 0))}
                                      className="w-16 px-2 py-0.5 rounded-lg border border-blue-300 bg-white font-black text-blue-600 text-xs text-center focus:outline-none focus:border-blue-600 shadow-2xs"
                                    />
                                    <span className="font-extrabold text-blue-600">%</span>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="300"
                                  step="5"
                                  value={marginPercent}
                                  onChange={(e) => setMarginPercent(Number(e.target.value) || 0)}
                                  className="w-full cursor-pointer accent-blue-600 h-2 bg-slate-200 rounded-lg"
                                />
                                <div className="grid grid-cols-5 gap-2">
                                  {[20, 35, 50, 100, 150].map(m => {
                                    const isSel = marginPercent === m;
                                    return (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMarginPercent(m)}
                                        className={`py-2 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center border ${
                                          isSel
                                            ? 'bg-blue-50 text-blue-700 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs font-extrabold'
                                            : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                                        }`}
                                      >
                                        {m}%
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2. Right Column (50%): РОЗРАХУНОК + ГОРИЗОНТАЛЬНІ КНОПКИ СПРАВА */}
                          <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                  РОЗРАХУНОК (СОБІВАРТІСТЬ & НОРМИ 1С):
                                </span>
                                <strong className="text-sm font-black text-slate-900 font-mono">
                                  {activeCalc.rawCost.toFixed(2)} ₴
                                </strong>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Матеріали / Папір:</span>
                                  <strong className="font-mono text-slate-900">{activeCalc.basePaperCost.toFixed(2)} ₴</strong>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Друк & CTP-форми:</span>
                                  <strong className="font-mono text-slate-900">{activeCalc.printCost.toFixed(2)} ₴</strong>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Ламінація / Покриття:</span>
                                  <strong className="font-mono text-slate-900">{activeCalc.lamCost.toFixed(2)} ₴</strong>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Післядрукарські роботи:</span>
                                  <strong className="font-mono text-slate-900">{activeCalc.postpressSum.toFixed(2)} ₴</strong>
                                </div>
                                {activeCalc.deliveryCost > 0 && (
                                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2">
                                    <span className="text-slate-600 font-medium">Доставка:</span>
                                    <strong className="font-mono text-slate-900">{activeCalc.deliveryCost.toFixed(2)} ₴</strong>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-between text-[11px] font-semibold text-slate-500 px-1">
                                <span>Собівартість 1 екземпляра:</span>
                                <strong className="font-mono text-slate-800">
                                  {(activeCalc.rawCost / activeCalc.tirazh).toFixed(4)} ₴ / шт
                                </strong>
                              </div>

                              {/* Total Final Price Box */}
                              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">РАЗОМ ДО СПЛАТИ:</span>
                                  <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                                    +{liveMarginAmount.toFixed(2)} ₴ маржа
                                  </span>
                                </div>
                                <div className="flex items-baseline justify-between pt-1">
                                  <p className="text-3xl font-black text-blue-600 my-0 font-mono tracking-tight leading-none">
                                    {liveFinalPrice} <span className="text-base font-bold text-slate-600">₴</span>
                                  </p>
                                  <div className="text-right">
                                    <span className="text-[11px] text-slate-500 font-medium block">Ціна за 1 шт:</span>
                                    <strong className="text-sm font-black text-slate-900 font-mono">{liveUnitPrice.toFixed(2)} ₴ / шт</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Horizontal Action Buttons Right: [ ШАБЛОН ] [ PDF ] [ КП ] [ ВИРОБНИЦТВО ] */}
                            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setTemplateName(customTitleMap['digital'] ?? fullComposedName);
                                  setShowTemplateModal(true);
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition-all text-center flex items-center justify-center gap-1.5"
                              >
                                <LayoutTemplate size={14} className="text-slate-500" />
                                <span>Шаблон</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setName(fullComposedName);
                                  setShowInvoice(true);
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition-all text-center flex items-center justify-center gap-1.5"
                              >
                                <FileDown size={14} className="text-slate-500" />
                                <span>ПДФ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const text = `Комерційна пропозиція № ${orderNumber}
Замовник: ${effectiveClient}
Продукція: ${category === 'Бланки' ? subCategory : (category as string)}
Розмір: ${sheetCustomWidth} × ${sheetCustomHeight} ${sheetUnit}
Матеріал: ${activeCalc.matName}
Покриття: ${activeCalc.covName}
Друк: ${activeCalc.colStr} (Оборот: ${turnShortLabel})
Тираж: ${activeCalc.tirazh} шт
Вартість замовлення: ${liveFinalPrice} грн (${liveUnitPrice.toFixed(2)} грн/шт)
Друкарня "Едельвейс і К"`;
                                  navigator.clipboard.writeText(text);
                                  alert('Комерційну пропозицію (КП) скопійовано в буфер обміну.');
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition-all text-center flex items-center justify-center gap-1.5"
                              >
                                <FileText size={14} className="text-slate-500" />
                                <span>КП</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const pSizeOrd = parseInt(postPackingText.replace(/\D/g, '')) || 0;
                                  const pCountOrd = pSizeOrd > 0 ? Math.ceil(activeCalc.tirazh / pSizeOrd) : 0;
                                  const packingInfoStr = postPackingText.trim() 
                                    ? `${postPackingText.trim()}${pCountOrd > 0 ? ` (${pCountOrd} пачок по ${pSizeOrd} шт)` : ''}`
                                    : 'Стандартна упаковка в папір/стрейч';

                                  const itemW = parseFloat(sheetCustomWidth) || 210;
                                  const itemH = parseFloat(sheetCustomHeight) || 297;
                                  const sheetW = 450;
                                  const sheetH = 320;
                                  const fit1 = Math.floor(sheetW / itemW) * Math.floor(sheetH / itemH);
                                  const fit2 = Math.floor(sheetW / itemH) * Math.floor(sheetH / itemW);
                                  const itemsPerSheetCalc = Math.max(1, fit1, fit2);

                                  const physSheets = Math.ceil(activeCalc.tirazh / itemsPerSheetCalc);
                                  const priladka = turnType === 'sam_na_sebe' ? 30 : turnType === 'chuzhyi_oborut' ? 50 : 20;
                                  const techWaste = Math.max(10, Math.ceil(physSheets * 0.04));
                                  const grossSheets = physSheets + priladka + techWaste;

                                  const plates = activeCalc.colStr === '4+4' 
                                    ? (turnType === 'sam_na_sebe' ? 4 : 8) 
                                    : activeCalc.colStr === '4+0' ? 4 
                                    : activeCalc.colStr === '1+1' ? (turnType === 'sam_na_sebe' ? 1 : 2) : 1;

                                  const postpressList: Array<{ name: string; qty: string }> = [
                                    { name: `Порізка в готовий розмір ${sheetCustomWidth}×${sheetCustomHeight} мм`, qty: `${activeCalc.tirazh} шт` }
                                  ];
                                  if (activeCalc.covId && activeCalc.covId !== '0') {
                                    postpressList.push({ name: `Ламінування: ${activeCalc.covName}`, qty: `${physSheets} арк.` });
                                  }
                                  if (postCorners !== '0') {
                                    postpressList.push({ name: `Скруглення кутів (${postCorners} кути)`, qty: `${activeCalc.tirazh} шт` });
                                  }
                                  if (postLuvers !== '0') {
                                    postpressList.push({ name: `Встановлення люверсів (${postLuversCount} шт)`, qty: `${activeCalc.tirazh * postLuversCount} шт` });
                                  }
                                  if (postFolding !== '0') {
                                    postpressList.push({ name: `Фальцювання (${postFolding})`, qty: `${activeCalc.tirazh} шт` });
                                  }
                                  if (postCreasing !== '0') {
                                    postpressList.push({ name: `Біговка (${postCreasing} біги)`, qty: `${activeCalc.tirazh * parseInt(postCreasing)} бігів` });
                                  }
                                  if (postDrilling !== '0') {
                                    postpressList.push({ name: `Свердління отворів (Ø ${postDrillingDia} мм)`, qty: `${activeCalc.tirazh * parseInt(postDrilling)} отв.` });
                                  }
                                  if (postGluing !== '0') {
                                    postpressList.push({ name: `Проклейка в блок (по ${postGluing} листів)`, qty: `${Math.ceil(activeCalc.tirazh / parseInt(postGluing))} блоків` });
                                  }
                                  if (postPersonalization !== '0') {
                                    postpressList.push({ name: `Персоналізація (${postPersonalization === '1' ? 'Нумерація / Штрихкод' : 'Змінні дані'})`, qty: `${activeCalc.tirazh} шт` });
                                  }
                                  if (postPackingText.trim()) {
                                    postpressList.push({ name: `Фасування та пакування (${postPackingText.trim()})`, qty: pCountOrd > 0 ? `${pCountOrd} пачок` : '1 тираж' });
                                  }

                                  addOrder({
                                    id: orderNumber.toString(),
                                    name: name || fullComposedName,
                                    clientId: isNewClientMode ? (customClientName || 'Новий клієнт') : selectedClientId,
                                    category: category === 'Бланки' ? subCategory : (category as string),
                                    quantity: activeCalc.tirazh,
                                    packingCount: pSizeOrd > 0 ? pSizeOrd : 100,
                                    paperType: activeCalc.matId === '80' ? 'offset' : 'coated',
                                    paperName: activeCalc.matName,
                                    sheetSize: `${sheetW} × ${sheetH} мм (SRA3+)`,
                                    turnTypeLabel: turnType === 'sam_na_sebe' ? 'Сам на себе (с/с)' : turnType === 'chuzhyi_oborut' ? 'Чужий оборот (ч/о)' : 'Без обороту',
                                    colors: activeCalc.colStr,
                                    isSamNaSebe: turnType === 'sam_na_sebe',
                                    designCost: designCost,
                                    margin: marginPercent,
                                    machine: 'Офсетна машина Heidelberg PM 52-4',
                                    format: `${sheetCustomWidth}×${sheetCustomHeight} ${sheetUnit}`,
                                    physicalSheets: physSheets,
                                    itemsPerSheet: itemsPerSheetCalc,
                                    priladkaSheets: priladka,
                                    techWasteSheets: techWaste,
                                    totalGrossSheets: grossSheets,
                                    platesCount: plates,
                                    postpressOps: postpressList,
                                    packingInfo: packingInfoStr,
                                    deadline: '1-2 роб. дні',
                                    subtotal: activeCalc.rawCost,
                                    marginAmount: liveMarginAmount,
                                    finalPrice: liveFinalPrice,
                                    unitPrice: liveUnitPrice,
                                    paymentStatus: 'unpaid',
                                    prepayment: 0,
                                    notes: `Специфікація: ${name || fullComposedName}, ${sheetCustomWidth}×${sheetCustomHeight} ${sheetUnit}, ${activeCalc.matName}, ${activeCalc.covName}, ${activeCalc.colStr}, ${turnShortLabel}, ${activeCalc.tirazh} шт.`
                                  });
                                  alert(`Замовлення № ${orderNumber} успішно сформовано з автоматичним розрахунком виробництва та передано в цех!`);
                                  setOrderNumber(Math.floor(10000 + Math.random() * 90000));
                                }}
                                className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-all text-center flex items-center justify-center gap-1.5"
                              >
                                <Send size={14} className="text-white" />
                                <span>Виробництво</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* DETAILED DIE-CUT CALCULATOR (Офсетний друк / Висічна) */}
              {offsetSubTab === 'felling' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  {/* Top Information Buttons Bar */}
                  <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(255, 149, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9500' }}>
                        <Scissors size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Висічна продукція (Штампи)</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Оберіть готовий штамп з бази або введіть параметри</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                        className="ios-badge ios-badge-blue"
                        style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={14} />
                        <span>Шаблон штампу (PDF)</span>
                      </a>
                    </div>
                  </div>

                  {/* Form Selector Header Bar */}
                  {/* Form Shape Selector */}
                  <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Форма штампу</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {[
                        { 
                          id: '1', 
                          name: 'Стандартна', 
                          icon: (
                            <svg width="36" height="32" viewBox="0 0 40 32" fill="none">
                              <rect x="6" y="4" width="28" height="24" rx="4" fill="#FFFFFF" stroke="var(--primary)" strokeWidth="1.5"/>
                              <rect x="10" y="8" width="10" height="3" rx="1" fill="var(--primary)" fillOpacity="0.4"/>
                              <circle cx="28" cy="10" r="2.5" fill="var(--primary)" fillOpacity="0.6"/>
                              <line x1="10" y1="16" x2="30" y2="16" stroke="#CBD5E1" strokeWidth="1.5"/>
                              <line x1="10" y1="21" x2="24" y2="21" stroke="#CBD5E1" strokeWidth="1.5"/>
                            </svg>
                          )
                        },
                        { 
                          id: '2', 
                          name: 'Кругла', 
                          icon: (
                            <svg width="36" height="32" viewBox="0 0 40 32" fill="none">
                              <circle cx="20" cy="16" r="12" fill="#FFFFFF" stroke="var(--primary)" strokeWidth="1.5"/>
                              <circle cx="20" cy="16" r="8" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeWidth="1" strokeDasharray="2 2"/>
                              <circle cx="20" cy="16" r="3" fill="var(--primary)"/>
                            </svg>
                          )
                        },
                        { 
                          id: '3', 
                          name: 'Овальна', 
                          icon: (
                            <svg width="36" height="32" viewBox="0 0 40 32" fill="none">
                              <ellipse cx="20" cy="16" rx="15" ry="10" fill="#FFFFFF" stroke="var(--primary)" strokeWidth="1.5"/>
                              <ellipse cx="20" cy="16" rx="10" ry="6" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeWidth="1" strokeDasharray="2 2"/>
                              <line x1="14" y1="16" x2="26" y2="16" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )
                        },
                        { 
                          id: '4', 
                          name: 'Прямокутна', 
                          icon: (
                            <svg width="36" height="32" viewBox="0 0 40 32" fill="none">
                              <rect x="4" y="6" width="32" height="20" rx="3" fill="#FFFFFF" stroke="var(--primary)" strokeWidth="1.5"/>
                              <rect x="8" y="10" width="24" height="12" rx="1.5" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeWidth="1" strokeDasharray="2 2"/>
                              <circle cx="20" cy="16" r="2.5" fill="var(--primary)"/>
                            </svg>
                          )
                        },
                        { 
                          id: '5', 
                          name: 'Етикетка, кольєретка', 
                          icon: (
                            <svg width="36" height="32" viewBox="0 0 40 32" fill="none">
                              <path d="M12 26C12 26 14 18 16 10C17 6 23 6 24 10C26 18 28 26 28 26H12Z" fill="#FFFFFF" stroke="var(--primary)" strokeWidth="1.5" strokeLinejoin="round"/>
                              <circle cx="20" cy="14" r="3" fill="var(--primary)" fillOpacity="0.2"/>
                              <line x1="16" y1="21" x2="24" y2="21" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )
                        },
                      ].map(formItem => {
                        const isActive = fellingForm === formItem.id;
                        return (
                          <div
                            key={formItem.id}
                            onClick={() => setFellingForm(formItem.id)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: 'var(--radius-md)',
                              border: isActive ? '2px solid var(--primary)' : '0.5px solid var(--border-light)',
                              backgroundColor: isActive ? 'rgba(0, 122, 255, 0.05)' : 'var(--bg-system)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              minHeight: '82px'
                            }}
                          >
                            <div className="flex items-center justify-center h-8">
                              {formItem.icon}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700', textAlign: 'center', color: isActive ? 'var(--primary)' : 'var(--text-dark)' }}>
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
                    <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, borderBottom: '0.5px solid var(--border-light)', paddingBottom: '8px' }}>
                        Оберіть стандартний штамп
                      </h4>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Готовий штамп з каталогу:</label>
                        <select
                          value={fellingStamp}
                          onChange={(e) => setFellingStamp(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                        >
                          <option value="160">Будинок (210 × 300 мм) — настільний календар</option>
                          <option value="161">Пірамідка (305 × 134 мм)</option>
                          <option value="130">Підставка під чашку (Ø 90 мм) — костер</option>
                          <option value="131">Календар кишеньковий (100 × 70 мм)</option>
                          <option value="58">Папка А4 корінець 5 мм</option>
                          <option value="59">Папка А4 корінець 7 мм</option>
                        </select>
                      </div>

                      {/* Selected Stamp Details */}
                      {(() => {
                        const stampInfo: Record<string, { title: string; w: number; h: number }> = {
                          '160': { title: 'Будинок (Календар)', w: 210, h: 300 },
                          '161': { title: 'Пірамідка', w: 305, h: 134 },
                          '130': { title: 'Підставка під чашку (Костер)', w: 90, h: 90 },
                          '131': { title: 'Календар кишеньковий', w: 100, h: 70 },
                          '58': { title: 'Папка А4 (корінець 5мм)', w: 484, h: 377 },
                          '59': { title: 'Папка А4 (корінець 7мм)', w: 544, h: 393 },
                        };
                        const info = stampInfo[fellingStamp] || { title: 'Стандартний штамп', w: 210, h: 300 };
                        return (
                          <div style={{ backgroundColor: 'var(--bg-system)', padding: '14px', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border-light)', fontSize: '12px' }}>
                            <div style={{ fontWeight: '800', color: 'var(--text-dark)', marginBottom: '4px' }}>{info.title}</div>
                            <div style={{ color: 'var(--text-medium)' }}>Габарити висічки: <strong style={{ color: 'var(--primary)' }}>{info.w} × {info.h} мм</strong></div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Right Column: Visual Stamp Preview */}
                    <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вид готового виробу</span>
                      <div className="w-full h-48 border-2 border-dashed border-slate-200 bg-slate-50/60 rounded-xl flex items-center justify-center p-3">
                        {(() => {
                          switch (fellingStamp) {
                            case '128':
                              return (
                                <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
                                  <path d="M20 20C20 12 28 6 36 6H84C92 6 100 12 100 20V144C100 152 92 156 84 156H36C28 156 20 152 20 144V20Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="2"/>
                                  <circle cx="60" cy="45" r="20" stroke="#0F172A" strokeWidth="2.5" fill="#F1F5F9"/>
                                  <path d="M60 25C70 25 80 28 100 38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"/>
                                  <rect x="36" y="80" width="48" height="32" rx="6" fill="var(--primary)" fillOpacity="0.1" stroke="var(--primary)" strokeWidth="1.5"/>
                                  <circle cx="60" cy="94" r="5" fill="var(--primary)"/>
                                  <line x1="44" y1="104" x2="76" y2="104" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                                  <line x1="40" y1="126" x2="80" y2="126" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                                  <line x1="48" y1="134" x2="72" y2="134" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              );
                            case '133':
                              return (
                                <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
                                  <path d="M20 60H100V144C100 152 92 156 84 156H36C28 156 20 152 20 144V60Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="2"/>
                                  <path d="M20 60V30C20 14 36 6 56 6C76 6 92 18 88 38C84 50 64 50 60 60" fill="none" stroke="#64748B" strokeWidth="2"/>
                                  <circle cx="54" cy="32" r="15" fill="#F1F5F9" stroke="#0F172A" strokeWidth="2.5"/>
                                  <path d="M54 17C68 17 80 22 88 38" stroke="#0F172A" strokeWidth="2.5"/>
                                  <rect x="36" y="80" width="48" height="32" rx="6" fill="var(--primary)" fillOpacity="0.1" stroke="var(--primary)" strokeWidth="1.5"/>
                                  <circle cx="60" cy="94" r="4.5" fill="var(--primary)"/>
                                  <line x1="44" y1="104" x2="76" y2="104" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                                  <line x1="40" y1="126" x2="80" y2="126" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              );
                            case '160':
                              return (
                                <svg width="150" height="140" viewBox="0 0 150 140" fill="none">
                                  <path d="M15 115L75 25L135 115H15Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5"/>
                                  <path d="M30 115L75 40L120 115H30Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2"/>
                                  <rect x="50" y="60" width="50" height="10" rx="2" fill="var(--primary)"/>
                                  <line x1="55" y1="65" x2="95" y2="65" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                                  <rect x="50" y="75" width="50" height="28" rx="2" fill="var(--primary)" fillOpacity="0.08" stroke="var(--primary)" strokeWidth="1"/>
                                  <line x1="55" y1="82" x2="95" y2="82" stroke="#64748B" strokeWidth="1.5"/>
                                  <line x1="55" y1="89" x2="95" y2="89" stroke="#64748B" strokeWidth="1.5"/>
                                  <line x1="55" y1="96" x2="85" y2="96" stroke="#94A3B8" strokeWidth="1.5"/>
                                </svg>
                              );
                            case '161':
                              return (
                                <svg width="150" height="140" viewBox="0 0 150 140" fill="none">
                                  <path d="M75 15L15 125L75 138L135 125L75 15Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="2"/>
                                  <path d="M75 15L15 125L75 138V15Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5"/>
                                  <path d="M75 15L135 125L75 138V15Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2"/>
                                  <rect x="85" y="60" width="36" height="40" rx="4" fill="var(--primary)" fillOpacity="0.1" stroke="var(--primary)" strokeWidth="1.5"/>
                                  <circle cx="103" cy="74" r="5" fill="var(--primary)"/>
                                  <line x1="91" y1="86" x2="115" y2="86" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              );
                            case '58':
                              return (
                                <svg width="160" height="130" viewBox="0 0 160 130" fill="none">
                                  <path d="M15 15H72V115H15V15Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5"/>
                                  <rect x="72" y="15" width="6" height="100" fill="var(--primary)" stroke="var(--primary)" strokeWidth="1"/>
                                  <path d="M78 15H145V115H78V15Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2"/>
                                  <path d="M78 75L145 65V115H78V75Z" fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeWidth="1.5"/>
                                  <line x1="95" y1="90" x2="125" y2="90" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                                  <line x1="100" y1="98" x2="120" y2="98" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              );
                            case '59':
                              return (
                                <svg width="160" height="130" viewBox="0 0 160 130" fill="none">
                                  <path d="M12 15H70V115H12V15Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5"/>
                                  <rect x="70" y="15" width="10" height="100" fill="var(--primary)" stroke="var(--primary)" strokeWidth="1"/>
                                  <line x1="75" y1="15" x2="75" y2="115" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2"/>
                                  <path d="M80 15H148V115H80V15Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2"/>
                                  <path d="M80 70L148 60V115H80V70Z" fill="var(--primary)" fillOpacity="0.2" stroke="var(--primary)" strokeWidth="1.5"/>
                                  <rect x="94" y="85" width="38" height="18" rx="2" fill="#FFFFFF" stroke="var(--primary)" strokeWidth="1"/>
                                  <line x1="100" y1="92" x2="126" y2="92" stroke="var(--primary)" strokeWidth="1.5"/>
                                </svg>
                              );
                            default:
                              return (
                                <div className="w-28 h-28 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs">
                                  Висічка
                                </div>
                              );
                          }
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix Table for Die-cut */}
                  <div className="ios-card bg-white" style={{ overflow: 'hidden' }}>
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
                            За тираж
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
                <div className="flex flex-col gap-6 md:gap-7">
                  {/* Top Information Buttons Bar */}
                  <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34c759' }}>
                        <BookOpen size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Багатосторінкова продукція (Каталоги, Журнали)</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Гнучке налаштування обкладинки, блоку та вставки</span>
                      </div>
                    </div>
                  </div>

                  {/* Stitching Type Selector */}
                  <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Спосіб зшивання</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { 
                          id: '1', 
                          name: 'Скоба (8 — 64 стр)', 
                          icon: (
                            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                              <path d="M12 8L28 6V38L12 40V8Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round"/>
                              <path d="M28 6L40 10V42L28 38V6Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" strokeLinejoin="round"/>
                              <line x1="28" y1="6" x2="28" y2="38" stroke="var(--primary)" strokeWidth="2"/>
                              <line x1="26.5" y1="12" x2="29.5" y2="12" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"/>
                              <line x1="26.5" y1="32" x2="29.5" y2="32" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"/>
                              <rect x="31" y="14" width="6" height="5" rx="1" fill="var(--primary)" fillOpacity="0.2"/>
                              <line x1="31" y1="23" x2="37" y2="23" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                              <line x1="31" y1="27" x2="35" y2="27" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )
                        },
                        { 
                          id: '2', 
                          name: 'Пружина (4 — 524 стр)', 
                          icon: (
                            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                              <rect x="14" y="8" width="26" height="34" rx="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5"/>
                              <path d="M12 11H14V41H12V11Z" fill="#E2E8F0"/>
                              <path d="M11 13C11 12 17 12 17 13M11 19C11 18 17 18 17 19M11 25C11 24 17 24 17 25M11 31C11 30 17 30 17 31M11 37C11 36 17 36 17 37" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                              <rect x="22" y="14" width="12" height="4" rx="1" fill="var(--primary)" fillOpacity="0.8"/>
                              <line x1="22" y1="22" x2="34" y2="22" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
                              <line x1="22" y1="26" x2="30" y2="26" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )
                        },
                        { 
                          id: '3', 
                          name: 'Клей PUR (30 — 608 стр)', 
                          icon: (
                            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                              <path d="M16 12L24 6H38L30 12H16Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2"/>
                              <path d="M10 12L16 12V42L10 42V12Z" fill="var(--primary)" stroke="var(--primary)" strokeWidth="1.2"/>
                              <rect x="16" y="12" width="22" height="30" rx="1" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5"/>
                              <rect x="20" y="18" width="14" height="10" rx="2" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeWidth="1" strokeDasharray="2 2"/>
                              <circle cx="27" cy="23" r="2.5" fill="var(--primary)"/>
                              <line x1="20" y1="32" x2="34" y2="32" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )
                        },
                        { 
                          id: '4', 
                          name: 'Блокноти (30 — 608 стр)', 
                          icon: (
                            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                              <rect x="11" y="11" width="26" height="32" rx="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5"/>
                              <rect x="11" y="9" width="26" height="5" rx="1.5" fill="#0F172A"/>
                              <path d="M15 7V11M20 7V11M25 7V11M30 7V11" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                              <line x1="16" y1="20" x2="32" y2="20" stroke="#E2E8F0" strokeWidth="1.5"/>
                              <line x1="16" y1="25" x2="32" y2="25" stroke="#E2E8F0" strokeWidth="1.5"/>
                              <line x1="16" y1="30" x2="32" y2="30" stroke="#E2E8F0" strokeWidth="1.5"/>
                              <line x1="16" y1="35" x2="26" y2="35" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )
                        },
                      ].map(stItem => {
                        const isActive = multiStitching === stItem.id;
                        return (
                          <div
                            key={stItem.id}
                            onClick={() => setMultiStitching(stItem.id)}
                            style={{
                              padding: '14px',
                              borderRadius: 'var(--radius-md)',
                              border: isActive ? '2px solid var(--primary)' : '0.5px solid var(--border-light)',
                              backgroundColor: isActive ? 'rgba(0, 122, 255, 0.05)' : 'var(--bg-system)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              minHeight: '92px'
                            }}
                          >
                            <div className="flex items-center justify-center h-11">
                              {stItem.icon}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700', textAlign: 'center', color: isActive ? 'var(--primary)' : 'var(--text-dark)' }}>
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
                    <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, borderBottom: '0.5px solid var(--border-light)', paddingBottom: '8px' }}>Розмір видання</h4>
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
                    <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вид готового виробу</span>
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
                  <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, borderBottom: '0.5px solid var(--border-light)', paddingBottom: '8px' }}>
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
                  <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
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
                            За тираж
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
                  <div className={`bg-white rounded-2xl ${activeInfoModal === 'materials' ? 'max-w-3xl' : 'max-w-lg'} w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col`}>
                    <button
                      type="button"
                      onClick={() => setActiveInfoModal(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors z-10"
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
                    {activeInfoModal === 'instr_roll' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                          <FileText size={20} />
                          <span>Інструкція: Рулонний друк етикеток</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed m-0">
                          1. Вкажіть точні розміри однієї наліпки у міліметрах (ширина × висота).<br/>
                          2. Вкажіть відстань між наліпками у рулоні (стандарт — 4 мм).<br/>
                          3. Оберіть діаметр втулки під ваш аплікатор (стандарт — 76 мм) та орієнтацію намотки.<br/>
                          4. Оберіть бажаний матеріал (папір, поліпропілен, винний), колірність та покриття лаком.<br/>
                          5. Клікніть на комірку в таблиці цін для оформлення замовлення.
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
                      <div className="flex flex-col gap-4 overflow-hidden">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3 pr-8">
                          <div className="flex items-center gap-2.5 text-blue-600 font-bold text-base">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <Layers size={18} />
                            </div>
                            <div>
                              <span className="block font-black text-slate-900 text-sm">Прайс та налаштування цін матеріалів</span>
                              <span className="block text-[11px] text-slate-500 font-normal">Встановіть базову вартість сировини (ціни миттєво застосовуються у калькуляторі)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setMaterialPrices(defaultMaterialPrices);
                                localStorage.setItem('crm_custom_materials_pricing', JSON.stringify(defaultMaterialPrices));
                                setMaterialSavedToast(true);
                                setTimeout(() => setMaterialSavedToast(false), 2500);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                              title="Скинути до базових цін"
                            >
                              <RotateCcw size={12} />
                              <span>Скинути</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                localStorage.setItem('crm_custom_materials_pricing', JSON.stringify(materialPrices));
                                const off80 = materialPrices.find(m => m.id === 'off_80')?.price || norms.paperOffsetPrice;
                                const c130 = materialPrices.find(m => m.id === 'c_130')?.price || norms.paperCoatedPrice;
                                const gaz45 = materialPrices.find(m => m.id === 'gaz_45')?.price || norms.paperGazetkaPrice;
                                updateNorms({
                                  ...norms,
                                  paperOffsetPrice: off80,
                                  paperCoatedPrice: c130,
                                  paperGazetkaPrice: gaz45
                                });
                                setMaterialSavedToast(true);
                                setTimeout(() => setMaterialSavedToast(false), 3000);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
                            >
                              <Save size={13} />
                              <span>Зберегти ціни</span>
                            </button>
                          </div>
                        </div>

                        {materialSavedToast && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                            <Check size={16} className="text-emerald-600" />
                            <span>Ціни на матеріали успішно збережено та застосовано до калькулятора!</span>
                          </div>
                        )}

                        {/* Filter & Search Bar */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                            {[
                              { id: 'all', label: 'Усі' },
                              { id: 'paper_offset', label: 'Офсет / Газетка' },
                              { id: 'paper_coated', label: 'Крейдований' },
                              { id: 'cardboard', label: 'Картони' },
                              { id: 'adhesive', label: 'Самоклейка' },
                              { id: 'wide', label: 'Банери & Постери' },
                              { id: 'rigid', label: 'Пластик / ПВХ' },
                              { id: 'film', label: 'Плівки ORACAL' },
                            ].map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setMaterialPriceCategory(cat.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                                  materialPriceCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                          <div className="relative min-w-[160px]">
                            <input
                              type="text"
                              placeholder="Пошук матеріалу..."
                              value={materialSearch}
                              onChange={(e) => setMaterialSearch(e.target.value)}
                              className="w-full pl-7 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                            />
                            <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                          </div>
                        </div>

                        {/* Materials Table */}
                        <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100/80 sticky top-0 text-slate-600 font-bold border-b border-slate-200">
                              <tr>
                                <th className="py-2 px-3">Матеріал</th>
                                <th className="py-2 px-2">Категорія</th>
                                <th className="py-2 px-2">Одиниця</th>
                                <th className="py-2 px-3 text-right">Ціна (грн)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {materialPrices
                                .filter(m => materialPriceCategory === 'all' || m.category === materialPriceCategory)
                                .filter(m => materialSearch === '' || m.name.toLowerCase().includes(materialSearch.toLowerCase()))
                                .map(mat => (
                                  <tr key={mat.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="py-2 px-3 font-semibold text-slate-900">{mat.name}</td>
                                    <td className="py-2 px-2 text-slate-500 text-[10px]">
                                      {mat.category === 'paper_offset' ? 'Офсетний' :
                                       mat.category === 'paper_coated' ? 'Крейда' :
                                       mat.category === 'cardboard' ? 'Картон' :
                                       mat.category === 'adhesive' ? 'Самоклейка' :
                                       mat.category === 'wide' ? 'Широкоформат' :
                                       mat.category === 'rigid' ? 'Пластик' : 'Плівка'}
                                    </td>
                                    <td className="py-2 px-2 text-slate-500 font-mono text-[10px]">{mat.unit}</td>
                                    <td className="py-2 px-3 text-right">
                                      <div className="inline-flex items-center gap-1 justify-end">
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          value={mat.price}
                                          onChange={(e) => {
                                            const newPrice = Math.max(0, parseFloat(e.target.value) || 0);
                                            setMaterialPrices(prev => prev.map(p => p.id === mat.id ? { ...p, price: newPrice } : p));
                                          }}
                                          className="w-20 px-2 py-1 text-right font-mono font-bold text-xs rounded border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:outline-none"
                                        />
                                        <span className="text-slate-400 font-bold text-[11px]">₴</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
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

              {/* OFFSET NOTEBOOKS CALCULATOR */}
              {offsetSubTab === 'notebooks' && renderNotebooksCalculator('offset')}
            </div>
          )}

          {/* TAB 3: DIGITAL PRINTING */}
          {mainCategoryTab === 'digital' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {digitalSubTab === 'overview' && (
                /* 10 CATEGORIES OVERVIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* 4 Universal Technology Hero Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {[
                      {
                        title: 'Листова продукція',
                        badge: 'SRA3 / Листи',
                        desc: 'Візитівки, листівки, бланки, буклети, наліпки, плакати, флаєри…',
                        icon: <FileText size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Цифровий друк',
                        onClick: () => setDigitalSubTab('sheets')
                      },
                      {
                        title: 'Висічна продукція',
                        badge: 'Штампи',
                        desc: 'Фігурні наліпки, візитівки, листівки, бирки, підставки…',
                        icon: <Scissors size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Готові форми',
                        onClick: () => setDigitalSubTab('felling')
                      },
                      {
                        title: 'Багатосторінкова',
                        badge: 'Брошурування',
                        desc: 'Брошури, журнали, каталоги, книги, меню, прайс-листи, звіти…',
                        icon: <BookOpen size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Скоба, PUR клей',
                        onClick: () => setDigitalSubTab('multipage')
                      },
                      {
                        title: 'Індивідуальний розрахунок',
                        badge: 'Нестандартні',
                        desc: 'Комплексні комерційні пропозиції з ручним підбором технологічних операцій.',
                        icon: <Settings size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Конструктор розрахунку',
                        onClick: () => setDigitalSubTab('custom')
                      }
                    ].map(item => (
                      <div
                        key={item.title}
                        onClick={item.onClick}
                        className="ios-card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '22px 24px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          minHeight: '195px',
                          position: 'relative',
                          background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
                          border: '1.5px solid rgba(0, 122, 255, 0.22)',
                          boxShadow: '0 4px 18px rgba(0, 122, 255, 0.05)'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = 'translateY(-3px)'; 
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.12)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = 'translateY(0)'; 
                          e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.22)';
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 122, 255, 0.05)';
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '16px',
                              backgroundColor: 'rgba(0, 122, 255, 0.1)',
                              border: '1px solid rgba(0, 122, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0, 122, 255, 0.08)'
                            }}>
                              {item.icon}
                            </div>
                            <span className="ios-badge ios-badge-blue" style={{ fontSize: '11px', padding: '3px 8px' }}>
                              {item.badge}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.45' }}>
                            {item.desc}
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '0.5px solid rgba(0, 122, 255, 0.15)',
                          paddingTop: '12px',
                          marginTop: '16px'
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)' }}>
                            {item.metric}
                          </span>
                          <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '800', gap: '2px' }}>
                            Відкрити <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px 0 4px', borderTop: '0.5px solid var(--border-light)', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-medium)' }} />
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                        Каталог готової продукції
                      </h4>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: '600' }}>
                      6 окремих категорій
                    </span>
                  </div>

                  {/* 6 Specialized Digital Products Grid with exact matching cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {[
                      {
                        id: 'digital_notebooks',
                        title: 'Блокноти на пружині',
                        desc: 'Корпоративні блокноти від 1 шт. Формати А6, А5, А4 з повноколірною обкладинкою та пружиною.',
                        icon: <Bookmark size={30} style={{ color: 'var(--primary)' }} />,
                        color: 'rgba(0, 122, 255, 0.1)',
                        badgeClass: 'ios-badge-blue',
                        badge: 'Пружина',
                        metric: 'Від 1 примірника',
                        onClick: () => { setDigitalSubTab('notebooks'); setNotebookPrintMethod('digital'); },
                        formats: [
                          { name: 'А6', onClick: () => { setDigitalSubTab('notebooks'); setNotebookPrintMethod('digital'); setNotebookWidth('105'); setNotebookHeight('148'); setNotebookStandardSize('105x148'); } },
                          { name: 'А5', onClick: () => { setDigitalSubTab('notebooks'); setNotebookPrintMethod('digital'); setNotebookWidth('148'); setNotebookHeight('210'); setNotebookStandardSize('148x210'); } },
                          { name: 'А4', onClick: () => { setDigitalSubTab('notebooks'); setNotebookPrintMethod('digital'); setNotebookWidth('210'); setNotebookHeight('297'); setNotebookStandardSize('210x297'); } },
                          { name: 'Євро', onClick: () => { setDigitalSubTab('notebooks'); setNotebookPrintMethod('digital'); setNotebookWidth('99'); setNotebookHeight('210'); setNotebookStandardSize('99x210'); } }
                        ]
                      },
                      {
                        id: 'mounted',
                        title: 'Каширована продукція',
                        desc: 'Багатошарові візитівки, листівки, запрошення, меню…',
                        icon: <Layers size={30} style={{ color: 'var(--primary)' }} />,
                        color: 'rgba(0, 122, 255, 0.1)',
                        badgeClass: 'ios-badge-blue',
                        badge: 'Каширування',
                        metric: 'Преміум картон',
                        onClick: () => setDigitalSubTab('mounted'),
                        formats: [
                          { name: '2 шари', onClick: () => { setDigitalSubTab('mounted'); setDigitalMountedLayers('2'); } },
                          { name: '3 шари', onClick: () => { setDigitalSubTab('mounted'); setDigitalMountedLayers('3'); } },
                          { name: '4 шари', onClick: () => { setDigitalSubTab('mounted'); setDigitalMountedLayers('4'); } },
                        ]
                      },
                      {
                        id: 'in_sheets',
                        title: 'Друк в листах',
                        desc: 'Відвантаження в листах без порізки: 320 × 450 мм (SRA3), 320 × 700 (Banner)',
                        icon: <Printer size={30} style={{ color: '#0ea5e9' }} />,
                        color: 'rgba(14, 165, 233, 0.1)',
                        badgeClass: 'ios-badge-blue',
                        badge: 'SRA3 / Banner',
                        metric: 'Без порізки',
                        onClick: () => setDigitalSubTab('in_sheets'),
                        formats: [
                          { name: 'SRA3 (320×450)', onClick: () => { setDigitalSubTab('in_sheets'); setDigitalInSheetsFormat('sra3'); } },
                          { name: 'SRA3+ (320×470)', onClick: () => { setDigitalInSheetsFormat('sra3_plus'); setDigitalSubTab('in_sheets'); } },
                          { name: 'Banner (320×700)', onClick: () => { setDigitalSubTab('in_sheets'); setDigitalInSheetsFormat('banner'); } },
                        ]
                      },
                      {
                        id: 'pouch_lam',
                        title: 'Конвертна ламінація',
                        desc: 'Меню, бейджи, документи, вказівники. Можливо для зовнішнього застосування',
                        icon: <ShieldCheck size={30} style={{ color: '#34c759' }} />,
                        color: 'rgba(52, 199, 89, 0.1)',
                        badgeClass: 'ios-badge-green',
                        badge: '125-250 мкм',
                        metric: 'HoReCa / Меню',
                        onClick: () => setDigitalSubTab('pouch_lam'),
                        formats: [
                          { name: '125 мкм', onClick: () => { setDigitalSubTab('pouch_lam'); setDigitalPouchThickness('125'); } },
                          { name: '175 мкм', onClick: () => { setDigitalSubTab('pouch_lam'); setDigitalPouchThickness('175'); } },
                          { name: '250 мкм', onClick: () => { setDigitalSubTab('pouch_lam'); setDigitalPouchThickness('250'); } },
                          { name: 'А4', onClick: () => { setDigitalSubTab('pouch_lam'); setDigitalPouchFormat('a4'); } },
                          { name: 'А3', onClick: () => { setDigitalSubTab('pouch_lam'); setDigitalPouchFormat('a3'); } },
                        ]
                      },
                      {
                        id: 'plotter_cut',
                        title: 'Плотерна порізка',
                        desc: 'Самоклеючих паперів та плівок. Наліпки, стікери, етикетка…',
                        icon: <Crop size={30} style={{ color: '#ff2d55' }} />,
                        color: 'rgba(255, 45, 85, 0.1)',
                        badgeClass: 'ios-badge-pink',
                        badge: 'Плотер',
                        metric: 'Самоклейка',
                        onClick: () => setDigitalSubTab('plotter_cut'),
                        formats: [
                          { name: 'Kiss-Cut', onClick: () => { setDigitalSubTab('plotter_cut'); setDigitalPlotterCutType('kiss_cut'); } },
                          { name: 'Наскрізний різ', onClick: () => { setDigitalSubTab('plotter_cut'); setDigitalPlotterCutType('through_cut'); } },
                          { name: 'Папір', onClick: () => { setDigitalSubTab('plotter_cut'); setDigitalPlotterMaterial('raflatac_paper'); } },
                          { name: 'Плівка', onClick: () => { setDigitalSubTab('plotter_cut'); setDigitalPlotterMaterial('raflatac_film'); } },
                        ]
                      },
                      {
                        id: 'die_cut_custom',
                        title: 'Фігурна порізка',
                        desc: 'Від 1 екземпляра, любої форми… Упаковка, коробка, папка, круг, зірка…',
                        icon: <Sparkles size={30} style={{ color: '#af52de' }} />,
                        color: 'rgba(175, 82, 222, 0.1)',
                        badgeClass: 'ios-badge-purple',
                        badge: 'Планшетний плотер',
                        metric: 'Від 1 екз',
                        onClick: () => setDigitalSubTab('die_cut_custom'),
                        formats: [
                          { name: 'Упаковка', onClick: () => { setDigitalSubTab('die_cut_custom'); setDigitalCncType('package'); } },
                          { name: 'Коробки', onClick: () => { setDigitalSubTab('die_cut_custom'); setDigitalCncType('package'); } },
                          { name: 'Папки', onClick: () => { setDigitalSubTab('die_cut_custom'); setDigitalCncType('folder'); } },
                          { name: 'Складні форми', onClick: () => { setDigitalSubTab('die_cut_custom'); setDigitalCncType('custom_shape'); } },
                        ]
                      },
                      {
                        id: 'folders',
                        title: 'Папки',
                        desc: 'Від 1 екземпляра, з вклеєною кишенею…',
                        icon: <FolderOpen size={30} style={{ color: '#ff9500' }} />,
                        color: 'rgba(255, 149, 0, 0.1)',
                        badgeClass: 'ios-badge-orange',
                        badge: 'Вклеєна кишеня',
                        metric: 'А4 папки',
                        onClick: () => setDigitalSubTab('folders'),
                        formats: [
                          { name: 'А4 формат', onClick: () => setDigitalSubTab('folders') },
                          { name: 'Без корінця', onClick: () => setDigitalSubTab('folders') },
                          { name: 'Корінець 5мм', onClick: () => setDigitalSubTab('folders') },
                        ]
                      },
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={item.onClick}
                        className="ios-card bg-white"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '24px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          minHeight: '200px',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '16px',
                              backgroundColor: item.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {item.icon}
                            </div>
                            <span className={`ios-badge ${item.badgeClass}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                              {item.badge}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.4' }}>
                            {item.desc}
                          </p>

                          {/* Format Chips */}
                          {item.formats && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                              {item.formats.map(fmt => (
                                <button
                                  key={fmt.name}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fmt.onClick();
                                  }}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-system)',
                                    border: '0.5px solid var(--border-light)',
                                    color: 'var(--text-dark)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                                    e.currentTarget.style.color = '#ffffff';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-system)';
                                    e.currentTarget.style.color = 'var(--text-dark)';
                                    e.currentTarget.style.borderColor = 'var(--border-light)';
                                  }}
                                >
                                  {fmt.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '0.5px solid var(--border-light)',
                          paddingTop: '12px',
                          marginTop: '16px'
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-medium)' }}>
                            {item.metric}
                          </span>
                          <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '700' }}>
                            Розрахувати <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. DIGITAL SHEETS CALCULATOR (ЛИСТОВА ПРОДУКЦІЯ) */}
              {digitalSubTab === 'sheets' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  {/* Title & Info Bar */}
                  <div className="ios-card bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                          <FileText size={22} />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 m-0">Листова</h3>
                          <span className="text-xs text-slate-500">Цифровий оперативний друк від 1 примірника</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Розмір & Вид готового виробу */}
                  <div className="ios-card bg-white p-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Left: Size Selectors */}
                      <div className="md:col-span-6 flex flex-col gap-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          Розмір
                        </h4>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Оберіть стандартний:</label>
                          <select
                            value={sheetSizePreset}
                            onChange={(e) => {
                              const v = e.target.value;
                              setSheetSizePreset(v);
                              const presetsMap: Record<string, [string, string]> = {
                                '1': ['90', '50'],
                                '2': ['85', '55'],
                                '3': ['100', '70'],
                                '4': ['99', '210'],
                                '5': ['105', '148'],
                                '6': ['148', '210'],
                                '7': ['210', '297'],
                                '8': ['297', '420'],
                                '9': ['306', '436'],
                                '10': ['45', '50'],
                                '11': ['180', '50'],
                                '12': ['110', '85'],
                                '13': ['170', '55'],
                                '14': ['99', '99'],
                                '15': ['198', '210'],
                                '16': ['50', '30'],
                                '17': ['90', '90'],
                              };
                              if (presetsMap[v]) {
                                setSheetCustomWidth(presetsMap[v][0]);
                                setSheetCustomHeight(presetsMap[v][1]);
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all shadow-sm"
                          >
                            <optgroup label="Візитки">
                              <option value="1">90 × 50 мм — Візитка стандарт</option>
                              <option value="10">45 × 50 мм — Піввізитки</option>
                              <option value="11">180 × 50 мм — Подвійна візитка</option>
                            </optgroup>
                            <optgroup label="Євровізитки">
                              <option value="2">55 × 85 мм — Євро візитка</option>
                              <option value="12">85 × 110 мм — Подвійна євровізитка (гориз)</option>
                              <option value="13">55 × 170 мм — Подвійна євровізитка (верт)</option>
                            </optgroup>
                            <optgroup label="Календарі">
                              <option value="3">100 × 70 мм — Календар кишеньковий</option>
                            </optgroup>
                            <optgroup label="Флаєри">
                              <option value="4">99 × 210 мм — Флаєр (DL)</option>
                              <option value="14">99 × 99 мм — Півфлаєра</option>
                              <option value="15">198 × 210 мм — Подвійний флаєр (буклет)</option>
                            </optgroup>
                            <optgroup label="Стандартні формати">
                              <option value="5">105 × 148 мм — А6</option>
                              <option value="6">148 × 210 мм — А5</option>
                              <option value="7">210 × 297 мм — А4</option>
                              <option value="8">297 × 420 мм — А3</option>
                              <option value="9">306 × 436 мм — SRA3 цифровий</option>
                            </optgroup>
                            <optgroup label="Інші">
                              <option value="16">30 × 50 мм — Євробірка</option>
                              <option value="17">90 × 90 мм — Кубарик</option>
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Введіть свій розмір:</label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={sheetCustomWidth}
                                onChange={(e) => setSheetCustomWidth(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Ширина"
                              />
                              <span className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400">Ш</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const temp = sheetCustomWidth;
                                setSheetCustomWidth(sheetCustomHeight);
                                setSheetCustomHeight(temp);
                              }}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                              title="Поміняти ширину та висоту місцями (⇄)"
                            >
                              <ArrowLeftRight size={14} />
                            </button>
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={sheetCustomHeight}
                                onChange={(e) => setSheetCustomHeight(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Висота"
                              />
                              <span className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400">В</span>
                            </div>
                            <select
                              value={sheetUnit}
                              onChange={(e) => setSheetUnit(e.target.value as any)}
                              className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                            >
                              <option value="mm">мм</option>
                              <option value="cm">см</option>
                            </select>
                          </div>
                        </div>

                        {/* Standard Format Pills to Fill Layout Space */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                              {(category as string) === 'Буклети' ? 'Стандартні розміри буклетів:' : 'Стандартні формати:'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Швидкий вибір</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {((category as string) === 'Буклети'
                              ? [
                                  { label: 'Євробуклет А4 (2 згини)', w: '297', h: '210', fold: '21', desc: 'У згині 100×210' },
                                  { label: 'Міні-буклет А5 (2 згини)', w: '210', h: '148', fold: '21', desc: 'У згині 70×148' },
                                  { label: 'Буклет А3 (2 згини)', w: '420', h: '297', fold: '21', desc: 'У згині 140×297' },
                                  { label: 'Книжка А4 в А5 (1 згин)', w: '297', h: '210', fold: '20', desc: 'У згині 148×210' },
                                  { label: 'Книжка А3 в А4 (1 згин)', w: '420', h: '297', fold: '20', desc: 'У згині 210×297' },
                                  { label: 'Книжка А5 в А6 (1 згин)', w: '210', h: '148', fold: '20', desc: 'У згині 105×148' },
                                  { label: 'Квадрат 200×200 (2 згини)', w: '600', h: '200', fold: '21', desc: 'У згині 200×200' },
                                  { label: 'Квадрат 150×150 (2 згини)', w: '450', h: '150', fold: '21', desc: 'У згині 150×150' },
                                  { label: 'Гармошка 3 згини (4 пол.)', w: '396', h: '210', fold: '23', desc: 'У згині 99×210' },
                                  { label: 'Віконце Gate-fold', w: '297', h: '210', fold: '22', desc: 'У згині 148×210' },
                                  { label: 'Мапа / План 4 згини', w: '420', h: '594', fold: '24', desc: 'Складна схема' },
                                ]
                              : [
                                  { label: 'А4 (210 × 297 мм)', w: '210', h: '297', fold: '', desc: 'Стандарт' },
                                  { label: 'А5 (148 × 210 мм)', w: '148', h: '210', fold: '', desc: 'Листівка' },
                                  { label: 'А6 (105 × 148 мм)', w: '105', h: '148', fold: '', desc: 'Флаєр А6' },
                                  { label: 'Єврофлаєр (99 × 210 мм)', w: '99', h: '210', fold: '', desc: 'DL формат' },
                                  { label: 'А3 (297 × 420 мм)', w: '297', h: '420', fold: '', desc: 'Плакат' },
                                  { label: 'Візитка (90 × 50 мм)', w: '90', h: '50', fold: '', desc: 'Стандарт' },
                                  { label: 'Євровізитка (85 × 55 мм)', w: '85', h: '55', fold: '', desc: 'Євро' },
                                  { label: 'Календарик (100 × 70 мм)', w: '100', h: '70', fold: '', desc: 'Кишеньковий' },
                                  { label: 'Квадрат (105 × 105 мм)', w: '105', h: '105', fold: '', desc: 'Кубик' },
                                ]
                            ).map((sz, idx) => {
                              const isCurrent = sheetCustomWidth === sz.w && sheetCustomHeight === sz.h && (!sz.fold || postFolding === sz.fold);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setSheetCustomWidth(sz.w);
                                    setSheetCustomHeight(sz.h);
                                    setSheetSizePreset('custom');
                                    if (sz.fold) {
                                      setPostFolding(sz.fold);
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 rounded-xl text-left flex flex-col justify-center transition-all border ${
                                    isCurrent
                                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                                      : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                                  }`}
                                >
                                  <span className="text-[11px] font-extrabold truncate">{sz.label}</span>
                                  <span className="text-[9px] font-medium text-slate-400">{sz.desc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Blueprint Visual Preview */}
                      <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200/80 min-h-[170px]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Вид готового виробу</span>
                        <div
                          style={{
                            width: `${Math.min(180, Math.max(70, Number(sheetCustomWidth || 90) * 1.5))}px`,
                            height: `${Math.min(130, Math.max(45, Number(sheetCustomHeight || 50) * 1.5))}px`,
                            backgroundColor: '#ffffff',
                            border: '2px solid var(--primary)',
                            borderRadius: digitalSheetCornerCurve !== '0' ? '8px' : '3px',
                            boxShadow: '0 8px 20px rgba(0, 122, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <span className="text-xs font-extrabold text-blue-700">
                            {sheetCustomWidth} × {sheetCustomHeight} {sheetUnit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side 2 Columns (50% / 50%): Left = Materials Filter & Sets, Right = Postpress */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 items-stretch">
                    {/* Left Column (50%): Filter & Sets Counter */}
                    <div className="flex flex-col gap-4 h-full justify-between">
                      {/* Section: Фільтр специфікацій та матеріалів (Exact CRM Offset Pill Buttons) */}
                      <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex-1">
                        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 m-0">
                            Фільтр специфікацій та матеріалів
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">Параметри матриці</span>
                        </div>

                        <div className="flex flex-col divide-y divide-slate-100">
                          {/* Row 1: Material Options */}
                          <div className="p-3.5 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">МАТЕРІАЛ:</span>
                            <div className="flex gap-1.5 flex-wrap items-center">
                              {[
                                { id: 'kraft_70', label: 'Крафт 70' },
                                { id: '80', label: 'Офсет 80' },
                                { id: 'linen_300', label: 'Льон 300' },
                                { id: 'tintoretto_crema', label: 'Tintoretto 300' },
                                { id: 'stardream_opal', label: 'Stardream 285' },
                                { id: '90', label: 'Крейда МАТ 90' },
                                { id: '115', label: 'Крейда МАТ 115' },
                                { id: '130', label: 'Крейда МАТ 130' },
                                { id: '150', label: 'Крейда МАТ 150' },
                                { id: '170', label: 'Крейда МАТ 170' },
                                { id: '250', label: 'Крейда МАТ 250' },
                                { id: '300', label: 'Крейда МАТ 300' },
                                { id: '350', label: 'Крейда МАТ 350' },
                                { id: '450', label: 'Крейда МАТ 450' },
                                { id: 'raflatac', label: 'Raflatac' }
                              ].map(mat => {
                                const isSel = digitalSelectedMaterials.includes(mat.id);
                                return (
                                  <button
                                    key={mat.id}
                                    type="button"
                                    onClick={() => {
                                      setDigitalSelectedMaterials(prev => 
                                        prev.includes(mat.id) ? [] : [mat.id]
                                      );
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                      isSel
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-black'
                                        : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
                                    }`}
                                  >
                                    {mat.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Row 2: Coating Options */}
                          <div className="p-3.5 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">ПОКРИТТЯ:</span>
                            <div className="flex gap-1.5 flex-wrap items-center">
                              {[
                                { id: '0', label: 'БП' },
                                { id: '7', label: 'ГЛ лам 1+0' },
                                { id: '8', label: 'ГЛ лам 1+1' },
                                { id: '9', label: 'МАТ лам 1+0' },
                                { id: '10', label: 'МАТ лам 1+1' },
                                { id: '30', label: 'SOFT лам 1+0' },
                                { id: '31', label: 'SOFT лам 1+1' },
                                { id: 'uv_10', label: 'УФ ЛАК 1+0' },
                                { id: 'uv_11', label: 'УФ ЛАК 1+1' }
                              ].map(cov => {
                                const isSel = digitalSelectedCoverings.includes(cov.id);
                                return (
                                  <button
                                    key={cov.id}
                                    type="button"
                                    onClick={() => {
                                      setDigitalSelectedCoverings(prev => 
                                        prev.includes(cov.id) ? [] : [cov.id]
                                      );
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                      isSel
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-black'
                                        : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
                                    }`}
                                  >
                                    {cov.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Row 3: Color Printing Options */}
                          <div className="p-3.5 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">ДРУК:</span>
                            <div className="flex gap-1.5 flex-wrap items-center">
                              {[
                                { id: '4+0', label: 'Односторонній 4+0' },
                                { id: '4+4', label: 'Двосторонній 4+4' },
                                { id: '1+0', label: 'Одноколірний 1+0' },
                                { id: '1+1', label: 'Одноколірний 1+1' },
                                { id: 'white_10', label: 'WHITE 1+0' },
                                { id: 'white_11', label: 'WHITE 1+1' },
                                { id: 'white_50', label: '5+0 WHITE+CMYK' },
                                { id: 'white_55', label: '5+5 WHITE+CMYK' },
                              ].map(col => {
                                const isSel = digitalSelectedPrints.includes(col.id);
                                return (
                                  <button
                                    key={col.id}
                                    type="button"
                                    onClick={() => {
                                      setDigitalSelectedPrints(prev => 
                                        prev.includes(col.id) ? [] : [col.id]
                                      );
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                      isSel
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 font-black'
                                        : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
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


                    </div>

                    {/* Right Column (50%): Післядрукарська обробка */}
                    <div className="ios-card bg-white overflow-hidden flex flex-col h-full">
                      <div className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/90 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal size={16} className="text-blue-600" />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Післядрукарська обробка (Нормативи)</span>
                          {(digitalSheetCornerCurve !== '0' || digitalSheetDrilling !== '0' || digitalSheetLuvers !== '0' || digitalSheetPersonalization !== '0' || digitalSheetFolding !== '0' || digitalSheetGluingBlock !== '0') && (
                            <span className="ios-badge-blue text-[10px] px-2 py-0.5 rounded-full font-bold">Опції обрано</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDigitalSheetCornerCurve('0');
                            setDigitalSheetDrilling('0');
                            setDigitalSheetLuvers('0');
                            setDigitalSheetPersonalization('0');
                            setDigitalSheetFolding('0');
                            setDigitalSheetGluingBlock('0');
                          }}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-red-600 text-[11px] font-semibold transition-colors shadow-2xs"
                        >
                          Очистити
                        </button>
                      </div>

                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white flex-1">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Заокруглення кутів:</label>
                          <select
                            value={digitalSheetCornerCurve}
                            onChange={(e) => setDigitalSheetCornerCurve(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                          >
                            <option value="0">Ні</option>
                            <option value="4">4 кути (R=5мм)</option>
                            <option value="1">1 кут</option>
                            <option value="2">2 кути</option>
                            <option value="3">3 кути</option>
                          </select>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Свердління:</label>
                          <select
                            value={digitalSheetDrilling}
                            onChange={(e) => setDigitalSheetDrilling(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                          >
                            <option value="0">Ні</option>
                            <option value="1">1 отвір (Ø 5мм)</option>
                            <option value="2">2 отвори</option>
                            <option value="3">3 отвори</option>
                            <option value="4">4 отвори</option>
                          </select>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Люверс (пікколо):</label>
                          <select
                            value={digitalSheetLuvers}
                            onChange={(e) => setDigitalSheetLuvers(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                          >
                            <option value="0">Ні</option>
                            <option value="gold">Золотий люверс</option>
                            <option value="silver">Срібний люверс</option>
                          </select>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Персоналізація:</label>
                          <select
                            value={digitalSheetPersonalization}
                            onChange={(e) => setDigitalSheetPersonalization(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                          >
                            <option value="0">Ні</option>
                            <option value="1">Нумерація / QR</option>
                          </select>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Фальцовка / Біговка:</label>
                          <select
                            value={digitalSheetFolding}
                            onChange={(e) => setDigitalSheetFolding(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                          >
                            <option value="0">Ні</option>
                            <option value="1">1 згин (буклет)</option>
                            <option value="2">2 згини (євро)</option>
                            <option value="3">3 згини</option>
                          </select>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Проклеювання в блок:</label>
                          <select
                            value={digitalSheetGluingBlock}
                            onChange={(e) => setDigitalSheetGluingBlock(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                          >
                            <option value="0">Ні</option>
                            <option value="25">По 25 листів</option>
                            <option value="50">По 50 листів</option>
                            <option value="100">По 100 листів</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Calculation Matrix Table (Matching Exact Offset Design) */}
                  <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
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
                            checked={digitalSheetWithDelivery}
                            onChange={(e) => setDigitalSheetWithDelivery(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                          />
                          <span>{digitalSheetWithDelivery ? 'З доставкою' : 'Без доставки'}</span>
                        </label>

                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setDigitalSheetPerPiece(false)}
                            className={`px-3 py-1 rounded-md transition-all ${
                              !digitalSheetPerPiece
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            за тираж
                          </button>
                          <button
                            type="button"
                            onClick={() => setDigitalSheetPerPiece(true)}
                            className={`px-3 py-1 rounded-md transition-all ${
                              digitalSheetPerPiece
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
                            {[1, 25, 50, 100, 200, 500, 1000].map(tir => (
                              <th key={tir} style={{ padding: '9px 8px', border: '1px solid #a00000' }} className="font-bold text-white bg-slate-800">{tir}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {digitalSelectedMaterials.length === 0 || digitalSelectedCoverings.length === 0 || digitalSelectedPrints.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-8 text-center text-slate-400 font-semibold">
                                Будь ласка, оберіть хоча б один матеріал, покриття та тип друку у фільтрі вище.
                              </td>
                            </tr>
                          ) : (
                            digitalSelectedMaterials.flatMap(matId =>
                              digitalSelectedCoverings.flatMap(covId =>
                                digitalSelectedPrints.map(colId => {
                                  const matLabels: Record<string, string> = {
                                    '80': 'Офсет 80г',
                                    '90': 'Крейда МАТ 90г',
                                    '115': 'Крейда МАТ 115г',
                                    '130': 'Крейда МАТ 130г',
                                    '150': 'Крейда МАТ 150г',
                                    '170': 'Крейда МАТ 170г',
                                    '250': 'Крейда МАТ 250г',
                                    '300': 'Крейда МАТ 300г',
                                    '350': 'Крейда МАТ 350г',
                                    '450': 'Крейда МАТ 450г',
                                    'kraft_70': 'Крафт бурий 70г',
                                    'linen_300': 'Льон білий 300г',
                                    'tintoretto_crema': 'Tintoretto crema 300г',
                                    'tintoretto_gesso': 'Tintoretto gesso 300г',
                                    'stardream_opal': 'Stardream opal 285г',
                                    'stardream_diamond': 'Stardream diamond 285г',
                                    'stardream_topaz': 'Stardream topaz 285г',
                                    'raflatac': 'Самоклейка Raflatac',
                                  };
                                  const covLabels: Record<string, string> = {
                                    '0': '',
                                    '7': '(ГЛ лам 1+0)',
                                    '8': '(ГЛ лам 1+1)',
                                    '9': '(МАТ лам 1+0)',
                                    '10': '(МАТ лам 1+1)',
                                    '30': '(SOFT лам 1+0)',
                                    '31': '(SOFT лам 1+1)',
                                    'uv_10': '(УФ ЛАК 1+0)',
                                    'uv_11': '(УФ ЛАК 1+1)',
                                    'gibrid_10': '(Гібрид 1+0)',
                                  };

                                  const matName = matLabels[matId] || `Папір ${matId}г`;
                                  const covName = covLabels[covId] || '';
                                  const fullMatName = covName ? `${matName} ${covName}` : matName;

                                  const baseRate = colId.includes('4+4') || colId.includes('5+5') ? 2.4 : 1.5;
                                  const lamRate = covId === '0' ? 0 : covId.includes('3') ? 1.8 : 1.1;
                                  const deliveryFee = digitalSheetWithDelivery ? 90 : 0;

                                  const digCorners = digitalSheetCornerCurve !== '0' ? 0.15 : 0;
                                  const digDrill = digitalSheetDrilling !== '0' ? parseInt(digitalSheetDrilling) * 0.15 : 0;
                                  const digLuvers = digitalSheetLuvers !== '0' ? 1.20 : 0;
                                  const digPerson = digitalSheetPersonalization !== '0' ? 0.35 : 0;
                                  const digFold = digitalSheetFolding !== '0' ? parseInt(digitalSheetFolding) * norms.foldingPrice : 0;
                                  const digGlue = digitalSheetGluingBlock !== '0' ? 0.25 : 0;
                                  const digPostpressPerItem = digCorners + digDrill + digLuvers + digPerson + digFold + digGlue;

                                  return (
                                    <tr key={`${matId}-${covId}-${colId}`} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
                                      <td className="py-3 px-4 text-left font-bold text-slate-800 border-r border-slate-100">
                                        {fullMatName}
                                      </td>
                                      <td className="py-3 px-3 font-bold text-rose-600 border-r border-slate-100">
                                        {colId}
                                      </td>
                                      <td className="py-3 px-3 text-slate-500 font-semibold border-r border-slate-100">
                                        1 день
                                      </td>
                                      {[1, 25, 50, 100, 200, 500, 1000].map(tir => {
                                        const cost = Math.round(tir * digitalSheetSets * (baseRate + lamRate + digPostpressPerItem) + deliveryFee + 65);
                                        const displayCost = digitalSheetPerPiece ? (cost / tir).toFixed(2) : cost;

                                        return (
                                          <td
                                            key={tir}
                                            onClick={() => {
                                              setQuantity(tir);
                                              setDigitalSelectedMaterials([matId]);
                                              setDigitalSelectedCoverings([covId]);
                                              setDigitalSelectedPrints([colId]);
                                              document.getElementById('detailed-dig-calculation')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="py-3 px-3 border-r border-slate-100 last:border-r-0 font-extrabold text-slate-900 hover:bg-blue-600 hover:text-white cursor-pointer transition-all text-sm"
                                            title="Натисніть для вибору тиражу"
                                          >
                                            {displayCost} грн
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

                  {/* Digital Extended Order & Calculation Card matching user sketch */}
                  {(() => {
                    const digMatLabels: Record<string, string> = {
                      '80': 'Офсет 80г',
                      '90': 'Крейда МАТ 90г',
                      '115': 'Крейда МАТ 115г',
                      '130': 'Крейда МАТ 130г',
                      '150': 'Крейда МАТ 150г',
                      '170': 'Крейда МАТ 170г',
                      '250': 'Крейда МАТ 250г',
                      '300': 'Крейда МАТ 300г',
                      '350': 'Крейда МАТ 350г',
                      '450': 'Крейда МАТ 450г',
                      'kraft_70': 'Крафт бурий 70г',
                      'linen_300': 'Льон білий 300г',
                      'tintoretto_crema': 'Tintoretto crema 300г',
                      'tintoretto_gesso': 'Tintoretto gesso 300г',
                      'stardream_opal': 'Stardream opal 285г',
                      'stardream_diamond': 'Stardream diamond 285г',
                      'stardream_topaz': 'Stardream topaz 285г',
                      'raflatac': 'Самоклейка Raflatac',
                    };
                    const digCovLabels: Record<string, string> = {
                      '0': 'Без покриття',
                      '7': 'ГЛ ламінація 1+0',
                      '8': 'ГЛ ламінація 1+1',
                      '9': 'МАТ ламінація 1+0',
                      '10': 'МАТ ламінація 1+1',
                      '30': 'SOFT ламінація 1+0',
                      '31': 'SOFT ламінація 1+1',
                      'uv_10': 'УФ ЛАК 1+0',
                      'uv_11': 'УФ ЛАК 1+1',
                      'gibrid_10': 'Гібрид 1+0',
                    };

                    const digMatId = digitalSelectedMaterials[0] || '350';
                    const digCovId = digitalSelectedCoverings[0] || '0';
                    const digColId = digitalSelectedPrints[0] || '4+0';
                    const digTir = selectedSheetCalc?.tirazh || 100;

                    const digBaseRate = digColId.includes('4+4') || digColId.includes('5+5') ? 2.4 : 1.5;
                    const digLamRate = digCovId === '0' ? 0 : digCovId.includes('3') ? 1.8 : 1.1;
                    const digDeliv = digitalSheetWithDelivery ? 90 : 0;

                    const digCorn = digitalSheetCornerCurve !== '0' ? 0.15 * digTir : 0;
                    const digDr = digitalSheetDrilling !== '0' ? parseInt(digitalSheetDrilling) * 0.15 * digTir : 0;
                    const digLuv = digitalSheetLuvers !== '0' ? 1.20 * digTir : 0;
                    const digPers = digitalSheetPersonalization !== '0' ? 0.35 * digTir : 0;
                    const digFld = digitalSheetFolding !== '0' ? parseInt(digitalSheetFolding) * norms.foldingPrice * digTir : 0;
                    const digGl = digitalSheetGluingBlock !== '0' ? 0.25 * digTir : 0;
                    const digPostSum = digCorn + digDr + digLuv + digPers + digFld + digGl;

                    const hasDigMaterial = digitalSelectedMaterials.length > 0;
                    const digPaperCost = hasDigMaterial ? digTir * 0.85 : 0;
                    const digPrintCost = hasDigMaterial ? digTir * digBaseRate : 0;
                    const digLamCost = hasDigMaterial ? digTir * digLamRate : 0;
                    const digRawCost = hasDigMaterial ? (digPaperCost + digPrintCost + digLamCost + digPostSum + digDeliv + 45) : 0;

                    const digFinalPrice = hasDigMaterial ? Math.round(digRawCost * (1 + marginPercent / 100)) : 0;
                    const digMarginAmount = hasDigMaterial ? Math.max(0, digFinalPrice - digRawCost) : 0;
                    const digUnitPrice = hasDigMaterial && digTir > 0 ? digFinalPrice / digTir : 0;

                    const effectiveClient = isNewClientMode && customClientName.trim()
                      ? customClientName.trim()
                      : (activeClient?.name || 'Замовник');
                    const turnShortLabel = turnType === 'sam_na_sebe' ? 'с/с' : turnType === 'bez_oborotu' ? 'без обор.' : 'ч/о';
                    const fullComposedName = `№ ${orderNumber} - Цифровий друк ${sheetCustomWidth}×${sheetCustomHeight} ${sheetUnit} — ${effectiveClient} (${digMatLabels[digMatId] || '350г'}, ${digCovLabels[digCovId] || 'БП'}, ${digColId}, ${turnShortLabel}, ${digTir} шт.)`;

                    return (
                      <div id="detailed-digital-calculation" className="ios-card bg-white p-6 md:p-7 rounded-2xl border border-blue-200 shadow-lg shadow-blue-500/5 flex flex-col gap-6 md:gap-7">
                        {/* Section Header */}
                        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                              <FileText size={18} />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-slate-900 m-0">
                                Оформлення та кошторис: Цифровий друк
                              </h4>
                              <span className="text-xs text-slate-500 font-medium">
                                Параметри розрахунку, розцінки 1С та формування документів
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {digTir} шт
                            </span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                              {digColId} ({turnShortLabel})
                            </span>
                          </div>
                        </div>

                        {/* Top 3-Field Strip: [ № ] [ ЗАМОВНИК ] [ ПРОДУКЦІЯ (авто) ] */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                          {/* 1. Номер замовлення (Фіксований ID рахунку) */}
                          <div className="md:col-span-3 flex flex-col gap-1">
                            <label className="text-[11px] font-extrabold text-slate-700 uppercase">№ Замовлення (ID):</label>
                            <div className="w-full px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-black text-blue-700 font-mono flex items-center select-none cursor-default shadow-2xs">
                              № {orderNumber}
                            </div>
                          </div>

                          {/* 2. Замовник */}
                          <div className="md:col-span-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-700 uppercase">Замовник:</label>
                              <button
                                type="button"
                                onClick={() => setIsNewClientMode(!isNewClientMode)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                              >
                                {isNewClientMode ? 'Вибрати з бази' : '+ Вписати нового'}
                              </button>
                            </div>

                            {isNewClientMode ? (
                              <input
                                type="text"
                                placeholder="Введіть назву клієнта"
                                value={customClientName}
                                onChange={(e) => setCustomClientName(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-blue-400 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                              >
                                <option value="">-- Оберіть замовника з бази --</option>
                                {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* 3. Продукція (авто) */}
                          <div className="md:col-span-5 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-700 uppercase">Продукція:</label>
                              
                            </div>
                            <input
                              type="text"
                              value={customTitleMap['digital'] ?? fullComposedName}
                              onChange={(e) => {
                                setCustomTitleMap(prev => ({ ...prev, digital: e.target.value }));
                                setName(e.target.value);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                            />
                          </div>
                        </div>

                        {/* 2-Column Main Section: Left = ОБОРОТ (СПУСК) | Right = РОЗРАХУНОК + Горизонтальні кнопки */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 items-stretch">
                          {/* 1. Left Column (50%): ОБОРОТ (СПУСК) & Параметри тиражу */}
                          <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                            <div className="flex flex-col gap-4">
                              {/* Header */}
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">ОБОРОТ (СПУСК):</span>
                                <span className="text-[11px] font-bold text-slate-400">Схема друку</span>
                              </div>
                              
                              {/* Turn Type Pill Selector */}
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'sam_na_sebe', label: 'Сам на себе (с/с)' },
                                  { id: 'chuzhyi_oborut', label: 'Чужий оборот (ч/о)' },
                                  { id: 'bez_oborotu', label: 'Без обороту' }
                                ].map(t => {
                                  const isSel = turnType === t.id;
                                  return (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() => handleSelectTurnType(t.id as any)}
                                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 border ${
                                        isSel
                                          ? 'bg-blue-50 text-blue-700 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs'
                                          : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                                      }`}
                                    >
                                      <span>{t.label}</span>
                                      {isSel && <Check size={13} className="text-blue-600 font-bold" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Tirazh Input */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-extrabold text-slate-700 uppercase">ТИРАЖ (ШТ):</label>
                                <input
                                  type="number"
                                  value={digTir}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 100;
                                    setSelectedSheetCalc(prev => prev ? { ...prev, tirazh: val } : {
                                      matId: digMatId,
                                      covId: digCovId,
                                      colStr: digColId,
                                      tirazh: val,
                                      matName: digMatLabels[digMatId] || 'Папір',
                                      covName: digCovLabels[digCovId] || 'БП',
                                      rawCost: digRawCost,
                                      basePaperCost: digPaperCost,
                                      printCost: digPrintCost,
                                      lamCost: digLamCost,
                                      postpressSum: digPostSum,
                                      deliveryCost: digDeliv,
                                      finalPrice: digFinalPrice,
                                      unitPrice: digUnitPrice
                                    });
                                  }}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                                />
                              </div>

                              {/* Margin slider & presets */}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs">
                                  <label className="text-xs font-extrabold text-slate-700 uppercase">НАЦІНКА (МАРЖА):</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="500"
                                      value={marginPercent}
                                      onChange={(e) => setMarginPercent(Math.max(0, parseInt(e.target.value) || 0))}
                                      className="w-16 px-2 py-0.5 rounded-lg border border-blue-300 bg-white font-black text-blue-600 text-xs text-center focus:outline-none focus:border-blue-600 shadow-2xs"
                                    />
                                    <span className="font-extrabold text-blue-600">%</span>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="300"
                                  step="5"
                                  value={marginPercent}
                                  onChange={(e) => setMarginPercent(Number(e.target.value) || 0)}
                                  className="w-full cursor-pointer accent-blue-600 h-2 bg-slate-200 rounded-lg"
                                />
                                <div className="grid grid-cols-5 gap-2">
                                  {[20, 35, 50, 100, 150].map(m => {
                                    const isSel = marginPercent === m;
                                    return (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMarginPercent(m)}
                                        className={`py-2 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center border ${
                                          isSel
                                            ? 'bg-blue-50 text-blue-700 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs font-extrabold'
                                            : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                                        }`}
                                      >
                                        {m}%
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2. Right Column (50%): РОЗРАХУНОК + ГОРИЗОНТАЛЬНІ КНОПКИ СПРАВА */}
                          <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                  РОЗРАХУНОК (СОБІВАРТІСТЬ & НОРМИ 1С):
                                </span>
                                <strong className="text-sm font-black text-slate-900 font-mono">
                                  {digRawCost.toFixed(2)} ₴
                                </strong>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Матеріали / Папір:</span>
                                  <strong className="font-mono text-slate-900">{digPaperCost.toFixed(2)} ₴</strong>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Цифровий друк:</span>
                                  <strong className="font-mono text-slate-900">{digPrintCost.toFixed(2)} ₴</strong>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Ламінація / Покриття:</span>
                                  <strong className="font-mono text-slate-900">{digLamCost.toFixed(2)} ₴</strong>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Післядрукарські роботи:</span>
                                  <strong className="font-mono text-slate-900">{digPostSum.toFixed(2)} ₴</strong>
                                </div>
                                {digDeliv > 0 && (
                                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2">
                                    <span className="text-slate-600 font-medium">Доставка:</span>
                                    <strong className="font-mono text-slate-900">{digDeliv.toFixed(2)} ₴</strong>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-between text-[11px] font-semibold text-slate-500 px-1">
                                <span>Собівартість 1 екземпляра:</span>
                                <strong className="font-mono text-slate-800">
                                  {(digRawCost / digTir).toFixed(4)} ₴ / шт
                                </strong>
                              </div>

                              {/* Total Final Price Box */}
                              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">РАЗОМ ДО СПЛАТИ:</span>
                                  <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                                    +{digMarginAmount.toFixed(2)} ₴ маржа
                                  </span>
                                </div>
                                <div className="flex items-baseline justify-between pt-1">
                                  <p className="text-3xl font-black text-blue-600 my-0 font-mono tracking-tight leading-none">
                                    {digFinalPrice} <span className="text-base font-bold text-slate-600">₴</span>
                                  </p>
                                  <div className="text-right">
                                    <span className="text-[11px] text-slate-500 font-medium block">Ціна за 1 шт:</span>
                                    <strong className="text-sm font-black text-slate-900 font-mono">{digUnitPrice.toFixed(2)} ₴ / шт</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Horizontal Action Buttons Right: [ ШАБЛОН ] [ PDF ] [ КП ] [ ВИРОБНИЦТВО ] */}
                            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setTemplateName(customTitleMap['digital'] ?? fullComposedName);
                                  setShowTemplateModal(true);
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                              >
                                Шаблон
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setName(fullComposedName);
                                  setShowInvoice(true);
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                              >
                                ПДФ
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const text = `Комерційна пропозиція № ${orderNumber}
Замовник: ${effectiveClient}
Продукція: Цифровий друк
Розмір: ${sheetCustomWidth} × ${sheetCustomHeight} ${sheetUnit}
Матеріал: ${digMatLabels[digMatId] || '350г'}
Покриття: ${digCovLabels[digCovId] || 'БП'}
Друк: ${digColId} (Оборот: ${turnShortLabel})
Тираж: ${digTir} шт
Вартість замовлення: ${digFinalPrice} грн (${digUnitPrice.toFixed(2)} грн/шт)
Друкарня "Едельвейс і К"`;
                                  navigator.clipboard.writeText(text);
                                  alert('Комерційну пропозицію (КП) скопійовано в буфер обміну.');
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                              >
                                КП
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const itemW = parseFloat(sheetCustomWidth) || 210;
                                  const itemH = parseFloat(sheetCustomHeight) || 297;
                                  const sheetW = 450;
                                  const sheetH = 320;
                                  const fit1 = Math.floor(sheetW / itemW) * Math.floor(sheetH / itemH);
                                  const fit2 = Math.floor(sheetW / itemH) * Math.floor(sheetH / itemW);
                                  const itemsPerSheetCalc = Math.max(1, fit1, fit2);
                                  const physSheets = Math.ceil(digTir / itemsPerSheetCalc);
                                  const priladka = 3;
                                  const techWaste = Math.max(2, Math.ceil(physSheets * 0.02));

                                  addOrder({
                                    id: orderNumber.toString(),
                                    name: name || fullComposedName,
                                    clientId: isNewClientMode ? (customClientName || 'Новий клієнт') : selectedClientId,
                                    category: 'Цифровий друк',
                                    quantity: digTir,
                                    packingCount: 100,
                                    paperType: 'coated',
                                    paperName: digMatLabels[digMatId] || 'Крейдований 350 г/м²',
                                    sheetSize: '320 × 450 мм (SRA3)',
                                    turnTypeLabel: turnType === 'sam_na_sebe' ? 'Сам на себе (с/с)' : 'Без обороту',
                                    colors: digColId,
                                    isSamNaSebe: turnType === 'sam_na_sebe',
                                    designCost: designCost,
                                    margin: marginPercent,
                                    machine: 'Цифрова машина Konica Minolta AccurioPress C7090',
                                    format: `${sheetCustomWidth}×${sheetCustomHeight} ${sheetUnit}`,
                                    physicalSheets: physSheets,
                                    itemsPerSheet: itemsPerSheetCalc,
                                    priladkaSheets: priladka,
                                    techWasteSheets: techWaste,
                                    totalGrossSheets: physSheets + priladka + techWaste,
                                    platesCount: 0,
                                    postpressOps: [
                                      { name: `Порізка в готовий розмір ${sheetCustomWidth}×${sheetCustomHeight} мм`, qty: `${digTir} шт` },
                                      ...(digCovId !== '0' ? [{ name: `Ламінування: ${digCovLabels[digCovId] || 'Ламінація'}`, qty: `${physSheets} арк.` }] : []),
                                      { name: 'Фасування та упаковка продукції', qty: 'Стандартна' }
                                    ],
                                    packingInfo: 'Стандартна упаковка в папір/стрейч',
                                    deadline: 'Сьогодні / завтра',
                                    subtotal: digRawCost,
                                    marginAmount: digMarginAmount,
                                    finalPrice: digFinalPrice,
                                    unitPrice: digUnitPrice,
                                    paymentStatus: 'unpaid',
                                    prepayment: 0,
                                    notes: `Специфікація: ${name || fullComposedName}, ${sheetCustomWidth}×${sheetCustomHeight} ${sheetUnit}, ${digMatLabels[digMatId] || '350г'}, ${digCovLabels[digCovId] || 'БП'}, ${digColId}, ${digTir} шт.`
                                  });
                                  alert(`Замовлення № ${orderNumber} успішно сформовано з автоматичним розрахунком виробництва та передано в цех!`);
                                  setOrderNumber(Math.floor(10000 + Math.random() * 90000));
                                }}
                                className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all text-center"
                              >
                                Виробництво
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 2. DIGITAL FELLING (ВИСІЧНА ПРОДУКЦІЯ) */}
              {digitalSubTab === 'felling' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  {/* Title & Info Bar */}
                  <div className="ios-card bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                          <Scissors size={22} />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 m-0">Висічна продукція</h3>
                          <span className="text-xs text-slate-500">Швидка цифрова висічка готових форм (підставки, кишенькові календарі, бирки)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Форма (Categories) */}
                  <div className="ios-card bg-white p-5 flex flex-col gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Форма
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { id: '1', title: 'Стандартна', desc: 'Бирки, підставки, доміки' },
                        { id: '2', title: 'Кругла', desc: 'Костери, наліпки' },
                        { id: '3', title: 'Овальна', desc: 'Овальні форми' },
                        { id: '4', title: 'Прямокутна', desc: 'Із заокругленням' },
                        { id: '5', title: 'Етикетка', desc: 'Кольєретки, бірки' },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFellingForm(f.id)}
                          className={`p-3.5 rounded-xl text-center transition-all border ${
                            fellingForm === f.id
                              ? 'border-2 border-blue-600 bg-blue-50/40 shadow-sm font-bold text-blue-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs font-extrabold">{f.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section: Штамп & Вид готового виробу */}
                  <div className="ios-card bg-white p-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-6 flex flex-col gap-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          Штамп
                        </h4>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Оберіть готовий штамп:</label>
                          <select
                            value={fellingStamp}
                            onChange={(e) => setFellingStamp(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all shadow-sm"
                          >
                            <option value="160">Будинок (210 × 300 мм) — календар настільний</option>
                            <option value="161">Пірамідка (305 × 134 мм) — настільна рекламна піраміда</option>
                            <option value="130">Підставка під чашку (Ø 90 мм) — круглий костер</option>
                            <option value="131">Календар кишеньковий (100 × 70 мм) — з радіусом R=5</option>
                          </select>
                        </div>

                        <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 flex items-center gap-3">
                          <Download size={16} className="text-blue-600 shrink-0" />
                          <div className="text-xs">
                            <span className="font-bold text-blue-900 block">Готовий контур штампу</span>
                            <span className="text-[11px] text-blue-700">Завантажте векторний шаблон PDF для розміщення вашого макету</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Preview Box */}
                      <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200/80 min-h-[170px]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Вид готового виробу</span>
                        <div className="w-32 h-44 rounded-xl bg-white border-2 border-blue-600 shadow-md flex flex-col items-center justify-center relative p-3 text-center">
                          <div className="w-8 h-8 rounded-full border-2 border-blue-400 mb-2"></div>
                          <span className="text-xs font-black text-blue-700">
                            {fellingStamp === '160' ? '210 × 300 мм' : fellingStamp === '161' ? '305 × 134 мм' : fellingStamp === '130' ? 'Ø 90 мм' : '100 × 70 мм'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">Висічний контур</span>
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Section: Фільтр специфікацій та матеріалів (Exact CRM Offset Pill Buttons) */}
                  <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
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
                            { id: '300', label: 'Крейда МАТ 300' },
                            { id: '350', label: 'Крейда МАТ 350' },
                            { id: '450', label: 'Крейда МАТ 450' },
                            { id: 'card_white', label: 'Картон білий 300' },
                            { id: 'kraft_300', label: 'Крафт картон 300' },
                            { id: 'beer_card', label: 'Пивний картон 1.5 мм' },
                          ].map(mat => {
                            const isSel = fellingSelectedMaterials.includes(mat.id);
                            return (
                              <button
                                key={mat.id}
                                type="button"
                                onClick={() => {
                                  setFellingSelectedMaterials(prev => 
                                    prev.includes(mat.id) ? prev.filter(x => x !== mat.id) : [...prev, mat.id]
                                  );
                                }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                  isSel
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                                    : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
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
                          ].map(cov => {
                            const isSel = fellingSelectedCoverings.includes(cov.id);
                            return (
                              <button
                                key={cov.id}
                                type="button"
                                onClick={() => {
                                  setFellingSelectedCoverings(prev => 
                                    prev.includes(cov.id) ? prev.filter(x => x !== cov.id) : [...prev, cov.id]
                                  );
                                }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                  isSel
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                                    : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
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
                            { id: '1+1', label: 'Одноколірний 1+1' },
                          ].map(col => {
                            const isSel = fellingSelectedPrints.includes(col.id);
                            return (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => {
                                  setFellingSelectedPrints(prev => 
                                    prev.includes(col.id) ? prev.filter(x => x !== col.id) : [...prev, col.id]
                                  );
                                }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                  isSel
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                                    : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs font-bold'
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

                  {/* Price Calculation Matrix Table (Matching Exact Offset Design) */}
                  <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
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
                            checked={digitalSheetWithDelivery}
                            onChange={(e) => setDigitalSheetWithDelivery(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                          />
                          <span>{digitalSheetWithDelivery ? 'З доставкою' : 'Без доставки'}</span>
                        </label>

                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setDigitalSheetPerPiece(false)}
                            className={`px-3 py-1 rounded-md transition-all ${
                              !digitalSheetPerPiece
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            за тираж
                          </button>
                          <button
                            type="button"
                            onClick={() => setDigitalSheetPerPiece(true)}
                            className={`px-3 py-1 rounded-md transition-all ${
                              digitalSheetPerPiece
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
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Форма, Матеріал та покриття</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Друк</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Готовність</th>
                            {[50, 100, 200, 500, 1000].map(tir => (
                              <th key={tir} style={{ padding: '9px 8px', border: '1px solid #a00000' }} className="font-bold text-white bg-slate-800">{tir}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {fellingSelectedMaterials.length === 0 || fellingSelectedCoverings.length === 0 || fellingSelectedPrints.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold">
                                Будь ласка, оберіть параметри висічки у фільтрі вище.
                              </td>
                            </tr>
                          ) : (
                            fellingSelectedMaterials.flatMap(matId =>
                              fellingSelectedCoverings.flatMap(covId =>
                                fellingSelectedPrints.map(colId => {
                                  const matLabels: Record<string, string> = {
                                    '300': 'Крейда МАТ 300г',
                                    '350': 'Крейда МАТ 350г',
                                    '450': 'Крейда МАТ 450г',
                                    'card_white': 'Картон білий 300г',
                                    'kraft_300': 'Крафт картон 300г',
                                    'beer_card': 'Пивний картон 1.5мм',
                                  };
                                  const covLabels: Record<string, string> = {
                                    '0': '',
                                    '7': '(ГЛ лам 1+0)',
                                    '8': '(ГЛ лам 1+1)',
                                    '9': '(МАТ лам 1+0)',
                                    '10': '(МАТ лам 1+1)',
                                    '30': '(SOFT лам 1+0)',
                                    '31': '(SOFT лам 1+1)',
                                  };

                                  const matName = matLabels[matId] || `Матеріал ${matId}`;
                                  const covName = covLabels[covId] || '';
                                  const fullMatName = covName ? `${matName} ${covName}` : matName;

                                  const baseRate = colId.includes('4+4') ? 4.5 : 3.2;
                                  const lamRate = covId === '0' ? 0 : 1.4;

                                  return (
                                    <tr key={`${matId}-${covId}-${colId}`} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
                                      <td className="py-3 px-4 text-left font-bold text-slate-800 border-r border-slate-100">
                                        Висічний виріб №{fellingStamp} — {fullMatName}
                                      </td>
                                      <td className="py-3 px-3 font-bold text-rose-600 border-r border-slate-100">
                                        {colId}
                                      </td>
                                      <td className="py-3 px-3 text-slate-500 font-semibold border-r border-slate-100">
                                        1-2 дні
                                      </td>
                                      {[50, 100, 200, 500, 1000].map(tir => {
                                        const cost = Math.round(tir * digitalSheetSets * (baseRate + lamRate) + 140);
                                        const displayCost = digitalSheetPerPiece ? (cost / tir).toFixed(2) : cost;

                                        return (
                                          <td
                                            key={tir}
                                            onClick={() => {
                                              setQuantity(tir);
                                              setDigitalSelectedMaterials([matId]);
                                              setDigitalSelectedCoverings([covId]);
                                              setDigitalSelectedPrints([colId]);
                                              document.getElementById('detailed-dig-calculation')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="py-3 px-3 border-r border-slate-100 last:border-r-0 font-extrabold text-slate-900 hover:bg-blue-600 hover:text-white cursor-pointer transition-all text-sm"
                                            title="Натисніть для вибору тиражу"
                                          >
                                            {displayCost} грн
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

              {/* 3. DIGITAL MULTIPAGE (БАГАТОСТОРІНКОВА) */}
              {digitalSubTab === 'multipage' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  {/* Title & Info Bar */}
                  <div className="ios-card bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 m-0">Багатосторінкова</h3>
                          <span className="text-xs text-slate-500">Оперативний цифровий друк брошур, каталогів, журналів та презентацій</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Зшивання (Stitching Modes) */}
                  <div className="ios-card bg-white p-5 flex flex-col gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Зшивання
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Card 1: Скоба */}
                      <button
                        type="button"
                        onClick={() => setMultiStitching('1')}
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border text-center ${
                          multiStitching === '1'
                            ? 'border-2 border-blue-600 bg-blue-50/40 shadow-sm'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="w-24 h-24 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2 relative">
                          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 10L30 5L48 10V60L30 65L12 60V10Z" fill="#F8FAFC" stroke="#007AFF" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M30 5V65" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
                            <rect x="28.5" y="18" width="3" height="8" rx="1.5" fill="#007AFF" />
                            <rect x="28.5" y="44" width="3" height="8" rx="1.5" fill="#007AFF" />
                          </svg>
                        </div>
                        <span className={`text-xs font-bold ${multiStitching === '1' ? 'text-blue-600 font-extrabold' : 'text-slate-700'}`}>
                          Скоба (8 — 64 стр)
                        </span>
                      </button>

                      {/* Card 2: Пружина */}
                      <button
                        type="button"
                        onClick={() => setMultiStitching('2')}
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border text-center ${
                          multiStitching === '2'
                            ? 'border-2 border-blue-600 bg-blue-50/40 shadow-sm'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="w-24 h-24 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2 relative">
                          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="18" y="8" width="34" height="54" rx="3" fill="#F8FAFC" stroke="#007AFF" strokeWidth="2" />
                            {[14, 22, 30, 38, 46, 54].map((y, i) => (
                              <ellipse key={i} cx="18" cy={y} rx="4" ry="2" stroke="#007AFF" strokeWidth="2" fill="#FFFFFF" />
                            ))}
                          </svg>
                        </div>
                        <span className={`text-xs font-bold ${multiStitching === '2' ? 'text-blue-600 font-extrabold' : 'text-slate-700'}`}>
                          Пружина (4 — 524 стр)
                        </span>
                      </button>

                      {/* Card 3: Клей */}
                      <button
                        type="button"
                        onClick={() => setMultiStitching('3')}
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border text-center ${
                          multiStitching === '3'
                            ? 'border-2 border-blue-600 bg-blue-50/40 shadow-sm'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="w-24 h-24 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2 relative">
                          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 12L22 8H48V58H22L14 62V12Z" fill="#F8FAFC" stroke="#007AFF" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M22 8V58" stroke="#007AFF" strokeWidth="2" />
                            <path d="M14 12L22 8" stroke="#007AFF" strokeWidth="2" />
                            <path d="M14 62L22 58" stroke="#007AFF" strokeWidth="2" />
                          </svg>
                        </div>
                        <span className={`text-xs font-bold ${multiStitching === '3' ? 'text-blue-600 font-extrabold' : 'text-slate-700'}`}>
                          Клей (30 — 608 стр)
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Section: Розмір & Вид готового виробу */}
                  <div className="ios-card bg-white p-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Left: Size Controls */}
                      <div className="md:col-span-6 flex flex-col gap-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          Розмір
                        </h4>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Оберіть стандартний:</label>
                          <select
                            value={multiSizePreset}
                            onChange={(e) => {
                              const v = e.target.value;
                              setMultiSizePreset(v);
                              const sizeMap: Record<string, [string, string]> = {
                                '212': ['99', '210'],
                                '206': ['105', '148'],
                                '208': ['148', '210'],
                                '211': ['210', '297'],
                                '227': ['52', '148'],
                                '226': ['74', '210'],
                                '210': ['105', '297'],
                                '228': ['148', '420'],
                                '214': ['105', '105'],
                                '215': ['148', '148'],
                                '216': ['210', '210'],
                              };
                              if (sizeMap[v]) {
                                setMultiCustomWidth(sizeMap[v][0]);
                                setMultiCustomHeight(sizeMap[v][1]);
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all shadow-sm"
                          >
                            <option value="212">Євро (198 × 210 в 99 × 210)</option>
                            <option value="206">А6 (210 × 148 в 105 × 148)</option>
                            <option value="208">А5 (297 × 210 в 148 × 210)</option>
                            <option value="211">А4 (420 × 297 в 210 × 297)</option>
                            <option value="227">1/2 A6 (104 × 148 в 52 × 148)</option>
                            <option value="226">1/2 A5 (148 × 210 в 74 × 210)</option>
                            <option value="210">1/2 A4 (210 × 297 в 105 × 297)</option>
                            <option value="228">1/2 A3 (296 × 420 в 148 × 420)</option>
                            <option value="214">А6 Квадрат (210 × 105 в 105 × 105)</option>
                            <option value="215">А5 Квадрат (297 × 148 в 148 × 148)</option>
                            <option value="216">А4 Квадрат (420 × 210 в 210 × 210)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Введіть свій:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={multiCustomWidth}
                              onChange={(e) => setMultiCustomWidth(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                              placeholder="Ширина"
                            />
                            <span className="text-slate-400 font-bold">×</span>
                            <input
                              type="number"
                              value={multiCustomHeight}
                              onChange={(e) => setMultiCustomHeight(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                              placeholder="Висота"
                            />
                            <select
                              value={sheetUnit}
                              onChange={(e) => setSheetUnit(e.target.value as any)}
                              className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-800"
                            >
                              <option value="mm">мм</option>
                              <option value="cm">см</option>
                            </select>
                          </div>
                        </div>

                        {/* Orientation Radios */}
                        <div className="flex items-center gap-6 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                            <input
                              type="radio"
                              name="multi_orient"
                              checked={multiOrientation === 'vert'}
                              onChange={() => setMultiOrientation('vert')}
                              className="text-blue-600 focus:ring-0"
                            />
                            <span>Вертикально</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                            <input
                              type="radio"
                              name="multi_orient"
                              checked={multiOrientation === 'horiz'}
                              onChange={() => setMultiOrientation('horiz')}
                              className="text-blue-600 focus:ring-0"
                            />
                            <span>Горизонтально</span>
                          </label>
                        </div>
                      </div>

                      {/* Right: Blueprint Visual Preview */}
                      <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200/80 min-h-[190px]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Вид готового виробу:</span>
                        <div className="relative flex flex-col items-center justify-center">
                          <div
                            style={{
                              width: `${Math.min(160, Math.max(65, Number(multiCustomWidth || 99) * 1.1))}px`,
                              height: `${Math.min(150, Math.max(80, Number(multiCustomHeight || 210) * 0.7))}px`,
                              backgroundColor: '#ffffff',
                              border: '2px solid var(--primary)',
                              borderRadius: '4px 8px 8px 4px',
                              boxShadow: '0 8px 24px rgba(0, 122, 255, 0.14)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            <span className="text-[11px] font-black text-blue-700">
                              {multiCustomWidth} × {multiCustomHeight} мм
                            </span>
                            {/* Height indicator */}
                            <span className="absolute -left-16 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                              {multiCustomHeight} мм
                            </span>
                            {/* Width indicator */}
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">
                              {multiCustomWidth} мм
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Опції (Comprehensive Options Rows) */}
                  <div className="ios-card bg-white p-5 flex flex-col gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Опції
                    </h4>

                    {/* Row 1: Скріплення */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2 border-b border-slate-100">
                      <div className="md:col-span-2 text-xs font-bold text-slate-800">Скріплення</div>
                      <div className="md:col-span-4">
                        <select
                          value={multiScobaCount}
                          onChange={(e) => setMultiScobaCount(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="2">2 скоби</option>
                          <option value="3">3 скоби</option>
                          <option value="4">4 скоби</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Обкладинка */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2 border-b border-slate-100">
                      <div className="md:col-span-2 text-xs font-bold text-slate-800">Обкладинка</div>
                      <div className="md:col-span-3">
                        <select
                          value={multiCoverPages}
                          onChange={(e) => setMultiCoverPages(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="0">Без обкладинки</option>
                          <option value="1">4 стор (1 аркуш)</option>
                          <option value="2">8 стор (2 аркуші)</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <select
                          value={multiCoverMaterial}
                          onChange={(e) => setMultiCoverMaterial(e.target.value)}
                          disabled={multiCoverPages === '0'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                        >
                          <option value="120">Крейд МАТ 80 г/м²</option>
                          <option value="21">Крейд МАТ 90 г/м²</option>
                          <option value="22">Крейд МАТ 115 г/м²</option>
                          <option value="23">Крейд МАТ 130 г/м²</option>
                          <option value="24">Крейд МАТ 150 г/м²</option>
                          <option value="25">Крейд МАТ 170 г/м²</option>
                          <option value="26">Крейд МАТ 200 г/м²</option>
                          <option value="27">Крейд МАТ 250 г/м²</option>
                          <option value="28">Крейд МАТ 300 г/м²</option>
                          <option value="32">Офсет 80 г/м²</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <select
                          value={multiCoverLam}
                          onChange={(e) => setMultiCoverLam(e.target.value)}
                          disabled={multiCoverPages === '0'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                        >
                          <option value="0">Без покриття</option>
                          <option value="7">ГЛ 1+0 25 мкм</option>
                          <option value="8">ГЛ 1+1 25 мкм</option>
                          <option value="9">МАТ 1+0 25 мкм</option>
                          <option value="10">МАТ 1+1 25 мкм</option>
                          <option value="30">SOFT лам 1+0</option>
                          <option value="31">SOFT лам 1+1</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <select
                          value={multiCoverColor}
                          onChange={(e) => setMultiCoverColor(e.target.value)}
                          disabled={multiCoverPages === '0'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                        >
                          <option value="1">4+0 (R9100)</option>
                          <option value="2">4+4 (R9100)</option>
                          <option value="3">1+0</option>
                          <option value="4">1+1</option>
                          <option value="0">Без друку</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Внутрішній блок */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2 border-b border-slate-100">
                      <div className="md:col-span-2 text-xs font-bold text-slate-800">Внутрішній блок</div>
                      <div className="md:col-span-3">
                        <select
                          value={multiBlockPages}
                          onChange={(e) => setMultiBlockPages(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="2">8 стор (2 аркуші)</option>
                          <option value="3">12 стор (3 аркуші)</option>
                          <option value="4">16 стор (4 аркуші)</option>
                          <option value="5">20 стор (5 аркушів)</option>
                          <option value="6">24 стор (6 аркушів)</option>
                          <option value="7">28 стор (7 аркушів)</option>
                          <option value="8">32 стор (8 аркушів)</option>
                          <option value="10">40 стор (10 аркушів)</option>
                          <option value="12">48 стор (12 аркушів)</option>
                          <option value="16">64 стор (16 аркушів)</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <select
                          value={multiBlockMaterial}
                          onChange={(e) => setMultiBlockMaterial(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="120">Крейд МАТ 80 г/м²</option>
                          <option value="21">Крейд МАТ 90 г/м²</option>
                          <option value="22">Крейд МАТ 115 г/м²</option>
                          <option value="23">Крейд МАТ 130 г/м²</option>
                          <option value="24">Крейд МАТ 150 г/м²</option>
                          <option value="25">Крейд МАТ 170 г/м²</option>
                          <option value="26">Крейд МАТ 200 г/м²</option>
                          <option value="27">Крейд МАТ 250 г/м²</option>
                          <option value="32">Офсет 80 г/м²</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <select
                          value={multiBlockLam}
                          onChange={(e) => setMultiBlockLam(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="0">Без покриття</option>
                          <option value="7">ГЛ 1+0 25 мкм</option>
                          <option value="8">ГЛ 1+1 25 мкм</option>
                          <option value="9">МАТ 1+0 25 мкм</option>
                          <option value="10">МАТ 1+1 25 мкм</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <select
                          value={multiBlockColor}
                          onChange={(e) => setMultiBlockColor(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="2">4+4 (R9100)</option>
                          <option value="4">1+1</option>
                          <option value="0">Без друку</option>
                          <option value="1">4+0</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Вставка */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2 border-b border-slate-100">
                      <div className="md:col-span-2 text-xs font-bold text-slate-800">Вставка</div>
                      <div className="md:col-span-3">
                        <select
                          value={multiInsertPages}
                          onChange={(e) => setMultiInsertPages(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="0">Без вставки</option>
                          <option value="1">4 стор (1 аркуш)</option>
                          <option value="2">8 стор (2 аркуші)</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <select
                          value={multiInsertMaterial}
                          onChange={(e) => setMultiInsertMaterial(e.target.value)}
                          disabled={multiInsertPages === '0'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                        >
                          <option value="120">Крейд МАТ 80 г/м²</option>
                          <option value="23">Крейд МАТ 130 г/м²</option>
                          <option value="27">Крейд МАТ 250 г/м²</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <select
                          value={multiInsertLam}
                          onChange={(e) => setMultiInsertLam(e.target.value)}
                          disabled={multiInsertPages === '0'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                        >
                          <option value="0">Без покриття</option>
                          <option value="7">ГЛ 1+0 25 мкм</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <select
                          value={multiInsertColor}
                          onChange={(e) => setMultiInsertColor(e.target.value)}
                          disabled={multiInsertPages === '0'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                        >
                          <option value="2">4+4 (R9100)</option>
                          <option value="1">4+0</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 5: Перфорація */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2 border-b border-slate-100">
                      <div className="md:col-span-2 text-xs font-bold text-slate-800">Перфорація</div>
                      <div className="md:col-span-3">
                        <select
                          value={multiPerforation}
                          onChange={(e) => setMultiPerforation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="0">Ні</option>
                          <option value="1">Так</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <select
                          disabled={multiPerforation === '0'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                        >
                          <option value="1">1 аркуш</option>
                          <option value="2">2 аркуші</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 6: Пакування в ПЕТ */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2">
                      <div className="md:col-span-2 text-xs font-bold text-slate-800">Пакування в ПЕТ</div>
                      <div className="md:col-span-3">
                        <select
                          value={multiPetPacking}
                          onChange={(e) => setMultiPetPacking(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        >
                          <option value="0">Ні</option>
                          <option value="5">По 5 шт</option>
                          <option value="10">По 10 шт</option>
                          <option value="25">По 25 шт</option>
                          <option value="50">По 50 шт</option>
                          <option value="1">Поштучно</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section: Таблиця та розрахунок тиражів */}
                  <div className="ios-card bg-white overflow-hidden shadow-md">
                    {/* Header Controls Bar */}
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Розрахунок вартості</span>
                        <div className="flex items-center gap-2 text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                            <input
                              type="checkbox"
                              checked={multiWithDelivery}
                              onChange={(e) => setMultiWithDelivery(e.target.checked)}
                              className="rounded text-blue-500 focus:ring-0"
                            />
                            <span>З доставкою</span>
                          </label>
                          <span className="text-slate-600">|</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                            <input
                              type="checkbox"
                              checked={multiPerPiece}
                              onChange={(e) => setMultiPerPiece(e.target.checked)}
                              className="rounded text-blue-500 focus:ring-0"
                            />
                            <span>За екземпляр</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => alert('Експорт прайс-листа в Excel')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-all"
                          title="Експорт в Excel"
                        >
                          <FileSpreadsheet size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Table Matrix */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-200 text-xs font-semibold uppercase">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Розмір та конфігурація</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Готовність</th>
                            {[1, 25, 50, 75, 100, 200, 500].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-extrabold text-blue-300">
                                {tir} шт.
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { dayLabel: '1д (Терміново)', readyText: 'на завтра', coef: 1.25, color: 'text-amber-700' },
                            { dayLabel: '2д (Стандарт)', readyText: 'через 2 дні', coef: 1.05, color: 'text-blue-700' },
                            { dayLabel: '3д (Економ)', readyText: 'через 3 дні', coef: 1.0, color: 'text-emerald-700' },
                            { dayLabel: '4д (Оптимально)', readyText: 'через 4 дні', coef: 0.95, color: 'text-slate-600' },
                          ].map((tierRow, idx) => {
                            const pagesCount = Number(multiBlockPages || 2) * 4;
                            const sizeText = `Євро (${multiCustomWidth} × ${multiCustomHeight} мм)`;

                            return (
                              <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                <td className="py-3 px-4 text-left font-bold text-slate-800 border-r border-slate-100">
                                  <div>{sizeText}</div>
                                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                    {pagesCount} сторінок ({multiBlockPages} арк.) | {multiStitching === '1' ? 'Скоба' : multiStitching === '2' ? 'Пружина' : 'Клей'}
                                  </div>
                                </td>
                                <td className="py-3 px-3 border-r border-slate-100">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 ${tierRow.color}`}>
                                    {tierRow.dayLabel}
                                  </span>
                                </td>
                                {[1, 25, 50, 75, 100, 200, 500].map(tir => {
                                  const basePerBook = (pagesCount * 0.95 + 12) * tierRow.coef;
                                  const deliveryFee = multiWithDelivery ? 90 : 0;
                                  const totalCost = Math.round(tir * basePerBook + deliveryFee + 80);
                                  const displayCost = multiPerPiece ? (totalCost / tir).toFixed(2) : totalCost;

                                  return (
                                    <td
                                      key={tir}
                                      onClick={() => {
                                        setQuantity(tir);
                                        setCategory('Буклети');
                                        setStep('editor');
                                      }}
                                      className="py-3 px-3 border-r border-slate-100 last:border-r-0 font-extrabold text-slate-900 hover:bg-blue-600 hover:text-white cursor-pointer transition-all text-sm"
                                      title="Натисніть для замовлення"
                                    >
                                      {displayCost} ₴
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. DIGITAL CUSTOM (ІНДИВІДУАЛЬНИЙ РОЗРАХУНОК) */}
              {digitalSubTab === 'custom' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  <div className="ios-card bg-white p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div style={{ width: '56px', height: '56px', borderRadius: '18px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Settings size={28} />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 m-0">Конструктор індивідуального розрахунку</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xl m-0">Сформуйте точну комерційну пропозицію з вибором будь-якого матеріалу, формату та повного ланцюжка післядрукарських операцій.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('editor')}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                    >
                      Відкрити детальний конструктор <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* 5. MOUNTED (КАШИРОВАНА ПРОДУКЦІЯ) */}
              {digitalSubTab === 'mounted' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Layers size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Каширована продукція (Sandwich / Multiloft)</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Преміум товсті візитки та картки від 600 до 1400 г/м² з кольоровою серцевиною</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="ios-card bg-white p-5 flex flex-col gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Кількість шарів (товщина)</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: '2', label: '2 шари', desc: '~650 г/м² (0.8 мм)' },
                          { id: '3', label: '3 шари', desc: '~950 г/м² (1.3 мм)' },
                          { id: '4', label: '4 шари', desc: '~1400 г/м² (1.8 мм)' },
                        ].map(l => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => setDigitalMountedLayers(l.id as any)}
                            className={`p-3 rounded-xl text-center transition-all ${
                              digitalMountedLayers === l.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <div className="text-sm font-bold">{l.label}</div>
                            <div className="text-[10px] opacity-80 mt-0.5">{l.desc}</div>
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <label className="text-xs font-semibold text-slate-700 block mb-2">Колір серцевини (вставки):</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'black', name: 'Чорна', color: '#1e293b' },
                            { id: 'white', name: 'Біла', color: '#ffffff' },
                            { id: 'red', name: 'Червона', color: '#ef4444' },
                            { id: 'blue', name: 'Синя', color: '#3b82f6' },
                            { id: 'kraft', name: 'Крафт', color: '#b45309' },
                            { id: 'yellow', name: 'Жовта', color: '#eab308' },
                          ].map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setDigitalMountedCore(c.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                digitalMountedCore === c.id
                                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: c.color }} />
                              <span>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ios-card bg-white p-5 flex flex-col justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Зріз та преміум опції</h4>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 m-0">
                          <li>Екстра-жорсткий торець виробу.</li>
                          <li>Можливість фарбування торців фольгою або кольоровим пантоном.</li>
                          <li>Вибірковий 3D УФ-лак та тиснення золотом/сріблом.</li>
                        </ul>
                      </div>
                      <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900">Термін виготовлення:</span>
                        <span className="text-xs font-extrabold text-blue-700">3-4 робочих дні</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="ios-card bg-white overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">Вартість кашированих візиток (90×50 мм)</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-200 text-xs font-semibold uppercase">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Конфігурація</th>
                            {[50, 100, 200, 500, 1000].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-bold">{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { name: '2 шари (650 г/м²) 4+4', rate: 7.5 },
                            { name: '3 шари з чорною вставкою (950 г/м²) 4+4', rate: 12.0 },
                            { name: '3 шари з кольоровою вставкою (950 г/м²) 4+4', rate: 13.5 },
                            { name: '4 шари люкс (1400 г/м²) 4+4', rate: 18.0 },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                              <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100">{row.name}</td>
                              {[50, 100, 200, 500, 1000].map(tir => (
                                <td
                                  key={tir}
                                  onClick={() => { setQuantity(tir); setCategory('Візитки'); setStep('editor'); }}
                                  className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all"
                                >
                                  {Math.round(tir * row.rate + 250)} ₴
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. IN SHEETS (ДРУК В ЛИСТАХ) */}
              {digitalSubTab === 'in_sheets' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Printer size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Друк в листах без порізки</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Відвантаження в цільних листах для РА та друкарень (SRA3, SRA3+, Banner 700мм)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'sra3', title: 'SRA3 (320 × 450 мм)', field: 'Поле друку: 310 × 440 мм', desc: 'Стандартний формат цифрового аркуша' },
                      { id: 'sra3_plus', title: 'SRA3+ (330 × 487 мм)', field: 'Поле друку: 320 × 477 мм', desc: 'Розширений формат для великих спусків' },
                      { id: 'banner', title: 'Banner (320 × 700 мм)', field: 'Поле друку: 310 × 686 мм', desc: 'Довгий лист для обкладинок з клапанами та 3-фальцевих меню' },
                    ].map(fmt => (
                      <div
                        key={fmt.id}
                        onClick={() => setDigitalInSheetsFormat(fmt.id as any)}
                        className={`ios-card p-5 cursor-pointer transition-all flex flex-col justify-between ${
                          digitalInSheetsFormat === fmt.id
                            ? 'border-2 border-blue-600 bg-blue-50/20 shadow-md'
                            : 'bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-slate-900 m-0">{fmt.title}</h4>
                            {digitalInSheetsFormat === fmt.id && <span className="ios-badge-blue text-[10px] px-2 py-0.5 rounded">Обрано</span>}
                          </div>
                          <p className="text-xs font-semibold text-blue-600 mb-1">{fmt.field}</p>
                          <p className="text-xs text-slate-500 m-0">{fmt.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Matrix */}
                  <div className="ios-card bg-white overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">Вартість за 1 друкований аркуш</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-200 text-xs font-semibold uppercase">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Папір / Колірність</th>
                            {[10, 50, 100, 250, 500, 1000].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-bold">{tir} листів</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { name: 'Крейдований 130-150г (4+0)', p1: 18, p2: 12, p3: 9.5, p4: 7.8, p5: 6.9, p6: 6.2 },
                            { name: 'Крейдований 300-350г (4+0)', p1: 22, p2: 15, p3: 12.0, p4: 10.2, p5: 9.1, p6: 8.4 },
                            { name: 'Крейдований 300-350г (4+4)', p1: 34, p2: 24, p3: 19.5, p4: 16.8, p5: 15.2, p6: 14.0 },
                            { name: 'Самоклейка Raflatac (4+0)', p1: 25, p2: 18, p3: 14.5, p4: 12.8, p5: 11.5, p6: 10.8 },
                            { name: 'Друк білим тонером WHITE (1+0)', p1: 38, p2: 28, p3: 23.0, p4: 19.5, p5: 17.8, p6: 16.5 },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                              <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100">{row.name}</td>
                              {[row.p1, row.p2, row.p3, row.p4, row.p5, row.p6].map((rate, tIdx) => (
                                <td
                                  key={tIdx}
                                  onClick={() => { setQuantity([10, 50, 100, 250, 500, 1000][tIdx]); setCategory('Листівки'); setStep('editor'); }}
                                  className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all"
                                >
                                  {rate} ₴/лист
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. POUCH LAMINATION (КОНВЕРТНА ЛАМІНАЦІЯ) */}
              {digitalSubTab === 'pouch_lam' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Конвертна (пакетна) ламінація</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Жорстка герметична запайка для ресторанних меню, бейджів, посвідчень (125, 175, 250 мкм)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="ios-card bg-white p-5 flex flex-col gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Товщина ламінаційного пакета</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: '125', label: '125 мкм', desc: 'Гнучкий надійний захист' },
                          { id: '175', label: '175 мкм', desc: 'Напівжорсткий для меню' },
                          { id: '250', label: '250 мкм', desc: 'Максимальна пластикова жорсткість' },
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setDigitalPouchThickness(t.id as any)}
                            className={`p-3 rounded-xl text-center transition-all ${
                              digitalPouchThickness === t.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <div className="text-sm font-bold">{t.label}</div>
                            <div className="text-[10px] opacity-80 mt-0.5">{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ios-card bg-white p-5 flex flex-col justify-between gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Формати конвертів</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'a3', label: 'А3 (303 × 426 мм)' },
                          { id: 'a4', label: 'А4 (216 × 303 мм)' },
                          { id: 'a5', label: 'А5 (154 × 216 мм)' },
                          { id: 'a6', label: 'А6 (111 × 154 мм)' },
                          { id: 'badge', label: 'Бейдж (90 × 60 мм)' },
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setDigitalPouchFormat(f.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              digitalPouchFormat === f.id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="ios-card bg-white overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">Прайс конвертної ламінації (разом з кольоровим друком)</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-200 text-xs font-semibold uppercase">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Формат</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Товщина</th>
                            {[10, 25, 50, 100, 250, 500].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-bold">{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { fmt: 'А3 (303 × 426 мм)', th: '125 мкм', r: 35 },
                            { fmt: 'А3 (303 × 426 мм)', th: '250 мкм', r: 55 },
                            { fmt: 'А4 (216 × 303 мм)', th: '125 мкм', r: 18 },
                            { fmt: 'А4 (216 × 303 мм)', th: '250 мкм', r: 28 },
                            { fmt: 'А5 (154 × 216 мм)', th: '125 мкм', r: 11 },
                            { fmt: 'Бейдж (90 × 60 мм)', th: '250 мкм', r: 7.5 },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                              <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100">{row.fmt}</td>
                              <td className="py-2.5 px-3 font-bold text-blue-600 border-r border-slate-100">{row.th}</td>
                              {[10, 25, 50, 100, 250, 500].map(tir => (
                                <td
                                  key={tir}
                                  onClick={() => { setQuantity(tir); setCategory('Меню'); setStep('editor'); }}
                                  className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all"
                                >
                                  {Math.round(tir * row.r + 50)} ₴
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. PLOTTER CUTTING (ПЛОТЕРНА ПОРІЗКА) */}
              {digitalSubTab === 'plotter_cut' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Crop size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Плотерна порізка самоклейки та стікерів</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Контурна надсічка стікерпаків та наскрізна порізка наклейок будь-якої форми</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="ios-card bg-white p-5 flex flex-col gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Матеріал самоклейки</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'raflatac_paper', label: 'Папір Raflatac', desc: 'Напівглянець' },
                          { id: 'pp_white', label: 'Плівка біла PP', desc: 'Вологостійка' },
                          { id: 'pp_transp', label: 'Плівка прозора PP', desc: 'Прозора основа' },
                          { id: 'oracal', label: 'Кольоровий Oracal', desc: 'Вінілова аплікація' },
                        ].map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setDigitalPlotterMaterial(m.id)}
                            className={`p-3 rounded-xl text-left transition-all ${
                              digitalPlotterMaterial === m.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <div className="text-xs font-bold">{m.label}</div>
                            <div className="text-[10px] opacity-80">{m.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ios-card bg-white p-5 flex flex-col gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Тип порізки</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'kiss_cut', label: 'До підкладки (Kiss-cut)', desc: 'Стікерпаки на аркушах SRA3' },
                          { id: 'through_cut', label: 'Наскрізна (Die-cut)', desc: 'Окремі поштучні наклейки' },
                        ].map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setDigitalPlotterCutType(c.id as any)}
                            className={`p-3 rounded-xl text-left transition-all ${
                              digitalPlotterCutType === c.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <div className="text-xs font-bold">{c.label}</div>
                            <div className="text-[10px] opacity-80">{c.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="ios-card bg-white overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">Прайс плотерної порізки стікерпаків SRA3 (320 × 450 мм)</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-200 text-xs font-semibold uppercase">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Матеріал</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Порізка</th>
                            {[10, 25, 50, 100, 250, 500].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-bold">{tir} арк.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { mat: 'Паперова самоклейка Raflatac', cut: 'Kiss-cut', r: 28 },
                            { mat: 'Плівка біла поліпропілен PP', cut: 'Kiss-cut', r: 38 },
                            { mat: 'Плівка прозора PP', cut: 'Kiss-cut', r: 42 },
                            { mat: 'Поштучна порізка Die-cut (наскрізь)', cut: 'Through-cut', r: 48 },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                              <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100">{row.mat}</td>
                              <td className="py-2.5 px-3 font-bold text-blue-600 border-r border-slate-100">{row.cut}</td>
                              {[10, 25, 50, 100, 250, 500].map(tir => (
                                <td
                                  key={tir}
                                  onClick={() => { setQuantity(tir); setCategory('Наклейки'); setStep('editor'); }}
                                  className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all"
                                >
                                  {Math.round(tir * row.r + 90)} ₴
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. CNC DIE-CUT CUSTOM (ФІГУРНА ПОРІЗКА) */}
              {digitalSubTab === 'die_cut_custom' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Sparkles size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Фігурна планшетна порізка (CNC Flatbed)</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Виготовлення упаковки, коробок, папок, бирок без виготовлення дорогого штампу від 1 екземпляра</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'package', title: 'Упаковка / Коробка', desc: 'Порізка + біговка картону' },
                      { id: 'folder', title: 'Фігурна папка', desc: 'Індивідуальний клапан' },
                      { id: 'wobbler', title: 'Воблер / Шелфтокер', desc: 'Рекламні стопери та бірки' },
                      { id: 'custom_shape', title: 'Довільна форма', desc: 'Зірка, круг, шестірня…' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setDigitalCncType(p.id as any)}
                        className={`p-4 rounded-xl text-center transition-all ${
                          digitalCncType === p.id
                            ? 'border-2 border-blue-600 bg-blue-50/30 shadow-md text-blue-900 font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-extrabold">{p.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{p.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Pricing Matrix */}
                  <div className="ios-card bg-white overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">Прайс цифрової планшетної порізки виробів</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-200 text-xs font-semibold uppercase">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Виріб / Матеріал</th>
                            {[1, 5, 10, 25, 50, 100].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-bold">{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { name: 'Коробка картонна 300г з біговкою', r: 35 },
                            { name: 'Фігурний воблер / шелфтокер', r: 18 },
                            { name: 'Кругла підставка / костер (картон 350г)', r: 12 },
                            { name: 'Складна фігурна листівка', r: 22 },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                              <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100">{row.name}</td>
                              {[1, 5, 10, 25, 50, 100].map(tir => (
                                <td
                                  key={tir}
                                  onClick={() => { setQuantity(tir); setCategory('Наклейки'); setStep('editor'); }}
                                  className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all"
                                >
                                  {Math.round(tir * row.r + 120)} ₴
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. FOLDERS WITH POCKET (ПАПКИ З ВКЛЕЄНОЮ КИШЕНЕЮ) */}
              {digitalSubTab === 'folders' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(0, 122, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <FolderOpen size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Папки цифрові з вклеєною кишенею</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Малі тиражі фірмових папок А4 від 1 шт. зі слотами під візитку</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="ios-card bg-white p-5 flex flex-col gap-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Корінець папки</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: '0', label: '0 мм', desc: 'до 10 листів' },
                          { id: '5', label: '5 мм', desc: 'до 40 листів' },
                          { id: '7', label: '7 мм', desc: 'до 70 листів' },
                        ].map(sp => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => setFolderSpine(sp.id as any)}
                            className={`p-2.5 rounded-lg text-center transition-all ${
                              folderSpine === sp.id
                                ? 'bg-blue-600 text-white font-bold shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <div className="text-xs">{sp.label}</div>
                            <div className="text-[9px] opacity-80">{sp.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ios-card bg-white p-5 flex flex-col gap-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Захисна ламінація</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'none', label: 'Без ламінації' },
                          { id: 'matte', label: 'Матова' },
                          { id: 'soft_touch', label: 'Soft Touch' },
                        ].map(lam => (
                          <button
                            key={lam.id}
                            type="button"
                            className={`p-2.5 rounded-lg text-center text-xs font-bold transition-all ${
                              lam.id === 'matte'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {lam.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ios-card bg-white p-5 flex flex-col justify-between gap-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Кишеня папки</h4>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={folderVizSlot}
                          onChange={(e) => setFolderVizSlot(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Слот (прорізи) під візитку 90×50 мм</span>
                      </label>
                      <span className="text-[11px] text-slate-500">Вклеєна біла або друкована кишеня з цупкого картону</span>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="ios-card bg-white overflow-hidden">
                    <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">Прайс цифрових папок А4 з вклеєною кишенею</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-200 text-xs font-semibold uppercase">
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Друк та оздоблення</th>
                            {[5, 10, 25, 50, 100, 250].map(tir => (
                              <th key={tir} className="py-3 px-3 border-r border-slate-700/50 last:border-r-0 font-bold">{tir} шт.</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { name: '4+0 (друк ззовні) + Матова ламінація', r: 52 },
                            { name: '4+0 (друк ззовні) + Soft Touch ламінація', r: 68 },
                            { name: '4+4 (друк ззовні та всередині) + Матова лам', r: 78 },
                            { name: 'Крафт картон 300г + Друк білим WHITE', r: 85 },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                              <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100">{row.name}</td>
                              {[5, 10, 25, 50, 100, 250].map(tir => (
                                <td
                                  key={tir}
                                  onClick={() => { setQuantity(tir); setCategory('Папки'); setStep('editor'); }}
                                  className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all"
                                >
                                  {Math.round(tir * row.r + 160)} ₴
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* DIGITAL NOTEBOOKS CALCULATOR */}
              {digitalSubTab === 'notebooks' && renderNotebooksCalculator('digital')}
            </div>
          )}

          {/* TAB 4: WIDE FORMAT (ШИРОКОФОРМАТНИЙ ДРУК) */}
          {mainCategoryTab === 'wide' && (
            <div className="flex flex-col gap-6 md:gap-7">
              {/* OVERVIEW: 4 HERO CARDS + 6 SPECIALIZED CATEGORIES IN EXACT MATCHING STYLE */}
              {wideSubTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* 4 Universal Hero Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {[
                      {
                        title: 'Банер',
                        badge: 'Frontlit / Блокаут',
                        desc: 'Банерні вивіски, розтяжки, тенти, брандмауери, вітростійка сітка Mesh.',
                        icon: <Layout size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Люверси / Проклейка',
                        onClick: () => setWideSubTab('banner')
                      },
                      {
                        title: 'Плівка',
                        badge: 'Самоклейка',
                        desc: 'Наліпки, плівка для обклеювання вітрин, вивісок, авто, підлогова графіка.',
                        icon: <Tag size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Ламінація / Порізка',
                        onClick: () => setWideSubTab('film')
                      },
                      {
                        title: 'Папір',
                        badge: 'Великий формат',
                        desc: 'Афіші, плакати, постери, сітілайти, бігборди, преміум фотопапір.',
                        icon: <Image size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Афіші / Сітілайти',
                        onClick: () => setWideSubTab('paper')
                      },
                      {
                        title: 'Індивідуальне замовлення',
                        badge: 'Нестандартні',
                        desc: 'Замовити прорахунок комплексного або нестандартного замовлення.',
                        icon: <Settings size={28} style={{ color: 'var(--primary)' }} />,
                        metric: 'Конструктор розрахунку',
                        onClick: () => setWideSubTab('custom')
                      }
                    ].map(item => (
                      <div
                        key={item.title}
                        onClick={item.onClick}
                        className="ios-card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '22px 24px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          minHeight: '195px',
                          position: 'relative',
                          background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
                          border: '1.5px solid rgba(0, 122, 255, 0.22)',
                          boxShadow: '0 4px 18px rgba(0, 122, 255, 0.05)'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = 'translateY(-3px)'; 
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.12)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = 'translateY(0)'; 
                          e.currentTarget.style.borderColor = 'rgba(0, 122, 255, 0.22)';
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 122, 255, 0.05)';
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '16px',
                              backgroundColor: 'rgba(0, 122, 255, 0.1)',
                              border: '1px solid rgba(0, 122, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0, 122, 255, 0.08)'
                            }}>
                              {item.icon}
                            </div>
                            <span className="ios-badge ios-badge-blue" style={{ fontSize: '11px', padding: '3px 8px' }}>
                              {item.badge}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.45' }}>
                            {item.desc}
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '0.5px solid rgba(0, 122, 255, 0.15)',
                          paddingTop: '12px',
                          marginTop: '16px'
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)' }}>
                            {item.metric}
                          </span>
                          <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '800', gap: '2px' }}>
                            Відкрити <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px 0 4px', borderTop: '0.5px solid var(--border-light)', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-medium)' }} />
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                        Каталог готової продукції
                      </h4>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: '600' }}>
                      6 окремих категорій
                    </span>
                  </div>

                  {/* 6 Specialized Rigid & Display Media Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {[
                      {
                        id: 'pvc',
                        title: 'ПВХ (Пластик)',
                        desc: 'Таблички, вказівники, вивіски, букви, планшети, ростові фігури...',
                        icon: <Layers size={30} style={{ color: 'var(--primary)' }} />,
                        color: 'rgba(0, 122, 255, 0.1)',
                        badgeClass: 'ios-badge-blue',
                        badge: 'Пластик 3–10 мм',
                        metric: 'УФ-друк / Фрезер',
                        onClick: () => setWideSubTab('pvc'),
                        formats: [
                          { name: '3 мм', onClick: () => { setWideSubTab('pvc'); setWideSelectedMaterials(['pvc_3mm']); } },
                          { name: '4 мм', onClick: () => { setWideSubTab('pvc'); setWideSelectedMaterials(['pvc_4mm']); } },
                          { name: '5 мм', onClick: () => { setWideSubTab('pvc'); setWideSelectedMaterials(['pvc_5mm']); } },
                          { name: '10 мм', onClick: () => { setWideSubTab('pvc'); setWideSelectedMaterials(['pvc_10mm']); } },
                          { name: 'УФ друк', onClick: () => { setWideSubTab('pvc'); } },
                        ]
                      },
                      {
                        id: 'foam_board',
                        title: 'Пінокартон',
                        desc: 'Таблички, вказівники, вивіски, букви, планшети, ростові фігури...',
                        icon: <FileText size={30} style={{ color: '#34c759' }} />,
                        color: 'rgba(52, 199, 89, 0.1)',
                        badgeClass: 'ios-badge-green',
                        badge: 'Легкий 5–10 мм',
                        metric: 'Інтер\'єрні стенди',
                        onClick: () => setWideSubTab('foam_board'),
                        formats: [
                          { name: 'Білий 5 мм', onClick: () => { setWideSubTab('foam_board'); setWideSelectedMaterials(['foam_5mm']); } },
                          { name: 'Білий 10 мм', onClick: () => { setWideSubTab('foam_board'); setWideSelectedMaterials(['foam_10mm']); } },
                          { name: 'Чорний 5 мм', onClick: () => { setWideSubTab('foam_board'); setWideSelectedMaterials(['foam_black_5mm']); } },
                        ]
                      },
                      {
                        id: 'composite',
                        title: 'Композит',
                        desc: 'Таблички, вказівники, вивіски, букви, планшети, ростові фігури...',
                        icon: <ShieldCheck size={30} style={{ color: 'var(--primary)' }} />,
                        color: 'rgba(0, 122, 255, 0.1)',
                        badgeClass: 'ios-badge-blue',
                        badge: 'Алюміній 3 мм',
                        metric: 'Фасадні панелі',
                        onClick: () => setWideSubTab('composite'),
                        formats: [
                          { name: 'Білий 3мм', onClick: () => { setWideSubTab('composite'); setWideSelectedMaterials(['comp_white_3mm']); } },
                          { name: 'Срібло браш', onClick: () => { setWideSubTab('composite'); setWideSelectedMaterials(['comp_silver_3mm']); } },
                          { name: 'Чорний', onClick: () => { setWideSubTab('composite'); setWideSelectedMaterials(['comp_black_3mm']); } },
                          { name: 'Золото браш', onClick: () => { setWideSubTab('composite'); setWideSelectedMaterials(['comp_gold_3mm']); } },
                        ]
                      },
                      {
                        id: 'acrylic',
                        title: 'Акрил',
                        desc: 'Номерки, бірки, фотографії, годинники, таблички, фігурні вироби...',
                        icon: <Sparkles size={30} style={{ color: '#ff2d55' }} />,
                        color: 'rgba(255, 45, 85, 0.1)',
                        badgeClass: 'ios-badge-pink',
                        badge: 'Оргскло',
                        metric: 'Лазерна різка',
                        onClick: () => setWideSubTab('acrylic'),
                        formats: [
                          { name: 'Прозорий 3мм', onClick: () => { setWideSubTab('acrylic'); setWideSelectedMaterials(['acryl_clear_3mm']); } },
                          { name: 'Прозорий 5мм', onClick: () => { setWideSubTab('acrylic'); setWideSelectedMaterials(['acryl_clear_5mm']); } },
                          { name: 'Молочний 3мм', onClick: () => { setWideSubTab('acrylic'); setWideSelectedMaterials(['acryl_milky_3mm']); } },
                          { name: 'Чорний', onClick: () => { setWideSubTab('acrylic'); setWideSelectedMaterials(['acryl_black_3mm']); } },
                        ]
                      },
                      {
                        id: 'canvas',
                        title: 'Полотна',
                        desc: 'Полотна, картини, модулі, фотокартини з галерейною натяжкою...',
                        icon: <Image size={30} style={{ color: '#af52de' }} />,
                        color: 'rgba(175, 82, 222, 0.1)',
                        badgeClass: 'ios-badge-purple',
                        badge: 'Canvas',
                        metric: 'Підрамник / Картини',
                        onClick: () => setWideSubTab('canvas'),
                        formats: [
                          { name: 'Бавовняне 380г', onClick: () => { setWideSubTab('canvas'); setWideSelectedMaterials(['canvas_cotton_380']); } },
                          { name: 'Синтетичне 280г', onClick: () => { setWideSubTab('canvas'); setWideSelectedMaterials(['canvas_synthetic_280']); } },
                          { name: '40×60', onClick: () => { setWideSubTab('canvas'); setWideWidth('400'); setWideHeight('600'); } },
                          { name: '50×70', onClick: () => { setWideSubTab('canvas'); setWideWidth('500'); setWideHeight('700'); } },
                          { name: '60×90', onClick: () => { setWideSubTab('canvas'); setWideWidth('600'); setWideHeight('900'); } },
                        ]
                      },
                      {
                        id: 'stands',
                        title: 'Мобільні стенди',
                        desc: 'X-banner, L-banner, Roll-up, Press-wall з конструкцією та чохлом...',
                        icon: <FolderOpen size={30} style={{ color: '#ff9500' }} />,
                        color: 'rgba(255, 149, 0, 0.1)',
                        badgeClass: 'ios-badge-orange',
                        badge: 'Конструкції',
                        metric: 'Стенд + полотно',
                        onClick: () => setWideSubTab('stands'),
                        formats: [
                          { name: 'Roll-Up 80×200', onClick: () => { setWideSubTab('stands'); setWideWidth('800'); setWideHeight('2000'); } },
                          { name: 'Roll-Up 100×200', onClick: () => { setWideSubTab('stands'); setWideWidth('1000'); setWideHeight('2000'); } },
                          { name: 'Roll-Up 120×200', onClick: () => { setWideSubTab('stands'); setWideWidth('1200'); setWideHeight('2000'); } },
                          { name: 'Павук 60×160', onClick: () => { setWideSubTab('stands'); setWideWidth('600'); setWideHeight('1600'); } },
                          { name: 'Прес-вол 3×2', onClick: () => { setWideSubTab('stands'); setWideWidth('3000'); setWideHeight('2000'); } },
                        ]
                      },
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={item.onClick}
                        className="ios-card bg-white"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '24px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          minHeight: '200px',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '16px',
                              backgroundColor: item.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {item.icon}
                            </div>
                            <span className={`ios-badge ${item.badgeClass}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                              {item.badge}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.4' }}>
                            {item.desc}
                          </p>

                          {/* Format Chips */}
                          {item.formats && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                              {item.formats.map(fmt => (
                                <button
                                  key={fmt.name}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fmt.onClick();
                                  }}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-system)',
                                    border: '0.5px solid var(--border-light)',
                                    color: 'var(--text-dark)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                                    e.currentTarget.style.color = '#ffffff';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-system)';
                                    e.currentTarget.style.color = 'var(--text-dark)';
                                    e.currentTarget.style.borderColor = 'var(--border-light)';
                                  }}
                                >
                                  {fmt.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '0.5px solid var(--border-light)',
                          paddingTop: '12px',
                          marginTop: '16px'
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-medium)' }}>
                            {item.metric}
                          </span>
                          <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '700' }}>
                            Розрахувати <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPECIFIC CALCULATOR VIEW (FOR ALL 10 WIDE FORMAT SUB-TABS) */}
              {wideSubTab !== 'overview' && (
                <div className="flex flex-col gap-6 md:gap-7">
                  {/* Clean Sub-header Bar matching standard */}
                  <div className="ios-card bg-white" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setWideSubTab('overview')}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <ArrowLeft size={14} />
                        <span>Назад</span>
                      </button>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <span>Широкоформатний друк</span>
                          <span>/</span>
                          <span className="text-blue-600">
                            {wideSubTab === 'banner' && 'Банери'}
                            {wideSubTab === 'film' && 'Плівка'}
                            {wideSubTab === 'paper' && 'Папір'}
                            {wideSubTab === 'custom' && 'Індивідуальне замовлення'}
                            {wideSubTab === 'pvc' && 'ПВХ (Пластик)'}
                            {wideSubTab === 'foam_board' && 'Пінокартон'}
                            {wideSubTab === 'composite' && 'Алюмінієвий композит'}
                            {wideSubTab === 'acrylic' && 'Акрил (Оргскло)'}
                            {wideSubTab === 'canvas' && 'Полотна (Canvas)'}
                            {wideSubTab === 'stands' && 'Мобільні стенди'}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-800">
                          {wideSubTab === 'banner' && 'Банери (Frontlit, Cast, Сітка)'}
                          {wideSubTab === 'film' && 'Плівка самоклеюча (ORACAL, Ritrama)'}
                          {wideSubTab === 'paper' && 'Папір (Citylight, Blueback)'}
                          {wideSubTab === 'custom' && 'Індивідуальний прорахунок'}
                          {wideSubTab === 'pvc' && 'Пластик ПВХ'}
                          {wideSubTab === 'foam_board' && 'Пінокартон'}
                          {wideSubTab === 'composite' && 'Алюмінієвий композит'}
                          {wideSubTab === 'acrylic' && 'Акрил (Оргскло)'}
                          {wideSubTab === 'canvas' && 'Картини на полотні'}
                          {wideSubTab === 'stands' && 'Мобільні стенди (Roll-Up, X-banner)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('detailed-wide-calculation');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Settings size={14} />
                        <span>Кошторис</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWideSubTab('overview')}
                        className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs font-bold transition-all"
                        title="Закрити сторінку"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Row 1 (50% / 50%): Left = РОЗМІР, Right = ВІЗУАЛІЗАЦІЯ & ПРОПОРЦІЯ */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 items-stretch">
                    {/* Left: РОЗМІР */}
                    <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">РОЗМІР:</span>
                          <span className="text-[11px] font-bold text-slate-400">Стандарт або індивідуал</span>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Оберіть стандартний розмір:</label>
                          <select
                            onChange={(e) => {
                              const [w, h] = e.target.value.split('x');
                              if (w && h) {
                                setWideWidth(w);
                                setWideHeight(h);
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all shadow-2xs"
                          >
                            {wideSubTab === 'banner' && (
                              <>
                                <option value="2000x1000">2000 × 1000 мм (2 × 1 м) — Банер розтяжка</option>
                                <option value="3000x1000">3000 × 1000 мм (3 × 1 м) — Банер фасадний</option>
                                <option value="3000x2000">3000 × 2000 мм (3 × 2 м) — Прес-вол</option>
                                <option value="4000x2000">4000 × 2000 мм (4 × 2 м) — Великий фасад</option>
                                <option value="6000x3000">6000 × 3000 мм (6 × 3 м) — Бігборд стандарт</option>
                              </>
                            )}
                            {wideSubTab === 'film' && (
                              <>
                                <option value="1000x1000">1000 × 1000 мм (1 × 1 м) — Плівка 1 м²</option>
                                <option value="1500x1000">1500 × 1000 мм (1.5 × 1 м) — Вітринна наліпка</option>
                                <option value="2000x1000">2000 × 1000 мм (2 × 1 м) — Брендування вітрини</option>
                                <option value="500x500">500 × 500 мм (0.5 × 0.5 м) — Табличка/наліпка</option>
                              </>
                            )}
                            {wideSubTab === 'paper' && (
                              <>
                                <option value="1200x1800">1200 × 1800 мм — Сітілайт (Citylight)</option>
                                <option value="6000x3000">6000 × 3000 мм — Бігборд (Blueback)</option>
                                <option value="841x1189">841 × 1189 мм — Формат А0</option>
                                <option value="594x841">594 × 841 мм — Формат А1</option>
                                <option value="420x594">420 × 594 мм — Формат А2</option>
                              </>
                            )}
                            {wideSubTab === 'canvas' && (
                              <>
                                <option value="400x600">400 × 600 мм — Картина середня</option>
                                <option value="500x700">500 × 700 мм — Картина стандарт</option>
                                <option value="600x900">600 × 900 мм — Картина велика</option>
                                <option value="800x1200">800 × 1200 мм — Галерейне полотно</option>
                              </>
                            )}
                            {wideSubTab === 'stands' && (
                              <>
                                <option value="800x2000">800 × 2000 мм — Roll-Up 80 × 200 см</option>
                                <option value="1000x2000">1000 × 2000 мм — Roll-Up 100 × 200 см</option>
                                <option value="1200x2000">1200 × 2000 мм — Roll-Up 120 × 200 см</option>
                                <option value="600x1600">600 × 1600 мм — X-Banner Павук 60 × 160 см</option>
                                <option value="800x1800">800 × 1800 мм — X-Banner Павук 80 × 180 см</option>
                              </>
                            )}
                            {(wideSubTab === 'pvc' || wideSubTab === 'foam_board' || wideSubTab === 'composite' || wideSubTab === 'acrylic' || wideSubTab === 'custom') && (
                              <>
                                <option value="500x300">500 × 300 мм — Фасадна табличка</option>
                                <option value="600x400">600 × 400 мм — Адресний покажчик</option>
                                <option value="1000x500">1000 × 500 мм — Інформаційне панно</option>
                                <option value="1000x1000">1000 × 1000 мм — Квадратний планшет</option>
                                <option value="2000x1000">2000 × 1000 мм — Стіновий планшет</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Введіть свій розмір:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={wideWidth}
                              onChange={(e) => setWideWidth(e.target.value)}
                              className="w-28 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 text-center focus:bg-white focus:border-blue-600 focus:outline-none"
                              placeholder="Ширина"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const tempW = wideWidth;
                                setWideWidth(wideHeight);
                                setWideHeight(tempW);
                              }}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                              title="Поміняти ширину та висоту місцями (⇄)"
                            >
                              <ArrowLeftRight size={14} />
                            </button>
                            <input
                              type="number"
                              value={wideHeight}
                              onChange={(e) => setWideHeight(e.target.value)}
                              className="w-28 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 text-center focus:bg-white focus:border-blue-600 focus:outline-none"
                              placeholder="Висота"
                            />
                            <select
                              value={wideUnit}
                              onChange={(e) => setWideUnit(e.target.value as any)}
                              className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600"
                            >
                              <option value="mm">мм</option>
                              <option value="cm">см</option>
                              <option value="m">м</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Calculated Area & Perimeter Metric */}
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Площа (1 шт):</span>
                          <span className="text-blue-700 font-extrabold text-xs">
                            {((Number(wideWidth || 0) * Number(wideHeight || 0)) / (wideUnit === 'mm' ? 1000000 : wideUnit === 'cm' ? 10000 : 1)).toFixed(2)} м²
                          </span>
                        </div>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Периметр:</span>
                          <span className="text-slate-800 font-extrabold text-xs">
                            {((2 * (Number(wideWidth || 0) + Number(wideHeight || 0))) / (wideUnit === 'mm' ? 1000 : wideUnit === 'cm' ? 100 : 1)).toFixed(2)} м.п.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: ВІЗУАЛІЗАЦІЯ & ПРОПОРЦІЯ */}
                    <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-between text-center h-full">
                      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                          ВІЗУАЛІЗАЦІЯ & ПРОПОРЦІЯ МАКЕТУ
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Масштаб виробу
                        </span>
                      </div>

                      <div className="flex-1 flex items-center justify-center my-3 w-full">
                        <div
                          style={{
                            width: `${Math.min(220, Math.max(90, (Number(wideWidth || 2000) / Math.max(1, Number(wideHeight || 1000))) * 100))}px`,
                            height: '95px',
                            backgroundColor: '#ffffff',
                            border: '2px solid var(--primary)',
                            borderRadius: '10px',
                            boxShadow: '0 8px 20px rgba(0, 122, 255, 0.12)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <span className="text-xs font-black text-blue-700 font-mono">
                            {wideWidth} × {wideHeight} {wideUnit}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 mt-1">
                            {((Number(wideWidth || 0) * Number(wideHeight || 0)) / (wideUnit === 'mm' ? 1000000 : wideUnit === 'cm' ? 10000 : 1)).toFixed(2)} м²
                          </span>
                        </div>
                      </div>

                      <div className="w-full text-[11px] text-slate-500 font-semibold bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200/60">
                        Габарит під монтаж: <strong className="text-slate-800">{wideWidth} × {wideHeight} {wideUnit}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Row 2 (50% / 50%): Left = МАТЕРІАЛИ ТА ЯКІСТЬ ДРУКУ, Right = ПІСЛЯДРУКАРСЬКА ОБРОБКА ТА ФУРНІТУРА */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 items-stretch">
                    {/* Left Column (50%): Фільтр матеріалів та параметрів */}
                    <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            МАТЕРІАЛИ ТА СПЕЦИФІКАЦІЯ:
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">Фільтр матриці</span>
                        </div>

                        {/* Material Pills */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600 uppercase">МАТЕРІАЛ:</label>
                          <div className="flex gap-1.5 flex-wrap items-center">
                            {(wideSubTab === 'banner'
                              ? [
                                  { id: 'frontlit_440', label: 'Frontlit 440 ламінований' },
                                  { id: 'frontlit_510', label: 'Frontlit 510 литий (міцний)' },
                                  { id: 'blockout_510', label: 'Blockout 510 двосторонній' },
                                  { id: 'mesh_banner', label: 'Банерна сітка Mesh' },
                                  { id: 'backlit_510', label: 'Backlit 510 для лайтбоксів' }
                                ]
                              : wideSubTab === 'film'
                              ? [
                                  { id: 'oracal_matte', label: 'ORAJET матова біла' },
                                  { id: 'oracal_gloss', label: 'ORAJET глянцева біла' },
                                  { id: 'oracal_clear', label: 'ORAJET прозора' },
                                  { id: 'ritrama_matte', label: 'Ritrama перманентна' },
                                  { id: 'one_way_vision', label: 'One Way Vision' },
                                  { id: 'translucent', label: 'Транслюцентна' },
                                  { id: 'car_cast', label: 'Автомобільна лита' }
                                ]
                              : wideSubTab === 'paper'
                              ? [
                                  { id: 'citylight_150', label: 'Citylight 150г' },
                                  { id: 'blueback_115', label: 'Blueback 115г (бігборди)' },
                                  { id: 'photo_satin_200', label: 'Фотопапір Satin 200г' },
                                  { id: 'photo_gloss_220', label: 'Фотопапір Gloss 220г' }
                                ]
                              : wideSubTab === 'pvc'
                              ? [
                                  { id: 'pvc_3mm', label: 'ПВХ 3 мм' },
                                  { id: 'pvc_4mm', label: 'ПВХ 4 мм' },
                                  { id: 'pvc_5mm', label: 'ПВХ 5 мм' },
                                  { id: 'pvc_8mm', label: 'ПВХ 8 мм' },
                                  { id: 'pvc_10mm', label: 'ПВХ 10 мм' }
                                ]
                              : wideSubTab === 'foam_board'
                              ? [
                                  { id: 'foam_5mm', label: 'Пінокартон 5 мм білий' },
                                  { id: 'foam_10mm', label: 'Пінокартон 10 мм білий' },
                                  { id: 'foam_black_5mm', label: 'Пінокартон 5 мм чорний' }
                                ]
                              : wideSubTab === 'composite'
                              ? [
                                  { id: 'comp_white_3mm', label: 'Композит білий 3 мм' },
                                  { id: 'comp_silver_3mm', label: 'Композит срібло 3 мм' },
                                  { id: 'comp_black_3mm', label: 'Композит чорний 3 мм' },
                                  { id: 'comp_gold_3mm', label: 'Композит золото 3 мм' }
                                ]
                              : wideSubTab === 'acrylic'
                              ? [
                                  { id: 'acryl_clear_3mm', label: 'Акрил прозорий 3 мм' },
                                  { id: 'acryl_clear_5mm', label: 'Акрил прозорий 5 мм' },
                                  { id: 'acryl_milky_3mm', label: 'Акрил молочний 3 мм' },
                                  { id: 'acryl_black_3mm', label: 'Акрил чорний 3 мм' }
                                ]
                              : wideSubTab === 'canvas'
                              ? [
                                  { id: 'canvas_cotton_380', label: 'Бавовняне 380г' },
                                  { id: 'canvas_synthetic_280', label: 'Синтетичне 280г' },
                                  { id: 'canvas_gloss_350', label: 'Глянцеве 350г' }
                                ]
                              : wideSubTab === 'stands'
                              ? [
                                  { id: 'stand_banner_440', label: 'Стенд + Frontlit 440г' },
                                  { id: 'stand_banner_510', label: 'Стенд + Blockout 510г' },
                                  { id: 'stand_pp_film', label: 'Стенд + PP Film (без загину)' }
                                ]
                              : [
                                  { id: 'frontlit_440', label: 'Банер 440г' },
                                  { id: 'oracal_matte', label: 'Плівка Oracal' },
                                  { id: 'pvc_3mm', label: 'ПВХ 3мм' }
                                ]
                            ).map(mat => {
                              const isSelected = wideSelectedMaterials.includes(mat.id);
                              return (
                                <button
                                  key={mat.id}
                                  type="button"
                                  onClick={() => {
                                    setWideSelectedMaterials(prev =>
                                      prev.includes(mat.id) ? [] : [mat.id]
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                                    isSelected
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                  }`}
                                >
                                  {mat.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Resolution / Print Quality Pills */}
                        <div className="flex flex-col gap-1.5 pt-1">
                          <label className="text-[11px] font-bold text-slate-600 uppercase">ЯКІСТЬ ДРУКУ:</label>
                          <div className="flex gap-1.5 flex-wrap items-center">
                            {[
                              { id: '720', label: '720 dpi (Стандарт)' },
                              { id: '1440', label: '1440 dpi (Фотоякість)' },
                              { id: 'uv_1200', label: 'УФ-друк 1200 dpi' },
                              { id: 'uv_white', label: 'УФ-друк + Білий колір' }
                            ].map(res => {
                              const isSelected = wideSelectedResolutions.includes(res.id);
                              return (
                                <button
                                  key={res.id}
                                  type="button"
                                  onClick={() => {
                                    setWideSelectedResolutions(prev =>
                                      prev.includes(res.id) ? [] : [res.id]
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                                    isSelected
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                  }`}
                                >
                                  {res.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>


                    </div>

                    {/* Right Column (50%): Післядрукарська обробка та фурнітура */}
                    <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            ПІСЛЯДРУКАРСЬКА ОБРОБКА & ФУРНІТУРА:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setWideLuvers('none');
                              setWideHemming('none');
                              setWidePocket('0');
                              setWideLamination('0');
                              setWidePlotterCut('0');
                              setWideMountFilm('0');
                              setWideMilling('0');
                              setWideHolders('0');
                              setWideTape3M('0');
                              setWideStretcher('none');
                              setWideArtGel('0');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 text-[11px] font-semibold transition-colors shadow-2xs"
                          >
                            Очистити
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Option 1: Люверси (Banners / Canvas) */}
                          {(wideSubTab === 'banner' || wideSubTab === 'custom') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Люверси:</label>
                              <select
                                value={wideLuvers}
                                onChange={(e) => setWideLuvers(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="none">Без люверсів</option>
                                <option value="30cm">Кожні 30 см (по периметру)</option>
                                <option value="50cm">Кожні 50 см (стандарт)</option>
                                <option value="corners">Тільки по 4 кутах</option>
                              </select>
                            </div>
                          )}

                          {/* Option 2: Підгин / Проклейка краю */}
                          {(wideSubTab === 'banner' || wideSubTab === 'custom') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Проварка краю:</label>
                              <select
                                value={wideHemming}
                                onChange={(e) => setWideHemming(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="perimeter">По периметру</option>
                                <option value="top_bottom">Верх і низ</option>
                                <option value="none">Без проварки (чистий різ)</option>
                              </select>
                            </div>
                          )}

                          {/* Option 3: Кишені під трубу */}
                          {(wideSubTab === 'banner' || wideSubTab === 'stands' || wideSubTab === 'custom') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Кишені під трубу:</label>
                              <select
                                value={widePocket}
                                onChange={(e) => setWidePocket(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="0">Ні</option>
                                <option value="top_bottom">Верх + Низ (Ø 50 мм)</option>
                                <option value="top">Тільки верх (Ø 50 мм)</option>
                              </select>
                            </div>
                          )}

                          {/* Option 4: Ламінація (Film / Paper) */}
                          {(wideSubTab === 'film' || wideSubTab === 'paper' || wideSubTab === 'custom') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Захисна ламінація:</label>
                              <select
                                value={wideLamination}
                                onChange={(e) => setWideLamination(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="0">Без ламінації</option>
                                <option value="gloss">Глянцева 1+0</option>
                                <option value="matte">Матова 1+0</option>
                                <option value="floor">Підлогова (FloorProtect)</option>
                              </select>
                            </div>
                          )}

                          {/* Option 5: Плоттерна порізка (Film) */}
                          {(wideSubTab === 'film' || wideSubTab === 'custom') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Плоттерна порізка:</label>
                              <select
                                value={widePlotterCut}
                                onChange={(e) => setWidePlotterCut(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="0">Ні (прямий різ)</option>
                                <option value="simple">Простий контур (коло, квадрат)</option>
                                <option value="complex">Складний контур (фігурна)</option>
                              </select>
                            </div>
                          )}

                          {/* Option 6: Натяжка на підрамник (Canvas) */}
                          {wideSubTab === 'canvas' && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Натяжка на підрамник:</label>
                              <select
                                value={wideStretcher}
                                onChange={(e) => setWideStretcher(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="gallery">Галерейна натяжка</option>
                                <option value="standard">Стандартна натяжка</option>
                                <option value="none">Без натяжки (рулон)</option>
                              </select>
                            </div>
                          )}

                          {/* Option 7: Модель мобільного стенду (Stands) */}
                          {wideSubTab === 'stands' && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Конструкція стенду:</label>
                              <select
                                value={wideStandModel}
                                onChange={(e) => setWideStandModel(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="rollup_80x200">Roll-Up 80 × 200 см</option>
                                <option value="rollup_100x200">Roll-Up 100 × 200 см</option>
                                <option value="rollup_120x200">Roll-Up 120 × 200 см</option>
                                <option value="spider_60x160">X-banner Павук 60 × 160 см</option>
                                <option value="spider_80x180">X-banner Павук 80 × 180 см</option>
                              </select>
                            </div>
                          )}
                          {/* Option 8: Монтаж на пластик / основу (Film / Paper) */}
                          {(wideSubTab === 'film' || wideSubTab === 'paper' || wideSubTab === 'custom') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Монтаж на основу:</label>
                              <select
                                value={wideMountFilm}
                                onChange={(e) => setWideMountFilm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="0">Без накочування</option>
                                <option value="pvc3">Накатка на ПВХ 3 мм</option>
                                <option value="pvc5">Накатка на ПВХ 5 мм</option>
                                <option value="foam">Накатка на пінокартон</option>
                              </select>
                            </div>
                          )}

                          {/* Option 9: Фрезерування / Фігурна різка (PVC / Acrylic / Composite) */}
                          {(wideSubTab === 'pvc' || wideSubTab === 'composite' || wideSubTab === 'acrylic' || wideSubTab === 'foam_board') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Фрезерування ЧПУ:</label>
                              <select
                                value={wideMilling}
                                onChange={(e) => setWideMilling(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="0">Прямокутний різ</option>
                                <option value="contour">Контурна фрезеровка форми</option>
                                <option value="chamfer">Зняття фаски 45°</option>
                              </select>
                            </div>
                          )}

                          {/* Option 10: Дистанційні тримачі (PVC / Acrylic / Composite) */}
                          {(wideSubTab === 'pvc' || wideSubTab === 'composite' || wideSubTab === 'acrylic') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Дистанційні тримачі:</label>
                              <select
                                value={wideHolders}
                                onChange={(e) => setWideHolders(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="0">Ні</option>
                                <option value="chrome_4">Хромовані металеві (4 шт)</option>
                                <option value="black_4">Чорні матові (4 шт)</option>
                              </select>
                            </div>
                          )}

                          {/* Option 11: Монтажний скотч 3M (PVC / Acrylic / Composite) */}
                          {(wideSubTab === 'pvc' || wideSubTab === 'composite' || wideSubTab === 'acrylic' || wideSubTab === 'foam_board') && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Монтажний скотч 3M:</label>
                              <select
                                value={wideTape3M}
                                onChange={(e) => setWideTape3M(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="0">Ні</option>
                                <option value="tape_vhb">Стрічки 3M VHB по периметру</option>
                              </select>
                            </div>
                          )}

                          {/* Option 12: Арт-гель / Текстурний лак (Canvas) */}
                          {wideSubTab === 'canvas' && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Покриття арт-гелем:</label>
                              <select
                                value={wideArtGel}
                                onChange={(e) => setWideArtGel(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                <option value="0">Ні</option>
                                <option value="art_varnish">Акриловий художній лак 1+0</option>
                                <option value="gel_brush">Текстурний арт-гель (імітація мазків)</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Calculation Matrix Table (Matching Exact Offset & Digital Design) */}
                  <div className="ios-card bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
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
                            checked={wideWithDelivery}
                            onChange={(e) => setWideWithDelivery(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                          />
                          <span>{wideWithDelivery ? 'З доставкою' : 'Без доставки'}</span>
                        </label>

                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setWidePriceCostVar('per_tirazh')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              widePriceCostVar === 'per_tirazh'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            за тираж
                          </button>
                          <button
                            type="button"
                            onClick={() => setWidePriceCostVar('per_sqm')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              widePriceCostVar === 'per_sqm'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            за м²
                          </button>
                          <button
                            type="button"
                            onClick={() => setWidePriceCostVar('per_item')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              widePriceCostVar === 'per_item'
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
                            <th className="py-3 px-4 text-left border-r border-slate-700/50">Матеріал та обробка</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Якість друку</th>
                            <th className="py-3 px-3 border-r border-slate-700/50">Готовність</th>
                            {[1, 2, 3, 5, 10, 20, 50].map(tir => (
                              <th key={tir} style={{ padding: '9px 8px', border: '1px solid #a00000' }} className="font-bold text-white bg-slate-800">
                                {tir} шт.
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {wideSelectedMaterials.length === 0 || wideSelectedResolutions.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-8 text-center text-slate-400 font-semibold">
                                Будь ласка, оберіть хоча б один матеріал та роздільність у фільтрі вище.
                              </td>
                            </tr>
                          ) : (
                            wideSelectedMaterials.flatMap(matId =>
                              wideSelectedResolutions.map(resId => {
                                const areaM2 = Math.max(0.1, (Number(wideWidth || 2000) * Number(wideHeight || 1000)) / (wideUnit === 'mm' ? 1000000 : wideUnit === 'cm' ? 10000 : 1));
                                const perimeterM = (2 * (Number(wideWidth || 2000) + Number(wideHeight || 1000))) / (wideUnit === 'mm' ? 1000 : wideUnit === 'cm' ? 100 : 1);

                                const matRates: Record<string, { label: string; sqmPrice: number }> = {
                                  frontlit_440: { label: 'Банер Frontlit 440 ламінований', sqmPrice: 220 },
                                  frontlit_510: { label: 'Банер Frontlit 510 литий міцний', sqmPrice: 290 },
                                  blockout_510: { label: 'Банер Blockout 510 двосторонній', sqmPrice: 380 },
                                  mesh_banner: { label: 'Банерна сітка Mesh вітростійка', sqmPrice: 260 },
                                  backlit_510: { label: 'Банер Backlit 510 для лайтбоксів', sqmPrice: 340 },
                                  oracal_matte: { label: 'Плівка ORAJET матова біла', sqmPrice: 240 },
                                  oracal_gloss: { label: 'Плівка ORAJET глянцева біла', sqmPrice: 240 },
                                  oracal_clear: { label: 'Плівка ORAJET прозора', sqmPrice: 250 },
                                  ritrama_matte: { label: 'Плівка Ritrama перманентна', sqmPrice: 260 },
                                  one_way_vision: { label: 'Плівка One Way Vision перфорована', sqmPrice: 420 },
                                  translucent: { label: 'Плівка транслюцентна світлорозсіювальна', sqmPrice: 380 },
                                  car_cast: { label: 'Плівка автомобільна лита (Car Wrap)', sqmPrice: 650 },
                                  citylight_150: { label: 'Папір Citylight 150г', sqmPrice: 160 },
                                  blueback_115: { label: 'Папір Blueback 115г', sqmPrice: 120 },
                                  photo_satin_200: { label: 'Фотопапір Satin 200г', sqmPrice: 310 },
                                  photo_gloss_220: { label: 'Фотопапір Gloss 220г', sqmPrice: 330 },
                                  pvc_3mm: { label: 'ПВХ пластик 3 мм + друк', sqmPrice: 680 },
                                  pvc_4mm: { label: 'ПВХ пластик 4 мм + друк', sqmPrice: 790 },
                                  pvc_5mm: { label: 'ПВХ пластик 5 мм + друк', sqmPrice: 890 },
                                  pvc_8mm: { label: 'ПВХ пластик 8 мм + друк', sqmPrice: 1250 },
                                  pvc_10mm: { label: 'ПВХ пластик 10 мм + друк', sqmPrice: 1480 },
                                  foam_5mm: { label: 'Пінокартон білий 5 мм', sqmPrice: 620 },
                                  foam_10mm: { label: 'Пінокартон білий 10 мм', sqmPrice: 780 },
                                  foam_black_5mm: { label: 'Пінокартон чорний 5 мм', sqmPrice: 840 },
                                  comp_white_3mm: { label: 'Композит білий 3 мм', sqmPrice: 1350 },
                                  comp_silver_3mm: { label: 'Композит срібло браш 3 мм', sqmPrice: 1550 },
                                  comp_black_3mm: { label: 'Композит чорний 3 мм', sqmPrice: 1450 },
                                  comp_gold_3mm: { label: 'Композит золото браш 3 мм', sqmPrice: 1600 },
                                  acryl_clear_3mm: { label: 'Акрил прозорий 3 мм', sqmPrice: 1650 },
                                  acryl_clear_5mm: { label: 'Акрил прозорий 5 мм', sqmPrice: 2200 },
                                  acryl_milky_3mm: { label: 'Акрил молочний 3 мм', sqmPrice: 1750 },
                                  acryl_black_3mm: { label: 'Акрил чорний глянець 3 мм', sqmPrice: 1850 },
                                  canvas_cotton_380: { label: 'Натуральне бавовняне полотно 380г', sqmPrice: 580 },
                                  canvas_synthetic_280: { label: 'Синтетичне полотно 280г', sqmPrice: 420 },
                                  canvas_gloss_350: { label: 'Глянцеве фотополотно 350г', sqmPrice: 510 },
                                  stand_banner_440: { label: 'Стенд + Frontlit 440г', sqmPrice: 750 },
                                  stand_banner_510: { label: 'Стенд + Blockout 510г', sqmPrice: 890 },
                                  stand_pp_film: { label: 'Стенд + PP Film без загину', sqmPrice: 1050 },
                                };

                                const matInfo = matRates[matId] || { label: matId, sqmPrice: 250 };
                                const resMultiplier = resId === '1440' ? 1.25 : resId.includes('white') ? 1.55 : resId.includes('uv') ? 1.35 : 1.0;
                                const luversCostPerM = wideLuvers === '30cm' ? 45 : wideLuvers === '50cm' ? 30 : wideLuvers === 'corners' ? 15 : 0;
                                const hemmingCostPerM = wideHemming !== 'none' ? 25 : 0;
                                const lamCostPerSqm = wideLamination !== '0' ? 95 : 0;
                                const stretcherCost = wideStretcher === 'gallery' ? 180 : wideStretcher === 'standard' ? 130 : 0;
                                const postPressPerUnit = (perimeterM * (luversCostPerM + hemmingCostPerM)) + (areaM2 * lamCostPerSqm) + stretcherCost;

                                const unitBaseCost = (areaM2 * matInfo.sqmPrice * resMultiplier) + postPressPerUnit;
                                const deliveryFee = wideWithDelivery ? 120 : 0;

                                return (
                                  <tr key={`${matId}-${resId}`} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
                                    <td className="py-3 px-4 text-left font-bold text-slate-800 border-r border-slate-100">
                                      {matInfo.label}
                                      {wideLuvers !== 'none' && <span className="text-[10px] text-blue-600 block">✓ Люверси: {wideLuvers}</span>}
                                      {wideLamination !== '0' && <span className="text-[10px] text-emerald-600 block">✓ Ламінація захисна</span>}
                                      {wideStretcher !== 'none' && wideSubTab === 'canvas' && <span className="text-[10px] text-purple-600 block">✓ Галерейна натяжка</span>}
                                    </td>
                                    <td className="py-3 px-3 font-bold text-rose-600 border-r border-slate-100">
                                      {resId} dpi
                                    </td>
                                    <td className="py-3 px-3 text-slate-500 font-semibold border-r border-slate-100">
                                      1-2 дні
                                    </td>
                                    {[1, 2, 3, 5, 10, 20, 50].map(tir => {
                                      // Tier volume discount calculation
                                      const volumeDiscount = tir >= 50 ? 0.78 : tir >= 20 ? 0.83 : tir >= 10 ? 0.88 : tir >= 5 ? 0.93 : 1.0;
                                      const totalCost = Math.round(tir * wideSets * unitBaseCost * volumeDiscount + deliveryFee + 80);
                                      const sqmCost = ((totalCost / (tir * areaM2))).toFixed(1);
                                      const perItemCost = (totalCost / tir).toFixed(1);

                                      let displayVal = `${totalCost} грн`;
                                      if (widePriceCostVar === 'per_sqm') {
                                        displayVal = `${sqmCost} ₴/м²`;
                                      } else if (widePriceCostVar === 'per_item') {
                                        displayVal = `${perItemCost} ₴/шт`;
                                      }

                                      return (
                                        <td
                                          key={tir}
                                          onClick={() => {
                                            setWideSelectedMaterials([matId]);
                                            setWideSelectedResolutions([resId]);
                                            setQuantity(tir);
                                            setSelectedSheetCalc({
                                              matId: matId,
                                              covId: '0',
                                              colStr: `${resId} dpi`,
                                              tirazh: tir,
                                              matName: matInfo.label,
                                              covName: 'БП',
                                              rawCost: totalCost,
                                              basePaperCost: Math.round(tir * areaM2 * (matInfo.sqmPrice * 0.65)),
                                              printCost: Math.round(tir * areaM2 * (matInfo.sqmPrice * 0.35 * resMultiplier)),
                                              lamCost: 0,
                                              postpressSum: Math.round(tir * postPressPerUnit),
                                              deliveryCost: deliveryFee,
                                              finalPrice: Math.round(totalCost * (1 + marginPercent / 100)),
                                              unitPrice: Math.round(totalCost * (1 + marginPercent / 100)) / (tir || 1)
                                            });
                                            document.getElementById('detailed-wide-calculation')?.scrollIntoView({ behavior: 'smooth' });
                                          }}
                                          className="py-3 px-3 border-r border-slate-100 last:border-r-0 font-extrabold text-slate-900 hover:bg-blue-600 hover:text-white cursor-pointer transition-all text-xs"
                                          title="Натисніть для вибору тиражу"
                                        >
                                          {displayVal}
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

                  {/* Extended Order & 1C Calculation Card for Wide Format */}
                  {(() => {
                    const hasWideMat = wideSelectedMaterials.length > 0;
                    const areaM2 = Math.max(0.1, (Number(wideWidth || 2000) * Number(wideHeight || 1000)) / (wideUnit === 'mm' ? 1000000 : wideUnit === 'cm' ? 10000 : 1));
                    const perimeterM = (2 * (Number(wideWidth || 2000) + Number(wideHeight || 1000))) / (wideUnit === 'mm' ? 1000 : wideUnit === 'cm' ? 100 : 1);
                    const wideTir = selectedSheetCalc?.tirazh || 1;

                    const matRates: Record<string, { label: string; sqmPrice: number }> = {
                      frontlit_440: { label: 'Банер Frontlit 440 ламінований', sqmPrice: 220 },
                      frontlit_510: { label: 'Банер Frontlit 510 литий міцний', sqmPrice: 290 },
                      blockout_510: { label: 'Банер Blockout 510 двосторонній', sqmPrice: 380 },
                      mesh_banner: { label: 'Банерна сітка Mesh вітростійка', sqmPrice: 260 },
                      backlit_510: { label: 'Банер Backlit 510 для лайтбоксів', sqmPrice: 340 },
                      oracal_matte: { label: 'Плівка ORAJET матова біла', sqmPrice: 240 },
                      oracal_gloss: { label: 'Плівка ORAJET глянцева біла', sqmPrice: 240 },
                      oracal_clear: { label: 'Плівка ORAJET прозора', sqmPrice: 250 },
                      ritrama_matte: { label: 'Плівка Ritrama перманентна', sqmPrice: 260 },
                      one_way_vision: { label: 'Плівка One Way Vision перфорована', sqmPrice: 420 },
                      translucent: { label: 'Плівка транслюцентна світлорозсіювальна', sqmPrice: 380 },
                      car_cast: { label: 'Плівка автомобільна лита (Car Wrap)', sqmPrice: 650 },
                      citylight_150: { label: 'Папір Citylight 150г', sqmPrice: 160 },
                      blueback_115: { label: 'Папір Blueback 115г', sqmPrice: 120 },
                      photo_satin_200: { label: 'Фотопапір Satin 200г', sqmPrice: 310 },
                      photo_gloss_220: { label: 'Фотопапір Gloss 220г', sqmPrice: 330 },
                      pvc_3mm: { label: 'ПВХ пластик 3 мм + друк', sqmPrice: 680 },
                      pvc_4mm: { label: 'ПВХ пластик 4 мм + друк', sqmPrice: 790 },
                      pvc_5mm: { label: 'ПВХ пластик 5 мм + друк', sqmPrice: 890 },
                      foam_5mm: { label: 'Пінокартон білий 5 мм', sqmPrice: 620 },
                      comp_white_3mm: { label: 'Композит білий 3 мм', sqmPrice: 1350 },
                      acryl_clear_3mm: { label: 'Акрил прозорий 3 мм', sqmPrice: 1650 },
                      canvas_cotton_380: { label: 'Бавовняне полотно 380г', sqmPrice: 580 },
                      stand_banner_440: { label: 'Стенд + Frontlit 440г', sqmPrice: 750 },
                    };

                    const wideMatId = wideSelectedMaterials[0] || 'frontlit_440';
                    const wideResId = wideSelectedResolutions[0] || '720';
                    const matInfo = matRates[wideMatId] || { label: wideMatId, sqmPrice: 250 };

                    const resMultiplier = wideResId === '1440' ? 1.25 : wideResId.includes('white') ? 1.55 : wideResId.includes('uv') ? 1.35 : 1.0;
                    const luversCostPerM = wideLuvers === '30cm' ? 45 : wideLuvers === '50cm' ? 30 : wideLuvers === 'corners' ? 15 : 0;
                    const hemmingCostPerM = wideHemming !== 'none' ? 25 : 0;
                    const lamCostPerSqm = wideLamination !== '0' ? 95 : 0;
                    const stretcherCost = wideStretcher === 'gallery' ? 180 : wideStretcher === 'standard' ? 130 : 0;
                    const postPressPerUnit = (perimeterM * (luversCostPerM + hemmingCostPerM)) + (areaM2 * lamCostPerSqm) + stretcherCost;

                    const widePaperCost = hasWideMat ? Math.round(wideTir * areaM2 * (matInfo.sqmPrice * 0.65)) : 0;
                    const widePrintCost = hasWideMat ? Math.round(wideTir * areaM2 * (matInfo.sqmPrice * 0.35 * resMultiplier)) : 0;
                    const widePostSum = hasWideMat ? Math.round(wideTir * postPressPerUnit) : 0;
                    const wideDelivery = (hasWideMat && wideWithDelivery) ? 120 : 0;
                    const wideRawCost = hasWideMat ? (widePaperCost + widePrintCost + widePostSum + wideDelivery + 50) : 0;

                    const wideFinalPrice = hasWideMat ? Math.round(wideRawCost * (1 + marginPercent / 100)) : 0;
                    const wideMarginAmount = hasWideMat ? Math.max(0, wideFinalPrice - wideRawCost) : 0;
                    const wideUnitPrice = hasWideMat && wideTir > 0 ? wideFinalPrice / wideTir : 0;

                    const effectiveClient = isNewClientMode && customClientName.trim()
                      ? customClientName.trim()
                      : (activeClient?.name || 'Замовник');
                    const wideCatLabel = wideSubTab === 'banner' ? 'Банер' : wideSubTab === 'film' ? 'Плівка самоклеюча' : wideSubTab === 'paper' ? 'Папір широкоформатний' : (wideSubTab === 'pvc' || wideSubTab === 'foam_board' || wideSubTab === 'composite' || wideSubTab === 'acrylic') ? 'Прямий друк на пластику' : wideSubTab === 'canvas' ? 'Картина на полотні' : 'Мобільний стенд';
                    const luversLabel = wideLuvers !== 'none' ? `Люверси: ${wideLuvers}, ` : '';
                    const fullComposedName = `№ ${orderNumber} - ${wideCatLabel} (${matInfo.label}) — ${effectiveClient} (${wideWidth}×${wideHeight} ${wideUnit}, ${wideResId} dpi, ${luversLabel}${wideTir} шт.)`;

                    return (
                      <div id="detailed-wide-calculation" className="ios-card bg-white p-6 md:p-7 rounded-2xl border border-blue-200 shadow-lg shadow-blue-500/5 flex flex-col gap-6 md:gap-7">
                        {/* Section Header */}
                        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                              <FileText size={18} />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-slate-900 m-0">
                                Оформлення та кошторис: Широкоформатний друк
                              </h4>
                              <span className="text-xs text-slate-500 font-medium">
                                Параметри розрахунку, розцінки 1С та формування документів
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {wideTir} шт ({areaM2.toFixed(2)} м²)
                            </span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                              {wideResId} dpi
                            </span>
                          </div>
                        </div>

                        {/* Top 3-Field Strip: [ № ] [ ЗАМОВНИК ] [ ПРОДУКЦІЯ (авто) ] */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                          {/* 1. Номер замовлення (Фіксований ID рахунку) */}
                          <div className="md:col-span-3 flex flex-col gap-1">
                            <label className="text-[11px] font-extrabold text-slate-700 uppercase">№ Замовлення (ID):</label>
                            <div className="w-full px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-black text-blue-700 font-mono flex items-center select-none cursor-default shadow-2xs">
                              № {orderNumber}
                            </div>
                          </div>

                          {/* 2. Замовник */}
                          <div className="md:col-span-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-700 uppercase">Замовник:</label>
                              <button
                                type="button"
                                onClick={() => setIsNewClientMode(!isNewClientMode)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                              >
                                {isNewClientMode ? 'Вибрати з бази' : '+ Вписати нового'}
                              </button>
                            </div>

                            {isNewClientMode ? (
                              <input
                                type="text"
                                placeholder="Введіть назву клієнта"
                                value={customClientName}
                                onChange={(e) => setCustomClientName(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-blue-400 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                              >
                                <option value="">-- Оберіть замовника з бази --</option>
                                {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* 3. Продукція (авто) */}
                          <div className="md:col-span-5 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-extrabold text-slate-700 uppercase">Продукція:</label>
                              
                            </div>
                            <input
                              type="text"
                              value={customTitleMap['digital'] ?? fullComposedName}
                              onChange={(e) => {
                                setCustomTitleMap(prev => ({ ...prev, digital: e.target.value }));
                                setName(e.target.value);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                            />
                          </div>
                        </div>

                        {/* 2-Column Main Section: Left = НАКЛАД ТА НАЦІНКА | Right = РОЗРАХУНОК + Горизонтальні кнопки */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 items-stretch">
                          {/* 1. Left Column (50%): Параметри тиражу та націнка */}
                          <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">ПАРАМЕТРИ ТИРАЖУ:</span>
                                <span className="text-[11px] font-bold text-slate-400">Широкий формат</span>
                              </div>

                              {/* Tirazh Input */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-extrabold text-slate-700 uppercase">ТИРАЖ (ШТ):</label>
                                <input
                                  type="number"
                                  value={wideTir}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setSelectedSheetCalc(prev => prev ? { ...prev, tirazh: val } : {
                                      matId: wideMatId,
                                      covId: '0',
                                      colStr: wideResId,
                                      tirazh: val,
                                      matName: matInfo.label,
                                      covName: 'БП',
                                      rawCost: wideRawCost,
                                      basePaperCost: widePaperCost,
                                      printCost: widePrintCost,
                                      lamCost: 0,
                                      postpressSum: widePostSum,
                                      deliveryCost: wideDelivery,
                                      finalPrice: wideFinalPrice,
                                      unitPrice: wideUnitPrice
                                    });
                                  }}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-mono"
                                />
                              </div>

                              {/* Margin slider & presets */}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs">
                                  <label className="text-xs font-extrabold text-slate-700 uppercase">НАЦІНКА (МАРЖА):</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="500"
                                      value={marginPercent}
                                      onChange={(e) => setMarginPercent(Math.max(0, parseInt(e.target.value) || 0))}
                                      className="w-16 px-2 py-0.5 rounded-lg border border-blue-300 bg-white font-black text-blue-600 text-xs text-center focus:outline-none focus:border-blue-600 shadow-2xs"
                                    />
                                    <span className="font-extrabold text-blue-600">%</span>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="300"
                                  step="5"
                                  value={marginPercent}
                                  onChange={(e) => setMarginPercent(Number(e.target.value) || 0)}
                                  className="w-full cursor-pointer accent-blue-600 h-2 bg-slate-200 rounded-lg"
                                />
                                <div className="grid grid-cols-5 gap-2">
                                  {[20, 35, 50, 100, 150].map(m => {
                                    const isSel = marginPercent === m;
                                    return (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMarginPercent(m)}
                                        className={`py-2 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center border ${
                                          isSel
                                            ? 'bg-blue-50 text-blue-700 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs font-extrabold'
                                            : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                                        }`}
                                      >
                                        {m}%
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2. Right Column (50%): РОЗРАХУНОК + ГОРИЗОНТАЛЬНІ КНОПКИ СПРАВА */}
                          <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                  РОЗРАХУНОК (СОБІВАРТІСТЬ & НОРМИ 1С):
                                </span>
                                <strong className="text-sm font-black text-slate-900 font-mono">
                                  {wideRawCost.toFixed(2)} ₴
                                </strong>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Основа / Матеріал:</span>
                                  <strong className="font-mono text-slate-900">{widePaperCost.toFixed(2)} ₴</strong>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Широкоформатний друк:</span>
                                  <strong className="font-mono text-slate-900">{widePrintCost.toFixed(2)} ₴</strong>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                  <span className="text-slate-600 font-medium">Фурнітура / Обробка:</span>
                                  <strong className="font-mono text-slate-900">{widePostSum.toFixed(2)} ₴</strong>
                                </div>
                                {wideDelivery > 0 && (
                                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                    <span className="text-slate-600 font-medium">Доставка:</span>
                                    <strong className="font-mono text-slate-900">{wideDelivery.toFixed(2)} ₴</strong>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-between text-[11px] font-semibold text-slate-500 px-1">
                                <span>Собівартість 1 м²:</span>
                                <strong className="font-mono text-slate-800">
                                  {(wideRawCost / (wideTir * areaM2)).toFixed(2)} ₴ / м²
                                </strong>
                              </div>

                              {/* Total Final Price Box */}
                              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">РАЗОМ ДО СПЛАТИ:</span>
                                  <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                                    +{wideMarginAmount.toFixed(2)} ₴ маржа
                                  </span>
                                </div>
                                <div className="flex items-baseline justify-between pt-1">
                                  <p className="text-3xl font-black text-blue-600 my-0 font-mono tracking-tight leading-none">
                                    {wideFinalPrice} <span className="text-base font-bold text-slate-600">₴</span>
                                  </p>
                                  <div className="text-right">
                                    <span className="text-[11px] text-slate-500 font-medium block">Ціна за 1 шт:</span>
                                    <strong className="text-sm font-black text-slate-900 font-mono">{wideUnitPrice.toFixed(2)} ₴ / шт</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Horizontal Action Buttons Right: [ ШАБЛОН ] [ PDF ] [ КП ] [ ВИРОБНИЦТВО ] */}
                            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setTemplateName(customTitleMap['digital'] ?? fullComposedName);
                                  setShowTemplateModal(true);
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                              >
                                Шаблон
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setName(fullComposedName);
                                  setShowInvoice(true);
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                              >
                                ПДФ
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const text = `Комерційна пропозиція № ${orderNumber}
Замовник: ${effectiveClient}
Продукція: Широкоформатний друк
Розмір: ${wideWidth} × ${wideHeight} ${wideUnit} (${areaM2.toFixed(2)} м²)
Матеріал: ${matInfo.label}
Якість: ${wideResId} dpi
Тираж: ${wideTir} шт
Вартість замовлення: ${wideFinalPrice} грн (${wideUnitPrice.toFixed(2)} грн/шт)
Друкарня "Едельвейс і К"`;
                                  navigator.clipboard.writeText(text);
                                  alert('Комерційну пропозицію (КП) скопійовано в буфер обміну.');
                                }}
                                className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                              >
                                КП
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  addOrder({
                                    name: name || fullComposedName,
                                    clientId: isNewClientMode ? (customClientName || 'Новий клієнт') : selectedClientId,
                                    category: 'Широкоформатний друк',
                                    quantity: wideTir,
                                    packingCount: 1,
                                    paperType: 'coated',
                                    colors: `${wideResId} dpi`,
                                    isSamNaSebe: false,
                                    designCost: designCost,
                                    margin: marginPercent,
                                    machine: 'Широкоформатний плотер Flora',
                                    format: `${wideWidth}×${wideHeight}`,
                                    physicalSheets: wideTir,
                                    itemsPerSheet: 1,
                                    subtotal: wideRawCost,
                                    marginAmount: wideMarginAmount,
                                    finalPrice: wideFinalPrice,
                                    unitPrice: wideUnitPrice,
                                    paymentStatus: 'unpaid',
                                    prepayment: 0,
                                    notes: `Специфікація: ${name || fullComposedName}, ${wideWidth}×${wideHeight} ${wideUnit}, ${matInfo.label}, ${wideResId} dpi, ${wideTir} шт.`
                                  });
                                  alert(`Замовлення № ${orderNumber} створено та передано у виробництво.`);
                                  setOrderNumber(Math.floor(10000 + Math.random() * 90000));
                                }}
                                className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all text-center"
                              >
                                Виробництво
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ROLL PRINTING (Рулонна етикетка та наліпки - Direct Calculator Access) */}
          {mainCategoryTab === 'roll' && (
            <div className="flex flex-col gap-6 md:gap-7">
              {/* Product Presentation Header with Illustration & Description */}
              <div className="ios-card bg-white" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: Product Mockup Illustration */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center">
                    <div style={{
                      width: '100%',
                      maxWidth: '260px',
                      height: '180px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(0, 122, 255, 0.04)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.02)'
                    }}>
                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        <svg width="150" height="125" viewBox="0 0 160 140" fill="none">
                          <ellipse cx="80" cy="35" rx="55" ry="18" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2"/>
                          <path d="M25 35V105C25 115 49.6 123 80 123C110.4 123 135 115 135 105V35" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2"/>
                          <ellipse cx="80" cy="105" rx="55" ry="18" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5"/>
                          <path d="M28 92C45 104 115 104 132 92" stroke="#007AFF" strokeWidth="2.5" strokeDasharray="4 4"/>
                          <rect x="52" y="52" width="56" height="38" rx="6" fill="#007AFF" fillOpacity="0.12" stroke="#007AFF" strokeWidth="1.5"/>
                          <circle cx="68" cy="71" r="9" fill="#007AFF" fillOpacity="0.8"/>
                          <line x1="82" y1="66" x2="100" y2="66" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="82" y1="74" x2="96" y2="74" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="82" y1="80" x2="92" y2="80" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', marginTop: '2px' }}>Рулонна етикетка на втулці</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Title & Description */}
                  <div className="md:col-span-8 flex flex-col justify-center">
                    <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                      Рулонна етикетка
                    </h2>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-medium)', marginBottom: '14px' }}>
                      Друк самоклеючихся <strong style={{ color: 'var(--text-dark)' }}>етикеток і наліпок</strong> в рулонах
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      <span className="ios-badge ios-badge-blue" style={{ fontSize: '11px', padding: '4px 10px' }}>
                        Флексодрук та цифра
                      </span>
                      <span className="ios-badge ios-badge-green" style={{ fontSize: '11px', padding: '4px 10px' }}>
                        Втулка 76 / 40 / 25 мм
                      </span>
                      <span className="ios-badge ios-badge-purple" style={{ fontSize: '11px', padding: '4px 10px' }}>
                        Будь-яка контурна висічка
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-medium)', lineHeight: '1.5', margin: 0 }}>
                      Професійний друк етикеток у рулонах на папері Raflatac, поліпропіленовій плівці (біла, прозора, срібло) та фактурних винних матеріалах. Ідеально підходить для фасування продукції, пляшок, банок, коробок та пакетів.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Parameters Form Card */}
              <div className="ios-card bg-white" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* 1. Size Inputs Row */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '12px' }}>
                    Введіть розмір 1 етикетки:
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-28 focus-within:border-blue-500 focus-within:bg-white transition-all">
                        <input
                          type="number"
                          value={rollWidth}
                          onChange={(e) => setRollWidth(e.target.value)}
                          placeholder="25"
                          min="25"
                          max="300"
                          className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none text-center"
                        />
                      </div>
                      <span className="text-slate-400 font-bold text-base">×</span>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-28 focus-within:border-blue-500 focus-within:bg-white transition-all">
                        <input
                          type="number"
                          value={rollHeight}
                          onChange={(e) => setRollHeight(e.target.value)}
                          placeholder="25"
                          min="25"
                          max="470"
                          className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none text-center"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500 ml-1">мм</span>
                    </div>

                    <span className="text-xs text-slate-400 font-medium ml-2">
                      Максимальний розмір 300 × 470 мм, мінімальний 25 × 25 мм
                    </span>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                      { label: '25×25', w: '25', h: '25' },
                      { label: '30×20', w: '30', h: '20' },
                      { label: '40×30', w: '40', h: '30' },
                      { label: '50×50', w: '50', h: '50' },
                      { label: '58×40', w: '58', h: '40' },
                      { label: '70×50', w: '70', h: '50' },
                      { label: '90×50', w: '90', h: '50' },
                      { label: '100×100', w: '100', h: '100' },
                      { label: '100×150', w: '100', h: '150' },
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => { setRollWidth(p.w); setRollHeight(p.h); }}
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: rollWidth === p.w && rollHeight === p.h ? '1px solid var(--primary)' : '0.5px solid var(--border-light)',
                          backgroundColor: rollWidth === p.w && rollHeight === p.h ? 'var(--primary)' : 'var(--bg-system)',
                          color: rollWidth === p.w && rollHeight === p.h ? '#ffffff' : 'var(--text-dark)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Quantity Input */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '10px' }}>
                    Тираж
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-36 focus-within:border-blue-500 focus-within:bg-white transition-all">
                      <input
                        type="number"
                        value={rollQuantity}
                        onChange={(e) => setRollQuantity(Math.max(100, parseInt(e.target.value) || 100))}
                        step="500"
                        min="100"
                        className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500">шт.</span>

                    {/* Quick quantity buttons */}
                    <div className="flex items-center gap-1.5 ml-2">
                      {[500, 1000, 2000, 5000, 10000].map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setRollQuantity(q)}
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: rollQuantity === q ? '1px solid var(--primary)' : '0.5px solid var(--border-light)',
                            backgroundColor: rollQuantity === q ? 'rgba(0, 122, 255, 0.1)' : 'var(--bg-system)',
                            color: rollQuantity === q ? 'var(--primary)' : 'var(--text-dark)',
                            cursor: 'pointer'
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Distance Between Labels */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '10px' }}>
                    Відстань між етикетками
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-28 focus-within:border-blue-500 focus-within:bg-white transition-all">
                      <input
                        type="number"
                        value={rollGap}
                        onChange={(e) => setRollGap(e.target.value)}
                        min="4"
                        max="12"
                        className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none text-center"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500">від 4 до 12 мм</span>
                  </div>
                </div>

                {/* 4. Core Diameter */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '10px' }}>
                    Діаметр втулки:
                  </h3>
                  <div className="flex flex-wrap items-center gap-6">
                    {[
                      { id: '76', label: '76 мм (стандартна)' },
                      { id: '40', label: '40 мм' },
                      { id: '25', label: '25 мм' },
                    ].map(core => (
                      <label key={core.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="rollCore"
                          checked={rollCore === core.id}
                          onChange={() => setRollCore(core.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-xs font-bold ${rollCore === core.id ? 'text-blue-600' : 'text-slate-700'} group-hover:text-blue-600 transition-colors`}>
                          {core.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 5. Roll Label Orientation */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '14px' }}>
                    Виберіть орієнтацію наліпки на рулоні
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        id: '1',
                        label: '1',
                        desc: 'Головою вперед',
                        icon: (
                          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                            <ellipse cx="34" cy="18" rx="18" ry="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5"/>
                            <path d="M16 18V44C16 47.3 24.1 50 34 50C43.9 50 52 47.3 52 44V18" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5"/>
                            <ellipse cx="34" cy="44" rx="18" ry="6" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.2"/>
                            <path d="M18 38L4 58H34L48 38" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.5"/>
                            <rect x="10" y="42" width="22" height="5" rx="1" fill="#007AFF" fillOpacity="0.8"/>
                            <line x1="12" y1="51" x2="30" y2="51" stroke="#94A3B8" strokeWidth="1.5"/>
                          </svg>
                        )
                      },
                      {
                        id: '2',
                        label: '2',
                        desc: 'Низом вперед',
                        icon: (
                          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                            <ellipse cx="34" cy="18" rx="18" ry="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5"/>
                            <path d="M16 18V44C16 47.3 24.1 50 34 50C43.9 50 52 47.3 52 44V18" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5"/>
                            <ellipse cx="34" cy="44" rx="18" ry="6" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.2"/>
                            <path d="M18 38L4 58H34L48 38" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.5"/>
                            <line x1="12" y1="44" x2="30" y2="44" stroke="#94A3B8" strokeWidth="1.5"/>
                            <rect x="10" y="50" width="22" height="5" rx="1" fill="#007AFF" fillOpacity="0.8"/>
                          </svg>
                        )
                      },
                      {
                        id: '3',
                        label: '3',
                        desc: 'Правим краєм',
                        icon: (
                          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                            <ellipse cx="34" cy="18" rx="18" ry="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5"/>
                            <path d="M16 18V44C16 47.3 24.1 50 34 50C43.9 50 52 47.3 52 44V18" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5"/>
                            <ellipse cx="34" cy="44" rx="18" ry="6" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.2"/>
                            <path d="M18 38L4 58H34L48 38" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.5"/>
                            <rect x="23" y="42" width="5" height="13" rx="1" fill="#007AFF" fillOpacity="0.8"/>
                            <line x1="10" y1="45" x2="18" y2="45" stroke="#94A3B8" strokeWidth="1.5"/>
                            <line x1="10" y1="51" x2="18" y2="51" stroke="#94A3B8" strokeWidth="1.5"/>
                          </svg>
                        )
                      },
                      {
                        id: '4',
                        label: '4',
                        desc: 'Лівим краєм',
                        icon: (
                          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                            <ellipse cx="34" cy="18" rx="18" ry="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5"/>
                            <path d="M16 18V44C16 47.3 24.1 50 34 50C43.9 50 52 47.3 52 44V18" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5"/>
                            <ellipse cx="34" cy="44" rx="18" ry="6" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.2"/>
                            <path d="M18 38L4 58H34L48 38" fill="#FFFFFF" stroke="#007AFF" strokeWidth="1.5"/>
                            <rect x="8" y="42" width="5" height="13" rx="1" fill="#007AFF" fillOpacity="0.8"/>
                            <line x1="17" y1="45" x2="26" y2="45" stroke="#94A3B8" strokeWidth="1.5"/>
                            <line x1="17" y1="51" x2="26" y2="51" stroke="#94A3B8" strokeWidth="1.5"/>
                          </svg>
                        )
                      }
                    ].map(orient => {
                      const isActive = rollOrientation === orient.id;
                      return (
                        <div
                          key={orient.id}
                          onClick={() => setRollOrientation(orient.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '14px 10px',
                            borderRadius: '14px',
                            border: isActive ? '2px solid var(--primary)' : '0.5px solid var(--border-light)',
                            backgroundColor: isActive ? 'rgba(0, 122, 255, 0.05)' : 'var(--bg-system)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            {orient.icon}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name="rollOrientRadio"
                              checked={isActive}
                              onChange={() => setRollOrientation(orient.id)}
                              className="w-3.5 h-3.5 text-blue-600"
                            />
                            <span style={{ fontSize: '13px', fontWeight: '800', color: isActive ? 'var(--primary)' : 'var(--text-dark)' }}>
                              {orient.label}
                            </span>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-medium)', marginTop: '2px' }}>
                            {orient.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Specification and Materials Filter Card (Matching exact styling of media_1787929205713.png) */}
              <div className="ios-card bg-white" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                    Фільтр специфікацій та матеріалів
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-medium)' }}>
                    Оберіть параметри для формування матриці цін
                  </span>
                </div>

                {/* 1. МАТЕРІАЛ */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">МАТЕРІАЛ:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: '209', title: 'Етикеточний папір Raflatac' },
                      { id: '210', title: 'Етикеточний папір Крафт' },
                      { id: '212', title: 'Поліпропіленова плівка біла' },
                      { id: '213', title: 'Поліпропіленова плівка прозора' },
                      { id: '214', title: 'Поліпропіленова плівка срібло' },
                      { id: '211', title: 'Папір винний Antique White' },
                      { id: '215', title: 'Папір винний Martel' },
                    ].map(mat => {
                      const isActive = rollMaterial === mat.id;
                      return (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => setRollMaterial(mat.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: isActive ? '1px solid #007AFF' : '0.5px solid var(--border-light)',
                            backgroundColor: isActive ? '#007AFF' : 'var(--bg-system)',
                            color: isActive ? '#ffffff' : 'var(--text-dark)',
                            boxShadow: isActive ? '0 2px 6px rgba(0, 122, 255, 0.3)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {mat.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. ПОКРИТТЯ */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">ПОКРИТТЯ:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: '0', title: 'Без покриття' },
                      { id: '190', title: 'Лак глянцевий' },
                      { id: '191', title: 'Лак матовий' },
                    ].map(coat => {
                      const isActive = rollCoating === coat.id;
                      return (
                        <button
                          key={coat.id}
                          type="button"
                          onClick={() => setRollCoating(coat.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: isActive ? '1px solid #007AFF' : '0.5px solid var(--border-light)',
                            backgroundColor: isActive ? '#007AFF' : 'var(--bg-system)',
                            color: isActive ? '#ffffff' : 'var(--text-dark)',
                            boxShadow: isActive ? '0 2px 6px rgba(0, 122, 255, 0.3)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {coat.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. ДРУК */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">ДРУК:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: '1', title: 'Повноколірний 4+0' },
                      { id: '8', title: 'WHITE 1+0' },
                      { id: '14', title: 'WHITE + CMYK 5+0' },
                    ].map(col => {
                      const isActive = rollColor === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setRollColor(col.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: isActive ? '1px solid #007AFF' : '0.5px solid var(--border-light)',
                            backgroundColor: isActive ? '#007AFF' : 'var(--bg-system)',
                            color: isActive ? '#ffffff' : 'var(--text-dark)',
                            boxShadow: isActive ? '0 2px 6px rgba(0, 122, 255, 0.3)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {col.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Price Calculation Matrix Table: ВАРТІСТЬ ТА СТРОКИ ВИГОТОВЛЕННЯ */}
              <div className="ios-card bg-white" style={{ overflow: 'hidden' }}>
                <div style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                    ВАРТІСТЬ ТА СТРОКИ ВИГОТОВЛЕННЯ
                  </span>

                  <div className="flex items-center gap-4">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={includeDelivery}
                        onChange={(e) => setIncludeDelivery(e.target.checked)}
                        className="rounded text-blue-500 focus:ring-blue-400"
                      />
                      <span>З доставкою</span>
                    </label>

                    <div className="flex bg-slate-800/90 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPriceCostVar('per_tirazh')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          priceCostVar === 'per_tirazh' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        За тираж
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceCostVar('per_item')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          priceCostVar === 'per_item' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        За 1000 шт
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-slate-200 text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                        <th className="py-3 px-4 text-left border-r border-slate-700/60">Матеріал та покриття</th>
                        <th className="py-3 px-3 border-r border-slate-700/60">Друк</th>
                        <th className="py-3 px-3 border-r border-slate-700/60">Готовність</th>
                        <th className="py-3 px-3 border-r border-slate-700/60 bg-blue-900/40 text-blue-300 font-extrabold">
                          {rollQuantity} шт. (Ваш тираж)
                        </th>
                        {[500, 1000, 2000, 5000, 10000, 25000].filter(t => t !== rollQuantity).map(tir => (
                          <th key={tir} className="py-3 px-3 border-r border-slate-700/60 last:border-r-0 font-bold">
                            {tir} шт.
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { matId: '209', matName: 'Етикеточний папір Raflatac', rate: 65 },
                        { matId: '210', matName: 'Етикеточний папір Крафт', rate: 85 },
                        { matId: '212', matName: 'Поліпропілен білий (PP)', rate: 95 },
                        { matId: '213', matName: 'Поліпропілен прозорий', rate: 110 },
                        { matId: '214', matName: 'Поліпропілен срібло', rate: 135 },
                        { matId: '211', matName: 'Папір винний Antique White', rate: 150 },
                        { matId: '215', matName: 'Папір винний Martel', rate: 165 },
                      ].map((row) => {
                        const isSelectedMat = rollMaterial === row.matId;
                        const w = parseFloat(rollWidth) || 25;
                        const h = parseFloat(rollHeight) || 25;
                        const gap = parseFloat(rollGap) || 4;
                        const colorAdd = rollColor === '14' ? 85 : rollColor === '8' ? 55 : 40;
                        const coatAdd = rollCoating === '190' ? 25 : rollCoating === '191' ? 30 : 0;
                        const coatName = rollCoating === '190' ? ' + Лак глянець' : rollCoating === '191' ? ' + Лак мат' : ' (без лаку)';
                        const colorName = rollColor === '14' ? '5+0 White+CMYK' : rollColor === '8' ? '1+0 White' : '4+0 CMYK';

                        const allTiers = [rollQuantity, ...[500, 1000, 2000, 5000, 10000, 25000].filter(t => t !== rollQuantity)];

                        return (
                          <tr
                            key={row.matId}
                            className={`transition-colors ${isSelectedMat ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'}`}
                          >
                            <td className="py-2.5 px-4 text-left font-semibold text-slate-800 border-r border-slate-100 flex items-center justify-between">
                              <span>{row.matName}{coatName}</span>
                              {isSelectedMat && (
                                <span className="ios-badge-blue text-[10px] px-1.5 py-0.5 rounded ml-2">Обрано</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-red-600 border-r border-slate-100 whitespace-nowrap">
                              {colorName}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px] border-r border-slate-100 whitespace-nowrap">
                              2-3 дні
                            </td>
                            {allTiers.map((tir, idx) => {
                              const meters = (tir * (h + gap)) / 1000;
                              const sqM = (w / 1000) * meters;
                              const totalCost = Math.round(sqM * (row.rate + colorAdd + coatAdd) + 380 + (includeDelivery ? 75 : 0));
                              const displayVal = priceCostVar === 'per_item'
                                ? ((totalCost / tir) * 1000).toFixed(1)
                                : totalCost.toString();

                              const isCustomCol = idx === 0;

                              return (
                                <td
                                  key={tir}
                                  onClick={() => {
                                    setRollMaterial(row.matId);
                                    setRollQuantity(tir);
                                    setQuantity(tir);
                                    document.getElementById('detailed-roll-calculation')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  style={{ border: isCustomCol ? '1px solid rgba(0, 122, 255, 0.3)' : undefined }}
                                  className={`py-2.5 px-3 font-bold border-r border-slate-100 last:border-r-0 hover:bg-blue-600 hover:text-white cursor-pointer transition-all duration-150 ${
                                    isCustomCol ? 'bg-blue-50/90 text-blue-700' : 'text-slate-900'
                                  }`}
                                >
                                  {displayVal} грн
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

{/* Extended Order & 1C Calculation Card for Roll Printing */}
                {(() => {
                  const w = parseFloat(rollWidth) || 25;
                  const h = parseFloat(rollHeight) || 25;
                  const gap = parseFloat(rollGap) || 4;
                  const linearMeters = Math.round((rollQuantity * (h + gap)) / 1000 * 10) / 10;
                  const sqMeters = Math.round((w / 1000) * linearMeters * 100) / 100;
                  const approxRolls = Math.max(1, Math.ceil(linearMeters / 100));
                  const colorAdd = rollColor === '14' ? 85 : rollColor === '8' ? 55 : 40;
                  const coatAdd = rollCoating === '190' ? 25 : rollCoating === '191' ? 30 : 0;
                  const baseRate = rollMaterial === '215' ? 165 : rollMaterial === '211' ? 150 : rollMaterial === '214' ? 135 : rollMaterial === '213' ? 110 : rollMaterial === '212' ? 95 : rollMaterial === '210' ? 85 : 65;
                  
                  const rollPaperCost = Math.round(sqMeters * baseRate);
                  const rollPrintCost = Math.round(sqMeters * colorAdd);
                  const rollLamCost = Math.round(sqMeters * coatAdd);
                  const rollPostSum = 250;
                  const rollDelivery = includeDelivery ? 90 : 0;
                  const rollRawCost = rollPaperCost + rollPrintCost + rollLamCost + rollPostSum + rollDelivery + 50;

                  const rollFinalPrice = Math.round(rollRawCost * (1 + marginPercent / 100));
                  const rollMarginAmount = Math.max(0, rollFinalPrice - rollRawCost);
                  const rollUnitPrice = rollFinalPrice / rollQuantity;

                  const matLabels: Record<string, string> = {
                    '209': 'Етикеточний папір Raflatac',
                    '210': 'Етикеточний папір Крафт',
                    '212': 'Поліпропілен білий (PP)',
                    '213': 'Поліпропілен прозорий',
                    '214': 'Поліпропілен срібло',
                    '211': 'Папір винний Antique White',
                    '215': 'Папір винний Martel',
                  };

                  const effectiveClient = isNewClientMode && customClientName.trim()
                    ? customClientName.trim()
                    : (activeClient?.name || 'Замовник');
                  const fullComposedName = `№ ${orderNumber} - Рулонна етикетка ${rollWidth}×${rollHeight} мм — ${effectiveClient} (${matLabels[rollMaterial] || 'Raflatac'}, ${rollQuantity} шт.)`;

                  return (
                    <div id="detailed-roll-calculation" className="ios-card bg-white" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid #bfdbfe', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)', marginTop: '20px' }}>
                      {/* Section Header */}
                      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                            <FileText size={18} />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900 m-0">
                              Оформлення та кошторис: Рулонний друк
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">
                              Технічні параметри намотки, розцінки 1С та формування документів
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {rollQuantity} шт ({linearMeters} м.п.)
                          </span>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                            Втулка {rollCore} мм (№{rollOrientation})
                          </span>
                        </div>
                      </div>

                      {/* Top 3-Field Strip: [ № ] [ ЗАМОВНИК ] [ ПРОДУКЦІЯ (авто) ] */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        {/* 1. Номер замовлення (Фіксований ID рахунку) */}
                          <div className="md:col-span-3 flex flex-col gap-1">
                            <label className="text-[11px] font-extrabold text-slate-700 uppercase">№ Замовлення (ID):</label>
                            <div className="w-full px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-black text-blue-700 font-mono flex items-center select-none cursor-default shadow-2xs">
                              № {orderNumber}
                            </div>
                          </div>

                        {/* 2. Замовник */}
                        <div className="md:col-span-4 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-slate-700 uppercase">Замовник:</label>
                            <button
                              type="button"
                              onClick={() => setIsNewClientMode(!isNewClientMode)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                            >
                              {isNewClientMode ? 'Вибрати з бази' : '+ Вписати нового'}
                            </button>
                          </div>

                          {isNewClientMode ? (
                            <input
                              type="text"
                              placeholder="Введіть назву клієнта"
                              value={customClientName}
                              onChange={(e) => setCustomClientName(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-blue-400 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <select
                              value={selectedClientId}
                              onChange={(e) => setSelectedClientId(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                            >
                              <option value="">-- Оберіть замовника з бази --</option>
                              {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* 3. Продукція (авто) */}
                        <div className="md:col-span-5 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-slate-700 uppercase">Продукція:</label>
                            
                          </div>
                          <input
                            type="text"
                            value={customTitleMap['roll_print'] ?? fullComposedName}
                            onChange={(e) => {
                              setCustomTitleMap(prev => ({ ...prev, roll_print: e.target.value }));
                              setName(e.target.value);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                          />
                        </div>
                      </div>

                      {/* 2-Column Main Section: Left = ТЕХНІЧНІ ДАНІ НАМОТКИ ТА НАЦІНКА | Right = РОЗРАХУНОК + Горизонтальні кнопки */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 items-stretch">
                        {/* 1. Left Column (50%): Технічні параметри намотки та націнка */}
                        <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">ПАРАМЕТРИ НАМОТКИ В РУЛОНИ:</span>
                              <span className="text-[11px] font-bold text-slate-400">Флексодрук</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                                <span className="text-slate-500 text-[10px] uppercase font-bold">Метраж намотки:</span>
                                <strong className="text-slate-900 text-sm font-mono">{linearMeters} м.п.</strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                                <span className="text-slate-500 text-[10px] uppercase font-bold">Площа друку:</span>
                                <strong className="text-slate-900 text-sm font-mono">{sqMeters} м²</strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                                <span className="text-slate-500 text-[10px] uppercase font-bold">Кількість рулонів:</span>
                                <strong className="text-blue-600 text-sm font-mono">{approxRolls} шт (~100м)</strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col">
                                <span className="text-slate-500 text-[10px] uppercase font-bold">Втулка та вихід:</span>
                                <strong className="text-slate-900 text-sm font-mono">Ø{rollCore}мм (№{rollOrientation})</strong>
                              </div>
                            </div>

                            {/* Margin slider & presets */}
                            <div className="flex flex-col gap-2 pt-1">
                              <div className="flex items-center justify-between text-xs">
                                <label className="text-xs font-extrabold text-slate-700 uppercase">НАЦІНКА (МАРЖА):</label>
                                <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{marginPercent}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="300"
                                step="5"
                                value={marginPercent}
                                onChange={(e) => setMarginPercent(Number(e.target.value) || 0)}
                                className="w-full cursor-pointer accent-blue-600 h-2 bg-slate-200 rounded-lg"
                              />
                              <div className="grid grid-cols-5 gap-2 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/60">
                                {[20, 35, 50, 100, 150].map(m => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMarginPercent(m)}
                                    className={`py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center ${
                                      marginPercent === m
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'text-slate-600 hover:bg-white'
                                    }`}
                                  >
                                    {m}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Right Column (50%): РОЗРАХУНОК + ГОРИЗОНТАЛЬНІ КНОПКИ СПРАВА */}
                        <div className="ios-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-6 h-full">
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                РОЗРАХУНОК (СОБІВАРТІСТЬ & НОРМИ 1С):
                              </span>
                              <strong className="text-sm font-black text-slate-900 font-mono">
                                {rollRawCost.toFixed(2)} ₴
                              </strong>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                <span className="text-slate-600 font-medium">Рулонний матеріал:</span>
                                <strong className="font-mono text-slate-900">{rollPaperCost.toFixed(2)} ₴</strong>
                              </div>
                              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                <span className="text-slate-600 font-medium">Флексодрук / Фарби:</span>
                                <strong className="font-mono text-slate-900">{rollPrintCost.toFixed(2)} ₴</strong>
                              </div>
                              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                <span className="text-slate-600 font-medium">Лак / Ламінація:</span>
                                <strong className="font-mono text-slate-900">{rollLamCost.toFixed(2)} ₴</strong>
                              </div>
                              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                <span className="text-slate-600 font-medium">Намотка та різка:</span>
                                <strong className="font-mono text-slate-900">{rollPostSum.toFixed(2)} ₴</strong>
                              </div>
                              {rollDelivery > 0 && (
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2">
                                  <span className="text-slate-600 font-medium">Доставка:</span>
                                  <strong className="font-mono text-slate-900">{rollDelivery.toFixed(2)} ₴</strong>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between text-[11px] font-semibold text-slate-500 px-1">
                              <span>Собівартість 1000 шт:</span>
                              <strong className="font-mono text-slate-800">
                                {((rollRawCost / rollQuantity) * 1000).toFixed(2)} ₴ / тис.шт
                              </strong>
                            </div>

                            {/* Total Final Price Box */}
                            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">РАЗОМ ДО СПЛАТИ:</span>
                                <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                                  +{rollMarginAmount.toFixed(2)} ₴ маржа
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between pt-1">
                                <p className="text-3xl font-black text-blue-600 my-0 font-mono tracking-tight leading-none">
                                  {rollFinalPrice} <span className="text-base font-bold text-slate-600">₴</span>
                                </p>
                                <div className="text-right">
                                  <span className="text-[11px] text-slate-500 font-medium block">Ціна за 1 шт:</span>
                                  <strong className="text-sm font-black text-slate-900 font-mono">{rollUnitPrice.toFixed(4)} ₴ / шт</strong>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Horizontal Action Buttons Right: [ ШАБЛОН ] [ PDF ] [ КП ] [ ВИРОБНИЦТВО ] */}
                          <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setTemplateName(customTitleMap['roll_print'] ?? fullComposedName);
                                setShowTemplateModal(true);
                              }}
                              className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                            >
                              Шаблон
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setName(fullComposedName);
                                setShowInvoice(true);
                              }}
                              className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                            >
                              ПДФ
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const text = `Комерційна пропозиція № ${orderNumber}
Замовник: ${effectiveClient}
Продукція: Рулонна етикетка
Розмір: ${rollWidth} × ${rollHeight} мм
Матеріал: ${matLabels[rollMaterial] || 'Raflatac'}
Тираж: ${rollQuantity} шт (${approxRolls} рул.)
Вартість замовлення: ${rollFinalPrice} грн (${rollUnitPrice.toFixed(4)} грн/шт)
Друкарня "Едельвейс і К"`;
                                navigator.clipboard.writeText(text);
                                alert('Комерційну пропозицію (КП) скопійовано в буфер обміну.');
                              }}
                              className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors text-center"
                            >
                              КП
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                addOrder({
                                  name: name || fullComposedName,
                                  clientId: isNewClientMode ? (customClientName || 'Новий клієнт') : selectedClientId,
                                  category: 'Рулонний друк',
                                  quantity: rollQuantity,
                                  packingCount: approxRolls,
                                  paperType: 'coated',
                                  colors: 'Флексодрук',
                                  isSamNaSebe: false,
                                  designCost: designCost,
                                  margin: marginPercent,
                                  machine: 'Флексографічна машина',
                                  format: `${rollWidth}×${rollHeight}`,
                                  physicalSheets: approxRolls,
                                  itemsPerSheet: 1,
                                  subtotal: rollRawCost,
                                  marginAmount: rollMarginAmount,
                                  finalPrice: rollFinalPrice,
                                  unitPrice: rollUnitPrice,
                                  paymentStatus: 'unpaid',
                                  prepayment: 0,
                                  notes: `Специфікація: ${name || fullComposedName}, ${rollWidth}×${rollHeight} мм, ${matLabels[rollMaterial] || 'Raflatac'}, втулка Ø${rollCore}мм, орієнтація №${rollOrientation}, ${rollQuantity} шт.`
                                });
                                alert(`Замовлення № ${orderNumber} створено та передано у виробництво.`);
                                setOrderNumber(Math.floor(10000 + Math.random() * 90000));
                              }}
                              className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all text-center"
                            >
                              Виробництво
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 6: COLOR FILMS */}
          {mainCategoryTab === 'films' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {[
                {
                  title: 'Плотерна порізка ORACAL 641',
                  desc: 'Точна контурна порізка написів, логотипів та графіки з 60 кольорів вінілових плівок.',
                  icon: <Scissors size={30} style={{ color: '#ff9500' }} />,
                  color: 'rgba(255, 149, 0, 0.1)',
                  badgeClass: 'ios-badge-orange',
                  badge: 'ORACAL 641',
                  metric: '60 кольорів',
                  cat: 'Наклейки'
                },
                {
                  title: 'Трафаретні плівки ORAMASK',
                  desc: 'Виготовлення одноразових та багаторазових трафаретів для фарбування та аерографії.',
                  icon: <Layers size={30} style={{ color: '#0ea5e9' }} />,
                  color: 'rgba(14, 165, 233, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Трафарети',
                  metric: 'Точний контур',
                  cat: 'Наклейки'
                },
                {
                  title: 'Світловідбиваючі плівки',
                  desc: 'Спеціальні світлоповертаючі плівки для дорожніх знаків, спецтранспорту та сигнальної розмітки.',
                  icon: <Zap size={30} style={{ color: '#ffcc00' }} />,
                  color: 'rgba(255, 204, 0, 0.15)',
                  badgeClass: 'ios-badge-yellow',
                  badge: 'Світловідбиваюча',
                  metric: 'Підвищена видимість',
                  cat: 'Наклейки'
                },
                {
                  title: 'Монтажна плівка з вибіркою',
                  desc: 'Вибірка зайвих елементів та нанесення монтажної плівки для швидкого перенесення аплікацій.',
                  icon: <FileText size={30} style={{ color: 'var(--primary)' }} />,
                  color: 'rgba(0, 122, 255, 0.1)',
                  badgeClass: 'ios-badge-blue',
                  badge: 'Монтажка',
                  metric: 'Готово до поклейки',
                  cat: 'Наклейки'
                },
                {
                  title: 'Брендування автотранспорту',
                  desc: 'Комплексна підготовка плівок та нанесення корпоративної айдентики на легковий і комерційний транспорт.',
                  icon: <Sparkles size={30} style={{ color: '#34c759' }} />,
                  color: 'rgba(52, 199, 89, 0.1)',
                  badgeClass: 'ios-badge-green',
                  badge: 'Автоайдентика',
                  metric: 'Автобрендування',
                  cat: 'Логотипи виготовлення'
                }
              ].map(item => (
                <div
                  key={item.title}
                  onClick={() => handleSelectCategory(item.cat)}
                  className="ios-card bg-white"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '200px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        backgroundColor: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.icon}
                      </div>
                      <span className={`ios-badge ${item.badgeClass}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                        {item.badge}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.4' }}>
                      {item.desc}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '0.5px solid var(--border-light)',
                    paddingTop: '12px',
                    marginTop: '16px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-medium)' }}>
                      {item.metric}
                    </span>
                    <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '700' }}>
                      Розрахувати <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:gap-7">
          {/* Editor Header Navigation */}
          <div className="ios-card bg-white" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <button 
              onClick={() => setStep('catalog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '0.5px solid var(--border-light)',
                backgroundColor: 'var(--bg-system)',
                color: 'var(--text-dark)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} style={{ color: 'var(--primary)' }} />
              <span>Каталог виробів</span>
            </button>
            
            {/* Calculation Mode Selector - Cupertino iOS Segmented Control */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-system)', padding: '4px', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => setCalcMode('auto')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: calcMode === 'auto' ? 'var(--primary)' : 'transparent',
                  color: calcMode === 'auto' ? '#ffffff' : 'var(--text-dark)',
                  boxShadow: calcMode === 'auto' ? '0 2px 6px rgba(0, 122, 255, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Параметричний конструктор
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('operations')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: calcMode === 'operations' ? 'var(--primary)' : 'transparent',
                  color: calcMode === 'operations' ? '#ffffff' : 'var(--text-dark)',
                  boxShadow: calcMode === 'operations' ? '0 2px 6px rgba(0, 122, 255, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Поопераційний розрахунок
              </button>
            </div>

            <button 
              onClick={() => {
                setTemplateName(name || `${category === 'Бланки' ? subCategory : category} ${quantity} шт`);
                setShowTemplateModal(true);
              }}
              className="ios-badge ios-badge-blue"
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
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
              <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px', margin: 0 }}>
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
                <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px', margin: 0 }}>
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

                  {/* Material Price Setting & Override */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">Своя ціна паперу/матеріалу:</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="з прайсу"
                          value={customPaperPrice}
                          onChange={(e) => setCustomPaperPrice(e.target.value)}
                          className="w-28 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">грн/лист</span>
                      </div>
                      {customPaperPrice && (
                        <button
                          type="button"
                          onClick={() => setCustomPaperPrice('')}
                          className="text-[11px] text-slate-400 hover:text-red-500 font-bold"
                          title="Скинути до стандартної ціни"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('materials')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      <Layers size={13} className="text-blue-600" />
                      <span>Прайс матеріалів</span>
                    </button>
                  </div>
                </div>
              )}

              {calcMode === 'auto' ? (
                /* Simple Business Logic Breakdown Output */
                <div className="ios-card bg-white" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px', margin: 0 }}>
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
                <div className="ios-card bg-white" style={{ overflow: 'hidden' }}>
                  <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 m-0">
                      Виробничі операції та калькуляція собівартості
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
            <div className="flex flex-col gap-6 md:gap-7">
              <div className="ios-card bg-white" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    Підсумки розрахунку
                  </span>
                </div>

                {/* Final Price to Client */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200/80">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-600">Ціна для клієнта:</span>
                    <span className="text-[11px] font-bold text-blue-700 font-mono">
                      {calculatedOps.unitPrice.toFixed(2)} ₴ / шт
                    </span>
                  </div>
                  <p className="text-3xl font-black text-blue-600 my-1 font-mono tracking-tight">
                    {calculatedOps.finalPrice.toFixed(2)} <span className="text-base font-bold text-slate-600">₴</span>
                  </p>
                </div>

                {/* Cost Structure Breakdown */}
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                      Собівартість виробництва:
                    </span>
                    <strong className="font-extrabold text-slate-900 font-mono">
                      {calculatedOps.subtotal.toFixed(2)} ₴
                    </strong>
                  </div>

                  {/* Multi-segment visual bar */}
                  {(() => {
                    const sub = calculatedOps.subtotal || 1;
                    const paperP = Math.round((calculatedOps.paperCost / sub) * 100) || 0;
                    const printP = Math.round((calculatedOps.printingCost / sub) * 100) || 0;
                    const postP = Math.max(0, 100 - paperP - printP);
                    const postCost = Math.max(0, calculatedOps.subtotal - calculatedOps.paperCost - calculatedOps.printingCost);

                    return (
                      <>
                        <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-200 my-0.5">
                          <div style={{ width: `${paperP}%` }} className="bg-amber-500 h-full" title={`Папір: ${paperP}%`}></div>
                          <div style={{ width: `${printP}%` }} className="bg-blue-500 h-full" title={`Друк: ${printP}%`}></div>
                          <div style={{ width: `${postP}%` }} className="bg-indigo-500 h-full" title={`Післядрук: ${postP}%`}></div>
                        </div>

                        <div className="flex flex-col gap-1 text-[11px]">
                          <div className="flex justify-between text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              Папір ({calculatedOps.physicalSheets} л.):
                            </span>
                            <span className="font-mono font-semibold text-slate-800">{calculatedOps.paperCost.toFixed(2)} ₴ ({paperP}%)</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              Друк & CTP:
                            </span>
                            <span className="font-mono font-semibold text-slate-800">{calculatedOps.printingCost.toFixed(2)} ₴ ({printP}%)</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              Післядрук & Порізка:
                            </span>
                            <span className="font-mono font-semibold text-slate-800">{postCost.toFixed(2)} ₴ ({postP}%)</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-semibold text-slate-500 text-[10.5px]">
                    <span>Собівартість за 1 шт:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {(calculatedOps.subtotal / (Number(quantity) || 1)).toFixed(4)} ₴/шт
                    </span>
                  </div>
                </div>

                {/* Warehouse Stock Check */}
                <div className={`p-2.5 rounded-xl border text-xs ${
                  paperWarehouseStatus.hasEnough 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <strong className="font-bold">Склад:</strong> {paperWarehouseStatus.materialName} ({paperWarehouseStatus.available} доступно, потрібно {calculatedOps.physicalSheets})
                </div>

                {/* Margin manual percentage selector with Range Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">Націнка (Маржа друкарні):</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-emerald-600 font-mono">+{calculatedOps.marginAmount.toFixed(2)} ₴</span>
                      <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">({marginPercent}%)</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
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
                        {[20, 35, 50, 100, 150].map(m => (
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
                <div className="flex flex-col gap-2 pt-1">
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
                        const text = `Розрахунок замовлення: ${category}\nНаклад: ${quantity} шт\nСобівартість: ${calculatedOps.subtotal.toFixed(2)} грн\nМаржа: ${marginPercent}%\nЦіна для клієнта: ${calculatedOps.finalPrice.toFixed(2)} грн (${calculatedOps.unitPrice.toFixed(2)} грн/шт)\nДрукарня "Едельвейс і К"`;
                        navigator.clipboard.writeText(text);
                        alert('Специфікацію та ціну скопійовано для клієнта!');
                      }} 
                      className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors text-center"
                    >
                      Копіювати КП
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

      {/* Production Work Order Passport - Exact match to physical print shop work order (media_1788270931536.png) */}
      {showInvoice && (() => {
        const clientDisplayName = isNewClientMode && customClientName.trim()
          ? customClientName.trim()
          : (activeClient?.name || 'Замовник');
        
        const isWide = mainCategoryTab === 'wide';
        const isDig = mainCategoryTab === 'digital';
        const isRoll = mainCategoryTab === 'roll';
        const isOffset = mainCategoryTab === 'offset';

        // 1. Material Name
        const wideMatRatesMap: Record<string, { label: string; sqmPrice: number }> = {
          frontlit_440: { label: 'Банер Frontlit 440 ламінований', sqmPrice: 220 },
          frontlit_510: { label: 'Банер Frontlit 510 литий (міцний)', sqmPrice: 290 },
          blockout_510: { label: 'Банер Blockout 510 двосторонній', sqmPrice: 380 },
          mesh_banner: { label: 'Банерна сітка Mesh з підкладкою', sqmPrice: 260 },
          backlit_510: { label: 'Банер Backlit 510 для лайтбоксів', sqmPrice: 340 },
          oracal_matte: { label: 'Плівка ORAJET матова біла', sqmPrice: 240 },
          oracal_gloss: { label: 'Плівка ORAJET глянцева біла', sqmPrice: 240 },
          oracal_clear: { label: 'Плівка ORAJET прозора', sqmPrice: 260 },
          ritrama_matte: { label: 'Плівка Ritrama перманентна', sqmPrice: 220 },
          one_way_vision: { label: 'Перфорована плівка One Way Vision', sqmPrice: 390 },
          translucent: { label: 'Транслюцентна плівка для світлових вивісок', sqmPrice: 360 },
          car_cast: { label: 'Автомобільна лита плівка Cast', sqmPrice: 580 },
          citylight_150: { label: 'Папір Citylight 150г просвітний', sqmPrice: 160 },
          blueback_115: { label: 'Папір Blueback 115г для бігбордів', sqmPrice: 110 },
          photo_satin_200: { label: 'Фотопапір Satin 200г', sqmPrice: 310 },
          photo_gloss_220: { label: 'Фотопапір Gloss 220г', sqmPrice: 330 },
          pvc_3mm: { label: 'ПВХ пластик 3 мм + друк', sqmPrice: 680 },
          pvc_4mm: { label: 'ПВХ пластик 4 мм + друк', sqmPrice: 790 },
          pvc_5mm: { label: 'ПВХ пластик 5 мм + друк', sqmPrice: 890 },
          pvc_8mm: { label: 'ПВХ пластик 8 мм + друк', sqmPrice: 1250 },
          pvc_10mm: { label: 'ПВХ пластик 10 мм + друк', sqmPrice: 1480 },
          foam_5mm: { label: 'Пінокартон білий 5 мм', sqmPrice: 620 },
          foam_10mm: { label: 'Пінокартон білий 10 мм', sqmPrice: 780 },
          foam_black_5mm: { label: 'Пінокартон чорний 5 мм', sqmPrice: 840 },
          comp_white_3mm: { label: 'Композит білий 3 мм', sqmPrice: 1350 },
          comp_silver_3mm: { label: 'Композит срібло браш 3 мм', sqmPrice: 1550 },
          comp_black_3mm: { label: 'Композит чорний 3 мм', sqmPrice: 1450 },
          comp_gold_3mm: { label: 'Композит золото браш 3 мм', sqmPrice: 1600 },
          acryl_clear_3mm: { label: 'Акрил прозорий 3 мм', sqmPrice: 1650 },
          acryl_clear_5mm: { label: 'Акрил прозорий 5 мм', sqmPrice: 2200 },
          acryl_milky_3mm: { label: 'Акрил молочний 3 мм', sqmPrice: 1750 },
          acryl_black_3mm: { label: 'Акрил чорний глянець 3 мм', sqmPrice: 1850 },
          canvas_cotton_380: { label: 'Натуральне бавовняне полотно 380г', sqmPrice: 580 },
          canvas_synthetic_280: { label: 'Синтетичне полотно 280г', sqmPrice: 420 },
          canvas_gloss_350: { label: 'Глянцеве фотополотно 350г', sqmPrice: 510 },
          stand_banner_440: { label: 'Стенд + Frontlit 440г', sqmPrice: 750 },
          stand_banner_510: { label: 'Стенд + Blockout 510г', sqmPrice: 890 },
          stand_pp_film: { label: 'Стенд + PP Film без загину', sqmPrice: 1050 },
        };

        const matNameDisplay = isWide 
          ? (wideMatRatesMap[wideSelectedMaterials[0]]?.label || 'Банер Frontlit 440 ламінований')
          : isDig
          ? `Крейдований ${digitalSelectedMaterials[0] || '350'} г/м²`
          : isRoll
          ? `Самоклейка Raflatac (${rollMaterial})`
          : (selectedSheetCalc ? selectedSheetCalc.matName : (paperType === 'offset' ? 'Офсетний 70г' : 'Крейдований 130г'));
        
        // 2. Format / Size
        const formatDisplay = isWide
          ? `${wideWidth} × ${wideHeight} ${wideUnit}`
          : isRoll
          ? `${rollWidth} × ${rollHeight} мм`
          : `${sheetCustomWidth} × ${sheetCustomHeight} ${sheetUnit}`;

        // 3. Quantity / Tirazh
        const wideTirVal = selectedSheetCalc?.tirazh || (typeof quantity === 'number' ? quantity : parseInt(quantity) || 1);
        const tirazhDisplay = isWide
          ? wideTirVal
          : isRoll
          ? (rollQuantity || 1000)
          : (selectedSheetCalc ? selectedSheetCalc.tirazh : (Number(quantity) || 1000));

        // 4. Colors / Resolution
        const colStrDisplay = isWide
          ? `${wideSelectedResolutions[0] || '1440'} dpi`
          : isDig
          ? (digitalSelectedPrints[0] || '4+0')
          : isRoll
          ? '4+0 (CMYK)'
          : (selectedSheetCalc ? selectedSheetCalc.colStr : colors);

        // 5. Turn / Imposition
        const turnLabelDisplay = isWide
          ? '1 сторона (б/о)'
          : isRoll
          ? 'Рулон'
          : (turnType === 'sam_na_sebe' ? 'с/с' : turnType === 'bez_oborotu' ? 'б/о' : 'ч/о');

        // 6. Equipment
        const machineName = isWide
          ? 'Широкоформатний плотер Flora / Mimaki'
          : isDig
          ? 'Цифрова машина Konica Minolta 7090'
          : isRoll
          ? 'Флексографічна лінія Mark Andy'
          : 'Офсетна машина Heidelberg PM 52-4';

        // 7. Area & Sheets calculation
        const wideAreaM2 = isWide
          ? ((Number(wideWidth || 2000) * Number(wideHeight || 1000)) / (wideUnit === 'mm' ? 1000000 : wideUnit === 'cm' ? 10000 : 1)) * wideTirVal
          : 0;
        
        const fit1 = Math.floor(450 / (parseFloat(sheetCustomWidth) || 210)) * Math.floor(320 / (parseFloat(sheetCustomHeight) || 297));
        const fit2 = Math.floor(450 / (parseFloat(sheetCustomHeight) || 297)) * Math.floor(320 / (parseFloat(sheetCustomWidth) || 210));
        const itemsPerSheetCalc = isWide ? 1 : isRoll ? 1 : Math.max(1, fit1, fit2);
        const physSheetsCalc = isWide 
          ? `${wideAreaM2.toFixed(2)} м²`
          : isRoll 
          ? `${Math.round(((rollQuantity || 1000) * (parseFloat(rollHeight) || 25 + 4)) / 1000)} м.п.`
          : `${Math.ceil(tirazhDisplay / itemsPerSheetCalc)} арк.`;

        const priladkaCalc = isWide ? '0.5 м.п.' : isDig ? '2 арк.' : isRoll ? '15 м.п.' : (turnType === 'sam_na_sebe' ? '30 арк.' : turnType === 'chuzhyi_oborut' ? '50 арк.' : '20 арк.');
        const wasteCalc = isWide ? '5%' : isDig ? '2 арк.' : isRoll ? '10 м.п.' : `${Math.max(10, Math.ceil((typeof physSheetsCalc === 'number' ? physSheetsCalc : 100) * 0.04))} арк.`;

        const totalInPrintCalc = isWide
          ? `${(wideAreaM2 * 1.05).toFixed(2)} м²`
          : isRoll
          ? `${Math.round(((rollQuantity || 1000) * (parseFloat(rollHeight) || 25 + 4)) / 1000 + 25)} м.п.`
          : isDig
          ? `${parseInt(physSheetsCalc) + 4} арк.`
          : `${parseInt(physSheetsCalc) + parseInt(priladkaCalc) + parseInt(wasteCalc)} арк.`;

        // 8. Financials
        const livePrice = selectedSheetCalc 
          ? Math.round(selectedSheetCalc.rawCost * (marginPercent / 100))
          : calculatedOps.finalPrice;

        const prodTitle = customTitleMap[mainCategoryTab] || name || (
          isWide 
            ? `Банер (${matNameDisplay}) ${formatDisplay}`
            : isDig
            ? `Цифровий друк ${formatDisplay}`
            : isRoll
            ? `Рулонна етикетка ${formatDisplay}`
            : `Бланки ${formatDisplay}`
        );

        let postOpIndex = 1;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-none border-2 border-black max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Top Action Bar */}
              <div className="px-5 py-3 border-b border-black flex items-center justify-between bg-slate-100">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-black" />
                  <h3 className="text-xs font-black uppercase text-black m-0 tracking-wider">Технологічний наряд № {orderNumber}</h3>
                </div>
                <button onClick={() => setShowInvoice(false)} className="text-black hover:bg-black hover:text-white px-2 py-0.5 border border-black font-bold text-xs transition-colors">✕ Закрити</button>
              </div>
              
              {/* Printable Monochrome Document Container */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 max-h-[78vh] bg-white text-black font-sans text-xs" id="invoice-preview-container">
                
                {/* 1. Header Block matching physical work order (media_1788270931536.png) */}
                <div className="border border-black p-3 mb-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left info column */}
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <div className="flex">
                        <span className="w-32 font-bold text-slate-700">№ наряду:</span>
                        <strong className="font-mono font-black text-black text-xs">{orderNumber}</strong>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold text-slate-700">Замовник:</span>
                        <strong className="font-bold text-black">{clientDisplayName}</strong>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold text-slate-700">Продукція:</span>
                        <strong className="font-bold text-black">{prodTitle}</strong>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold text-slate-700">Тираж:</span>
                        <strong className="font-mono font-black text-black">{tirazhDisplay} шт.</strong>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold text-slate-700">Дата приема:</span>
                        <span className="font-semibold text-black">{new Date().toLocaleDateString('uk-UA')}</span>
                        <span className="ml-4 font-bold text-slate-700">Сдачи:</span>
                        <span className="ml-2 font-semibold text-black">1-2 дні</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold text-slate-700">Менеджер:</span>
                        <span className="font-semibold text-black">Менеджер</span>
                      </div>
                      <div className="flex pt-1 border-t border-slate-300">
                        <span className="w-32 font-bold text-slate-700">Разом вартість:</span>
                        <strong className="font-mono font-black text-black">{livePrice.toFixed(2)} грн.</strong>
                      </div>
                    </div>

                    {/* Right materials column */}
                    <div className="border-l border-slate-300 pl-4 flex flex-col justify-between text-[11px]">
                      <div>
                        <span className="font-black uppercase tracking-wider block mb-1.5 text-black">Материалы:</span>
                        <div className="flex justify-between items-center py-1 border-b border-slate-200">
                          <span className="text-slate-800 font-semibold">{matNameDisplay}</span>
                          <span className="font-mono font-bold text-black">К-сть: {physSheetsCalc}</span>
                        </div>
                      </div>
                      <div className="text-slate-500 text-[10px] italic">
                        * Відвантаження сировини зі складу згідно технологічних норм приладки та відходів.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Таблиця «ДРУК (ОБЛАДНАННЯ ТА СПУСК)» (ДРУК) */}
                <div className="mb-4">
                  <h4 className="text-[11px] font-black uppercase text-black m-0 mb-1 tracking-wider">ДРУК (ОБЛАДНАННЯ ТА СПУСК)</h4>
                  <table className="w-full border-collapse border border-black text-[10.5px] text-center">
                    <thead>
                      <tr className="bg-slate-100 border-b border-black text-black font-bold">
                        <th className="p-1.5 border-r border-black w-8">№ п/п</th>
                        <th className="p-1.5 border-r border-black text-left">Обладнання</th>
                        <th className="p-1.5 border-r border-black text-left">Папір / Матеріал</th>
                        <th className="p-1.5 border-r border-black">Розмір, мм</th>
                        <th className="p-1.5 border-r border-black">Кольоровість</th>
                        <th className="p-1.5 border-r border-black">Вихід на листі</th>
                        <th className="p-1.5 border-r border-black">Наклад листів</th>
                        <th className="p-1.5 border-r border-black">Приладка</th>
                        <th className="p-1.5 border-r border-black">Техвідходи</th>
                        <th className="p-1.5 border-r border-black font-black">Фактично в друк</th>
                        <th className="p-1.5">Оборот (с/с, б/о, ч/о)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="p-1.5 border-r border-black font-mono">1</td>
                        <td className="p-1.5 border-r border-black text-left font-bold text-black">{machineName}</td>
                        <td className="p-1.5 border-r border-black text-left text-slate-800">{matNameDisplay}</td>
                        <td className="p-1.5 border-r border-black font-mono">{formatDisplay}</td>
                        <td className="p-1.5 border-r border-black font-bold text-black">{colStrDisplay}</td>
                        <td className="p-1.5 border-r border-black font-mono">{itemsPerSheetCalc}</td>
                        <td className="p-1.5 border-r border-black font-mono">{physSheetsCalc}</td>
                        <td className="p-1.5 border-r border-black font-mono">{priladkaCalc}</td>
                        <td className="p-1.5 border-r border-black font-mono">{wasteCalc}</td>
                        <td className="p-1.5 border-r border-black font-mono font-black text-black">{totalInPrintCalc}</td>
                        <td className="p-1.5 font-bold text-black">{turnLabelDisplay}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Таблиця «ДОДРУКАРСЬКИЙ ПРОЦЕС» */}
                <div className="mb-4">
                  <h4 className="text-[11px] font-black uppercase text-black m-0 mb-1 tracking-wider">ДОДРУКАРСЬКИЙ ПРОЦЕС</h4>
                  <table className="w-full border-collapse border border-black text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-black text-black font-bold text-left">
                        <th className="p-1.5 border-r border-black w-10 text-center">№ п/п</th>
                        <th className="p-1.5 border-r border-black">Операція</th>
                        <th className="p-1.5 text-center w-36">Кількість операцій</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="p-1.5 text-center border-r border-black font-mono">1</td>
                        <td className="p-1.5 border-r border-black font-semibold text-black">
                          {isWide ? 'RIP растровка макету та калібрування профілю друку' : isRoll ? 'Підготовка макету та виготовлення флексоформи' : `Перевірка макету, калібрування та спуск смуг (${formatDisplay})`}
                        </td>
                        <td className="p-1.5 text-center font-mono font-bold">1 спуск</td>
                      </tr>
                      {isOffset && (
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">2</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">Виведення офсетних CTP форм / термопластин</td>
                          <td className="p-1.5 text-center font-mono font-bold">{colors === '4+4' ? (turnType === 'sam_na_sebe' ? 4 : 8) : colors === '4+0' ? 4 : 2} пластин</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 4. Таблиця «ПІСЛЯДРУКАРСЬКИЙ ПРОЦЕС ТА УПАКОВКА» */}
                <div className="mb-4">
                  <h4 className="text-[11px] font-black uppercase text-black m-0 mb-1 tracking-wider">ПІСЛЯДРУКАРСЬКИЙ ПРОЦЕС ТА УПАКОВКА</h4>
                  <table className="w-full border-collapse border border-black text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-black text-black font-bold text-left">
                        <th className="p-1.5 border-r border-black w-8 text-center">№ п/п</th>
                        <th className="p-1.5 border-r border-black">Операція</th>
                        <th className="p-1.5 border-r border-black text-center w-28">Кількість операцій</th>
                        <th className="p-1.5 border-r border-black text-center w-28">Прізвище</th>
                        <th className="p-1.5 border-r border-black text-center w-20">Час</th>
                        <th className="p-1.5 border-r border-black text-center w-28">Прізвище</th>
                        <th className="p-1.5 text-center w-20">Час</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Cutting / Trimming */}
                      <tr className="border-b border-slate-300">
                        <td className="p-1.5 text-center border-r border-black font-mono">{postOpIndex++}</td>
                        <td className="p-1.5 border-r border-black font-semibold text-black">
                          {isWide ? 'Порізка по периметру (чистий обріз в габарит)' : `Порізка в готовий розмір (${formatDisplay})`}
                        </td>
                        <td className="p-1.5 text-center border-r border-black font-mono font-bold">{tirazhDisplay} шт</td>
                        <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                        <td className="p-1.5 border-r border-black text-center text-slate-400">__:__</td>
                        <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                        <td className="p-1.5 text-center text-slate-400">__:__</td>
                      </tr>

                      {/* Wide Grommets */}
                      {isWide && wideLuvers !== 'none' && (
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">{postOpIndex++}</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">
                            Встановлення люверсів ({wideLuvers === '30cm' ? 'кожні 30 см' : wideLuvers === '50cm' ? 'кожні 50 см' : 'по 4 кутах'})
                          </td>
                          <td className="p-1.5 text-center border-r border-black font-mono font-bold">
                            {wideLuvers === 'corners' ? 4 * tirazhDisplay : Math.round(((2 * (Number(wideWidth || 2000) + Number(wideHeight || 1000))) / (wideUnit === 'mm' ? 1000 : 1)) / (wideLuvers === '30cm' ? 0.3 : 0.5)) * tirazhDisplay} шт
                          </td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">__:__</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 text-center text-slate-400">__:__</td>
                        </tr>
                      )}

                      {/* Wide Hemming */}
                      {isWide && wideHemming !== 'none' && (
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">{postOpIndex++}</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">
                            Проварка / підгин краю ({wideHemming === 'perimeter' ? 'по периметру' : 'верх і низ'})
                          </td>
                          <td className="p-1.5 text-center border-r border-black font-mono font-bold">
                            {((2 * (Number(wideWidth || 2000) + Number(wideHeight || 1000))) / (wideUnit === 'mm' ? 1000 : 1) * tirazhDisplay).toFixed(1)} м.п.
                          </td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">__:__</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 text-center text-slate-400">__:__</td>
                        </tr>
                      )}

                      {/* Offset/Dig Postpress operations */}
                      {!isWide && postCorners !== '0' && (
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">{postOpIndex++}</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">Скруглення кутів ({postCorners} кути)</td>
                          <td className="p-1.5 text-center border-r border-black font-mono font-bold">{tirazhDisplay} шт</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">__:__</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 text-center text-slate-400">__:__</td>
                        </tr>
                      )}

                      {!isWide && postFolding !== '0' && (
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">{postOpIndex++}</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">Фальцювання (згинання)</td>
                          <td className="p-1.5 text-center border-r border-black font-mono font-bold">{tirazhDisplay} шт</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">__:__</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 text-center text-slate-400">__:__</td>
                        </tr>
                      )}

                      {!isWide && postCreasing !== '0' && (
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">{postOpIndex++}</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">Біговка ({postCreasing} біги)</td>
                          <td className="p-1.5 text-center border-r border-black font-mono font-bold">{tirazhDisplay * parseInt(postCreasing)} бігів</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">__:__</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                          <td className="p-1.5 text-center text-slate-400">__:__</td>
                        </tr>
                      )}

                      {/* Packaging */}
                      <tr className="border-b border-slate-300">
                        <td className="p-1.5 text-center border-r border-black font-mono">{postOpIndex++}</td>
                        <td className="p-1.5 border-r border-black font-semibold text-black">
                          {isWide ? 'Упаковка в рулон / захисну стрейч-плівку' : `Фасування та пакування продукції (${postPackingText.trim() || 'стандартна упаковка'})`}
                        </td>
                        <td className="p-1.5 text-center border-r border-black font-mono font-bold">
                          {isWide ? `${tirazhDisplay} шт` : (postPackingText.trim() ? `${Math.ceil(tirazhDisplay / (parseInt(postPackingText.replace(/\D/g, '')) || 100))} пачок` : '1 тираж')}
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                        <td className="p-1.5 border-r border-black text-center text-slate-400">__:__</td>
                        <td className="p-1.5 border-r border-black text-center text-slate-400">________</td>
                        <td className="p-1.5 text-center text-slate-400">__:__</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Modal Bottom Buttons */}
              <div className="px-5 py-3 bg-slate-100 border-t border-black flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-black bg-white hover:bg-slate-200 text-black text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Друк на принтері</span>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowInvoice(false)} className="px-4 py-2 border border-black bg-white hover:bg-slate-200 text-black text-xs font-bold transition-colors">Закрити</button>
                  <button onClick={generatePDF} className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5">
                    <Download size={14} />
                    <span>Завантажити PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Save Template Modal - Native CRM Design Style */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveAsTemplate} 
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <LayoutTemplate size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Зберегти розрахунок як шаблон</h3>
                  <p className="text-xs text-slate-500 m-0">Збережіть параметри замовлення для швидкого повторного розрахунку</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowTemplateModal(false)} 
                className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Назва шаблону <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-blue-600 font-medium">Синхронізовано з розрахунком</span>
                </div>
                <input 
                  required 
                  placeholder="Введіть назву шаблону..." 
                  value={templateName} 
                  onChange={(e) => setTemplateName(e.target.value)} 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs" 
                />
              </div>

              {/* Order Specs Preview Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Виріб:</span>
                  <strong className="text-slate-800 font-bold">{category === 'Бланки' ? subCategory : (category as string)}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Тираж:</span>
                  <strong className="text-slate-800 font-bold font-mono">{quantity} шт.</strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Шаблон буде збережено в базі CRM
              </span>
              <div className="flex items-center gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setShowTemplateModal(false)} 
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Save size={14} />
                  <span>Зберегти шаблон</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

            {/* Material & Postpress Prices Modal */}
      {showMaterialPricesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Прайс-лист: Ціни на матеріали та послуги</h3>
                  <p className="text-xs text-slate-500 m-0">Базові тарифи підприємства на папір, друк та післядрукарські операції</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowMaterialPricesModal(false)} 
                className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Switcher */}
            <div className="px-6 pt-3 pb-0 bg-slate-50/80 border-b border-slate-200/80 flex gap-2 overflow-x-auto">
              {[
                { id: 'paper', label: '📄 Папір та матеріали' },
                { id: 'postpress', label: '✂️ Післядрукарська обробка' },
                { id: 'print', label: '🖨️ Друк та CTP-форми' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMaterialPricesTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    materialPricesTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form Content */}
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                updateNorms(tempNorms); 
                setShowMaterialPricesModal(false); 
                alert('Ціни та тарифи успішно збережено!'); 
              }} 
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="p-6 overflow-y-auto flex flex-col gap-4">
                {materialPricesTab === 'paper' && (
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Базова вартість паперу (за еквівалент А1 / розрахунковий лист):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Офсетний 70г (грн)</label>
                        <input type="number" step="any" value={tempNorms.paperOffsetPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperOffsetPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Газетний 45г (грн)</label>
                        <input type="number" step="any" value={tempNorms.paperGazetkaPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperGazetkaPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Крейдований 130г (грн)</label>
                        <input type="number" step="any" value={tempNorms.paperCoatedPrice} onChange={(e) => setTempNorms({ ...tempNorms, paperCoatedPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block pt-2 border-t border-slate-100">
                      Довідкові розцінки на асортимент паперів у калькуляторі:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { name: 'Офсет 65г', price: '0.95×' },
                        { name: 'Офсет 70г', price: '1.00×' },
                        { name: 'Офсет 80г', price: '1.05×' },
                        { name: 'Офсет 100г', price: '1.18×' },
                        { name: 'Офсет 120г', price: '1.30×' },
                        { name: 'Офсет 160г', price: '1.50×' },
                        { name: 'Газетка 45г', price: '0.90×' },
                        { name: 'Самокопірка 55г', price: '1.60×' },
                        { name: 'Крейда МАТ 90г', price: '1.10×' },
                        { name: 'Крейда МАТ 115г', price: '1.15×' },
                        { name: 'Крейда МАТ 130г', price: '1.20×' },
                        { name: 'Крейда МАТ 150г', price: '1.30×' },
                        { name: 'Крейда МАТ 250г', price: '1.60×' },
                        { name: 'Крейда МАТ 350г', price: '1.95×' },
                        { name: 'Крафт 70г', price: '1.25×' },
                        { name: 'Льон 300г', price: '3.20×' }
                      ].map(p => (
                        <div key={p.name} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                          <span className="text-slate-600 font-medium">{p.name}:</span>
                          <strong className="text-slate-900 font-mono font-bold">{p.price}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {materialPricesTab === 'postpress' && (
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Тарифи на післядрукарські операції (грн / виріб або операцію):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Мат ламінація (грн / м²)</label>
                        <input type="number" step="any" value={tempNorms.laminationMattePrice} onChange={(e) => setTempNorms({ ...tempNorms, laminationMattePrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Глянець ламінація (грн / м²)</label>
                        <input type="number" step="any" value={tempNorms.laminationGlossyPrice} onChange={(e) => setTempNorms({ ...tempNorms, laminationGlossyPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Біговка (згин) (грн)</label>
                        <input type="number" step="any" value={tempNorms.foldingPrice} onChange={(e) => setTempNorms({ ...tempNorms, foldingPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Висічка штампом (грн)</label>
                        <input type="number" step="any" value={tempNorms.dieCuttingPrice} onChange={(e) => setTempNorms({ ...tempNorms, dieCuttingPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Складне тиснення (грн)</label>
                        <input type="number" step="any" value={tempNorms.embossingPrice} onChange={(e) => setTempNorms({ ...tempNorms, embossingPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Вставка блока / шиття (грн)</label>
                        <input type="number" step="any" value={tempNorms.blockInsertionPrice} onChange={(e) => setTempNorms({ ...tempNorms, blockInsertionPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Виготовлення кришки (грн)</label>
                        <input type="number" step="any" value={tempNorms.coverMakingPrice} onChange={(e) => setTempNorms({ ...tempNorms, coverMakingPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Порізка на пачку (грн)</label>
                        <input type="number" step="any" value={tempNorms.cuttingRate} onChange={(e) => setTempNorms({ ...tempNorms, cuttingRate: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                    </div>
                  </div>
                )}

                {materialPricesTab === 'print' && (
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Вартість форм та друкарських приладок:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Виготовлення форм CTP (грн / шт)</label>
                        <input type="number" step="any" value={tempNorms.formMakingPrice} onChange={(e) => setTempNorms({ ...tempNorms, formMakingPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Монтаж та приладка плівок (грн)</label>
                        <input type="number" step="any" value={tempNorms.filmMountingPrice} onChange={(e) => setTempNorms({ ...tempNorms, filmMountingPrice: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block pt-2 border-t border-slate-100">
                      Вартість фарбовідбитків за машино-прогін:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                        <span className="text-slate-600 font-medium">1+0 (однокол.):</span>
                        <strong className="text-slate-900 font-mono font-bold">0.20 ₴/відб</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                        <span className="text-slate-600 font-medium">1+1 (двокол.):</span>
                        <strong className="text-slate-900 font-mono font-bold">0.35 ₴/відб</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                        <span className="text-slate-600 font-medium">4+0 (повнокол.):</span>
                        <strong className="text-slate-900 font-mono font-bold">0.35 ₴/відб</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                        <span className="text-slate-600 font-medium">4+4 (двостор.):</span>
                        <strong className="text-slate-900 font-mono font-bold">0.70 ₴/відб</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Зміни будуть автоматично застосовані у всіх калькуляторах
                </span>
                <div className="flex items-center gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setShowMaterialPricesModal(false)} 
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                  >
                    Скасувати
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Зберегти ціни</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
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
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Виготовлення кришки</label>
                    <input type="number" step="any" value={tempNorms.coverMakingPrice} onChange={(e) => setTempNorms({ ...tempNorms, coverMakingPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Обробка блока</label>
                    <input type="number" step="any" value={tempNorms.blockProcessingPrice} onChange={(e) => setTempNorms({ ...tempNorms, blockProcessingPrice: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
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

