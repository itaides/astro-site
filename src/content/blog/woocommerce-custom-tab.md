---
title: "Add a new custom tab on the WooCommerce account page"
date: "2022-10-27"
excerpt: "Learn how to add a custom tab to the WooCommerce My Account page with this step-by-step guide."
tag: "WooCommerce"
---

Adding new tab with custom content to the WooCommerce My Account page is one of the most common customization requests we receive in our studio.

Today, we are going to show you how to add custom tab on WooCommerce My Account page.

WooCommerce by default adds the following items to the account page:

- Dashboard
- Orders
- Downloads
- Addresses
- Account details
- Logout

If You want to add a new tab endpoint use these snippet:

## 1. Registering new item endpoint

```php
add_action( 'init', 'register_new_item_endpoint');

/**
 * Register New Endpoint.
 *
 * @return void.
 */
function register_new_item_endpoint() {
	add_rewrite_endpoint( 'awesome', EP_ROOT | EP_PAGES );
}
```

You can change “awesome” to your preferred item name.

## 2. Query Vars

```php
add_filter( 'query_vars', 'new_item_query_vars' );

/**
 * Add new query var.
 *
 * @param array $vars vars.
 *
 * @return array An array of items.
 */
function new_item_query_vars( $vars ) {

	$vars[] = 'awesome';
	return $vars;
}
```

## 3. Add New Item

```php
add_filter( 'woocommerce_account_menu_items', 'add_new_item_tab' );

/**
 * Add New tab in my account page.
 *
 * @param array $items myaccount Items.
 *
 * @return array Items including New tab.
 */
function add_new_item_tab( $items ) {

	$items['awesome'] = 'Our awesome New Tab'; //Label Of Tab
	return $items;
}
```

## 4. Add Contents To The New Item

```php
add_action( 'woocommerce_account_awesome_endpoint', 'add_new_item_content' );

/**
 * Add content to the new tab.
 *
 * @return  string.
 */
function add_new_item_content() {
	echo 'New Item Contents here!';
}
```

### Where to add the custom tab code snippet?

The best place to add such PHP modifications snippets would be at the bottom of your child theme functions.php file.

Once you’ve added these snippets, make sure to resave the permalinks by going to **Settings > Permalinks**.

![Image](/images/blog/woocommerce-tab-image.png)

**Let me know in the comments bellow if you use this tutorial on your WooCommerce site.**
