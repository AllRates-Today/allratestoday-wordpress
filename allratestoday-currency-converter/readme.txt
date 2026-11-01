=== AllRatesToday Currency Converter ===
Contributors: chathurangac8
Tags: currency converter, exchange rates, currency, central bank, widget
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Free currency converter and official central-bank exchange rate widgets. Blocks and shortcodes, no API key needed.

== Description ==

Add a currency converter or an official exchange rate to any post, page or widget area.

**Currency Converter block** — amount, from/to currency and a swap button. Without an API key it uses the official European Central Bank reference rates (30 currencies, updated each working day). Add a free AllRatesToday API key for real-time rates across 160+ currencies.

**Official Exchange Rate block** — one currency pair exactly as published by a central bank or tax authority, with the publication date: the European Central Bank, Bank of England, Reserve Bank of India, Bank of Japan, Swiss National Bank, HMRC, the US Treasury and 100+ more. Useful for invoices, tax and travel pages that need a citable rate.

* Two blocks: Currency Converter and Official Exchange Rate
* Shortcodes for classic themes and widget areas
* Light and dark themes
* Lightweight: the scripts load only on pages that use a widget
* No account needed

= Shortcodes =

`[allratestoday_converter base="USD" target="EUR" amount="100" theme="light"]`

`[allratestoday_official_rate bank="ecb" source="USD" target="EUR" theme="light"]`

Bank codes: see the [list of publishers](https://allratestoday.com/central-bank-rates-api/institutions/).

= Credit link =

The free AllRatesToday service requires a visible "Exchange rates by AllRatesToday" link under each widget. The plugin never adds it on its own: widgets stay hidden from visitors until you tick **Show the credit link** in Settings → AllRatesToday. Until then, administrators see a note where the widget would be.

== External services ==

This plugin displays exchange rates from the AllRatesToday API (https://allratestoday.com). The rates are not stored in WordPress; your visitors' browsers request them directly when a page with a widget loads.

* **When:** each time a visitor views a page containing a Currency Converter or Official Exchange Rate widget, and each time they change the amount or currencies in the converter.
* **What is sent:** the requested currency codes and, for the official-rate widget, the bank code. If you saved an API key, it is sent with converter requests. As with any web request, the visitor's IP address and browser user agent reach the service.
* **Endpoints:** `https://allratestoday.com/api/v1/symbols`, `https://allratestoday.com/api/open/central-bank/{bank}` and, with an API key, `https://allratestoday.com/api/widget/rate`.

Service provider: AllRatesToday. [Terms of service](https://allratestoday.com/terms/) · [Privacy policy](https://allratestoday.com/privacy-policy/)

== Installation ==

1. Install the plugin from Plugins → Add New, or upload the `allratestoday-currency-converter` folder to `/wp-content/plugins/`.
2. Activate it.
3. Go to Settings → AllRatesToday and tick **Show the credit link**. Optionally paste an API key.
4. Add the **Currency Converter** or **Official Exchange Rate** block, or use a shortcode.

== Frequently Asked Questions ==

= Do I need an API key? =

No. Without a key the converter uses the European Central Bank reference rates and the official-rate widget works for every supported publisher. A free key from https://allratestoday.com/register gives the converter real-time rates for 160+ currencies.

= Is my API key visible? =

Yes. It is written into the page HTML so visitors' browsers can request rates, which means anyone can copy it and use your quota. Watch usage in your AllRatesToday dashboard and rotate the key there if needed, or leave the key empty and use the free ECB rates.

= Why is the widget not showing? =

Tick **Show the credit link** in Settings → AllRatesToday. The free service requires the link, so the plugin keeps widgets hidden until you agree to show it.

= Are these rates suitable for tax or customs? =

The Official Exchange Rate widget shows the rate exactly as the named central bank or tax authority published it, with its publication date. Check which publisher and date your rules require.

== Changelog ==

= 1.0.0 =
* First release: Currency Converter and Official Exchange Rate blocks and shortcodes.

== Upgrade Notice ==

= 1.0.0 =
First release.

== Third-party code ==

`assets/widget.js` and `assets/official-rates.js` are the AllRatesToday widget scripts (MIT licence, https://github.com/AllRates-Today/allratestoday-widget), included unminified.
