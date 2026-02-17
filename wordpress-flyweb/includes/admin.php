<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register the settings page under Settings > FlyWeb.
 */
function flyweb_admin_menu() {
    add_options_page(
        'FlyWeb Settings',
        'FlyWeb',
        'manage_options',
        'flyweb',
        'flyweb_settings_page'
    );
}
add_action( 'admin_menu', 'flyweb_admin_menu' );

/**
 * Register settings.
 */
function flyweb_register_settings() {
    register_setting( 'flyweb_settings_group', 'flyweb_settings', 'flyweb_sanitize_settings' );
}
add_action( 'admin_init', 'flyweb_register_settings' );

/**
 * Sanitize settings before save.
 */
function flyweb_sanitize_settings( $input ) {
    $sanitized = array();

    $sanitized['entity']           = sanitize_text_field( $input['entity'] ?? '' );
    $sanitized['type']             = sanitize_text_field( $input['type'] ?? 'blog' );
    $sanitized['url']              = esc_url_raw( $input['url'] ?? '' );
    $sanitized['description']      = sanitize_text_field( $input['description'] ?? '' );
    $sanitized['license']          = sanitize_text_field( $input['license'] ?? '' );
    $sanitized['posts_enabled']    = ! empty( $input['posts_enabled'] ) ? 1 : 0;
    $sanitized['pages_enabled']    = ! empty( $input['pages_enabled'] ) ? 1 : 0;
    $sanitized['products_enabled'] = ! empty( $input['products_enabled'] ) ? 1 : 0;

    // Flush rewrite rules after settings change
    flush_rewrite_rules();

    return $sanitized;
}

/**
 * Render the settings page.
 */
