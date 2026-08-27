/** The overlay's entry point: bridge in, island out. */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './island.css';
import { Island } from './IslandView';
import type { Snapshot } from '../shared/types';

/** What the island is before the first snapshot lands: a hover target. */
const EMPTY: Snapshot = {
  sessions: [],
  overall: 'idle',
  tokens: 0,
  elapsed: 0,
  dormant: true,
  notchW: 200,
  notchH: 32,
  hoverDelay: 550,
  pulse: true,
  now: Date.now()
};

function App() {
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const bridge = window.claudeLight;
    bridge.onSnapshot(setSnap);
    bridge.onHover(setHovering);
    bridge.onOpen(setOpen);
  }, []);

  return (
    <Island
      snap={snap}
      hovering={hovering}
      open={open}
      onBox={(r) => window.claudeLight.setHitRect(r)}
      onDecide={(sessionId, askId, decision) => window.claudeLight.decide(sessionId, askId, decision)}
      onDismiss={(sessionId) => window.claudeLight.dismiss(sessionId)}
    />
  );
}

createRoot(document.getElementById('root')!).render(<App />);
