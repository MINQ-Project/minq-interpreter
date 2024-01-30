# importing modules
in minq you can import modules in big amount of options
## build-in modules
importing build-in modules in minq can be done using:
* import statement:
  ```js
  import console
  console.write("hello, world!\n")
  ```
* `get_module` function:
  ```js
  const console = get_module("console")
  console.write("hello, world!\n")
  ```
fun fact: you can add `as` keyword into import statement to change name of module in code:
```js
import console as cons
cons.write("hello, world!\n")
```
## other minq files
you wroten a module in `my-module.mq` file:
```js
module MyModule {
    class OneClass {
        function constructor(val) {
            // create a object
            {
                val: val
            }
        }

        function getVal(val) {
            return val;
        }
    }
    function OneClassToString(obj) {
        to_string(obj.val)
    }
}

// export module
MyModule
```
and you want to use it in main.mq.
you can use `require` function from `file` module:
```js
import file as f
import console
const MyModule = f.require("my-module.mq")
var object = MyModule.OneClass(128.1)
console.log(object)
console.log(MyModule.OneClassToString(object))
```
## thats it!