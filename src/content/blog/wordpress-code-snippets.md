---
title: "How to Add Code Snippets to WordPress (2 ways)"
date: "2022-10-14"
excerpt: "Learn two effective methods to add PHP code snippets to your WordPress site, along with the importance of backing up your site before making changes."
tag: "WordPress"
---

If you need help adding PHP code snippets to WordPress here 2 ways you can use to add code snippets to your site.

Before you get started, you might want to perform a backup of your site.

That way, if something goes wrong while adding your code, you can simply restore your content.

## 1. Using a Plugin (Recommended)

The safest way to add code snippets is via a dedicated plugin like "Code Snippets". This allows you to manage snippets individually and toggle them on/off without editing theme files directly.

## 2. Using functions.php

You can add your code directly to your theme's `functions.php` file. However, it's highly recommended to use a Child Theme for this. If you edit the parent theme directly, your changes will be lost when the theme updates.

```php
// Example snippet
function custom_excerpt_length($length) {
    return 20;
}
add_filter('excerpt_length', 'custom_excerpt_length', 999);
```
