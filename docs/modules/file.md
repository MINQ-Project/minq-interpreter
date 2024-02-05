# file
## read: reads a file.
```ts
import file
import console // check console module documentation for details
const content = file.read("hi.txt")
console.write(content) // outputs content of hi.txt file
```

## write: writes to a file.
```ts
import file
file.write("hi.txt", "Hello, world!")
```

## append: appends content to a file.
```ts
import file
file.append("hi.txt", "\nHello, AmongUs!")
```