---
title: "How to apply custom CSS to any Gutenberg Block"
date: "2022-10-15"
excerpt: "Learn how to apply custom CSS to Gutenberg blocks using various methods, including the WordPress Customizer and child themes."
tag: "WordPress"
---

What if you need to apply some custom styling using CSS to your content in Gutenberg editor. There are a few ways you can apply custom CSS to any Gutenberg block. Let’s find out how to do it.

## 1. Via WordPress Customizer

You can simply put your custom CSS into the Additional CSS section via WordPress Customizer targeting specific CSS class applied to the Gutenberg block.

But, there is a downside to this approach. Your custom CSS does not get reflected in the Gutenberg Editor while you are editing the page or post. It only applies to the page on the front-end. So visually your editor view will not reflect the actual styling of the blocks if you apply custom CSS using this method.

## 2. Via Child Theme Stylesheet

Another way is to create a child theme for your Website, and put your custom CSS in the child theme’s stylesheet file. It will also not reflect the CSS in Gutenberg editor by default, but there is a workaround.

You need to enqueue the child theme CSS file in Gutenberg editor. Gutenberg allows you to hook a stylesheet to Gutenberg editor view. Edit your child theme’s ‘functions.php’ file and put the following code.

```php
/**
 * Registers support for editor styles & Enqueue it.
 */
function ghub_child_setup() {
	// Add support for editor styles.
	add_theme_support( 'editor-styles' );

	// Enqueue editor styles.
	add_editor_style( 'style.css' );
}
add_action( 'after_setup_theme', 'ghub_child_setup' );
```

The code provide will add theme support for editor styles as suggested by Gutenberg handbook and then we enqueue it inside the editor simply.

Now you will notice the custom CSS be reflected in Gutenberg editor, which is good. However, this method also has a downside, unfortunately. It can mess some of Gutenberg editor’s UI stylings.

## 3. Using Editor Plus

We’ve developed a No-Code Visual Style Editor plugin for WordPress called “Editor Plus”. It should be the easiest and best option moving forward to style Gutenberg Blocks and add custom CSS code to any block or globally.

### The Easiest way to apply custom CSS to Gutenberg blocks.

Once the Editor Plus plugin has been installed. Simply edit any Gutenberg block and now you will notice many new options and one of that is for “Custom CSS” in the sidebar. That’s the place to write your custom CSS and it applies to the block you are editing instantly. Pretty neat huh?

### Add Global Custom CSS using Editor Plus

Using the Editor Plus plugin, you can also put global custom CSS code that applies to all pages and even in Gutenberg editor out of the box. Just head over to your **WP Dashboard → Settings → Editor Plus** page. Click on Advanced tab from there and you get a CSS box where you can write your global CSS code.
