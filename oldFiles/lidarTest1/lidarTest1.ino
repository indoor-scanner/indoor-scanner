#include "newStep.h"
#include "scan.h"
#include "I2C.h"


scan scan1;
stepMotor motor1;

void setup(){
  
   scan1.scanBegin();
    //int output_pins[] = {8,9,10,11};
    int output_pins[] = {A0, A1, A2, A3};
    pinMode(output_pins[0], OUTPUT);
    pinMode(output_pins[1], OUTPUT);
    pinMode(output_pins[2], OUTPUT);
    pinMode(output_pins[3], OUTPUT);
    Serial.begin(115200); //Opens serial connection at 115200bps.     
   //I2c.begin(); // Opens & joins the irc bus as master
   //delay(100); // Waits to make sure everything is powered up before sending or receiving data  
   //I2c.timeOut(50); // Sets a timeout to ensure no locking up of sketch if I2C communication fails
}

void loop(){   
  Serial.print("+");
  motor1.setSpeed(15);
// spins counter clockwise for 1 revolution
  motor1.step(201);

  delay(1000);
// spins clockwise for 1 revolution to untangle wires
  motor1.step(-201);

  delay(1000);
  Serial.print("*");

  // int distance = scan1.getDistance();
  // Serial.println(distance);

}

