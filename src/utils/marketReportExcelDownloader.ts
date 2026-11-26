import ExcelJS from 'exceljs';
import type { MarketAuditData } from './marketReportDownloader';

export async function downloadMarketAuditExcel(data: MarketAuditData): Promise<boolean> {
  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Аналітичний відділ комерційної поліграфії';
    wb.created = new Date();
    wb.modified = new Date();

    const NAVY_HEADER = 'FF1E3A8A';
    const BLUE_SUBHEADER = 'FF2563EB';
    const LIGHT_BLUE = 'FFE0E7FF';
    const BORDER_COLOR = 'FFCBD5E1';

    const thinBorder = {
      top: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
      left: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
      right: { style: 'thin' as const, color: { argb: BORDER_COLOR } }
    };

    const headerFont = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    const cellFont = { name: 'Segoe UI', size: 10, color: { argb: 'FF0F172A' } };
    const boldCellFont = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };

    // -------------------------------------------------------------------------
    // SHEET 1: Зведена таблиця тарифів конкурентів
    // -------------------------------------------------------------------------
    const ws1 = wb.addWorksheet('Зведена таблиця тарифів', { views: [{ showGridLines: true }] });
    ws1.columns = [
      { header: 'Стаття витрат / Матеріал / Операція', key: 'item', width: 38 },
      { header: 'Од. вим.', key: 'unit', width: 12 },
      { header: 'PrintStore Group (Київ)', key: 'printstore', width: 22 },
      { header: 'Гнозіс (Київ)', key: 'gnozis', width: 20 },
      { header: 'Прінтто (Київ)', key: 'printto', width: 20 },
      { header: 'Друкарня Вольф (Київ)', key: 'wolf', width: 22 },
      { header: 'Арт-Прес (Дніпро)', key: 'artpress', width: 20 },
      { header: 'Поліграфіка (Чернівці/Київ)', key: 'poligrafika', width: 22 },
      { header: 'Коментар та джерело даних', key: 'note', width: 38 }
    ];

    ws1.mergeCells('A1:I1');
    ws1.getCell('A1').value = 'ПОРІВНЯЛЬНИЙ АНАЛІЗ СОБІВАРТОСТІ МАТЕРІАЛІВ ТА ОПЕРАЦІЙ ДРУКАРЕНЬ УКРАЇНИ';
    ws1.getCell('A1').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    ws1.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } };
    ws1.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    ws1.getRow(1).height = 30;

    ws1.mergeCells('A2:I2');
    ws1.getCell('A2').value = 'Дані дешифровано з офіційних виробничих серверів (PrintStore ERP calc_data_new, Gnozis get-config-data, Printto API, Poligrafika Nuxt 3).';
    ws1.getCell('A2').font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF475569' } };
    ws1.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    ws1.getRow(2).height = 20;

    const headerRow1 = ws1.getRow(3);
    headerRow1.height = 28;
    headerRow1.values = [
      'Стаття витрат / Матеріал / Операція',
      'Од. вим.',
      'PrintStore Group (Київ)',
      'Гнозіс (Київ)',
      'Прінтто (Київ)',
      'Друкарня Вольф (Київ)',
      'Арт-Прес (Дніпро)',
      'Поліграфіка (Чернівці/Київ)',
      'Коментар та джерело даних'
    ];
    headerRow1.eachCell(cell => {
      cell.font = headerFont;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_SUBHEADER } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = thinBorder;
    });

    const table1Data = [
      ['Папір офсетний 70–80 г/м²', 'грн / кг', '70,22', '44,82', '1,125 ₴ / арк. (клік)', '— (збірний наклад)', '— (self-cover)', '— (клік з папером)', 'Гнозіс: 1 080 $/т; PrintStore: єдиний бекенд-тариф'],
      ['Папір крейдований 80–150 г/м²', 'грн / кг', '70,22', '42,75', '4,50 ₴ / арк. (клік)', '— (збірний наклад)', '— (self-cover)', '— (клік з папером)', 'Гнозіс: 1 030 $/т; PrintStore: 70,22 ₴ на всі щільності'],
      ['Папір крейдований / картон 250 г/м²', 'грн / кг', '70,22', '52,29', '18,50 ₴ / шт (обкл)', '— (входить у спуск)', '— (лише self-cover)', '— (входить в опцію)', 'Гнозіс: 1 260 $/т; PrintStore: 50,22 кг на 1000 шт'],
      ['Друкарські пластини CTP B2', 'грн / шт', '150,00', '450,00', '— (цифровий друк)', '— (аркуш B1 на 8 робіт)', '— (офсет B2)', '— (цифровий друк)', 'PrintStore: 36 форм = 5400 ₴; Гнозіс: $forms = 450 ₴'],
      ['Друкарські пластини CTP B1', 'грн / шт', '300,00', '—', '—', '— (збірний спуск)', '—', '—', 'PrintStore використовує B1 (Heidelberg CD 102 / Roland 74)'],
      ['Поліграфічна фарба тріадна (CMYK)', 'грн / кг', '530,40', 'Входить у прогін', 'Тонер у клік-контракті', 'Входить у прогін', 'Входить у прогін', 'Тонер у клік-контракті', 'PrintStore ERP: норма 3,397 кг на 1000 шт = 1 801,75 ₴'],
      ['Приладка офсетної машини (4+4)', 'грн / прил.', '2 941,10', '700,00', '190,00 (старт)', '— (ділиться на наклад)', '— (зашито в тариф)', '—', 'PrintStore: Roland 74 (8 спусків блоку = 23 529 ₴)'],
      ['Листопрогін офсетний (за 1000 відб.)', 'грн / 1000', '665,25', '400,00 (двостор.)', 'Поаркушний клік', 'Збірний прогін XL 106', 'Листопрогін Heidelberg', 'Поаркушний клік KM', 'PrintStore: 8000 прогонів = 5322 ₴ (0,665 ₴/арк. B2)'],
      ['Плівка для ламінації (матеріал)', 'грн / м²', '8,00', 'Входить у тариф', 'Входить у тариф', 'Входить у тариф', '—', 'Входить у тариф', 'PrintStore: 1607,04 ₴ на 200,88 м² плівки (2,30 ₴/арк B2)'],
      ['Ламінація повний цикл (робота+плівка)', 'грн / арк.', '5,32 (B2)', '2,40 (B2 мат)', '15,00 (рулонна А4)', 'Входить в опцію', '— (онлайн без лам)', 'Входить в опцію', 'PrintStore: 3707,94 ₴ на наклад; Гнозіс: 2,40 ₴/арк B2'],
      ['Дріт для скріплення (матеріал)', 'грн / екз', '0,075', 'Входить у лінію', 'Входить у клік', 'Входить у лінію', 'Входить у лінію', 'Входить у лінію', 'PrintStore ERP: 75 ₴ на 1 000 екз скоби'],
      ['Скріплення на 2 скоби (робота ВШРА)', 'грн / екз', '4,33', '0,10 (+450 ₴ прил)', 'Входить у збірку', 'Автоматичне ВШРА', 'Входить у вартість', 'Входить у вартість', 'PrintStore: 4 330 ₴ на 1 000 шт; Гнозіс: 450 ₴ + 0,10 ₴/шт'],
      ['Скріплення на термоклей (КБС)', 'грн / екз', '3,65 (+1450 ₴ баз)', '2,00', 'від 25,00', 'від 60 сторінок', '—', 'від 60 сторінок', 'Гнозіс: uahBinder = 2 ₴; PrintStore: krepl=2 (+3 650 ₴)'],
      ['Фальцювання зошитів (за 1000 згинів)', 'грн / 1000', '342,50', 'Входить у вартість', 'Входить у вартість', 'Автоматичне', 'Автоматичне', 'Автоматичне', 'PrintStore: 4 зошити блоку (1370 ₴) + обкл. (770 ₴)'],
      ['Захисний лак (ВД / офсетний)', 'грн / 1000', 'Опціонально', '200,00 (170 далі)', '—', 'Twin-Spot опція', '—', '—', 'Гнозіс: uahProtected f1000=200 ₴, n1000=170 ₴'],
      ['Вибірковий УФ-лак (СУФ)', 'грн / 1000', 'Окремий процес', '800,00', 'Трафарет', 'Гібридний лак', '—', '—', 'Гнозіс: uahSUV = 800 ₴ / 1000 відбитків'],
      ['Додатковий колір Pantone', 'грн / колір', 'Окремий розрахунок', '1 700,00', 'Не підтримується', 'Окремий прогін', '—', '—', 'Гнозіс: uahPantone = 1 700 ₴'],
      ['Електроенергія цеху (наклад 1000)', 'грн', '5 656,80', 'Входить у ставку', 'Входить у тариф', 'Входить у тариф', 'Входить у тариф', 'Входить у тариф', 'PrintStore ERP: 4718 ₴ блок + 938 ₴ обкладинка'],
      ['Заробітна плата виробництва (ЗП)', 'грн', '9 966,30', 'Входить у ставку', 'Входить у тариф', 'Входить у тариф', 'Входить у тариф', 'Входить у тариф', 'PrintStore ERP: 8507 ₴ блок + 1459 ₴ обкладинка'],
      ['Виробнича маржа друкарні', '%', '48,5% (+2313 комерц)', 'Комерційна', 'Операційна маржа', 'Ринкова маржа', 'Ринкова маржа', 'Операційна маржа', 'PrintStore: чистий прибуток цеху 17 691 ₴ на накладі']
    ];

    table1Data.forEach(r => {
      const row = ws1.addRow(r);
      row.height = 20;
      row.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.font = colNumber === 1 ? boldCellFont : cellFont;
        if (colNumber === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: colNumber >= 3 && colNumber <= 8 ? 'center' : 'left' };
        }
      });
    });

    // -------------------------------------------------------------------------
    // SHEET 2: PrintStore ERP Розкладка
    // -------------------------------------------------------------------------
    const ws2 = wb.addWorksheet('PrintStore ERP Калькуляція', { views: [{ showGridLines: true }] });
    ws2.columns = [
      { header: 'Категорія витрат', key: 'cat', width: 25 },
      { header: 'Технологічна операція / Матеріал', key: 'item', width: 42 },
      { header: 'Кількість / Обсяг', key: 'qty', width: 18 },
      { header: 'Тариф / Ціна за од.', key: 'rate', width: 20 },
      { header: 'Сума, грн', key: 'sum', width: 18 },
      { header: 'Частка у собівартості', key: 'share', width: 22 }
    ];

    ws2.mergeCells('A1:F1');
    ws2.getCell('A1').value = 'ВНУТРІШНЯ ФАБРИЧНА КАЛЬКУЛЯЦІЯ PRINTSTORE GROUP (КИЇВ)';
    ws2.getCell('A1').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    ws2.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } };
    ws2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    ws2.getRow(1).height = 30;

    ws2.mergeCells('A2:F2');
    ws2.getCell('A2').value = `Наклад: ${data.quantity} прим. | Формат: ${data.format} | ${data.blockPages} сторінок блоку | Обкладинка ${data.coverPaperName} | ${data.coverLam} | ${data.binding} | Вага: ~${data.totalGrossWeightKg} кг`;
    ws2.getCell('A2').font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF475569' } };
    ws2.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    ws2.getRow(2).height = 20;

    const headerRow2 = ws2.getRow(3);
    headerRow2.height = 26;
    headerRow2.values = ['Категорія витрат', 'Технологічна операція / Матеріал', 'Кількість / Обсяг', 'Тариф / Ціна за од.', 'Сума, грн', 'Частка у собівартості'];
    headerRow2.eachCell(cell => {
      cell.font = headerFont;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_SUBHEADER } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });

    const printStoreRows = [
      ['Прямі матеріали', 'Папір внутрішнього блоку (глянець 80 г/м²)', '119,81 кг брутто (5 200 арк. B2)', '70,22 ₴ / кг', '8 412,53', '23,1%'],
      ['Прямі матеріали', 'Папір обкладинки (глянець 250 г/м²)', '50,22 кг брутто (697,5 арк. B2)', '70,22 ₴ / кг', '3 526,29', '9,7%'],
      ['Прямі матеріали', 'Друкарські пластини CTP B2 (32 блок + 4 обкл.)', '36 пластин B2', '150,00 ₴ / форму', '5 400,00', '14,8%'],
      ['Прямі матеріали', 'Поліграфічна фарба офсетна CMYK (Man Roland 74)', '3,40 кг', '530,40 ₴ / кг', '1 801,75', '4,9%'],
      ['Прямі матеріали', 'Матеріали на покриття (плівка матова ламінація)', '200,88 м² (697,5 арк. B2)', '8,00 ₴ / м² (2,30 ₴/арк)', '1 607,04', '4,4%'],
      ['Прямі матеріали', 'Матеріали на скріплення (поліграфічний дріт)', '1 000 примірників', '0,075 ₴ / прим.', '75,00', '0,2%'],
      ['РАЗОМ МАТЕРІАЛИ', 'Сумарна вартість усієї сировини на наклад', '170,03 кг паперу брутто', '—', '20 822,61', '57,1%'],
      ['Виробничі процеси', 'Приладка офсетної машини (Man Roland 74 / CD 102)', '8 блоку + 2 обкладинки', '2 941 ₴ блок / 1 330 ₴ обкл.', '26 189,84', 'Входить у процеси'],
      ['Виробничі процеси', 'Листопрогін офсетного друку', '8 000 прогонів блок + 1 000 обкл.', '665,25 ₴ / 1 000 прогонів B2', '5 825,37', 'Входить у процеси'],
      ['Виробничі процеси', 'Фальцювання зошитів блоку та обкладинки', '4 000 зошитів блок + 1 000 обкл.', '342,50 ₴ / 1 000 зошитів', '2 140,00', 'Входить у процеси'],
      ['Виробничі процеси', 'Ламінація обкладинки (машинна операція)', '697,5 аркушів B2', '3,01 ₴ / аркуш B2', '2 100,90', 'Входить у процеси'],
      ['Виробничі процеси', 'Зшивання на автоматичній лінії ВШРА', '1 000 примірників на 2 скоби', '4,33 ₴ / примірник', '4 330,00', 'Входить у процеси'],
      ['Постійні витрати цеху', 'Електроенергія виробничого цеху', '4 718 ₴ блок + 938 ₴ обкладинка', 'За нормами споживання', '5 656,80', '15,5%'],
      ['Постійні витрати цеху', 'Заробітна плата виробничого персоналу (ЗП)', '8 507 ₴ блок + 1 459 ₴ обкладинка', 'За технологічними годинами', '9 966,30', '27,3%'],
      ['РАЗОМ ПОСТІЙНІ', 'Сумарні цехові витрати (енергія + заробітна плата)', '12,6 технологічних годин', '—', '15 623,10', '42,9%'],
      ['СОБІВАРТІСТЬ', 'Чиста виробнича собівартість цеху (матеріали + постійні)', '1 000 примірників', '36,45 ₴ / примірник', '36 445,71', '100,0%'],
      ['МАРЖА ЦЕХУ', 'Виробнича маржа (чистий прибуток друкарні)', 'Норма прибутковості 48,5%', '17,69 ₴ / примірник', '17 690,99', '+48,5% надбавка'],
      ['БАЗОВА ВАРТІСТЬ', 'Базова комерційна вартість без агентських', 'Собівартість + прибуток', '54,13 ₴ / примірник', '54 131,98', '—'],
      ['КОМЕРЦІЙНА НАЦІНКА', 'Агентська / комерційна надбавка сервісу', 'Комерційний збір', '2,31 ₴ / примірник', '2 313,31', '+6,3% надбавка'],
      ['ПРАЙСОВА ЦІНА', 'Вихідна стандартна ціна онлайн-калькулятора', 'Стандартний графік', '56,45 ₴ / примірник', '56 450,00', '—'],
      ['ЦІНА ДЛЯ КЛІЄНТА', 'Кінцева відпускна ціна замовлення (термін "Планово" -6%)', `${data.printstoreMin.toLocaleString('uk-UA')} ₴`, `${(data.printstoreMin / data.quantity).toFixed(2)} ₴ / примірник`, `${data.printstoreMin.toLocaleString('uk-UA')},00`, 'Фінальний розрахунок']
    ];

    printStoreRows.forEach(r => {
      const row = ws2.addRow(r);
      row.height = 20;
      const isTotal = r[0].startsWith('РАЗОМ') || r[0] === 'СОБІВАРТІСТЬ' || r[0] === 'ЦІНА ДЛЯ КЛІЄНТА';
      row.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.font = isTotal ? boldCellFont : cellFont;
        if (isTotal) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: LIGHT_BLUE }
          };
        }
        cell.alignment = { vertical: 'middle', horizontal: colNumber >= 3 ? 'center' : 'left' };
      });
    });

    // -------------------------------------------------------------------------
    // SHEET 3: Гнозіс Тарифна Сітка
    // -------------------------------------------------------------------------
    const ws3 = wb.addWorksheet('Гнозіс Тарифна Сітка', { views: [{ showGridLines: true }] });
    ws3.columns = [
      { header: 'Код змінної у базі даних', key: 'key', width: 28 },
      { header: 'Параметр / Технологічна операція', key: 'desc', width: 42 },
      { header: 'Оригінальне значення конфігуратора', key: 'val', width: 25 },
      { header: 'Тариф у гривнях (UAH)', key: 'uah', width: 25 },
      { header: 'Технологічний коментар', key: 'note', width: 35 }
    ];

    ws3.mergeCells('A1:E1');
    ws3.getCell('A1').value = 'ВІДКРИТА БАЗА ДАНИХ ТАРИФІВ ДРУКАРНІ «ГНОЗІС» (КИЇВ)';
    ws3.getCell('A1').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    ws3.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } };
    ws3.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    ws3.getRow(1).height = 30;

    ws3.mergeCells('A2:E2');
    ws3.getCell('A2').value = 'Джерело: POST https://gnozis.com.ua/wp-admin/admin-ajax.php?action=get-config-data (CatalogStrategy pglight)';
    ws3.getCell('A2').font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF475569' } };
    ws3.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    ws3.getRow(2).height = 20;

    const headerRow3 = ws3.getRow(3);
    headerRow3.height = 26;
    headerRow3.values = ['Код змінної у базі даних', 'Параметр / Технологічна операція', 'Оригінальне значення конфігуратора', 'Тариф у гривнях (UAH)', 'Технологічний коментар'];
    headerRow3.eachCell(cell => {
      cell.font = headerFont;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_SUBHEADER } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });

    const gnozisData = [
      ['currency_rate', 'Базовий комерційний курс валют калькулятора', '41,50 ₴ / USD', '41,50 ₴', 'Курс перерахунку вартості тоннажу паперу'],
      ['$perTone.offset', 'Папір офсетний (чиста вартість за тонну)', '1 080 USD / т', '44,82 ₴ / кг', '1 080 $ * 41,50 / 1 000 кг'],
      ['$perTone.coated', 'Папір крейдований (чиста вартість за тонну)', '1 030 USD / т', '42,75 ₴ / кг', '1 030 $ * 41,50 / 1 000 кг'],
      ['$perTone.carton', 'Картон та цупкі сорти (чиста вартість за тонну)', '1 260 USD / т', '52,29 ₴ / кг', '1 260 $ * 41,50 / 1 000 кг (обкладинки від 250г)'],
      ['$forms', 'Вартість виведення однієї CTP-пластини B2', '450', '450,00 ₴ / пластину', 'Комплект 4 форми 4+0 = 1 800 ₴; 4+4 = 3 600 ₴'],
      ['$prepare', 'Приладка офсетної машини (початкова)', '700', '700,00 ₴ / приладку', 'Фіксований старт друку на машині'],
      ['$nextPrepare', 'Листопрогін офсетної машини', '200', '200,00 ₴ / 1 000 прогонів на сторону', 'Двосторонній друк 1 000 аркушів B2 = 400,00 ₴'],
      ['uahLamination.a.gloss', 'Ламінація глянцева формату B2 (серія A)', '2.2', '2,20 ₴ / аркуш B2', 'Покриття обкладинок формату B2'],
      ['uahLamination.a.matted', 'Ламінація матова формату B2 (серія A)', '2.4', '2,40 ₴ / аркуш B2', 'Покриття обкладинок формату B2'],
      ['uahLamination.b.gloss', 'Ламінація глянцева повноформатна B1 (серія B)', '2.5', '2,50 ₴ / аркуш B1', 'Покриття для великих спусків B1'],
      ['uahLamination.b.matted', 'Ламінація матова повноформатна B1 (серія B)', '2.6', '2,60 ₴ / аркуш B1', 'Покриття для великих спусків B1'],
      ['uahClip.prepare', 'Приладка дротошвейної лінії (ВШРА)', '450', '450,00 ₴', 'Фіксоване налаштування лінії шиття на скобу'],
      ['uahClip.f1to50', 'Вартість зшивки на скобу (тираж до 50 тис. шт)', '0.1', '0,10 ₴ / примірник', 'Тариф на малих та середніх накладах'],
      ['uahClip.f50to100', 'Вартість зшивки на скобу (тираж 50–100 тис. шт)', '0.096', '0,096 ₴ / примірник', 'Оптова знижка на зшивання'],
      ['uahClip.af100', 'Вартість зшивки на скобу (тираж понад 100 тис. шт)', '0.09', '0,090 ₴ / примірник', 'Максимальна оптова ставка'],
      ['uahBinder', 'Термоклей КБС (скріплення біндер)', '2', '2,00 ₴ / примірник', 'Без приладки, лінійна ставка за штуку'],
      ['uahProtected.f1000', 'Захисний ВД / офсетний лак (перші 1 000 аркушів)', '200', '200,00 ₴', 'Лакування першої тисячі відбитків'],
      ['uahProtected.n1000', 'Захисний ВД / офсетний лак (наступні 1 000 аркушів)', '170', '170,00 ₴ / 1 000', 'Знижка на обсязі нанесення захисного лаку'],
      ['uahSUV', 'Суцільний / вибірковий УФ-лак (СУФ)', '800', '800,00 ₴ / 1 000 відбитків', 'Трафаретне нанесення УФ-лаку'],
      ['uahPantone', 'Додатковий пантонний колір (Pantone)', '1700', '1 700,00 ₴ / колір', 'Змивка та налаштування фарбового апарату']
    ];

    gnozisData.forEach(r => {
      const row = ws3.addRow(r);
      row.height = 20;
      row.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.font = colNumber === 1 ? boldCellFont : cellFont;
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 3 || colNumber === 4 ? 'center' : 'left' };
      });
    });

    // -------------------------------------------------------------------------
    // SHEET 4: Порівняльний бенчмарк ринку
    // -------------------------------------------------------------------------
    const ws4 = wb.addWorksheet('Бенчмарк ринку', { views: [{ showGridLines: true }] });
    ws4.columns = [
      { header: 'Підприємство / Платформа', key: 'company', width: 28 },
      { header: 'Місто', key: 'city', width: 16 },
      { header: 'Технологія та обладнання', key: 'tech', width: 34 },
      { header: 'Виробнича собівартість', key: 'cost', width: 24 },
      { header: 'Відпускна ціна замовнику', key: 'price', width: 24 },
      { header: 'Ціна за 1 примірник', key: 'unit', width: 20 },
      { header: 'Статус відповідності ТЗ', key: 'status', width: 34 }
    ];

    ws4.mergeCells('A1:G1');
    ws4.getCell('A1').value = `ПОРІВНЯЛЬНИЙ БЕНЧМАРК ДРУКАРЕНЬ УКРАЇНИ: ЖУРНАЛ ${data.format}, ${data.blockPages} СТОР., ${data.quantity.toLocaleString('uk-UA')} ПРИМ.`;
    ws4.getCell('A1').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    ws4.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } };
    ws4.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    ws4.getRow(1).height = 30;

    ws4.mergeCells('A2:G2');
    ws4.getCell('A2').value = `Блок: ${data.blockPaperName}, ${data.blockColor} | Обкладинка: ${data.coverPaperName}, ${data.coverLam} | ${data.binding} | Вага: ~${data.totalGrossWeightKg} кг`;
    ws4.getCell('A2').font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF475569' } };
    ws4.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    ws4.getRow(2).height = 20;

    const headerRow4 = ws4.getRow(3);
    headerRow4.height = 26;
    headerRow4.values = [
      'Підприємство / Платформа',
      'Місто',
      'Технологія та обладнання',
      'Виробнича собівартість',
      'Відпускна ціна замовнику',
      'Ціна за 1 примірник',
      'Статус відповідності ТЗ'
    ];
    headerRow4.eachCell(cell => {
      cell.font = headerFont;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_SUBHEADER } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });

    const psMin = data.printstoreMin ?? 53130;
    const wMin = data.wolfMin ?? 70543;
    const gnMin = data.gnozisMin ?? 28450;
    const apMin = data.artpressMin ?? 41317;
    const ptMin = data.printtoMin ?? 98945;
    const polMin = data.poligrafikaMin ?? 129470;

    const benchmarkRows = [
      ['PrintStore Group', 'Київ', 'Офсет B1 (Roland 74 / CD 102)', '36 445,71 ₴', `${psMin.toLocaleString('uk-UA')} ₴`, `${(psMin / data.quantity).toFixed(2)} ₴`, '100% відповідність (API calc_data_new)'],
      ['Друкарня Вольф (Wolf.ua)', 'Київ', 'Збірний офсет B1 (Speedmaster XL 106)', '—', `${wMin.toLocaleString('uk-UA')} ₴`, `${(wMin / data.quantity).toFixed(2)} ₴`, '100% відповідність (збірний тираж)'],
      ['Гнозіс (Gnozis)', 'Київ', 'Офсет B2 (Komori / Heidelberg)', '14 900 ₴ (робота)', `${gnMin.toLocaleString('uk-UA')} ₴`, `${(gnMin / data.quantity).toFixed(2)} ₴`, 'Калькулятор (робота + папір)'],
      ['Арт-Прес (Art-Press)', 'Дніпро', 'Листовий офсет (Heidelberg)', '—', `${apMin.toLocaleString('uk-UA')} ₴`, `${(apMin / data.quantity).toFixed(2)} ₴`, 'Self-cover 80г без окремої обкл. 250г'],
      ['Прінтто (Printto.ua)', 'Київ', 'Цифровий On-Demand (Xerox/Canon)', '—', `${ptMin.toLocaleString('uk-UA')} ₴`, `${(ptMin / data.quantity).toFixed(2)} ₴`, '100% відповідність (API /prices)'],
      ['Поліграфіка (Poligrafika)', 'Чернівці / Київ', 'Цифровий друк (Konica Minolta KM-1)', '—', `${polMin.toLocaleString('uk-UA')} ₴`, `${(polMin / data.quantity).toFixed(2)} ₴`, 'Розрахунок від 60 с. КБС (/druk-zurnaliv)']
    ];

    benchmarkRows.forEach(r => {
      const row = ws4.addRow(r);
      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.font = colNumber === 1 ? boldCellFont : cellFont;
        cell.alignment = { vertical: 'middle', horizontal: colNumber >= 4 && colNumber <= 6 ? 'center' : 'left' };
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Порівняльний_Аналіз_Собівартості_Поліграфії_${data.format}_${data.blockPages}с_${data.quantity}шт.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (err) {
    console.error('Error generating Excel document:', err);
    return false;
  }
}
