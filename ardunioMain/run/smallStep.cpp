#include "Arduino.h"
#include "smallStep.h"
//#include "scan.h"


smallMotor::smallMotor(){
  //read_iteration = 0;
	direction = 0;
	speed = 0;
  originalRPM = 0;
	step_delay = 0;
	number_of_steps = 200;
	last_step_angle = 0;
	last_step_time = 0;
	step_number = 0;
	degree = 0;

  pinMode(output_pins[0], OUTPUT);
  pinMode(output_pins[1], OUTPUT);
  pinMode(output_pins[2], OUTPUT);
  pinMode(output_pins[3], OUTPUT);
}
void smallMotor::increaseStep(int currentStep){

	int angleCounter = 0;
	float degreeInc = 0;
  int output_pins[] = {8,9,10,11};
  //int output_pins[] = {A0, A1, A2, A3};
   

	// currently configured for pins 8,9,10,11
        // output_pins[0-3]// 
	switch(currentStep){
		case 0: // 1010
			digitalWrite(output_pins[0], 1);
			digitalWrite(output_pins[1], 0);
			digitalWrite(output_pins[2], 1);
			digitalWrite(output_pins[3], 0);
		break;
		case 1: // 0110
			digitalWrite(output_pins[0], 0);
			digitalWrite(output_pins[1], 1);
			digitalWrite(output_pins[2], 1);
			digitalWrite(output_pins[3], 0);
		break;
		case 2: // 0101
			digitalWrite(output_pins[0], 0);
			digitalWrite(output_pins[1], 1);
			digitalWrite(output_pins[2], 0);
			digitalWrite(output_pins[3], 1);
		break;
		case 3: // 1001
			digitalWrite(output_pins[0], 1);
			digitalWrite(output_pins[1], 0);
			digitalWrite(output_pins[2], 0);
			digitalWrite(output_pins[3], 1);
		break;
	}
        
        
        // reverse: decreases the angle
	if(direction == 0)
		degreeInc = -1.791;
	else if(direction == 1)
		degreeInc = 1.791;

	degree += degreeInc;
  
  //int distance = 0;
	// scan scan1;
  //if(currentStep == 0){
	//  distance = scan1.getDistance();
  //}
  //int distance = 0;
	//Serial.print("Angle: ");
  //Serial.print(degree);
  //Serial.print(", ");
  //Serial.print("Distance: ");
  //Serial.println(distance);
	// Serial.println(degree + " =  degree");

}
void smallMotor::setSpeed(int desiredSpeed) {
        originalRPM = desiredSpeed;
	step_delay = 60L * 1000L * 1000L / number_of_steps / desiredSpeed;
	// step_delay = 60 * 1000 * 1000;
	// debug(step_delay);
}
void smallMotor::step(int steps_to_move) {

  // declare scan object
  //scan scan1;
  // Get current time
  // Get distance from Lidar
  //unsigned long startTime = micros();
  //int distance = scan1.getDistance();
  //unsigned long endTime = micros();
  // compensate for the time it takes to read from lidar
  //step_delay -= (endTime - startTime);

	int steps_left = abs(steps_to_move);
	// int steps_left = 0;

	if(steps_to_move > 0) {
		direction = 1;
	}
	else {
		direction = 0;
	}
	while(steps_left > 0) {
                
		unsigned long current_step_time = micros();
		if(current_step_time - last_step_time >= step_delay){
                        // reset the speed
                        setSpeed(originalRPM);
			last_step_time = current_step_time;
			if(direction == 1){
				step_number++;
				
				if(step_number == number_of_steps)
					step_number = 0;
			
			}
			else{
				if(step_number == 0)
					step_number = number_of_steps;
				step_number--;
			}

      unsigned long startTime = micros();
      //int distance = 0;
      //distance = scan1.getDistance();
      unsigned long endTime = micros();
      // compensate for the time it takes to read from lidar
      //Serial.print("Offset Calculations");
      //Serial.println(endTime - startTime);
      if( (endTime - startTime) > step_delay)
        step_delay = 0;
      else
        step_delay -= (endTime - startTime);
      //Serial.print("This is delay updated ");
      //Serial.println(step_delay);
      if(step_delay < 0)
        step_delay = 0;
      // Serial Print data
      Serial.print(degree);
      Serial.print(", ");
      //Serial.print("Distance: ");
      //Serial.println(distance);
			steps_left--;
      // reset step_delay
			increaseStep(step_number % 4);
		}
	}
}
void smallMotor::debug(int someValue){
	Serial.println(someValue);
}

