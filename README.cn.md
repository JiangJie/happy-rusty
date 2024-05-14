# 在JavaScript中使用Rust特性

[![NPM version](http://img.shields.io/npm/v/happy-rusty.svg)](https://npmjs.org/package/happy-rusty)
[![JSR Version](https://jsr.io/badges/@happy-js/happy-rusty)](https://jsr.io/@happy-js/happy-rusty)
[![JSR Score](https://jsr.io/badges/@happy-js/happy-rusty/score)](https://jsr.io/@happy-js/happy-rusty/score)
[![Build Status](https://github.com/jiangjie/happy-rusty/actions/workflows/test.yml/badge.svg)](https://github.com/jiangjie/happy-rusty/actions/workflows/test.yml)

---

## 部分支持的特性

* [option](https://doc.rust-lang.org/core/option/index.html)
* [result](https://doc.rust-lang.org/core/result/index.html)

## 更多特性敬请期待

## 安装

pnpm
```
pnpm add happy-rusty
```

yarn
```
yarn add happy-rusty
```

npm
```
npm install --save happy-rusty
```

通过 JSR
```
jsr add @happy-js/happy-rusty
```

通过 deno
```
deno add @happy-js/happy-rusty
```

通过 bun
```
bunx jsr add @happy-js/happy-rusty
```

接下来就可以在代码里引用了。
```ts
import { Some, None, Ok, Err } from 'happy-rusty';
```

## 示例

```ts
import { Some, None, Ok, Err } from 'happy-rusty';

function judge(n: number): Option<Promise<Result<number, Error>>> {
    if (n < 0 || n >= 1) {
        return None;
    }

    return Some(new Promise(resolve => {
        const r = Math.random();
        resolve(r > n ? Ok(r) : Err(new Error('lose')));
    }));
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