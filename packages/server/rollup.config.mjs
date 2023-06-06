import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: './src/index.ts',
    output: {
        file: './dist/index.js',
        format: 'cjs'
    },
    plugins: [
        json(),
        terser(),
        typescript({ compilerOptions: { module: 'esnext' } }),
        nodeResolve({ exportConditions: ['node'] }),
        commonjs()
    ]
};
