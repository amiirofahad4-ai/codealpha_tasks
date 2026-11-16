# FlashMind

A flashcard quiz app for Android, iOS and the web, built with **React Native + Expo** for the
**CodeAlpha App Development Internship, Task 1**.

Make decks of flashcards, study them with a 3D flip card, then quiz yourself and track your
score. It needs no account and no backend: everything is saved on the device.

---

## CodeAlpha requirements

| # | Requirement | How FlashMind does it |
|---|-------------|-----------------------|
| 1 | Each flashcard has a question on the front and the answer on the back, with a **Show Answer** button | The Study screen shows a large card with the question on a purple gradient. **Show Answer** (or tapping the card) flips it with a 3D Y-axis animation to show the answer. The button then reads **Hide Answer**. |
| 2 | Move between cards with **Next** and **Previous** | **Previous** / **Next** buttons, a `3 / 10` counter and a progress bar. Previous is disabled on the first card, and Next becomes **Finish** on the last. You can also swipe left or right. |
| 3 | Add, edit and delete flashcards | **+ Add card** on a deck opens a form with Question and Answer fields, character counters and validation. Tap a card to edit it. The trash icon or **Delete card** removes it after a confirmation. Decks can also be created, renamed and deleted. |
| 4 | Simple, clean user interface | Purple theme with white rounded cards, pill buttons, a color for each deck, friendly empty states, and dark mode that follows the phone setting. |

### Extra features

- **Quiz mode**: flip each card, then tap "I knew it ✅" or "I didn't ❌". It shows "Card 4 of 10" and your running score.
- **Result screen**: a score ring, `8 / 10 – 80%`, a message, **Try again**, and **Study wrong cards** (only the cards you missed).
- **Last quiz score** is saved for each deck and shown on the deck list.
- **Search** decks by name.
- **Shuffle** and **Restart** while studying.
- **3 sample decks** on first launch, and **Reset sample data** on the About tab.

---

## Screens

| Screen | Route | What it does |
|--------|-------|--------------|
| Decks (tab) | `/` | Total card count, search, deck cards (color strip, card count, last quiz score, **Study** and **Quiz**), **+** button for a new deck, and **⋯** or long press for Rename / Delete |
| About (tab) | `/about` | App info, "Made for the CodeAlpha App Development Internship", and **Reset sample data** |
| Deck | `/deck/[id]` | Deck header in its color, **Study** / **Quiz**, the card list (tap to edit, trash to delete), **+ Add card**, and an empty state |
| Add / Edit card | `/card?deckId=&id=` | Question and Answer (required, max 300 characters, with counters), Save, Cancel, and Delete when editing |
| Study | `/study/[id]` | Flip card, Show / Hide Answer, Previous / Next / Finish, swipe, Shuffle, Restart |
| Quiz | `/quiz/[id]` | Flip card, then "I knew it ✅" / "I didn't ❌", with the card number and running score |
| Result | `/result/[id]` | Score ring, score and message, Try again, Study wrong cards, Back to decks |

---

## Tech stack

- [Expo](https://expo.dev) SDK 58, React Native, JavaScript
- [Expo Router](https://docs.expo.dev/router/introduction/): routes in `src/app/`, bottom tabs and stack screens
- `@react-native-async-storage/async-storage`: decks, cards and scores are saved on the device
- React Native **Animated** API: the 3D card flip
- `expo-linear-gradient`: purple gradients
- `react-native-svg`: the score ring
- `@expo/vector-icons` (MaterialCommunityIcons)

No UI kit library is used.

---

## Project structure

```
src/
├── app/                        # Routes (Expo Router)
│   ├── _layout.js              # Theme, FlashProvider, Stack
│   ├── (tabs)/
│   │   ├── _layout.js          # Bottom tabs: Decks, About
│   │   ├── index.js            # Decks
│   │   └── about.js
│   ├── deck/[id].js            # Deck detail
│   ├── card.js                 # Add / Edit card (modal)
│   ├── study/[id].js           # Study mode
│   ├── quiz/[id].js            # Quiz mode
│   └── result/[id].js          # Quiz result
├── components/
│   ├── ui.js                   # Card, Button, Chip, EmptyState, Field, ScoreRing, ActionSheet, confirm(), notify()
│   ├── FlipCard.js             # Animated 3D flip card (with swipe)
│   └── DeckForm.js             # New deck / rename sheet (name + color)
├── context/FlashContext.js     # Decks, cards and scores in memory + actions
├── db/storage.js               # The only file that uses AsyncStorage
├── data/samples.js             # Sample decks and cards
└── theme.js                    # Light and dark colors, deck colors
```

### Data

```js
Deck  { id, name, color, createdAt }
Card  { id, deckId, question, answer, createdAt }
Score { deckId, correct, total, date }   // last result for each deck
```

`src/db/storage.js` exports `getDecks`, `saveDeck`, `deleteDeck` (which also deletes the deck's
cards), `getCards(deckId)`, `saveCard`, `deleteCard`, `getScore(deckId)` and `saveScore`.
Every storage call is wrapped in `try/catch`, so the app keeps working even if storage fails.

---

## How to run

You need [Node.js](https://nodejs.org) (LTS) and the **Expo Go** app on your phone
([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) /
[iOS](https://apps.apple.com/app/expo-go/id982107779)).

```bash
git clone https://github.com/amiirofahad4-ai/codealpha_tasks.git
cd codealpha_tasks/Task1_FlashcardQuizApp
npm install
npx expo start
```

Then:

- **Phone**: scan the QR code with Expo Go (Android) or the Camera app (iOS)
- **Web browser**: press `w`
- **Android emulator**: press `a`

Checks:

```bash
npm run lint
npx expo-doctor
```

---

Made for the **CodeAlpha App Development Internship**.
