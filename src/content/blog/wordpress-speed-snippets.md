---
title: "The Ultimate Snippets to Boost WordPress Speed & Performance"
date: "2022-10-14"
excerpt: "Follow These Tips and Snippets to boost WordPress performance and speed up your website."
tag: "WordPress"
---

## Do you want to speed up your WordPress site?

Follow These Tips and Snippets to boost WordPress performance and speed up your website.

### Remove comment-reply.min.js file from all pages except posts.

```php
/**
*Remove comment-reply.min.js from all pages except posts
*/
add_action( 'wp_enqueue_scripts', 'comment_reply_hook' );
function comment_reply_hook() {
if ( !is_single()) {
wp_deregister_script( 'comment-reply' );
}
}
```

### Disable Emojis

One easy optimization is to disable emojis from loading. While these icons are fun, are they really necessary for your WordPress site? Especially if you are a business, these are simply adding additional load time.

```php
/** * Disable the emoji's */
function disable_emojis() {
 remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
 remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
 remove_action( 'wp_print_styles', 'print_emoji_styles' );
 remove_action( 'admin_print_styles', 'print_emoji_styles' );
 remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
 remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
 remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
 add_filter( 'tiny_mce_plugins', 'disable_emojis_tinymce' );
 add_filter( 'wp_resource_hints', 'disable_emojis_remove_dns_prefetch', 10, 2 );
}
add_action( 'init', 'disable_emojis' );
```

### Disable Embeds

WordPress has been an oEmbed consumer for a long time, and this script loads on every single page. While it's small, these requests add up.

```php
function disable_embeds_code_init() {
 // Remove the REST API endpoint.
 remove_action( 'rest_api_init', 'wp_oembed_register_route' );
 // Turn off oEmbed auto discovery.
 add_filter( 'embed_oembed_discover', '__return_false' );
 // Don't filter oEmbed results.
 remove_filter( 'oembed_dataparse', 'wp_filter_oembed_result', 10 );
 // Remove oEmbed discovery links.
 remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
 // ... and more
}
add_action( 'init', 'disable_embeds_code_init', 9999 );
```

### Remove jQuery Migrate

If you are trying to increase the performance of your site you may have noticed jQuery Migrate loading on your site.

```php
//Remove jQuery migrate
function smartwp_remove_jquery_migrate( $scripts ) {
 if ( !is_admin() && !empty( $scripts->registered['jquery'] ) ) {
 $scripts->registered['jquery']->deps = array_diff( $scripts->registered['jquery']->deps, ['jquery-migrate'] );
 }
}
add_action('wp_default_scripts', 'smartwp_remove_jquery_migrate');
```

## Summary

Having a fast site helps boost your rankings, improves conversion rates, increases time on site, and decreases your bounce rate.
