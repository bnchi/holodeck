import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from '@rollup/plugin-json'

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js', 
    format: 'iife', 
  },
  plugins: [
    json(), 
    resolve(), // Resolve Node.js modules
    commonjs(), // Convert CommonJS modules to ES6
  ],
};
