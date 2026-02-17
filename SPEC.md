# FlyWeb Protocol Specification v1.0

## Abstract

FlyWeb is an open protocol that enables websites to describe their content in a structured, machine-readable format. By publishing a single JSON file at a well-known URL, any website can make its data discoverable and queryable by AI agents, search engines, and automated systems — without scraping.

## 1. Introduction

The web was built for human browsers. HTML pages are rendered visually, but their underlying structure is inconsistent and unpredictable. AI agents must scrape, parse, and guess to extract meaningful data, leading to errors, hallucinations, and legal disputes.

FlyWeb solves this by introducing a standard discovery and data-serving protocol:

- **Discovery**: A JSON file at `/.well-known/flyweb.json` describes what data a site offers.
- **Structure**: Data is served in clean, machine-readable formats (JSON, JSONL, CSV, XML).
- **Query**: Standard URL parameters enable filtering and pagination without custom APIs.

### Design Principles

1. **Zero friction** — Adding FlyWeb to a site requires one static JSON file.
2. **No authentication required** — Public data should be publicly queryable.
3. **Format agnostic** — Support multiple output formats.
4. **URL-based** — All queries are standard HTTP GET requests.
5. **Incremental adoption** — Sites can expose as much or as little as they choose.

## 2. Terminology

| Term | Definition |
|------|------------|
| **Discovery file** | The JSON file at `/.well-known/flyweb.json` |
| **Entity** | The website, organization, or application publishing the file |
| **Resource** | A named collection of structured data (e.g., "articles", "products") |
| **Agent** | Any automated system consuming FlyWeb data (AI, crawler, bot) |
| **Field** | A named property within a resource's data records |

## 3. Discovery

### 3.1 Location

The discovery file MUST be served at:

```
https://{domain}/.well-known/flyweb.json
```

