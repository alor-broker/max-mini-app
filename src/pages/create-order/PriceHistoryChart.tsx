import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, Typography } from '@maxhub/max-ui';
import { Instrument, InstrumentsService } from '../../api/services';
import { useTranslation } from 'react-i18next';
import { ColorType, createChart, LineSeries, UTCTimestamp } from 'lightweight-charts';

type HistoryRange = '1D' | '7D' | '1M' | '1Y';

interface HistoryPoint {
  time: number;
  price: number;
}

interface PriceHistoryChartProps {
  instrument: Instrument;
}

const HISTORY_RANGE_TO_SECONDS: Record<HistoryRange, number> = {
  '1D': 24 * 60 * 60,
  '7D': 7 * 24 * 60 * 60,
  '1M': 30 * 24 * 60 * 60,
  '1Y': 365 * 24 * 60 * 60
};

const getTimeframe = (range: HistoryRange): string => {
  if (range === '1D' || range === '7D') {
    return '60';
  }
  return 'D';
};

const toHistoryPoint = (bar: any): HistoryPoint | null => {
  const time = Number(bar?.time ?? bar?.t ?? bar?.timestamp);
  const price = Number(bar?.close ?? bar?.c);

  if (!Number.isFinite(time) || !Number.isFinite(price)) {
    return null;
  }

  return { time, price };
};

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const [range, setRange] = useState<HistoryRange>('1D');
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null);

  const getThemeColor = (name: string, fallback: string): string => {
    if (typeof window === 'undefined') {
      return fallback;
    }

    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  };

  const getThemePalette = () => ({
    textPrimary: getThemeColor('--text-primary', '#1f2937'),
    textSecondary: getThemeColor('--text-secondary', '#6b7280'),
    strokeGrid: getThemeColor('--stroke-separator-primary', 'rgba(0,0,0,0.12)'),
    positive: getThemeColor('--stroke-positive', '#2bc644'),
    negative: getThemeColor('--stroke-negative', '#ce4257')
  });

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) {
      return;
    }

    const palette = getThemePalette();

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 128,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: palette.textSecondary,
        attributionLogo: false
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false
      },
      leftPriceScale: {
        visible: false
      },
      timeScale: {
        visible: false,
        borderVisible: false
      },
      grid: {
        vertLines: { visible: false, color: palette.strokeGrid },
        horzLines: { visible: true, color: palette.strokeGrid }
      },
      crosshair: {
        vertLine: {
          visible: true,
          labelVisible: false,
          color: palette.strokeGrid,
          width: 1
        },
        horzLine: {
          visible: true,
          labelVisible: true,
          color: palette.strokeGrid,
          width: 1
        }
      },
      handleScroll: false,
      handleScale: false
    });

    const series = chart.addSeries(LineSeries, {
      lineWidth: 2,
      color: palette.negative,
      priceLineVisible: false,
      lastValueVisible: true
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      if (!chartContainerRef.current || !chartRef.current) {
        return;
      }

      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth
      });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const now = Math.floor(Date.now() / 1000);
    const from = now - HISTORY_RANGE_TO_SECONDS[range];

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const bars = await InstrumentsService.getHistory({
          exchange: instrument.exchange,
          symbol: instrument.symbol,
          tf: getTimeframe(range),
          from,
          to: now
        });

        const mapped = bars
          .map(toHistoryPoint)
          .filter((point): point is HistoryPoint => point !== null)
          .sort((a, b) => a.time - b.time);

        if (!cancelled) {
          setHistoryData(mapped);
        }
      } catch (e) {
        console.error('Failed to fetch history', e);
        if (!cancelled) {
          setHistoryData([]);
          setError(t('common.loading_market_data'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [instrument.exchange, instrument.symbol, range, t]);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) {
      return;
    }

    const palette = getThemePalette();
    const trendUp = historyData.length > 1 && historyData[historyData.length - 1].price >= historyData[0].price;

    chartRef.current.applyOptions({
      layout: { textColor: palette.textSecondary },
      grid: {
        vertLines: { visible: false, color: palette.strokeGrid },
        horzLines: { visible: true, color: palette.strokeGrid }
      }
    });

    seriesRef.current.applyOptions({
      color: trendUp ? palette.positive : palette.negative
    });

    const data = historyData.map(point => ({
      time: point.time as UTCTimestamp,
      value: point.price
    }));

    seriesRef.current.setData(data);

    if (data.length > 1) {
      chartRef.current.timeScale().fitContent();
    }
  }, [historyData]);

  return (
    <div
      style={{
        marginBottom: '12px',
        padding: '10px',
        borderRadius: '12px',
        background: 'transparent',
        border: '1px solid var(--stroke-separator-secondary, rgba(0, 0, 0, 0.08))'
      }}
    >
      <div style={{ height: '128px', position: 'relative' }}>
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />

        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography.Body style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              {t('common.loading_market_data')}
            </Typography.Body>
          </div>
        ) : (
          historyData.length < 2 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography.Body style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                {error || t('common.loading_market_data')}
              </Typography.Body>
            </div>
          )
        )}
      </div>

      <Flex gap={8} style={{ width: '100%', marginTop: '8px' }}>
        {(['1D', '7D', '1M', '1Y'] as HistoryRange[]).map(item => (
          <Button
            key={item}
            onClick={() => setRange(item)}
            style={{
              flex: 1,
              border: 'none',
              fontWeight: 600,
              background: range === item
                ? 'var(--states-background-pressed-neutral-fade, rgba(0, 0, 0, 0.12))'
                : 'var(--background-accent-neutral-fade-secondary, rgba(0, 0, 0, 0.04))',
              color: 'var(--text-primary)'
            }}
          >
            {item}
          </Button>
        ))}
      </Flex>
    </div>
  );
};
