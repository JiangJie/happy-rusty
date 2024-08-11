# 在 JavaScript 中使用 Rust 特性

[![NPM version](https://img.shields.io/npm/v/happy-rusty.svg)](https://npmjs.org/package/happy-rusty)
[![NPM downloads](https://badgen.net/npm/dm/happy-rusty)](https://npmjs.org/package/happy-rusty)
[![JSR Version](https://jsr.io/badges/@happy-js/happy-rusty)](https://jsr.io/@happy-js/happy-rusty)
[![JSR Score](https://jsr.io/badges/@happy-js/happy-rusty/score)](https://jsr.io/@happy-js/happy-rusty/score)
[![Build Status](https://github.com/jiangjie/happy-rusty/actions/workflows/test.yml/badge.svg)](https://github.com/jiangjie/happy-rusty/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/happy-rusty/graph/badge.svg)](https://codecov.io/gh/JiangJie/happy-rusty)

---

## 支持的特性

- [Option](https://doc.rust-lang.org/core/option/index.html)
- [Result](https://doc.rust-lang.org/core/result/index.html)

## 安装

```sh
# via pnpm
pnpm add happy-rusty
# or via yarn
yarn add happy-rusty
# or just from npm
npm install --save happy-rusty
# via JSR
jsr add @happy-js/happy-rusty
# for deno
deno add @happy-js/happy-rusty
# for bun
bunx jsr add @happy-js/happy-rusty
```

接下来就可以在代码里引用了。

```ts
import { Some, None, Ok, Err } from 'happy-rusty';
```

## [示例](examples/main.ts)

- [Option](examples/option.ts)
- [AsyncOption](examples/option.async.ts)
- [Result](examples/result.ts)
- [AsyncResult](examples/result.async.ts)

## [文档](docs/README.md)