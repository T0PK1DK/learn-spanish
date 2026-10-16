# Habla

A simple Latin American Spanish trainer. Cards, quizzes, and phone audio. Progress stays on the device, so friends can use the same link and each keep their own.

Live site (after Pages is on): https://t0pk1dk.github.io/learn-spanish/

## Use it

Open the live link, or open `index.html`. Add it to your home screen on iPhone: Share → Add to Home Screen.

Sets: Greetings, Basics, Café, Food, Around, Family, Time, Numbers.

- Tap a card for English, pronunciation, and an example.
- Play uses your phone's Spanish voice.
- Got it / Again tracks what you know.
- Still learning hides the ones you already have.
- Share sends the link. Export / Import moves your progress to another phone.

## Turn on the live site

1. Repo → Settings → Pages
2. Build and deployment → Source: GitHub Actions
3. The workflow in `.github/workflows/pages.yml` publishes on every push to `main`

Or use Deploy from a branch → `main` → `/ (root)`.
