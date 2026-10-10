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
  CheckCircle2,
  Code,
  ExternalLink,
  Globe,
  Loader2,
  Search,
  Share2,
  Shield,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { SocialPreview } from './social-preview';

interface SiteCheckResult {
  url: string;
  finalUrl: string;
  timestamp: string;
  seo: {
    title: { value: string; length: number };
    description: { value: string; length: number };
    canonical: string | null;
    h1: string[];
    robotsMeta: string | null;
    robotsTxtStatus: 'allowed' | 'blocked' | 'error';
    hasSitemap: boolean;
  };
  social: {
    og: {
      title: string | null;
      description: string | null;
      image: string | null;
      url: string | null;
      type: string | null;
    };
    twitter: {
      card: string | null;
      title: string | null;
      description: string | null;
      image: string | null;
    };
  };
  technical: {
    statusCode: number;
    redirectChain: { url: string; status: number; responseTime: number }[];
    responseTime: {
      dns: number;
      connect: number;
      tls: number;
      ttfb: number;
      total: number;
    };
    contentType: string;
    pageSize: number;
    server: string | null;
    ssl: {
      valid: boolean;
      issuer: string;
      expires: string;
    } | null;
  };
  hosting: {
    ip: string;
    location: {
      country: string;
      countryName?: string;
      city: string;
      region: string | null;
      timezone: string | null;
      latitude: number | null;
      longitude: number | null;
    } | null;
    isp: string | null;
    asn: string | null;
    organization: string | null;
    cdn: string | null;
  };
  security: {
    csp: string | null;
    xFrameOptions: string | null;
    xContentTypeOptions: string | null;
    hsts: string | null;
    score: number;
  };
}

type Tab = 'seo' | 'social' | 'technical' | 'security';

