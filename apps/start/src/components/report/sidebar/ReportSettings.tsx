import { Combobox } from '@/components/ui/combobox';
import { useDispatch, useSelector } from '@/redux';

import { ComboboxEvents } from '@/components/ui/combobox-events';
import { InputEnter } from '@/components/ui/input-enter';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppParams } from '@/hooks/use-app-params';
import { useEventNames } from '@/hooks/use-event-names';
import type { IChartMetric } from '@openpanel/validation';
import { useMemo } from 'react';
import {
  changeCriteria,
  changeFunnelGroup,
  changeFunnelWindow,
  changeMetric,
  changePrevious,
  changeSankeyExclude,
  changeSankeyInclude,
  changeSankeyMode,
  changeSankeySteps,
  changeStacked,
  changeUnit,
} from '../reportSlice';

export function ReportSettings() {
  const chartType = useSelector((state) => state.report.chartType);
  const previous = useSelector((state) => state.report.previous);
  const unit = useSelector((state) => state.report.unit);
  const metric = useSelector((state) => state.report.metric);
  const options = useSelector((state) => state.report.options);

  const retentionOptions = options?.type === 'retention' ? options : undefined;
  const criteria = retentionOptions?.criteria ?? 'on_or_after';

  const funnelOptions = options?.type === 'funnel' ? options : undefined;
  const funnelGroup = funnelOptions?.funnelGroup;
  const funnelWindow = funnelOptions?.funnelWindow;

  const histogramOptions = options?.type === 'histogram' ? options : undefined;
  const stacked = histogramOptions?.stacked ?? false;

  const dispatch = useDispatch();
  const { projectId } = useAppParams();
  const eventNames = useEventNames({ projectId });

  const fields = useMemo(() => {
    const fields = [];

    if (chartType !== 'retention' && chartType !== 'sankey') {
      fields.push('previous');
    }

    if (chartType === 'retention') {
      fields.push('criteria');
      fields.push('unit');
    }

    if (chartType === 'funnel' || chartType === 'conversion') {
      fields.push('funnelGroup');
      fields.push('funnelWindow');
    }

    if (chartType === 'sankey') {
      fields.push('sankeyMode');
      fields.push('sankeySteps');
      fields.push('sankeyExclude');
      fields.push('sankeyInclude');
    }

    if (chartType === 'histogram') {
      fields.push('stacked');
    }

    // `map` already reads report.metric; it just never had a way to set it.
    if (chartType === 'metric' || chartType === 'map') {
      fields.push('metric');
    }

    return fields;
  }, [chartType]);

  if (fields.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-2 font-medium">Настройки</h3>
      <div className="col rounded-lg border bg-card p-4 gap-4">
        {fields.includes('previous') && (
          <Label className="flex items-center justify-between mb-0">
            <span className="whitespace-nowrap">
              Сравнивать с предыдущим периодом
            </span>
            <Switch
              checked={previous}
              onCheckedChange={(val) => dispatch(changePrevious(!!val))}
            />
          </Label>
        )}
        {fields.includes('criteria') && (
          <div className="flex items-center justify-between gap-4">
            <Label className="whitespace-nowrap font-medium mb-0">
              Критерий
            </Label>
            <Combobox
              align="end"
              placeholder="Выберите критерий"
              value={criteria}
              onChange={(val) => dispatch(changeCriteria(val))}
              items={[
                {
                  label: 'В этот день или позже',
                  value: 'on_or_after',
                },
                {
                  label: 'В этот день',
                  value: 'on',
                },
              ]}
            />
          </div>
        )}
        {fields.includes('unit') && (
          <div className="flex items-center justify-between gap-4">
            <Label className="whitespace-nowrap font-medium mb-0">Единица</Label>
            <Combobox
              align="end"
              placeholder="Единица"
              value={unit || 'count'}
              onChange={(val) => {
                dispatch(changeUnit(val === 'count' ? undefined : val));
              }}
              items={[
                {
                  label: 'Количество',
                  value: 'count',
                },
                {
                  label: '%',
                  value: '%',
                },
              ]}
            />
          </div>
        )}
        {fields.includes('metric') && (
          <div className="flex items-center justify-between gap-4">
            <Label className="whitespace-nowrap font-medium mb-0">
              Агрегация
            </Label>
            <Combobox
              align="end"
              placeholder="Агрегация"
              value={metric}
              onChange={(val) => dispatch(changeMetric(val as IChartMetric))}
              // Same labels the report table uses for these columns.
              items={[
                { label: 'Уникальные', value: 'count' },
                { label: 'Сумма', value: 'sum' },
                { label: 'Среднее', value: 'average' },
                { label: 'Минимум', value: 'min' },
                { label: 'Максимум', value: 'max' },
              ]}
            />
          </div>
        )}
        {fields.includes('funnelGroup') && (
          <div className="flex items-center justify-between gap-4">
            <Label className="whitespace-nowrap font-medium mb-0">
              Группа воронки
            </Label>
            <Combobox
              align="end"
              placeholder="По умолчанию: Сессия"
              value={funnelGroup || 'session_id'}
              onChange={(val) => {
                dispatch(
                  changeFunnelGroup(val === 'session_id' ? undefined : val),
                );
              }}
              items={[
                {
                  label: 'Сессия',
                  value: 'session_id',
                },
                {
                  label: 'Профиль',
                  value: 'profile_id',
                },
              ]}
            />
          </div>
        )}
        {fields.includes('funnelWindow') && (
          <div className="flex items-center justify-between gap-4">
            <Label className="whitespace-nowrap font-medium mb-0">
              Окно воронки
            </Label>
            <InputEnter
              type="number"
              value={funnelWindow ? String(funnelWindow) : ''}
              placeholder="По умолчанию: 24ч"
              onChangeValue={(value) => {
                const parsed = Number.parseFloat(value);
                if (Number.isNaN(parsed)) {
                  dispatch(changeFunnelWindow(undefined));
                } else {
                  dispatch(changeFunnelWindow(parsed));
                }
              }}
            />
          </div>
        )}
        {fields.includes('sankeyMode') && options?.type === 'sankey' && (
          <div className="flex items-center justify-between gap-4">
            <Label className="whitespace-nowrap font-medium mb-0">Режим</Label>
            <Combobox
              align="end"
              placeholder="Выберите режим"
              value={options?.mode || 'after'}
              onChange={(val) => {
                dispatch(
                  changeSankeyMode(val as 'between' | 'after' | 'before'),
                );
              }}
              items={[
                {
                  label: 'После',
                  value: 'after',
                },
                {
                  label: 'До',
                  value: 'before',
                },
                {
                  label: 'Между',
                  value: 'between',
                },
              ]}
            />
          </div>
        )}
        {fields.includes('sankeySteps') && options?.type === 'sankey' && (
          <div className="flex items-center justify-between gap-4">
            <Label className="whitespace-nowrap font-medium mb-0">Шаги</Label>
            <InputEnter
              type="number"
              value={options?.steps ? String(options.steps) : '5'}
              placeholder="По умолчанию: 5"
              onChangeValue={(value) => {
                const parsed = Number.parseInt(value, 10);
                if (Number.isNaN(parsed) || parsed < 2 || parsed > 10) {
                  dispatch(changeSankeySteps(5));
                } else {
                  dispatch(changeSankeySteps(parsed));
                }
              }}
            />
          </div>
        )}
        {fields.includes('sankeyExclude') && options?.type === 'sankey' && (
          <div className="flex flex-col">
            <Label className="whitespace-nowrap font-medium">
              Исключить события
            </Label>
            <ComboboxEvents
              multiple
              searchable
              value={options?.exclude || []}
              onChange={(value) => {
                dispatch(changeSankeyExclude(value));
              }}
              items={eventNames.filter((item) => item.name !== '*')}
              placeholder="Выберите события для исключения"
            />
          </div>
        )}
        {fields.includes('sankeyInclude') && options?.type === 'sankey' && (
          <div className="flex flex-col">
            <Label className="whitespace-nowrap font-medium">
              Включить события
            </Label>
            <ComboboxEvents
              multiple
              searchable
              value={options?.include || []}
              onChange={(value) => {
                dispatch(
                  changeSankeyInclude(value.length > 0 ? value : undefined),
                );
              }}
              items={eventNames.filter((item) => item.name !== '*')}
              placeholder="Оставьте пустым, чтобы включить все"
            />
          </div>
        )}
        {fields.includes('stacked') && (
          <Label className="flex items-center justify-between mb-0">
            <span className="whitespace-nowrap">Накапливать серии</span>
            <Switch
              checked={stacked}
              onCheckedChange={(val) => dispatch(changeStacked(!!val))}
            />
          </Label>
        )}
      </div>
    </div>
  );
}
