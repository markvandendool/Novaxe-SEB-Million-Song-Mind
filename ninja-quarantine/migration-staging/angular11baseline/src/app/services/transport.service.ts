import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransportService {

  constructor() { }

  stop(mode: number, force?: boolean) {
    console.log('Transport stop called:', mode, force);
    // Real Novaxe transport logic would go here
    // This is a minimal implementation for migration testing
  }
}
