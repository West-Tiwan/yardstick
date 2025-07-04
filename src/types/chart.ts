// Chart-related type definitions for Recharts components

export type TooltipPayload = {
  dataKey: string;
  value: number;
  color: string;
  payload?: unknown;
};

export type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

export type PieChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      category: string;
      amount: number;
      total: number;
      icon: string;
      color: string;
    };
  }>;
};

export type LegendPayload = {
  category: string;
  amount: number;
  color: string;
  icon: string;
};

export type ChartLegendProps = {
  payload?: LegendPayload[];
};
