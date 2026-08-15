import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Wallet,
  FolderKanban
} from 'lucide-react';

interface WalletItem {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  wallet: string;
  category: string;
  description: string;
  date: string;
  dealId?: string; // Посилання на угоду
}

export const Finance: React.FC = () => {
  const { orders } = useApp();

  const [wallets, setWallets] = useState<WalletItem[]>([
    { id: 'W-1', name: 'Готівка каса', balance: 12450, currency: 'UAH' },
    { id: 'W-2', name: 'ПриватБанк ФОП', balance: 84300, currency: 'UAH' },
    { id: 'W-3', name: 'Безготівковий рахунок ТОВ', balance: 250000, currency: 'UAH' }
  ]);

  const [records, setRecords] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('crm_finance_records');
    if (saved) return JSON.parse(saved);
    const initial: FinancialRecord[] = [
      { id: 'F-1', type: 'income', amount: 4500, wallet: 'ПриватБанк ФОП', category: 'Оплата клієнта', description: 'Замовлення "Візитки для автосервісу"', date: '2026-07-24', dealId: 'ORD-2026-0001' },
      { id: 'F-2', type: 'expense', amount: 8000, wallet: 'Готівка каса', category: 'Закупівля паперу', description: 'Офсет 70г (2 пачки А1) у постачальника Папір-Світ', date: '2026-07-23' },
      { id: 'F-3', type: 'income', amount: 12000, wallet: 'Безготівковий рахунок ТОВ', category: 'Оплата клієнта', description: 'Передплата 100% за книги від ТОВ Креатив', date: '2026-07-22' },
      { id: 'F-4', type: 'expense', amount: 1500, wallet: 'Готівка каса', category: 'Господарські витрати', description: 'Купівля скотчу та плівки для упаковки', date: '2026-07-21' }
    ];
    localStorage.setItem('crm_finance_records', JSON.stringify(initial));
    return initial;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [newAmount, setNewAmount] = useState(0);
  const [newWallet, setNewWallet] = useState('Готівка каса');
  const [newCategory, setNewCategory] = useState('Оплата клієнта');
  const [newDesc, setNewDesc] = useState('');
  const [newDealId, setNewDealId] = useState('');

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

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

    // Update wallet balance
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
    // Reset Form
    setNewAmount(0);
    setNewDesc('');
    setNewDealId('');
  };

  return (
    <div className="main-content bg-[#f2f2f7]">
      <div className="header-title-container">
        <div>
          <h1 className="page-title text-slate-900">Фінансовий облік</h1>
          <p className="subtitle">Контроль кас, безготівкових рахунків та витрат друкарні</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ios-btn ios-btn-primary"
        >
          <Plus size={14} />
          Створити операцію
        </button>
      </div>

      {/* Wallets & Balances Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {wallets.map(wallet => (
          <div key={wallet.id} className="ios-card bg-white flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full text-slate-700" style={{ display: 'flex' }}>
              <Wallet size={20} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase">{wallet.name}</h4>
              <span className="text-xl font-bold text-slate-800">{wallet.balance.toFixed(2)} {wallet.currency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="ios-card flex justify-between items-center" style={{ backgroundColor: 'rgba(52, 199, 89, 0.08)', borderColor: 'rgba(52, 199, 89, 0.2)' }}>
          <div>
            <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Сукупні надходження</h4>
            <span className="text-2xl font-bold text-emerald-700">+{totalIncome.toFixed(2)} грн</span>
          </div>
          <TrendingUp size={32} className="text-emerald-500" />
        </div>
        <div className="ios-card flex justify-between items-center" style={{ backgroundColor: 'rgba(255, 59, 48, 0.08)', borderColor: 'rgba(255, 59, 48, 0.2)' }}>
          <div>
            <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider">Сукупні витрати</h4>
            <span className="text-2xl font-bold text-red-700">-{totalExpense.toFixed(2)} грн</span>
          </div>
          <TrendingDown size={32} className="text-red-500" />
        </div>
      </div>

      {/* Transactions Table Ledger */}
      <div className="ios-card bg-white space-y-4">
        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Журнал фінансових операцій</h2>
        
        <div className="ios-table-container">
          <table className="ios-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Сума</th>
                <th>Категорія</th>
                <th>Гаманець</th>
                <th>Угода (Замовлення)</th>
                <th>Опис</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td style={{ opacity: 0.7 }}>{record.date}</td>
                  <td>
                    <span className={`ios-badge ${record.type === 'income' ? 'ios-badge-green' : 'ios-badge-red'}`}>
                      {record.type === 'income' ? 'Дохід' : 'Витрата'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: record.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {record.type === 'income' ? '+' : '-'}{record.amount.toFixed(2)} грн
                  </td>
                  <td>{record.category}</td>
                  <td>{record.wallet}</td>
                  <td style={{ fontWeight: '600' }}>
                    {record.dealId ? (
                      <span className="ios-badge ios-badge-blue flex items-center gap-1 w-fit" style={{ cursor: 'pointer' }}>
                        <FolderKanban size={10} />
                        {record.dealId}
                      </span>
                    ) : (
                      <span style={{ opacity: 0.4 }}>—</span>
                    )}
                  </td>
                  <td style={{ opacity: 0.7 }} className="max-w-xs truncate">{record.description}</td>
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
