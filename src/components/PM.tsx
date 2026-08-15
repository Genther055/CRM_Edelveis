import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Printer, 
  Share2, 
  Filter,
  Layers,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface ProjectItem {
  id: string;
  projectName: string;
  customer: string;
  projectManager: string;
  status: 'In Process' | 'Preparing' | 'Approved' | 'On Hold';
  round: string;
  startDate: string;
  type: 'Листовий' | 'Багатосторінковий' | 'Упаковка' | 'Етикетка';
  accountManager: string;
  customerType: 'Regular' | 'New' | 'Returning';
  scenes: number;
}

export const PM: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'current' | 'all' | 'done' | 'review'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom mock data mimicking the printing design/prepress registry
  const [projects, setProjects] = useState<ProjectItem[]>([
    { id: '1', projectName: 'Каталог меблів 2026', customer: 'Контрагент А', projectManager: 'Працівник Г', status: 'In Process', round: 'Коригування тексту', startDate: '2026-08-01', type: 'Багатосторінковий', accountManager: 'Працівник Е', customerType: 'Regular', scenes: 32 },
    { id: '2', projectName: 'Євробуклети А5 (Кава)', customer: 'Контрагент Б', projectManager: 'Працівник Ж', status: 'In Process', round: 'Дизайн макету', startDate: '2026-08-05', type: 'Листовий', accountManager: 'Працівник Е', customerType: 'Regular', scenes: 2 },
    { id: '3', projectName: 'Упаковка картонна новорічна', customer: 'Контрагент В', projectManager: 'Працівник Г', status: 'In Process', round: 'Крій штампу', startDate: '2026-08-10', type: 'Упаковка', accountManager: 'Працівник Е', customerType: 'New', scenes: 1 },
    { id: '4', projectName: 'Блокноти фірмові А5', customer: 'Контрагент А', projectManager: 'Працівник Ж', status: 'In Process', round: 'Кольоропроба', startDate: '2026-08-11', type: 'Багатосторінковий', accountManager: 'Працівник Е', customerType: 'Regular', scenes: 80 },
    { id: '5', projectName: 'Етикетки самоклеючі (Сік)', customer: 'Контрагент Б', projectManager: 'Працівник Г', status: 'In Process', round: 'Верстка рулону', startDate: '2026-08-12', type: 'Етикетка', accountManager: 'Працівник Е', customerType: 'Returning', scenes: 1 },
    { id: '6', projectName: 'Флаєри двосторонні акційні', customer: 'Контрагент В', projectManager: 'Працівник Ж', status: 'In Process', round: 'Перевірка профілів', startDate: '2026-08-12', type: 'Листовий', accountManager: 'Працівник Е', customerType: 'New', scenes: 2 },
    { id: '7', projectName: 'Календарі настінні перекидні', customer: 'Контрагент А', projectManager: 'Працівник Г', status: 'Preparing', round: 'Збір фото', startDate: '2026-08-12', type: 'Багатосторінковий', accountManager: 'Працівник Й', customerType: 'Regular', scenes: 14 },
    { id: '8', projectName: 'Пакети паперові брендовані', customer: 'Контрагент Б', projectManager: 'Працівник Ж', status: 'Approved', round: 'Затверджено до друку', startDate: '2026-08-03', type: 'Упаковка', accountManager: 'Працівник Е', customerType: 'Regular', scenes: 1 }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newPM, setNewPM] = useState('Працівник Г');
  const [newType, setNewType] = useState<'Листовий' | 'Багатосторінковий' | 'Упаковка' | 'Етикетка'>('Листовий');
  const [newAM, setNewAM] = useState('Працівник Е');
  const [newCustType, setNewCustType] = useState<'Regular' | 'New' | 'Returning'>('New');
  const [newScenes, setNewScenes] = useState(2);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj: ProjectItem = {
      id: String(projects.length + 1),
      projectName: newProjectName,
      customer: newCustomer || 'Контрагент А',
      projectManager: newPM,
      status: 'Preparing',
      round: 'Початковий макет',
      startDate: new Date().toISOString().split('T')[0],
      type: newType,
      accountManager: newAM,
      customerType: newCustType,
      scenes: newScenes
    };

    setProjects([...projects, newProj]);
    setShowAddModal(false);
    setNewProjectName('');
    setNewCustomer('');
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const updateStatus = (id: string, newStatus: ProjectItem['status']) => {
    setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  // Filter list based on selected tab and search
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeSubTab === 'current') return p.status === 'In Process' || p.status === 'Preparing';
    if (activeSubTab === 'done') return p.status === 'Approved';
    if (activeSubTab === 'review') return p.status === 'On Hold';
    return true; // 'all'
  });

  return (
    <div className="main-content bg-[#f2f2f7]" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title text-slate-900">Дизайн та верстка (PM)</h1>
          <p className="subtitle">База замовлень на дизайн макетів, верстку та додрукарську підготовку</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="ios-btn ios-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          Створити проект дизайну
        </button>
      </div>

      {/* Sub-tab navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['current', 'all', 'done', 'review'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`ios-btn ${activeSubTab === tab ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
              style={{ fontSize: '12px', height: '30px', padding: '0 12px' }}
            >
              {tab === 'current' ? 'Поточні макети' : tab === 'all' ? 'Всі дизайни' : tab === 'done' ? 'Затверджено до друку' : 'На погодженні'}
            </button>
          ))}
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="ios-btn ios-btn-secondary" style={{ padding: '6px' }} title="Фільтр"><Filter size={14} /></button>
          <button className="ios-btn ios-btn-secondary" style={{ padding: '6px' }} title="Завантажити CSV"><Download size={14} /></button>
          <button className="ios-btn ios-btn-secondary" style={{ padding: '6px' }} title="Друкувати"><Printer size={14} /></button>
          <button className="ios-btn ios-btn-secondary" style={{ padding: '6px' }} title="Поділитися"><Share2 size={14} /></button>
        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="ios-card bg-white space-y-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} style={{ color: 'var(--primary)' }} />
            Реєстр макетів та додрукарської підготовки
          </h3>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)', opacity: 0.6 }} />
            <input 
              placeholder="Шукати макет за назвою..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '28px', height: '28px', fontSize: '11px', width: '100%' }}
            />
          </div>
        </div>

        <div className="ios-table-container">
          <table className="ios-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ width: '40px' }}>ID</th>
                <th>Назва виробу / Макету</th>
                <th>Контрагент</th>
                <th>Дизайнер (PM)</th>
                <th>Статус дизайну</th>
                <th>Етап роботи</th>
                <th>Створено</th>
                <th>Тип продукції</th>
                <th>Супроводжує (AM)</th>
                <th>Статус клієнта</th>
                <th style={{ textAlign: 'center' }}>Сторінок</th>
                <th style={{ textAlign: 'right' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-medium)', fontStyle: 'italic' }}>
                    Дизайнів не знайдено
                  </td>
                </tr>
              ) : (
                filteredProjects.map(proj => (
                  <tr key={proj.id}>
                    <td style={{ fontWeight: '750', fontFamily: 'var(--font-mono)' }}>{proj.id}</td>
                    <td style={{ fontWeight: '800', color: 'var(--text-dark)' }}>{proj.projectName}</td>
                    <td>{proj.customer}</td>
                    <td>{proj.projectManager}</td>
                    <td>
                      <span className={`ios-badge ${
                        proj.status === 'Approved' ? 'ios-badge-green' : 
                        proj.status === 'Preparing' ? 'ios-badge-purple' : 
                        proj.status === 'On Hold' ? 'ios-badge-red' : 'ios-badge-orange'
                      }`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {proj.status === 'Approved' ? 'Затверджено' : proj.status === 'Preparing' ? 'В розробці' : proj.status === 'On Hold' ? 'Призупинено' : 'Правки'}
                      </span>
                    </td>
                    <td style={{ opacity: 0.8 }}>{proj.round || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{proj.startDate}</td>
                    <td>
                      <span style={{ 
                        fontSize: '9px', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        backgroundColor: proj.type === 'Багатосторінковий' ? 'rgba(52,199,89,0.1)' : proj.type === 'Листовий' ? 'rgba(0,122,255,0.1)' : 'rgba(255,149,0,0.1)',
                        color: proj.type === 'Багатосторінковий' ? 'var(--success)' : proj.type === 'Листовий' ? 'var(--primary)' : 'var(--warning)',
                        fontWeight: '700'
                      }}>
                        {proj.type}
                      </span>
                    </td>
                    <td>{proj.accountManager}</td>
                    <td>{proj.customerType}</td>
                    <td style={{ textAlign: 'center', fontWeight: '800' }}>{proj.scenes}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-end' }}>
                        {proj.status !== 'Approved' && (
                          <button 
                            type="button"
                            onClick={() => updateStatus(proj.id, 'Approved')} 
                            className="ios-btn ios-btn-secondary ios-btn-small" 
                            style={{ padding: '4px' }}
                            title="Затвердити до друку"
                          >
                            <CheckCircle size={11} style={{ color: 'var(--success)' }} />
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => deleteProject(proj.id)} 
                          className="ios-btn ios-btn-secondary ios-btn-small" 
                          style={{ padding: '4px' }}
                          title="Видалити"
                        >
                          <Trash2 size={11} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Project Modal Popup */}
      {showAddModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleAddProject} className="ios-modal" style={{ maxWidth: '450px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Створити проект дизайну</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Назва виробу / макету *</label>
                <input required placeholder="напр. Каталог А4 Edelweiss" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Контрагент / Замовник *</label>
                <input required placeholder="напр. Контрагент А" value={newCustomer} onChange={(e) => setNewCustomer(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Дизайнер (PM)</label>
                  <select value={newPM} onChange={(e) => setNewPM(e.target.value)}>
                    <option value="Працівник Г">Працівник Г</option>
                    <option value="Працівник Ж">Працівник Ж</option>
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Тип продукції</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                    <option value="Листовий">Листовий</option>
                    <option value="Багатосторінковий">Багатосторінковий</option>
                    <option value="Упаковка">Упаковка</option>
                    <option value="Етикетка">Етикетка</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Супроводжує (AM)</label>
                  <select value={newAM} onChange={(e) => setNewAM(e.target.value)}>
                    <option value="Працівник Е">Працівник Е</option>
                    <option value="Працівник Й">Працівник Й</option>
                    <option value="Працівник К">Працівник К</option>
                    <option value="Працівник П">Працівник П</option>
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Кількість сторінок / смуг</label>
                  <input type="number" min="1" value={newScenes} onChange={(e) => setNewScenes(Number(e.target.value))} />
                </div>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Тип контрагента</label>
                <select value={newCustType} onChange={(e) => setNewCustType(e.target.value as any)}>
                  <option value="New">Новий клієнт (New)</option>
                  <option value="Regular">Постійний (Regular)</option>
                  <option value="Returning">Повернувся (Returning)</option>
                </select>
              </div>
            </div>

            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowAddModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти проект</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
