#ifndef NEWSTEP_H
#define NEWSTEP_H
#include "SF02.h"

class stepMotor{
	public:
		stepMotor();
		stepMotor(SF02 sf02);
		void increaseStep(int currentStep);
		void setSpeed(int desiredSpeed);
		void step(int steps_to_move);
		void debug(int someValue);
	private:
    int output_pins[4];
		int read_iteration;
    int originalRPM;
		int direction;
		int speed;
		unsigned long step_delay;
		int number_of_steps;
		int last_step_angle;
		unsigned long last_step_time;
		int step_number;
		float degree;
		SF02 lidarObject;
};

#endif
