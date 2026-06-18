/*console.log("Hola");


//Pruebas de var
if(true){
    var edad = 25;
    }
console,log("Utilizacion de variable Var");
console.log(edad);

//Pruebas de let
if(true){
    let puntos = 100;
    console.log(puntos);
}
console.log(puntos); // error

//pruebas de const
const PI = 3.14159;
PI = 3;


const v8 = require("v8");

const miVariable = {
    nombre = "Jose",
    version: 2026 
};
//ver cuanto consume en memoria
const tamano = v8.serialize(miVariable).length;
console.log(`El tamano de la variable es: ${tamano} bytes`); //interpolacion $:



const readline = require("readline/promises"); //promise: trae la version mas reciente el promises

const {stdin: input, stdin: output} = require("process");

const rl = readline.createInterface({input, output});

async function iniciar(){
    const nombre = await rl.question("Digite su nombre: ");
    if(validadDatos(nombre)){
        console.log(`El nombre digitado es: ${nombre}`);
    }else{
        console.log("Lo que digitaste no son letras");
    }
    
    rl.close();
}
function validaDatos(nombre){
    const expresion = /^[a-zA-Z] + $/;
    const nombreValido = expresion.test(nombre); // solo usar test para expresiones irregulares
    if(nombreValido){
        return true;
    }else{
        return false;
    }
}
iniciar();
*/
//De una 1  a 12 niños de 13 a 17 jovenes, 18 en adelantes viejo


//Actividad de validar edad
let edad = 15;

const categoria = edad >= 1 && edad <= 12?  "Categoria niño": edad <= 17? "Joven":"Adulto";
console.log(categoria); 

//Actividar mes de año
const dia = 1
switch(dia){
    case 1: 
        console.log("Enero");
        break;
    case 2: 
        console.log("febrero");
        break;
    case 3: 
        console.log("marzo");
        break;
    case 4: 
        console.log("abril");
        break;
    case 5: 
        console.log("mayo");
        break;
    case 6: 
        console.log("junio");
        break;
    case 7: 
        console.log("julio");
        break;
    case 8: 
        console.log("agosto");
        break;
    case 9: 
        console.log("septiembre");
        break;
    case 10: 
        console.log("octubre");
        break;
    case 11: 
        console.log("noviembre");
        break;
    case 9: 
        console.log("diciembre");
        break;
    default: 
    console.log("Mes no valido");
}






