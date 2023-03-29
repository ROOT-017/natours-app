// function myFu(y1, y2,...y3) {
//   const [x1,...[result]] = y3;

//   console.log(result)
// }

// const myArr=['rock', 'paper', 'scissors', 'lizard', 'spock'];

// myFu(...myArr);//

// const arr=[]
// try{
//   arr.push('try')
//   throw new Error()
// }catch{
//   arr.push('c')
// }finally{
//   arr.push('f')
// }

// console.log(arr)

// le

// const arr= new Array(2)

// arr[1]=1
// arr[3]=3

// console.log(arr.length)

// console.log("E")

// for( const i of arr){
//   console.log('\t',i)
// }

// generator arrow function

// const gen =  () =>*{

// const str1={
//   name:'str',
//   age: 20,
//   date: new Date(),
// }
// const str={
//   name:'str',
//   age: 20,
//   date: new Date(),
// }

// console.log(JSON.parse(JSON.stringify(str1)))
// console.log(JSON.parse(JSON.stringify(str)))

// (function () {
//   var a = (b = 5);
// })();

// console.log(a);//5

// async function get() {
//   return await Promise.resolve(23);
// }

// const d = get();

// console.log(get());

// function re() {
//   return new Promise(r => {
//     setTimeout(() => {
//       r("resovle");
//     }, 1000);
//   });
// }

// console.log(re());

const t =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MTQ3MjA5OTg0OTY5MWE0NjZlODEwOCIsImlhdCI6MTY3OTU0NjMzNiwiZXhwIjoxNjgyMTM4MzM2fQ.tUhTyZFAdUASpGqKlPt8cJfAoBZofpDpaLMiZCKj6jQ";
const t2 =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MTQ3MjA5OTg0OTY5MWE0NjZlODEwOCIsImlhdCI6MTY3OTU0NjMzNiwiZXhwIjoxNjgyMTM4MzM2fQ.tUhTyZFAdUASpGqKlPt8cJfAoBZofpDpaLMiZCKj6jQ";

console.log(t === t2);
