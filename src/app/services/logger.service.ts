import { Injectable } from "@angular/core";

@Injectable({
    providedIn:'root',
})

export class LoggerService{
    log(msg:any){
        console.log(msg);
    }
    
}