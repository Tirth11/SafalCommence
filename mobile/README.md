# SafalMarketHub — customer app (Flutter)

A UI mockup of the customer experience, mirroring the web build in
`../src`: same design tokens, same information architecture, same
copy. Static data throughout — no network, no backend, no auth.

## Running it

This repo holds `lib/`, `pubspec.yaml` and the analysis options. The
platform folders (`android/`, `ios/`, `web/`) are not checked in, so
generate them once against your installed Flutter:

```bash
cd mobile
flutter create . --project-name safalmarkethub --platforms=android,ios
flutter pub get
flutter run
```

`flutter create .` on an existing directory adds the missing platform
scaffolding and leaves `lib/` and `pubspec.yaml` alone.

There are no third-party packages, so `pub get` resolves instantly and
nothing can break on a version bump.

## What's in it

| Screen | File | Notes |
| --- | --- | --- |
| Shell | `lib/main.dart` | Bottom nav: Home · Categories · Search · Cart · Account |
| Shopping home | `screens/home_screen.dart` | Greeting, search, offers, order tracker, needs, budget, rails |
| Search | `screens/search_screen.dart` | Recent searches, examples, photo + guide entry points |
| Listing | `screens/listing_screen.dart` | Category / budget / stock filters, four sorts |
| Product | `screens/product_screen.dart` | Variants, ZIP check, offer line, sticky buy bar |
| Cart | `screens/cart_screen.dart` | Quantity steppers, auto-applied best offer, price breakdown |
| Checkout | `screens/checkout_screen.dart` | Address → Delivery → Review → Payment, then confirm sheet |
| Orders | `screens/order_detail_screen.dart` | Tracking timeline, money trail, post-delivery feedback |
| Offers | `screens/offers_screen.dart` | Wallet: Available / Saved / Upcoming / Used |
| Account | `screens/account_screen.dart` | Orders, shortcuts, wishlist, sign in / out |
| Assistant | `screens/assistant_sheet.dart` | Help me choose · photo search · results |

## The two rules carried over from the web build

Both live in `data/commerce.dart` rather than in wording, because that's
where they actually hold:

**A stated budget is a hard limit.** `findMatches` filters by price
before scoring. Answer "up to $100" and nothing above it can appear —
the earlier web version scored budget as a preference and cheerfully
returned a $120 watch.

**An offer is only quoted if it applies.** `bestOfferFor` returns null
rather than the closest near-miss, so no screen can promise a discount
the order doesn't qualify for.

Free-text search follows the same instinct: a word has to match before
price is considered, so a cheap shirt never answers a search for
headphones.

## Design

Tokens in `theme/app_theme.dart` are ported from the web: brand purple
`#543BCB`, near-black ink, teal for good news, gold for warnings, and
the 8 / 12 / 16 / 24 radius scale. `money()` is the single place that
decides how currency renders, exactly as on the web.

Product imagery is generated — a glyph on a soft gradient, via
`ProductScene` — rather than stock photography. Swapping in real
photographs means changing that one widget.

## Scope

This mobile mockup keeps customer shopping first and also includes
light seller entry points for people who want to start selling.
Full seller operations and Super Admin screens remain web-first for
now. Sign-in is a single tap with no form, and nothing persists across
a restart.
