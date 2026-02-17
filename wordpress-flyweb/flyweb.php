<?php
/**
 * Plugin Name: FlyWeb — AI Visibility for WordPress
 * Plugin URI: https://flyweb.io
 * Description: Make your WordPress site discoverable by AI agents. Generates /.well-known/flyweb.json so AI can find, read, and cite your content. SEO for the AI era.
 * Version: 1.0.0
 * Author: FlyWeb Protocol
 * Author URI: https://flyweb.io
 * License: MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: flyweb
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'FLYWEB_VERSION', '1.0.0' );
define( 'FLYWEB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

// Load components
require_once FLYWEB_PLUGIN_DIR . 'includes/admin.php';
require_once FLYWEB_PLUGIN_DIR . 'includes/rewrite.php';
require_once FLYWEB_PLUGIN_DIR . 'includes/resource-endpoint.php';

/**
 * Activation hook — flush rewrite rules so /.well-known/flyweb.json works immediately.
 */
function flyweb_activate() {
    flyweb_register_rewrite_rules();
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'flyweb_activate' );

/**
 * Deactivation hook — clean up rewrite rules.
 */
function flyweb_deactivation() {
    flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'flyweb_deactivation' );

/**
 * Get the full FlyWeb config as an associative array.
 */
function flyweb_get_config() {
    $options = get_option( 'flyweb_settings', array() );

    $entity = ! empty( $options['entity'] ) ? $options['entity'] : get_bloginfo( 'name' );
    $type   = ! empty( $options['type'] ) ? $options['type'] : 'blog';
    $url    = ! empty( $options['url'] ) ? $options['url'] : home_url();
    $desc   = ! empty( $options['description'] ) ? $options['description'] : get_bloginfo( 'description' );

    $config = array(
        'flyweb'      => '1.0',
        'entity'      => $entity,
        'type'        => $type,
        'url'         => $url,
        'description' => $desc,
        'attribution' => array(
            'required'  => true,
            'format'    => 'Source: {entity} — {url}',
            'must_link' => true,
        ),
        'resources'   => array(),
    );

    // Attribution license
    if ( ! empty( $options['license'] ) ) {
        $config['attribution']['license'] = $options['license'];
    }

    // Posts resource (enabled by default)
    $posts_enabled = isset( $options['posts_enabled'] ) ? (bool) $options['posts_enabled'] : true;
    if ( $posts_enabled ) {
        $config['resources']['posts'] = array(
            'path'   => '/.flyweb/posts',
            'format' => 'jsonl',
            'fields' => array( 'title', 'author', 'date', 'excerpt', 'content', 'tags', 'categories', 'url' ),
            'query'  => '?category={category}&tag={tag}&limit={n}',
            'access' => 'free',
        );
    }

    // Pages resource
    $pages_enabled = ! empty( $options['pages_enabled'] );
    if ( $pages_enabled ) {
        $config['resources']['pages'] = array(
            'path'   => '/.flyweb/pages',
            'format' => 'jsonl',
            'fields' => array( 'title', 'slug', 'content', 'url' ),
            'access' => 'free',
        );
    }

    // Products resource (WooCommerce)
    $products_enabled = ! empty( $options['products_enabled'] );
    if ( $products_enabled && class_exists( 'WooCommerce' ) ) {
        $config['resources']['products'] = array(
            'path'   => '/.flyweb/products',
            'format' => 'jsonl',
            'fields' => array( 'name', 'price', 'currency', 'description', 'category', 'sku', 'url', 'image' ),
            'query'  => '?category={category}&price_max={price_max}&limit={n}',
            'access' => 'free',
        );
    }

    return $config;
}
