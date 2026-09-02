import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Download, 
  Plus, 
  Trash2,
  Settings,
  FileSignature,
  FileText,
  Search,
  Eye,
  FileCode,
  Edit3,
  Table as TableIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Printer,
  Save
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface DocTemplate {
  id: string;
  name: string;
  type: string;
  lastUsed: string;
  content?: string;
}



export const Documents: React.FC = () => {
  const { orders, clients } = useApp();
  // --- CRM AUTO-FILL AUTOMATION ---
  const [selectedOrderIdForDoc, setSelectedOrderIdForDoc] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<'contract' | 'invoice' | 'act' | 'spec'>('contract');

  // Helper: Format Ukrainian Date
  const getUkrainianDateString = () => {
    const months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
    const now = new Date();
    return `«${now.getDate().toString().padStart(2, '0')}» ${months[now.getMonth()]} ${now.getFullYear()} р.`;
  };

  // Generate Document HTML based on Type and Data
  const generateDocumentHTML = (type: 'contract' | 'invoice' | 'act' | 'spec', order: any, client: any) => {
    const docNum = order ? `${order.id}/26` : '64841/26';
    const dateStr = getUkrainianDateString();
    const clientName = client?.name || (order?.clientId ? (clients.find(c => c.id === order.clientId)?.name) : 'ТОВ «ФармаТрейд»') || 'Замовник';
    const clientEdrpou = client?.edrpou || '39482019';
    const clientPhone = client?.phone || '+38 (067) 840-97-81';
    const clientAddress = client?.address || 'м. Вінниця, вул. Соборна, 45';
    const clientPerson = client?.contactPerson || 'Іваненко О.П.';

    const prodName = order?.name || 'Буклети рекламні 210×297 мм, крейда 130г, 4+4';
    const prodQuantity = order?.quantity || 1000;
    const prodFormat = order?.format || 'A4 (210×297 мм)';
    const prodColors = order?.colors || '4+4 (Повноколірний)';
    const prodTotal = order?.finalPrice ? order.finalPrice.toFixed(2) : '1571.00';
    const prodUnitPrice = (Number(prodTotal) / (prodQuantity || 1)).toFixed(2);

    if (type === 'contract') {
      return `
        <div style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">ДОГОВІР ПОЛІГРАФІЧНИХ ПОСЛУГ № ${docNum}</h2>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Поліграфічна компанія «Едельвейс і К»</p>
            </div>
            <div style="text-align: right; background-color: #f8fafc; padding: 6px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-weight: 700; font-size: 12px;">м. Вінниця</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Дата: ${dateStr}</p>
            </div>
          </div>

          <p>Виконавець <strong>ТОВ «Едельвейс і К»</strong>, в особі директора Шевченка І.В., що діє на підставі Статуту, з одного боку, та Замовник <strong>${clientName}</strong>, в особі ${clientPerson}, що діє на підставі довіреності, з іншого боку, уклали цей Договір про наступне:</p>

          <h3 style="font-size: 13px; font-weight: 800; color: #2563eb; margin-top: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">1. ПРЕДМЕТ ДОГОВОРУ ТА СПЕЦИФІКАЦІЯ</h3>
          <p>Замовник доручає, а Виконавець бере на себе зобов'язання якісно та у встановлений строк виготовити наступну поліграфічну продукцію:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">№</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">Найменування продукції</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: center;">Тираж</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">Параметри друку</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right;">Сума (грн)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 8px 10px;">1</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px 10px; font-weight: 700;">${prodName}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: center; font-weight: 700;">${prodQuantity.toLocaleString()} шт.</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px 10px;">${prodFormat}, ${prodColors}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right; font-weight: 800; color: #2563eb;">${prodTotal} ₴</td>
              </tr>
            </tbody>
          </table>

          <p style="text-align: right; font-weight: 700; margin-top: 4px;">Загальна сума договору: <strong>${prodTotal} грн. Без ПДВ</strong></p>

          <h3 style="font-size: 13px; font-weight: 800; color: #2563eb; margin-top: 14px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">2. ПОРЯДОК РОЗРАХУНКІВ ТА ПРИЙОМУ РОБІТ</h3>
          <p style="font-size: 11.5px; margin: 4px 0;">2.1. Оплата здійснюється шляхом безготівкового переказу коштів на розрахунковий рахунок Виконавця.</p>
          <p style="font-size: 11.5px; margin: 4px 0;">2.2. Готова продукція передається Замовнику за Актом прийому-передачі або видатковою накладною.</p>

          <h3 style="font-size: 13px; font-weight: 800; color: #2563eb; margin-top: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">3. АДРЕСИ ТА РЕКВІЗИТИ СТОРІН</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
            <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; background-color: #f8fafc; font-size: 11px;">
              <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #0f172a;">ВИКОНАВЕЦЬ:</h4>
              <p style="margin: 0; line-height: 1.5;"><strong>ТОВ «Едельвейс і К»</strong><br/>
              м. Вінниця, вул. 600-річчя, 17, 21000<br/>
              Код ЄДРПОУ 38819201<br/>
              IBAN: UA31300001000002600112233<br/>
              Тел.: +38 (067) 840-97-81<br/><br/>
              Директор: _______________ / Шевченко І.В. /</p>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; background-color: #f8fafc; font-size: 11px;">
              <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #0f172a;">ЗАМОВНИК:</h4>
              <p style="margin: 0; line-height: 1.5;"><strong>${clientName}</strong><br/>
              Адреса: ${clientAddress}<br/>
              ЄДРПОУ / ІПН: ${clientEdrpou}<br/>
              Тел.: ${clientPhone}<br/><br/>
              Представник: _______________ / ${clientPerson} /</p>
            </div>
          </div>
        </div>
      `;
    }

    if (type === 'invoice') {
      return `
        <div style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.5;">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 0;">РАХУНОК-ФАКТУРА № ${docNum}</h1>
              <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">від ${dateStr}</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              Тип оплати: Безготівковий розрахунок
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11.5px;">
            <tr>
              <td style="padding: 4px 8px; width: 100px; font-weight: 700; color: #64748b;">Постачальник:</td>
              <td style="padding: 4px 8px; font-weight: 600;"><strong>ТОВ «Едельвейс і К»</strong>, ЄДРПОУ 38819201, р/р UA31300001000002600112233 у ПАТ «ПриватБанк», МФО 305299, м. Вінниця</td>
            </tr>
            <tr>
              <td style="padding: 4px 8px; font-weight: 700; color: #64748b;">Платник:</td>
              <td style="padding: 4px 8px; font-weight: 600;"><strong>${clientName}</strong>, ЄДРПОУ ${clientEdrpou}, тел. ${clientPhone}, ${clientAddress}</td>
            </tr>
            <tr>
              <td style="padding: 4px 8px; font-weight: 700; color: #64748b;">Підстава:</td>
              <td style="padding: 4px 8px;">Замовлення поліграфії № ${docNum}</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; width: 30px; text-align: center;">№</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px;">Товари / Послуги</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; width: 60px;">Кіл-сть</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; width: 45px;">Од.</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; width: 90px;">Ціна (грн)</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; width: 100px;">Сума (грн)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">1</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>${prodName}</strong><div style="font-size: 10.5px; color: #64748b;">${prodFormat}, ${prodColors}</div></td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: 700;">${prodQuantity}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">шт.</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-mono;">${prodUnitPrice}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: 800; color: #2563eb;">${prodTotal}</td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
            <table style="width: 260px; font-size: 12px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px; font-weight: 600;">Разом:</td>
                <td style="padding: 4px; text-align: right; font-weight: 700;">${prodTotal} грн</td>
              </tr>
              <tr>
                <td style="padding: 4px; font-weight: 600;">Без ПДВ:</td>
                <td style="padding: 4px; text-align: right; font-weight: 700;">0.00 грн</td>
              </tr>
              <tr style="border-top: 1px solid #cbd5e1;">
                <td style="padding: 6px 4px; font-weight: 800; font-size: 14px; color: #2563eb;">До сплати:</td>
                <td style="padding: 6px 4px; text-align: right; font-weight: 900; font-size: 15px; color: #2563eb;">${prodTotal} грн</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px;">Всього до сплати на суму: <strong>${prodTotal} грн. Без ПДВ</strong></p>

          <div style="display: flex; justify-content: space-between; margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
            <div style="font-size: 12px;">
              Виписав(ла): __________________ / Шевченко І.В. /
            </div>
            <div style="font-size: 12px; text-align: right;">
              М.П.
            </div>
          </div>
        </div>
      `;
    }

    if (type === 'act') {
      return `
        <div style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.5;">
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
            <h1 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase;">АКТ ПРИЙОМУ-ПЕРЕДАЧІ НАДАНИХ ПОСЛУГ № ${docNum}</h1>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">від ${dateStr}, м. Вінниця</p>
          </div>

          <p style="font-size: 12px;">Ми, що нижче підписалися, Виконавець <strong>ТОВ «Едельвейс і К»</strong> з однієї сторони, та Замовник <strong>${clientName}</strong> з іншої сторони, склали цей Акт про те, що Виконавцем були виконані, а Замовником прийняті наступні поліграфічні роботи:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; width: 30px; text-align: center;">№</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px;">Найменування робіт (послуг)</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; width: 60px;">Кіл-сть</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; width: 45px;">Од.</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; width: 90px;">Ціна (грн)</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; width: 100px;">Сума (грн)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">1</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px;">Виготовлення поліграфічної продукції: <strong>${prodName}</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: 700;">${prodQuantity}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">шт.</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">${prodUnitPrice}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: 800; color: #2563eb;">${prodTotal}</td>
              </tr>
            </tbody>
          </table>

          <p style="font-size: 12px; margin: 12px 0;">Загальна вартість виконаних робіт становить: <strong>${prodTotal} грн. Без ПДВ</strong></p>
          <p style="font-size: 11.5px; color: #475569;">Роботи виконані якісно, в повному обсязі, у встановлений строк. Сторони взаємних претензій за якістю та строками не мають.</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
            <div style="font-size: 11.5px;">
              <strong>РОБОТУ ЗДАВ (ВИКОНАВЕЦЬ):</strong><br/><br/>
              Директор ТОВ «Едельвейс і К»<br/><br/>
              _______________ / Шевченко І.В. /<br/>
              М.П.
            </div>
            <div style="font-size: 11.5px;">
              <strong>РОБОТУ ПРИЙНЯВ (ЗАМОВНИК):</strong><br/><br/>
              Представник ${clientName}<br/><br/>
              _______________ / ${clientPerson} /<br/>
              М.П.
            </div>
          </div>
        </div>
      `;
    }

    // Default Specification
    return `
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.5;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">ТЕХНОЛОГІЧНА СПЕЦИФІКАЦІЯ ЗАМОВЛЕННЯ № ${docNum}</h2>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Замовник: <strong>${clientName}</strong> | Дата: ${dateStr}</p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h3 style="font-size: 13px; font-weight: 800; color: #2563eb; margin: 0 0 8px 0;">ПАРАМЕТРИ ВИРОБУ:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><strong>Найменування:</strong> ${prodName}</div>
            <div><strong>Тираж:</strong> ${prodQuantity.toLocaleString()} шт.</div>
            <div><strong>Формат:</strong> ${prodFormat}</div>
            <div><strong>Кольоровість:</strong> ${prodColors}</div>
            <div><strong>Вартість замовлення:</strong> <span style="font-weight: 800; color: #2563eb;">${prodTotal} ₴</span></div>
            <div><strong>Ціна за 1 шт:</strong> ${prodUnitPrice} ₴</div>
          </div>
        </div>
      </div>
    `;
  };

  // Handler to perform Auto-fill
  const handleAutoFillDocument = () => {
    let orderToUse = orders.find(o => String(o.id) === String(selectedOrderIdForDoc));
    if (!orderToUse && orders.length > 0) {
      orderToUse = orders[0];
    }
    const clientToUse = orderToUse ? clients.find(c => c.id === orderToUse.clientId) : (clients[0] || null);

    const generatedHTML = generateDocumentHTML(selectedDocType, orderToUse, clientToUse);
    const docTypeTitles = {
      contract: `Договір поліграфічних послуг №${orderToUse?.id || '64841'}`,
      invoice: `Рахунок-фактура №${orderToUse?.id || '64841'}`,
      act: `Акт прийому-передачі робіт №${orderToUse?.id || '64841'}`,
      spec: `Технічна специфікація №${orderToUse?.id || '64841'}`
    };

    setDocumentTitle(docTypeTitles[selectedDocType] || 'Документ');
    if (editorRef.current) {
      editorRef.current.innerHTML = generatedHTML;
    }
    alert(`✨ Документ успішно згенеровано та заповнено реальними реквізитами замовлення №${orderToUse?.id || '64841'}!`);
  };

  const [activeSubTab, setActiveSubTab] = useState<'registry' | 'templates' | 'editor' | 'autonumber'>('registry');
  const [searchQuery, setSearchQuery] = useState('');

  const [templates, setTemplates] = useState<DocTemplate[]>([
    { id: '1', name: 'Рахунок-фактура (Стандарт)', type: 'Invoice', lastUsed: '2026-07-24' },
    { id: '2', name: 'Акт виконаних робіт (Послуги)', type: 'Act', lastUsed: '2026-07-23' },
    { id: '3', name: 'Договір про надання послуг друку', type: 'Contract', lastUsed: '2026-07-20' }
  ]);



  const [prefix, setPrefix] = useState('INV-');
  const [nextNumber, setNextNumber] = useState(143);
  const [suffix, setSuffix] = useState('/2026');

  // Selected order for detailed modal view
  const [selectedDocOrder, setSelectedDocOrder] = useState<any>(null);

  // --- EDITOR STATE ---
  const editorRef = useRef<HTMLDivElement>(null);
  const [documentTitle, setDocumentTitle] = useState('Новий документ / Специфікація №143');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(4);
  const [hasTableHeader] = useState(true);

  // Default Initial Document Canvas HTML Template
  const [editorContent] = useState<string>(`
    <div style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.6;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">ДОГОВІР ПОЛІГРАФІЧНИХ ПОСЛУГ № {номер_документа}</h2>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Поліграфічна компанія «Едельвейс і К»</p>
        </div>
        <div style="text-align: right; background-color: #f8fafc; padding: 8px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-weight: 700;">м. Вінниця</p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Дата: {дата}</p>
        </div>
      </div>

      <p>Виконавець <strong>ТОВ «Едельвейс і К»</strong> з одного боку, та Замовник <strong>{назва_замовника}</strong> з іншого боку, уклали цей Договір про наступне:</p>

      <h3 style="font-size: 14px; font-weight: 800; color: #007AFF; margin-top: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">1. ПРЕДМЕТ ДОГОВОРУ ТА СПЕЦИФІКАЦІЯ</h3>
      <p>Замовник доручає, а Виконавець бере на себе зобов'язання з виготовлення поліграфічної продукції:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">№</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">Найменування поліграфії</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">Тираж (шт)</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">Папір & Формат</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right;">Вартість (грн)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 10px;">1</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 10px;">{назва_продукції}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 10px;">{тираж}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 10px;">{формат_паперу}, {кольоровість}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right; font-weight: 700;">{сума_загалом} ₴</td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size: 14px; font-weight: 800; color: #007AFF; margin-top: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">2. ПІДПИСИ ТА РЕКВІЗИТИ СТОРІН</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; background-color: #fafafa;">
          <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800;">ВИКОНАВЕЦЬ:</h4>
          <p style="margin: 0; font-size: 11px;">ТОВ «Едельвейс і К»<br/>Код ЄДРПОУ 38819201<br/>р/р UA31300001000002600112233<br/>{підпис_директора}</p>
        </div>
        <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; background-color: #fafafa;">
          <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800;">ЗАМОВНИК:</h4>
          <p style="margin: 0; font-size: 11px;">{назва_замовника}<br/>Представник __________________<br/>М.П. / Підпис __________________</p>
        </div>
      </div>
    </div>
  `);

  // Format command exec
  const execFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  // Insert Custom CRM Variable
  const insertVariable = (variable: string) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = '#007AFF';
    span.style.fontWeight = '750';
    span.style.backgroundColor = '#e0f2fe';
    span.style.padding = '2px 6px';
    span.style.borderRadius = '4px';
    span.innerText = variable;
    range.deleteContents();
    range.insertNode(span);
  };

  // Insert Table into Editor
  const insertTable = () => {
    if (tableRows <= 0 || tableCols <= 0) return;
    let tableHTML = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; border: 1px solid #cbd5e1;">`;
    
    if (hasTableHeader) {
      tableHTML += `<thead style="background-color: #f1f5f9;"><tr>`;
      for (let c = 1; c <= tableCols; c++) {
        tableHTML += `<th style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left;">Заголовок ${c}</th>`;
      }
      tableHTML += `</tr></thead>`;
    }

    tableHTML += `<tbody>`;
    for (let r = 1; r <= tableRows; r++) {
      tableHTML += `<tr>`;
      for (let c = 1; c <= tableCols; c++) {
        tableHTML += `<td style="border: 1px solid #cbd5e1; padding: 8px 10px;">Дані R${r}C${c}</td>`;
      }
      tableHTML += `</tr>`;
    }
    tableHTML += `</tbody></table>`;

    if (editorRef.current) {
      editorRef.current.innerHTML += tableHTML;
    }
  };

  const exportEditorPDF = () => {
    if (!editorRef.current) return;
    const element = document.createElement('div');
    element.style.padding = '36px';
    element.style.backgroundColor = '#FFFFFF';
    element.style.color = '#1E293B';
    element.innerHTML = editorRef.current.innerHTML;

    const opt = {
      margin: 10,
      filename: `${documentTitle.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  const printEditorContent = () => {
    if (!editorRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; }
          </style>
        </head>
        <body>${editorRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const saveAsTemplate = () => {
    if (!editorRef.current) return;
    const name = prompt('Введіть назву для нового шаблону:', documentTitle);
    if (!name) return;
    setTemplates([...templates, {
      id: String(templates.length + 1),
      name,
      type: 'Custom',
      lastUsed: new Date().toISOString().split('T')[0],
      content: editorRef.current.innerHTML
    }]);
    alert(`Шаблон "${name}" успішно збережено в базі шаблонів CRM!`);
  };

  const addTemplate = () => {
    const name = prompt('Введіть назву нового шаблону:');
    if (!name) return;
    setTemplates([...templates, {
      id: String(templates.length + 1),
      name,
      type: 'Invoice',
      lastUsed: new Date().toISOString().split('T')[0]
    }]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const filteredOrders = orders.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (clients.find(c => c.id === o.clientId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generatePDFForOrder = (order: any) => {
    const activeClient = clients.find(c => c.id === order.clientId);
    const element = document.createElement('div');
    element.style.padding = '36px';
    element.style.backgroundColor = '#FFFFFF';
    element.style.color = '#1C1C1E';
    element.style.fontFamily = 'sans-serif';
    
    const matchNum = (order.name || '').match(/№\s*(\d+)/);
    const num = matchNum ? matchNum[1] : (order.id || '33811');

    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; gap: 16px;">
        <div>
          <h4 style="font-size: 18px; font-weight: 900; letter-spacing: -0.5px; margin: 0;">РАХУНОК-СПЕЦИФІКАЦІЯ № ${num}</h4>
          <p style="font-size: 11px; color: #636366; margin: 2px 0 0 0;">Поліграфічна компанія «Едельвейс і К»</p>
        </div>
        <div style="text-align: right; background-color: #F8FAFC; padding: 8px 14px; border-radius: 6px; border: 1px solid #E2E8F0;">
          <p style="font-size: 12px; font-weight: 700; margin: 0;">Дата: ${new Date(order.createdAt || Date.now()).toLocaleDateString('uk-UA')}</p>
          <p style="font-size: 12px; color: #1E293B; margin: 4px 0 0 0; font-weight: 600;">
            Покупець (Замовник): <span style="font-weight: 800; color: #007AFF; font-size: 13px;">${activeClient?.name || 'Замовник №1'}</span>
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2.5fr 1fr; gap: 10px; margin-bottom: 16px;">
        <div style="background-color: #F2F2F7; padding: 10px 14px; border-radius: 6px; border: 1px solid #E5E5EA;">
          <span style="font-size: 9px; font-weight: 800; color: #8E8E93; text-transform: uppercase; display: block; margin-bottom: 2px;">Продукція / Специфікація</span>
          <p style="font-size: 13px; font-weight: 800; margin: 0; color: #000;">${order.name}</p>
        </div>
        <div style="background-color: #F2F2F7; padding: 10px 14px; border-radius: 6px; border: 1px solid #E5E5EA; text-align: right;">
          <span style="font-size: 9px; font-weight: 800; color: #8E8E93; text-transform: uppercase; display: block; margin-bottom: 2px;">Тираж замовлення</span>
          <p style="font-size: 14px; font-weight: 900; margin: 0; color: #007AFF;">${order.quantity} шт.</p>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h5 style="font-size: 11px; font-weight: 800; border-bottom: 1px solid #E5E5EA; padding-bottom: 4px; margin-bottom: 8px; color: #007AFF; text-transform: uppercase; margin: 0;">
          1. Матеріали та сировина
        </h5>
        <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 10px; background-color: #FAFAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid #E5E5EA;">
          <div>
            <span style="color: #8E8E93; display: block; font-size: 10px;">Матеріал паперу:</span>
            <strong style="font-size: 11px;">${order.paperType === 'offset' ? 'Офсетний 70г' : order.paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}</strong>
          </div>
          <div>
            <span style="color: #8E8E93; display: block; font-size: 10px;">Розмір друкарського листа:</span>
            <strong style="font-size: 11px;">${order.format || 'A4'}</strong>
          </div>
          <div>
            <span style="color: #8E8E93; display: block; font-size: 10px;">Обсяг матеріалу:</span>
            <strong style="font-size: 11px;">${order.physicalSheets || 500} арк. (+${Math.ceil((order.physicalSheets || 500) * 0.05)} тех. відх.)</strong>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h5 style="font-size: 11px; font-weight: 800; border-bottom: 1px solid #E5E5EA; padding-bottom: 4px; margin-bottom: 8px; color: #007AFF; text-transform: uppercase; margin: 0;">
          2. Процес друку (Друкарська машина & Параметри)
        </h5>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #E5E5EA;">
          <tbody>
            <tr style="border-bottom: 1px solid #E5E5EA; background-color: #FAFAFC;">
              <td style="padding: 6px 10px; color: #636366; width: 30%;">Друкарська машина:</td>
              <td style="padding: 6px 10px; font-weight: 700; width: 20%;">${order.machine || 'Опція 1'}</td>
              <td style="padding: 6px 10px; color: #636366; width: 30%;">Красочність (кольоровість):</td>
              <td style="padding: 6px 10px; font-weight: 700; width: 20%;">${order.colors || '1+0'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E5EA;">
              <td style="padding: 6px 10px; color: #636366;">Однотипних листів (на арк):</td>
              <td style="padding: 6px 10px; font-weight: 700;">${order.itemsPerSheet || 2} шт./арк</td>
              <td style="padding: 6px 10px; color: #636366;">Спуск макету / оборот:</td>
              <td style="padding: 6px 10px; font-weight: 700;">${order.isSamNaSebe ? 'Сам на себе (с/с)' : 'Без обороту'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 16px;">
        <h5 style="font-size: 11px; font-weight: 800; border-bottom: 1px solid #E5E5EA; padding-bottom: 4px; margin-bottom: 8px; color: #007AFF; text-transform: uppercase; margin: 0;">
          3. Фінансовий підсумок
        </h5>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 2px solid #1C1C1E; text-align: left;">
              <th style="padding: 6px 0; font-weight: 700;">Складова замовлення</th>
              <th style="padding: 6px 0; text-align: center; font-weight: 700;">Обсяг</th>
              <th style="padding: 6px 0; text-align: right; font-weight: 700;">Сума (грн)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E5E5EA;">
              <td style="padding: 6px 0;">Макет та переддрук</td>
              <td style="padding: 6px 0; text-align: center;">1 посл.</td>
              <td style="padding: 6px 0; text-align: right;">{(order.designCost || 34).toFixed(2)} ₴</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E5EA;">
              <td style="padding: 6px 0;">Матеріали + Поліграфічний друк + Післядрукарські операції</td>
              <td style="padding: 6px 0; text-align: center;">${order.quantity} шт.</td>
              <td style="padding: 6px 0; text-align: right;">{(order.finalPrice - (order.designCost || 34)).toFixed(2)} ₴</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="font-size: 14px; font-weight: 800;">
              <td style="padding: 12px 0 0 0;" colSpan="2">РАЗОМ ДО СПЛАТИ:</td>
              <td style="padding: 12px 0 0 0; text-align: right; color: #007AFF;">${order.finalPrice.toFixed(2)} ₴</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    const fileName = `Document_№${num}.pdf`;
    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header Banner */}
      <div className="header-title-container" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} style={{ color: 'var(--primary)' }} />
            Документи & Візуальний Редактор шаблонів
          </h1>
          <p className="subtitle">Створення специфікацій, конструктор таблиць, нумерація та друк документів A4</p>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveSubTab('registry')}
          className={`ios-btn ${activeSubTab === 'registry' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '34px' }}
        >
          <FileCode size={15} />
          База розрахунків (наряди)
        </button>

        <button
          onClick={() => setActiveSubTab('editor')}
          className={`ios-btn ${activeSubTab === 'editor' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '34px', backgroundColor: activeSubTab === 'editor' ? '#10b981' : undefined, borderColor: activeSubTab === 'editor' ? '#10b981' : undefined }}
        >
          <Edit3 size={15} />
          ✏️ Редактор документів & Конструктор таблиць
        </button>

        <button
          onClick={() => setActiveSubTab('templates')}
          className={`ios-btn ${activeSubTab === 'templates' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '34px' }}
        >
          <FileSignature size={15} />
          Шаблони та Договори
        </button>

        <button
          onClick={() => setActiveSubTab('autonumber')}
          className={`ios-btn ${activeSubTab === 'autonumber' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '34px' }}
        >
          <Settings size={15} />
          Автонумерація
        </button>
      </div>

      {/* --- 1. EDITOR & TABLE BUILDER TAB --- */}
      {activeSubTab === 'editor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* ⚡ CRM SMART AUTO-FILL CONTROL BAR */}
          <div className="ios-card bg-white" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>⚡</span>
                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                  Автозаповнення з CRM:
                </span>
              </div>

              {/* Order / Deal Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)' }}>Замовлення:</span>
                <select
                  value={selectedOrderIdForDoc}
                  onChange={(e) => setSelectedOrderIdForDoc(e.target.value)}
                  style={{
                    height: '34px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '0 10px',
                    minWidth: '220px',
                    maxWidth: '320px'
                  }}
                >
                  <option value="">-- Останнє замовлення --</option>
                  {orders.map(o => {
                    const c = clients.find(cl => cl.id === o.clientId);
                    return (
                      <option key={o.id} value={o.id}>
                        №{o.id} - {o.name.slice(0, 26)}... ({c?.name || 'Клієнт'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Document Type Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)' }}>Тип документа:</span>
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-system)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  {[
                    { id: 'contract', label: 'Договір послуг' },
                    { id: 'invoice', label: 'Рахунок-фактура' },
                    { id: 'act', label: 'Акт виконаних робіт' },
                    { id: 'spec', label: 'Специфікація' }
                  ].map(dt => {
                    const isCur = selectedDocType === dt.id;
                    return (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setSelectedDocType(dt.id as any)}
                        style={{
                          fontSize: '11px',
                          fontWeight: isCur ? '800' : '600',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isCur ? 'var(--primary)' : 'transparent',
                          color: isCur ? '#ffffff' : 'var(--text-dark)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {dt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Auto-fill Button */}
            <button
              type="button"
              onClick={handleAutoFillDocument}
              className="ios-btn ios-btn-primary"
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)'
              }}
            >
              <span>✨ Заповнити реквізити</span>
            </button>
          </div>
          
          {/* Editor Header Bar & Actions */}
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexGrow: 1, maxWidth: '400px' }}>
              <Edit3 size={18} style={{ color: '#10b981' }} />
              <input 
                type="text" 
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                style={{ fontSize: '15px', fontWeight: '800', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '6px 12px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={saveAsTemplate} className="ios-btn ios-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={14} /> Зберегти як шаблон
              </button>
              <button onClick={printEditorContent} className="ios-btn ios-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={14} /> Друк (Аркуш A4)
              </button>
              <button onClick={exportEditorPDF} className="ios-btn ios-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', borderColor: '#10b981' }}>
                <Download size={14} /> Завантажити в PDF
              </button>
            </div>
          </div>

          {/* Formatting & Insert Tools Bar */}
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Toolbar Buttons Row */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)', marginRight: '6px' }}>Форматування:</span>
              <button onClick={() => execFormat('bold')} className="ios-btn ios-btn-secondary ios-btn-small" title="Жирний (Bold)"><Bold size={14} /></button>
              <button onClick={() => execFormat('italic')} className="ios-btn ios-btn-secondary ios-btn-small" title="Курсив (Italic)"><Italic size={14} /></button>
              <button onClick={() => execFormat('underline')} className="ios-btn ios-btn-secondary ios-btn-small" title="Підкреслений"><Underline size={14} /></button>
              <button onClick={() => execFormat('strikeThrough')} className="ios-btn ios-btn-secondary ios-btn-small" title="Закреслений"><Strikethrough size={14} /></button>

              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-light)', margin: '0 4px' }} />

              <button onClick={() => execFormat('justifyLeft')} className="ios-btn ios-btn-secondary ios-btn-small" title="По лівому краю"><AlignLeft size={14} /></button>
              <button onClick={() => execFormat('justifyCenter')} className="ios-btn ios-btn-secondary ios-btn-small" title="По центру"><AlignCenter size={14} /></button>
              <button onClick={() => execFormat('justifyRight')} className="ios-btn ios-btn-secondary ios-btn-small" title="По правому краю"><AlignRight size={14} /></button>
              <button onClick={() => execFormat('justifyFull')} className="ios-btn ios-btn-secondary ios-btn-small" title="По ширині"><AlignJustify size={14} /></button>

              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-light)', margin: '0 4px' }} />

              <button onClick={() => execFormat('insertUnorderedList')} className="ios-btn ios-btn-secondary ios-btn-small" title="Маркований список"><List size={14} /></button>
              <button onClick={() => execFormat('insertOrderedList')} className="ios-btn ios-btn-secondary ios-btn-small" title="Нумерований список"><ListOrdered size={14} /></button>
            </div>

            {/* Table Builder & Dynamic Variables Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
              
              {/* Table Builder Controls */}
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TableIcon size={14} style={{ color: '#10b981' }} /> Конструктор таблиць:
                </span>
                <label style={{ fontSize: '11px', color: 'var(--text-medium)' }}>
                  Рядки: <input type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(Number(e.target.value))} style={{ width: '45px', padding: '2px 4px', fontSize: '11px' }} />
                </label>
                <label style={{ fontSize: '11px', color: 'var(--text-medium)' }}>
                  Стовпчики: <input type="number" min={1} max={10} value={tableCols} onChange={(e) => setTableCols(Number(e.target.value))} style={{ width: '45px', padding: '2px 4px', fontSize: '11px' }} />
                </label>
                <button onClick={insertTable} className="ios-btn ios-btn-primary ios-btn-small" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
                  + Вставити таблицю
                </button>
              </div>

              {/* Dynamic Variables Inserter */}
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>
                  ⚡ Динамічні змінні CRM (натисніть для вставки):
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {['{номер_документа}', '{дата}', '{назва_замовника}', '{назва_продукції}', '{тираж}', '{сума_загалом}', '{формат_паперу}'].map(v => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', cursor: 'pointer', fontWeight: '600' }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Interactive Live Editable Sheet Canvas (A4 Visual Page) */}
          <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div 
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                backgroundColor: '#ffffff', 
                color: '#1e293b', 
                padding: '25mm 20mm', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
                borderRadius: '2px', 
                outline: 'none',
                boxSizing: 'border-box'
              }}
              dangerouslySetInnerHTML={{ __html: editorContent }}
            />
          </div>

        </div>
      )}

      {/* --- 2. REGISTRY TAB (НАРЯДИ) --- */}
      {activeSubTab === 'registry' && (
        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={18} style={{ color: 'var(--primary)' }} />
              База розрахованих нарядів (накопичувальна БД)
            </h2>

            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
              <input
                placeholder="Шукати замовлення або клієнта..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '32px', fontSize: '12px', width: '100%', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
              />
            </div>
          </div>

          <div className="ios-table-container">
            <table className="ios-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--text-medium)' }}>ID</th>
                  <th style={{ color: 'var(--text-medium)' }}>Назва замовлення</th>
                  <th style={{ color: 'var(--text-medium)' }}>Замовник</th>
                  <th style={{ color: 'var(--text-medium)' }}>Специфікація</th>
                  <th style={{ color: 'var(--text-medium)' }}>Сума</th>
                  <th style={{ color: 'var(--text-medium)' }}>Обладнання / Машина</th>
                  <th style={{ textAlign: 'right', color: 'var(--text-medium)' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-medium)', fontStyle: 'italic', padding: '24px' }}>
                      Немає збережених розрахунків. Зробіть розрахунок у вкладці "Калькулятор" та натисніть "Запустити у виробництво".
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const client = clients.find(c => c.id === order.clientId);
                    const clientDisplayName = (client?.name || 'Замовник №1').replace(/Контрагент А/g, 'ТОВ «ФармаТрейд»').replace(/Контрагент Б/g, 'ПРАТ «ЕкоСок»');

                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>{order.id}</td>
                        <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>{order.name}</td>
                        <td style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{clientDisplayName}</td>
                        <td style={{ fontSize: '11px', color: 'var(--text-medium)' }}>
                          <div style={{ color: 'var(--text-dark)' }}>Тираж: {order.quantity.toLocaleString()} шт, {order.colors} ({order.format})</div>
                          <div style={{ fontStyle: 'italic', color: 'var(--text-medium)' }}>{order.notes || 'Без додаткових операцій'}</div>
                        </td>
                        <td style={{ fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{order.finalPrice.toFixed(2)} ₴</td>
                        <td>
                          <span style={{ fontSize: '10px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', fontWeight: '700' }}>
                            {order.machine || 'Xerox Versant 180'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedDocOrder(order)}
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              style={{ padding: '6px' }}
                              title="Переглянути деталі"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => generatePDFForOrder(order)}
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              style={{ padding: '6px' }}
                              title="Завантажити PDF рахунок"
                            >
                              <Download size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- 3. TEMPLATES TAB --- */}
      {activeSubTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSignature size={18} style={{ color: 'var(--primary)' }} />
                  Доступні шаблони договорів
                </h2>
                <button 
                  type="button"
                  onClick={addTemplate}
                  className="ios-btn ios-btn-secondary ios-btn-small"
                >
                  <Plus size={14} />
                  Створити шаблон
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {templates.map(tmpl => (
                  <div key={tmpl.id} style={{ 
                    padding: '16px', 
                    borderRadius: 'var(--radius-lg)', 
                    border: '1px solid var(--border-light)', 
                    backgroundColor: 'var(--bg-card-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '110px',
                    position: 'relative'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-dark)', margin: 0 }}>{tmpl.name}</h4>
                      <span className="ios-badge ios-badge-blue" style={{ marginTop: '8px', display: 'inline-block' }}>{tmpl.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-medium)', borderTop: '1px solid var(--border-light)', paddingTop: '6px', marginTop: '6px' }}>
                      <span>Використано: {tmpl.lastUsed}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => deleteTemplate(tmpl.id)}
                      style={{ 
                        position: 'absolute', 
                        right: '8px', 
                        top: '8px', 
                        color: 'var(--danger)', 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. AUTONUMBER TAB --- */}
      {activeSubTab === 'autonumber' && (
        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={16} style={{ color: 'var(--primary)' }} />
            Автонумерація документів
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Префікс номера</label>
              <input 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="напр. INV-"
                style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
              />
            </div>

            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Наступний номер</label>
              <input 
                type="number"
                value={nextNumber}
                onChange={(e) => setNextNumber(Number(e.target.value))}
                style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
              />
            </div>

            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Суфікс номера</label>
              <input 
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="напр. /2026"
                style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
              />
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontWeight: '750', color: 'var(--text-medium)', textTransform: 'uppercase' }}>Приклад генерації:</span>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>{prefix}{nextNumber}{suffix}</div>
            </div>

            <button 
              type="button"
              onClick={() => alert('Налаштування автонумератора збережено.')}
              className="ios-btn ios-btn-primary w-full"
            >
              Зберегти правила
            </button>
          </div>
        </div>
      )}

      {/* Doc details view modal */}
      {selectedDocOrder && (
        <div className="ios-modal-overlay">
          <div className="ios-modal" style={{ maxWidth: '750px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Рахунок-Специфікація замовлення №{selectedDocOrder.id}</h3>
              <button onClick={() => setSelectedDocOrder(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" id="invoice-preview-container" style={{ padding: '24px', backgroundColor: '#FFFFFF', color: '#1C1C1E', fontSize: '11px', lineHeight: '1.4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px', gap: '16px' }}>
                <div style={{ flexShrink: 0 }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>
                    РАХУНОК-СПЕЦИФІКАЦІЯ № {selectedDocOrder.name.match(/№\s*(\d+)/)?.[1] || selectedDocOrder.id}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#636366', margin: '2px 0 0 0' }}>Поліграфічна компанія «Едельвейс і К»</p>
                </div>
                <div style={{ textAlign: 'right', flexGrow: 1, minWidth: '220px', backgroundColor: '#F8FAFC', padding: '8px 14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', margin: 0 }}>
                    Дата: {new Date(selectedDocOrder.createdAt || Date.now()).toLocaleDateString('uk-UA')}
                  </p>
                  <p style={{ fontSize: '12px', color: '#1E293B', margin: '4px 0 0 0', fontWeight: '600' }}>
                    Покупець (Замовник): <span style={{ fontWeight: '800', color: '#007AFF', fontSize: '13px' }}>
                      {clients.find(c => c.id === selectedDocOrder.clientId)?.name || 'Замовник №1'}
                    </span>
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#F2F2F7', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E5E5EA' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Продукція / Специфікація</span>
                  <p style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#000' }}>{selectedDocOrder.name}</p>
                </div>
                <div style={{ backgroundColor: '#F2F2F7', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E5E5EA', textAlign: 'right' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Тираж замовлення</span>
                  <p style={{ fontSize: '14px', fontWeight: '900', margin: 0, color: '#007AFF' }}>{selectedDocOrder.quantity.toLocaleString()} шт.</p>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E5E5EA', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  Фінансовий підсумок
                </h5>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #1C1C1E', textAlign: 'left' }}>
                      <th style={{ padding: '6px 0', fontWeight: '700' }}>Складова замовлення</th>
                      <th style={{ padding: '6px 0', textAlign: 'center', fontWeight: '700' }}>Обсяг</th>
                      <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700' }}>Сума (грн)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                      <td style={{ padding: '6px 0' }}>Макет та переддрук</td>
                      <td style={{ padding: '6px 0', textAlign: 'center' }}>1 посл.</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>{(selectedDocOrder.designCost || 34).toFixed(2)} ₴</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                      <td style={{ padding: '6px 0' }}>Матеріали + Поліграфічний друк + Післядрукарські операції</td>
                      <td style={{ padding: '6px 0', textAlign: 'center' }}>{selectedDocOrder.quantity} шт.</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>{(selectedDocOrder.finalPrice - (selectedDocOrder.designCost || 34)).toFixed(2)} ₴</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ fontSize: '14px', fontWeight: '800' }}>
                      <td style={{ padding: '12px 0 0 0' }} colSpan={2}>РАЗОМ ДО СПЛАТИ:</td>
                      <td style={{ padding: '12px 0 0 0', textAlign: 'right', color: '#007AFF' }}>{selectedDocOrder.finalPrice.toFixed(2)} ₴</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="ios-modal-footer">
              <button onClick={() => setSelectedDocOrder(null)} className="ios-btn ios-btn-secondary">Закрити</button>
              <button onClick={() => { generatePDFForOrder(selectedDocOrder); setSelectedDocOrder(null); }} className="ios-btn ios-btn-primary">Завантажити рахунок</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
