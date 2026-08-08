import type { Side } from '@/lib/engine/types';

interface HandDiagramProps {
  side: Side;
}

const STROKE: Record<Side, string> = { left: '#5b86e0', right: '#6fa8ff' };
const FILL: Record<Side, string> = { left: '#5b86e021', right: '#6fa8ff21' };

export default function HandDiagram({ side }: HandDiagramProps) {
  const transform = side === 'left' ? 'rotate(45deg)' : 'rotate(-45deg) scaleX(-1)';

  return (
    <svg width={80} height={100} viewBox="0 0 80 100" style={{ transform }} className="opacity-70">
      <g fill="none" stroke={STROKE[side]} strokeWidth={1.5} strokeLinecap="round">
        <rect x={10} y={50} width={60} height={40} rx={8} fill={FILL[side]} />
        <line x1={20} y1={50} x2={20} y2={20} />
        <line x1={32} y1={50} x2={32} y2={10} />
        <line x1={44} y1={50} x2={44} y2={14} />
        <line x1={56} y1={50} x2={56} y2={22} />
        <line x1={64} y1={55} x2={70} y2={42} />
      </g>
    </svg>
  );
}
