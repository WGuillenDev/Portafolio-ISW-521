import{Animal} from "./Animal.js";
export class Perro extends Animal{
    constructor(nombre, especie, raza, edad){
        super(nombre, especie);
        this.raza = raza;
        this.edad = edad;
    }

    ladrar(){
        console.log(`El perro llamado ${this.nombre} esta ladrando`);
    }
    comer(){
        console(`El perro llamado ${this.nombre} esta comiendo`);
    }
}