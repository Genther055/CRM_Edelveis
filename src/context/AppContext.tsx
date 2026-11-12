import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  User, 
  UserRole, 
  Client, 
  Material, 
  Order, 
  Norms, 
  DeliveryItem, 
  CustomField, 
  AutoPaymentTrigger, 
  ClientSection,
  TaskItem,
  NoteItem,
  NoteReply,
  Lead,
  WarehouseMovement,
  WarehouseMovementType,
  WalletAccount,
  FinanceEntry
} from '../types';
import { isUserBlocked } from '../utils/security';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  materials: Material[];
  orders: Order[];
  norms: Norms;
  deliveries: DeliveryItem[];
  customFields: CustomField[];
  autoPaymentTriggers: AutoPaymentTrigger[];
  clientSections: ClientSection[];
  smsTemplates: { id: string; name: string; text: string }[];
  transitionMatrix: Record<string, string[]>;
  stageDurations: Record<string, number>; // SLA hours limits
  novaPoshtaAccounts: string[];
  tasks: TaskItem[];
  notes: NoteItem[];
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id'> & { id?: string }) => Lead;
  updateLead: (lead: Lead) => void;
  deleteLead: (leadId: string) => void;
  updateLeadStatus: (leadId: string, status: Lead['status']) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (client: Client) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'createdBy' | 'status'> & { id?: string }) => Order;
  updateOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderPayment: (orderId: string, paymentStatus: Order['paymentStatus'], prepayment: number) => void;
  updateNorms: (norms: Norms) => void;
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterialStock: (materialId: string, quantity: number) => void;
  updateMaterialSalesLog: (materialId: string, salesLog: any[]) => void;
  addDelivery: (delivery: Omit<DeliveryItem, 'id'>) => void;
  updateDelivery: (delivery: DeliveryItem) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryItem['status']) => void;
  addCustomField: (field: Omit<CustomField, 'id'>) => void;
  deleteCustomField: (fieldId: string) => void;
  addAutoPaymentTrigger: (trigger: Omit<AutoPaymentTrigger, 'id'>) => void;
  deleteAutoPaymentTrigger: (triggerId: string) => void;
  addClientSection: (section: Omit<ClientSection, 'id'>) => void;
  deleteClientSection: (sectionId: string) => void;
  addSmsTemplate: (template: { name: string; text: string }) => void;
  deleteSmsTemplate: (templateId: string) => void;
  updateTransitionMatrix: (matrix: Record<string, string[]>) => void;
  updateStageDurations: (durations: Record<string, number>) => void;
  addNovaPoshtaAccount: (accountName: string) => void;
  deleteNovaPoshtaAccount: (accountName: string) => void;
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => TaskItem;
  updateTask: (task: TaskItem) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  toggleTaskChecklistItem: (taskId: string, itemId: string) => void;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => void;
  editNote: (noteId: string, text: string) => void;
  deleteNote: (noteId: string) => void;
  addNoteReply: (noteId: string, text: string, author: string, authorRole?: string) => void;
  editNoteReply: (noteId: string, replyId: string, newText: string) => void;
  deleteNoteReply: (noteId: string, replyId: string) => void;
  addSystemNotification: (message: string) => void;
  notifications: string[];
  npVolumeCalcEnabled: boolean;
  setNpVolumeCalcEnabled: (val: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDbConnected: boolean;
  lastSyncedAt: Date | null;
  refreshSync: () => Promise<void>;
  warehouseMovements: WarehouseMovement[];
  recordWarehouseMovement: (params: {
    type: WarehouseMovementType;
    materialId: string;
    quantity: number;
    unitPrice?: number;
    warehouseFrom?: string;
    warehouseTo?: string;
    party?: string;
    dealId?: string;
    dealName?: string;
    reason?: string;
    createFinanceRecord?: boolean;
    financePaidImmediately?: boolean;
    walletId?: string;
  }) => void;
  reconcileWarehouseStock: (
    items: Array<{ materialId: string; actualQty: number; reason?: string }>
  ) => void;
  wallets: WalletAccount[];
  financeEntries: FinanceEntry[];
  addFinanceEntry: (
    entry: Omit<FinanceEntry, 'id' | 'user' | 'wallet'> & { wallet?: string }
  ) => FinanceEntry;
  markFinanceEntryPaid: (entryId: string) => void;
  deleteFinanceEntry: (entryId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUsers: User[] = [
  { id: '1', username: 'admin', role: 'admin', name: 'Працівник А' },
  { id: '2', username: 'manager', role: 'manager', name: 'Працівник Б' },
  { id: '3', username: 'operator', role: 'operator', name: 'Працівник В' },
  { id: 'client-guest', username: 'client', role: 'client', name: 'Клієнт друкарні' }
];

const initialClients: Client[] = [
  { 
    id: '1', 
    name: 'ТОВ «ФармаТрейд»', 
    contact: 'Олена Ковальчук', 
    phone: '+380673214567', 
    email: 'o.koval@pharmatrade.com', 
    discount: 10, 
    city: 'Київ',
    tags: ['B2B', 'VIP', 'Гурт', 'Каталоги'],
    files: ['Договір_ФармаТрейд_2026.pdf'],
    type: 'client',
    additionalContacts: [
      {
        id: 'ac_1',
        name: 'Андрій Бондаренко',
        role: 'Головний дизайнер',
        phone: '+380508889911',
        email: 'a.bondar@pharmatrade.com',
        telegram: '@andriy_design',
        viber: '+380508889911',
        notes: 'Узгоджує кольоропроби та макети буклетів'
      }
    ]
  },
  { 
    id: '2', 
    name: 'ПРАТ «ЕкоСок»', 
    contact: 'Василь Гнатюк', 
    phone: '+380934567890', 
    email: 'v.hnatyuk@ecosok.ua', 
    discount: 8, 
    city: 'Вінниця',
    tags: ['Постійний', 'Етикетки', 'Флексодрук'],
    files: ['Специфікація_ЕкоСок.pdf'],
    type: 'client'
  },
  { 
    id: '3', 
    name: 'Кафе «Капучино»', 
    contact: 'Олег Петренко', 
    phone: '+380671234567', 
    email: 'oleg.p@gmail.com', 
    discount: 5, 
    city: 'Вінниця',
    tags: ['HoReCa', 'Меню', 'Важливо'],
    files: ['Макет_меню_2026.pdf'],
    type: 'client'
  },
  { 
    id: '4', 
    name: 'Бутік «ModaLux»', 
    contact: 'Марія Бойко', 
    phone: '+380961112233', 
    email: 'm.boyko@modalux.ua', 
    discount: 12, 
    city: 'Львів',
    tags: ['Упаковка', 'Преміум', 'Шовкотрафарет'],
    files: ['Штамп_Пакет_ModaLux.pdf'],
    type: 'client'
  },
  { 
    id: '5', 
    name: 'СК «Україна»', 
    contact: 'Віктор Савченко', 
    phone: '+380503334455', 
    email: 'v.savchenko@sk-ukraine.ua', 
    discount: 15, 
    city: 'Київ',
    tags: ['Корпоративний', 'Календарі', 'VIP'],
    files: ['Договір_Календарі_2027.pdf'],
    type: 'client'
  },
  { 
    id: '6', 
    name: 'IT Компанія «SoftTech»', 
    contact: 'Андрій Кравченко', 
    phone: '+380937776655', 
    email: 'a.kravchenko@softtech.io', 
    discount: 7, 
    city: 'Дніпро',
    tags: ['Сувеніри', 'IT', 'Блокноти'],
    files: ['Брендинг_SoftTech.ai'],
    type: 'client'
  },
  { 
    id: '7', 
    name: 'Автосервіс «Гараж 777»', 
    contact: 'Ігор Шевченко', 
    phone: '+380509876543', 
    email: 'igor.auto@ukr.net', 
    discount: 0, 
    city: 'Вінниця',
    tags: ['Новий', 'Візитки'],
    files: ['Visytka_Garage.eps'],
    type: 'lead',
    additionalContacts: [
      {
        id: 'ac_71',
        name: 'Оксана Мельник',
        role: 'Головний бухгалтер',
        phone: '+380671112233',
        email: 'buh.garage777@gmail.com',
        telegram: '@oksana_buh_777',
        viber: '+380671112233',
        notes: 'Рахунки та акти виконаних робіт'
      },
      {
        id: 'ac_72',
        name: 'Дмитро Коваль',
        role: 'Майстер-приймальник',
        phone: '+380935554433',
        telegram: '@dima_service_777',
        viber: '+380935554433',
        notes: 'Замовляє сервісні книжки та наліпки'
      }
    ]
  },
  { 
    id: '8', 
    name: 'Мережа аптек «Здоров\'я»', 
    contact: 'Тетяна Бондар', 
    phone: '+380504445566', 
    email: 't.bondar@zdorovya.ua', 
    discount: 10, 
    city: 'Одеса',
    tags: ['Буклети', 'Гурт', 'Офсет'],
    files: ['Евромбуклет_Здоровя.pdf'],
    type: 'client'
  },
  { 
    id: '9', 
    name: 'Креатив Агентство', 
    contact: 'Оксана Дмитренко', 
    phone: '+380678889900', 
    email: 'o.dmytrenko@creative.com', 
    discount: 0, 
    city: 'Київ',
    tags: ['Реклама', 'Плакати', 'Широкий формат'],
    files: [],
    type: 'lead'
  },
  { 
    id: '10', 
    name: 'Адвокатське бюро «Право»', 
    contact: 'Сергій Мороз', 
    phone: '+380679998877', 
    email: 's.moroz@lawyer.ua', 
    discount: 5, 
    city: 'Харків',
    tags: ['Тиснення', 'Папки', 'Преміум'],
    files: ['Папка_Право_Золото.pdf'],
    type: 'client'
  },
  { 
    id: '11', 
    name: 'Готель «Гранд Палас»', 
    contact: 'Ольга Яковенко', 
    phone: '+380962223344', 
    email: 'reception@grandhotel.ua', 
    discount: 8, 
    city: 'Львів',
    tags: ['Готель', 'Блокноти', 'Висічка'],
    files: [],
    type: 'client'
  },
  { 
    id: '12', 
    name: 'ГО «Наш Город»', 
    contact: 'Микола Семенов', 
    phone: '+380501112233', 
    email: 'n.semenov@nashgorod.org', 
    discount: 0, 
    city: 'Вінниця',
    tags: ['Газети', 'Ротація'],
    files: [],
    type: 'lead'
  }
];

const initialMaterials: Material[] = [
  { 
    id: '1', 
    name: 'Офсетний папір 70г (A1)', 
    type: 'offset', 
    quantity: 5000, 
    reserved: 300, 
    unit: 'арк.',
    salesLog: [
      { id: '1', date: '2026-07-23', employee: 'Працівник Б', quantity: 750, dealId: '1', dealName: 'Бланки А5' }
    ]
  },
  { 
    id: '2', 
    name: 'Газетний папір 45г (A1)', 
    type: 'gazetka', 
    quantity: 8000, 
    reserved: 500, 
    unit: 'арк.',
    salesLog: [
      { id: '2', date: '2026-07-24', employee: 'Працівник А', quantity: 1000, dealId: '2', dealName: 'Флаєри еко' }
    ]
  },
  { 
    id: '3', 
    name: 'Крейдований папір 130г (A1)', 
    type: 'coated', 
    quantity: 3000, 
    reserved: 0, 
    unit: 'арк.',
    salesLog: []
  },
  { 
    id: '4', 
    name: 'Офсетний папір 80г (A1)', 
    type: 'offset', 
    quantity: 12000, 
    reserved: 1000, 
    unit: 'арк.',
    salesLog: []
  },
  { 
    id: '5', 
    name: 'Крейдований папір 250г (A1)', 
    type: 'coated', 
    quantity: 6500, 
    reserved: 400, 
    unit: 'арк.',
    salesLog: []
  },
  { 
    id: '6', 
    name: 'Крейдований папір 300г (A1)', 
    type: 'coated', 
    quantity: 4500, 
    reserved: 200, 
    unit: 'арк.',
    salesLog: []
  },
  { 
    id: '7', 
    name: 'Самоклейка Рафлатак матова (A1)', 
    type: 'coated', 
    quantity: 2800, 
    reserved: 150, 
    unit: 'арк.',
    salesLog: []
  },
  { 
    id: '8', 
    name: 'Палітурний картон 2.0мм (A1)', 
    type: 'offset', 
    quantity: 1500, 
    reserved: 0, 
    unit: 'арк.',
    salesLog: []
  },
  { 
    id: '9', 
    name: 'Тонер чорний Canon C-EXV', 
    type: 'coated', 
    quantity: 12, 
    reserved: 1, 
    unit: 'шт.',
    salesLog: []
  },
  { 
    id: '10', 
    name: 'Плівка ламінаційна матова 30мкм', 
    type: 'coated', 
    quantity: 25, 
    reserved: 2, 
    unit: 'рулон',
    salesLog: []
  },
  { 
    id: '11', 
    name: 'Пружина металева 6.4мм (біла)', 
    type: 'offset', 
    quantity: 3500, 
    reserved: 100, 
    unit: 'шт.',
    salesLog: []
  }
];

const initialNorms: Norms = {
  paperOffsetPrice: 0.30,
  paperGazetkaPrice: 0.18,
  paperCoatedPrice: 0.60,
  cuttingRate: 0.1560,
  packingRate: 1.5,
  designStandard: 50,
  designSamNaSebe: 34,
  formMakingPrice: 4.0000,
  filmMountingPrice: 3.1200,
  laminationMattePrice: 0.5750,
  laminationGlossyPrice: 0.5750,
  embossingPrice: 2.5300,
  dieCuttingPrice: 0.0390,
  foldingPrice: 0.1231,
  blockInsertionPrice: 0.5751,
  coverMakingPrice: 0.9427,
  blockProcessingPrice: 0.2617,
  printRates: {
    rizograph: 0.15,
    option1: 0.50,
    option2: 0.80,
    planeta: 1.20
  }
};

const initialOrders: Order[] = [
  {
    id: '1',
    name: 'Замовлення №1',
    clientId: '1',
    category: 'Бланки',
    quantity: 1500,
    packingCount: 2,
    paperType: 'offset',
    colors: '1+0',
    isSamNaSebe: true,
    designCost: 34,
    margin: 100,
    machine: 'Опція 1',
    format: 'A3',
    physicalSheets: 750,
    itemsPerSheet: 2,
    subtotal: 512.0,
    marginAmount: 512.0,
    finalPrice: 1024.0,
    unitPrice: 0.68,
    status: 'printing',
    paymentStatus: 'paid',
    prepayment: 1024.0,
    createdAt: '2026-07-23T14:30:00Z',
    createdBy: 'Працівник Б',
    ttnNumber: '59000845963251',
    ttnStatus: 'in_transit',
    customFieldValues: {},
    stageChangedAt: { 'design': '2026-07-23T14:30:00Z', 'print_queue': '2026-07-23T15:00:00Z', 'printing': '2026-07-23T16:00:00Z' },
    isImportant: true
  },
  {
    id: '2',
    name: 'Замовлення №2',
    clientId: '2',
    category: 'Флаєри',
    quantity: 4000,
    packingCount: 4,
    paperType: 'gazetka',
    colors: '4+0',
    isSamNaSebe: false,
    designCost: 50,
    margin: 50,
    machine: 'Опція 2',
    format: 'A2',
    physicalSheets: 1000,
    itemsPerSheet: 4,
    subtotal: 1044.0,
    marginAmount: 522.0,
    finalPrice: 1566.0,
    unitPrice: 0.39,
    status: 'design',
    paymentStatus: 'partial',
    prepayment: 800.0,
    createdAt: '2026-07-24T08:15:00Z',
    createdBy: 'Працівник А',
    ttnNumber: '59000845911223',
    ttnStatus: 'created',
    customFieldValues: {},
    stageChangedAt: { 'design': '2026-07-24T08:15:00Z' }
  }
];

const initialDeliveries: DeliveryItem[] = [
  { id: '1', dealId: '1', clientName: 'Контрагент А', address: 'м. Вінниця, Відділення №4', ttnNumber: '59000845963251', status: 'in_transit', date: '2026-07-23', deliveryType: 'nova_poshta', npAccountId: 'Основний акаунт' },
  { id: '2', dealId: '2', clientName: 'Контрагент Б', address: 'м. Вінниця, Відділення №10', ttnNumber: '59000845911223', status: 'created', date: '2026-07-24', deliveryType: 'nova_poshta', npAccountId: 'Основний акаунт' }
];

const initialCustomFields: CustomField[] = [
  { id: '1', name: 'Ширина', type: 'number' },
  { id: '2', name: 'Висота', type: 'number' },
  { id: '3', name: 'Площа', type: 'formula', formulaExpression: '{Ширина} * {Висота}' }
];

const initialTriggers: AutoPaymentTrigger[] = [
  { id: '1', dealStage: 'ready', category: 'Оплата клієнта', wallet: 'Каса', percentage: 100, active: true }
];

const defaultTransitionMatrix = {
  design: ['print_queue'],
  print_queue: ['printing', 'design'],
  printing: ['post_press', 'print_queue'],
  post_press: ['ready', 'printing'],
  ready: []
};

const defaultStageDurations = {
  design: 24,
  print_queue: 12,
  printing: 48,
  post_press: 24,
  ready: 72
};

const getTodayDateStr = () => new Date().toISOString().split('T')[0];
const getRelativeDateStr = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const initialTasksData: TaskItem[] = [
  {
    id: 'T-301',
    title: 'Зробити кольоропробу CMYK для тиражу бланків A4',
    type: 'Перевірка макета',
    deadline: getRelativeDateStr(-2), // Overdue!
    deadlineTime: '14:00',
    priority: 'high',
    assignee: 'Анна (Дизайнер)',
    checklist: [
      { id: 'c1', text: 'Завантажити файл макета у високій якості (300 dpi)', checked: true },
      { id: 'c2', text: 'Узгодити виліт 2мм з друкарем цифрової машини', checked: true },
      { id: 'c3', text: 'Отримати фінальне підтвердження від замовника по Email', checked: false }
    ],
    status: 'todo',
    createdAt: getRelativeDateStr(-3),
    clientName: 'ТОВ «ФармаТрейд»',
    dealName: 'Замовлення №31101 — Бланки А4',
    dealId: '1',
    createdBy: 'Віктор (Менеджер)',
    autoTriggered: true,
    stageTrigger: 'Підготовка документів'
  },
  {
    id: 'T-302',
    title: 'Підготувати порізку тиражу 1500 шт на гіпер-порізчику',
    type: 'Порізка',
    deadline: getTodayDateStr(), // Due Today!
    deadlineTime: '16:30',
    priority: 'medium',
    assignee: 'Іван (Палітурник)',
    checklist: [
      { id: 'c4', text: 'Перевірити наявність крейдованого паперу 130г на стелажі А', checked: true },
      { id: 'c5', text: 'Виставити стопові мітки порізу 210х297мм', checked: false }
    ],
    status: 'todo',
    createdAt: getRelativeDateStr(-1),
    clientName: 'ПРАТ «ЕкоСок»',
    dealName: 'Замовлення №1502 — Буклети',
    dealId: '2',
    createdBy: 'Працівник А (Адміністратор)',
    autoTriggered: true,
    stageTrigger: 'Склад'
  },
  {
    id: 'T-303',
    title: 'Ламінування матовою плівкою 30мкм тиражу меню',
    type: 'Друк',
    deadline: getRelativeDateStr(2), // Future
    deadlineTime: '11:00',
    priority: 'low',
    assignee: 'Сергій (Оператор)',
    checklist: [
      { id: 'c6', text: 'Прогріти рулонний ламінатор до 115°C', checked: false },
      { id: 'c7', text: 'Упакувати готовий тираж у крафт-папір для доставки', checked: false }
    ],
    status: 'todo',
    createdAt: getTodayDateStr(),
    clientName: 'Кафе «Капучино»',
    dealName: 'Замовлення №884 — Меню',
    dealId: '3',
    createdBy: 'Віктор (Менеджер)'
  },
  {
    id: 'T-304',
    title: 'Дзвінок замовнику щодо узгодження передплати 50%',
    type: 'Дзвінок',
    deadline: getRelativeDateStr(-1), // Overdue!
    deadlineTime: '18:00',
    priority: 'high',
    assignee: 'Працівник А (Адміністратор)',
    checklist: [
      { id: 'c8', text: 'Виставити рахунок-специфікацію', checked: true },
      { id: 'c9', text: 'Підтвердити надходження коштів на р/р ПриватБанку', checked: false }
    ],
    status: 'todo',
    createdAt: getRelativeDateStr(-2),
    clientName: 'ТОВ «МЕД-СЕРВІС»',
    dealName: 'Замовлення №9941 — Буклети',
    createdBy: 'Працівник А (Адміністратор)'
  }
];

const initialNotesData: NoteItem[] = [
  {
    id: 'N-101',
    targetType: 'client',
    targetId: '1',
    author: 'Віктор (Менеджер)',
    authorRole: 'Менеджер',
    text: 'Замовник просить виставити рахунок з ПДВ та надати сертифікат відповідності на папір.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    replies: [
      {
        id: 'NR-1',
        author: 'Анна (Дизайнер)',
        authorRole: 'Дизайнер',
        text: 'Сертифікат відповідності додано в теку з макетом замовлення.',
        createdAt: new Date(Date.now() - 1.5 * 86400000).toISOString()
      }
    ]
  },
  {
    id: 'N-102',
    targetType: 'deal',
    targetId: '1',
    author: 'Працівник А (Адміністратор)',
    authorRole: 'Адміністратор',
    text: 'Узгоджено терміновий друк за 24 години без додаткової націнки за умови 100% передплати.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    replies: []
  }
];


export const initialLeadsData: Lead[] = [
  {
    id: 'L-101',
    name: 'Калькуляція: Друк меню А4 для кафе "Капучино"',
    contactPerson: 'Олег Петренко',
    phone: '+380671234567',
    email: 'oleg.p@gmail.com',
    budget: 3500,
    source: 'Calculator',
    status: 'new',
    date: getTodayDateStr(),
    notes: 'Розрахунок з калькулятора: 50 меню А4 на щільному крейдованому папері 300г з матовою ламінацією 1+1.',
    tags: ['Онлайн-калькулятор', 'Меню', 'Терміново'],
    files: ['Макет_меню.pdf'],
    customFieldValues: { 'Ширина': 210, 'Висота': 297 },
    calcSpecs: {
      category: 'Меню',
      format: 'A4 (210×297 мм)',
      quantity: 50,
      material: 'Крейдований 300г',
      colors: '4+4',
      totalPrice: 3500,
      unitPrice: 70.0,
      options: 'Матова ламінація 1+1, 1 біг'
    }
  },
  {
    id: 'L-102',
    name: 'Калькуляція: Візитки преміум 1000 шт',
    contactPerson: 'Ігор Шевченко',
    phone: '+380509876543',
    email: 'igor.auto@ukr.net',
    budget: 850,
    source: 'Calculator',
    status: 'new',
    date: getRelativeDateStr(-1),
    notes: 'Розрахунок з калькулятора: Візитки 90х50 мм, 1000 шт, Крейда МАТ 350г, софт-тач ламінація.',
    tags: ['Онлайн-калькулятор', 'Візитки'],
    files: ['Visytka_Garage.eps'],
    customFieldValues: { 'Ширина': 90, 'Висота': 50 },
    calcSpecs: {
      category: 'Візитки',
      format: '90×50 мм',
      quantity: 1000,
      material: 'Крейда МАТ 350г',
      colors: '4+4',
      totalPrice: 850,
      unitPrice: 0.85,
      options: 'Soft-touch ламінація 1+1'
    }
  },
  {
    id: 'L-103',
    name: 'Друк каталогу продукції А4 (64 стор.)',
    contactPerson: 'Олена Ковальчук (ТОВ ФармаТрейд)',
    phone: '+380673214567',
    email: 'o.koval@pharmatrade.com',
    budget: 24500,
    source: 'Phone',
    status: 'negotiation',
    date: getRelativeDateStr(-2),
    notes: 'Обкладинка 250г + УФ лак, блок 115г крейда. Тираж 500 примірників. Збірка на скобу.',
    tags: ['B2B', 'Каталоги'],
    files: ['Catalog_Pharma_v2.pdf'],
    customFieldValues: { 'Ширина': 210, 'Висота': 297 }
  },
  {
    id: 'L-104',
    name: 'Самоклеючі етикетки на банки соків 10 000 шт.',
    contactPerson: 'Василь Гнатюк (ПРАТ ЕкоСок)',
    phone: '+380934567890',
    email: 'v.hnatyuk@ecosok.ua',
    budget: 18200,
    source: 'Site',
    status: 'review',
    date: getRelativeDateStr(-3),
    notes: 'Рулонний флексодрук, напівглянцевий самоклей, висічка під овальний штамп.',
    tags: ['Етикетка', 'Флексодрук'],
    files: ['Label_Juice_Apple.ai'],
    customFieldValues: { 'Ширина': 75, 'Висота': 120 }
  },
  {
    id: 'L-105',
    name: 'Картонні брендовані пакети 1 000 шт.',
    contactPerson: 'Марія Бойко (Бутік ModaLux)',
    phone: '+380961112233',
    email: 'm.boyko@modalux.ua',
    budget: 32000,
    source: 'Instagram',
    status: 'new',
    date: getRelativeDateStr(-4),
    notes: 'Крейдований папір 200г, шовкотрафаретний друк золотом, люверси та шовковий шнур.',
    tags: ['Упаковка', 'Преміум'],
    files: ['Bag_ModaLux_print.pdf'],
    customFieldValues: { 'Ширина': 250, 'Висота': 350 }
  },
  {
    id: 'L-106',
    name: 'Фірмові настінні календарі ТРІО 500 шт.',
    contactPerson: 'Віктор Савченко (СК Україна)',
    phone: '+380503334455',
    email: 'v.savchenko@sk-ukraine.ua',
    budget: 45000,
    source: 'Phone',
    status: 'contact',
    date: getRelativeDateStr(-5),
    notes: 'Верхній постер 300г з глянцевою ламінацією, 3 курсори, білі металеві пружини.',
    tags: ['Календарі', 'Новий Рік'],
    files: ['Calendar_Trio_2027.pdf'],
    customFieldValues: { 'Ширина': 297, 'Висота': 840 }
  },
  {
    id: 'L-107',
    name: 'Друк плакатів А1 для рекламної кампанії 200 шт.',
    contactPerson: 'Оксана Дмитренко (Креатив Агентство)',
    phone: '+380678889900',
    email: 'o.dmytrenko@creative.com',
    budget: 9600,
    source: 'Facebook',
    status: 'negotiation',
    date: getRelativeDateStr(-6),
    notes: "Широкоформатний інтер'єрний друк на сіті-папері 150г з високою роздільною здатністю.",
    tags: ['Плакати', 'Широкий формат'],
    files: ['Poster_A1_Promo.tif'],
    customFieldValues: { 'Ширина': 594, 'Висота': 841 }
  },
  {
    id: 'L-108',
    name: 'Блокноти А5 на пружині з логотипом 300 шт.',
    contactPerson: 'Андрій Кравченко (SoftTech)',
    phone: '+380937776655',
    email: 'a.kravchenko@softtech.io',
    budget: 14400,
    source: 'Site',
    status: 'converted',
    date: getRelativeDateStr(-7),
    notes: 'Обкладинка софт-тач, блок 50 аркушів клітинка офсет 80г, навивка на чорну пружину.',
    tags: ['Сувеніри', 'Блокноти'],
    files: ['Notebook_Cover_SoftTech.pdf'],
    customFieldValues: { 'Ширина': 148, 'Висота': 210 }
  }
];

const initialWallets: WalletAccount[] = [
  { id: 'W-1', code: '31101', name: 'ПриватБанк ФОП (Основний)', balance: 142500, currency: 'UAH', accountType: 'bank' },
  { id: 'W-2', code: '31102', name: 'Монобанк ФОП', balance: 48300, currency: 'UAH', accountType: 'bank' },
  { id: 'W-3', code: '30101', name: 'Готівкова каса друкарні', balance: 18450, currency: 'UAH', accountType: 'cash' },
  { id: 'W-4', code: '31301', name: 'Термінал POS Checkbox', balance: 12900, currency: 'UAH', accountType: 'pos' }
];

const initialFinanceEntries: FinanceEntry[] = [
  { id: 'FIN-1001', date: getRelativeDateStr(0), dt: '31101 (ПриватБанк)', kt: '361 (Замовники)', sum: 72000, type: 'income', status: 'posted', description: 'Оплата рахунку за тираж бланки А4 1000 шт', document: 'Банківська виписка №142', party: 'Feeling Good', user: 'Анна', category: 'Продаж продукції', walletId: 'W-1', wallet: 'ПриватБанк ФОП (Основний)' },
  { id: 'FIN-1002', date: getRelativeDateStr(-1), dt: '31101 (ПриватБанк)', kt: '361 (Замовники)', sum: 65000, type: 'income', status: 'posted', description: 'Передплата за виготовлення брошур', document: 'Банківська виписка №143', party: 'Марина Губенко', user: 'Анна', category: 'Продаж продукції', walletId: 'W-1', wallet: 'ПриватБанк ФОП (Основний)' },
  { id: 'FIN-1003', date: getRelativeDateStr(-1), dt: '31102 (Монобанк)', kt: '361 (Замовники)', sum: 70000, type: 'income', status: 'posted', description: 'Оплата за поліграфічні послуги', document: 'Банківська виписка №144', party: 'Петро Петренко', user: 'Анна', category: 'Продаж продукції', walletId: 'W-2', wallet: 'Монобанк ФОП' },
  { id: 'FIN-1004', date: getRelativeDateStr(-2), dt: '201 (Сировина)', kt: '631 (Постачальники)', sum: 12750, type: 'expense', status: 'posted', description: 'Закупівля крейдованого паперу 130г (1 500 арк.)', document: 'Накладна №П-884', party: 'ТОВ Папір-Світ', user: 'Іван', category: 'Закупівля паперу та витратників', walletId: 'W-3', wallet: 'Готівкова каса друкарні' },
  { id: 'FIN-1005', date: getRelativeDateStr(-3), dt: '92 (Адмінвитрати)', kt: '631 (Постачальники)', sum: 24500, type: 'expense', status: 'posted', description: 'Сервіс та лізинг ЦПМ Canon / Heidelberg', document: 'Акт №А-12', party: 'ТОВ Сервіс-Принт', user: 'Іван', category: 'Обслуговування обладнання', walletId: 'W-1', wallet: 'ПриватБанк ФОП (Основний)' },
  { id: 'FIN-1006', date: getRelativeDateStr(-4), dt: '30101 (Каса)', kt: '702 (Дохід роздріб)', sum: 5000, type: 'income', status: 'posted', description: 'Роздрібний продаж поліграфії', document: 'ПКО №332', party: 'Світлана', user: 'Іван', category: 'Роздрібний продаж', walletId: 'W-3', wallet: 'Готівкова каса друкарні' },
  { id: 'FIN-1007', date: getRelativeDateStr(2), dt: '201 (Сировина)', kt: '631 (Постачальники)', sum: 18400, type: 'expense', status: 'planned', description: 'Планова оплата постачальнику за папір В2 офсет 80г', document: 'Рахунок №ПС-412', party: 'ТОВ Друк-Папір', user: 'Марія', category: 'Закупівля паперу та витратників', walletId: 'W-1', wallet: 'ПриватБанк ФОП (Основний)' }
];

const initialWarehouseMovements: WarehouseMovement[] = [
  {
    id: 'WM-101',
    date: getRelativeDateStr(-2),
    type: 'receipt',
    materialId: '3',
    materialName: 'Крейдований папір 130г (A1)',
    quantityChange: 1500,
    quantity: 1500,
    quantityAfter: 3000,
    unit: 'арк.',
    unitPrice: 0.85,
    totalSum: 1275,
    warehouseTo: 'Головний склад Вінниця',
    party: 'ТОВ Папір-Світ',
    reason: 'Прихід по накладній №П-884',
    employee: 'Іван'
  },
  {
    id: 'WM-102',
    date: getRelativeDateStr(-1),
    type: 'writeoff',
    materialId: '1',
    materialName: 'Офсетний папір 70г (A1)',
    quantityChange: -750,
    quantity: 750,
    quantityAfter: 5000,
    unit: 'арк.',
    unitPrice: 0.35,
    totalSum: 262.5,
    warehouseFrom: 'Головний склад Вінниця',
    warehouseTo: 'Друкарський цех',
    dealId: '1',
    dealName: 'Бланки А5',
    reason: 'Видано у друк по угоді #1',
    employee: 'Працівник Б'
  },
  {
    id: 'WM-103',
    date: getRelativeDateStr(0),
    type: 'relocate',
    materialId: '4',
    materialName: 'Офсетний папір 80г (A1)',
    quantityChange: 0,
    quantity: 1000,
    quantityAfter: 12000,
    unit: 'арк.',
    unitPrice: 0.40,
    totalSum: 400,
    warehouseFrom: 'Головний склад Вінниця',
    warehouseTo: 'Друкарський цех',
    reason: 'Переміщення під офсетний тираж',
    employee: 'Вікторія'
  }
];

export const getDefaultMaterialPrice = (m?: Partial<Material>): number => {
  if (typeof m?.price === 'number' && !Number.isNaN(m.price)) return m.price;
  const name = (m?.name || '').toLowerCase();
  if (name.includes('тонер')) return 850;
  if (name.includes('плівк')) return 420;
  if (name.includes('пружин')) return 0.45;
  if (name.includes('картон')) return 2.8;
  if (name.includes('самоклейк')) return 1.2;
  if (m?.type === 'coated') return 0.65;
  if (m?.type === 'offset') return 0.38;
  return 0.22;
};

const findTargetMaterialForOrder = (
  materialsList: Material[],
  orderData: { materialId?: string; paperType: string; paperName?: string }
): Material | undefined => {
  if (orderData.materialId) {
    const exact = materialsList.find(m => m.id === orderData.materialId);
    if (exact) return exact;
  }
  const paperOnly = materialsList.filter(m => {
    const n = m.name.toLowerCase();
    return !n.includes('тонер') && !n.includes('плівк') && !n.includes('пружин');
  });
  if (orderData.paperName) {
    const targetName = orderData.paperName.toLowerCase();
    const densityMatch = targetName.match(/\d{2,3}/)?.[0];
    if (densityMatch) {
      const byDensity = paperOnly.find(m => m.name.toLowerCase().includes(densityMatch));
      if (byDensity) return byDensity;
    }
    if (targetName.includes('самоклейк')) {
      const sticker = paperOnly.find(m => m.name.toLowerCase().includes('самоклейк'));
      if (sticker) return sticker;
    }
  }
  return paperOnly.find(m => m.type === orderData.paperType) || materialsList.find(m => m.type === orderData.paperType);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'client' || params.get('role') === 'client' || params.get('tg') === '1' || params.get('tg_id')) {
        const rawName = params.get('name') || params.get('company') || params.get('user') || params.get('client');
        const rawPhone = params.get('phone') || params.get('tel') || '';
        const clientName = rawName ? decodeURIComponent(rawName) : 'Клієнт друкарні';
        const clientPhone = rawPhone ? decodeURIComponent(rawPhone) : '';
        const clientType = params.get('type') === 'business' ? 'business' : 'buyer';
        
        const clientUser: User = { 
          id: `client_${Date.now()}`, 
          username: 'client', 
          role: 'client', 
          name: clientName 
        };
        try {
          localStorage.setItem('crm_user', JSON.stringify(clientUser));
          if (clientName !== 'Клієнт друкарні' || clientPhone) {
            localStorage.setItem('crm_client_profile', JSON.stringify({
              name: clientName,
              companyName: clientName,
              contactPerson: clientName,
              phone: clientPhone,
              clientType: clientType,
              role: 'client'
            }));
          }
        } catch (e) {}
        return clientUser;
      }
      const savedUser = localStorage.getItem('crm_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.username === 'admin') {
            parsed.role = 'admin';
          } else if (parsed.username === 'manager' || parsed.username === 'technolog') {
            parsed.role = 'manager';
          }
          return parsed;
        } catch (e) {}
      }
    }
    return null;
  });
  const [users, setUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    const saved = localStorage.getItem('crm_registered_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUsers([...initialUsers, ...parsed]);
    }
  }, [currentUser]);

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('crm_clients');
    if (!saved) return initialClients;
    try {
      const parsed: Client[] = JSON.parse(saved);
      if (parsed.length < 10 || parsed.some(c => c.name.includes('Замовник №') || c.name.includes('Контрагент'))) {
        return initialClients;
      }
      return parsed.map(c => {
        const init = initialClients.find(ic => ic.id === c.id);
        const hasContacts = c.additionalContacts && c.additionalContacts.length > 0;
        return {
          ...c,
          additionalContacts: hasContacts ? c.additionalContacts : (init?.additionalContacts || [])
        };
      });
    } catch (e) {
      return initialClients;
    }
  });
  
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('crm_materials');
    return saved ? JSON.parse(saved) : initialMaterials;
  });
  
  const [norms, setNorms] = useState<Norms>(() => {
    const saved = localStorage.getItem('crm_norms');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialNorms, ...parsed, packingRate: 1.5 };
      } catch (e) {
        return initialNorms;
      }
    }
    return initialNorms;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('crm_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(() => {
    const saved = localStorage.getItem('crm_deliveries');
    return saved ? JSON.parse(saved) : initialDeliveries;
  });

  const [customFields, setCustomFields] = useState<CustomField[]>(() => {
    const saved = localStorage.getItem('crm_custom_fields');
    return saved ? JSON.parse(saved) : initialCustomFields;
  });

  const [autoPaymentTriggers, setAutoPaymentTriggers] = useState<AutoPaymentTrigger[]>(() => {
    const saved = localStorage.getItem('crm_autopayment_triggers');
    return saved ? JSON.parse(saved) : initialTriggers;
  });

  const [clientSections, setClientSections] = useState<ClientSection[]>(() => {
    const saved = localStorage.getItem('crm_client_sections');
    return saved ? JSON.parse(saved) : [
      { id: 'cs-1', name: 'Постачальники фарби', customFields: [{ name: 'Бренд', type: 'text' }], statuses: ['Узгодження', 'Активний', 'Архів'] },
      { id: 'cs-2', name: 'Дизайнери Аутсорс', customFields: [{ name: 'Ставка/год', type: 'number' }], statuses: ['Вільний', 'Зайнятий'] }
    ];
  });

  const [smsTemplates, setSmsTemplates] = useState<{ id: string; name: string; text: string }[]>(() => {
    const saved = localStorage.getItem('crm_sms_templates');
    return saved ? JSON.parse(saved) : [
      { id: 'sms-1', name: 'Вітання', text: 'Привіт {name}! ТОВ Едельвейс і К розпочав виконання вашого замовлення {id}.' }
    ];
  });

  const [transitionMatrix, setTransitionMatrix] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('crm_transition_matrix');
    return saved ? JSON.parse(saved) : defaultTransitionMatrix;
  });

  const [stageDurations, setStageDurations] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('crm_stage_durations');
    return saved ? JSON.parse(saved) : defaultStageDurations;
  });

  const [novaPoshtaAccounts, setNovaPoshtaAccounts] = useState<string[]>(() => {
    const saved = localStorage.getItem('crm_np_accounts');
    return saved ? JSON.parse(saved) : ['ФОП Шевченко (Основний)', 'ТОВ Едельвейс (Регіональний)'];
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('crm_tasks');
    return saved ? JSON.parse(saved) : initialTasksData;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('crm_notes');
    return saved ? JSON.parse(saved) : initialNotesData;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('crm_leads');
    if (!saved) return initialLeadsData;
    try {
      const parsed: Lead[] = JSON.parse(saved);
      return parsed.length > 0 ? parsed : initialLeadsData;
    } catch (e) {
      return initialLeadsData;
    }
  });

  const [npVolumeCalcEnabled, setNpVolumeCalcEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('crm_np_vol_calc');
    return saved ? JSON.parse(saved) : false;
  });

  const [warehouseMovements, setWarehouseMovements] = useState<WarehouseMovement[]>(() => {
    const saved = localStorage.getItem('crm_warehouse_movements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return initialWarehouseMovements;
  });

  const [wallets, setWallets] = useState<WalletAccount[]>(() => {
    const saved = localStorage.getItem('crm_wallets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return initialWallets;
  });

  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(() => {
    const saved = localStorage.getItem('crm_finance_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.dt) {
          return parsed;
        }
      } catch {}
    }
    return initialFinanceEntries;
  });

  const [notifications, setNotifications] = useState<string[]>([]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('crm_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('crm_theme', next);
      return next;
    });
  };
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());

  const syncServer = async (action: string, payload: any) => {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Neon database background sync notice:', err);
    }
  };

  const fetchServerSync = async () => {
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) {
        if (Array.isArray(data.clients) && data.clients.length > 0) {
          setClients(data.clients);
        }
        if (Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
        }
        if (Array.isArray(data.materials) && data.materials.length > 0) {
          setMaterials(data.materials);
        }
        if (Array.isArray(data.employees) && data.employees.length > 0) {
          setUsers(prev => {
            const clientUsers = prev.filter(u => u.role === 'client');
            return [...data.employees, ...clientUsers];
          });
        }
        if (Array.isArray(data.deliveries) && data.deliveries.length > 0) {
          setDeliveries(data.deliveries);
        }
        if (data.norms) {
          setNorms(prev => ({ ...prev, ...data.norms }));
        }
        setIsDbConnected(true);
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.warn('Neon sync poll skipped:', err);
    }
  };

  useEffect(() => {
    fetchServerSync();
    const interval = setInterval(fetchServerSync, 6000);
    const handleFocus = () => fetchServerSync();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('crm_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('crm_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('crm_norms', JSON.stringify(norms));
  }, [norms]);

  useEffect(() => {
    localStorage.setItem('crm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('crm_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('crm_custom_fields', JSON.stringify(customFields));
  }, [customFields]);

  useEffect(() => {
    localStorage.setItem('crm_autopayment_triggers', JSON.stringify(autoPaymentTriggers));
  }, [autoPaymentTriggers]);

  useEffect(() => {
    localStorage.setItem('crm_client_sections', JSON.stringify(clientSections));
  }, [clientSections]);

  useEffect(() => {
    localStorage.setItem('crm_sms_templates', JSON.stringify(smsTemplates));
  }, [smsTemplates]);

  useEffect(() => {
    localStorage.setItem('crm_transition_matrix', JSON.stringify(transitionMatrix));
  }, [transitionMatrix]);

  useEffect(() => {
    localStorage.setItem('crm_stage_durations', JSON.stringify(stageDurations));
  }, [stageDurations]);

  useEffect(() => {
    localStorage.setItem('crm_np_accounts', JSON.stringify(novaPoshtaAccounts));
  }, [novaPoshtaAccounts]);

  useEffect(() => {
    localStorage.setItem('crm_warehouse_movements', JSON.stringify(warehouseMovements));
  }, [warehouseMovements]);

  useEffect(() => {
    localStorage.setItem('crm_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('crm_finance_records', JSON.stringify(financeEntries));
  }, [financeEntries]);

  useEffect(() => {
    localStorage.setItem('crm_np_vol_calc', JSON.stringify(npVolumeCalcEnabled));
  }, [npVolumeCalcEnabled]);

  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  // Security Real-Time Session Kill-Switch Guard
  useEffect(() => {
    const checkSecuritySession = () => {
      if (currentUser && isUserBlocked(currentUser.username)) {
        setCurrentUser(null);
        localStorage.removeItem('crm_user');
        alert('⛔ Ваш доступ до системи було призупинено адміністратором.');
      }
    };
    
    // Check on mount and listen to window storage events across tabs
    checkSecuritySession();
    window.addEventListener('storage', checkSecuritySession);
    return () => window.removeEventListener('storage', checkSecuritySession);
  }, [currentUser]);

  const login = (username: string, password: string): boolean => {
    if (isUserBlocked(username)) {
      return false;
    }
    const uname = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === uname && password.trim() === username.trim());
    if (user) {
      const normalizedRole: UserRole = uname === 'admin' 
        ? 'admin' 
        : (uname === 'manager' || uname === 'technolog' 
          ? 'manager' 
          : (['admin', 'manager', 'operator', 'client'].includes(user.role) ? user.role : 'operator'));
      
      const loggedUser: User = {
        ...user,
        role: normalizedRole
      };
      setCurrentUser(loggedUser);
      localStorage.setItem('crm_user', JSON.stringify(loggedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('crm_user');
  };

  const addClient = (clientData: Omit<Client, 'id'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `c_${Date.now()}`,
      tags: clientData.tags || [],
      files: clientData.files || [],
      type: clientData.type || 'client'
    };
    setClients(prev => [...prev, newClient]);
    syncServer('save_client', newClient);
    return newClient;
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    syncServer('save_client', updatedClient);
  };

  const addSystemNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 30));
  };

  const applyWalletDelta = (
    walletList: WalletAccount[],
    entry: Pick<FinanceEntry, 'type' | 'status' | 'sum' | 'walletId' | 'targetWalletId'>,
    multiplier: 1 | -1
  ): WalletAccount[] => {
    if (entry.status === 'planned') return walletList;
    const delta = entry.sum * multiplier;
    return walletList.map(w => {
      if (entry.type === 'income' && w.id === entry.walletId) {
        return { ...w, balance: w.balance + delta };
      }
      if (entry.type === 'expense' && w.id === entry.walletId) {
        return { ...w, balance: w.balance - delta };
      }
      if (entry.type === 'transfer') {
        if (w.id === entry.walletId) return { ...w, balance: w.balance - delta };
        if (w.id === entry.targetWalletId) return { ...w, balance: w.balance + delta };
      }
      return w;
    });
  };

  const addFinanceEntry = (
    entryData: Omit<FinanceEntry, 'id' | 'user' | 'wallet'> & { wallet?: string }
  ): FinanceEntry => {
    const sourceWallet = wallets.find(w => w.id === entryData.walletId) || wallets[0];
    const newEntry: FinanceEntry = {
      ...entryData,
      id: `FIN-${Date.now().toString().slice(-5)}`,
      status: entryData.status || 'posted',
      user: currentUser?.name || 'Система',
      walletId: sourceWallet?.id || entryData.walletId,
      wallet: entryData.wallet || sourceWallet?.name || 'Основний рахунок'
    };

    setFinanceEntries(prev => [newEntry, ...prev]);
    if (newEntry.status === 'posted') {
      setWallets(prev => applyWalletDelta(prev, newEntry, 1));
    }

    if (newEntry.dealId && newEntry.type === 'income' && newEntry.status === 'posted') {
      const targetOrder = orders.find(o => o.id === newEntry.dealId);
      if (targetOrder) {
        const updatedPaid = (targetOrder.prepayment || 0) + newEntry.sum;
        const nextStatus: Order['paymentStatus'] =
          updatedPaid >= targetOrder.finalPrice - 0.5 ? 'paid' : updatedPaid > 0 ? 'partial' : 'unpaid';
        updateOrderPayment(targetOrder.id, nextStatus, Math.round(updatedPaid * 100) / 100);
      }
    }

    return newEntry;
  };

  const markFinanceEntryPaid = (entryId: string) => {
    const target = financeEntries.find(e => e.id === entryId);
    if (!target || target.status === 'posted') return;
    const postedEntry: FinanceEntry = { ...target, status: 'posted' };
    setFinanceEntries(prev => prev.map(e => e.id === entryId ? postedEntry : e));
    setWallets(prev => applyWalletDelta(prev, postedEntry, 1));
    if (postedEntry.dealId && postedEntry.type === 'income') {
      const targetOrder = orders.find(o => o.id === postedEntry.dealId);
      if (targetOrder) {
        const updatedPaid = (targetOrder.prepayment || 0) + postedEntry.sum;
        const nextStatus: Order['paymentStatus'] =
          updatedPaid >= targetOrder.finalPrice - 0.5 ? 'paid' : updatedPaid > 0 ? 'partial' : 'unpaid';
        updateOrderPayment(targetOrder.id, nextStatus, Math.round(updatedPaid * 100) / 100);
      }
    }
    addSystemNotification(`Проведено плановий платіж ${postedEntry.document} на суму ${postedEntry.sum.toLocaleString('uk-UA')} грн`);
  };

  const deleteFinanceEntry = (entryId: string) => {
    const target = financeEntries.find(e => e.id === entryId);
    if (!target) return;
    setFinanceEntries(prev => prev.filter(e => e.id !== entryId));
    if (target.status !== 'planned') {
      setWallets(prev => applyWalletDelta(prev, target, -1));
    }
  };

  const recordWarehouseMovement = (params: {
    type: WarehouseMovementType;
    materialId: string;
    quantity: number;
    unitPrice?: number;
    warehouseFrom?: string;
    warehouseTo?: string;
    party?: string;
    dealId?: string;
    dealName?: string;
    reason?: string;
    createFinanceRecord?: boolean;
    financePaidImmediately?: boolean;
    walletId?: string;
  }) => {
    const mat = materials.find(m => m.id === params.materialId);
    if (!mat) return;

    const absQty = Math.max(0, Number(params.quantity) || 0);
    if (absQty === 0 && params.type !== 'reconciliation') return;

    const unitPrice = params.unitPrice && params.unitPrice > 0 ? params.unitPrice : getDefaultMaterialPrice(mat);
    const totalSum = Math.round(absQty * unitPrice * 100) / 100;
    const todayStr = new Date().toISOString().split('T')[0];
    const employeeName = currentUser?.name || 'Менеджер складу';

    let quantityChange = 0;
    let nextQty = mat.quantity;
    let nextReserved = mat.reserved;

    if (params.type === 'receipt') {
      quantityChange = absQty;
      nextQty = mat.quantity + absQty;
    } else if (params.type === 'writeoff' || params.type === 'return') {
      quantityChange = -absQty;
      nextQty = Math.max(0, mat.quantity - absQty);
      if (params.dealId) {
        nextReserved = Math.max(0, mat.reserved - absQty);
      }
    } else if (params.type === 'reserve') {
      nextReserved = mat.reserved + absQty;
    } else if (params.type === 'release') {
      nextReserved = Math.max(0, mat.reserved - absQty);
    }

    const updatedSalesLog =
      params.type === 'writeoff'
        ? [
            {
              id: `SL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              date: todayStr,
              employee: employeeName,
              quantity: absQty,
              dealId: params.dealId,
              dealName: params.dealName || params.reason || 'Списання зі складу'
            },
            ...(mat.salesLog || [])
          ]
        : mat.salesLog;

    setMaterials(prev =>
      prev.map(m =>
        m.id === mat.id
          ? {
              ...m,
              quantity: nextQty,
              reserved: nextReserved,
              price: params.type === 'receipt' && params.unitPrice && params.unitPrice > 0 ? params.unitPrice : m.price,
              supplier: params.type === 'receipt' && params.party ? params.party : m.supplier,
              salesLog: updatedSalesLog
            }
          : m
      )
    );

    const movement: WarehouseMovement = {
      id: `WM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`,
      date: todayStr,
      type: params.type,
      materialId: mat.id,
      materialName: mat.name,
      quantityChange,
      quantity: absQty,
      quantityAfter: nextQty,
      unit: mat.unit,
      unitPrice,
      totalSum,
      warehouseFrom: params.warehouseFrom,
      warehouseTo: params.warehouseTo,
      party: params.party,
      dealId: params.dealId,
      dealName: params.dealName,
      reason: params.reason,
      employee: employeeName
    };

    setWarehouseMovements(prev => [movement, ...prev]);
    syncServer('update_material_stock', { materialId: mat.id, quantity: nextQty });

    if (params.createFinanceRecord && params.type === 'receipt' && totalSum > 0) {
      const targetWalletId = params.walletId || wallets[0]?.id || 'W-1';
      addFinanceEntry({
        date: todayStr,
        dt: '201 (Сировина і матеріали)',
        kt: params.financePaidImmediately ? '311/301 (Оплата)' : '631 (Постачальники)',
        sum: totalSum,
        type: 'expense',
        status: params.financePaidImmediately ? 'posted' : 'planned',
        description: `Закупівля: ${mat.name} (${absQty} ${mat.unit})`,
        document: `Прихід ${movement.id}`,
        party: params.party || mat.supplier || 'Постачальник',
        category: 'Закупівля паперу та витратників',
        walletId: targetWalletId,
        materialMovementId: movement.id
      });
    }
  };

  const reconcileWarehouseStock = (
    items: Array<{ materialId: string; actualQty: number; reason?: string }>
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const employeeName = currentUser?.name || 'Комірник';
    const createdMovements: WarehouseMovement[] = [];
    const updatesMap = new Map<string, number>();

    items.forEach(item => {
      const mat = materials.find(m => m.id === item.materialId);
      if (!mat) return;
      const diff = item.actualQty - mat.quantity;
      if (diff === 0) return;

      const unitPrice = getDefaultMaterialPrice(mat);
      updatesMap.set(mat.id, Math.max(0, item.actualQty));

      createdMovements.push({
        id: `INV-${Date.now().toString().slice(-5)}-${mat.id}`,
        date: todayStr,
        type: 'reconciliation',
        materialId: mat.id,
        materialName: mat.name,
        quantityChange: diff,
        quantity: Math.abs(diff),
        quantityAfter: Math.max(0, item.actualQty),
        unit: mat.unit,
        unitPrice,
        totalSum: Math.round(Math.abs(diff) * unitPrice * 100) / 100,
        warehouseFrom: 'Головний склад Вінниця',
        reason: item.reason || (diff > 0 ? 'Інвентаризація: виявлено надлишок' : 'Інвентаризація: списання нестачі'),
        employee: employeeName
      });
    });

    if (createdMovements.length === 0) return;

    setMaterials(prev =>
      prev.map(m => (updatesMap.has(m.id) ? { ...m, quantity: updatesMap.get(m.id)! } : m))
    );
    setWarehouseMovements(prev => [...createdMovements, ...prev]);
    addSystemNotification(`Проведено інвентаризацію складу: оновлено ${createdMovements.length} позицій.`);
  };

  const handleBotPaymentCheck = (order: Order, status: Order['status']) => {
    const matchingTrigger = autoPaymentTriggers.find(t => t.dealStage === status && t.active);
    if (matchingTrigger) {
      const amountToPay = Math.round(order.finalPrice * (matchingTrigger.percentage / 100) * 100) / 100;
      const matchedWallet = wallets.find(w => w.name.includes(matchingTrigger.wallet)) || wallets[0];
      const client = clients.find(c => c.id === order.clientId);

      addFinanceEntry({
        date: new Date().toISOString().split('T')[0],
        dt: `${matchedWallet?.code || '311'} (${matchedWallet?.name || matchingTrigger.wallet})`,
        kt: '361 (Розрахунки з покупцями)',
        sum: amountToPay,
        type: 'income',
        status: 'posted',
        description: `Автоматична оплата (Keepin Bot) по угоді ${order.id} (${order.name})`,
        document: `Тригер #${order.id}`,
        party: client?.name || 'Клієнт',
        category: matchingTrigger.category || 'Продаж продукції',
        walletId: matchedWallet?.id || 'W-1',
        wallet: matchedWallet?.name || matchingTrigger.wallet,
        dealId: order.id
      });
      addSystemNotification(`Keepin Bot провів автоматичну оплату ${amountToPay.toFixed(2)} грн по замовленню ${order.id}`);
    }
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'createdBy' | 'status'> & { id?: string }): Order => {
    const orderId = orderData.id || String(orders.length + 1);
    const targetMaterial = findTargetMaterialForOrder(materials, orderData);
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      materialId: targetMaterial?.id || orderData.materialId,
      status: 'design',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Система',
      ttnStatus: 'created',
      ttnNumber: '',
      stageChangedAt: { 'design': new Date().toISOString() }
    };

    if (targetMaterial && newOrder.physicalSheets > 0) {
      const qtyNeeded = newOrder.physicalSheets;
      setMaterials(prev => prev.map(m =>
        m.id === targetMaterial.id
          ? { ...m, reserved: m.reserved + qtyNeeded }
          : m
      ));
      const unitPrice = getDefaultMaterialPrice(targetMaterial);
      setWarehouseMovements(prev => [
        {
          id: `RES-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().split('T')[0],
          type: 'reserve',
          materialId: targetMaterial.id,
          materialName: targetMaterial.name,
          quantityChange: 0,
          quantity: qtyNeeded,
          quantityAfter: targetMaterial.quantity,
          unit: targetMaterial.unit,
          unitPrice,
          totalSum: Math.round(qtyNeeded * unitPrice * 100) / 100,
          dealId: orderId,
          dealName: newOrder.name,
          reason: `Авторезерв паперу під замовлення #${orderId}`,
          employee: currentUser?.name || 'Система'
        },
        ...prev
      ]);
    }

    setOrders(prev => [newOrder, ...prev]);

    const client = clients.find(c => c.id === orderData.clientId);
    addDelivery({
      dealId: orderId,
      clientName: client?.name || 'Покупець',
      address: client?.city ? `м. ${client.city}, Нова Пошта` : 'м. Вінниця, Нова Пошта',
      ttnNumber: '',
      status: 'created',
      date: new Date().toISOString().split('T')[0],
      deliveryType: 'nova_poshta',
      npAccountId: 'ФОП Шевченко (Основний)'
    });

    handleBotPaymentCheck(newOrder, 'design');
    syncServer('save_order', newOrder);
    return newOrder;
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    syncServer('save_order', updatedOrder);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const existing = orders.find(o => o.id === orderId);
    if (!existing) return;

    const targetMat = findTargetMaterialForOrder(materials, existing);
    if (targetMat && existing.physicalSheets > 0) {
      const sheets = existing.physicalSheets;
      if (status === 'ready' && existing.status !== 'ready') {
        const unitPrice = getDefaultMaterialPrice(targetMat);
        const nextQty = Math.max(0, targetMat.quantity - sheets);
        setMaterials(prev => prev.map(m =>
          m.id === targetMat.id
            ? {
                ...m,
                quantity: nextQty,
                reserved: Math.max(0, m.reserved - sheets),
                salesLog: [
                  {
                    id: `SL-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    employee: currentUser?.name || 'Цех',
                    quantity: sheets,
                    dealId: existing.id,
                    dealName: existing.name
                  },
                  ...(m.salesLog || [])
                ]
              }
            : m
        ));
        setWarehouseMovements(prev => [
          {
            id: `OUT-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString().split('T')[0],
            type: 'writeoff',
            materialId: targetMat.id,
            materialName: targetMat.name,
            quantityChange: -sheets,
            quantity: sheets,
            quantityAfter: nextQty,
            unit: targetMat.unit,
            unitPrice,
            totalSum: Math.round(sheets * unitPrice * 100) / 100,
            warehouseFrom: 'Друкарський цех',
            dealId: existing.id,
            dealName: existing.name,
            reason: `Автосписання при випуску замовлення #${existing.id}`,
            employee: currentUser?.name || 'Цех'
          },
          ...prev
        ]);
      } else if (status !== 'ready' && existing.status === 'ready') {
        setMaterials(prev => prev.map(m =>
          m.id === targetMat.id
            ? { ...m, quantity: m.quantity + sheets, reserved: m.reserved + sheets }
            : m
        ));
      }
    }

    const now = new Date().toISOString();
    const stageChangedAt = { ...(existing.stageChangedAt || {}), [status]: now };
    const updated = { ...existing, status, stageChangedAt };
    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    handleBotPaymentCheck(updated, status);
    syncServer('save_order', updated);
  };

  const updateOrderPayment = (orderId: string, paymentStatus: Order['paymentStatus'], prepayment: number) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus, prepayment } : o));
  };

  const updateNorms = (updatedNorms: Norms) => {
    setNorms(updatedNorms);
  };

  const addMaterial = (materialData: Omit<Material, 'id'>) => {
    const newMaterial: Material = {
      ...materialData,
      id: `${Date.now().toString().slice(-4)}`
    };
    setMaterials(prev => [...prev, newMaterial]);
    addSystemNotification(`Додано новий товар на склад: "${newMaterial.name}"`);
  };

  const updateMaterialStock = (materialId: string, quantity: number) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, quantity } : m));
    syncServer('update_material_stock', { materialId, quantity });
  };

  const updateMaterialSalesLog = (materialId: string, salesLog: any[]) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, salesLog } : m));
  };

  const addDelivery = (delivery: Omit<DeliveryItem, 'id'>) => {
    const newDelivery: DeliveryItem = { 
      ...delivery, 
      id: `del_${Date.now()}`
    };
    setDeliveries(prev => [newDelivery, ...prev]);
  };

  const updateDelivery = (updatedDelivery: DeliveryItem) => {
    setDeliveries(prev => prev.map(d => d.id === updatedDelivery.id ? updatedDelivery : d));
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryItem['status']) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        setOrders(prevOrders => prevOrders.map(o => o.id === d.dealId ? { ...o, ttnStatus: status } : o));
        return { ...d, status };
      }
      return d;
    }));
  };

  const addCustomField = (field: Omit<CustomField, 'id'>) => {
    const newField: CustomField = { ...field, id: `cf_${Date.now()}` };
    setCustomFields(prev => [...prev, newField]);
  };

  const deleteCustomField = (fieldId: string) => {
    setCustomFields(prev => prev.filter(cf => cf.id !== fieldId));
  };

  const addAutoPaymentTrigger = (trigger: Omit<AutoPaymentTrigger, 'id'>) => {
    const newTrigger: AutoPaymentTrigger = { ...trigger, id: `trg_${Date.now()}` };
    setAutoPaymentTriggers(prev => [...prev, newTrigger]);
  };

  const deleteAutoPaymentTrigger = (triggerId: string) => {
    setAutoPaymentTriggers(prev => prev.filter(t => t.id !== triggerId));
  };

  const addClientSection = (section: Omit<ClientSection, 'id'>) => {
    const newSec = { ...section, id: `cs_${Date.now()}` };
    setClientSections(prev => [...prev, newSec]);
  };

  const deleteClientSection = (sectionId: string) => {
    setClientSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const addSmsTemplate = (template: { name: string; text: string }) => {
    const newTpl = { ...template, id: `sms_${Date.now()}` };
    setSmsTemplates(prev => [...prev, newTpl]);
  };

  const deleteSmsTemplate = (templateId: string) => {
    setSmsTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const updateTransitionMatrix = (matrix: Record<string, string[]>) => {
    setTransitionMatrix(matrix);
  };

  const updateStageDurations = (durations: Record<string, number>) => {
    setStageDurations(durations);
  };

  const addNovaPoshtaAccount = (accountName: string) => {
    if (!novaPoshtaAccounts.includes(accountName)) {
      setNovaPoshtaAccounts([...novaPoshtaAccounts, accountName]);
    }
  };

  const deleteNovaPoshtaAccount = (accountName: string) => {
    setNovaPoshtaAccounts(novaPoshtaAccounts.filter(a => a !== accountName));
  };

  // --- Task Methods ---
  const addTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): TaskItem => {
    const newTask: TaskItem = {
      ...taskData,
      id: taskData.id || `T-${Date.now().toString().slice(-4)}`,
      createdAt: taskData.createdAt || new Date().toISOString().split('T')[0],
      checklist: taskData.checklist || [],
      status: taskData.status || 'todo'
    };
    setTasks(prev => {
      const updated = [newTask, ...prev];
      localStorage.setItem('crm_tasks', JSON.stringify(updated));
      return updated;
    });
    addSystemNotification(`📋 Створено нове завдання: "${newTask.title}"`);
    return newTask;
  };

  const updateTask = (task: TaskItem) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === task.id ? task : t);
      localStorage.setItem('crm_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId);
      localStorage.setItem('crm_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'todo' ? 'done' : 'todo';
          return { ...t, status: nextStatus as 'todo' | 'done' };
        }
        return t;
      });
      localStorage.setItem('crm_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTaskChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            checklist: task.checklist.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
          };
        }
        return task;
      });
      localStorage.setItem('crm_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  // --- Note Methods ---
  const addNote = (noteData: Omit<NoteItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => {
    const newNote: NoteItem = {
      ...noteData,
      id: noteData.id || `N-${Date.now().toString().slice(-5)}`,
      createdAt: noteData.createdAt || new Date().toISOString(),
      replies: noteData.replies || []
    };
    setNotes(prev => {
      const updated = [newNote, ...prev];
      localStorage.setItem('crm_notes', JSON.stringify(updated));
      return updated;
    });
  };

  const editNote = (noteId: string, text: string) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === noteId ? { ...n, text, updatedAt: new Date().toISOString() } : n);
      localStorage.setItem('crm_notes', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== noteId);
      localStorage.setItem('crm_notes', JSON.stringify(updated));
      return updated;
    });
  };

  const addNoteReply = (noteId: string, text: string, author: string, authorRole?: string) => {
    const newReply: NoteReply = {
      id: `NR-${Date.now().toString().slice(-4)}`,
      author,
      authorRole,
      text,
      createdAt: new Date().toISOString()
    };
    setNotes(prev => {
      const updated = prev.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            replies: [...(n.replies || []), newReply]
          };
        }
        return n;
      });
      localStorage.setItem('crm_notes', JSON.stringify(updated));
      return updated;
    });
  };

  const editNoteReply = (noteId: string, replyId: string, newText: string) => {
    setNotes(prev => {
      const updated = prev.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            replies: (n.replies || []).map(r => r.id === replyId ? { ...r, text: newText, updatedAt: new Date().toISOString() } : r)
          };
        }
        return n;
      });
      localStorage.setItem('crm_notes', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNoteReply = (noteId: string, replyId: string) => {
    setNotes(prev => {
      const updated = prev.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            replies: (n.replies || []).filter(r => r.id !== replyId)
          };
        }
        return n;
      });
      localStorage.setItem('crm_notes', JSON.stringify(updated));
      return updated;
    });
  };


  // --- Lead Methods ---
  const addLead = (leadData: Omit<Lead, 'id'> & { id?: string }): Lead => {
    const newLead: Lead = {
      ...leadData,
      id: leadData.id || `L-${Date.now().toString().slice(-4)}`,
      date: leadData.date || new Date().toISOString().split('T')[0],
      status: leadData.status || 'new',
      tags: leadData.tags || [],
      files: leadData.files || []
    };
    setLeads(prev => {
      const updated = [newLead, ...prev];
      localStorage.setItem('crm_leads', JSON.stringify(updated));
      return updated;
    });
    addSystemNotification(`📩 Новий запит (${newLead.source === 'Calculator' ? 'Калькулятор' : 'Звернення'}): "${newLead.name}" - ${newLead.budget} ₴`);
    return newLead;
  };

  const updateLead = (lead: Lead) => {
    setLeads(prev => {
      const updated = prev.map(l => l.id === lead.id ? lead : l);
      localStorage.setItem('crm_leads', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteLead = (leadId: string) => {
    setLeads(prev => {
      const updated = prev.filter(l => l.id !== leadId);
      localStorage.setItem('crm_leads', JSON.stringify(updated));
      return updated;
    });
  };

  const updateLeadStatus = (leadId: string, status: Lead['status']) => {
    setLeads(prev => {
      const updated = prev.map(l => l.id === leadId ? { ...l, status } : l);
      localStorage.setItem('crm_leads', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        clients,
        materials,
        orders,
        norms,
        deliveries,
        customFields,
        autoPaymentTriggers,
        clientSections,
        smsTemplates,
        transitionMatrix,
        stageDurations,
        novaPoshtaAccounts,
        tasks,
        notes,
        leads,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        login,
        logout,
        addClient,
        updateClient,
        addOrder,
        updateOrder,
        updateOrderStatus,
        updateOrderPayment,
        updateNorms,
        addMaterial,
        updateMaterialStock,
        updateMaterialSalesLog,
        addDelivery,
        updateDelivery,
        updateDeliveryStatus,
        addCustomField,
        deleteCustomField,
        addAutoPaymentTrigger,
        deleteAutoPaymentTrigger,
        addClientSection,
        deleteClientSection,
        addSmsTemplate,
        deleteSmsTemplate,
        updateTransitionMatrix,
        updateStageDurations,
        addNovaPoshtaAccount,
        deleteNovaPoshtaAccount,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleTaskChecklistItem,
        addNote,
        editNote,
        deleteNote,
        addNoteReply,
        editNoteReply,
        deleteNoteReply,
        addSystemNotification,
        notifications,
        npVolumeCalcEnabled,
        setNpVolumeCalcEnabled,
        theme,
        toggleTheme,
        isDbConnected,
        lastSyncedAt,
        refreshSync: fetchServerSync,
        warehouseMovements,
        recordWarehouseMovement,
        reconcileWarehouseStock,
        wallets,
        financeEntries,
        addFinanceEntry,
        markFinanceEntryPaid,
        deleteFinanceEntry
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
