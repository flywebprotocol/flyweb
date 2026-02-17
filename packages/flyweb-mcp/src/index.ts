import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// ── Validation ──────────────────────────────────────────────────────

const VALID_FORMATS = ['json', 'jsonl', 'csv', 'xml'];

function validateConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { valid: false, errors: ['Config must be a plain object'] };
  }

  const c = config as Record<string, unknown>;

  if (c.flyweb !== '1.0') errors.push(`"flyweb" must be "1.0", got "${String(c.flyweb)}"`);
  if (!c.entity || typeof c.entity !== 'string') errors.push('"entity" is required and must be a string');
  if (!c.type || typeof c.type !== 'string') errors.push('"type" is required and must be a string');

  if (!c.resources || typeof c.resources !== 'object' || Array.isArray(c.resources)) {
    errors.push('"resources" is required and must be an object');
  } else {
    const resources = c.resources as Record<string, unknown>;
    if (Object.keys(resources).length === 0) errors.push('"resources" must contain at least one resource');

    for (const [name, resource] of Object.entries(resources)) {
      if (!resource || typeof resource !== 'object' || Array.isArray(resource)) {
        errors.push(`resources.${name}: must be an object`);
        continue;
      }
      const r = resource as Record<string, unknown>;
      if (!r.path || typeof r.path !== 'string') errors.push(`resources.${name}.path: required string`);
      else if (!(r.path as string).startsWith('/')) errors.push(`resources.${name}.path: must start with "/"`);
      if (!r.format || !VALID_FORMATS.includes(r.format as string))
        errors.push(`resources.${name}.format: must be one of ${VALID_FORMATS.join(', ')}`);
      if (!Array.isArray(r.fields) || r.fields.length === 0)
        errors.push(`resources.${name}.fields: required non-empty array of strings`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Discovery ───────────────────────────────────────────────────────

async function discoverSite(url: string) {
  const base = url.replace(/\/$/, '');
  const flywebUrl = `${base}/.well-known/flyweb.json`;

  const response = await fetch(flywebUrl, {
    headers: { Accept: 'application/json', 'User-Agent': 'flyweb-mcp/1.0' },
  });

  if (!response.ok) {
    throw new Error(`No FlyWeb config found at ${flywebUrl} (HTTP ${response.status})`);
  }

  const config = await response.json();
  const validation = validateConfig(config);

  return {
    url: flywebUrl,
    valid: validation.valid,
    errors: validation.errors,
    config,
  };
}

// ── Fetch resource ──────────────────────────────────────────────────

async function fetchResourceData(
  baseUrl: string,
  resourcePath: string,
  format: string,
  params?: Record<string, string>,
) {
  const base = baseUrl.replace(/\/$/, '');
  const url = new URL(`${base}${resourcePath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json', 'User-Agent': 'flyweb-mcp/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (HTTP ${response.status})`);
  }

  const text = await response.text();

  if (format === 'jsonl') {
    return text
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
  }

  return JSON.parse(text);
}

// ── Generate config ─────────────────────────────────────────────────

function generateConfig(
  entity: string,
  type: string,
  resources: Array<{ name: string; fields: string[]; description?: string }>,
) {
  const resourcesMap: Record<string, unknown> = {};

  for (const r of resources) {
    resourcesMap[r.name] = {
      path: `/.flyweb/${r.name}`,
      format: 'jsonl',
      fields: r.fields,
      access: 'free',
      ...(r.description ? { description: r.description } : {}),
    };
  }

  return {
    flyweb: '1.0',
    entity,
    type,
    attribution: {
      required: true,
      must_link: true,
    },
    resources: resourcesMap,
  };
}

// ── MCP Server ──────────────────────────────────────────────────────

const server = new Server(
  { name: 'flyweb-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'flyweb_discover',
      description:
        'Discover a website\'s FlyWeb config by fetching /.well-known/flyweb.json. Returns the structured config describing what content the site exposes to AI agents, including resources, fields, query parameters, and attribution requirements.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          url: {
            type: 'string',
            description: 'Website URL to discover (e.g., https://example.com)',
          },
        },
        required: ['url'],
      },
    },
    {
      name: 'flyweb_fetch',
      description:
        'Fetch structured data from a FlyWeb resource endpoint. First use flyweb_discover to find available resources and their paths, then use this tool to fetch the actual data.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          url: {
            type: 'string',
            description: 'Base URL of the FlyWeb-enabled site (e.g., https://example.com)',
          },
          resource_path: {
            type: 'string',
            description: 'Resource path from the FlyWeb config (e.g., /.flyweb/articles)',
          },
          format: {
            type: 'string',
            description: 'Data format of the resource: json or jsonl (default: jsonl)',
          },
          params: {
            type: 'object',
            description: 'Optional query parameters as key-value pairs',
            additionalProperties: { type: 'string' },
          },
        },
        required: ['url', 'resource_path'],
      },
    },
    {
      name: 'flyweb_validate',
      description:
        'Validate a FlyWeb JSON config against the protocol v1.0 spec. Pass the full JSON as a string. Returns whether it is valid and any errors found.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          config: {
            type: 'string',
            description: 'The FlyWeb config as a JSON string to validate',
          },
        },
        required: ['config'],
      },
    },
    {
      name: 'flyweb_generate',
      description:
        'Generate a valid flyweb.json config for a website. Provide the entity name, content type, and resources to expose. Returns a complete config with attribution and resource definitions ready to save as /.well-known/flyweb.json.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          entity: {
            type: 'string',
            description: 'Name of the website or organization',
          },
          type: {
            type: 'string',
            description: 'Content type: blog, news, ecommerce, saas, docs, api, portfolio, etc.',
          },
          resources: {
            type: 'array',
            description: 'Resources to expose to AI agents',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Resource name (e.g., posts, products, articles)' },
                fields: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Field names available in the data (e.g., title, author, date, content)',
                },
                description: { type: 'string', description: 'Optional description of this resource' },
              },
              required: ['name', 'fields'],
            },
          },
        },
        required: ['entity', 'type', 'resources'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'flyweb_discover': {
        const { url } = args as { url: string };
        const result = await discoverSite(url);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'flyweb_fetch': {
        const { url, resource_path, format = 'jsonl', params } = args as {
          url: string;
          resource_path: string;
          format?: string;
          params?: Record<string, string>;
        };
        const data = await fetchResourceData(url, resource_path, format, params);
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'flyweb_validate': {
        const { config: configStr } = args as { config: string };
        let parsed: unknown;
        try {
          parsed = JSON.parse(configStr);
        } catch {
          return {
            content: [{ type: 'text', text: JSON.stringify({ valid: false, errors: ['Invalid JSON syntax'] }, null, 2) }],
          };
        }
        const result = validateConfig(parsed);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'flyweb_generate': {
        const { entity, type, resources } = args as {
          entity: string;
          type: string;
          resources: Array<{ name: string; fields: string[]; description?: string }>;
        };
        const config = generateConfig(entity, type, resources);
        return {
          content: [{ type: 'text', text: JSON.stringify(config, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
