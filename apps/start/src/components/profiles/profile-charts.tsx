import { ReportChart } from '@/components/report-chart';
import { Widget, WidgetBody } from '@/components/widget';
import { memo } from 'react';

import type { IReport } from '@openpanel/validation';
import { WidgetHead } from '../overview/overview-widget';

type Props = {
  profileId: string;
  projectId: string;
};

export const ProfileCharts = memo(
  ({ profileId, projectId }: Props) => {
    const pageViewsChart: IReport = {
      projectId,
      chartType: 'linear',
      series: [
        {
          type: 'event',
          segment: 'event',
          filters: [
            {
              id: 'profile_id',
              name: 'profile_id',
              operator: 'is',
              value: [profileId],
            },
          ],
          id: 'A',
          name: 'screen_view',
          displayName: 'События',
        },
      ],
      breakdowns: [
        {
          id: 'path',
          name: 'path',
        },
      ],
      lineType: 'monotone',
      interval: 'day',
      name: 'Events',
      range: '30d',
      previous: false,
      metric: 'sum',
    };

    const eventsChart: IReport = {
      projectId,
      chartType: 'linear',
      series: [
        {
          type: 'event',
          segment: 'event',
          filters: [
            {
              id: 'profile_id',
              name: 'profile_id',
              operator: 'is',
              value: [profileId],
            },
          ],
          id: 'A',
          name: '*',
          displayName: 'События',
        },
      ],
      breakdowns: [
        {
          id: 'name',
          name: 'name',
        },
      ],
      lineType: 'monotone',
      interval: 'day',
      name: 'Events',
      range: '30d',
      previous: false,
      metric: 'sum',
    };

    return (
      <>
        <Widget className="col-span-6 md:col-span-3">
          <WidgetHead>
            <span className="title">Просмотры страниц</span>
          </WidgetHead>
          <WidgetBody>
            <ReportChart report={pageViewsChart} />
          </WidgetBody>
        </Widget>
        <Widget className="col-span-6 md:col-span-3">
          <WidgetHead>
            <span className="title">События по дням</span>
          </WidgetHead>
          <WidgetBody>
            <ReportChart report={eventsChart} />
          </WidgetBody>
        </Widget>
      </>
    );
  },
  (a, b) => {
    return a.profileId === b.profileId && a.projectId === b.projectId;
  },
);
