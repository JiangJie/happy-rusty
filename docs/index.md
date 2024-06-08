**happy-rusty** • **Docs**

***

# happy-rusty

## Interfaces

| Interface | Description |
| :------ | :------ |
| [Option](interfaces/Option.md) | option::Option type |
| [Result](interfaces/Result.md) | result::Result type |

## Type Aliases

| Type alias | Description |
| :------ | :------ |
| [AsyncIOResult](type-aliases/AsyncIOResult.md) | Represents an asynchronous I/O operation that yields a `Result<T, Error>`. This is a promise that resolves to `Ok(T)` if the I/O operation was successful, or `Err(Error)` if there was an error. |
| [AsyncOption](type-aliases/AsyncOption.md) | Represents an asynchronous operation that yields an `Option<T>`. This is a promise that resolves to either `Some(T)` if the value is present, or `None` if the value is absent. |
| [AsyncResult](type-aliases/AsyncResult.md) | Represents an asynchronous operation that yields a `Result<T, E>`. This is a promise that resolves to `Ok(T)` if the operation was successful, or `Err(E)` if there was an error. |
| [IOResult](type-aliases/IOResult.md) | Represents a synchronous operation that yields a `Result<T, Error>`. This is a result that is either `Ok(T)` if the operation was successful, or `Err(Error)` if there was an error. |
| [None](type-aliases/None.md) | Represents the absence of a value in an `Option` type. This type alias is useful when you want to explicitly denote the `None` case of an `Option` without specifying the type of value that could be present. It is a subtype of `Option<any>`, which means it can be used in place of an `Option<T>` for any type `T`. |

## Variables

| Variable | Description |
| :------ | :------ |
| [None](variables/None.md) | A constant representing the `None` case of an `Option`, indicating the absence of a value. This constant is frozen to ensure it is immutable and cannot be altered, preserving the integrity of `None` throughout the application. |

## Functions

| Function | Description |
| :------ | :------ |
| [Err](functions/Err.md) | Creates a `Result<T, E>` representing a failed outcome containing an error. This function is used to construct a `Result` that signifies the operation failed by containing the error `E`. |
| [Ok](functions/Ok.md) | Creates a `Result<T, E>` representing a successful outcome containing a value. This function is used to construct a `Result` that signifies the operation was successful by containing the value `T`. |
| [Some](functions/Some.md) | Creates an `Option<T>` representing the presence of a value. This function is typically used to construct an `Option` that contains a value, indicating that the operation yielding the value was successful. |
| [promiseToResult](functions/promiseToResult.md) | Converts a Promise to a Result type, capturing the resolved value in an `Ok`, or the error in an `Err`. This allows for promise-based asynchronous operations to be handled in a way that is more in line with the Result pattern. |
