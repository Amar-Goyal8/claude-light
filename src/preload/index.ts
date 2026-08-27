import { contextBridge, ipcRenderer } from 'electron';
import type { HitRect, Snapshot } from '../shared/types';

contextBridge.exposeInMainWorld('claudeLight', {
  onSnapshot: (cb: (s: Snapshot) => void) => ipcRenderer.on('snapshot', (_e, s: Snapshot) => cb(s)),
  /** The cursor is over the island's box, right now. Drives the peek hint. */
  onHover: (cb: (inside: boolean) => void) => ipcRenderer.on('hover', (_e, inside: boolean) => cb(inside)),
  /** The dwell was satisfied — unfold. */
  onOpen: (cb: (open: boolean) => void) => ipcRenderer.on('open', (_e, open: boolean) => cb(open)),
  setHitRect: (r: HitRect) => ipcRenderer.send('hit-rect', r),
  decide: (sessionId: string, askId: string, decision: 'allow' | 'deny') =>
    ipcRenderer.send('decide', { sessionId, askId, decision }),
  dismiss: (sessionId: string) => ipcRenderer.send('dismiss', sessionId)
});
