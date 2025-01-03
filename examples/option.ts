import { None, type Option, Some } from '../src/mod.ts';

function getSomeNumber(): Option<number> {
    // maybe 0~9 or None
    return Math.random() > 0.2 ? Some(Math.floor(Math.random() * 10)) : None;
}

const wrapped = getSomeNumber()
    .inspect(x => {
        console.log(`Some value is ${ x }`);
    })
    .andThen(x => {
        return x === 0 ? Some(true) : None;
    })
    .inspect(x => {
        console.assert(x);
    })
    .orElse(() => {
        return Some(false);
    })
    .inspect(x => {
        console.log(`after orElse value is ${ x }`);
    })
    .map(x => {
        return {
            success: x,
        };
    })
    .unwrap();

console.log(wrapped);