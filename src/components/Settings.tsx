import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  MapPin, 
  Users as UsersIcon, 
  DollarSign, 
  Trash,
  Copy,
  Settings as SettingsIcon,
  HelpCircle,
  Clock,
  Shuffle,
  Truck,
  Globe,
  ShoppingBag
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  branch: string;
}

interface Currency {
  code: string;
  symbol: string;
  rate: number;
  isBase: boolean;
}

export const Settings: React.FC = () => {
  const { 
    customFields, 
    addCustomField, 
    deleteCustomField,
    transitionMatrix,
    updateTransitionMatrix,
    stageDurations,
    updateStageDurations,
    novaPoshtaAccounts,
    addNovaPoshtaAccount,
    deleteNovaPoshtaAccount,
    npVolumeCalcEnabled,
    setNpVolumeCalcEnabled
  } = useApp();

  const [branches] = useState<Branch[]>([
    { id: 'B-1', name: 'Головний офіс / Виробництво', address: 'вул. Поліграфічна, 12, Вінниця', phone: '+380432669868' }
  ]);

  const [members] = useState<TeamMember[]>(
    [
      { id: '1', name: 'Працівник А (Директор)', email: 'worker.a@example.com', role: 'admin', branch: 'Головний офіс' },
      { id: '2', name: 'Працівник Е (Старший менеджер)', email: 'worker.f@example.com', role: 'manager', branch: 'Головний офіс' },
      { id: '3', name: 'Працівник Д (Друкар-оператор)', email: 'worker.e@example.com', role: 'operator', branch: 'Головний офіс' }
    ]
  );

  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'UAH', symbol: '₴', rate: 1.00, isBase: true },
    { code: 'USD', symbol: '$', rate: 41.20, isBase: false },
    { code: 'EUR', symbol: '€', rate: 44.80, isBase: false }
  ]);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'branches' | 'users' | 'access_matrix' | 'currencies' | 'customfields' | 'matrix_sla' | 'nova_poshta' | 'rozetka' | 'ukr_poshta'>('access_matrix');
  const [accessSubTab, setAccessSubTab] = useState<'branches' | 'users' | 'teams' | 'rights'>('rights');

  // Role Access Permissions State (matching KeepinCRM screenshot)
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({
    dev: {
      g_unlimited: false, g_change_mgr_assignee: true, g_change_origin: false, g_change_deal_name: true, g_autofill: true,
      g_change_source: false, g_print_docs: true, g_export_data: true, g_print_receipts: true, g_change_shops: true,
      g_view_cash_log: true, g_view_my_actions: true, g_print_thermal: true,
      p_print_checklist: true, p_view_finance_sum: true, p_view_total_funds: false, p_view_debts: false, p_export_ops: true,
      c_view_phones: true, c_delete_leads: true, c_manual_deals: true, c_view_contacts: false, c_edit_my_orders: false,
      c_edit_mgr_orders: false, c_delete_client_orders: false, c_view_client_orders: true, c_create_client_stage: false,
      c_view_clients: true, c_unlimited: true, c_delete_supplier_orders: true,
      d_change_deals: true, d_view_completed_points: false, d_view_deal_points: false, d_change_columns: false,
      d_move_stages_assignee: true, d_edit_deal_name: false, d_unlimited_mgr_deals: true, d_change_order_assignee: true,
      d_change_call_assignee: true, d_unlimited_client_orders: true, d_unlimited_mgr_orders: true, d_unlimited_leads: true, d_unlimited_client_deals: true,
      t_change_tasks: true, t_edit_task_source: false, t_create_client_task: true, t_view_my_tasks: true,
      w_manual_writeoff: false, w_view_stock: true, w_stock_writeoff: true, w_print_inventory: true, w_manual_stock_edit: false,
      w_print_specs: true, w_manual_price_edit: true, w_change_order_price: true, w_print_acceptance: true, w_manual_name_edit: true,
      w_print_waybill: true, w_view_output: true,
      cs_manual_writeoff: true, cs_view_cashier_stock: false,
      p_create_purchases: true, p_receive_purchase: true, p_buy_goods: true, p_view_purchase: true, p_buy_client_goods: true,
      p_view_1c_order: true, p_writeoff_purchase_goods: true, p_export_purchases: true, p_view_waybill: true, p_create_act: true,
      p_create_issue_act: true, p_writeoff_sum: true, p_writeoff_debt: true,
      s_create_settings: false, s_export_systems: false, s_group_settings: false, s_funnel_settings: false, s_cash_settings: false,
      s_validation_settings: false, s_automation_settings: false, s_sources_settings: false, s_fields_settings: false, s_clients_settings: false, s_stock_settings: false
    },
    op: {
      g_unlimited: true, g_change_mgr_assignee: true, g_change_origin: true, g_change_deal_name: true, g_autofill: true,
      g_change_source: true, g_print_docs: true, g_export_data: true, g_print_receipts: true, g_change_shops: true,
      g_view_cash_log: true, g_view_my_actions: true, g_print_thermal: true,
      p_print_checklist: true, p_view_finance_sum: true, p_view_total_funds: true, p_view_debts: true, p_export_ops: true,
      c_view_phones: true, c_delete_leads: true, c_manual_deals: true, c_view_contacts: true, c_edit_my_orders: true,
      c_edit_mgr_orders: true, c_delete_client_orders: true, c_view_client_orders: true, c_create_client_stage: true,
      c_view_clients: true, c_unlimited: true, c_delete_supplier_orders: true,
      d_change_deals: true, d_view_completed_points: true, d_view_deal_points: true, d_change_columns: true,
      d_move_stages_assignee: true, d_edit_deal_name: true, d_unlimited_mgr_deals: true, d_change_order_assignee: true,
      d_change_call_assignee: true, d_unlimited_client_orders: true, d_unlimited_mgr_orders: true, d_unlimited_leads: true, d_unlimited_client_deals: true,
      t_change_tasks: true, t_edit_task_source: true, t_create_client_task: true, t_view_my_tasks: true,
      w_manual_writeoff: true, w_view_stock: true, w_stock_writeoff: true, w_print_inventory: true, w_manual_stock_edit: true,
      w_print_specs: true, w_manual_price_edit: true, w_change_order_price: true, w_print_acceptance: true, w_manual_name_edit: true,
      w_print_waybill: true, w_view_output: true,
      cs_manual_writeoff: true, cs_view_cashier_stock: true,
      p_create_purchases: true, p_receive_purchase: true, p_buy_goods: true, p_view_purchase: true, p_buy_client_goods: true,
      p_view_1c_order: true, p_writeoff_purchase_goods: true, p_export_purchases: true, p_view_waybill: true, p_create_act: true,
      p_create_issue_act: true, p_writeoff_sum: true, p_writeoff_debt: true,
      s_create_settings: false, s_export_systems: false, s_group_settings: false, s_funnel_settings: false, s_cash_settings: false,
      s_validation_settings: false, s_automation_settings: false, s_sources_settings: false, s_fields_settings: false, s_clients_settings: false, s_stock_settings: false
    },
    printer: {
      g_unlimited: false, g_change_mgr_assignee: true, g_change_origin: false, g_change_deal_name: true, g_autofill: true,
      g_change_source: false, g_print_docs: true, g_export_data: true, g_print_receipts: true, g_change_shops: true,
      g_view_cash_log: true, g_view_my_actions: true, g_print_thermal: true,
      p_print_checklist: true, p_view_finance_sum: true, p_view_total_funds: false, p_view_debts: true, p_export_ops: true,
      c_view_phones: true, c_delete_leads: true, c_manual_deals: true, c_view_contacts: false, c_edit_my_orders: false,
      c_edit_mgr_orders: false, c_delete_client_orders: false, c_view_client_orders: true, c_create_client_stage: false,
      c_view_clients: true, c_unlimited: true, c_delete_supplier_orders: true,
      d_change_deals: true, d_view_completed_points: false, d_view_deal_points: false, d_change_columns: false,
      d_move_stages_assignee: true, d_edit_deal_name: false, d_unlimited_mgr_deals: true, d_change_order_assignee: true,
      d_change_call_assignee: true, d_unlimited_client_orders: true, d_unlimited_mgr_orders: true, d_unlimited_leads: true, d_unlimited_client_deals: true,
      t_change_tasks: true, t_edit_task_source: false, t_create_client_task: true, t_view_my_tasks: false,
      w_manual_writeoff: true, w_view_stock: true, w_stock_writeoff: true, w_print_inventory: true, w_manual_stock_edit: false,
      w_print_specs: true, w_manual_price_edit: true, w_change_order_price: true, w_print_acceptance: true, w_manual_name_edit: true,
      w_print_waybill: true, w_view_output: true,
      cs_manual_writeoff: true, cs_view_cashier_stock: false,
      p_create_purchases: true, p_receive_purchase: true, p_buy_goods: true, p_view_purchase: true, p_buy_client_goods: true,
      p_view_1c_order: true, p_writeoff_purchase_goods: true, p_export_purchases: true, p_view_waybill: true, p_create_act: true,
      p_create_issue_act: true, p_writeoff_sum: true, p_writeoff_debt: true,
      s_create_settings: false, s_export_systems: false, s_group_settings: false, s_funnel_settings: false, s_cash_settings: false,
      s_validation_settings: false, s_automation_settings: false, s_sources_settings: false, s_fields_settings: false, s_clients_settings: false, s_stock_settings: false
    }
  });

  const togglePermission = (roleKey: string, permId: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permId]: !prev[roleKey]?.[permId]
      }
    }));
  };

  // Company Profile state - default to ТОВ Едельвейс і К
  const [companyName, setCompanyName] = useState('ТОВ Едельвейс і К');
  const [companyEdrpou, setCompanyEdrpou] = useState('44123456');
  const [companyPhone, setCompanyPhone] = useState('+380432999999');

  // Nova Poshta / Rozetka / UkrPoshta state
  const [newNpAccountName, setNewNpAccountName] = useState('');
  const [rozetkaXmlUrl, setRozetkaXmlUrl] = useState('https://edelweiss.vn.ua/exports/rozetka_feed.xml');
  const [rozetkaAutoSync, setRozetkaAutoSync] = useState(true);
  const [ukrPoshtaAccounts, setUkrPoshtaAccounts] = useState<string[]>(['УкрПошта Головне відділення (Вінниця)']);
  const [newUpAccount, setNewUpAccount] = useState('');



  const copyPermissions = (fromMemberName: string) => {
    alert(`Права доступу користувача "${fromMemberName}" успішно скопійовані!`);
  };

  const stagesList = [
    { key: 'design', label: 'Черга макетування' },
    { key: 'print_queue', label: 'Черга друку' },
    { key: 'printing', label: 'У друці' },
    { key: 'post_press', label: 'Післядрукарська обробка' },
    { key: 'ready', label: 'Готово до видачі' }
  ];

  const handleToggleTransition = (fromStage: string, toStage: string) => {
    const currentAllowed = transitionMatrix[fromStage] || [];
    let updated;
    if (currentAllowed.includes(toStage)) {
      updated = currentAllowed.filter(s => s !== toStage);
    } else {
      updated = [...currentAllowed, toStage];
    }
    updateTransitionMatrix({
      ...transitionMatrix,
      [fromStage]: updated
    });
  };

  const handleDurationChange = (stageKey: string, val: number) => {
    updateStageDurations({
      ...stageDurations,
      [stageKey]: val
    });
  };

  const handleAddNpAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNpAccountName.trim()) return;
    addNovaPoshtaAccount(newNpAccountName);
    setNewNpAccountName('');
    alert('Акаунт Нової Пошти підключено успішно!');
  };

  const handleAddUpAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpAccount.trim()) return;
    setUkrPoshtaAccounts([...ukrPoshtaAccounts, newUpAccount]);
    setNewUpAccount('');
    alert('Акаунт УкрПошти підключено успішно!');
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Налаштування системи</h1>
          <p className="subtitle">Керування профілем друкарні, користувачами, філіями та інтеграціями маркетплейсів</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'profile' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'profile' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Building2 size={14} />
            Профіль компанії
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('access_matrix')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'access_matrix' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'access_matrix' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <UsersIcon size={14} />
            Налаштування доступу
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('branches')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'branches' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'branches' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <MapPin size={14} />
            Філії та склади
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'users' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'users' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <UsersIcon size={14} />
            Працівники та права
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('currencies')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'currencies' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'currencies' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <DollarSign size={14} />
            Валюти і курси
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('customfields')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'customfields' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'customfields' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <SettingsIcon size={14} />
            Користувацькі поля (Формули)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matrix_sla')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'matrix_sla' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'matrix_sla' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Shuffle size={14} />
            Матриця та SLA етапів
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('nova_poshta')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'nova_poshta' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'nova_poshta' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Truck size={14} />
            Акаунти Нової Пошти
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('rozetka')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'rozetka' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'rozetka' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <ShoppingBag size={14} />
            Інтеграція Rozetka
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ukr_poshta')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'ukr_poshta' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'ukr_poshta' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Globe size={14} />
            Інтеграція УкрПошта
          </button>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3 ios-card bg-white min-h-[400px]">
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Загальні відомості</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="ios-input-group">
                  <label className="ios-label">Юридична назва</label>
                  <input 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">ЄДРПОУ / ІПН</label>
                  <input 
                    value={companyEdrpou}
                    onChange={(e) => setCompanyEdrpou(e.target.value)}
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Контактний телефон</label>
                  <input 
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => alert('Налаштування профілю збережено.')}
                  className="ios-btn ios-btn-primary"
                >
                  Зберегти зміни
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (window.confirm('Ви впевнені, що хочете очистити базу даних та скинути всі збережені дані до початкових тестових значень?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="ios-btn ios-btn-secondary"
                  style={{ color: 'var(--danger)', borderColor: 'rgba(255,59,48,0.2)' }}
                >
                  Скинути демо-дані
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'access_matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Top sub-tabs: Філії, Користувачі, Команди, Доступи */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', gap: '16px', paddingBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAccessSubTab('branches')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    fontWeight: accessSubTab === 'branches' ? '800' : '600',
                    color: accessSubTab === 'branches' ? '#10b981' : 'var(--text-medium)',
                    borderBottom: accessSubTab === 'branches' ? '2px solid #10b981' : 'none',
                    paddingBottom: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Філії
                </button>
                <button
                  type="button"
                  onClick={() => setAccessSubTab('users')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    fontWeight: accessSubTab === 'users' ? '800' : '600',
                    color: accessSubTab === 'users' ? '#10b981' : 'var(--text-medium)',
                    borderBottom: accessSubTab === 'users' ? '2px solid #10b981' : 'none',
                    paddingBottom: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Користувачі
                </button>
                <button
                  type="button"
                  onClick={() => setAccessSubTab('teams')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    fontWeight: accessSubTab === 'teams' ? '800' : '600',
                    color: accessSubTab === 'teams' ? '#10b981' : 'var(--text-medium)',
                    borderBottom: accessSubTab === 'teams' ? '2px solid #10b981' : 'none',
                    paddingBottom: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Команди
                </button>
                <button
                  type="button"
                  onClick={() => setAccessSubTab('rights')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    fontWeight: accessSubTab === 'rights' ? '800' : '600',
                    color: accessSubTab === 'rights' ? '#10b981' : 'var(--text-medium)',
                    borderBottom: accessSubTab === 'rights' ? '2px solid #10b981' : 'none',
                    paddingBottom: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Доступи
                </button>
              </div>

              {/* Notice Banner */}
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-dark)' }}>
                Якщо відмічена галочка - то користувачам цієї ролі дозволено перегляд або дію у даній функції.
              </div>

              {/* Access Rights Table Matrix */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-medium)' }}>Функція</th>
                      <th style={{ textAlign: 'center', padding: '10px 14px', width: '180px', color: '#10b981', fontWeight: '800' }}>
                        🟢 Розробник Маркетолог
                      </th>
                      <th style={{ textAlign: 'center', padding: '10px 14px', width: '180px', color: '#10b981', fontWeight: '800' }}>
                        🟢 Працівник А Оператор
                      </th>
                      <th style={{ textAlign: 'center', padding: '10px 14px', width: '180px', color: '#10b981', fontWeight: '800' }}>
                        🟢 Працівник Б Старший друкар
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        title: 'Загальні',
                        items: [
                          { id: 'g_unlimited', name: 'Без обмежень' },
                          { id: 'g_change_mgr_assignee', name: 'Зміна відповідального у менеджерів' },
                          { id: 'g_change_origin', name: 'Зміна звідки прийшов клієнт' },
                          { id: 'g_change_deal_name', name: 'Зміна назви угод' },
                          { id: 'g_autofill', name: 'Автозаповнення' },
                          { id: 'g_change_source', name: 'Зміна джерела звернення клієнтів' },
                          { id: 'g_print_docs', name: 'Друк документів' },
                          { id: 'g_export_data', name: 'Експорт даних' },
                          { id: 'g_print_receipts', name: 'Друк чеків' },
                          { id: 'g_change_shops', name: 'Зміна Магазинів' },
                          { id: 'g_view_cash_log', name: 'Перегляд касових дій' },
                          { id: 'g_view_my_actions', name: 'Перегляд моїх дій' },
                          { id: 'g_print_thermal', name: 'Друк чеків на термопринтері' },
                        ]
                      },
                      {
                        title: 'Оплати',
                        items: [
                          { id: 'p_print_checklist', name: 'Друк чек-листа' },
                          { id: 'p_view_finance_sum', name: 'Перегляд суми у фінансах' },
                          { id: 'p_view_total_funds', name: 'Перегляд загальних коштів' },
                          { id: 'p_view_debts', name: 'Перегляд Заборгованостей' },
                          { id: 'p_export_ops', name: 'Експорт операцій за періодами' },
                        ]
                      },
                      {
                        title: 'Контрагенти',
                        items: [
                          { id: 'c_view_phones', name: 'Перегляд контактних телефонів' },
                          { id: 'c_delete_leads', name: 'Видалення звернень угод' },
                          { id: 'c_manual_deals', name: 'Ручне створення угод' },
                          { id: 'c_view_contacts', name: 'Перегляд контактів' },
                          { id: 'c_edit_my_orders', name: 'Редагування моїх замовлень' },
                          { id: 'c_edit_mgr_orders', name: 'Редагування замовлень менеджерів' },
                          { id: 'c_delete_client_orders', name: 'Видалення замовлень покупців' },
                          { id: 'c_view_client_orders', name: 'Перегляд замовлень покупців' },
                          { id: 'c_create_client_stage', name: 'Ручне створення покупця на етапі' },
                          { id: 'c_view_clients', name: 'Перегляд клієнтів' },
                          { id: 'c_unlimited', name: 'Без обмежень' },
                          { id: 'c_delete_supplier_orders', name: 'Видалення замовлень постачальників' },
                        ]
                      },
                      {
                        title: 'Угоди',
                        items: [
                          { id: 'd_change_deals', name: 'Зміна угод' },
                          { id: 'd_view_completed_points', name: 'Перегляд виконаних балів' },
                          { id: 'd_view_deal_points', name: 'Перегляд балів в угодах' },
                          { id: 'd_change_columns', name: 'Зміна граф' },
                          { id: 'd_move_stages_assignee', name: 'Переміщення по етапах залежно від відповідального' },
                          { id: 'd_edit_deal_name', name: 'Редагування назви угод' },
                          { id: 'd_unlimited_mgr_deals', name: 'Без обмежень у перегляді менеджерських угод' },
                          { id: 'd_change_order_assignee', name: 'Зміна відповідального за замовлення' },
                          { id: 'd_change_call_assignee', name: 'Зміна відповідального за дзвінки' },
                          { id: 'd_unlimited_client_orders', name: 'Без обмежень замовлення покупців' },
                          { id: 'd_unlimited_mgr_orders', name: 'Без обмежень замовлень менеджерів' },
                          { id: 'd_unlimited_leads', name: 'Без обмежень звернень угод' },
                          { id: 'd_unlimited_client_deals', name: 'Без обмежень покупця угод' },
                        ]
                      },
                      {
                        title: 'Завдання',
                        items: [
                          { id: 't_change_tasks', name: 'Зміна завдань' },
                          { id: 't_edit_task_source', name: 'Редагування звідти завдання' },
                          { id: 't_create_client_task', name: 'Створення завдання покупця' },
                          { id: 't_view_my_tasks', name: 'Перегляд моїх завдань' },
                        ]
                      },
                      {
                        title: 'Товари',
                        items: [
                          { id: 'w_manual_writeoff', name: 'Ручний списання' },
                          { id: 'w_view_stock', name: 'Перегляд залишків' },
                          { id: 'w_stock_writeoff', name: 'Списання зі складу' },
                          { id: 'w_print_inventory', name: 'Друк інвентаризації' },
                          { id: 'w_manual_stock_edit', name: 'Ручне коригування залишків' },
                          { id: 'w_print_specs', name: 'Друк Специфікацій' },
                          { id: 'w_manual_price_edit', name: 'Ручне коригування цін' },
                          { id: 'w_change_order_price', name: 'Зміна вартості у замовленнях' },
                          { id: 'w_print_acceptance', name: 'Друк накладної та актів приймання' },
                          { id: 'w_manual_name_edit', name: 'Ручне коригування найменувань' },
                          { id: 'w_print_waybill', name: 'Друк накладної та супровідних листів' },
                          { id: 'w_view_output', name: 'Перегляд виробітку' },
                        ]
                      },
                      {
                        title: 'Каса та Касири',
                        items: [
                          { id: 'cs_manual_writeoff', name: 'Ручний списання' },
                          { id: 'cs_view_cashier_stock', name: 'Перегляд залишків касирів' },
                        ]
                      },
                      {
                        title: 'Купівлі та повернення постачальників',
                        items: [
                          { id: 'p_create_purchases', name: 'Створення закупівель' },
                          { id: 'p_receive_purchase', name: 'Отримання закупівлі' },
                          { id: 'p_buy_goods', name: 'Закупівлі товару' },
                          { id: 'p_view_purchase', name: 'Перегляд закупівлі' },
                          { id: 'p_buy_client_goods', name: 'Купівлі товарів покупця' },
                          { id: 'p_view_1c_order', name: 'Перегляд замовлення виробництва' },
                          { id: 'p_writeoff_purchase_goods', name: 'Списання товару на закупівлі' },
                          { id: 'p_export_purchases', name: 'Експорт закупівлі' },
                          { id: 'p_view_waybill', name: 'Перегляд накладної' },
                          { id: 'p_create_act', name: 'Створення акту' },
                          { id: 'p_create_issue_act', name: 'Створення акту видачі' },
                          { id: 'p_writeoff_sum', name: 'Списання суми' },
                          { id: 'p_writeoff_debt', name: 'Списання боргу' },
                        ]
                      },
                      {
                        title: 'Розділ Налаштування',
                        items: [
                          { id: 's_create_settings', name: 'Створення налаштувань' },
                          { id: 's_export_systems', name: 'Експорт систем' },
                          { id: 's_group_settings', name: 'Налаштування груп' },
                          { id: 's_funnel_settings', name: 'Налаштування Воронки угод' },
                          { id: 's_cash_settings', name: 'Налаштування каси' },
                          { id: 's_validation_settings', name: 'Налаштування Валідації' },
                          { id: 's_automation_settings', name: 'Налаштування Автоматизації' },
                          { id: 's_sources_settings', name: 'Налаштування Джерел' },
                          { id: 's_fields_settings', name: 'Налаштування Полів' },
                          { id: 's_clients_settings', name: 'Налаштування Контрагентів' },
                          { id: 's_stock_settings', name: 'Налаштування Складу' },
                        ]
                      }
                    ].map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        <tr style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '800' }}>
                          <td colSpan={4} style={{ padding: '8px 14px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {group.title}
                          </td>
                        </tr>
                        {group.items.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '8px 14px', color: 'var(--text-dark)' }}>{item.name}</td>
                            <td style={{ textAlign: 'center', padding: '8px' }}>
                              <input
                                type="checkbox"
                                checked={!!rolePermissions['dev']?.[item.id]}
                                onChange={() => togglePermission('dev', item.id)}
                                style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center', padding: '8px' }}>
                              <input
                                type="checkbox"
                                checked={!!rolePermissions['op']?.[item.id]}
                                onChange={() => togglePermission('op', item.id)}
                                style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center', padding: '8px' }}>
                              <input
                                type="checkbox"
                                checked={!!rolePermissions['printer']?.[item.id]}
                                onChange={() => togglePermission('printer', item.id)}
                                style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'branches' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">Філії та Складські Локації</h2>
              </div>

              <div className="space-y-4">
                {branches.map(branch => (
                  <div key={branch.id} className="border border-slate-150 p-4 rounded-lg flex justify-between items-center bg-[#f9f9f9]" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px' }}>{branch.name}</h4>
                      <p style={{ fontSize: '11px', color: '#636366', marginTop: '2px' }}>{branch.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Команда друкарні</h2>
              
              <div className="space-y-4">
                {members.map(member => (
                  <div key={member.id} className="border border-slate-150 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#f9f9f9]" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px' }}>{member.name}</h4>
                      <p style={{ fontSize: '11px', color: '#636366', fontFamily: 'var(--font-mono)' }}>{member.email}</p>
                      <span className="ios-badge ios-badge-blue mt-2">
                        {member.role === 'admin' ? 'Адміністратор' : member.role === 'manager' ? 'Менеджер' : 'Оператор цеху'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => copyPermissions(member.name)}
                        className="ios-btn ios-btn-secondary ios-btn-small"
                      >
                        <Copy size={12} />
                        Копіювати права
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'currencies' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Валютні налаштування</h2>
              
              <div className="space-y-3">
                {currencies.map(cur => (
                  <div key={cur.code} className="border border-slate-150 p-3 rounded-lg flex justify-between items-center bg-[#f9f9f9] text-xs" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <span className="font-bold text-slate-800" style={{ fontSize: '13px' }}>{cur.code} ({cur.symbol})</span>
                      {cur.isBase && (
                        <span className="ios-badge ios-badge-green ml-2">Базова</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Курс:</span>
                      <input 
                        type="number"
                        disabled={cur.isBase}
                        value={cur.rate}
                        onChange={(e) => setCurrencies(currencies.map(c => c.code === cur.code ? { ...c, rate: Number(e.target.value) } : c))}
                        style={{ width: '80px', textAlign: 'center', height: '28px', padding: '2px 4px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'customfields' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Користувацькі поля (Формули)</h2>
              
              <div className="space-y-4">
                {customFields.map(cf => (
                  <div key={cf.id} className="border border-slate-150 p-4 rounded-lg flex justify-between items-center bg-[#f9f9f9]" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px' }}>{cf.name}</h4>
                      <span className="ios-badge ios-badge-purple mt-1 inline-block">
                        Тип: {cf.type === 'formula' ? `Формула (${cf.formulaExpression})` : cf.type === 'number' ? 'Число' : 'Текст'}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => deleteCustomField(cf.id)}
                      className="text-red-500 hover:text-red-655 p-1.5 rounded hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Field Form */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Створити нове поле</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label">Назва поля</label>
                    <input 
                      id="cf-new-name"
                      placeholder="напр. Площа виробу"
                    />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Тип поля</label>
                    <select id="cf-new-type" onChange={(e) => {
                      const formulaEl = document.getElementById('cf-formula-group');
                      if (formulaEl) {
                        formulaEl.style.display = e.target.value === 'formula' ? 'block' : 'none';
                      }
                    }}>
                      <option value="number">Число</option>
                      <option value="text">Текст</option>
                      <option value="formula">Формула (Математичний вираз)</option>
                    </select>
                  </div>
                  
                  <div className="ios-input-group" id="cf-formula-group" style={{ display: 'none' }}>
                    <label className="ios-label">Формула виразу (напр. {"{Ширина} * {Висота}"})</label>
                    <input 
                      id="cf-new-formula"
                      placeholder="{Ширина} * {Висота} * 0.05"
                    />
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px', color: '#8e8e93', fontSize: '10px' }}>
                      <HelpCircle size={12} />
                      <span>
                        Використовуйте назви існуючих числових полів у фігурних дужках. Приклад: <code>{"{Ширина} * {Висота}"}</code>.
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('cf-new-name') as HTMLInputElement;
                      const typeSelect = document.getElementById('cf-new-type') as HTMLSelectElement;
                      const formulaInput = document.getElementById('cf-new-formula') as HTMLInputElement;
                      if (!nameInput?.value) return;
                      addCustomField({
                        name: nameInput.value,
                        type: typeSelect.value as any,
                        formulaExpression: typeSelect.value === 'formula' ? formulaInput.value : undefined
                      });
                      nameInput.value = '';
                      formulaInput.value = '';
                      alert('Користувацьке поле успішно додано!');
                    }}
                    className="ios-btn ios-btn-primary"
                    style={{ width: 'fit-content', marginTop: '6px' }}
                  >
                    Додати поле
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'matrix_sla' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Матриця переходів та SLA ліміти</h2>
              
              {/* Transition Matrix Grid builder */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Shuffle size={14} style={{ color: 'var(--primary)' }} />
                  Матриця дозволених переходів статусів замовлень
                </h3>
                <p style={{ fontSize: '11px', color: '#8e8e93' }}>
                  Поставте прапорці, щоб дозволити перехід з поточного етапу (рядок) на наступний (стовпчик).
                </p>

                <div className="ios-table-container">
                  <table className="ios-table" style={{ fontSize: '11px' }}>
                    <thead>
                      <tr>
                        <th>З етапу / На етап</th>
                        {stagesList.map(st => <th key={st.key}>{st.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {stagesList.map(fromSt => (
                        <tr key={fromSt.key}>
                          <td style={{ fontWeight: '700' }}>{fromSt.label}</td>
                          {stagesList.map(toSt => {
                            const isAllowed = (transitionMatrix[fromSt.key] || []).includes(toSt.key);
                            const isSame = fromSt.key === toSt.key;
                            return (
                              <td key={toSt.key} style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox"
                                  disabled={isSame}
                                  checked={isAllowed}
                                  onChange={() => handleToggleTransition(fromSt.key, toSt.key)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SLA limits list builder */}
              <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={14} style={{ color: 'var(--primary)' }} />
                  Контроль термінів перебування (SLA)
                </h3>
                <p style={{ fontSize: '11px', color: '#8e8e93' }}>
                  Встановіть ліміт часу в годинах для кожного з виробничих етапів. Угоди, що перебувають на етапі довше ліміту, будуть позначені червоним кольором.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', alignItems: 'center' }}>
                  {stagesList.map(st => (
                    <React.Fragment key={st.key}>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>{st.label}:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input 
                          type="number"
                          value={stageDurations[st.key] || 0}
                          onChange={(e) => handleDurationChange(st.key, Number(e.target.value))}
                          style={{ height: '28px', padding: '2px 6px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '11px', color: '#8e8e93' }}>год</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'nova_poshta' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">Підключені акаунти Нової Пошти</h2>
                <p style={{ fontSize: '11px', color: '#636366', marginTop: '4px' }}>
                  Інтеграція з Новою Поштою дозволяє автоматично генерувати ТТН (товарно-транспортні накладні), розраховувати вартість доставки та відслідковувати статус посилок безпосередньо з системи.
                </p>
              </div>
              
              <div className="space-y-3">
                {novaPoshtaAccounts.map(acc => (
                  <div key={acc} className="border border-slate-150 p-3 rounded-lg flex justify-between items-center bg-[#f9f9f9] text-xs" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <span className="font-bold text-slate-850" style={{ fontSize: '13px' }}>{acc}</span>
                    <button 
                      type="button"
                      onClick={() => deleteNovaPoshtaAccount(acc)}
                      className="text-red-500 hover:text-red-655 p-1.5 rounded hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Volume Weight Calculator Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'rgba(0,122,255,0.05)', borderRadius: '8px', border: '1px solid rgba(0,122,255,0.1)', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '750', color: 'var(--text-dark)' }}>
                  <input 
                    type="checkbox" 
                    checked={npVolumeCalcEnabled} 
                    onChange={(e) => setNpVolumeCalcEnabled(e.target.checked)} 
                  />
                  Включити калькулятор об'єму за габаритами (Висота х Ширина х Довжина коробки)
                </label>
              </div>

              {/* Add NP Account Form */}
              <form onSubmit={handleAddNpAccount} className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Підключити додатковий акаунт</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div className="ios-input-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                    <label className="ios-label">Назва акаунту (напр. ФОП Петренко)</label>
                    <input 
                      required
                      placeholder="Введіть назву або API токен..."
                      value={newNpAccountName}
                      onChange={(e) => setNewNpAccountName(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="ios-btn ios-btn-primary"
                    style={{ height: '36px' }}
                  >
                    Підключити
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'rozetka' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">Інтеграція з маркетплейсом Rozetka</h2>
                <p style={{ fontSize: '11px', color: '#636366', marginTop: '4px' }}>
                  Синхронізація товарів, цін, статусів залишків на складі та автоматичний імпорт нових замовлень безпосередньо у воронку CRM ТОВ Едельвейс.
                </p>
              </div>
              
              <div style={{ backgroundColor: 'rgba(0,122,255,0.05)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(0,122,255,0.1)' }}>
                <span className="text-xs font-bold text-slate-800 block mb-1">Генератор XML прайс-листа</span>
                <p style={{ fontSize: '11px', color: '#636366', marginBottom: '8px' }}>
                  Використовуйте це посилання для автоматичного імпорту товарів та залишків складу на Rozetka.
                </p>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input readOnly value={rozetkaXmlUrl} style={{ fontSize: '11px', height: '28px', backgroundColor: '#ffffff' }} />
                  <button 
                    type="button" 
                    onClick={() => { navigator.clipboard.writeText(rozetkaXmlUrl); alert('Посилання скопійовано!'); }} 
                    className="ios-btn ios-btn-secondary ios-btn-small"
                  >
                    Копіювати
                  </button>
                </div>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Адреса XML посилання на сайті</label>
                <input value={rozetkaXmlUrl} onChange={(e) => setRozetkaXmlUrl(e.target.value)} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  <input type="checkbox" checked={rozetkaAutoSync} onChange={(e) => setRozetkaAutoSync(e.target.checked)} />
                  Автоматична синхронізація замовлень та чатів (кожні 10 хв)
                </label>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <span className="text-xs font-bold text-slate-800 block mb-2">Статус листувань та ТТН</span>
                <p style={{ fontSize: '11px', color: '#636366' }}>
                  Синхронізовано чатів: <strong>14 активних діалогів</strong>. Нові замовлення автоматично надходять у розділ *"Угоди"*.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'ukr_poshta' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">Інтеграція з УкрПошта</h2>
                <p style={{ fontSize: '11px', color: '#636366', marginTop: '4px' }}>
                  Генерація супровідних ярликів та ТТН для доставки поштових відправлень по Україні (Експрес/Стандарт) та за кордон через API УкрПошти.
                </p>
              </div>
              
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Підключені кабінети УкрПошти</span>
                {ukrPoshtaAccounts.map(acc => (
                  <div key={acc} className="border border-slate-150 p-3 rounded-lg flex justify-between items-center bg-[#f9f9f9] text-xs">
                    <span className="font-bold text-slate-850" style={{ fontSize: '12px' }}>{acc}</span>
                    <button 
                      type="button"
                      onClick={() => setUkrPoshtaAccounts(ukrPoshtaAccounts.filter(a => a !== acc))}
                      className="text-red-500 hover:text-red-655 p-1.5 rounded hover:bg-slate-100 border-none bg-transparent cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddUpAccount} className="border-t border-slate-100 pt-6 mt-6">
                <span className="text-xs font-bold text-slate-800 block mb-2">Додати кабінет УкрПошти</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div className="ios-input-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                    <label className="ios-label">Назва акаунту (напр. ТОВ Едельвейс Міжнародний)</label>
                    <input 
                      required
                      placeholder="Введіть назву кабінету..."
                      value={newUpAccount}
                      onChange={(e) => setNewUpAccount(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="ios-btn ios-btn-primary" style={{ height: '36px' }}>Підключити</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
