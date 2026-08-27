#!/usr/bin/env node
/**
 * Run Claude Light as a login item, so it survives closing the terminal.
 *
 *   node bin/service.mjs install     build, write the LaunchAgent, start it
 *   node bin/service.mjs restart     rebuild and kick it
 *   node bin/service.mjs status      is it loaded, is it alive
 *   node bin/service.mjs logs        tail what it has written
 *   node bin/service.mjs uninstall   stop it and remove the LaunchAgent
 *
 * launchd rather than `nohup … &`: a backgrounded shell job dies with the
 * session on some terminal configurations, does not come back after a reboot,
 * and has nowhere to put its output. A LaunchAgent starts at login, restarts if
 * it crashes, and keeps a log.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LABEL = 'com.claudelight.island';
const PLIST = path.join(os.homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`);
const LOG_DIR = path.join(os.homedir(), '.claude-light');
const LOG = path.join(LOG_DIR, 'island.log');
const TARGET = `gui/${process.getuid()}`;

const cmd = process.argv[2] || 'status';

/** The Electron binary inside node_modules, which runs this directory as an app. */
function electronBinary() {
  const p = path.join(ROOT, 'node_modules', 'electron', 'path.txt');
  if (!fs.existsSync(p)) fail('Electron is not installed. Run `npm install` first.');
  return path.join(ROOT, 'node_modules', 'electron', 'dist', fs.readFileSync(p, 'utf8').trim());
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function launchctl(args, { quiet = true } = {}) {
  return spawnSync('launchctl', args, { encoding: 'utf8', stdio: quiet ? 'pipe' : 'inherit' });
}

function build() {
  console.log('building…');
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs')], { cwd: ROOT, stdio: 'inherit' });
}

function xml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function writePlist() {
  const bin = electronBinary();
  fs.mkdirSync(path.dirname(PLIST), { recursive: true });
  fs.mkdirSync(LOG_DIR, { recursive: true });
  // swiftc has to be reachable or the cutout cannot be measured, and launchd
  // hands a job almost nothing — so PATH is spelled out rather than inherited.
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xml(bin)}</string>
    <string>${xml(ROOT)}</string>
  </array>
  <key>WorkingDirectory</key><string>${xml(ROOT)}</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key>
  <dict><key>SuccessfulExit</key><false/></dict>
  <key>ProcessType</key><string>Interactive</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/opt/homebrew/bin</string>
  </dict>
  <key>StandardOutPath</key><string>${xml(LOG)}</string>
  <key>StandardErrorPath</key><string>${xml(LOG)}</string>
</dict>
</plist>
`;
  fs.writeFileSync(PLIST, plist);
}

function stop() {
  // `bootout` on a job that is not loaded returns non-zero; that is a no-op,
  // not a failure, so its output is swallowed.
  launchctl(['bootout', `${TARGET}/${LABEL}`]);
}

function start() {
  const r = launchctl(['bootstrap', TARGET, PLIST]);
  if (r.status !== 0) fail('launchctl bootstrap failed: ' + (r.stderr || r.stdout || r.status));
}

switch (cmd) {
  case 'install': {
    build();
    stop();
    writePlist();
    start();
    console.log(`installed ${LABEL}`);
    console.log(`  plist  ${PLIST}`);
    console.log(`  log    ${LOG}`);
    console.log('It starts at login from now on. `node bin/service.mjs uninstall` undoes this.');
    break;
  }
  case 'restart': {
    build();
    if (!fs.existsSync(PLIST)) fail('Not installed. Run `npm run service` first.');
    const r = launchctl(['kickstart', '-k', `${TARGET}/${LABEL}`]);
    if (r.status !== 0) {
      stop();
      start();
    }
    console.log('restarted');
    break;
  }
  case 'uninstall': {
    stop();
    fs.rmSync(PLIST, { force: true });
    console.log(`removed ${LABEL}`);
    break;
  }
  case 'logs': {
    if (!fs.existsSync(LOG)) fail('No log yet at ' + LOG);
    spawnSync('tail', ['-n', '80', '-f', LOG], { stdio: 'inherit' });
    break;
  }
  case 'status': {
    if (!fs.existsSync(PLIST)) {
      console.log('not installed');
      break;
    }
    const r = launchctl(['print', `${TARGET}/${LABEL}`]);
    if (r.status !== 0) {
      console.log('installed, not loaded');
      break;
    }
    const pid = /\bpid = (\d+)/.exec(r.stdout)?.[1];
    const state = /\bstate = (\S+)/.exec(r.stdout)?.[1];
    console.log(pid ? `running · pid ${pid}` : `loaded · ${state ?? 'not running'}`);
    console.log('log ' + LOG);
    break;
  }
  default:
    fail(`unknown command: ${cmd}\nuse install | restart | status | logs | uninstall`);
}
