**happy-rusty**

***

# happy-rusty

## Interfaces

| Interface | Description |
| ------ | ------ |
| [None](interfaces/None.md) | Represents the absence of a value, as a specialized `Option` type. The type parameter is set to `never` because `None` does not hold a value. |
| [Option](interfaces/Option.md) | Type `Option` represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not. This interface includes methods that act on the `Option` type, similar to Rust's `Option` enum. |
| [Result](interfaces/Result.md) | The `Result` type is used for returning and propagating errors. It is an enum with the variants, `Ok(T)`, representing success and containing a value, and `Err(E)`, representing error and containing an error value. This interface includes methods that act on the `Result` type, similar to Rust's `Result` enum. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [AsyncIOResult](type-aliases/AsyncIOResult.md) | Represents an asynchronous I/O operation that yields a `Result<T, Error>`. This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error. |
| [AsyncOption](type-aliases/AsyncOption.md) | Represents an asynchronous operation that yields an `Option<T>`. This is a promise that resolves to either `Some(T)` if the value is present, or `None` if the value is absent. |
| [AsyncResult](type-aliases/AsyncResult.md) | Represents an asynchronous operation that yields a `Result<T, E>`. This is a promise that resolves to `Ok(T)` if the operation was successful, or `Err(E)` if there was an error. |
| [AsyncVoidIOResult](type-aliases/AsyncVoidIOResult.md) | `VoidIOResult` wrapped by `Promise`. |
| [AsyncVoidResult](type-aliases/AsyncVoidResult.md) | `VoidResult<E>` wrapped by `Promise`. |
| [IOResult](type-aliases/IOResult.md) | Represents a synchronous operation that yields a `Result<T, Error>`. This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error. |
| [VoidIOResult](type-aliases/VoidIOResult.md) | Similar to Rust's `Result<(), Error>`. |
| [VoidResult](type-aliases/VoidResult.md) | Similar to Rust's `Result<(), E>`. |

## Variables

| Variable | Description |
| ------ | ------ |
| [None](variables/None.md) | A constant representing the `None` case of an `Option`, indicating the absence of a value. This constant is frozen to ensure it is immutable and cannot be altered, preserving the integrity of `None` throughout the application. |
| [RESULT\_FALSE](variables/RESULT_FALSE.md) | Result constant for `false`. Can be used anywhere due to immutability. |
| [RESULT\_TRUE](variables/RESULT_TRUE.md) | Result constant for `true`. Can be used anywhere due to immutability. |
| [RESULT\_VOID](variables/RESULT_VOID.md) | Result constant for `void` or `()`. Can be used anywhere due to immutability. |
| [RESULT\_ZERO](variables/RESULT_ZERO.md) | Result constant for `0`. Can be used anywhere due to immutability. |

## Functions

| Function | Description |
| ------ | ------ |
| [Err](functions/Err.md) | Creates a `Result<T, E>` representing a failed outcome containing an error. This function is used to construct a `Result` that signifies the operation failed by containing the error `E`. |
| [isOption](functions/isOption.md) | Checks if a value is an `Option`. |
| [isResult](functions/isResult.md) | Checks if a value is a `Result`. |
| [Ok](functions/Ok.md) | Creates a `Result<T, E>` representing a successful outcome containing a value. This function is used to construct a `Result` that signifies the operation was successful by containing the value `T`. |
| [promiseToAsyncResult](functions/promiseToAsyncResult.md) | Converts a Promise to a Result type, capturing the resolved value in an `Ok`, or the error in an `Err`. This allows for promise-based asynchronous operations to be handled in a way that is more in line with the Result pattern. |
| [Some](functions/Some.md) | Creates an `Option<T>` representing the presence of a value. This function is typically used to construct an `Option` that contains a value, indicating that the operation yielding the value was successful. |
