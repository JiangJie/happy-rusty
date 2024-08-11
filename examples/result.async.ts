import { Err, Ok, type Result } from '../src/mod.ts';

function getResult(): Result<number, number> {
    return Math.random() > 0.2 ? Ok(Math.floor(Math.random() * 10)) : Err(-1);
}

const wrapped = (await (await getResult()
    .inspect(x => {
        console.log(`Ok value is ${ x }`);
    })
    .inspectErr(x => {
        console.log(`Err value is ${ x }`);
    })
    .andThenAsync<boolean>(async x => {
        return x === await Promise.resolve(0) ? Ok(true) : Err(x);
    }))
    .orElseAsync(async x => {
        return x % 2 === await Promise.resolve(0) ? Ok(true) : Err(x);
    }))
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