export interface Tonalities  {
  C:boolean;
  D:boolean;
  E:boolean;
  F:boolean;
  G:boolean;
  Bb:boolean;

}
export interface Modes  {
  major:boolean;
  h_minor:boolean;
  n_minor:boolean;
  m_minor:boolean;
export interface Global_gen_params  {
  duration:number;
  measures:number;
  meter:string;
  clef_G:boolean;
  clef_F:boolean;
  clef_OR:boolean;
  tempo:number;
  sound:boolean;
  timed:boolean;
export interface Chords_gen_params  {
  inversions:{
    _one:boolean;
    _two:boolean;
    _three:boolean;
    _four:boolean;
  },
  chord_types_major:{
    major:boolean;
    minor :boolean;
    dominant :boolean;
    minor7 :boolean;
    maj7 :boolean;
    dim :boolean;
    hdim :boolean;
  chord_types_h_minor:{
    aug :boolean;
    mMaj7 :boolean;
    augMaj7 :boolean;
    dim7 :boolean;
  }
  chord_types_m_minor:{
  chord_types_n_minor:{
export interface Notes_gen_params  {
  arpeggios:boolean;
  one_by_one:boolean;
export interface Rhythm_values  {
  d_whole : boolean,
  whole : boolean,
  d_half : boolean,
  half : boolean,
  d_quarter : boolean,
  quarter : boolean,
  d_eights : boolean,
  eights : boolean,
  d_sixteenth : boolean,
  sixteenth : boolean,
export interface Rhythm_probas {
  d_whole : number,
  whole : number,
  d_half : number,
  half : number,
  d_quarter : number,
  quarter : number,
  d_eights : number,
  eights : number,
  d_sixteenth : number,
  sixteenth : number,
export interface Rhythm_gen_params {
  right_hand : Array<any>,
  left_hand : Array<any>
