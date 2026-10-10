import { ReportChart } from '@/components/report-chart';
import { Button } from '@/components/ui/button';
import { pushModal } from '@/modals';
import type { IReport, IReportInput } from '@openpanel/validation';
import { SaveIcon } from 'lucide-react';
import { asReportOutput } from './output-types';
import { ResultCard, ToolStateGuard } from './shared';
import type { ToolResultProps } from './types';

/**
 * Renders the result of `get_report_data` / `generate_report` /
 * `preview_report_with_changes` / `get_funnel` / `get_rolling_active_users` —
 * all return `{ report, data }` we can plug into `<ReportChart>`.
 *
 * Title priority (first match wins):
 *   1. `output.name` if the tool returned one (e.g. a saved report's name)
 *   2. A nice derived title from the tool's INPUT args (funnel → "Funnel: A → B", etc.)
 *   3. `"<CHART_TYPE> chart"` fallback
 */
export function ChatReportResult({ part }: ToolResultProps) {
  return (
    <ToolStateGuard
      state={part.state}
      errorText={part.errorText}
      toolName={part.type.replace(/^tool-/, '')}
    >
      <ChatReportInner
        output={part.output}
        input={part.input}
        toolType={part.type}
      />
    </ToolStateGuard>
  );
}

function ChatReportInner({
  output,
  input,
  toolType,
}: {
  output: unknown;
  input: unknown;
  toolType: string;
}) {
  const value = asReportOutput(output);
  if (!value || value.error) {
    return (
      <ResultCard>
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {value?.error ?? 'Нет данных'}
        </div>
      </ResultCard>
    );
  }

  const report = value.report;
  if (!report || !report.chartType) {
    return (
      <ResultCard title={value.name ?? 'Отчёт'}>
        <div className="px-3 py-2 text-sm text-muted-foreground">
          Данные отчёта получены, но конфигурация для отображения отсутствует.
        </div>
      </ResultCard>
    );
  }

  const title =
    value.name ??
    deriveTitleFromInput(toolType, input) ??
    `Отчёт (${humanizeChartType(String(report.chartType))})`;

  return (
    <ResultCard title={title}>
      <div className="p-2">
        <ReportChart
          report={report as unknown as IReportInput}
          lazy={false}
          options={{
            hideLegend: false,
            hideXAxis: false,
            minHeight: 180,
            maxHeight: 260,
          }}
        />
      </div>
      {(value.dashboard_url || !report.id) && (
        <div className="border-t px-3 py-1.5 flex items-center justify-between gap-2">
          {value.dashboard_url && (
            <a
              href={value.dashboard_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline"
            >
              Открыть в дашборде →
            </a>
          )}
          {!report.id && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-6 text-sm"
              onClick={() =>
                pushModal('SaveReport', {
                  report: {
                    ...report,
                    name: value.name ?? report.name,
                  } as unknown as IReport,
                  disableRedirect: true,
                })
              }
            >
              <SaveIcon className="size-3 mr-1" />
              Сохранить
            </Button>
          )}
        </div>
      )}
    </ResultCard>
  );
}

/**
 * Build a human title from the tool call's input args. The model
 * often calls chart tools without setting `output.name` explicitly
 * — we can do better than `"LINEAR chart"` by reading what the
 * user actually asked for.
 */
function deriveTitleFromInput(toolType: string, input: unknown): string | null {
  if (!input || typeof input !== 'object') return null;
  const args = input as {
    steps?: unknown;
    series?: Array<{ name?: string; displayName?: string }>;
    chartType?: string;
    windowDays?: number;
    days?: number;
  };

  switch (toolType) {
    case 'tool-get_funnel': {
      if (Array.isArray(args.steps) && args.steps.length > 0) {
        const names = args.steps.filter((s): s is string => typeof s === 'string');
        if (names.length > 0) return `Воронка: ${names.join(' → ')}`;
      }
      return 'Воронка';
    }

    case 'tool-get_rolling_active_users': {
      const w = args.windowDays ?? 1;
      const label = w === 1 ? 'DAU' : w === 7 ? 'WAU' : w === 30 ? 'MAU' : `${w}-дневные активные пользователи`;
      const days = args.days ?? 30;
      return `${label} — последние ${days} дн.`;
    }

    case 'tool-generate_report': {
      const events = Array.isArray(args.series)
        ? args.series
            .map((s) => s?.displayName || s?.name)
            .filter((n): n is string => typeof n === 'string' && n.length > 0)
        : [];
      const kind = args.chartType
        ? humanizeChartType(args.chartType)
        : 'Отчёт';
      if (events.length === 0) return kind;
      if (events.length === 1) return `${kind}: ${events[0]}`;
      return `${kind}: ${events.join(', ')}`;
    }

    default:
      return null;
  }
}

function humanizeChartType(type: string): string {
  switch (type) {
    case 'linear':
      return 'Линейный график';
    case 'bar':
      return 'Столбчатая диаграмма';
    case 'area':
      return 'Диаграмма с областями';
    case 'pie':
      return 'Круговая диаграмма';
    case 'funnel':
      return 'Воронка';
    case 'metric':
      return 'Метрика';
    case 'retention':
      return 'Удержание';
    case 'histogram':
      return 'Гистограмма';
    case 'sankey':
      return 'Sankey';
    case 'map':
      return 'Карта';
    case 'conversion':
      return 'Конверсия';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
