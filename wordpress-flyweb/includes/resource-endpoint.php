<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register rewrite rules for resource endpoints.
 */
function flyweb_resource_rewrite_rules() {
    add_rewrite_rule( '^\.flyweb/posts/?$', 'index.php?flyweb_resource=posts', 'top' );
    add_rewrite_rule( '^\.flyweb/pages/?$', 'index.php?flyweb_resource=pages', 'top' );
    add_rewrite_rule( '^\.flyweb/products/?$', 'index.php?flyweb_resource=products', 'top' );
}
add_action( 'init', 'flyweb_resource_rewrite_rules' );

/**
 * Register the resource query variable.
 */
function flyweb_resource_query_vars( $vars ) {
    $vars[] = 'flyweb_resource';
    return $vars;
}
add_filter( 'query_vars', 'flyweb_resource_query_vars' );

/**
 * Handle resource endpoint requests.
 */
function flyweb_resource_handler() {
    $resource = get_query_var( 'flyweb_resource' );
    if ( ! $resource ) {
        return;
    }

    $limit  = min( absint( isset( $_GET['limit'] ) ? $_GET['limit'] : 50 ), 100 );
    $offset = absint( isset( $_GET['offset'] ) ? $_GET['offset'] : 0 );

    header( 'Content-Type: application/x-ndjson; charset=utf-8' );
    header( 'Cache-Control: public, max-age=60, s-maxage=60' );
    header( 'Access-Control-Allow-Origin: *' );
    header( 'X-FlyWeb-Version: 1.0' );

    switch ( $resource ) {
        case 'posts':
            flyweb_serve_posts( $limit, $offset );
            break;
        case 'pages':
            flyweb_serve_pages( $limit, $offset );
            break;
        case 'products':
            flyweb_serve_products( $limit, $offset );
            break;
        default:
            status_header( 404 );
            echo '{"error": "Resource not found"}';
    }
    exit;
}
add_action( 'template_redirect', 'flyweb_resource_handler' );

/**
 * Serve posts as JSONL.
 */
function flyweb_serve_posts( $limit, $offset ) {
    $args = array(
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => $limit,
        'offset'         => $offset,
        'orderby'        => 'date',
        'order'          => 'DESC',
    );

    // Filter by category
    if ( ! empty( $_GET['category'] ) ) {
        $args['category_name'] = sanitize_text_field( $_GET['category'] );
    }

    // Filter by tag
    if ( ! empty( $_GET['tag'] ) ) {
        $args['tag'] = sanitize_text_field( $_GET['tag'] );
    }

    $query = new WP_Query( $args );

    while ( $query->have_posts() ) {
        $query->the_post();

        $tags       = wp_get_post_tags( get_the_ID(), array( 'fields' => 'names' ) );
        $categories = wp_get_post_categories( get_the_ID(), array( 'fields' => 'names' ) );

        $item = array(
            'title'      => get_the_title(),
            'author'     => get_the_author(),
            'date'       => get_the_date( 'Y-m-d' ),
            'excerpt'    => get_the_excerpt(),
            'content'    => wp_strip_all_tags( get_the_content() ),
            'tags'       => $tags,
            'categories' => $categories,
            'url'        => get_permalink(),
        );

        echo wp_json_encode( $item, JSON_UNESCAPED_SLASHES ) . "\n";
    }
    wp_reset_postdata();
}

/**
 * Serve pages as JSONL.
 */
function flyweb_serve_pages( $limit, $offset ) {
    $args = array(
        'post_type'      => 'page',
        'post_status'    => 'publish',
        'posts_per_page' => $limit,
        'offset'         => $offset,
        'orderby'        => 'title',
        'order'          => 'ASC',
    );

    $query = new WP_Query( $args );

    while ( $query->have_posts() ) {
        $query->the_post();

        $item = array(
            'title'   => get_the_title(),
            'slug'    => get_post_field( 'post_name', get_the_ID() ),
            'content' => wp_strip_all_tags( get_the_content() ),
            'url'     => get_permalink(),
        );

        echo wp_json_encode( $item, JSON_UNESCAPED_SLASHES ) . "\n";
    }
    wp_reset_postdata();
}

/**
 * Serve WooCommerce products as JSONL.
 */
function flyweb_serve_products( $limit, $offset ) {
    if ( ! class_exists( 'WooCommerce' ) ) {
        echo '{"error": "WooCommerce not installed"}' . "\n";
        return;
    }

    $args = array(
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => $limit,
        'offset'         => $offset,
        'orderby'        => 'date',
        'order'          => 'DESC',
    );

    // Filter by category
    if ( ! empty( $_GET['category'] ) ) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'product_cat',
                'field'    => 'slug',
                'terms'    => sanitize_text_field( $_GET['category'] ),
            ),
        );
    }

    // Filter by max price
    if ( ! empty( $_GET['price_max'] ) ) {
        $args['meta_query'] = array(
            array(
                'key'     => '_price',
                'value'   => floatval( $_GET['price_max'] ),
                'compare' => '<=',
                'type'    => 'NUMERIC',
            ),
        );
    }

    $query = new WP_Query( $args );

    while ( $query->have_posts() ) {
        $query->the_post();
        $product = wc_get_product( get_the_ID() );

        if ( ! $product ) {
            continue;
        }

        $item = array(
            'name'        => $product->get_name(),
            'price'       => $product->get_price(),
            'currency'    => get_woocommerce_currency(),
            'description' => wp_strip_all_tags( $product->get_short_description() ),
            'category'    => implode( ', ', wp_get_post_terms( get_the_ID(), 'product_cat', array( 'fields' => 'names' ) ) ),
            'sku'         => $product->get_sku(),
            'url'         => get_permalink(),
            'image'       => wp_get_attachment_url( $product->get_image_id() ),
        );

        echo wp_json_encode( $item, JSON_UNESCAPED_SLASHES ) . "\n";
    }
    wp_reset_postdata();
}