export default function SiteCheckerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [result, setResult] = useState<SiteCheckResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('seo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/tools/site-checker?url=${encodeURIComponent(url)}`,
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
        throw new Error(data.error || 'Не удалось проверить сайт');
      }

      setIsRateLimited(false);

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({
    status,
  }: {
    status: 'pass' | 'fail' | 'warning' | 'info';
  }) => {
    switch (status) {
      case 'pass':
        return (
          <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
        );
      case 'fail':
        return <XCircle className="size-5 text-destructive" />;
      case 'warning':
        return (
          <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
        );
      default:
        return <AlertCircle className="size-5 text-primary" />;
    }
  };

  const InfoRow = ({
    label,
    value,
    status,
    helpText,
  }: {
    label: string;
    value: React.ReactNode;
    status?: 'pass' | 'fail' | 'warning' | 'info';
    helpText?: string;
  }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{label}</span>
          {status && <StatusIcon status={status} />}
        </div>
        <div className="text-sm text-muted-foreground break-words">{value}</div>
        {helpText && (
          <div className="text-xs text-muted-foreground mt-1">{helpText}</div>
        )}
      </div>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'seo', label: 'SEO', icon: <Search className="size-4" /> },
    { id: 'social', label: 'Соцсети', icon: <Share2 className="size-4" /> },
    { id: 'technical', label: 'Технические', icon: <Code className="size-4" /> },
    { id: 'security', label: 'Безопасность', icon: <Shield className="size-4" /> },
  ];

  return (
    <div className="max-w-4xl">
      <SectionHeader
        title="Проверка URL"
        description="Анализ любого сайта: SEO, соцсети, технические данные и безопасность. Подробные сведения о любом URL."
        variant="default"
        as="h1"
      />

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            size="lg"
          />
          <Button type="submit" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Проверяем...
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
                  Вы можете делать до 10 запросов в минуту. Пожалуйста,
                  попробуйте позже.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8">
          {/* Header with final URL */}
          <FeatureCardContainer className="mb-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Итоговый URL</span>
            </div>
            <div className="row gap-2 items-center">
              <img
                src={`https://api.openpanel.dev/misc/favicon?url=${encodeURIComponent(result.finalUrl)}`}
                alt="Фавикон"
                className="size-4 rounded-xs"
              />
              <a
                href={result.finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 break-all"
              >
                {result.finalUrl}
                <ExternalLink className="size-3" />
              </a>
            </div>
            {result.url !== result.finalUrl && (
              <div className="text-xs text-muted-foreground mt-1">
                Перенаправление с: {result.url}
              </div>
            )}
          </FeatureCardContainer>

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <InfoRow
                label="Заголовок (Title)"
                value={result.seo.title.value || 'Не задан'}
                status={
                  result.seo.title.length > 0
                    ? result.seo.title.length >= 30 &&
                      result.seo.title.length <= 60
                      ? 'pass'
                      : 'warning'
                    : 'fail'
                }
                helpText={`${result.seo.title.length} символов (рекомендуется: 30–60)`}
              />
              <InfoRow
                label="Meta-описание"
                value={result.seo.description.value || 'Не задано'}
                status={
                  result.seo.description.length > 0
                    ? result.seo.description.length >= 120 &&
                      result.seo.description.length <= 160
                      ? 'pass'
                      : 'warning'
                    : 'fail'
                }
                helpText={`${result.seo.description.length} символов (рекомендуется: 120–160)`}
              />
              <InfoRow
                label="Canonical URL"
                value={result.seo.canonical || 'Не задан'}
                status={result.seo.canonical ? 'pass' : 'warning'}
              />
              <InfoRow
                label="H1-заголовки"
                value={
                  result.seo.h1.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {result.seo.h1.map((h1) => (
                        <li key={h1}>{h1}</li>
                      ))}
                    </ul>
                  ) : (
                    'Не найдено'
                  )
                }
                status={
                  result.seo.h1.length === 1
                    ? 'pass'
                    : result.seo.h1.length === 0
                      ? 'fail'
                      : 'warning'
                }
                helpText={
                  result.seo.h1.length === 0
                    ? 'H1-заголовок не найден'
                    : result.seo.h1.length > 1
                      ? 'Найдено несколько H1 (рекомендуется: 1)'
                      : 'Найден один H1-заголовок'
                }
              />
              <InfoRow
                label="Meta Robots"
                value={result.seo.robotsMeta || 'Не задан'}
                status={result.seo.robotsMeta ? 'info' : 'pass'}
              />
              <InfoRow
                label="Robots.txt"
                value={
                  result.seo.robotsTxtStatus === 'allowed'
                    ? 'Разрешён'
                    : result.seo.robotsTxtStatus === 'blocked'
                      ? 'Заблокирован'
                      : 'Ошибка проверки'
                }
                status={
                  result.seo.robotsTxtStatus === 'allowed'
                    ? 'pass'
                    : result.seo.robotsTxtStatus === 'blocked'
                      ? 'fail'
                      : 'warning'
                }
              />
              <InfoRow
                label="Sitemap"
                value={result.seo.hasSitemap ? 'Найден' : 'Не найден'}
                status={result.seo.hasSitemap ? 'pass' : 'warning'}
                helpText={
                  result.seo.hasSitemap
                    ? '/sitemap.xml существует'
                    : '/sitemap.xml не найден'
                }
              />
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              {/* Preview Card */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Превью для соцсетей
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Посмотрите, как ваша ссылка будет выглядеть при публикации в
                    социальных сетях
                  </p>
                </div>
                <div className="max-w-md">
                  <SocialPreview
                    title={
                      result.social.og.title ||
                      result.social.twitter.title ||
                      result.seo.title.value
                    }
                    description={
                      result.social.og.description ||
                      result.social.twitter.description ||
                      result.seo.description.value
                    }
                    image={
                      result.social.og.image || result.social.twitter.image
                    }
                    url={result.finalUrl}
                    domain={new URL(result.finalUrl).hostname}
                  />
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3">
                  Open Graph — подробно
                </h3>
                <div className="space-y-2">
                  <InfoRow
                    label="OG Title"
                    value={result.social.og.title || 'Не задано'}
                    status={result.social.og.title ? 'pass' : 'warning'}
                  />
                  <InfoRow
                    label="OG Description"
                    value={result.social.og.description || 'Не задано'}
                    status={result.social.og.description ? 'pass' : 'warning'}
                  />
                  <InfoRow
                    label="OG Image"
                    value={
                      result.social.og.image ? (
                        <a
                          href={result.social.og.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {result.social.og.image}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        'Не задано'
                      )
                    }
                    status={result.social.og.image ? 'pass' : 'warning'}
                  />
                  <InfoRow
                    label="OG URL"
                    value={result.social.og.url || 'Не задан'}
                    status={result.social.og.url ? 'pass' : 'warning'}
                  />
                  <InfoRow
                    label="OG Type"
                    value={result.social.og.type || 'Не задан'}
                    status={result.social.og.type ? 'pass' : 'warning'}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Twitter Card — подробно
                </h3>
                <div className="space-y-2">
                  <InfoRow
                    label="Тип карточки"
                    value={result.social.twitter.card || 'Не задан'}
                    status={result.social.twitter.card ? 'pass' : 'warning'}
                  />
                  <InfoRow
                    label="Twitter Title"
                    value={result.social.twitter.title || 'Не задано'}
                    status={result.social.twitter.title ? 'pass' : 'warning'}
                  />
                  <InfoRow
                    label="Twitter Description"
                    value={result.social.twitter.description || 'Не задано'}
                    status={
                      result.social.twitter.description ? 'pass' : 'warning'
                    }
                  />
                  <InfoRow
                    label="Twitter Image"
                    value={
                      result.social.twitter.image ? (
                        <a
                          href={result.social.twitter.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {result.social.twitter.image}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        'Не задано'
                      )
                    }
                    status={result.social.twitter.image ? 'pass' : 'warning'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Technical Tab */}
          {activeTab === 'technical' && (
            <div className="space-y-4">
              <InfoRow
                label="HTTP-статус"
                value={
                  <span
                    className={cn(
                      'font-mono',
                      result.technical.statusCode >= 200 &&
                        result.technical.statusCode < 300
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : result.technical.statusCode >= 300 &&
                            result.technical.statusCode < 400
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-destructive',
                    )}
                  >
                    {result.technical.statusCode}
                  </span>
                }
                status={
                  result.technical.statusCode >= 200 &&
                  result.technical.statusCode < 300
                    ? 'pass'
                    : result.technical.statusCode >= 300 &&
                        result.technical.statusCode < 400
                      ? 'warning'
                      : 'fail'
                }
              />
              {result.technical.redirectChain.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Цепочка перенаправлений</div>
                  <div className="space-y-2">
                    {result.technical.redirectChain.map((hop, i) => (
                      <div
                        key={hop.url}
                        className="flex items-center gap-2 text-sm p-2 bg-accent rounded"
                      >
                        <span className="font-mono text-xs">{hop.status}</span>
                        <span className="flex-1 truncate">{hop.url}</span>
                        <span className="text-muted-foreground text-xs">
                          {hop.responseTime}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Detailed Response Time Breakdown */}
              <FeatureCardContainer className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Разбивка времени ответа</h4>
                  <span
                    className={cn(
                      'text-lg font-bold',
                      result.technical.responseTime.total < 1000
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : result.technical.responseTime.total < 3000
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-destructive',
                    )}
                  >
                    {result.technical.responseTime.total}мс всего
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">DNS-запрос</span>
                    <span className="font-mono">
                      {result.technical.responseTime.dns}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Соединение</span>
                    <span className="font-mono">
                      {result.technical.responseTime.connect}ms
                    </span>
                  </div>
                  {result.technical.responseTime.tls > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        TLS-рукопожатие
                      </span>
                      <span className="font-mono">
                        {result.technical.responseTime.tls}ms
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Время до первого байта (TTFB)
                    </span>
                    <span className="font-mono">
                      {result.technical.responseTime.ttfb}ms
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Всего</span>
                      <span className="font-mono font-semibold">
                        {result.technical.responseTime.total}ms
                      </span>
                    </div>
                  </div>
                </div>
              </FeatureCardContainer>
              <InfoRow
                label="Тип контента"
                value={result.technical.contentType}
                status="info"
              />
              <InfoRow
                label="Размер страницы"
                value={`${(result.technical.pageSize / 1024).toFixed(2)} КБ`}
                status="info"
              />
              <InfoRow
                label="Сервер"
                value={result.technical.server || 'Не определён'}
                status="info"
              />
              {result.technical.ssl && (
                <InfoRow
                  label="SSL-сертификат"
                  value={
                    <div>
                      <div>Эмитент: {result.technical.ssl.issuer}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Истекает:{' '}
                        {new Date(
                          result.technical.ssl.expires,
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  }
                  status={result.technical.ssl.valid ? 'pass' : 'fail'}
                />
              )}
              {/* Server IP & Hosting Info */}
              {result.hosting.ip && (
                <FeatureCardContainer className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="size-5" />
                    <h4 className="font-semibold">IP сервера и хостинг</h4>
                  </div>

                  <InfoRow
                    label="IP-адрес"
                    value={result.hosting.ip}
                    status="info"
                  />

                  {result.hosting.location && (
                    <InfoRow
                      label="Местоположение"
                      value={
                        <div>
                          {result.hosting.location.city &&
                          result.hosting.location.country ? (
                            <>
                              {result.hosting.location.city}
                              {result.hosting.location.region &&
                                `, ${result.hosting.location.region}`}
                              {`, ${result.hosting.location.country}`}
                              {result.hosting.location.latitude &&
                                result.hosting.location.longitude && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {result.hosting.location.latitude.toFixed(
                                      4,
                                    )}
                                    ,{' '}
                                    {result.hosting.location.longitude.toFixed(
                                      4,
                                    )}
                                  </div>
                                )}
                            </>
                          ) : (
                            result.hosting.location.country || 'Неизвестно'
                          )}
                        </div>
                      }
                      status="info"
                    />
                  )}

                  {result.hosting.isp && (
                    <InfoRow
                      label="ISP"
                      value={result.hosting.isp}
                      status="info"
                    />
                  )}

                  {result.hosting.asn && (
                    <InfoRow
                      label="ASN"
                      value={result.hosting.asn}
                      status="info"
                    />
                  )}

                  {result.hosting.organization && (
                    <InfoRow
                      label="Организация"
                      value={result.hosting.organization}
                      status="info"
                    />
                  )}

                  {result.hosting.cdn && (
                    <InfoRow
                      label="CDN"
                      value={result.hosting.cdn}
                      status="pass"
                    />
                  )}

                  <div className="pt-2 border-t text-xs text-muted-foreground space-y-2">
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
                    {(result.hosting.isp || result.hosting.asn) && (
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
                </FeatureCardContainer>
              )}

              {!result.hosting.ip && (
                <InfoRow
                  label="IP-адрес сервера"
                  value="Не определён"
                  status="warning"
                />
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <FeatureCardContainer className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="size-5" />
                  <span className="font-semibold">Оценка безопасности</span>
                </div>
                <div className="text-3xl font-bold">
                  {result.security.score}/100
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all',
                      result.security.score >= 70
                        ? 'bg-emerald-600 dark:bg-emerald-400'
                        : result.security.score >= 40
                          ? 'bg-amber-600 dark:bg-amber-400'
                          : 'bg-destructive',
                    )}
                    style={{ width: `${result.security.score}%` }}
                  />
                </div>
              </FeatureCardContainer>

              <InfoRow
                label="Content-Security-Policy"
                value={result.security.csp || 'Не задан'}
                status={result.security.csp ? 'pass' : 'fail'}
                helpText={
                  result.security.csp
                    ? 'CSP-заголовок присутствует'
                    : 'CSP-заголовок отсутствует'
                }
              />
              <InfoRow
                label="X-Frame-Options"
                value={result.security.xFrameOptions || 'Не задан'}
                status={
                  result.security.xFrameOptions
                    ? result.security.xFrameOptions.toLowerCase() === 'deny' ||
                      result.security.xFrameOptions.toLowerCase() ===
                        'sameorigin'
                      ? 'pass'
                      : 'warning'
                    : 'fail'
                }
                helpText={
                  result.security.xFrameOptions
                    ? 'Защищает от кликджекинга'
                    : 'Отсутствует заголовок X-Frame-Options'
                }
              />
              <InfoRow
                label="X-Content-Type-Options"
                value={result.security.xContentTypeOptions || 'Не задан'}
                status={
                  result.security.xContentTypeOptions?.toLowerCase() ===
                  'nosniff'
                    ? 'pass'
                    : result.security.xContentTypeOptions
                      ? 'warning'
                      : 'fail'
                }
                helpText={
                  result.security.xContentTypeOptions?.toLowerCase() ===
                  'nosniff'
                    ? 'Предотвращает сниффинг MIME-типов'
                    : 'Отсутствует или неверный заголовок X-Content-Type-Options'
                }
              />
              <InfoRow
                label="Strict-Transport-Security (HSTS)"
                value={result.security.hsts || 'Не задан'}
                status={result.security.hsts ? 'pass' : 'warning'}
                helpText={
                  result.security.hsts
                    ? 'Требует использования HTTPS-соединений'
                    : 'Отсутствует HSTS-заголовок (применимо только к HTTPS-сайтам)'
                }
              />
            </div>
          )}
        </div>
      )}

      {/* SEO Content Section */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <article className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Бесплатная проверка URL и анализ сайта
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Проверяйте любой URL на SEO-проблемы, уязвимости безопасности и
              узкие места в производительности. Наш бесплатный инструмент анализирует
              мета-теги, превью для соцсетей, заголовки безопасности и
              конфигурацию сервера за секунды.
            </p>
          </div>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Что анализирует этот инструмент
            </h3>
            <p className="mb-4">
              Вставьте любой URL и получите полный разбор страницы по четырём
              ключевым направлениям:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <strong>Состояние SEO:</strong> title-теги, мета-описания,
                H1-заголовки, canonical URL и индексируемость
              </li>
              <li>
                <strong>Превью для соцсетей:</strong> как ваша ссылка выглядит
                при публикации в Facebook, Twitter и LinkedIn
              </li>
              <li>
                <strong>Производительность:</strong> время ответа, TTFB,
                DNS-запрос, TLS-рукопожатие и расположение сервера
              </li>
              <li>
                <strong>Безопасность:</strong> статус SSL-сертификата,
                заголовки безопасности и проверки уязвимостей
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">SEO-анализ</h3>

            <h4 className="text-xl font-semibold mt-6 mb-3">Title-теги</h4>
            <p className="mb-4">
              Title-теги отображаются в результатах поиска и на вкладках
              браузера. Это один из самых сильных сигналов ранжирования на
              самой странице.
              Наш инструмент проверяет, что ваш заголовок:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>От 30 до 60 символов (оптимально для выдачи)</li>
              <li>Присутствует и не пустой</li>
              <li>Уникальный и содержательный</li>
            </ul>

            <h4 className="text-xl font-semibold mt-6 mb-3">
              Мета-описания
            </h4>
            <p className="mb-4">
              Мета-описания напрямую не влияют на позиции, но существенно
              сказываются на кликабельности. Хорошее описание — 120–160 символов,
              с понятной ценностью и призывом кликнуть.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">H1-заголовки</h4>
            <p className="mb-4">
              На каждой странице должен быть ровно один H1, который ясно описывает
              её содержимое. Наш инструмент находит отсутствующие H1 и помогает
              поддерживать правильную структуру заголовков.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">Canonical URL</h4>
            <p className="mb-4">
              Canonical-теги предотвращают дубли контента, сообщая поисковым
              системам, какая версия URL считается основной. Это важно для страниц,
              доступных по нескольким URL, с параметрами или вариантами
              HTTP/HTTPS и www/без www.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">Индексируемость</h4>
            <p className="mb-4">
              Инструмент анализирует правила robots.txt и мета-теги robots,
              чтобы определить, могут ли поисковые системы обходить и индексировать
              вашу страницу. Вы увидите понятные предупреждения, если что-то
              блокирует индексацию.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Превью для соцсетей
            </h3>
            <p className="mb-4">
              Когда кто-то публикует ваш URL в соцсетях, то, что отобразится,
              контролируют теги Open Graph и Twitter Card. Без них платформы
              угадывают — часто плохо.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">Теги Open Graph</h4>
            <p className="mb-4">
              Open Graph управляет отображением ссылок в Facebook, LinkedIn и
              большинстве других платформ. Ключевые теги:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <code>og:title</code> — заголовок в карточке публикации
              </li>
              <li>
                <code>og:description</code> — краткий текст под заголовком
              </li>
              <li>
                <code>og:image</code> — превью-изображение (рекомендуется:
                1200×630px)
              </li>
              <li>
                <code>og:url</code> — канонический URL контента
              </li>
            </ul>

            <h4 className="text-xl font-semibold mt-6 mb-3">Twitter Cards</h4>
            <p className="mb-4">
              У Twitter собственный формат карточек. Наш инструмент проверяет:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <code>twitter:card</code> — тип карточки (summary или
                summary_large_image)
              </li>
              <li>
                <code>twitter:title</code> и <code>twitter:description</code>
              </li>
              <li>
                <code>twitter:image</code> — изображение для превью твита
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Показатели производительности</h3>
            <p className="mb-4">
              Скорость страницы влияет и на пользовательский опыт, и на позиции
              в поиске. Наш инструмент показывает, на что именно уходит время:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>
                <strong>DNS-запрос:</strong> время преобразования домена в
                IP-адрес. Медленный DNS? Подумайте о более быстром провайдере или
                кешировании DNS.
              </li>
              <li>
                <strong>Время соединения:</strong> установление TCP-соединения.
                Зависит от расположения сервера относительно пользователей.
              </li>
              <li>
                <strong>TLS-рукопожатие:</strong> согласование SSL/TLS для HTTPS.
                Современные версии TLS и CDN сокращают это время.
              </li>
              <li>
                <strong>Время до первого байта (TTFB):</strong> время до начала
                ответа сервера. Меньше 200мс — хорошо. Отражает скорость обработки
                на сервере.
              </li>
              <li>
                <strong>Общее время:</strong> полный запрос, включая загрузку
                тела ответа.
              </li>
            </ul>

            <h4 className="text-xl font-semibold mt-6 mb-3">
              Информация о сервере
            </h4>
            <p className="mb-4">
              Инструмент также показывает данные хостинга: IP и расположение
              сервера, хостинг-провайдера, определение CDN (Cloudflare, Fastly,
              Vercel и др.) и серверное ПО (Nginx, Apache).
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Анализ безопасности</h3>
            <p className="mb-4">
              Заголовки безопасности защищают ваш сайт и посетителей от
              распространённых атак. Наш инструмент оценивает четыре ключевых
              заголовка:
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">
              Content Security Policy (CSP)
            </h4>
            <p className="mb-4">
              CSP предотвращает межсайтовый скриптинг (XSS), контролируя, какие
              ресурсы могут загружаться. Скрипты ограничиваются доверенными
              источниками, а встроенный код блокируется.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">X-Frame-Options</h4>
            <p className="mb-4">
              Предотвращает кликджекинг, управляя тем, можно ли встраивать вашу
              страницу в iframe. Для защиты установите DENY или SAMEORIGIN.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">
              X-Content-Type-Options
            </h4>
            <p className="mb-4">
              Установите <code>nosniff</code>, чтобы браузеры не пытались
              определять MIME-тип самостоятельно — это может привести к
              уязвимостям.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">
              Strict-Transport-Security (HSTS)
            </h4>
            <p className="mb-4">
              Принуждает использовать HTTPS, предотвращая атаки понижения
              протокола. Обязательно для сайтов с любыми чувствительными данными.
            </p>

            <h4 className="text-xl font-semibold mt-6 mb-3">SSL-сертификат</h4>
            <p className="mb-4">
              Инструмент проверяет, что ваш SSL-сертификат действителен,
              доверенный и не истекает в ближайшее время. Просроченные
              сертификаты вызывают предупреждения браузера и подрывают доверие
              пользователей.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Как пользоваться инструментом
            </h3>
            <ol className="list-decimal list-inside space-y-3 mb-6 ml-4">
              <li>
                <strong>Введите URL:</strong> вставьте любой веб-адрес (с
                https:// или без)
              </li>
              <li>
                <strong>Нажмите «Проверить»:</strong> анализ занимает 2–5 секунд
              </li>
              <li>
                <strong>Изучите результаты:</strong> переключайтесь между
                вкладками SEO, Соцсети, Производительность и Безопасность
              </li>
              <li>
                <strong>Исправьте проблемы:</strong> устраните предупреждения и
                отсутствующие элементы
              </li>
            </ol>
            <p className="mb-4">
              Совет: проверяйте страницы после значительных изменений и
              периодически аудитируйте сайты конкурентов, чтобы понять, что они
              делают правильно.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Быстрый чек-лист оптимизации
            </h3>

            <h4 className="text-xl font-semibold mt-6 mb-3">Основы SEO</h4>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>Уникальный title-тег (30–60 символов) на каждой странице</li>
              <li>Цепляющее мета-описание (120–160 символов)</li>
              <li>Один содержательный H1-заголовок</li>
              <li>Canonical URL задан правильно</li>
              <li>Страница индексируется (без случайного noindex)</li>
            </ul>

            <h4 className="text-xl font-semibold mt-6 mb-3">Производительность</h4>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>TTFB меньше 200мс</li>
              <li>Используйте CDN для глобального охвата</li>
              <li>Включите сжатие (gzip/brotli)</li>
              <li>Оптимизируйте изображения и включите кеширование</li>
            </ul>

            <h4 className="text-xl font-semibold mt-6 mb-3">Безопасность</h4>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              <li>Действительный SSL-сертификат (не истекает в ближайшее время)</li>
              <li>Все четыре заголовка безопасности настроены</li>
              <li>HSTS включён для принудительного HTTPS</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Часто задаваемые вопросы
            </h3>

            <Faqs>
              <FaqItem question="Чем проверка URL отличается от полного аудита сайта?">
                Проверка URL анализирует одну страницу. Полный аудит сайта
                обходит весь ваш сайт целиком. Этот инструмент проверяет отдельные
                URL — это быстрее и удобно для точечной проверки конкретных
                страниц.
              </FaqItem>

              <FaqItem question="Как часто нужно проверять свои URL?">
                Проверяйте после публикации новых страниц, значительных
                обновлений или смены хостинга/CDN. Ежемесячный аудит ключевых
                страниц позволяет находить проблемы до того, как они повлияют на
                позиции.
              </FaqItem>

              <FaqItem question="Какой TTFB считается хорошим?">
                Меньше 200мс — хорошо. 200–500мс — приемлемо. Свыше 500мс
                указывает на проблемы с сервером или конфигурацией, которые стоит
                исследовать.
              </FaqItem>

              <FaqItem question="Какой оценки безопасности стремиться достичь?">
                100% означает, что присутствуют все четыре заголовка
                безопасности. Стремитесь хотя бы к 75% (три заголовка). CSP может
                быть сложным во внедрении, остальные — простые.
              </FaqItem>

              <FaqItem question="Можно ли проверять сайты конкурентов?">
                Да. Инструмент работает с любым публичным URL. Анализ конкурентов
                показывает их SEO-стратегию, настройки хостинга и уровень
                безопасности.
              </FaqItem>

              <FaqItem question="Почему моя страница помечена как неиндексируемая?">
                Частые причины: мета-тег noindex, robots.txt, блокирующий
                краулеров, или canonical, указывающий на другой адрес. Подробности
                смотрите на вкладке SEO.
              </FaqItem>

              <FaqItem question="Этот инструмент бесплатный?">
                Да, полностью бесплатный. Мы ограничиваем количество проверок до
                10 в минуту с одного IP, чтобы сервис оставался доступным всем.
              </FaqItem>
            </Faqs>
          </section>

          <section className="border-t pt-8 mt-8">
            <h3 className="text-2xl font-semibold mb-4">
              Начните проверять URL прямо сейчас
            </h3>
            <p className="mb-6">
              Введите любой URL выше, чтобы мгновенно получить информацию о SEO,
              производительности, безопасности и превью в соцсетях. Находите
              проблемы до того, как они навредят позициям или пользовательскому
              опыту.
            </p>
            <p className="text-muted-foreground">
              <strong>Создано OpenPanel</strong> — платформой аналитики с
              открытым исходным кодом. Мы используем те же проверки, чтобы помогать
              тысячам сайтов понимать свой трафик и улучшать производительность.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
