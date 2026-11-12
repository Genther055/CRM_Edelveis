import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.stdout.reconfigure(encoding='utf-8')

doc = Document()

# Set page margins (2 cm around)
for section in doc.sections:
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

# Color palette (Corporate Indigo/Navy style)
PRIMARY_HEX = "1E3A8A"      # Deep Navy
SECONDARY_HEX = "0284C7"    # Cyan/Blue
TEXT_DARK_HEX = "0F172A"    # Slate 900
BG_LIGHT_HEX = "F1F5F9"     # Slate 100
BORDER_HEX = "CBD5E1"       # Slate 300
ACCENT_GREEN = "15803D"
ACCENT_AMBER = "B45309"

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_callout(doc, title, text, bg_hex="EFF6FF", border_hex="3B82F6"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.8)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    # Left border only
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.space_before = Pt(0)
    run_t = p.add_run(f"📌 {title}\n")
    run_t.bold = True
    run_t.font.name = "Segoe UI"
    run_t.font.size = Pt(10.5)
    run_t.font.color.rgb = RGBColor.from_string(PRIMARY_HEX)
    
    run_b = p.add_run(text)
    run_b.font.name = "Segoe UI"
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = RGBColor.from_string(TEXT_DARK_HEX)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def add_custom_heading(doc, text, level=1):
    h = doc.add_heading(level=level)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Segoe UI"
    if level == 1:
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        run.font.size = Pt(15)
        run.bold = True
        run.font.color.rgb = RGBColor.from_string(PRIMARY_HEX)
    elif level == 2:
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(4)
        run.font.size = Pt(12.5)
        run.bold = True
        run.font.color.rgb = RGBColor.from_string(SECONDARY_HEX)
    else:
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
        run.font.size = Pt(11)
        run.bold = True
        run.font.color.rgb = RGBColor.from_string(TEXT_DARK_HEX)
    return h

