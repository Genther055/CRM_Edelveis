export type UserRole = 'admin' | 'manager' | 'operator';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface ClientSection {
  id: string;
  name: string;
  customFields: { name: string; type: 'number' | 'text' }[];
  statuses: string[];
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  discount: number; // % discount
  city?: string;    // City, defaults to "Вінниця"
  tags?: string[];  // Теги для категоризації
  files?: string[]; // Блок "Файли"
  type?: 'lead' | 'client'; // Можливість відносити до лідів або клієнтів
  sectionId?: string; // Прив'язка до користувацького розділу контрагентів
  sectionStatus?: string; // Статус у цьому розділі
  sectionFieldValues?: Record<string, string | number>;
}

export interface WarehouseLogEntry {
  id: string;
  date: string;
  employee: string;
  quantity: number;
  dealId?: string;
  dealName?: string;
}

export interface Material {
  id: string;
  name: string;
  type: 'offset' | 'gazetka' | 'coated';
  quantity: number; // in A1 parent sheets or units
  reserved: number; // in A1 parent sheets or units
  unit: string;
  price?: number;    // Закупівельна ціна за одиницю (грн)
  supplier?: string; // Постачальник
  minStock?: number; // Мінімально допустимий залишок (для сповіщень)
  location?: string; // Розташування на складі (стелаж/шафа)
  salesLog?: WarehouseLogEntry[]; // Журнал продажів товарів
}

export interface DeliveryItem {
  id: string;
  dealId: string;
  clientName: string;
  address: string;
  ttnNumber: string;
  status: 'created' | 'in_transit' | 'arrived' | 'received' | 'refused'; // Статуси Нової Пошти
  date: string;
  deliveryType: 'nova_poshta' | 'system'; // 'system' = Системна доставка
  npAccountId?: string; // Прив'язка до одного з акаунтів Нової Пошти
  courierName?: string; // Ім'я кур'єра
  deliveryTime?: string; // Час доставки
  notes?: string;
}

export interface CustomField {
  id: string;
  name: string; // Назва поля
  type: 'number' | 'text' | 'formula';
  formulaExpression?: string; // Вираз, наприклад: "{Ширина} * {Висота} * 0.05"
}

export interface AutoPaymentTrigger {
  id: string;
  dealStage: string;
  category: string;
  wallet: string;
  percentage: number;
  active: boolean;
}

export interface Order {
  id: string;
  name: string;
  clientId: string;
  category: string;
  quantity: number;
  packingCount: number;
  paperType: 'offset' | 'gazetka' | 'coated';
  colors: string;
  isSamNaSebe: boolean;
  designCost: number;
  margin: number;
  machine: string;
  format: string;
  physicalSheets: number;
  itemsPerSheet: number;
  subtotal: number;
  marginAmount: number;
  finalPrice: number;
  unitPrice: number;
  status: 'design' | 'print_queue' | 'printing' | 'post_press' | 'ready';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  prepayment: number;
  createdAt: string;
  createdBy: string;
  notes?: string; // Додатковий опис специфікації для виробництва
  paperName?: string; // Назва матеріалу (напр. 'Крейдований 130г/м²')
  sheetSize?: string; // Розмір друкарського листа (напр. '310 × 440 мм')
  turnTypeLabel?: string; // Оборот спуску (напр. 'Сам на себе (с/с)')
  priladkaSheets?: number; // Листи на приладку
  techWasteSheets?: number; // Технічні відходи
  totalGrossSheets?: number; // Фактично в друк
  platesCount?: number; // Кількість форм CTP
  postpressOps?: Array<{ name: string; qty: string; time?: string; worker?: string }>; // Післядрукарські операції для цеху
  packingInfo?: string; // Інформація про фасування та пакування
  deadline?: string; // Термін здачі
  ttnNumber?: string;
  ttnStatus?: 'created' | 'in_transit' | 'arrived' | 'received' | 'refused';
  customFieldValues?: Record<string, string | number>; // Значення користувацьких полів
  stageChangedAt?: Record<string, string>; // SLA - таймінг кожного етапу
  totalMarkupPercent?: number; // Націнка на загальну суму замовлення
  isImportant?: boolean; // Відмітка для важливих угод (VIP)
}

export interface Norms {
  paperOffsetPrice: number;   // Price per A1 sheet equivalent
  paperGazetkaPrice: number;  // Price per A1 sheet equivalent
  paperCoatedPrice: number;   // Price per A1 sheet equivalent
  cuttingRate: number;        // Cost per cut per item
  packingRate: number;        // Cost per pack
  designStandard: number;     // Standard design fee
  designSamNaSebe: number;    // "Sam na sebe" design fee
  formMakingPrice: number;    // Виготовлення форм
  filmMountingPrice: number;  // Монтаж плівок
  laminationMattePrice: number; // Ламінування матове
  laminationGlossyPrice: number; // Ламінування глянцеве
  embossingPrice: number;     // Тиснення складне
  dieCuttingPrice: number;    // Висічка
  foldingPrice: number;       // Біговка / фальцювання
  blockInsertionPrice: number; // Вставка блока
  coverMakingPrice: number;   // Виготовлення кришки
  blockProcessingPrice: number; // Обробка блока
  printRates: {
    rizograph: number;        // Cost per print sheet (A3)
    option1: number;          // Cost per print sheet (A3)
    option2: number;          // Cost per print sheet (A2)
    planeta: number;          // Cost per print sheet (A1)
  };
}
