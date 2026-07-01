/*const persona = {nombre: "pepe", edad:50};
const {edad: anos = 19} = persona 
console.log(anos);

function sumarTodo(...numeros){
    return numeros.reduce((acum, n) => acum + n, 0);
}

console.log(sumarTodo(1, 2, 3, 4, 5, 6, 8 , 9 ,10));
console.log(sumarTodo(5, 10, 15, 20 ));
*/


/*//Spread operator
const original = { nombre: "Equipo A", puntos:10};
const actualizado = {...original, puntos: 15};
console.log(origin.puntos);
console.log(actualizado.puntos);
const numeros = [1,2,3];
const copia = [...numeros, 4];
//optional chaining
const respuesta = {data: }*/

/*//nullish coalescing operator
const descuento = 0;
console.log(descuento || 10);
console.log(descuento ?? 10);
const nombre = "";
console.log(nombre || "inivitado");
console.log(nombre ?? "Invitado");
*/

/*import {sumar, restar} from "./operadores";
console.log(sumar(5,5));
console.log(restar(5,3));*/


/*import{Perro} from "./Perro.js";
const perroUno = new Perro("Firulais", "Mamifero", "Golden", 7);
console.log(perroUno.ladrar());
console.log(perroUno.comer());
*/

class CuentaBancaria{
    constructor(saldoInicial){
        this.saldoInicial = saldoInicial;
    }
    get saldo(){
        return this.saldo;
    }
    set saldo(valor){
        if(valor < 0){
            throw new Error("Saldo no puede ser negativo");
            this.saldo = valor;
        }
    }
}
const cuenta = new CuentaBancaria(1000);
cuenta.saldo = 1500;
console.log(cuenta.saldo);


