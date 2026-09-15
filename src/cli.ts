#!/usr/bin/env node

import { program } from 'commander'
import { serve } from './cli/serve.js'
import { render } from './cli/render.js'

program.name('vormen').version('0.0.0')

program
  .command('serve <drawingFile>')
  .description('Start vite dev server with the specified drawing')
  .action(serve)

program
  .command('render <drawingFile>')
  .description('Render SVG to stdout')
  .action(render)

program.parse()
