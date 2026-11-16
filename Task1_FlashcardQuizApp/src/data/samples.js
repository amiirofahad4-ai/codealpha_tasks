// Sample decks added on first launch and by "Reset sample data".
const SAMPLES = [
  {
    id: 'capitals',
    name: 'World Capitals',
    color: '#3B82F6',
    cards: [
      ['What is the capital of Somalia?', 'Mogadishu'],
      ['What is the capital of Japan?', 'Tokyo'],
      ['What is the capital of Canada?', 'Ottawa'],
      ['What is the capital of Australia?', 'Canberra'],
      ['What is the capital of Brazil?', 'Brasília'],
      ['What is the capital of Egypt?', 'Cairo'],
    ],
  },
  {
    id: 'vocab',
    name: 'English Vocabulary',
    color: '#10B981',
    cards: [
      ['What does "abundant" mean?', 'Existing in large amounts; more than enough.'],
      ['What does "brief" mean?', 'Lasting only a short time.'],
      ['What is a synonym for "happy"?', 'Joyful (also: glad, cheerful).'],
      ['What is the opposite of "ancient"?', 'Modern'],
      ['What does "curious" mean?', 'Eager to know or learn something.'],
    ],
  },
  {
    id: 'js',
    name: 'JavaScript Basics',
    color: '#F59E0B',
    cards: [
      ['Which keyword declares a variable that cannot be reassigned?', 'const'],
      ['What does "===" check?', 'Strict equality: same value and same type.'],
      ['How do you add an item to the end of an array?', 'array.push(item)'],
      ['What does JSON stand for?', 'JavaScript Object Notation'],
      ['What is the result of typeof null?', '"object"'],
      ['Which method turns a JSON string into an object?', 'JSON.parse()'],
    ],
  },
];

export function createSampleData() {
  const now = Date.now();
  const decks = [];
  const cards = [];
  SAMPLES.forEach((s, d) => {
    decks.push({ id: s.id, name: s.name, color: s.color, createdAt: now + d });
    s.cards.forEach(([question, answer], i) => {
      cards.push({ id: `${s.id}-${i + 1}`, deckId: s.id, question, answer, createdAt: now + i });
    });
  });
  return { decks, cards };
}
