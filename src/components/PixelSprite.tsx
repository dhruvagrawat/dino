import React from 'react';
import { View } from 'react-native';
import { PixelMatrix } from '../pixels';

interface Props {
  matrix: PixelMatrix;
  pixel: number;
  body: string;
  accent?: string;
  eye?: string;
}

interface Run {
  top: number;
  left: number;
  width: number;
  color: string;
}

function buildRuns(matrix: PixelMatrix, pixel: number, colors: Record<string, string>): Run[] {
  const runs: Run[] = [];
  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.') {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      runs.push({
        top: y * pixel,
        left: x * pixel,
        width: (end - x) * pixel,
        color: colors[ch] ?? colors.X,
      });
      x = end;
    }
  }
  return runs;
}

function PixelSpriteInner({ matrix, pixel, body, accent, eye }: Props) {
  const colors = { X: body, A: accent ?? body, E: eye ?? '#ffffff' };
  const runs = React.useMemo(
    () => buildRuns(matrix, pixel, colors),
    [matrix, pixel, body, accent, eye]
  );
  const width = matrix[0].length * pixel;
  const height = matrix.length * pixel;
  return (
    <View style={{ width, height }} pointerEvents="none">
      {runs.map((r, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: r.top,
            left: r.left,
            width: r.width,
            height: pixel,
            backgroundColor: r.color,
          }}
        />
      ))}
    </View>
  );
}

export const PixelSprite = React.memo(PixelSpriteInner);
