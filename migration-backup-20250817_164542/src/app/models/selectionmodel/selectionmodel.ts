import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Songmodel } from '@models/songmodel/songmodel';
import { TransportService } from '@services/transport/transport.service';
import { Measure } from '@models/songmodel/measure';

@Injectable({
  providedIn: 'root'
})
export class SelectionModel implements OnDestroy {

  private selected_list = new Subject<any>();
  public selected_Update$ = this.selected_list.asObservable();
  private selection = new Array<any>();
  private scale = new Subject<any>();

  constructor(private sm: Songmodel, private transport: TransportService) {
    this.selection = [];
    this.selected_list.next(this.selection);
  }

  ngOnDestroy() {
    console.log('%c SELECTION MODEL : OnDestroy()', 'color:red; font-size:20px;');
    this.reset();
  }
  public reset() {
    this.selection = [];
    this.selected_list.next(this.selection);
  }

  public getSelection() {
    return this.selection;
  }

  public setSelection(new_selection: Array<any>, beat?: Number) {
    // this.selection = new_selection.copy();
    this.selection = new_selection;
    if (new_selection[0] == null) new_selection = [];
    this.selected_list.next(this.selection);
  }

  public addSelection(o: any): void {
    this.selection.push(o);
    this.selected_list.next(this.selection);
  }

  public removeFromSelection(o: any): void {

    for (let i = 0; i < this.selection.length; i++)
      if (this.selection[i].id == o.id) this.selection.splice(i, 1);

    this.selected_list.next(this.selection);
  }

  public add_or_remove_Selection(o: any): void {

    let is_already_selected = false;
    for (let s of this.selection) {
      if (s.id == o.id) is_already_selected = true;
    }

    if (is_already_selected && this.selection.length != 1) this.removeFromSelection(o);
    else this.addSelection(o);
    console.log('is_already_selected => ', is_already_selected);
  }

  public select_previous_measure(): any {

    let measure;
    if (!this.selection.length) {
      this.select_first_measure();
      this.transport.setBeat(0);
    } else {

      if (this.selection[0].getType() == 'part') console.warn('cant select part for now');
      measure = this.sm.getPreviousMeasureById(this.selection[0].getId());

      if (measure) {
        this.selection = [measure];
        this.selected_list.next(this.selection);
        this.transport.setMeasure(this.selection[0].getIdx())
        this.transport.setBeat(0);
      }
    }

    return measure;

  }

  public select_next_measure(): any {

    let measure;
    if (!this.selection.length) {
      this.select_first_measure();
      this.transport.setBeat(0);
    } else {
      if (this.selection[0].getType() == 'part') console.warn('cant select part for now');

      measure = this.sm.getNextMeasureById(this.selection[0].getId());

      if (measure) {
        this.selection = [measure];
        this.selected_list.next(this.selection);
        this.transport.setMeasure(this.selection[0].getIdx())
        this.transport.setBeat(0);

      }
    }
    return measure;
  }

  public select_previous_part(): any {

    let measure;
    if (!this.selection.length) this.select_first_measure();
    else {

      if (!this.sm.getMeasures_hash().hasOwnProperty(this.selection[0].getIdx() - 1)) {
        console.warn("error cant select previous part (1)");
        return;
      }

      let cur_measure_h = this.sm.getMeasures_hash()[this.selection[0].id];
      let part = this.sm.getPart(cur_measure_h.part - 1);

      if (part == undefined) {
        this.sm.getPart(cur_measure_h.part)
        console.warn("error cant select previous Part => getting current part begining.");
        part = this.sm.getPart(cur_measure_h.part);
      }
      measure = part.getMeasure(0);
      this.selection = [measure];
      this.selected_list.next(this.selection);
    }
    return measure;
  }

  public select_next_part(): any {

    let measure;
    if (!this.selection.length) this.select_first_measure();
    else {
      if (!this.sm.getMeasures_hash().hasOwnProperty(this.selection[0].getIdx())) {
        console.warn("error cant select next part (2)");
        return;
      }

      let cur_measure_h = this.sm.getMeasures_hash()[this.selection[0].id];

      let part = this.sm.getPart(cur_measure_h.part + 1);

      if (part == undefined) {
        console.warn("error cant select next Part (2)");
        return;
      }

      measure = part.getMeasure(0);
      this.selection = [measure];
      this.selected_list.next(this.selection);
    }
    return measure;
  }

  public select_first_measure(): Measure | null {
    if (!this.sm.getPart(0)) {
      console.warn("Error, no first measure to select.")
      return null;
    }
    let m = this.sm.getPart(0).getMeasure(0);
    this.selection.push(m)
    this.selected_list.next(this.selection);

    return m;

  }

  public select_part(p: number): void {
    this.selection = [this.sm.getPart(p).getMeasure(0)];
    this.selected_list.next(this.selection)
  }

  public select_all_part(p: number): void {
    this.selection = this.sm.getPart(p).getMeasures();
    this.selected_list.next(this.selection)
  }

  public select_current_part(): void {
    if (!this.selection.length) {
      console.warn('select_current_part() => no measure selected.');
      return;
    }

    if (this.selection[0].getType() == 'measure') {

      let measure_h = this.sm.getMeasures_hash()[this.selection[0].id];
      this.select_all_part(measure_h.part);
      // debugger

    } else if (this.selection[0].getType() == 'part') {

    }
  }


  // RETURN THE HASH OF LAST DELETION (FIRST IN TIME) 
  public deleteSelection(): any {
    let H = this.sm.getMeasures_hash();
    let h;

    if (this.selection.length == 0) return;

    let h0 = this.sm.getNextMeasureById(this.selection[this.selection.length - 1].getId());
    if (!h0) h0 = this.sm.getPreviousMeasureById(this.selection[0].getId());

    for (let m = this.selection.length - 1; m >= 0; m--) {
      h = H[this.selection[m].getId()];
      let meas = h.meas;
      let part = h.part;
      console.log('Deleting measure at part : ', part, ' measure :', meas)
      this.sm.deleteMeasure(part, h.meas);
    }

    this.setSelection([h0]);

    return h0;
  }
  public getUpdateScale(): Observable<any> {
    return this.scale.asObservable();
  }

  public updateSelection() {
    this.selected_list.next(this.selection);
  }

}
