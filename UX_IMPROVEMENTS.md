# UX Improvements Report

## 1. Состояния (States)
- **Typing Indicator**: Улучшена анимация "Processing..." в хедере и "bouncing dots" в чате.
  - *Code*: `ChatInterface.jsx` (Header & Message List)
- **Empty State**: Добавлен приветственный экран с логотипом и кнопками-подсказками (Chips).
  - *Code*: `ChatInterface.jsx` (`messages.length === 0` block)
- **Error State**: Сообщения об ошибках теперь красные, с кнопкой "Retry".
  - *Code*: `ChatInterface.jsx` (Message mapping `isError`), `DashboardPage.jsx` (`handleRegenerate`)
- **Offline State**: Индикатор "Offline" в хедере и блокировка инпута при отсутствии сети.
  - *Code*: `ChatInterface.jsx` (`navigator.onLine` logic)

## 2. Скролл (Auto-scroll)
- **Smart Scroll**: Автоскролл срабатывает только если пользователь уже внизу или если это новое сообщение от пользователя. Не мешает читать историю.
  - *Code*: `ChatInterface.jsx` (`handleScroll`, `isAtBottomRef`)

## 3. Markdown & Security
- **Rendering**: Используется `react-markdown` с `remark-gfm`.
- **Security**: Добавлен `rehype-sanitize` для защиты от XSS.
- **Typewriter Effect**: Сохранена и оптимизирована анимация печати.
  - *Code*: `ChatInterface.jsx` (`Typewriter` component)

## 4. Mobile Adaptation
- **Input**: Текстовое поле автоматически меняет высоту (`handleInputResize`), но имеет ограничение. Используется `sticky bottom-0` с правильным `z-index`.
- **Layout**: `h-[100dvh]` для корректного отображения на iOS Safari. Скрываем сайдбар в меню "гамбургер".
- **Actions**: Кнопки действий (Copy, Regenerate) адаптированы для тач-интерфейсов (всегда видны или по клику/ховеру).

## 5. Мелочи (Details)
- **Copy Button**: Копирование текста сообщения в буфер обмена.
- **Regenerate**: Кнопка перегенерации для последнего ответа AI (или ошибки).
- **Clear Chat**: Кнопка "Trash" в хедере для очистки текущего чата.
  - *Code*: `ChatInterface.jsx` -> `DashboardPage.jsx` (`handleClearChat`, `handleRegenerate`)
