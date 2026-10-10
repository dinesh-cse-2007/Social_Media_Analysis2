import { useMemo } from 'react';

interface AreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  gradientId?: string;
}

export function AreaChart({ data, height = 200, color = '#0ea5e9', gradientId = 'area-grad' }: AreaChartProps) {
  const { path, areaPath, maxVal, points } = useMemo(() => {
    if (data.length === 0) return { path: '', areaPath: '', maxVal: 0, points: [] as { x: number; y: number; label: string; value: number }[] };
    const width = 100;
    const max = Math.max(...data.map(d => d.value)) * 1.15;
    const min = 0;
    const stepX = width / (data.length - 1 || 1);

    const pts = data.map((d, i) => ({
      x: i * stepX,
      y: height - ((d.value - min) / (max - min || 1)) * (height - 20) - 10,
      label: d.label,
      value: d.value,
    }));

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const areaP = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return { path: linePath, areaPath: areaP, maxVal: max, points: pts };
  }, [data, height]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>No data available</div>;
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="0.8" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400 overflow-hidden">
        {data.map((d, i) => (
          <span key={i} className={i % Math.ceil(data.length / 6) === 0 || i === data.length - 1 ? '' : 'invisible'}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="relative w-full flex items-end justify-center" style={{ height: height - 24 }}>
            <div
              className="w-full max-w-[40px] rounded-t-md transition-all duration-300 group-hover:opacity-80"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: d.color || '#0ea5e9',
              }}
            />
            <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-gray-700 whitespace-nowrap">
              {d.value.toLocaleString()}
            </div>
          </div>
          <span className="text-[10px] text-gray-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}

export function DonutChart({ data, size = 160, thickness = 24 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((d, i) => {
            const fraction = d.value / total;
            const dash = fraction * circumference;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</span>
          <span className="text-xs text-gray-400">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="font-semibold text-gray-900 ml-auto">{((d.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HBarChartProps {
  data: { label: string; value: number; color?: string }[];
  max?: number;
}

export function HBarChart({ data, max }: HBarChartProps) {
  const maxVal = max || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-24 flex-shrink-0 truncate">{d.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{
                width: `${(d.value / maxVal) * 100}%`,
                backgroundColor: d.color || '#0ea5e9',
              }}
            >
              <span className="text-xs font-semibold text-white">{d.value.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
