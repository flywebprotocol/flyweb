=== FlyWeb — AI Visibility for WordPress ===
Contributors: flywebprotocol
Tags: ai, seo, machine-readable, structured-data, flyweb, ai-optimization
Requires at least: 5.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Make your WordPress site discoverable by AI agents. SEO for the AI era.

== Description ==

FlyWeb is the open protocol that makes your website discoverable, readable, and cited by every AI agent. Think of it as **SEO for the AI era**.

When someone asks an AI assistant "best restaurants in Berlin" or "how to fix a React bug" — is your site in the answer? With FlyWeb, it is.

**What FlyWeb does:**

* **AI Visibility** — AI agents find and cite your content
* **AI Attribution** — Every AI response must credit you (enforced at protocol level)
* **AI Monetization** — When you're ready, flip one config line from "free" to "paid"

**How it works:**

1. Install the plugin
2. Configure your entity name and site type
3. Choose which content to expose (posts, pages, WooCommerce products)
4. Your site is now FlyWeb-enabled at `/.well-known/flyweb.json`
5. AI agents discover, read, and cite your content — with attribution

**Features:**

* Auto-generates `/.well-known/flyweb.json`
* Serves blog posts as structured JSONL at `/.flyweb/posts`
* Serves pages at `/.flyweb/pages`
* WooCommerce support — products at `/.flyweb/products`
* Filtering by category, tag, price
* Pagination with limit/offset
* CORS headers for cross-origin AI access
* Enforced attribution — your content, your credit, always
* Zero configuration needed — works out of the box with sensible defaults

**For WooCommerce stores:**

When AI agents recommend products, your catalog appears in the answer — with proper attribution and links back to your store.

== Installation ==

1. Upload the `flyweb` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu
3. Go to Settings > FlyWeb to configure
4. Visit `yoursite.com/.well-known/flyweb.json` to verify

Or install directly from the WordPress plugin directory.

== Frequently Asked Questions ==

= What is FlyWeb? =

FlyWeb is an open protocol that makes websites machine-readable. It's like robots.txt in reverse — instead of telling machines where NOT to go, flyweb.json tells them what content you HAVE.

= Is it free? =

Yes, completely free and open source. The protocol itself is MIT licensed.

= Does it work with WooCommerce? =

Yes! If WooCommerce is installed, you can expose your product catalog to AI agents. They can search by category, price, and more.

= Will AI agents actually use this? =

FlyWeb is designed for the next generation of AI agents that check for structured data before scraping. As adoption grows, AI companies are incentivized to check flyweb.json first — it gives them cleaner data with less legal risk.

= Can I control what content is exposed? =

Yes. You choose which resources to enable (posts, pages, products). Content is served as structured data — no private or draft content is ever exposed.

= What about attribution? =

Attribution is enforced at the protocol level. Every AI agent that reads your FlyWeb data must credit the source. You can set your preferred license (CC-BY, MIT, etc.).

== Screenshots ==

1. FlyWeb settings page — configure your entity name, site type, and resources
2. The generated flyweb.json — clean, structured data for AI agents
3. Blog posts served as JSONL — title, author, content, tags

== Changelog ==

= 1.0.0 =
* Initial release
* Auto-generates /.well-known/flyweb.json
* Blog posts, pages, and WooCommerce products as resources
* Filtering by category, tag, price
* Pagination with limit/offset
* CORS headers
* Enforced attribution
* Settings page under Settings > FlyWeb

== Upgrade Notice ==

= 1.0.0 =
First release. Make your WordPress site visible to AI agents.
