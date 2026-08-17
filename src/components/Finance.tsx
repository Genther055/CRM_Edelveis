import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Wallet,
  CreditCard,
  Building,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface WalletItem {
  id: string;
  name: string;
  balance: number;
  currency: string;
  accountType: 'bank' | 'cash' | 'pos';
}

interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  wallet: string;
  category: string;
  description: string;
  date: string;
  dealId?: string;
  clientName?: string;
}

export const Finance: React.FC = () => {
  const { orders } = useApp();

  const [wallets, setWallets] = useState<WalletItem[]>([
    { id: 'W-1', name: 'ПриватБанк ФОП (Основний)', balance: 142500, currency: 'UAH', accountType: 'bank' },
    { id: 'W-2', name: 'Монобанк ФОП', balance: 48300, currency: 'UAH', accountType: 'bank' },
    { id: 'W-3', name: 'Готівкова каса друкарні', balance: 18450, currency: 'UAH', accountType: 'cash' },
    { id: 'W-4', name: 'Термінал POS Checkbox', balance: 12900, currency: 'UAH', accountType: 'pos' }
  ]);

  const [records, setRecords] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('crm_finance_records');
    if (saved) return JSON.parse(saved);
    const initial: FinancialRecord[] = [
      { id: 'F-101', type: 'income', amount: 14000, wallet: 'ПриватБанк ФОП (Основний)', category: 'Оплата від замовника', description: 'Оплата 100% за тираж бланки А4 (1000 шт)', date: '2026-08-17', dealId: 'ORD-31101', clientName: 'ТОВ «ФармаТрейд»' },
      { id: 'F-102', type: 'expense', amount: 18500, wallet: 'ПриватБанк ФОП (Основний)', category: 'Закупівля паперу', description: 'Закупівля крейдованого паперу 130г (5000 арк.) у ТОВ Папір-Світ', date: '2026-08-16' },
      { id: 'F-103', type: 'income', amount: 8500, wallet: 'Монобанк ФОП', category: 'Оплата від замовника', description: 'Передплата за виготовлення каталогів A4', date: '2026-08-15', dealId: 'ORD-1502', clientName: 'ПРАТ «ЕкоСок»' },
      { id: 'F-104', type: 'expense', amount: 24000, wallet: 'ПриватБанк ФОП (Основний)', category: 'Оренда приміщення', description: 'Оренда друкарського цеху за Серпень 2026', date: '2026-08-14' },
      { id: 'F-105', type: 'income', amount: 3200, wallet: 'Термінал POS Checkbox', category: 'Касовий роздріб POS', description: 'Продаж поліграфії по касі роздрібу (Чеки POS)', date: '2026-08-14' },
      { id: 'F-106', type: 'expense', amount: 12500, wallet: 'Готівкова каса друкарні', category: 'Виплата заробітної плати', description: 'Аванс другу групу працівників цеху', date: '2026-08-12' },
      { id: 'F-107', type: 'income', amount: 6400, wallet: 'ПриватБанк ФОП (Основний)', category: 'Оплата від замовника', description: 'Виготовлення меню з двосторонньою ламінацією', date: '2026-08-10', dealId: 'ORD-884', clientName: 'Кафе «Капучино»' },
      { id: 'F-108', type: 'expense', amount: 4200, wallet: 'ПриватБанк ФОП (Основний)', category: 'Сервісне обслуговування', description: 'Технічне обслуговування цифрової машини Xerox Versant', date: '2026-08-08' }
    ];
    localStorage.setItem('crm_finance_records', JSON.stringify(initial));
    return initial;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [newAmount, setNewAmount] = useState(0);
  const [newWallet, setNewWallet] = useState('ПриватБанк ФОП (Основний)');
  const [newCategory, setNewCategory] = useState('Оплата від замовника');
  const [newDesc, setNewDesc] = useState('');
  const [newDealId, setNewDealId] = useState('');

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0) return;

    const newRec: FinancialRecord = {
      id: `F-${Date.now().toString().slice(-3)}`,
      type: newType,
      amount: Number(newAmount),
      wallet: newWallet,
      category: newCategory,
      description: newDesc,
      date: new Date().toISOString().split('T')[0],
      dealId: newDealId || undefined
    };

    setWallets(wallets.map(w => {
      if (w.name === newWallet) {
        return {
          ...w,
          balance: newType === 'income' ? w.balance + Number(newAmount) : w.balance - Number(newAmount)
        };
      }
      return w;
    }));

    const updated = [newRec, ...records];
    setRecords(updated);
    localStorage.setItem('crm_finance_records', JSON.stringify(updated));

    setShowAddModal(false);
    setNewAmount(0);
    setNewDesc('');
    setNewDealId('');
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Фінансовий облік (KeepinCRM)</h1>
          <p className="subtitle">Управлінський облік грошових потоків, кас, рахунків та рентабельності</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ios-btn ios-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          Створити операцію
        </button>
      </div>

      {/* KeepinCRM Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {wallets.map(wallet => (
          <div 
            key={wallet.id} 
            className="ios-card" 
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--primary)', border: '1px solid var(--border-light)', display: 'flex' }}>
              {wallet.accountType === 'bank' ? <Building size={20} /> : wallet.accountType === 'pos' ? <CreditCard size={20} /> : <Wallet size={20} />}
            </div>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '750', color: 'var(--text-medium)', textTransform: 'uppercase', display: 'block' }}>{wallet.name}</span>
              <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>
                {wallet.balance.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)', textTransform: 'uppercase' }}>Загальні надходження (Дохід)</span>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--success)', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
              +{totalIncome.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
            </h3>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)' }}>
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)', textTransform: 'uppercase' }}>Операційні витрати (Видатки)</span>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--danger)', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
              -{totalExpense.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
            </h3>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' }}>
            <ArrowDownRight size={24} />
          </div>
        </div>

        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)', textTransform: 'uppercase' }}>Чистий операційний прибуток</span>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: netProfit >= 0 ? 'var(--primary)' : 'var(--danger)', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
              {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
            </h3>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(0, 122, 255, 0.12)', color: 'var(--primary)' }}>
            <PieChart size={24} />
          </div>
        </div>
      </div>

      {/* Transactions Table Ledger */}
      <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', margin: 0 }}>
          Журнал фінансових операцій (Ledger)
        </h2>
        
        <div className="ios-table-container">
          <table className="ios-table">
            <thead>
              <tr>
                <th style={{ color: 'var(--text-medium)' }}>Дата</th>
                <th style={{ color: 'var(--text-medium)' }}>Тип</th>
                <th style={{ color: 'var(--text-medium)' }}>Сума</th>
                <th style={{ color: 'var(--text-medium)' }}>Категорія</th>
                <th style={{ color: 'var(--text-medium)' }}>Рахунок / Гаманець</th>
                <th style={{ color: 'var(--text-medium)' }}>Угода / Замовник</th>
                <th style={{ color: 'var(--text-medium)' }}>Призначення платежу</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ color: 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>{record.date}</td>
                  <td>
                    <span className={`ios-badge ${record.type === 'income' ? 'ios-badge-green' : 'ios-badge-red'}`}>
                      {record.type === 'income' ? 'Надходження' : 'Витрата'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: record.type === 'income' ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                    {record.type === 'income' ? '+' : '-'}{record.amount.toFixed(2)} ₴
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{record.category}</td>
                  <td style={{ color: 'var(--text-medium)' }}>{record.wallet}</td>
                  <td style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                    {record.dealId ? (
                      <span className="ios-badge ios-badge-blue" style={{ cursor: 'pointer' }}>
                        💼 {record.dealId} {record.clientName ? `(${record.clientName})` : ''}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-medium)' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-medium)' }}>{record.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Finance Operation Modal */}
      {showAddModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleAddRecord} className="ios-modal" style={{ maxWidth: '450px' }}>
            <div className="ios-modal-header">
              <h2 className="ios-modal-title">Створення фінансової проводки</h2>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Тип операції</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setNewType('income'); setNewCategory('Оплата клієнта'); }}
                    className="ios-btn"
                    style={{
                      flexGrow: 1,
                      backgroundColor: newType === 'income' ? 'var(--success)' : 'rgba(120, 120, 128, 0.12)',
                      color: newType === 'income' ? '#ffffff' : 'var(--text-dark)'
                    }}
                  >
                    Дохід
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewType('expense'); setNewCategory('Закупівля паперу'); }}
                    className="ios-btn"
                    style={{
                      flexGrow: 1,
                      backgroundColor: newType === 'expense' ? 'var(--danger)' : 'rgba(120, 120, 128, 0.12)',
                      color: newType === 'expense' ? '#ffffff' : 'var(--text-dark)'
                    }}
                  >
                    Витрата
                  </button>
                </div>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Сума (грн)</label>
                <input 
                  type="number"
                  required
                  value={newAmount || ''}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="ios-input-group">
                  <label className="ios-label">Рахунок / Гаманець</label>
                  <select 
                    value={newWallet}
                    onChange={(e) => setNewWallet(e.target.value)}
                  >
                    {wallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                  </select>
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Категорія</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {newType === 'income' ? (
                      <>
                        <option value="Оплата клієнта">Оплата клієнта</option>
                        <option value="Інші доходи">Інші доходи</option>
                      </>
                    ) : (
                      <>
                        <option value="Закупівля паперу">Закупівля паперу</option>
                        <option value="Господарські витрати">Господарські витрати</option>
                        <option value="Зарплата друкарям">Зарплата друкарям</option>
                        <option value="Оренда цеху">Оренда цеху</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Linked Deal selection */}
              <div className="ios-input-group">
                <label className="ios-label">Прив'язати до Угоди (Замовлення)</label>
                <select 
                  value={newDealId}
                  onChange={(e) => setNewDealId(e.target.value)}
                >
                  <option value="">Без прив'язки до угоди</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>{order.id} ({order.name})</option>
                  ))}
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Коментар / Призначення платежу</label>
                <input 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="напр. Оплата за послуги друку"
                />
              </div>
            </div>

            <div className="ios-modal-footer">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="ios-btn ios-btn-secondary"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className="ios-btn ios-btn-primary"
              >
                Зберегти
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
