import { Err, Ok, type Result } from '../src/mod.ts';

function getResult(): Result<number, number> {
    return Math.random() > 0.2 ? Ok(Math.floor(Math.random() * 10)) : Err(-1);
}

const wrapped = getResult()
    .inspect(x => {
        console.log(`Ok value is ${ x }`);
    })
    .inspectErr(x => {
        console.log(`Err value is ${ x }`);
    })
    .andThen<boolean>(x => {
        return x === 0 ? Ok(true) : Err(x);
    })
    .orElse(x => {
        return x % 2 === 0 ? Ok(true) : Err(x);
    })
    .inspect(x => {
        console.assert(x);
    })
    .map(x => {
        return {
            success: x,
        };
    })
    .or(Ok({
        success: false,
    }))
    .unwrap();

console.log(wrapped);