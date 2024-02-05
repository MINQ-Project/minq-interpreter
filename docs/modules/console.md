# console
## log: for writing objects.
```ts
import console
console.log({ val: 10, s: true }) // will output object
console.log("Hi!") // output: "Hi!" (with quotes)
```

## write: for writing strings.
```ts
import console
console.write("Hello, world!") // output: Hello, world!
console.write("Hello, world!\n") // we not added newline in previous write so output: Hello, world!Hello, world!<new line>
```

## read_line: input
```ts
import console
console.write("What`s your name?: ")
const name = console.read_line()
console.write(String("Your name is: ", name))
```