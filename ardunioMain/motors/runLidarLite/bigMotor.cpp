// #include "Arduino.h"
#include "bigMotor.h"
#include "scan.h"
#include <SoftwareSerial.h>

#define BAUD_RATE 57600

#define LIDAR_RX_PIN    11
#define LIDAR_TX_PIN    12

// SoftwareSerial ss(LIDAR_RX_PIN, LIDAR_TX_PIN);

bigMotor::bigMotor() {
  read_iteration = 0;
  direction = 0;
  int speed = 0;
  originalRPM = 0;
  step_delay = 0;
  number_of_steps = 200; // changed
  last_step_angle = 0;
  last_step_time = 0;
  step_number = 0;
  degree = 0;
  
  pinMode(output_pins[0], OUTPUT);
  pinMode(output_pins[1], OUTPUT);
  pinMode(output_pins[2], OUTPUT);
  pinMode(output_pins[3], OUTPUT);
}

bigMotor::bigMotor(scan lidarLite) {
  read_iteration = 0;
	direction = 0;
	int speed = 0;
  originalRPM = 0;
	step_delay = 0;
	number_of_steps = 200; // 200 for old motor
	last_step_angle = 0;
	last_step_time = 0;
	step_number = 0;
	degree = 0;

  lidarObject = lidarLite;
  // // lidar setup
  pinMode(LIDAR_RX_PIN, INPUT);
  pinMode(LIDAR_TX_PIN, OUTPUT);
  pinMode(A4, INPUT);

  pinMode(output_pins[0], OUTPUT);
  pinMode(output_pins[1], OUTPUT);
  pinMode(output_pins[2], OUTPUT);
  pinMode(output_pins[3], OUTPUT);
}


void bigMotor::increaseStep(int currentStep){
	int angleCounter = 0;
	float degreeInc = 0;
  // int output_pins[] = {8,9,10,11};
  int output_pins[] = {A3, A2, A1, A0};
  // int output_pins[] = {7, 6, 5, 4};
   
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
        
  if (degree >= 358.2) {
    degree = 0;
  }

  // TODO: Complete the directional logic  
  // else if (degree <= -358.2) {
  //   degree = 0;
  // }    

  // reverse: decreases the angle
	if (direction == 0) {
		degreeInc = -1.8;
  }
	else if (direction == 1) {
		degreeInc = 1.8;
  }

	degree += degreeInc;

}

void bigMotor::setSpeed(int desiredSpeed) {
  originalRPM = desiredSpeed;
	step_delay = 60L * 1000L * 1000L / number_of_steps / desiredSpeed;
}

void bigMotor::setLidar(scan lidarLite) {
  lidarObject = lidarLite;
}

void bigMotor::step(int steps_to_move) {
  float distance = 0;
  int timeCount = 0;
	int steps_left = abs(steps_to_move);

  // if steps_to_move is a negative value the motor spins in the
  // counter clockwise direction
	if (steps_to_move > 0) {
		direction = 1;
	}
	else {
		direction = 0;
	}

	while (steps_left > 0) {              
		unsigned long current_step_time = micros();
    // distance = lidarObject.getDistance();
    Serial.println(distance);
		if (current_step_time - last_step_time >= step_delay) {
      // reset the speed and reset the delay
      timeCount++;
      setSpeed(originalRPM);
			last_step_time = current_step_time;
			if (direction == 1) {
				step_number++;
				if (step_number == number_of_steps) {
					step_number = 0;
        }
			}
			else {
				if (step_number == 0) {
					step_number = number_of_steps;
        }
				step_number--;
			}

      // Scanning based on steps
      // ------------------------------
      unsigned long startTime = micros();
      
      distance = lidarObject.getDistance();

      unsigned long endTime = micros();
      // compensate for the time it takes to read from lidar

      if ( (endTime - startTime) > step_delay)  {
        step_delay = 0;
      }
      else {
        step_delay -= (endTime - startTime);
      }

      if(step_delay < 0) {
        step_delay = 0;
      }

      // print data to serial port
      // whitespace
      // Serial.print(" "/);
      Serial.print("Here is the angle: ");
      Serial.println( abs(degree) );
			steps_left--;

      // debugging the time it takes increase the step of the motor
      // unsigned long testTime = micros();
			increaseStep(step_number % 4);
      // Serial.println( (micros() - testTime) );
		}
	}
}

void bigMotor::debug(int someValue) {
	Serial.println(someValue);
}

