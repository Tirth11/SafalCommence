import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:safalmarkethub/main.dart';

/// A smoke test that the shell renders and the tabs switch. Enough to catch
/// a build-breaking change without pinning the mockup's layout in place.
void main() {
  testWidgets('opens on the shopping home', (tester) async {
    await tester.pumpWidget(const SafalMarketHubApp());
    await tester.pump();

    expect(find.text('Find it. Buy it.'), findsOneWidget);
    // A live seller campaign announces itself at the top of the home screen.
    expect(find.text('Independence Day Sale'), findsOneWidget);
  });

  testWidgets('bottom navigation switches tabs', (tester) async {
    await tester.pumpWidget(const SafalMarketHubApp());
    await tester.pump();

    await tester.tap(find.byIcon(Icons.person_outline));
    await tester.pumpAndSettle();

    // Signed out by default, so the account tab asks you to sign in.
    expect(find.text('Sign in to your account'), findsOneWidget);
  });
}
