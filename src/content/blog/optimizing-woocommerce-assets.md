---
title: "Optimizing WooCommerce: Load Assets Only Where Needed in WordPress"
date: "2023-09-06"
excerpt: "Learn how to optimize WooCommerce by conditionally loading assets only on relevant pages, improving site performance."
tag: "WooCommerce"
---

When WooCommerce is activated, it loads a plethora of CSS and JavaScript files along with various other elements like meta generator tags, body classes, and inline scripts. If your website doesn’t globally require WooCommerce-related features, such as a header mini cart, it’s prudent to unload or dequeue these assets on all pages except those where WooCommerce is explicitly used, such as single product pages, the Shop page, Cart, Checkout, and Account pages.

To conditionally load WooCommerce assets exclusively on WooCommerce-related pages, you can integrate the following code snippet into your active WordPress theme’s functions.php file, either at the end or as a Code Snippet:

```php
/**
 * Callback function that returns true if the current page is a WooCommerce page or false otherwise.
 *
 * @return boolean true for WooCommerce pages and false for non-WooCommerce pages
 */
function is_wc_page() {
	return class_exists( 'WooCommerce' ) && ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() );
}

add_action( 'template_redirect', 'conditionally_remove_wc_assets' );
/**
 * Remove WooCommerce elements on non-WooCommerce pages.
 */
function conditionally_remove_wc_assets() {
	// If this is a WooCommerce page, abort.
	if ( is_wc_page() ) {
		return;
	}

	// Remove WooCommerce generator tag.
	remove_filter( 'get_the_generator_html', 'wc_generator_tag', 10, 2 );
	remove_filter( 'get_the_generator_xhtml', 'wc_generator_tag', 10, 2 );

	// Unload WooCommerce scripts.
	remove_action( 'wp_enqueue_scripts', [ WC_Frontend_Scripts::class, 'load_scripts' ] );
	remove_action( 'wp_print_scripts', [ WC_Frontend_Scripts::class, 'localize_printed_scripts' ], 5 );
	remove_action( 'wp_print_footer_scripts', [ WC_Frontend_Scripts::class, 'localize_printed_scripts' ], 5 );

	// Remove "Show the gallery if JS is disabled".
	remove_action( 'wp_head', 'wc_gallery_noscript' );

	// Remove WooCommerce body class.
	remove_filter( 'body_class', 'wc_body_class' );
}

add_filter( 'woocommerce_enqueue_styles', 'conditionally_woocommerce_enqueue_styles' );
/**
 * Unload WooCommerce stylesheets on non-WooCommerce pages.
 *
 * @param array $enqueue_styles
 */
function conditionally_woocommerce_enqueue_styles( $enqueue_styles ) {
	return is_wc_page() ? $enqueue_styles : array();
}

add_action( 'wp_enqueue_scripts', 'conditionally_wp_enqueue_scripts' );
/**
 * Remove inline styles on non-WooCommerce pages.
 */
function conditionally_wp_enqueue_scripts() {
	if ( ! is_wc_page() ) {
		wp_dequeue_style( 'woocommerce-inline' );
	}
}
```

## **References:**

[WordPress `remove_filter()` Function](https://developer.wordpress.org/reference/functions/remove_filter/)

[WordPress Plugin API Action Reference](https://codex.wordpress.org/Plugin_API/Action_Reference)

[Disable the Default Stylesheet in WooCommerce](https://woocommerce.com/document/disable-the-default-stylesheet/)

[WooCommerce Issue on GitHub](https://github.com/woocommerce/woocommerce/issues/21674)

### **WooCommerce Files:**

`/wp-content/plugins/woocommerce/includes/wc-template-hooks.php`

`/wp-content/plugins/woocommerce/includes/wc-template-functions.php`

`/wp-content/plugins/woocommerce/includes/class-wc-frontend-scripts.php`
