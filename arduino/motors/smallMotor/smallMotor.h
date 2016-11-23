// small stepper motor class

#ifndef SMALLMOTOR_H
#define SMALLMOTOR_H
#include "SF02.h"
#include <SoftwareSerial.h>

class smallMotor{
	public:
		smallMotor();
		smallMotor(SF02 sf02);
		void increaseStep(int currentStep);
		void setSpeed(int desiredSpeed);
		void setLidar(SF02 sf02);
		void step(int steps_to_move);
		void debug(int someValue);
	private:
    int output_pins[4];
		int read_iteration;
    int originalRPM;
		int direction;
		int speed;
		unsigned long step_delay;
		unsigned long number_of_steps;
		int last_step_angle;
		unsigned long last_step_time;
		unsigned long step_number;
		float degree;
		SF02 lidarObject;
};

#endif
