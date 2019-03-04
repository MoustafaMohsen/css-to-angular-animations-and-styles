import {trigger,state,style,animate,transition, group,keyframes} from "@angular/animations";
  export const JSONCSS={
    class:{"height-100":style({'height':'*'}),"height-0":style({'height':'*'})},
    Animations:{"decreaseHeight":keyframes([style({'transform':'translateY(0%) scale(1)','opacity':1,'height':'*','offset':0}),style({'transform':'translateY(100%) scale(0)','opacity':0,'offset':1})])}
}