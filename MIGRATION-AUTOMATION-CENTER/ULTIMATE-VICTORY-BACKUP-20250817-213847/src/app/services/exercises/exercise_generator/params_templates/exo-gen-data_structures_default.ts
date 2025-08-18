
export class Default  {
  public HIDE_CHORD:boolean = true;
  public HIDE_FUNCTION:boolean = true;
  public DEBUG_MODE:boolean = true;
  public json_generated = {
    templates:[]
  };
  public TEMPLATE:string="DEFAULT";
  public rhythm_params:Rhythm_gen_params = {
      right_hand:[
        {name:"whole", duration:3840, proba:50},
        {name:"half half", duration:3840, proba:50},
        {name:"quarter quarter quarter quarter", duration:3840, proba:0},
        {name:"quarter quarter half", duration:3840, proba:0},
        {name:"quarter half quarter", duration:3840, proba:0},
        {name:"half quarter quarter", duration:3840, proba:0},
        {name:"quarter d_half", duration:3840, proba:0},
        {name:"d_half quarter", duration:3840, proba:0},
        {name:"half", duration:1920, proba:0},
        {name:"quarter quarter", duration:1920, proba:0},
        {name:"eights eights eights eights", duration:1920, proba:0},
        {name:"eights eights quarter", duration:1920, proba:0},
        {name:"eights quarter eights", duration:1920, proba:0},
        {name:"quarter eights eights", duration:1920, proba:0},
        {name:"eights d_quarter", duration:1920, proba:0},
        {name:"d_quarter eights", duration:1920, proba:0},
        {name:"quarter", duration:960, proba:0},
        {name:"eights eights", duration:960, proba:0},
        {name:"sixteenth sixteenth sixteenth sixteenth", duration:960, proba:0},
        {name:"sixteenth sixteenth eights", duration:960, proba:0},
        {name:"sixteenth eights sixteenth", duration:960, proba:0},
        {name:"eights sixteenth sixteenth", duration:960, proba:0},
        {name:"sixteenth d_eights", duration:960, proba:0},
        {name:"d_eights sixteenth", duration:960, proba:0}
      ],
      "left_hand":[
        {name:"whole", duration:3840, proba:30},
        {name:"half half", duration:3840, proba:30},
        {name:"half", duration:1920, proba:30},
      ]
    }
  
  public exercise_types_selected:any = {
    reading_untimed:true,
    reading_timed:false,
    hearing:false,
  public measure_types_selected:any = {
    simple_notes_right_hand:false,
    simple_notes_left_hand:false,
    simple_notes_both_hands:true,
    chords_first_beat_lh_and_notes_rh:false,
    intervals:false,
  }
  public global_gen_params:Global_gen_params = {
    duration:1,
    measures:3,
    meter:"4/4",
    clef_G:true,
    clef_F:true,
    clef_OR:false,
    tempo:90,
    sound:true,
    timed:true,
  //tonalities accepted to generate exercise.
  public tonalities_selected:Tonalities = {
    C:true,
    D:false,
    E:false,
    F:false,
    G:false,
    Bb:false
  public modes_selected:Modes = {
    major:true,
    h_minor:false,
    n_minor:false,
    m_minor:false
  // public duration:number=5;
  public chords_gen_params:Chords_gen_params = {
    inversions:{
      _one:true,
      _two:false,
      _three:false,
      _four:false,
    },
    chord_types_major:{
      major:true,
      minor :true,
      dominant :false,
      minor7 :false,
      maj7 :false,
      dim :false,
      hdim :false,
    chord_types_h_minor:{
      major:false,
      minor :false,
      dim7 :true,
      aug :false,
      mMaj7 :false,
      augMaj7 :false,
    chord_types_n_minor:{
    
    chord_types_m_minor:{
      aug :true,
  public notes_gen_params:Notes_gen_params = {
    arpeggios:false,
    one_by_one:false,
}
