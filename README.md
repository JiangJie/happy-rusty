# Use Rust features in JavaScript happily

## Partial supported

* [option](https://doc.rust-lang.org/core/option/index.html)
* [result](https://doc.rust-lang.org/core/result/index.html)

## More is coming

## Installation

Via [JSR](https://jsr.io/@happy-js/happy-rusty)(**recommand**)
```
npx jsr add @happy-js/happy-rusty
```

or just from npm
```
npm install --save happy-rusty
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
import { Some, None, Ok, Err } from '@happy-js/happy-rusty';
```

Enjoy the happiness.

## Examples

```ts
import { Some, None, Ok, Err } from '@happy-js/happy-rusty';

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