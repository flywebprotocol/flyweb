<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register rewrite rules to serve /.well-known/flyweb.json
 */
function flyweb_register_rewrite_rules() {
    add_rewrite_rule(
        '^\.well-known/flyweb\.json$',
        'index.php?flyweb_json=1',
        'top'
    );
}
add_action( 'init', 'flyweb_register_rewrite_rules' );

/**
 * Register the query variable.
 */
function flyweb_query_vars( $vars ) {
    $vars[] = 'flyweb_json';
    return $vars;
}
add_filter( 'query_vars', 'flyweb_query_vars' );

/**
 * Handle the flyweb.json request — serve the config as JSON.
 */
function flyweb_handle_request() {
    if ( ! get_query_var( 'flyweb_json' ) ) {
        return;
    }

    $config = flyweb_get_config();

    // Remove empty optional fields
    if ( empty( $config['description'] ) ) {
        unset( $config['description'] );
    }

    header( 'Content-Type: application/json; charset=utf-8' );
    header( 'Cache-Control: public, max-age=3600, s-maxage=3600' );
    header( 'Access-Control-Allow-Origin: *' );
    header( 'X-FlyWeb-Version: 1.0' );

    echo wp_json_encode( $config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
    exit;
}
add_action( 'template_redirect', 'flyweb_handle_request' );
