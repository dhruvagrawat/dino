// Renders the in-game pixel T-rex as a grid of divs (same sprite as the app).
const REX = [
  '..........XXXXXXXXX.',
  '.........XXEXXXXXXX.',
  '.........XXXXXXXXXX.',
  '.........XXXXXXXXXX.',
  '.........XXXXX......',
  '.........XXXXXXXX...',
  'X.......XXXXXX......',
  'X......XXXXXXX......',
  'XX....XXXXXXXXXX....',
  'XXX..XXXXXXXXXXX....',
  'XXXXXXXXXXXXXXXX.X..',
  'XXXXXXXXXXXXXXXXXX..',
  'XXXXXXXXXXXXXXXX....',
  '.XXXXXXXXXXXXXX.....',
  '..XXXXXXXXXXXX......',
  '...XXXXXXXXXX.......',
  '....XXXXXXXX........',
  '.....XX...XXX.......',
  '.....XX....XX.......',
  '.....XXX...XXX......',
];

const COLS = REX[0].length;
const ROWS = REX.length;

export function PixelDino({
  px = 10,
  body = '#1f2430',
  eye = 'transparent',
  className = '',
}: {
  px?: number;
  body?: string;
  eye?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${px}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${px}px)`,
        width: COLS * px,
        height: ROWS * px,
      }}
      aria-hidden
    >
      {REX.flatMap((row, y) =>
        row.split('').map((ch, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              backgroundColor: ch === '.' ? 'transparent' : ch === 'E' ? eye : body,
            }}
          />
        ))
      )}
    </div>
  );
}
