---
title: "Elevate Your Website's Scroll Experience with Lenis"
date: "2024-01-16"
excerpt: "A guide on integrating the Lenis library into your WordPress website for a smoother scroll experience."
tag: "WordPress"
---

Adding Lenis library to a WordPress website involves a few steps. Here’s a guide on how to do it:

### Step 1: Accessing the WordPress Dashboard

Login to your WordPress admin dashboard.

### Step 2: Adding CSS Code

Insert your CSS code at the end of your theme's `style.css`:

```css
html.lenis {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto;
}
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-stopped {
  overflow: hidden;
}
```

### Step 3: Adding JavaScript Code

Insert the script and initialization in your theme's `footer.php`:

```html
<script src="https://unpkg.com/@studio-freight/lenis@1.0.33/dist/lenis.min.js"></script>
<script>
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    direction: "vertical",
    smooth: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
</script>
```

### Step 4: Check Functionality

Visit your site and ensure smooth scrolling is active without errors.
