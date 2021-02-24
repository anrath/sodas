const test = 3;
let sentence = 'Hello.';
if (test > 2) {
    console.log(sentence);
}

const add = (num1: number, num2: number) => {
    return num1 + num2;
}

const concat = (str1: string, str2: string) => {
    return str1 + str2;
}

const testFunc = (condition: boolean): string | number => {
    if (condition) return 'string';
    else return 42;
}

const list: number[] = [4, 2, 3, 56, 6, 69, 420];
const strList: string[] = ['42'];
const varyingList: (string | number | boolean)[] = ['hello', 42, true];

const obj: ObjType = {
    hello: 3,
    list: [1, 23, 4, 5]
};

interface ObjType {
    hello: number;
    list: number[];
};

interface User {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email: string;
};

console.log(concat('4', '3'));