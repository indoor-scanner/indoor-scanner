#ifndef SCAN_H
#define SCAN_H

#include "I2C.h"
#define    LIDARLite_ADDRESS   0x62          // Default I2C Address of LIDAR-Lite.
#define    RegisterMeasure     0x00          // Register to write to initiate ranging.
#define    MeasureValue        0x04          // Value to initiate ranging.
#define    RegisterHighLowB    0x8f          // Register to get both High and Low bytes in 1 call.

class scan{
	public:
		scan();
		void scanBegin();
		int getDistance();
	private:
               
};

#endif