#include "SF02.h"
#include <SoftwareSerial.h>


#define TERMINAL_MONITOR_BAUDRATE  115200

// Arduino Pin Definitions - Set these to whatever suits your Ardunio configuration.
#define SERIAL_RX_PIN      8
#define SERIAL_TX_PIN      9

SF02 sf02;
SoftwareSerial sf02Serial(SERIAL_RX_PIN, SERIAL_TX_PIN);

/*
  In this example. We setup communications with the SF02 using 
  the SoftwareSerial interface. If no interface is specified, the
  default hardware serial interface will be used.
  
  An on-demand request for a distance reading can then eaily 
  be made from the SF02 module, by simply calling getDistance()
  on the SF02 instance.
*/

void setup()
{
  pinMode(SERIAL_RX_PIN, INPUT);
  pinMode(SERIAL_TX_PIN, OUTPUT);
  pinMode(11, INPUT);
  Serial.begin(9600);
  Serial.flush();
  sf02.setAuxUartBaudRate(9600);
  sf02Serial.begin(9600);
  sf02Serial.flush();
  sf02.begin(sf02Serial);
  sf02Serial.flush();
}

void loop()
{
  Serial.print("Distance: ");
  Serial.print(sf02.getDistance(100));
  Serial.println(" m");
}
