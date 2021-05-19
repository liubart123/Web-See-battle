export var varV = 0;
export let letV = 0;
export const constV = 0;
export let func = (param)=>{
    if (param){
        varV+=param;
        letV+=param;
    }else {
        varV++;
        letV++;
    }
}
