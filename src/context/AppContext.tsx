import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Client, Material, Order, Norms, DeliveryItem, CustomField, AutoPaymentTrigger, ClientSection } from '../types';
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
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'createdBy' | 'status'> & { id?: string }) => void;
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
  addSystemNotification: (message: string) => void;
  notifications: string[];
  npVolumeCalcEnabled: boolean;
  setNpVolumeCalcEnabled: (val: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
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
    type: 'client'
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
    type: 'lead'
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
          return JSON.parse(savedUser);
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
      return parsed;
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

  const [npVolumeCalcEnabled, setNpVolumeCalcEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('crm_np_vol_calc');
    return saved ? JSON.parse(saved) : false;
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
    localStorage.setItem('crm_np_vol_calc', JSON.stringify(npVolumeCalcEnabled));
  }, [npVolumeCalcEnabled]);

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
    const user = users.find(u => u.username === username.toLowerCase() && password === username);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('crm_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('crm_user');
  };

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: `c_${Date.now()}`,
      tags: clientData.tags || [],
      files: clientData.files || [],
      type: clientData.type || 'client'
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const addSystemNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 30));
  };

  const handleBotPaymentCheck = (order: Order, status: Order['status']) => {
    const matchingTrigger = autoPaymentTriggers.find(t => t.dealStage === status && t.active);
    if (matchingTrigger) {
      const amountToPay = order.finalPrice * (matchingTrigger.percentage / 100);
      const savedFinance = localStorage.getItem('crm_finance_records');
      const currentFinance = savedFinance ? JSON.parse(savedFinance) : [];

      const newRec = {
        id: `F-BOT-${Date.now()}`,
        type: 'income',
        amount: amountToPay,
        wallet: matchingTrigger.wallet,
        category: matchingTrigger.category,
        description: `Автоматична оплата (Keepin Bot) по угоді ${order.id} (${order.name})`,
        date: new Date().toISOString().split('T')[0],
        dealId: order.id
      };

      localStorage.setItem('crm_finance_records', JSON.stringify([newRec, ...currentFinance]));
      updateOrderPayment(order.id, 'paid', amountToPay);
      addSystemNotification(`🤖 Keepin Bot провів автоматичну оплату ${amountToPay.toFixed(2)} грн по замовленню ${order.id}`);
    }
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'createdBy' | 'status'> & { id?: string }) => {
    const orderId = orderData.id || String(orders.length + 1);
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: 'design',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Система',
      ttnStatus: 'created',
      ttnNumber: '',
      stageChangedAt: { 'design': new Date().toISOString() }
    };

    setMaterials(prev => prev.map(m => {
      if (m.type === orderData.paperType) {
        const qtyNeeded = newOrder.physicalSheets;
        return {
          ...m,
          quantity: Math.max(0, m.quantity - qtyNeeded),
          reserved: m.reserved + qtyNeeded
        };
      }
      return m;
    }));

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
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (status === 'ready' && o.status !== 'ready') {
          setMaterials(materialsPrev => materialsPrev.map(m => {
            if (m.type === o.paperType) {
              return { ...m, reserved: Math.max(0, m.reserved - o.physicalSheets) };
            }
            return m;
          }));
        }
        else if (status !== 'ready' && o.status === 'ready') {
          setMaterials(materialsPrev => materialsPrev.map(m => {
            if (m.type === o.paperType) {
              return { ...m, reserved: m.reserved + o.physicalSheets };
            }
            return m;
          }));
        }

        const now = new Date().toISOString();
        const stageChangedAt = { ...(o.stageChangedAt || {}), [status]: now };
        const updated = { ...o, status, stageChangedAt };
        handleBotPaymentCheck(updated, status);
        return updated;
      }
      return o;
    }));
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
        addSystemNotification,
        notifications,
        npVolumeCalcEnabled,
        setNpVolumeCalcEnabled,
        theme,
        toggleTheme
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
