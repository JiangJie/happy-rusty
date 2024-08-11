import { None, type Option, Some } from '../src/mod.ts';

function getSomeNumber(): Option<number> {
    // maybe 0~9 or None
    return Math.random() > 0.2 ? Some(Math.floor(Math.random() * 10)) : None;
}

const wrapped = (await (await getSomeNumber()
    .inspect(x => {
        console.log(`Some value is ${ x }`);
    })
    .andThenAsync(async x => {
        return x === await Promise.resolve(0) ? Some(true) : None;
    }))
    .inspect(x => {
        console.assert(x);
    })
    .orElseAsync(async () => {
        return Some(await Promise.resolve(false));
    }))
    .inspect(x => {
        console.log(`after orElseAsync value is ${ x }`);
    })
    .map(x => {
        return {
            success: x,
        };
    })
    .unwrap();

console.log(wrapped);