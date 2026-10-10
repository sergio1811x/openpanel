'use client';

import Image from 'next/image';

export default function DpaDownloadPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Print button - hidden when printing */}
      <div className="sticky top-0 z-10 flex justify-end gap-3 border-gray-200 border-b bg-white px-8 py-3 print:hidden">
        <button
          className="rounded bg-black px-4 py-2 font-medium text-sm text-white hover:bg-gray-800"
          onClick={() => window.print()}
          type="button"
        >
          Скачать / Печать PDF
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-12 print:py-0">
        {/* Header */}
        <div className="mb-10 border-gray-300 border-b pb-8">
          <p className="mb-1 text-gray-500 text-xs uppercase tracking-widest">
            OpenPanel AB
          </p>
          <h1 className="mb-2 font-bold text-3xl">
            Соглашение об обработке данных (DPA)
          </h1>
          <p className="text-gray-500 text-sm">
            Версия 1.1 &middot; Последнее обновление: 21 мая 2026 г.
          </p>
        </div>

        <p className="mb-8 text-gray-700 text-sm leading-relaxed">
          Настоящее соглашение об обработке данных («DPA») заключается между
          OpenPanel AB («OpenPanel», «Обработчик») и клиентом, указанным в блоке
          подписей ниже («Контролёр»). Оно применяется в случаях, когда OpenPanel
          обрабатывает персональные данные от имени Контролёра в рамках сервиса
          OpenPanel Cloud, и является частью Условий использования OpenPanel.
        </p>

        <Section number="1" title="Определения">
          <ul className="list-none space-y-2 text-gray-700 text-sm">
            <li>
              <strong>GDPR</strong> — Регламент (ЕС) 2016/679 Европейского
              парламента и Совета.
            </li>
            <li>
              <strong>Контролёр</strong> — клиент, который определяет цели и
              средства обработки.
            </li>
            <li>
              <strong>Обработчик</strong> — OpenPanel, обрабатывающая данные от
              имени Контролёра.
            </li>
            <li>
              <strong>Персональные данные</strong>, <strong>Обработка</strong>,{' '}
              <strong>Субъект данных</strong> и{' '}
              <strong>Надзорный орган</strong> имеют значения, определённые в
              GDPR.
            </li>
            <li>
              <strong>Субобработчик</strong> — любая третья сторона, привлечённая
              OpenPanel для обработки персональных данных в связи с сервисом.
            </li>
          </ul>
        </Section>

        <Section number="2" title="Наш подход к приватности">
          <p className="mb-3 text-gray-700 text-sm leading-relaxed">
            OpenPanel создана так, чтобы минимизировать сбор персональных данных
            на уровне архитектуры. Мы не используем cookies для аналитического
            отслеживания и не храним IP-адреса. Вместо этого мы генерируем
            ежедневно обновляемый анонимный идентификатор с помощью однонаправленного
            хеша IP-адреса посетителя, user agent и ID проекта в сочетании с солью,
            которая меняется каждые 24 часа. Сырой IP-адрес отбрасывается немедленно,
            а идентификатор становится необратимым после ротации соли.
          </p>
          <p className="mb-2 text-gray-700 text-sm">
            Данные, которые мы храним по каждому событию:
          </p>
          <ul className="mb-3 list-disc space-y-1 pl-5 text-gray-700 text-sm">
            <li>URL страницы и источник перехода</li>
            <li>Название и версия браузера</li>
            <li>Название и версия операционной системы</li>
            <li>Тип, бренд и модель устройства</li>
            <li>
              Город, страна и регион (определяются по IP на момент запроса; затем
              IP отбрасывается)
            </li>
            <li>Кастомные свойства событий, которые Контролёр решает отправлять</li>
          </ul>
          <p className="mb-3 text-gray-700 text-sm">
            Никаких постоянных идентификаторов, никаких cookies, никакого
            межсайтового отслеживания. Благодаря этому подходу аналитические
            данные, которые OpenPanel собирает в стандартном режиме отслеживания
            сайтов, не являются персональными данными согласно GDPR, ст. 4(1).
            Мы предоставляем этот DPA Контролёрам, которым он нужен для
            собственных документов соответствия и реестров действий по обработке.
          </p>
          <p className="mb-1 text-gray-700 text-sm font-semibold">
            Session replay (опциональная функция)
          </p>
          <p className="mb-3 text-gray-700 text-sm">
            OpenPanel опционально поддерживает session replay, который должен быть
            явно включён Контролёром. При включении session replay записывает
            снимки DOM и взаимодействия пользователя (движения мыши, клики,
            скроллы) с помощью rrweb. Весь текстовый контент и поля форм по
            умолчанию маскируются. Контролёр отвечает за то, чтобы использование
            session replay соответствовало применимому законодательству о
            приватности, включая надлежащее уведомление конечных пользователей.
          </p>
          <p className="mb-1 text-gray-700 text-sm font-semibold">
            AI-функции (опционально, по включению)
          </p>
          <p className="text-gray-700 text-sm">
            OpenPanel предлагает опциональные AI-функции (например, запросы на
            естественном языке к аналитическим данным Контролёра, инсайты об
            аномалиях и отчёты с помощью AI), которые должны быть явно вызваны
            Контролёром. Когда Контролёр использует эти функции, промпт и
            соответствующий фрагмент аналитических данных Контролёра передаются
            в OpenAI, L.L.C. (США) как субобработчику исключительно для
            формирования запрошенного ответа. OpenAI связана договорными
            обязательствами согласно своему Data Processing Addendum и Стандартным
            договорным условиям ЕС; OpenAI не использует данные, отправленные
            через API, для обучения своих моделей. Если Контролёр не использует
            эти функции, никакие данные в OpenAI не передаются.
          </p>
        </Section>

        <Section number="3" title="Объём применения и роли">
          <p className="text-gray-700 text-sm leading-relaxed">
            OpenPanel выступает Обработчиком при обработке данных от имени
            Контролёра. Контролёр отвечает за аналитические данные, собранные с
            посетителей его сайтов и приложений.
          </p>
        </Section>

        <Section number="4" title="Обязанности Обработчика">
          <p className="mb-2 text-gray-700 text-sm">
            OpenPanel обязуется:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-gray-700 text-sm">
            <li>
              Обрабатывать персональные данные только по документированным
              инструкциям Контролёра и ни для каких иных целей.
            </li>
            <li>
              Обеспечить, чтобы весь персонал с доступом к персональным данным
              был связан надлежащими обязательствами конфиденциальности.
            </li>
            <li>
              Внедрять и поддерживать технические и организационные меры согласно
              разделу 7 этого DPA.
            </li>
            <li>
              Не привлекать субобработчиков без предварительного общего или
              специального письменного разрешения и распространять на любого
              субобработчика эквивалентные обязательства по защите данных.
            </li>
            <li>
              Содействовать Контролёру, насколько это разумно возможно, в
              реагировании на запросы субъектов данных о реализации их прав по
              GDPR.
            </li>
            <li>
              Уведомить Контролёра без неоправданной задержки (и не позднее 48
              часов) после того, как OpenPanel узнает об утечке персональных
              данных.
            </li>
            <li>
              Предоставлять всю информацию, необходимую для подтверждения
              соответствия этому DPA. Аудит со стороны Контролёра или назначенного
              им аудитора ограничивается одним разом за 12-месячный период (если
              иное не требуется надзорным органом или не связано с подтверждённой
              утечкой персональных данных), требует уведомления за 30 дней,
              проводится при соблюдении конфиденциальности, за счёт Контролёра и
              без неоправданного нарушения работы сервиса. Запросы документов
              вместо аудита на месте принимаются, если они дают эквивалентные
              гарантии.
            </li>
            <li>
              По выбору Контролёра удалить или вернуть все персональные данные
              после прекращения сервиса.
            </li>
          </ul>
        </Section>

        <Section number="5" title="Обязанности Контролёра">
          <p className="mb-2 text-gray-700 text-sm">
            Контролёр подтверждает, что:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-gray-700 text-sm">
            <li>
              Имеет законное основание для обработки, описанной в этом DPA.
            </li>
            <li>
              Предоставил надлежащие уведомления о приватности своим конечным
              пользователям.
            </li>
            <li>
              Отвечает за точность и законность данных, обработку которых он
              поручает OpenPanel.
            </li>
          </ul>
        </Section>

        <Section number="6" title="Субобработчики">
          <p className="mb-3 text-gray-700 text-sm">
            OpenPanel использует следующих субобработчиков для оказания сервиса:
          </p>
          <table className="mb-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border border-gray-300 bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  Субобработчик
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  Назначение
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  Расположение
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2">
                  Hetzner Online GmbH
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  Облачная инфраструктура и основное хранилище данных
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  Германия (ЕС)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">
                  Cloudflare, Inc.
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  CDN, WAF и edge-прокси перед публичными эндпоинтами
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  Edge в ЕС (по SCC для любого транзита через США)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">
                  Cloudflare R2
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  Резервное копирование
                </td>
                <td className="border border-gray-300 px-3 py-2">ЕС</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">
                  OpenAI, L.L.C.
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  Поставщик LLM, используется только когда Контролёр вызывает
                  опциональные AI-функции
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  США (по SCC)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">
                  Resend, Inc.
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  Доставка транзакционных писем (аккаунт, биллинг и продуктовые
                  уведомления)
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  США (по SCC)
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-gray-700 text-sm">
            OpenPanel уведомит Контролёра о любых планируемых изменениях этого
            списка с разумным сроком, дав Контролёру возможность возразить.
          </p>
        </Section>

        <Section number="7" title="Технические и организационные меры">
          <div className="space-y-4 text-gray-700 text-sm">
            <div>
              <p className="mb-1 font-semibold">
                Минимизация данных и анонимизация
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  IP-адреса никогда не хранятся. Они используются только для
                  определения геолокации и генерации анонимного дневного
                  идентификатора, после чего отбрасываются.
                </li>
                <li>
                  Ежедневная ротация криптографических солей гарантирует, что
                  идентификаторы посетителей нельзя восстановить или связать с
                  конкретными людьми по истечении 24 часов.
                </li>
                <li>
                  Cookies и постоянные междевайсные идентификаторы не
                  используются.
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-semibold">Контроль доступа</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Доступ к дашборду защищён аутентификацией и ролевой моделью
                  доступа.
                </li>
                <li>
                  Продакшн-системы доступны только авторизованному персоналу.
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-semibold">
                Шифрование и безопасность передачи
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Все данные передаются по HTTPS (TLS).</li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-semibold">
                Инфраструктура и доступность
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Все данные размещаются на серверах Hetzner в Германии,
                  на территории ЕС.
                </li>
                <li>Регулярно выполняется резервное копирование.</li>
                <li>
                  В штатном режиме данные не покидают ЕЭП.
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-semibold">Реагирование на инциденты</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Мы поддерживаем процедуры обнаружения, отчётности и
                  расследования утечек персональных данных.
                </li>
                <li>
                  В случае инцидента, затрагивающего данные Контролёра, мы
                  уведомим его в течение 48 часов после того, как узнаем о нём.
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-semibold">Открытый исходный код</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Код OpenPanel публично доступен на GitHub, что позволяет
                  независимо проверять наши практики работы с данными.
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <Section number="8" title="Международная передача данных">
          <p className="mb-3 text-gray-700 text-sm leading-relaxed">
            Все аналитические данные хранятся на инфраструктуре Hetzner в
            Германии. Резервные копии хранятся в Cloudflare R2 на территории ЕС.
            В штатном режиме аналитические данные не покидают Европейскую
            экономическую зону.
          </p>
          <p className="mb-2 text-gray-700 text-sm">
            Ограниченная передача данных в США возможна в следующих случаях:
          </p>
          <ul className="mb-3 list-disc space-y-1 pl-5 text-gray-700 text-sm">
            <li>
              <strong>Транзакционные письма</strong> (через Resend, Inc.) —
              необходимо для доставки сообщений об аккаунте, биллинге и продукте
              авторизованным пользователям Контролёра.
            </li>
            <li>
              <strong>AI-функции</strong> (через OpenAI, L.L.C.) — только когда
              Контролёр активно вызывает опциональную AI-функцию; в этом случае
              соответствующий промпт и фрагмент данных передаются в OpenAI для
              обработки.
            </li>
            <li>
              <strong>Edge-сеть Cloudflare</strong> — трафик публичных эндпоинтов
              обслуживается глобальной сетью Cloudflare. Трафик из ЕС
              обрабатывается на edge-локациях в ЕС, где это возможно.
            </li>
          </ul>
          <p className="text-gray-700 text-sm leading-relaxed">
            Все такие передачи регулируются Стандартными договорными условиями ЕС
            (Решение Комиссии (ЕС) 2021/914), подписанными с каждым
            субобработчиком, и обеспечивают надлежащие гарантии согласно главе V
            GDPR.
          </p>
        </Section>

        <Section number="9" title="Хранение и удаление данных">
          <ul className="list-disc space-y-1 pl-5 text-gray-700 text-sm">
            <li>
              <strong>Аналитические события</strong> хранятся, пока аккаунт
              Контролёра активен. Максимальный срок хранения сейчас не введён.
              Если лимит хранения появится в будущем, все клиенты будут
              уведомлены заранее.
            </li>
            <li>
              <strong>Session replay</strong> хранятся 30 дней, после чего
              удаляются безвозвратно.
            </li>
            <li>
              Контролёр может в любой момент удалить отдельные проекты, все
              связанные данные или весь аккаунт прямо из дашборда. После
              прекращения аккаунта OpenPanel удалит данные Контролёра в течение
              30 дней, если закон не требует сохранять их дольше.
            </li>
          </ul>
        </Section>

        <Section number="10" title="Применимое право">
          <p className="text-gray-700 text-sm leading-relaxed">
            Этот DPA регулируется законодательством Швеции и толкуется в
            соответствии с GDPR.
          </p>
        </Section>

        {/* Exhibit A */}
        <div className="mb-8 border-black border-t-2 pt-8">
          <p className="mb-1 text-gray-500 text-xs uppercase tracking-widest">
            Приложение
          </p>
          <h2 className="mb-4 font-bold text-xl">
            Приложение A: Описание обработки
          </h2>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <Row
                label="Характер обработки"
                value="Сбор и хранение анонимизированных событий веб-аналитики (просмотры страниц, кастомные события, данные сессий). Опционально: запись session replay — снимки DOM и взаимодействия пользователя."
              />
              <Row
                label="Цель обработки"
                value="Предоставление Контролёру веб- и продуктовой аналитики через дашборд OpenPanel Cloud. Session replay (если включён) используется, чтобы Контролёр мог просматривать сессии пользователей для UX-анализа и отладки."
              />
              <Row
                label="Срок обработки"
                value="Аналитические события: хранятся в течение срока действия активного аккаунта (текущего максимума нет). Session replay: 30 дней, затем удаляются безвозвратно. Все данные удаляются в течение 30 дней после прекращения аккаунта."
              />
              <Row
                label="Категории субъектов данных"
                value="Посетители сайтов и приложений Контролёра"
              />
              <Row
                label="Категории персональных данных"
                value="Анонимизированные идентификаторы сессий (необратимы через 24 часа), URL страниц, источники переходов, тип и версия браузера, операционная система, тип устройства, геолокация до города (страна, регион, город). Без IP-адресов, без cookies, без имён и email-адресов. Если включён session replay: снимки DOM и записи взаимодействий, которые могут случайно содержать персональные данные, видимые на страницах Контролёра. Весь текстовый контент и поля форм по умолчанию маскируются."
              />
              <Row
                label="Специальные категории данных"
                value="Не собираются намеренно. Контролёр отвечает за то, чтобы через session replay не попадали данные специальных категорий."
              />
              <Row
                label="Субобработчики"
                value="Hetzner Online GmbH (Германия) — облачная инфраструктура и основное хранилище данных; Cloudflare, Inc. (edge в ЕС, по SCC) — CDN/WAF/edge-прокси; Cloudflare R2 (ЕС) — резервное копирование; OpenAI, L.L.C. (США, по SCC) — поставщик LLM только для опциональных AI-функций; Resend, Inc. (США, по SCC) — доставка транзакционных писем."
              />
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="border-black border-t-2 pt-8">
          <p className="mb-1 text-gray-500 text-xs uppercase tracking-widest">
            Подписание
          </p>
          <h2 className="mb-6 font-bold text-xl">Подписи</h2>

          <div className="grid grid-cols-2 gap-12">
            {/* Processor - pre-signed */}
            <div>
              <div className="col h-32 gap-2">
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-widest">
                  Обработчик
                </p>
                <p className="font-semibold text-sm">OpenPanel AB</p>
                <p className="text-gray-500 text-xs">
                  Sankt Eriksgatan 100, 113 31 Stockholm, Sweden
                </p>
              </div>
              <SignatureLine
                label="Подпись"
                value={
                  <Image
                    alt="Подпись Карла-Герхарда Линдесварда"
                    className="relative top-4 h-16 w-auto object-contain object-left"
                    height={64}
                    src="/signature.png"
                    width={200}
                  />
                }
              />
              <SignatureLine label="Имя" value="Carl-Gerhard Lindesvärd" />
              <SignatureLine label="Должность" value="Основатель" />
              <SignatureLine label="Дата" value="21 мая 2026 г." />
            </div>

            {/* Controller - blank */}
            <div>
              <div className="flex flex-col h-32 gap-2">
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-widest">
                  Контролёр
                </p>
              </div>
              <SignatureLine label="Компания" value="" />
              <SignatureLine label="Подпись" value="" />
              <SignatureLine label="Имя" value="" />
              <SignatureLine label="Должность" value="" />
              <SignatureLine label="Дата" value="" />
            </div>
          </div>
        </div>

        <div className="mt-12 border-gray-200 border-t pt-6 text-center text-gray-400 text-xs print:mt-4">
          OpenPanel AB &middot; hello@openpanel.dev &middot; openpanel.dev/dpa
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 font-bold text-base">
        {number}. {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border border-gray-300">
      <td className="w-48 border border-gray-300 bg-gray-50 px-3 py-2 align-top font-semibold text-xs">
        {label}
      </td>
      <td className="border border-gray-300 px-3 py-2 text-xs leading-relaxed">
        {value}
      </td>
    </tr>
  );
}

function SignatureLine({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="text-gray-500 text-xs">{label}</p>
      <div className="mt-1 flex h-7 items-end border-gray-400 border-b font-mono">
        {value}
      </div>
    </div>
  );
}