def add_p(doc, text, bold_prefix="", space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Segoe UI"
        r_pre.font.size = Pt(10)
        r_pre.font.color.rgb = RGBColor.from_string(TEXT_DARK_HEX)
    r = p.add_run(text)
    r.font.name = "Segoe UI"
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor.from_string(TEXT_DARK_HEX)
    return p

# ----------------- DOCUMENT HEADER -----------------
title_p = doc.add_paragraph()
title_p.paragraph_format.space_before = Pt(0)
title_p.paragraph_format.space_after = Pt(2)
t_run = title_p.add_run("ТЕХНІКО-ЕКОНОМІЧНЕ ОБҐРУНТУВАННЯ ТА АЛГОРИТМ ПРОРАХУНКУ ЖУРНАЛІВ")
t_run.bold = True
t_run.font.size = Pt(18)
t_run.font.name = "Segoe UI"
t_run.font.color.rgb = RGBColor.from_string(PRIMARY_HEX)

sub_p = doc.add_paragraph()
sub_p.paragraph_format.space_after = Pt(14)
s_run = sub_p.add_run("Аналіз записів Notion (19.06), ринкових цін, архітектури формул та моделі ціноутворення для друкарні «Едельвейс і К»")
s_run.font.size = Pt(11)
s_run.font.name = "Segoe UI"
s_run.font.italic = True
s_run.font.color.rgb = RGBColor.from_string("64748B")

add_callout(
    doc,
    "ГОЛОВНИЙ ВИСНОВОК ТА СУТЬ ПРОБЛЕМИ",
    "Чому в друкарні ціна на журнали виходить суттєво меншою за ринок? Поточний розрахунок сприймає журнал як «просто стопку роздрукованого паперу», не враховуючи або занижуючи складний комплекс післядруку (фальцювання зошитів, листопідбір, біговку, проклейку на КБС чи шиття на скобу, триножову обрізку) та розхідні матеріали на приладку кожного окремого зошита. Цей документ дає математичну логіку розрахунку, яка ліквідує збитковість і захистить маржинальність друкарні.",
    bg_hex="FEF3C7",
    border_hex="F59E0B"
)

# ----------------- SECTION 1 -----------------
add_custom_heading(doc, "1. ЧОМУ ВАРТІСТЬ ЖУРНАЛІВ ЗАРАЗ ЗАНЕПАДАЄ? (СИСТЕМНИЙ АНАЛІЗ)", 1)
add_p(doc, "У поліграфічному бізнесі журнали та каталоги є технологічно найскладнішим продуктом. Якщо флаєр або візитка проходить 2 технологічні цикли (друк + порізка), то журнал проходить від 7 до 11 операцій. У типових формулах зазвичай випадають наступні ключові статті собівартості:")

add_p(doc, " Багатосторінкове видання розбивається на друкарські зошити (по 4, 8 або 16 сторінок). Якщо в журналі 48 сторінок, це 3 зошити по 16 сторінок або 6 по 8. На офсеті це 3-6 окремих комплектів пластин і 3-6 окремих приладок машини! Розраховувати їх як один спільний приладка — прямий шлях до збитку.", "1. Приладка кожного зошита, а не замовлення в цілому:")
add_p(doc, " Щоб зібрати надруковані аркуші в журнал, їх треба: а) пофальцювати (зігнути на фальцмашині); б) підібрати в правильному порядку; в) сфальцювати та скомплектувати обкладинку; г) зшити на скобу або проклеїти на термобіндері; ґ) підрізати з трьох боків (обрізка голови, ніжки та переднього поля). Ці операції вимагають амортизації 3-4 різних верстатів та оплати праці кількох робітників цеху.", "2. Реальна вартість післядрукарського збирання (Postpress):")
add_p(doc, " Корінець журналу формується стопою блоку. Чим більше сторінок і щільніший папір, тим товстіший корінець (Spine). Обкладинка на термоклей вимагає ширшого аркуша, 4 біговок (дві під корінець і дві для легкого відкриття 'хибний біг') та клею PUR/EVA, який має високу вартість розігріву та заправки.", "3. Обкладинка — це окремий складний виріб:")
add_p(doc, " До 200–300 примірників журнал економічно вигідно друкувати виключно на цифрових ЦПМ (Konica Minolta/Xerox/Canon). Від 500–1000 шт. — виключно на офсеті. Змішування логіки офсету на малих тиражах або цифрових кліків на великих дає фатальні перекоси в ціні.", "4. Відсутність чіткого розмежування Цифра vs Офсет:")

# ----------------- SECTION 2 -----------------
add_custom_heading(doc, "2. БЕНЧМАРК РИНКОВИХ ЦІН В УКРАЇНІ (ДАНІ ДРУКАРЕНЬ 2026 Р.)", 1)
add_p(doc, "Для порівняння наведено реальні ринкові ціни типових друкарень (Wolf, Арт-Прес, Huss, типографія 24) на два найпопулярніші формати журналів:")

# Table of Benchmark
tbl_bench = doc.add_table(rows=6, cols=6)
tbl_bench.alignment = WD_TABLE_ALIGNMENT.CENTER
headers = ["Формат / Вид", "Обсяг сторінок", "Тираж", "Ринкова ціна (Wolf/АртПрес)", "Ціна за 1 шт (Ринок)", "Рекомендована собівартість"]
for i, h in enumerate(headers):
    cell = tbl_bench.cell(0, i)
    cell.text = h
    set_cell_background(cell, PRIMARY_HEX)
    set_cell_margins(cell, top=120, bottom=120, left=100, right=100)
    p = cell.paragraphs[0]
    p.runs[0].font.name = "Segoe UI"
    p.runs[0].font.size = Pt(8.5)
    p.runs[0].font.bold = True
    p.runs[0].font.color.rgb = RGBColor(255, 255, 255)

bench_data = [
    ("Журнал А5 (Скоба, 4+4)", "32 стор. (блок 115г, обкл 200г)", "50 шт (Цифра)", "3 400 – 4 500 грн", "68 – 90 грн/шт", "40 – 50 грн"),
    ("Журнал А5 (Скоба, 4+4)", "32 стор. (блок 115г, обкл 200г)", "100 шт (Цифра)", "4 800 – 6 200 грн", "48 – 62 грн/шт", "30 – 38 грн"),
    ("Журнал А4 (Скоба, 4+4)", "48 стор. (блок 115г, обкл 250г+лам)", "100 шт (Цифра)", "9 500 – 12 500 грн", "95 – 125 грн/шт", "60 – 75 грн"),
    ("Журнал А4 (Термоклей КБС)", "64 стор. (блок 115г, обкл 250г+лам)", "300 шт (Цифра/Офсет)", "28 000 – 36 000 грн", "93 – 120 грн/шт", "58 – 72 грн"),
    ("Журнал А4 (Термоклей КБС)", "64 стор. (блок 115г, обкл 250г+лам)", "1 000 шт (Офсет)", "42 000 – 54 000 грн", "42 – 54 грн/шт", "26 – 34 грн"),
]

for row_idx, row in enumerate(bench_data):
    for col_idx, text in enumerate(row):
        cell = tbl_bench.cell(row_idx + 1, col_idx)
        cell.text = text
        set_cell_margins(cell, top=80, bottom=80, left=90, right=90)
        if row_idx % 2 == 1:
            set_cell_background(cell, BG_LIGHT_HEX)
        p = cell.paragraphs[0]
        p.runs[0].font.name = "Segoe UI"
        p.runs[0].font.size = Pt(8.5)
        if col_idx in [3, 4]:
            p.runs[0].font.bold = True
            p.runs[0].font.color.rgb = RGBColor.from_string(PRIMARY_HEX)

doc.add_paragraph().paragraph_format.space_after = Pt(6)

# ----------------- SECTION 3 -----------------
add_custom_heading(doc, "3. ВІДПОВІДІ НА ВІДКРИТІ ПИТАННЯ З ВАШИХ ЗАПИСІВ (NOTION 19.06)", 1)

add_p(doc, " 3-5 мм (недрукована зона SRA3 листа по периметру). Для офсетних машин (Heidelberg, Roland, Planeta): з одного боку клапан 10-12 мм (за нього машина тягне аркуш), з трьох інших боків — по 5 мм.", "• Поля друкарської машини — скільки закладати? Відповідь: Для цифрових машин —")
add_p(doc, " Офсет 4+4: мінімум 60-100 аркушів на приладку КОЖНОГО спуску смуг (зошита). Якщо у виданні 3 зошити — на приладку піде 240-300 аркушів. На післядрук: +15-20 аркушів на кожен згин (фальц), +10 аркушів на триножову обрізку, +15 аркушів на налаштування термобіндера.", "• Технічний відхід (приладка):")
add_p(doc, " Так, обов'язково! Це суворий поліграфічний закон. Будь-який папір від 170 г/м² (а особливо 200-300 г/м² на обкладинці) без біговки лопається по фарбі та волокнах на згині. Калькулятор має автоматично додавати операцію біговки та її вартість при виборі щільності ≥ 170 г/м².", "• Чи автоматично додавати біговку від 170 г/м²? Відповідь:")
add_p(doc, " Так, абсолютно обов'язкова! У поліграфії чим більший тираж, тим нижча собівартість одного відбитка, оскільки постійні витрати (приладка, пластини, налаштування верстатів) діляться на більшу кількість одиниць.", "• Регресивна шкала цін — чи потрібна? Відповідь:")
add_p(doc, " Якщо скріплення на скобу — кількість сторінок ЗАВЖДИ кратна 4. Якщо на термоклей (КБС) — кратна 8 або 16 (зошити). Якщо клієнт вводить, наприклад, 34 сторінки під скобу, калькулятор повинен автоматично пропонувати 36 сторінок (+2 сторінки нотаток) або попереджати про технологічну неможливість.", "• Кратність сторінок журналу:")

# ----------------- SECTION 4 -----------------
add_custom_heading(doc, "4. АЛГОРИТМ ТА ФОРМУЛИ ПОВНОГО РОЗРАХУНКУ ВАРТОСТІ ЖУРНАЛУ", 1)

add_p(doc, "Загальна математична формула вартості журналу має вигляд:")
add_callout(
    doc,
    "ГОЛОВНА ФОРМУЛА СОБІВАРТОСТІ ЖУРНАЛУ",
    "Собівартість = (C_обкладинка + C_блок + C_скріплення + C_постпрес + C_приладка) * (1 + k_накладні)\n"
    "Ціна_клієнта = Собівартість * (1 + Маржа_%)",
    bg_hex="F0FDF4",
    border_hex=ACCENT_GREEN
)

add_custom_heading(doc, "Крок 1. Розрахунок блоку (внутрішніх сторінок)", 2)
add_p(doc, "1.1. Перевірка кратності сторінок:\n"
          "   - Для скоби: N_pages_block = ceil(Pages / 4) * 4\n"
          "   - Для термоклею: N_pages_block = ceil(Pages / 8) * 8 (або кратне 16)\n"
          "1.2. Кількість смуг на друкарському аркуші SRA3 (320x450 мм):\n"
          "   - Для формату А4 (210х297): на 1 аркуш SRA3 вміщується 4 сторінки А4 (2 спереду, 2 ззаду = 1 розворот).\n"
          "   - Для формату А5 (148х210): на 1 аркуш SRA3 вміщується 8 сторінок А5 (4 спереду, 4 ззаду = 2 розвороти).\n"
          "1.3. Кількість аркушів блоку на 1 примірник журналу:\n"
          "   - Аркушів_на_журнал_А4 = N_pages_block / 4\n"
          "   - Аркушів_на_журнал_А5 = N_pages_block / 8\n"
          "1.4. Загальна кількість аркушів блоку на весь тираж:\n"
          "   - Листи_чисті = Аркушів_на_журнал * Тираж\n"
          "   - Листи_разом = Листи_чисті + Техвідхід_друку (від 3% до 8% залежно від тиражу) + Приладка (30-50 арк.)")

add_custom_heading(doc, "Крок 2. Розрахунок вартості паперу (за вагою або аркушами)", 2)
add_p(doc, "Для офсетного паперу та крейди в пачках застосовується точна вагова формула, записана у ваших нотатках Notion:")
add_p(doc, "Вага_паперу (кг) = (W_листа_мм * H_листа_мм * Щільність_г_м2 * Листи_разом) / 1 000 000 000\n"
          "Вартість_паперу_блоку = Вага_паперу * Ціна_за_1_кг_паперу (наприклад, 65-85 грн/кг)\n"
          "АБО за аркушами (для цифрового формату SRA3): Вартість = Листи_разом * Ціна_1_листа_SRA3")

add_custom_heading(doc, "Крок 3. Розрахунок обкладинки та корінця (Spine)", 2)
add_p(doc, "3.1. Розрахунок товщини корінця (Spine) для термоклею або товстих блоків:\n"
          "   - Товщина корінця (мм) = (Кількість_сторінок_блоку / 2) * Калібр_паперу_в_мм\n"
          "   - Орієнтовний калібр 1 листа: офсет 80г ≈ 0.1 мм; крейда 115г ≈ 0.09 мм; крейда 150г ≈ 0.12 мм.\n"
          "   - Наприклад, для 64 стор. блоку 115г: Spine = 32 * 0.09 = 2.88 мм ≈ 3 мм.\n"
          "3.2. Розмір розвороту обкладинки:\n"
          "   - Ширина = (2 * W_виробу) + Spine + (2 * Вильоти 3 мм)\n"
          "   - Висота = H_виробу + (2 * Вильоти 3 мм)\n"
          "3.3. Вартість обкладинки:\n"
          "   - Папір обкладинки (крейда 200-300 г/м²)\n"
          "   - Друк обкладинки (4+0 або 4+4)\n"
          "   - Ламінація (глянсова, матова, soft-touch — від 3.5 до 8.5 грн за сторону SRA3)\n"
          "   - Біговка (для скоби — 1 біг по центру; для термоклею — 4 біги під корінець)")

add_custom_heading(doc, "Крок 4. Скріплення та післядрукарські операції (Postpress)", 2)
add_p(doc, "Саме тут криється причина низької ціни. Кожна операція повинна мати свою ставку:")

# Table of Postpress Operations
tbl_post = doc.add_table(rows=8, cols=4)
tbl_post.alignment = WD_TABLE_ALIGNMENT.CENTER
post_headers = ["Технологічна операція", "Тип скріплення", "Базова вартість", "Технічна примітка"]
for i, h in enumerate(post_headers):
    cell = tbl_post.cell(0, i)
    cell.text = h
    set_cell_background(cell, PRIMARY_HEX)
    set_cell_margins(cell, top=100, bottom=100, left=90, right=90)
    p = cell.paragraphs[0]
    p.runs[0].font.name = "Segoe UI"
    p.runs[0].font.size = Pt(8.5)
    p.runs[0].font.bold = True
    p.runs[0].font.color.rgb = RGBColor(255, 255, 255)

post_ops = [
    ("Фальцювання зошитів", "Скоба / Клей", "0.25 – 0.40 грн / згин", "Кількість згинів = к-сть зошитів блоку"),
    ("Листопідбір блоку", "Скоба / Клей", "0.15 – 0.25 грн / зошит", "Підбір зошитів у блок перед зшиванням"),
    ("Шиття на 2 скоби (ВШРА)", "Скоба", "1.80 – 3.20 грн / журнал", "Дріт, приладка апарату + 2 удари"),
    ("Термоклей (КБС / PUR)", "Термоклей", "8.00 – 16.00 грн / журнал", "Фрезерування корінця + гарячий клей"),
    ("Пружина металева (Wire-O)", "Пружина", "14.00 – 22.00 грн / журнал", "Перфорація блоку + пружина потрібного діаметра"),
    ("Біговка обкладинки", "Усі", "0.35 грн / 1 біг", "1 біг під скобу, 4 біги під термоклей"),
    ("Триножова фінішна обрізка", "Усі", "1.20 – 2.00 грн / журнал", "Обріз трьох сторін стопи для ідеального зрізу"),
]

for row_idx, row in enumerate(post_ops):
    for col_idx, text in enumerate(row):
        cell = tbl_post.cell(row_idx + 1, col_idx)
        cell.text = text
        set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
        if row_idx % 2 == 1:
            set_cell_background(cell, BG_LIGHT_HEX)
        p = cell.paragraphs[0]
        p.runs[0].font.name = "Segoe UI"
        p.runs[0].font.size = Pt(8.5)
        if col_idx == 2:
            p.runs[0].font.bold = True
            p.runs[0].font.color.rgb = RGBColor.from_string(PRIMARY_HEX)

doc.add_paragraph().paragraph_format.space_after = Pt(6)

add_custom_heading(doc, "Крок 5. Накладні витрати та шкала маржі", 2)
add_p(doc, "5.1. Коефіцієнт накладних витрат (Overhead): до чистої вартості матеріалів та прямих робіт обов'язково додається +15-25% на покриття оренди цеху, електроенергії, зносу різака, адмінвитрат.\n"
          "5.2. Диференційована шкала маржі (залежно від тиражу):\n"
          "   - Тираж 10 – 50 шт: Маржа 80% – 120% (малий тираж вимагає високої націнки за одиницю);\n"
          "   - Тираж 100 – 300 шт: Маржа 50% – 70%;\n"
          "   - Тираж 500 – 1 000 шт: Маржа 35% – 45%;\n"
          "   - Тираж 2 000+ шт: Маржа 25% – 30%.")

# ----------------- SECTION 5 -----------------
add_custom_heading(doc, "5. ПЛАН ВПРОВАДЖЕННЯ НОВОГО МОДУЛЯ У CRM КАЛЬКУЛЯТОР", 1)
add_p(doc, "Після затвердження логіки ми реалізуємо у вкладці калькулятора «Журнали / Багатосторінкові видання»:")
add_p(doc, " Менеджер обирає тільки: формат (А4/А5), к-сть сторінок, тип скріплення (скоба/клей/пружина), щільність паперу блоку й обкладинки, тип ламінації та тираж.", "1. Зручний інтерфейс:")
add_p(doc, " Система сама визначає технологію: якщо тираж ≤ 300 шт — рахує по цифрі; якщо ≥ 500 шт — рахує по офсету (пластини, прогони, приладка).", "2. Автоматичний перемикач Цифра / Офсет:")
add_p(doc, " Повна прозорість для друкарні: окремо папір блоку, папір обкладинки, друк, ламінація, фальцування, проклейка/скоба, порізка та чистий прибуток (маржа).", "3. Розгорнутий кошторис 1С / виробництва:")
add_p(doc, " Менеджер бачить, скільки такий журнал коштує у Wolf/Арт-Прес, щоб друкарня ніколи не продавала складну роботу за безцінь.", "4. Ринковий індикатор (контроль ціни):")

output_path = r"d:\ВІЖУАЛ КОД\CRM\docs\Алгоритм_прорахунку_журналів_Edelveis.docx"
doc.save(output_path)
print(f"SUCCESS: Document saved to {output_path} (Size: {os.path.getsize(output_path)} bytes)")
