# Use Rust features in JavaScript happily

[![NPM version](https://img.shields.io/npm/v/happy-rusty.svg)](https://npmjs.org/package/happy-rusty)
[![NPM downloads](https://badgen.net/npm/dm/happy-rusty)](https://npmjs.org/package/happy-rusty)
[![JSR Version](https://jsr.io/badges/@happy-js/happy-rusty)](https://jsr.io/@happy-js/happy-rusty)
[![JSR Score](https://jsr.io/badges/@happy-js/happy-rusty/score)](https://jsr.io/@happy-js/happy-rusty/score)
[![Build Status](https://github.com/jiangjie/happy-rusty/actions/workflows/test.yml/badge.svg)](https://github.com/jiangjie/happy-rusty/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/JiangJie/happy-rusty/graph/badge.svg)](https://codecov.io/gh/JiangJie/happy-rusty)

---

<a href="README.cn.md">[中文]</a>

---

## Partial supported

-   [option](https://doc.rust-lang.org/core/option/index.html)
-   [result](https://doc.rust-lang.org/core/result/index.html)

### More is coming

## Installation

via pnpm

```
pnpm add happy-rusty
```

or via yarn

```
yarn add happy-rusty
```

or just from npm

```
npm install --save happy-rusty
```

via JSR

```
jsr add @happy-js/happy-rusty
```

for deno

```
deno add @happy-js/happy-rusty
```

for bun

```
bunx jsr add @happy-js/happy-rusty
```

then import to your code.

```ts
import { Some, None, Ok, Err } from 'happy-rusty';
```

Enjoy the happiness.

## Examples

```ts
import { Some, None, Ok, Err } from 'happy-rusty';

function judge(n: number): Option<Promise<Result<number, Error>>> {
    if (n < 0 || n >= 1) {
        return None;
    }

    return Some(
        new Promise((resolve) => {
            const r = Math.random();
            resolve(r > n ? Ok(r) : Err(new Error('lose')));
        })
    );
}

const res = judge(0.8);
if (res.isNone()) {
    console.error('invalid number');
} else {
    const result = await res.unwrap();
    if (result.isErr()) {
        console.assert(result.err().message === 'lose');
    } else {
        console.log(result.unwrap()); // must greater than 0.8
    }
}
```