This follows [RFC 8615](https://www.rfc-editor.org/rfc/rfc8615) for well-known URIs.

### 3.2 Agent Behavior

Agents SHOULD check for `/.well-known/flyweb.json` before attempting to scrape a website. If the file exists, agents SHOULD use the structured data endpoints instead of parsing HTML.

### 3.3 HTTP Requirements

The discovery file endpoint:

- MUST respond with `Content-Type: application/json`
- MUST include `Access-Control-Allow-Origin: *` for cross-origin access
- SHOULD include appropriate `Cache-Control` headers (recommended: `public, max-age=3600`)
- MUST respond with HTTP 200 on success
- SHOULD respond with HTTP 404 if FlyWeb is not supported

## 4. Discovery File Schema

### 4.1 Root Object

```json
{
  "flyweb": "1.0",
  "entity": "TechCrunch",
  "type": "news",
  "description": "Technology news and analysis",
  "url": "https://techcrunch.com",
  "resources": { }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `flyweb` | string | Yes | Protocol version. MUST be `"1.0"` |
| `entity` | string | Yes | Name of the website or organization |
| `type` | string | Yes | Primary content type (see 4.2) |
| `description` | string | No | Human-readable description |
| `url` | string | No | Canonical URL of the website |
| `resources` | object | Yes | Map of resource name → resource definition |

### 4.2 Entity Types

The following types are defined by the protocol. Custom values are permitted.

| Type | Description |
|------|-------------|
| `news` | News publication |
| `blog` | Blog or personal writing |
| `ecommerce` | Online store |
| `saas` | Software-as-a-service |
| `docs` | Documentation site |
| `api` | API service |
| `social` | Social network or community |
| `portfolio` | Portfolio or showcase |
| `directory` | Directory or listing |
| `marketplace` | Marketplace |
| `forum` | Discussion forum |
| `wiki` | Wiki or knowledge base |

### 4.3 Resource Object

Each resource describes a single collection of data.

```json
{
  "articles": {
    "path": "/.flyweb/articles",
    "format": "jsonl",
    "fields": ["title", "author", "date", "summary", "content", "tags"],
    "query": "?tag={tag}&author={author}&limit={n}&offset={n}",
    "description": "Published articles",
    "auth": false
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | URL path where data is served. MUST start with `/` |
| `format` | string | Yes | Data format: `json`, `jsonl`, `csv`, or `xml` |
| `fields` | string[] | Yes | List of available field names. MUST be non-empty |
| `query` | string | No | Query pattern with `{param}` placeholders |
| `description` | string | No | Human-readable description |
| `auth` | boolean | No | Whether authentication is required (default: `false`) |

## 5. Data Formats

### 5.1 JSON (`"format": "json"`)

Response is a JSON array of objects:

```json
[
  { "title": "First Post", "author": "Alice", "date": "2026-01-01" },
  { "title": "Second Post", "author": "Bob", "date": "2026-01-02" }
]
```

Content-Type: `application/json`

### 5.2 JSONL (`"format": "jsonl"`)

Response is newline-delimited JSON (one JSON object per line):

```
{"title":"First Post","author":"Alice","date":"2026-01-01"}
{"title":"Second Post","author":"Bob","date":"2026-01-02"}
```

Content-Type: `application/x-ndjson`

JSONL is RECOMMENDED for large datasets as it supports streaming.

### 5.3 CSV (`"format": "csv"`)

Response is RFC 4180 compliant CSV with a header row:

```csv
title,author,date
First Post,Alice,2026-01-01
Second Post,Bob,2026-01-02
```

Content-Type: `text/csv`

### 5.4 XML (`"format": "xml"`)

Response is an XML document with a root `<items>` element:

```xml
<items>
  <item>
    <title>First Post</title>
    <author>Alice</author>
    <date>2026-01-01</date>
  </item>
</items>
```

Content-Type: `application/xml`

## 6. Query Protocol

### 6.1 Query Parameters

Resources MAY declare a `query` pattern describing supported URL parameters. Parameters use `{name}` placeholder syntax:

```json
"query": "?tag={tag}&author={author}&limit={n}&offset={n}"
```

### 6.2 Reserved Parameters

The following parameter names have standardized behavior:

| Parameter | Description |
|-----------|-------------|
| `limit` | Maximum number of records to return |
| `offset` | Number of records to skip (for pagination) |

All other parameters are resource-specific filters.

### 6.3 Filter Behavior

When a filter parameter matches a string field, it performs exact match:

```
GET /.flyweb/articles?author=Alice
→ Returns articles where author equals "Alice"
```

When a filter parameter matches an array field, it checks inclusion:

```
GET /.flyweb/articles?tag=ai
→ Returns articles where tags array contains "ai"
```

### 6.4 Examples

```
GET /.flyweb/articles                    → All articles (default limit)
GET /.flyweb/articles?limit=10           → First 10 articles
GET /.flyweb/articles?tag=ai&limit=5     → First 5 articles tagged "ai"
GET /.flyweb/articles?offset=20&limit=10 → Articles 21-30
```

## 7. Data Endpoint Requirements

Resource data endpoints:

- MUST respond with the correct Content-Type for the declared format
- MUST include `Access-Control-Allow-Origin: *`
- SHOULD include `Cache-Control` headers
- MUST return HTTP 200 with data on success
- SHOULD return an empty collection (not 404) when no records match a query
- SHOULD respect a maximum limit to prevent abuse (recommended: 100)

## 8. CORS

All FlyWeb endpoints (discovery file and resource endpoints) MUST include:

```
Access-Control-Allow-Origin: *
```

This ensures agents running in any context can access the data.

## 9. Versioning

The `flyweb` field in the discovery file indicates the protocol version. This specification defines version `1.0`.

Future versions will maintain backward compatibility where possible. Agents SHOULD check the version field and handle unknown versions gracefully.

## 10. Security Considerations

- FlyWeb is designed for **public data**. Sensitive data SHOULD NOT be exposed through FlyWeb without the `auth` flag.
- Resources with `"auth": true` indicate that authentication is required. The authentication mechanism is outside the scope of this specification.
- Sites SHOULD implement rate limiting on data endpoints.
- Sites SHOULD set appropriate `Cache-Control` headers to reduce server load.
- Agents SHOULD respect `Cache-Control` headers and avoid excessive polling.

## 11. Attribution

When agents use data obtained through FlyWeb, they SHOULD attribute the source by including:

- The `entity` name from the discovery file
- The `url` from the discovery file (if provided)
- A link to the original content when applicable

## 12. Complete Example

### Discovery File

`GET https://techcrunch.com/.well-known/flyweb.json`

```json
{
  "flyweb": "1.0",
  "entity": "TechCrunch",
  "type": "news",
  "description": "Technology news, analysis, and opinions",
  "url": "https://techcrunch.com",
  "resources": {
    "articles": {
      "path": "/.flyweb/articles",
      "format": "jsonl",
      "fields": ["title", "author", "date", "summary", "content", "tags", "url"],
      "query": "?tag={tag}&author={author}&limit={n}&offset={n}",
      "description": "Published articles"
    },
    "authors": {
      "path": "/.flyweb/authors",
      "format": "json",
      "fields": ["name", "bio", "avatar", "url"],
      "description": "Staff writers and contributors"
    }
  }
}
```

### Data Request

`GET https://techcrunch.com/.flyweb/articles?tag=ai&limit=2`

```
{"title":"AI Agents Need Structure","author":"Sarah Chen","date":"2026-02-15","summary":"The web was built for humans...","tags":["ai","web"],"url":"https://techcrunch.com/2026/02/15/ai-agents-need-structure"}
{"title":"The Rise of Structured Web","author":"Mike Johnson","date":"2026-02-10","summary":"A new protocol is changing...","tags":["ai","protocol"],"url":"https://techcrunch.com/2026/02/10/structured-web"}
```
