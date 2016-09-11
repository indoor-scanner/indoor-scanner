#include "I2C.h"
#include "scan.h"


scan::scan(){};

void scan::scanBegin(){

	Serial.begin(115200); //Opens serial connection at 9600bps.     
	I2c.begin(); // Opens & joins the irc bus as master
	delay(100); // Waits to make sure everything is powered up before sending or receiving data  
	I2c.timeOut(50); // Sets a timeout to ensure no locking up of sketch if I2C communication fails
}
int scan::getDistance(){

	//scanBegin();

	int testCounter = 0;
        int test = 8;

	uint8_t nackack = 100; // Setup variable to hold ACK/NACK resopnses     
  	while (nackack != 0){ // While NACK keep going (i.e. continue polling until sucess message (ACK) is received )
    	nackack = I2c.write(LIDARLite_ADDRESS,RegisterMeasure, MeasureValue); // Write 0x04 to 0x00
    	// delayMicroseconds(500);
    	delay(1); // Wait 1 ms to prevent overpolling
 	 }

 	byte distanceArray[2]; // array to store distance bytes from read function
  
	// Read 2byte distance from register 0x8f
	nackack = 100; // Setup variable to hold ACK/NACK resopnses     
	while (nackack != 0){ // While NACK keep going (i.e. continue polling until sucess message (ACK) is received )
		nackack = I2c.read(LIDARLite_ADDRESS,RegisterHighLowB, 2, distanceArray); // Read 2 Bytes from LIDAR-Lite Address and store in array
	    // delayMicroseconds(500);
	    delay(1); // Wait 1 ms to prevent overpolling
	  }
	int distance = (distanceArray[0] << 8) + distanceArray[1];  // Shift high byte [0] 8 to the left and add low byte [1] to create 16-bit int
	// Serial.print("This is the value of test counter: ");
	// Serial.print(testCounter);
	// Serial.print("\n");
	return(distance);
}
               

