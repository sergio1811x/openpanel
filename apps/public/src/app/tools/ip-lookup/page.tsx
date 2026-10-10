'use client';

import { FaqItem, Faqs } from '@/components/faq';
import { FeatureCardContainer } from '@/components/feature-card';
import { SectionHeader } from '@/components/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/api-url';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Building2,
  Globe,
  Loader2,
  MapPin,
  Network,
  Search,
  Server,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface IPInfo {
  ip: string;
  location: {
    country: string | undefined;
    city: string | undefined;
    region: string | undefined;
    latitude: number | undefined;
    longitude: number | undefined;
  };
  isp: string | null;
  asn: string | null;
  organization: string | null;
  hostname: string | null;
  isLocalhost: boolean;
  isPrivate: boolean;
}

export default function IPLookupPage() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [result, setResult] = useState<IPInfo | null>(null);

  // Auto-detect IP on page load
  useEffect(() => {
    const detectIP = async () => {
      setAutoDetecting(true);
      try {
        const response = await fetch(`${API_URL}/tools/ip-lookup`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            setIsRateLimited(true);
            throw new Error(
              'Превышен лимит запросов. Подождите минуту и попробуйте снова.',
            );
          }
          setIsRateLimited(false);
          throw new Error(data.error || 'Не удалось определить IP');
        }

        setIsRateLimited(false);
        setResult(data);
        setIp(data.ip);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось определить IP');
      } finally {
        setAutoDetecting(false);
      }
    };

    detectIP();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/tools/ip-lookup?ip=${encodeURIComponent(ip.trim())}`,
      );
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setIsRateLimited(true);
          throw new Error(
            'Превышен лимит запросов. Подождите минуту и попробуйте снова.',
          );
        }
        setIsRateLimited(false);
        throw new Error(data.error || 'Не удалось найти IP');
      }

      setIsRateLimited(false);

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const InfoCard = ({
    icon,
    label,
    value,
    className,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <FeatureCardContainer
      className={cn('p-4 flex items-start gap-3', className)}
    >
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </div>
        <div className="text-base font-semibold break-words">
          {value || '—'}
        </div>
      </div>
    </FeatureCardContainer>
  );

  const getCountryFlag = (countryCode?: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="max-w-4xl">
      <SectionHeader
        title="Инструмент проверки IP"
        description="Подробная информация о любом IP-адресе: геолокация, провайдер и данные сети."
        variant="default"
        as="h1"
      />

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Введите IP-адрес или оставьте поле пустым, чтобы определить свой"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="flex-1"
            size="lg"
          />
          <Button type="submit" disabled={loading || autoDetecting} size="lg">
            {loading || autoDetecting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {autoDetecting ? 'Определяем...' : 'Проверяем...'}
              </>
            ) : (
              <>
                <Search className="size-4" />
                Проверить
              </>
            )}
          </Button>
        </div>
      </form>

      {error && (
        <div
          className={cn(
            'mt-4 p-4 rounded-lg border',
            isRateLimited
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive',
          )}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="size-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">{error}</div>
              {isRateLimited && (
                <div className="text-sm mt-1 opacity-90">
                  Вы можете делать до 20 запросов в минуту. Пожалуйста,
                  попробуйте позже.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          {/* IP Address Display */}
          <FeatureCardContainer>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="size-6" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {autoDetecting ? 'Определённый IP-адрес' : 'IP-адрес'}
                </div>
                <div className="text-2xl font-bold font-mono">{result.ip}</div>
              </div>
            </div>
            {(result.isLocalhost || result.isPrivate) && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="size-4" />
                <span>
                  {result.isLocalhost
                    ? 'Это локальный адрес (localhost)'
                    : 'Это частный IP-адрес'}
                </span>
              </div>
            )}
          </FeatureCardContainer>

          {/* Location Information */}
          {result.location.country && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="size-5" />
                Информация о местоположении
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={<Globe className="size-5" />}
                  label="Страна"
                  value={
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getCountryFlag(result.location.country)}
                      </span>
                      <span>{result.location.country}</span>
                    </span>
                  }
                />
                {result.location.city && (
                  <InfoCard
                    icon={<MapPin className="size-5" />}
                    label="Город"
                    value={result.location.city}
                  />
                )}
                {result.location.region && (
                  <InfoCard
                    icon={<MapPin className="size-5" />}
                    label="Регион/область"
                    value={result.location.region}
                  />
                )}
                {result.location.latitude && result.location.longitude && (
                  <InfoCard
                    icon={<MapPin className="size-5" />}
                    label="Координаты"
                    value={`${result.location.latitude.toFixed(4)}, ${result.location.longitude.toFixed(4)}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Map Preview */}
          {result.location.latitude && result.location.longitude && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="size-5" />
                Местоположение на карте
              </h3>
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <iframe
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.location.longitude - 0.1},${result.location.latitude - 0.1},${result.location.longitude + 0.1},${result.location.latitude + 0.1}&layer=mapnik&marker=${result.location.latitude},${result.location.longitude}`}
                  className="w-full aspect-video"
                  title="Местоположение на карте"
                />
                <div className="p-2 bg-muted border-t border-border text-xs text-center text-muted-foreground flex items-center justify-between gap-4">
                  <div>
                    ©{' '}
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      OpenStreetMap
                    </a>{' '}
                    contributors
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${result.location.latitude}&mlon=${result.location.longitude}#map=12/${result.location.latitude}/${result.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Открыть большую карту
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Attribution */}
          <div className="pt-4 border-t text-xs text-muted-foreground space-y-2">
            <div>
              <strong>Данные о местоположении:</strong> предоставлено{' '}
              <a
                href="https://www.maxmind.com/en/geoip2-services-and-databases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                MaxMind GeoLite2
              </a>{' '}
              (база данных GeoLite2)
            </div>
            {(result.isp || result.asn) && (
              <div>
                <strong>Данные о сети:</strong> информация об ISP/ASN из{' '}
                <a
                  href="https://ip-api.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ip-api.com
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Content Section */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <article className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Бесплатный инструмент проверки IP — узнайте свой IP-адрес и геолокацию
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Узнайте свой IP-адрес мгновенно и получите подробную информацию о
              геолокации: страна, город, провайдер, ASN и данные сети. Наш
              бесплатный инструмент проверки IP даёт точные данные о
              местоположении на основе базы MaxMind GeoLite2.
            </p>
          </div>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Что такое IP-адрес?
            </h3>
            <p className="mb-4">
              IP-адрес (Internet Protocol) — уникальный числовой идентификатор,
              который присваивается каждому устройству в компьютерной сети.
              Представьте его как почтовый адрес вашего устройства в интернете.
              Есть два основных типа:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <strong>IPv4:</strong> самый распространённый формат — четыре
                числа, разделённые точками (например, 192.168.1.1)
              </li>
              <li>
                <strong>IPv6:</strong> более новый формат, созданный на замену
                IPv4, — шестнадцатеричная запись (например,
                2001:0db8:85a3:0000:0000:8a2e:0370:7334)
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Как работает геолокация по IP
            </h3>
            <p className="mb-4">
              Геолокация по IP определяет приблизительное физическое
              местоположение IP-адреса, анализируя маршрутизацию и региональное
              распределение IP-адресов. Наш инструмент использует:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <strong>База данных MaxMind GeoLite2:</strong>
                отраслевой стандарт геолокации — точные данные до города и страны
              </li>
              <li>
                <strong>Информация об ISP:</strong> данные провайдера с
                ip-api.com
              </li>
              <li>
                <strong>Данные ASN:</strong> номер автономной системы,
                идентифицирующий оператора сети
              </li>
              <li>
                <strong>Обратный DNS:</strong> поиск имени хоста для
                дополнительных данных о сети
              </li>
            </ul>
            <p className="mb-4">
              <strong>Важно:</strong> геолокация по IP даёт приблизительное
              местоположение, обычно с точностью до города. Она показывает, где
              расположена сетевая инфраструктура вашего провайдера, а не ваш
              точный физический адрес.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Как читать результаты проверки IP
            </h3>

            <h4 className="text-xl font-semibold mt-6 mb-3">Данные о местоположении</h4>
            <p className="mb-4">
              Проверка IP даёт подробную географическую информацию:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <strong>Страна:</strong> страна, в которой зарегистрирован или
                через которую маршрутизируется IP-адрес
              </li>
              <li>
                <strong>Город:</strong> местоположение до города (если доступно)
              </li>
              <li>
                <strong>Регион/область:</strong> информация об области или штате
              </li>
              <li>
                <strong>Координаты:</strong> широта и долгота для отображения на
                карте
              </li>
            </ul>

            <h4 className="text-xl font-semibold mt-6 mb-3">
              Информация о сети
            </h4>
            <p className="mb-4">Технические данные о сети:</p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <strong>ISP (провайдер):</strong> компания, предоставляющая
                доступ в интернет для этого IP-адреса
              </li>
              <li>
                <strong>ASN (номер автономной системы):</strong> уникальный номер,
                идентифицирующий домен маршрутизации оператора сети
              </li>
              <li>
                <strong>Организация:</strong> зарегистрированное название
                организации для IP-адреса
              </li>
              <li>
                <strong>Имя хоста:</strong> результат обратного DNS-запроса,
                показывающий домен, связанный с IP
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Для чего используют проверку IP
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <strong>Безопасность:</strong> выявляйте подозрительные попытки
                входа и отслеживайте потенциальные угрозы
              </li>
              <li>
                <strong>Локализация контента:</strong> показывайте
                региональный контент в зависимости от местоположения пользователя
              </li>
              <li>
                <strong>Аналитика:</strong> понимайте, откуда ваши посетители
              </li>
              <li>
                <strong>Соответствие требованиям:</strong> соблюдайте
                географические ограничения на контент
              </li>
              <li>
                <strong>Диагностика сети:</strong> находите проблемы с
                маршрутизацией и сетью
              </li>
              <li>
                <strong>Защита от мошенничества:</strong> обнаруживайте
                необычные паттерны и проверяйте местоположение пользователей
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Публичные и частные IP-адреса
            </h3>
            <p className="mb-4">
              Разница между публичными и частными IP-адресами:
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">
              Публичный IP-адрес
            </h4>
            <p className="mb-4">
              Публичный IP-адрес назначается вашим провайдером и виден всему
              интернету. Именно его видят сайты, когда вы их посещаете. Наш
              инструмент определяет ваш публичный IP-адрес автоматически.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">
              Частный IP-адрес
            </h4>
            <p className="mb-4">
              Частные IP-адреса используются внутри локальных сетей (дом, офис и
              т.д.) и не маршрутизируются в публичном интернете. Типичные диапазоны
              частных IP:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>10.0.0.0 — 10.255.255.255</li>
              <li>172.16.0.0 — 172.31.255.255</li>
              <li>192.168.0.0 — 192.168.255.255</li>
              <li>127.0.0.1 (localhost)</li>
            </ul>
            <p className="mb-4">
              Наш инструмент укажет, если IP-адрес частный или локальный.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Приватность и IP-адреса
            </h3>
            <p className="mb-4">
              Ваш IP-адрес раскрывает некоторую информацию о вашем
              местоположении и сети, но не выдаёт ваш точный адрес или личность.
              Вот что стоит знать:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                IP-адреса показывают общее местоположение (уровень города/региона),
                а не точный адрес
              </li>
              <li>
                IP-адреса назначает ваш провайдер, и они могут периодически
                меняться
              </li>
              <li>VPN может скрыть ваш реальный IP-адрес и местоположение</li>
              <li>Сайты видят ваш IP-адрес, когда вы их посещаете</li>
              <li>
                Сам по себе IP-адрес не может идентифицировать конкретного
                пользователя без дополнительных данных
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Как пользоваться нашим инструментом проверки IP
            </h3>
            <ol className="list-decimal list-inside space-y-3 mb-6 ml-4">
              <li>
                <strong>Автоопределение:</strong> при открытии страницы ваш
                IP-адрес определяется и показывается автоматически
              </li>
              <li>
                <strong>Ручная проверка:</strong> введите любой IP-адрес (IPv4 или
                IPv6) в поле, чтобы узнать его детали
              </li>
              <li>
                <strong>Результаты:</strong> смотрите подробную информацию:
                местоположение, провайдер, ASN и данные сети
              </li>
              <li>
                <strong>Карта:</strong> нажмите на превью карты, чтобы открыть
                местоположение на Google Maps
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Часто задаваемые вопросы
            </h3>

            <Faqs>
              <FaqItem question="Насколько точна геолокация по IP?">
                Геолокация по IP обычно точна до уровня города, точность
                различается по регионам. Она показывает, где расположена
                сетевая инфраструктура вашего провайдера, а не ваш точный адрес.
              </FaqItem>

              <FaqItem question="Можно ли скрыть свой IP-адрес?">
                Да, вы можете использовать VPN (виртуальную частную сеть) или
                прокси-сервис, чтобы скрыть свой реальный IP-адрес. Вместо вашего
                будет показан IP-адрес сервера VPN.
              </FaqItem>

              <FaqItem question="Почему местоположение по IP кажется неверным?">
                Местоположение по IP отражает, где находится сетевое
                оборудование вашего провайдера, — это может быть другой город,
                чем ваш реальный. Особенно часто это встречается в мобильных
                сетях и у некоторых провайдеров.
              </FaqItem>

              <FaqItem question="Проверка IP бесплатная?">
                Да, наш инструмент проверки IP полностью бесплатен. Мы ограничиваем
                запросы до 20 в минуту с одного IP, чтобы обеспечить честное
                использование.
              </FaqItem>

              <FaqItem question="Что такое ASN?">
                ASN (номер автономной системы) — уникальный идентификатор домена
                маршрутизации оператора сети в интернете. Он помогает определить,
                какая организация контролирует конкретный диапазон IP-адресов.
              </FaqItem>
            </Faqs>
          </section>

          <section className="border-t pt-8 mt-8">
            <h3 className="text-2xl font-semibold mb-4">
              Начните пользоваться бесплатным инструментом проверки IP
            </h3>
            <p className="mb-6">
              Узнайте свой IP-адрес и мгновенно получите подробную информацию о
              геолокации. Наш инструмент автоматически определяет ваш IP при
              открытии страницы, а любой IP-адрес можно проверить вручную.
              Полные данные о сети и местоположении на основе ведущих баз
              данных.
            </p>
            <p className="text-muted-foreground">
              <strong>Совет:</strong> добавьте страницу в закладки, чтобы быстро
              проверять свой IP-адрес в любой момент. Полезно для диагностики
              сетевых проблем и понимания своей видимости в сети.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
