import { DrawingBuilder } from '../lib/drawing.ts';
import type { G } from '@svgdotjs/svg.js';

const draw: G = DrawingBuilder.new()
  .withA4Size()
  .withMargin(20)
  .withBackgroundColor('#f0f0f0')
  .build();

draw.rect(100, 100).attr({ fill: '#f06' });
