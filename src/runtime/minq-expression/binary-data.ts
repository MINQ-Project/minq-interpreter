import { readFileSync, writeFileSync } from 'fs';
import { BooleanVal, NumberVal, RuntimeVal, StringVal } from '../values';

export default class BinaryData {
    private buffer: Uint8Array = new Uint8Array();

    appendRuntimeVal(value: RuntimeVal) {
        switch(value.type) {
            case 'string':
                this.appendString((value as StringVal).value)
            case 'number':
                this.appendNumber((value as NumberVal).value)
            case 'boolean':
                this.appendBool((value as BooleanVal).value);
            default:
                throw "ERROR: cannot write type '" + value.type + "' to binary data"
        }
    }

    appendNumber(value: number) {
        const isInt = Number.isInteger(value);
        this.appendBool(isInt);
        const newBuffer = new ArrayBuffer(4);
        if (isInt) {
            new DataView(newBuffer).setInt32(0, value);
        } else {
            new DataView(newBuffer).setFloat32(0, value);
        }
        this.buffer = this.concatBuffer(this.buffer, new Uint8Array(newBuffer));
    }

    appendString(value: string) {
        const strLen = value.length;
        this.appendNumber(strLen); // true indicates that the length is an integer
        for (let i = 0; i < strLen; i++) {
            this.buffer = this.concatBuffer(this.buffer, new Uint8Array([value.charCodeAt(i)]));
        }
    }

    appendBool(value: boolean) {
        this.buffer = this.concatBuffer(this.buffer, new Uint8Array([value ? 1 : 0]));
    }

    readFromFile(filename: string) {
        const fileBuffer = readFileSync(filename);
        this.buffer = new Uint8Array(fileBuffer.buffer);
    }

    writeToFile(filename: string) {
        writeFileSync(filename, this.buffer);
    }

    private concatBuffer(buffer1: Uint8Array, buffer2: Uint8Array) {
        const tmp = new Uint8Array(buffer1.length + buffer2.length);
        tmp.set(buffer1, 0);
        tmp.set(buffer2, buffer1.length);
        return tmp;
    }
}
