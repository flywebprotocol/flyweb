import { validate } from './validate.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

const CHECK = `${GREEN}\u2713${RESET}`;
const CROSS = `${RED}\u2717${RESET}`;

function help(): void {
  console.log(`
${BOLD}flyweb${RESET} — Make the internet machine-readable

${BOLD}Usage:${RESET}
  flyweb check <url>          Check a website for FlyWeb support
  flyweb check <file>         Validate a local flyweb.json file
  flyweb init                 Generate a starter flyweb.json
  flyweb help                 Show this help message

${BOLD}Examples:${RESET}
  ${DIM}$ npx flyweb check https://example.com${RESET}
  ${DIM}$ npx flyweb check ./flyweb.json${RESET}
  ${DIM}$ npx flyweb init > .well-known/flyweb.json${RESET}

${DIM}https://flyweb.io${RESET}
`);
}

function printConfig(config: Record<string, unknown>): void {
  console.log(`  ${CHECK} Valid FlyWeb v${config.flyweb} config`);
  console.log(`  ${CHECK} Entity: ${BOLD}${config.entity}${RESET} ${DIM}(${config.type})${RESET}`);

  if (config.description) {
    console.log(`  ${CHECK} ${config.description}`);
  }
  if (config.url) {
    console.log(`  ${CHECK} URL: ${CYAN}${config.url}${RESET}`);
  }

  const resources = config.resources as Record<string, Record<string, unknown>>;
  const names = Object.keys(resources);
  console.log(`  ${CHECK} Resources: ${names.join(', ')}`);
  console.log();

  for (const [name, resource] of Object.entries(resources)) {
    console.log(`  ${CYAN}${name}${RESET}`);
    console.log(`    path:   ${resource.path}`);
    console.log(`    format: ${resource.format}`);
    console.log(`    fields: ${(resource.fields as string[]).join(', ')}`);
    if (resource.query) {
      console.log(`    query:  ${resource.query}`);
    }
    if (resource.auth) {
      console.log(`    auth:   required`);
    }
    console.log();
  }
}

async function checkUrl(url: string): Promise<void> {
  const base = url.replace(/\/$/, '');
  const flywebUrl = `${base}/.well-known/flyweb.json`;

  console.log(`\n  ${BOLD}FlyWeb Check${RESET}: ${CYAN}${url}${RESET}\n`);

  let response: Response;
  try {
    response = await fetch(flywebUrl, {
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    console.log(`  ${CROSS} Could not connect to ${flywebUrl}`);
    console.log(`    ${DIM}${err instanceof Error ? err.message : String(err)}${RESET}`);
    process.exit(1);
  }

  if (!response.ok) {
    console.log(`  ${CROSS} No flyweb.json found (HTTP ${response.status})`);
    console.log(`    ${DIM}Checked: ${flywebUrl}${RESET}`);
    process.exit(1);
  }

  console.log(`  ${CHECK} Found /.well-known/flyweb.json`);

  let config: unknown;
  try {
    config = await response.json();
  } catch {
    console.log(`  ${CROSS} Invalid JSON response`);
    process.exit(1);
  }

  const result = validate(config);

  if (!result.valid) {
    console.log(`  ${CROSS} Invalid FlyWeb config:\n`);
    for (const error of result.errors) {
      console.log(`    ${RED}- ${error}${RESET}`);
    }
    process.exit(1);
  }

  printConfig(config as Record<string, unknown>);
  console.log(`  ${GREEN}${BOLD}All checks passed!${RESET}\n`);
}

async function checkFile(filePath: string): Promise<void> {
  const absPath = resolve(filePath);

  console.log(`\n  ${BOLD}FlyWeb Check${RESET}: ${CYAN}${filePath}${RESET} ${DIM}(local file)${RESET}\n`);

  let raw: string;
  try {
    raw = readFileSync(absPath, 'utf-8');
  } catch {
    console.log(`  ${CROSS} Could not read file: ${absPath}`);
    process.exit(1);
  }

  let config: unknown;
  try {
    config = JSON.parse(raw);
  } catch {
    console.log(`  ${CROSS} Invalid JSON in ${filePath}`);
    process.exit(1);
  }

  const result = validate(config);

  if (!result.valid) {
    console.log(`  ${CROSS} Invalid FlyWeb config:\n`);
    for (const error of result.errors) {
      console.log(`    ${RED}- ${error}${RESET}`);
    }
    process.exit(1);
  }

  printConfig(config as Record<string, unknown>);
  console.log(`  ${GREEN}${BOLD}All checks passed!${RESET}\n`);
}

function init(): void {
  const config = {
    flyweb: '1.0',
    entity: 'My Website',
    type: 'blog',
    resources: {
      posts: {
        path: '/.flyweb/posts',
        format: 'jsonl',
        fields: ['title', 'author', 'date', 'summary', 'content', 'tags'],
        query: '?tag={tag}&limit={n}',
      },
    },
  };
  console.log(JSON.stringify(config, null, 2));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    help();
    return;
  }

  if (command === 'init') {
    init();
    return;
  }

  if (command === 'check') {
    const target = args[1];
    if (!target) {
      console.log(`\n  ${CROSS} Missing target. Usage: flyweb check <url or file>\n`);
      process.exit(1);
    }

    if (target.startsWith('http://') || target.startsWith('https://')) {
      await checkUrl(target);
    } else {
      await checkFile(target);
    }
    return;
  }

  console.log(`\n  ${CROSS} Unknown command: ${command}\n`);
  help();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