function flyweb_settings_page() {
    $options  = get_option( 'flyweb_settings', array() );
    $entity   = $options['entity'] ?? get_bloginfo( 'name' );
    $type     = $options['type'] ?? 'blog';
    $url      = $options['url'] ?? home_url();
    $desc     = $options['description'] ?? get_bloginfo( 'description' );
    $license  = $options['license'] ?? 'CC-BY-4.0';
    $posts    = isset( $options['posts_enabled'] ) ? (bool) $options['posts_enabled'] : true;
    $pages    = ! empty( $options['pages_enabled'] );
    $products = ! empty( $options['products_enabled'] );
    $has_woo  = class_exists( 'WooCommerce' );

    $flyweb_url = home_url( '/.well-known/flyweb.json' );
    ?>
    <div class="wrap">
        <h1 style="display:flex;align-items:center;gap:8px">
            <span style="color:#00ffc8;font-size:28px">&#9889;</span>
            FlyWeb — AI Visibility
        </h1>
        <p style="font-size:14px;color:#666;max-width:600px">
            Make your WordPress site discoverable by AI agents. FlyWeb generates
            <code>/.well-known/flyweb.json</code> so AI can find, read, and cite your content with proper attribution.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:16px 0 24px;max-width:600px">
            <strong style="color:#166534">Your FlyWeb endpoint:</strong><br>
            <a href="<?php echo esc_url( $flyweb_url ); ?>" target="_blank" style="font-family:monospace;word-break:break-all">
                <?php echo esc_html( $flyweb_url ); ?>
            </a>
        </div>

        <form method="post" action="options.php">
            <?php settings_fields( 'flyweb_settings_group' ); ?>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="flyweb_entity">Entity Name</label></th>
                    <td>
                        <input type="text" id="flyweb_entity" name="flyweb_settings[entity]"
                               value="<?php echo esc_attr( $entity ); ?>" class="regular-text">
                        <p class="description">Your site or organization name as shown to AI agents.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="flyweb_type">Site Type</label></th>
                    <td>
                        <select id="flyweb_type" name="flyweb_settings[type]">
                            <?php
                            $types = array(
                                'blog'        => 'Blog',
                                'news'        => 'News',
                                'ecommerce'   => 'E-Commerce',
                                'docs'        => 'Documentation',
                                'portfolio'   => 'Portfolio',
                                'directory'   => 'Directory',
                                'forum'       => 'Forum',
                                'wiki'        => 'Wiki',
                                'saas'        => 'SaaS',
                                'science'     => 'Science / Academic',
                                'marketplace' => 'Marketplace',
                            );
                            foreach ( $types as $value => $label ) {
                                printf(
                                    '<option value="%s"%s>%s</option>',
                                    esc_attr( $value ),
                                    selected( $type, $value, false ),
                                    esc_html( $label )
                                );
                            }
                            ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="flyweb_url">Site URL</label></th>
                    <td>
                        <input type="url" id="flyweb_url" name="flyweb_settings[url]"
                               value="<?php echo esc_attr( $url ); ?>" class="regular-text">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="flyweb_description">Description</label></th>
                    <td>
                        <input type="text" id="flyweb_description" name="flyweb_settings[description]"
                               value="<?php echo esc_attr( $desc ); ?>" class="regular-text">
                        <p class="description">Brief description of your site for AI agents.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="flyweb_license">Content License</label></th>
                    <td>
                        <select id="flyweb_license" name="flyweb_settings[license]">
                            <?php
                            $licenses = array(
                                'CC-BY-4.0'    => 'CC BY 4.0 (Attribution)',
                                'CC-BY-SA-4.0' => 'CC BY-SA 4.0 (Attribution + ShareAlike)',
                                'CC-BY-NC-4.0' => 'CC BY-NC 4.0 (Attribution + NonCommercial)',
                                'MIT'          => 'MIT',
                                'custom'       => 'Custom / All Rights Reserved',
                            );
                            foreach ( $licenses as $value => $label ) {
                                printf(
                                    '<option value="%s"%s>%s</option>',
                                    esc_attr( $value ),
                                    selected( $license, $value, false ),
                                    esc_html( $label )
                                );
                            }
                            ?>
                        </select>
                        <p class="description">License for AI to use your content. Attribution is always required.</p>
                    </td>
                </tr>
            </table>

            <h2>Resources</h2>
            <p style="color:#666">Choose which content to expose to AI agents via FlyWeb.</p>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">Blog Posts</th>
                    <td>
                        <label>
                            <input type="checkbox" name="flyweb_settings[posts_enabled]" value="1"
                                   <?php checked( $posts ); ?>>
                            Expose blog posts at <code>/.flyweb/posts</code>
                        </label>
                        <p class="description">Title, author, date, excerpt, content, tags, categories, URL</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Pages</th>
                    <td>
                        <label>
                            <input type="checkbox" name="flyweb_settings[pages_enabled]" value="1"
                                   <?php checked( $pages ); ?>>
                            Expose pages at <code>/.flyweb/pages</code>
                        </label>
                        <p class="description">Title, slug, content, URL</p>
                    </td>
                </tr>
                <?php if ( $has_woo ) : ?>
                <tr>
                    <th scope="row">Products (WooCommerce)</th>
                    <td>
                        <label>
                            <input type="checkbox" name="flyweb_settings[products_enabled]" value="1"
                                   <?php checked( $products ); ?>>
                            Expose products at <code>/.flyweb/products</code>
                        </label>
                        <p class="description">Name, price, description, category, SKU, URL, image</p>
                    </td>
                </tr>
                <?php endif; ?>
            </table>

            <?php submit_button( 'Save FlyWeb Settings' ); ?>
        </form>

        <hr style="margin-top:32px">
        <h2>Validate Your Setup</h2>
        <p>Run this command to verify your FlyWeb config:</p>
        <code style="display:block;background:#1e1e2e;color:#00ffc8;padding:12px 16px;border-radius:6px;max-width:500px;font-size:13px">
            npx flyweb check <?php echo esc_html( home_url() ); ?>
        </code>

        <p style="margin-top:24px;color:#999;font-size:12px">
            FlyWeb v<?php echo esc_html( FLYWEB_VERSION ); ?> &mdash;
            <a href="https://flyweb.io" target="_blank">flyweb.io</a> &mdash;
            <a href="https://github.com/flywebprotocol/flyweb/blob/master/SPEC.md" target="_blank">Protocol Spec</a>
        </p>
    </div>
    <?php
}

/**
 * Add a "Settings" link on the Plugins page.
 */
function flyweb_plugin_action_links( $links ) {
    $settings_link = '<a href="' . admin_url( 'options-general.php?page=flyweb' ) . '">Settings</a>';
    array_unshift( $links, $settings_link );
    return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( FLYWEB_PLUGIN_DIR . 'flyweb.php' ), 'flyweb_plugin_action_links' );
