import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const children = [];
let shuttingDown = false;

const startProcess = (label, args) => {
  const child = spawn(npmCmd, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
  });

  const prefix = `[${label}]`;

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`${prefix} ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`${prefix} ${chunk}`);
  });

  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      process.stderr.write(
        `${prefix} exited ${signal ? `with signal ${signal}` : `with code ${code}`}\n`
      );
      shutdown(code ?? 1);
    }
  });

  children.push(child);
  return child;
};

const shutdown = (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => process.exit(exitCode), 250);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

startProcess('openai-proxy', ['run', 'ai-proxy']);
startProcess('vite', ['run', 'dev']);
