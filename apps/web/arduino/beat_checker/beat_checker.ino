const int sensorPin=0;
const int threshold_down= 500;
const int threshold_up= 500;//500 ?
bool pressed = false;
int led = 13;
int readings[] = { 0, 1, 0, 5 };
float slope = 0.0;
int n =0;
int pt=0;

void setup() {
//usbMIDI.begin(MIDI_CHANNEL_OMNI);
pinMode(led, OUTPUT);
Serial.begin(115200);
float slope = (float)(readings[1]-readings[0])/(readings[3]-readings[2]);
}

void loop() {





  //  calcSlope();  
  //  Serial.println(slope);
  int val= analogRead(sensorPin);
  Serial.println(val);
  if(val > threshold_down && pressed == false){
    digitalWrite(led, HIGH);
    pressed = true;
    usbMIDI.sendNoteOn(112, 127, 1);
    delay(25);  
  }

  if(val < threshold_up && pressed == true){
    
    pressed = false;
    digitalWrite(led, LOW);
  }
  delay(7);
}

void calcSlope(){
  pt = n%4;
  if(pt == 0){
    readings[0] = n;
    }else if(pt == 1){
      readings[1] = analogRead(sensorPin);
    }else if(pt == 2){
      readings[2] = n;
    }else if(pt == 3){
      readings[3] = analogRead(sensorPin);  
    }   
  
  slope = (float)(readings[3]-readings[1])/(readings[2]-readings[0]);
  n+=1;
}
