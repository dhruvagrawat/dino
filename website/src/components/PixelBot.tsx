// Renders the in-game VOLT robot head as a grid of divs (same pixels as the app).
const HEAD = [
  '.......OO.....',
  '......OAAO....',
  '...OOOOXOOOO..',
  '..OXXXXXXXXXO.',
  '.OXXXXXXXXXXXO',
  '.OXDDDDDDDDDXO',
  '.OXDDDDEDDEDXO',
  '.OXDDDDEDDEDXO',
  '.OXXXXXXXXXXXO',
  '..OXXXXXXXXXO.',
  '...OOOOOOOOO..',
];

const COLS = HEAD[0].length;
const ROWS = HEAD.length;

const COLORS: Record<string, string> = {
  X: '#eeeaff',
  A: '#2ee6d6',
  E: '#2ee6d6',
  D: '#231b4a',
  O: '#120e24',
};

export function PixelBot({ px = 10, className = '' }: { px?: number; className?: string }) {
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
      {HEAD.flatMap((row, y) =>
        row.split('').map((ch, x) => (
          <div key={`${x}-${y}`} style={{ backgroundColor: COLORS[ch] ?? 'transparent' }} />
        ))
      )}
    </div>
  );
}
