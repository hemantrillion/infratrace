const { spawn } = require('node:child_process');
const path = require('node:path');

console.log('====================================================');
console.log('   STARTING INFRASTRUCTURE OBSERVATORY 30-A SUITE   ');
console.log('====================================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Companion Controlled Service (Port 5001)
const companionPath = path.join(__dirname, '..', 'controlled_service', 'server.js');
const companionProcess = spawn(process.execPath, [companionPath], {
  stdio: 'inherit',
});

// 2. Start Real Booking OQ Application (Port 3001)
const oqDir = path.resolve(__dirname, '..', '..', 'Booking OQ');
const targetOqProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: oqDir,
  stdio: 'inherit',
  shell: isWindows,
});

// 3. Start Next.js Development Server (Port 3000)
const nextProcess = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: isWindows,
});

function cleanup() {
  console.log('\nShutting down Observatory services...');
  companionProcess.kill();
  targetOqProcess.kill();
  nextProcess.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
