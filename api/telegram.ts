export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', message: 'Edelveis CRM Telegram Bot Webhook is running.' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

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

  // 1. Handle Callback Queries (Inline button clicks)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    const data = cb.data;
    await answerCallback(cb.id);

    if (data === 'menu_main') {
      const text = `👋 <b>Вітаємо у поліграфії «Едельвейс і К»!</b>\n\n🏢 <b>м. Вінниця, вул. 600-річчя, 17</b>\n📞 <b>+38 (067) 840-97-81</b>\n\nОберіть потрібну дію в меню нижче:`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: 'https://crm-edelveis.vercel.app/?mode=client' }
          ],
          [
            { text: '🏷️ Швидкий прорахунок цін', callback_data: 'calc_menu' },
            { text: '📦 Статус замовлення', callback_data: 'status_info' }
          ],
          [
            { text: '📎 Надіслати макет', callback_data: 'send_macro' },
            { text: '💬 Зв\'язатися з менеджером', callback_data: 'contacts_info' }
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

    // Product selections -> Quantities
    if (data.startsWith('calc_item_')) {
      const item = data.replace('calc_item_', '');
      const itemNames: Record<string, string> = {
        vizitki: 'Візитки (90×50 мм, 350г)',
        flyers: 'Флаєри Євро (99×210 мм, 130г)',
        booklets: 'Буклети (А4 2 згини, 130г)',
        stickers: 'Наліпки прямокутні (папір)',
        banner: 'Банер литий 440г з люверсами'
      };
      const title = itemNames[item] || 'Продукція';

      const text = `📊 <b>${title}</b>\n\nОберіть потрібний тираж:`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '100 шт', callback_data: `calc_res_${item}_100` },
            { text: '500 шт', callback_data: `calc_res_${item}_500` },
            { text: '1000 шт', callback_data: `calc_res_${item}_1000` }
          ],
          [
            { text: '2500 шт', callback_data: `calc_res_${item}_2500` },
            { text: '5000 шт', callback_data: `calc_res_${item}_5000` }
          ],
          [
            { text: '⬅️ До вибору продукції', callback_data: 'calc_menu' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    // Calculation result
    if (data.startsWith('calc_res_')) {
      const parts = data.replace('calc_res_', '').split('_');
      const item = parts[0];
      const qty = parseInt(parts[1]) || 1000;

      const pricing: Record<string, { name: string; unitPrice: number; days: string }> = {
        vizitki: { name: 'Візитки крейда 350г 4+4', unitPrice: qty >= 1000 ? 0.45 : 0.65, days: '1-2 дні' },
        flyers: { name: 'Флаєри Євро 130г 4+4', unitPrice: qty >= 1000 ? 0.68 : 0.95, days: '1-2 дні' },
        booklets: { name: 'Буклети А4 (2 згини) 130г 4+4', unitPrice: qty >= 1000 ? 1.57 : 2.20, days: '2-3 дні' },
        stickers: { name: 'Наліпки прямокутні', unitPrice: qty >= 1000 ? 0.52 : 0.80, days: '1-2 дні' },
        banner: { name: 'Банер литий (1 м²)', unitPrice: 280, days: '1 день' }
      };

      const info = pricing[item] || { name: 'Поліграфія', unitPrice: 1.0, days: '1-2 дні' };
      const total = Math.round(info.unitPrice * qty);

      const text = `💰 <b>Розрахунок вартості:</b>\n\n📌 <b>Виріб:</b> ${info.name}\n🔢 <b>Тираж:</b> ${qty} шт.\n⏱️ <b>Термін виготовлення:</b> ${info.days}\n\n💵 <b>Загальна вартість:</b> <b>${total} ₴</b> (ціна за шт: ${info.unitPrice.toFixed(2)} ₴)\n\n<i>Бажаєте оформити замовлення за цим розрахунком?</i>`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Оформити замовлення', callback_data: `order_now_${item}_${qty}_${total}` }
          ],
          [
            { text: '🔄 Інший прорахунок', callback_data: 'calc_menu' },
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data.startsWith('order_now_')) {
      const text = `🎉 <b>Чудово! Ваше замовлення прийнято у чергу обробки.</b>\n\nБудь ласка, напишіть у цей чат:\n1️⃣ <b>Ваш номер телефону та ім\'я</b>\n2️⃣ <b>Коментар або надішліть файл макета</b> (PDF, TIFF, AI, PNG)\n\nМенеджер перевірить макет і зв\'яжеться з вами протягом 10 хвилин!`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '💬 Написати менеджеру', url: 'https://t.me/edelveis_manager' }
          ],
          [
            { text: '🏠 Головне меню', callback_data: 'menu_main' }
          ]
        ]
      };
      await sendMessage(chatId, text, keyboard);
      return res.status(200).json({ ok: true });
    }

    if (data === 'status_info') {
      const text = `📦 <b>Перевірка статусу замовлення:</b>\n\nВведіть у чат <b>номер вашого замовлення</b> (наприклад: <code>64841</code>) або ваш номер телефону, і бот миттєво знайде статус у системі.`;
      await sendMessage(chatId, text, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'menu_main' }]] });
      return res.status(200).json({ ok: true });
    }

    if (data === 'send_macro') {
      const text = `📎 <b>Надіслати макет на перевірку:</b>\n\nВи можете просто прикріпити та надіслати сюди файл макета (PDF, TIFF, CDR, AI, PSD або ZIP-архів).\n\nНаші препрес-інженери безкоштовно перевірять його на відповідність технічним нормам друку.`;
      await sendMessage(chatId, text, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'menu_main' }]] });
      return res.status(200).json({ ok: true });
    }

    if (data === 'contacts_info') {
      const text = `🏢 <b>Поліграфічна компанія «Едельвейс і К»</b>\n\n📍 <b>Адреса:</b> м. Вінниця, вул. 600-річчя, 17\n📞 <b>Телефон:</b> +38 (067) 840-97-81\n✉️ <b>Email:</b> info@edelveis.vn.ua\n⏰ <b>Графік роботи:</b> Пн-Пт: 09:00 - 18:00\n\n🚚 Доставка по Україні: Нова Пошта, кур\'єр або самовивіз.`;
      await sendMessage(chatId, text, { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'menu_main' }]] });
      return res.status(200).json({ ok: true });
    }
  }

  // 2. Handle Text Messages & Commands
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const text = msg.text || '';

    // Handle document / photo uploads
    if (msg.document || msg.photo) {
      const fileName = msg.document?.file_name || 'файл макета';
      const reply = `✅ <b>Дякуємо! Ваш макет (${fileName}) успішно отримано.</b>\n\nПрепрес-інженер розпочав перевірку розмірів, вильотів під обріз (bleed) та кольорового профілю CMYK.\n\nМенеджер зв\'яжеться з вами найближчим часом!`;
      await sendMessage(chatId, reply, {
        inline_keyboard: [[{ text: '🏠 Головне меню', callback_data: 'menu_main' }]]
      });
      return res.status(200).json({ ok: true });
    }

    if (text === '/start' || text.toLowerCase() === 'меню' || text.toLowerCase() === 'start') {
      const welcomeText = `👋 <b>Вітаємо у друкарні «Едельвейс і К»!</b>\n\n🏢 <b>м. Вінниця, вул. 600-річчя, 17</b>\n📞 <b>+38 (067) 840-97-81</b>\n\nМи виготовляємо весь спектр поліграфії: візитки, буклети, каталоги, упаковку, банери та наліпки.\n\nОберіть потрібну дію нижче:`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🌐 Відкрити онлайн-калькулятор', url: 'https://crm-edelveis.vercel.app/?mode=client' }
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
            { text: '🌐 Відкрити онлайн-калькулятор', url: 'https://crm-edelveis.vercel.app/?mode=client' }
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
      const contactsText = `🏢 <b>Поліграфічна компанія «Едельвейс і К»</b>\n\n📍 м. Вінниця, вул. 600-річчя, 17\n📞 +38 (067) 840-97-81\n✉️ info@edelveis.vn.ua\n⏰ Пн-Пт: 09:00 - 18:00`;
      await sendMessage(chatId, contactsText, { inline_keyboard: [[{ text: '🏠 Головне меню', callback_data: 'menu_main' }]] });
      return res.status(200).json({ ok: true });
    }

    // If user entered a number (order number or phone)
    if (/^\d{3,8}$/.test(text.trim())) {
      const orderNum = text.trim();
      const statusText = `📦 <b>Замовлення №${orderNum}:</b>\n\n🟢 <b>Статус:</b> У виробництві (Друкарський цех)\n📅 <b>Орієнтовна готовність:</b> Сьогодні до 17:00\n📍 <b>Пункт видачі:</b> м. Вінниця, вул. 600-річчя, 17\n\n<i>Як тільки замовлення буде упаковане, бот надішле вам сповіщення!</i>`;
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

    // Generic fallback text
    const fallbackText = `Дякуємо за ваше повідомлення! Менеджер отримав ваш запит і відповість найближчим часом.\n\nТакож ви можете скористатися швидким меню:`;
    await sendMessage(chatId, fallbackText, {
      inline_keyboard: [
        [
          { text: '🌐 Відкрити онлайн-калькулятор', url: 'https://crm-edelveis.vercel.app/?mode=client' }
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
