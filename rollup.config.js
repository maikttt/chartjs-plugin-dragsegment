import {nodeResolve} from '@rollup/plugin-node-resolve';
import {terser} from "rollup-plugin-terser";

export default {
  input: './src/main.js',
  output: {
    file: './dist/chartjs-plugin-dragsegment.min.js',
    format: 'iife',
    sourcemap: false,
  },
  plugins: [
    nodeResolve({
      browser: true
    }),
    terser()
  ],
};
