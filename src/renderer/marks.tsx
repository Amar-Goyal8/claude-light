/**
 * Activity marks — the little outline beside a row that says what kind of work
 * is happening, without reading the words.
 *
 * They are drawn from box-shadow insets rather than SVG so they stay crisp at
 * the one size they are ever used at, and so a colour change is a prop rather
 * than a re-render of a path.
 */
import { C, MONO } from './theme';
import type { Activity } from '../shared/types';

interface MarkProps {
  activity: Activity;
  color?: string;
  size?: number;
}

/** A laptop: writing code. */
function Laptop({ color }: { color: string }) {
  return (
    <div style={{ position: 'relative', width: 15, height: 12, flex: 'none' }}>
      <div style={{ position: 'absolute', left: 2, top: 0, width: 11, height: 8, boxShadow: `inset 0 0 0 1.5px ${color}` }} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 15, height: 2, background: color }} />
    </div>
  );
}

/** A prompt: running a command. */
function Terminal({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 15,
        height: 13,
        flex: 'none',
        boxShadow: `inset 0 0 0 1.5px ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: `700 7px/1 ${MONO}`,
        color
      }}
    >
      {'>_'}
    </div>
  );
}

/** A magnifier: searching. */
function Glass({ color }: { color: string }) {
  return (
    <div style={{ position: 'relative', width: 15, height: 15, flex: 'none' }}>
      <div style={{ position: 'absolute', left: 0, top: 1, width: 11, height: 11, borderRadius: '50%', boxShadow: `inset 0 0 0 1.5px ${color}` }} />
      <div style={{ position: 'absolute', right: 1, bottom: 2, width: 6, height: 1.5, background: color, transform: 'rotate(45deg)' }} />
    </div>
  );
}

/** A page of lines: reading files. */
function Page({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 12,
        height: 14,
        flex: 'none',
        boxShadow: `inset 0 0 0 1.5px ${color}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2,
        padding: '0 3px'
      }}
    >
      <div style={{ height: 1.5, background: color }} />
      <div style={{ height: 1.5, background: color }} />
      <div style={{ height: 1.5, background: color, width: '60%' }} />
    </div>
  );
}

/** A globe: out on the network. */
function Globe({ color }: { color: string }) {
  return (
    <div style={{ position: 'relative', width: 14, height: 14, flex: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 0 1.5px ${color}` }} />
      <div style={{ position: 'absolute', left: 0, top: 6.25, width: 14, height: 1.5, background: color }} />
      <div style={{ position: 'absolute', left: 4.5, top: 0, width: 5, height: 14, borderRadius: '50%', boxShadow: `inset 0 0 0 1.5px ${color}` }} />
    </div>
  );
}

/** A fork: work handed to subagents. */
function Fork({ color }: { color: string }) {
  return (
    <div style={{ position: 'relative', width: 14, height: 14, flex: 'none' }}>
      <div style={{ position: 'absolute', left: 1, top: 6.25, width: 5, height: 1.5, background: color }} />
      <div style={{ position: 'absolute', left: 6, top: 2, width: 1.5, height: 10, background: color }} />
      <div style={{ position: 'absolute', left: 6, top: 2, width: 6, height: 1.5, background: color }} />
      <div style={{ position: 'absolute', left: 6, top: 10.5, width: 6, height: 1.5, background: color }} />
    </div>
  );
}

/** Three dots: thinking, between tools. */
function Ellipsis({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 2.5, width: 15, alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <div style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: color }} />
      <div style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: color }} />
      <div style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: color }} />
    </div>
  );
}

function Glyph({ ch, color, weight = 700, size = 12 }: { ch: string; color: string; weight?: number; size?: number }) {
  return (
    <div style={{ width: 15, display: 'flex', justifyContent: 'center', flex: 'none', font: `${weight} ${size}px/1 ${MONO}`, color }}>
      {ch}
    </div>
  );
}

export function Mark({ activity, color = C.faint }: MarkProps) {
  switch (activity) {
    case 'code':
      return <Laptop color={color} />;
    case 'shell':
      return <Terminal color={color} />;
    case 'search':
      return <Glass color={color} />;
    case 'read':
      return <Page color={color} />;
    case 'web':
      return <Globe color={color} />;
    case 'agent':
      return <Fork color={color} />;
    case 'ask':
      return <Glyph ch="?" color={C.yellow} size={13} />;
    case 'done':
      return <Glyph ch="✓" color={C.red} />;
    case 'idle':
      return <Glyph ch="z" color={color} size={10} />;
    case 'think':
    default:
      return <Ellipsis color={color} />;
  }
}
