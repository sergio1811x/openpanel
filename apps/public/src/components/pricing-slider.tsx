'use client';
import NumberFlow from '@number-flow/react';

import { cn } from '@/lib/utils';
import { PRICING } from '@openpanel/payments/prices';
import { useState } from 'react';
import { Slider } from './ui/slider';

export function PricingSlider() {
  const [index, setIndex] = useState(2);
  const match = PRICING[index];
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <>
      <Slider
        value={[index]}
        max={PRICING.length}
        step={1}
        tooltip={
          match
            ? `${formatNumber(match.events)} событий в месяц`
            : `Более ${formatNumber(PRICING[PRICING.length - 1].events)} событий`
        }
        onValueChange={(value) => setIndex(value[0])}
      />

      {match ? (
        <div>
          <div>
            <NumberFlow
              className="text-5xl"
              value={match.price}
              format={{
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              }}
              locales={'en-US'}
            />
            <span className="text-sm text-muted-foreground ml-2">/ месяц</span>
          </div>
          <span
            className={cn(
              'text-sm text-muted-foreground italic opacity-100',
              match.price === 0 && 'opacity-0',
            )}
          >
            + НДС, если применимо
          </span>
          <div className="mt-1 text-emerald-600 text-sm dark:text-emerald-500">
            При оплате за год — 2 месяца в подарок
          </div>
        </div>
      ) : (
        <div className="text-lg">
          Напишите нам, чтобы получить индивидуальное предложение.
        </div>
      )}
    </>
  );
}
