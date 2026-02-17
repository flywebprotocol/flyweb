/**
 * FlyWeb Protocol v1.0 — Schema Types
 *
 * The FlyWeb config is served at /.well-known/flyweb.json
 * It describes what structured data a website exposes to machines.
 */

/** The root FlyWeb configuration object */
export interface FlyWebConfig {
  /** Protocol version. Must be "1.0" */
  flyweb: '1.0';

  /** Name of the entity (website, organization, or app) */
  entity: string;

  /** Type of content this entity primarily serves */
  type: EntityType;

  /** Optional human-readable description */
  description?: string;

  /** Optional canonical URL of the website */
  url?: string;

  /** Attribution requirements for AI agents consuming this data */
  attribution?: FlyWebAttribution;

  /** Resources available on this site, keyed by name */
  resources: Record<string, FlyWebResource>;
}

/** Attribution requirements — enforced at protocol level */
export interface FlyWebAttribution {
  /** Whether attribution is required (default: true) */
  required?: boolean;

  /** How AI agents should format the attribution */
  format?: string;

  /** License under which content is available */
  license?: string;

  /** Whether AI responses must include a link back */
  must_link?: boolean;
}

/**
 * Common entity types.
 * Custom string values are also accepted for extensibility.
 */
export type EntityType =
  | 'news'
  | 'blog'
  | 'ecommerce'
  | 'saas'
  | 'docs'
  | 'api'
  | 'social'
  | 'portfolio'
  | 'directory'
  | 'marketplace'
  | 'forum'
  | 'wiki'
  | 'science'
  | (string & {});

/** Access tier for a resource */
export type AccessTier = 'free' | 'paid' | 'blocked';

/** A single resource exposed by the website */
export interface FlyWebResource {
  /** URL path where this resource's data is served */
  path: string;

  /** Data format of the response */
  format: ResourceFormat;

  /** Available fields in the returned data */
  fields: string[];

  /** Query URL pattern with parameter placeholders, e.g. "?tag={tag}&limit={n}" */
  query?: string;

  /** Human-readable description of this resource */
  description?: string;

  /** Whether this resource requires authentication */
  auth?: boolean;

  /** Access tier: free (default), paid, or blocked */
  access?: AccessTier;

  /** Resource-level attribution override */
  attribution?: FlyWebAttribution;
}

/** Supported data formats */
export type ResourceFormat = 'json' | 'jsonl' | 'csv' | 'xml';
