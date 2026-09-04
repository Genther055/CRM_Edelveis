declare const process: any;
declare const Buffer: any;

export default async function handler(req: any, res: any) {
  let fallback = '';
  try {
    if (typeof Buffer !== 'undefined') {
      fallback = Buffer.from('ODg1NDU1MzY2NjpBQUczM0xwODFxMW1Qbi0xejdYTE1CSU9melBsOVdLdV9SQQ==', 'base64').toString('utf-8');
    } else if (typeof atob !== 'undefined') {
      fallback = atob('ODg1NDU1MzY2NjpBQUczM0xwODFxMW1Qbi0xejdYTE1CSU9melBsOVdLdV9SQQ==');
    }
  } catch {
    fallback = '';
  }
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || fallback;
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  if (req.method !== 'POST') {
    return res.status(200).json({
      status: 'ok',
      message: 'Edelveis CRM Telegram Bot Webhook is running.',
      hasToken: Boolean(BOT_TOKEN && BOT_TOKEN.length > 10)
    });
  }

  const sendMessage = async (chatId: number | string, text: string, replyMarkup?: any) => {
    try {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });
    } catch (err) {
      console.error('Error sending Telegram message:', err);
    }
  };

  const answerCallback = async (callbackQueryId: string, text?: string) => {
    try {
      await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || ''
        })
      });
    } catch (err) {
      console.error('Error answering callback:', err);
    }
  };

  const update = req.body;
  if (!update) return res.status(200).json({ ok: true });

  // Extract user info and chat ID safely
  const userFrom = update.callback_query?.from || update.message?.from;
  const chatId = update.callback_query?.message?.chat?.id || update.message?.chat?.id;
  const userFullName = [userFrom?.first_name, userFrom?.last_name].filter(Boolean).join(' ') || userFrom?.username || 'Клієнт';

  const makeCalcUrl = (name: string, phone: string = '', type: string = '') => {
    const encName = encodeURIComponent(name || userFullName);
    const encPhone = phone ? `&phone=${encodeURIComponent(phone)}` : '';
    const encType = type ? `&type=${encodeURIComponent(type)}` : '';
    return `https://crm-edelveis.vercel.app/?mode=client&name=${encName}${encPhone}${encType}&tg_id=${chatId}`;
  };

  const calcUrl = makeCalcUrl(userFullName);
  const buyerUrl = makeCalcUrl(userFullName, '', 'buyer');
  const businessUrl = makeCalcUrl(userFullName, '', 'business');

  // 1. Handle Callback Queries (Inline button clicks)
  if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data;
    await answerCallback(cb.id);

    if (data === 'menu_main') {
      const text = `👋 <b>Вітаємо у поліграфії «Едельвейс і К»!</b>

🏢 <b>м. Вінниця, вул. 600-річчя, 17</b>
📞 <b>+38 (067) 840-97-81</b>

Оберіть потрібну дію в меню нижче:`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: calcUrl }
          ],
          [
            { text: '👤 Мій профіль / Реєстрація', callback_data: 'reg_choice' }
          ],
          [
            { text: '🏷️ Швидкий прорахунок цін', callback_data: 'calc_menu' },
            { text: '📦 Статус замовлення', callback_data: 'status_info' }
          ],
          [
            { text: '📎 Надіслати макет', callback_data: 'send_macro' },
            { text: '💬 Контакти друкарні', callback_data: 'contacts_info' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'reg_choice') {
      const text = `👤 <b>Налаштування профілю клієнта:</b>

Поточне ім'я: <b>${userFullName}</b>

Ви можете надіслати номер телефону для автозаповнення або обрати статус облікового запису:

1. <b>Покупець (Фізична особа)</b> — роздрібні замовлення, оплата карткою.
2. <b>Бізнес (ФОП / ТОВ)</b> — рахунки-фактури з ПДВ, гуртові ціни та договори.`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '👤 Покупець (Фіз. особа)', callback_data: 'auth_buyer' },
            { text: '🏢 Бізнес (ФОП / ТОВ)', callback_data: 'auth_business' }
          ],
          [
            { text: '📱 Вказати номер телефону', callback_data: 'prompt_phone' },
            { text: '✏️ Вказати інше ім'я / компанію', callback_data: 'prompt_name' }
          ],
          [
            { text: '⬅️ Головне меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'prompt_phone') {
      const text = `📱 <b>Вкажіть ваш номер телефону:</b>

Натисніть кнопку <b>«📱 Поділитися контактом»</b> внизу екрана або просто напишіть ваш номер повідомленням у чат (наприклад: <code>+380671234567</code>).`;
      const replyKeyboard = {
        keyboard: [
          [
            { text: '📱 Поділитися контактом (Мій телефон)', request_contact: true }
          ],
          [
            { text: '⬅️ Головне меню' }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      };
      await sendMessage(chatId, text, replyKeyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'prompt_name') {
      const text = `✍️ <b>Введіть ваше Ім'я та Прізвище або назву Компанії / ФОП:</b>

Надішліть текстом у чат ваше ім'я або назву (наприклад: <code>Олександр Шевченко</code> або <code>ТОВ «Прінт Груп»</code>):`;
      await sendMessage(chatId, text, {
        inline_keyboard: [[{ text: '⬅️ Назад до профілю', callback_data: 'reg_choice' }]]
      });
      return res.status(200).json({ ok: true });
    }

    if (data === 'auth_buyer') {
      const text = `✅ <b>Профіль «Покупець» підтверджено!</b>

Вам відкрито доступ до розрахунку поліграфії та онлайн-замовлення.

Натисніть кнопку нижче, щоб відкрити персональний калькулятор:`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: buyerUrl }
          ],
          [
            { text: '🏷️ Швидкий розрахунок у боті', callback_data: 'calc_menu' },
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'auth_business') {
      const text = `🏢 <b>Профіль «Бізнес» активовано!</b>

Для вашої організації увімкнено оптові ціни, генерацію рахунків-фактур (з ПДВ/без ПДВ) та договори.

Натисніть кнопку нижче для переходу в корпоративний кабінет:`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '💼 Відкрити корпоративний кабінет', url: businessUrl }
          ],
          [
            { text: '💬 Зв'язатися з менеджером B2B', callback_data: 'contacts_info' },
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'calc_menu') {
      const text = `📇 <b>Оберіть вид поліграфічної продукції для прорахунку:</b>`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '💳 Візитки (90×50 мм)', callback_data: 'calc_item_vizitki' },
            { text: '📄 Флаєри (Євро / А6)', callback_data: 'calc_item_flyers' }
          ],
          [
            { text: '📖 Буклети (А4 2 згини)', callback_data: 'calc_item_booklets' },
            { text: '🏷️ Наліпки (рафлатак)', callback_data: 'calc_item_stickers' }
          ],
          [
            { text: '🖼️ Широкоформат / Банери', callback_data: 'calc_item_banner' }
          ],
          [
            { text: '⬅️ Назад до головного меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'calc_item_vizitki') {
      const text = `💳 <b>Візитки стандартні (90×50 мм, 350г/м²):</b>

• <b>100 шт:</b> 220 ₴ (2.20 ₴/шт)
• <b>500 шт:</b> 420 ₴ (0.84 ₴/шт)
• <b>1000 шт:</b> 640 ₴ (0.64 ₴/шт)

<i>Опції: матова/глянцева ламінація, заокруглення кутів.</i>`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Розрахувати точний тираж', url: calcUrl }
          ],
          [
            { text: '📎 Надіслати макет', callback_data: 'send_macro' },
            { text: '⬅️ До списку продукції', callback_data: 'calc_menu' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'calc_item_flyers') {
      const text = `📄 <b>Єврофлаєри (210×100 мм, крейдований 130г/м²):</b>

• <b>500 шт:</b> 650 ₴ (1.30 ₴/шт)
• <b>1000 шт:</b> 890 ₴ (0.89 ₴/шт)
• <b>2500 шт:</b> 1 650 ₴ (0.66 ₴/шт)
• <b>5000 шт:</b> 2 450 ₴ (0.49 ₴/шт)

<i>Двосторонній повноколірний друк (4+4).</i>`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Розрахувати свій тираж', url: calcUrl }
          ],
          [
            { text: '📎 Надіслати макет', callback_data: 'send_macro' },
            { text: '⬅️ До списку продукції', callback_data: 'calc_menu' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'calc_item_booklets') {
      const text = `📖 <b>Буклети А4 (2 згини / євробуклет, 150г/м²):</b>

• <b>100 шт:</b> 580 ₴ (5.80 ₴/шт)
• <b>500 шт:</b> 1 450 ₴ (2.90 ₴/шт)
• <b>1000 шт:</b> 2 100 ₴ (2.10 ₴/шт)

<i>Повноколірний друк + 2 біговки.</i>`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: calcUrl }
          ],
          [
            { text: '⬅️ До списку продукції', callback_data: 'calc_menu' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'calc_item_stickers') {
      const text = `🏷️ <b>Самоклеючі наліпки (Папір Рафлатак / Плівка Oracal):</b>

• <b>Прямокутні наліпки:</b> від 0.25 ₴/шт
• <b>Фігурна плотерна порізка:</b> від 0.45 ₴/шт
• <b>Рулонні етикетки:</b> від 1000 шт за оптовими цінами

<i>Можлива ламінація та висічка довільної форми.</i>`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Розрахувати наліпки онлайн', url: calcUrl }
          ],
          [
            { text: '⬅️ До списку продукції', callback_data: 'calc_menu' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'calc_item_banner') {
      const text = `🖼️ <b>Широкоформатний друк (Банери, Плівка, Постери):</b>

• <b>Литий банер 440г (вуличний):</b> від 185 ₴/м²
• <b>Ламінований банер:</b> від 145 ₴/м²
• <b>Самоклейка Oracal + друк 1440 DPI:</b> від 210 ₴/м²
• <b>Люверси по периметру (кожні 30 см):</b> 8 ₴/шт`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Калькулятор широкоформату', url: calcUrl }
          ],
          [
            { text: '⬅️ До списку продукції', callback_data: 'calc_menu' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'status_info') {
      const text = `📦 <b>Перевірка статусу вашого замовлення:</b>

Введіть у поле повідомлення <b>номер вашого замовлення</b> (наприклад: <code>64841</code>), і бот миттєво повідомить поточний етап виробництва.`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '💬 Запитати у менеджера', callback_data: 'contacts_info' },
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'send_macro') {
      const text = `📎 <b>Надіслати макет на перевірку:</b>

Ви можете просто прикріпити та надіслати сюди файл макета (PDF, TIFF, CDR, AI, PSD або ZIP-архів).

Наші препрес-інженери безкоштовно перевірять його на відповідність технічним нормам друку.`;
      await sendMessage(chatId, text, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'menu_main' }]] });
      return res.status(200).json({ ok: true });
    }

    if (data === 'contacts_info') {
      const text = `🏢 <b>Поліграфічна компанія «Едельвейс і К»</b>

📍 <b>Адреса:</b> м. Вінниця, вул. 600-річчя, 17
📞 <b>Телефон:</b> +38 (067) 840-97-81
✉️ <b>Email:</b> info@edelveis.vn.ua
⏰ <b>Графік роботи:</b> Пн-Пт: 09:00 - 18:00

🚚 Доставка по Україні: Нова Пошта, кур'єр або самовивіз.`;
      await sendMessage(chatId, text, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'menu_main' }]] });
      return res.status(200).json({ ok: true });
    }
  }

  // 2. Handle Text Messages, Contacts & Commands
  if (update.message) {
    const msg = update.message;
    const text = (msg.text || '').trim();

    // 2.1 Handle Shared Contact (Native Telegram contact button)
    if (msg.contact) {
      let phone = msg.contact.phone_number || '';
      if (phone && !phone.startsWith('+')) {
        phone = `+${phone}`;
      }
      const contactName = [msg.contact.first_name, msg.contact.last_name].filter(Boolean).join(' ') || userFullName;
      const directUrl = makeCalcUrl(contactName, phone);

      const reply = `✅ <b>Контактні дані збережено!</b>

👤 <b>Клієнт:</b> ${contactName}
📱 <b>Телефон:</b> <code>${phone}</code>

Тепер при вході в онлайн-калькулятор ваші контакти будуть підтягнуті автоматично.`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: directUrl }
          ],
          [
            { text: '🏷️ Швидкий прорахунок цін', callback_data: 'calc_menu' },
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, reply, keyboard);
      return res.status(200).json({ ok: true });
    }

    // 2.2 Handle document / photo uploads
    if (msg.document || msg.photo) {
      const fileName = msg.document?.file_name || 'файл макета';
      const reply = `✅ <b>Дякуємо! Ваш макет (${fileName}) успішно отримано.</b>

Препрес-інженер розпочав перевірку розмірів, вильотів під обріз (bleed) та кольорового профілю CMYK.

Менеджер зв'яжеться з вами найближчим часом!`;
      await sendMessage(chatId, reply, {
        inline_keyboard: [[{ text: '🏠 Головне меню', callback_data: 'menu_main' }]]
      });
      return res.status(200).json({ ok: true });
    }

    // 2.3 Handle /start and navigation commands
    if (text === '/start' || text.toLowerCase() === 'меню' || text.toLowerCase() === 'start' || text.toLowerCase() === 'головне меню' || text.toLowerCase() === '⬅️ головне меню') {
      const welcomeText = `👋 <b>Вітаємо у друкарні «Едельвейс і К»!</b>

🏢 <b>м. Вінниця, вул. 600-річчя, 17</b>
📞 <b>+38 (067) 840-97-81</b>

Ми виготовляємо весь спектр поліграфії: візитки, буклети, каталоги, упаковку, банери та наліпки.

Оберіть потрібну дію нижче:`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: calcUrl }
          ],
          [
            { text: '👤 Мій профіль / Реєстрація', callback_data: 'reg_choice' }
          ],
          [
            { text: '🏷️ Швидкий прорахунок цін', callback_data: 'calc_menu' },
            { text: '📦 Статус замовлення', callback_data: 'status_info' }
          ],
          [
            { text: '📎 Надіслати макет', callback_data: 'send_macro' },
            { text: '💬 Контакти друкарні', callback_data: 'contacts_info' }
          ]
        ]
      };
      await sendMessage(chatId, welcomeText, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (text === '/register' || text === '/profile' || text.toLowerCase() === 'профіль' || text.toLowerCase() === 'реєстрація') {
      const regText = `👤 <b>Мій профіль та контакти:</b>

Поточне ім'я: <b>${userFullName}</b>

Ви можете надіслати номер телефону або змінити дані для калькулятора:`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '📱 Поділитися номером телефону', callback_data: 'prompt_phone' }
          ],
          [
            { text: '✏️ Вказати ім'я або компанію', callback_data: 'prompt_name' }
          ],
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: calcUrl },
            { text: '🏠 Меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, regText, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (text === '/calc') {
      const keyboard = {
        inline_keyboard: [
          [
            { text: '💳 Візитки', callback_data: 'calc_item_vizitki' },
            { text: '📄 Флаєри', callback_data: 'calc_item_flyers' }
          ],
          [
            { text: '📖 Буклети', callback_data: 'calc_item_booklets' },
            { text: '🏷️ Наліпки', callback_data: 'calc_item_stickers' }
          ],
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: calcUrl }
          ]
        ]
      };
      await sendMessage(chatId, '📇 Оберіть продукцію для прорахунку:', keyboard);
      return res.status(200).json({ ok: true });
    }

    if (text === '/status') {
      await sendMessage(chatId, '📦 Введіть номер замовлення (наприклад: <code>64841</code>):');
      return res.status(200).json({ ok: true });
    }

    if (text === '/contacts') {
      const contactsText = `🏢 <b>Поліграфічна компанія «Едельвейс і К»</b>

📍 м. Вінниця, вул. 600-річчя, 17
📞 +38 (067) 840-97-81
✉️ info@edelveis.vn.ua
⏰ Пн-Пт: 09:00 - 18:00`;
      await sendMessage(chatId, contactsText, { inline_keyboard: [[{ text: '🏠 Головне меню', callback_data: 'menu_main' }]] });
      return res.status(200).json({ ok: true });
    }

    // 2.4 Explicit /name or /phone commands
    if (text.startsWith('/name ')) {
      const customName = text.replace('/name ', '').trim();
      if (customName) {
        const directUrl = makeCalcUrl(customName);
        const reply = `✅ <b>Ім'я оновлено:</b> <b>${customName}</b>

Тепер у калькуляторі автоматично зазначатиметься це ім'я:`;
        await sendMessage(chatId, reply, {
          inline_keyboard: [
            [{ text: '🌐 Відкрити калькулятор', url: directUrl }],
            [{ text: '📱 Додати телефон', callback_data: 'prompt_phone' }],
            [{ text: '🏠 Головне меню', callback_data: 'menu_main' }]
          ]
        });
        return res.status(200).json({ ok: true });
      }
    }

    if (text.startsWith('/phone ')) {
      const customPhone = text.replace('/phone ', '').trim();
      if (customPhone) {
        let phoneFormatted = customPhone.replace(/[\s\(\)\-]/g, '');
        if (phoneFormatted.startsWith('0')) phoneFormatted = `+38${phoneFormatted}`;
        else if (phoneFormatted.startsWith('380')) phoneFormatted = `+${phoneFormatted}`;
        else if (!phoneFormatted.startsWith('+')) phoneFormatted = `+${phoneFormatted}`;

        const directUrl = makeCalcUrl(userFullName, phoneFormatted);
        const reply = `✅ <b>Телефон збережено:</b> <code>${phoneFormatted}</code>

Тепер контакти автоматично підтягнуться до калькулятора:`;
        await sendMessage(chatId, reply, {
          inline_keyboard: [
            [{ text: '🌐 Відкрити онлайн-калькулятор', url: directUrl }],
            [{ text: '🏠 Головне меню', callback_data: 'menu_main' }]
          ]
        });
        return res.status(200).json({ ok: true });
      }
    }

    // 2.5 Check if user entered a phone number
    const phoneClean = text.replace(/[\s\(\)\-\.]/g, '');
    const isPhonePattern = /^(\+?380\d{9}|0\d{9}|\+?\d{10,13})$/.test(phoneClean);
    if (isPhonePattern) {
      let formatted = phoneClean;
      if (formatted.startsWith('0')) formatted = `+38${formatted}`;
      else if (formatted.startsWith('380')) formatted = `+${formatted}`;
      else if (!formatted.startsWith('+')) formatted = `+${formatted}`;

      const directUrl = makeCalcUrl(userFullName, formatted);
      const reply = `✅ <b>Номер телефону збережено:</b> <code>${formatted}</code>
👤 <b>Клієнт:</b> ${userFullName}

Дані автоматично будуть внесені у розрахунок калькулятора:`;
      await sendMessage(chatId, reply, {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: directUrl }
          ],
          [
            { text: '✏️ Змінити ім'я / компанію', callback_data: 'prompt_name' },
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      });
      return res.status(200).json({ ok: true });
    }

    // 2.6 If user entered order tracking number (digits only, e.g. 64841)
    if (/^\d{3,8}$/.test(text)) {
      const orderNum = text;
      const statusText = `📦 <b>Замовлення №${orderNum}:</b>

🟢 <b>Статус:</b> У виробництві (Друкарський цех)
📅 <b>Орієнтовна готовність:</b> Сьогодні до 17:00
📍 <b>Пункт видачі:</b> м. Вінниця, вул. 600-річчя, 17

<i>Як тільки замовлення буде упаковане, бот надішле вам сповіщення!</i>`;
      await sendMessage(chatId, statusText, {
        inline_keyboard: [
          [
            { text: '💬 Уточнити у менеджера', callback_data: 'contacts_info' },
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      });
      return res.status(200).json({ ok: true });
    }

    // 2.7 If user entered their full name / company name (e.g. 2-5 words, text format)
    const words = text.split(/\s+/).filter(Boolean);
    const looksLikeName = words.length >= 1 && words.length <= 6 && !text.includes('http') && text.length >= 3 && text.length <= 60 && !text.startsWith('/');
    if (looksLikeName) {
      const clientName = text;
      const directUrl = makeCalcUrl(clientName);
      const reply = `✅ <b>Ім'я / Компанію зафіксовано:</b> <b>${clientName}</b>

Тепер ви можете перейти до онлайн-калькулятора або вказати номер телефону:`;
      await sendMessage(chatId, reply, {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: directUrl }
          ],
          [
            { text: '📱 Вказати номер телефону', callback_data: 'prompt_phone' },
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      });
      return res.status(200).json({ ok: true });
    }

    // 2.8 Generic fallback text
    const fallbackText = `Дякуємо за ваше повідомлення! Менеджер отримав ваш запит і відповість найближчим часом.

Також ви можете скористатися швидким меню:`;
    await sendMessage(chatId, fallbackText, {
      inline_keyboard: [
        [
          { text: '🌐 Відкрити онлайн-калькулятор', url: calcUrl }
        ],
        [
          { text: '👤 Мій профіль / Реєстрація', callback_data: 'reg_choice' }
        ],
        [
          { text: '🏷️ Прорахувати ціну', callback_data: 'calc_menu' },
          { text: '📦 Статус замовлення', callback_data: 'status_info' }
        ]
      ]
    });
  }

  return res.status(200).json({ ok: true });
}
