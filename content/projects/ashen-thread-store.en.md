---
title: "ashen.thread: online store demo"
summary: An online store for music merch, selling at home and abroad, with stock per size, shipping by zone, simulated payment and an admin dashboard. Runs in the browser with no server.
role: Developer (design to deployment)
team: Solo
period: "2026"
order: 3
stack:
  - TypeScript
  - Vite
  - Vitest
  - Playwright
  - GitHub Pages
stats:
  - label: Automated tests
    value: "84+"
  - label: Languages
    value: ID · EN
links:
  demo: https://khanigaraa.github.io/ashen-thread-store/
  repo: https://github.com/khanigaraa/ashen-thread-store
---

## The project

**ashen.thread** is a fictional music-merch brand: tees, long sleeves and jackets sold to buyers in Indonesia and abroad, priced in USD and in two languages. I built it as a portfolio demo of a complete online-store flow. All products, prices and contacts are examples, and payment is simulated.

## What you can try

- **Catalogue** with category filters and *SOLD OUT* labels.
- **Products** with stock per size (S–XXL); sizes that run out are disabled automatically.
- **Cart** that persists and cannot exceed the stock.
- **Checkout** with form validation and shipping calculated per country zone.
- **Admin**: order status, tracking numbers, product and stock management, and a sales dashboard.

## How it is built

The store logic (cart, stock, shipping, orders) is kept apart from the interface and unit tested. All data goes through one *storage adapter*, so `localStorage` can be swapped for a real backend without touching that logic. The purchase flow, from picking a size to the order showing up in the admin, is covered by an end-to-end test, and the demo deploys to GitHub Pages automatically.
