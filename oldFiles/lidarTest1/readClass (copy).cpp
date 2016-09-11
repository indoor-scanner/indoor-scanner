#include <SerialStream.h>
#include <iostream>
#include <unistd.h>
#include <cstdlib>
#include <string>

using namespace std;
using namespace LibSerial ;

/*
class serialCom() 
{
}
*/

int main(int argc, char** argv)
{
    if (argc < 2)
    {
        cout << "No arguments given.\n";
        exit(1);
    }        
    //
    // Open the serial port.
    //
    SerialStream serial_port; // Serial port object
    char c;
    //serial_port.Open("/dev/ttyACM0") ;
    serial_port.Open(argv[1]);
    if ( ! serial_port.good() )
    {
        cerr << "[" << __FILE__ << ":" << __LINE__ << "] "
            << "Error: Could not open serial port.\n";
        exit(1);
    }
    //
    // Set the baud rate of the serial port.
    //
    serial_port.SetBaudRate( SerialStreamBuf::BAUD_115200 ) ;
    if ( ! serial_port.good() )
    {
        cerr << "Error: Could not set the baud rate.\n";
        exit(1) ;
    }
    //
    // Set the number of data bits.
    //
    serial_port.SetCharSize( SerialStreamBuf::CHAR_SIZE_8 ) ;
    if ( ! serial_port.good() )
    {
        cerr << "Error: Could not set the character size.\n";
        exit(1) ;
    }
    //
    // Disable parity.
    //
    serial_port.SetParity( SerialStreamBuf::PARITY_NONE ) ;
    if ( ! serial_port.good() )
    {
        cerr << "Error: Could not disable the parity.\n";
        exit(1) ;
    }
    //
    // Set the number of stop bits.
    //
    serial_port.SetNumOfStopBits( 1 ) ;
    if ( ! serial_port.good() )
    {
        cerr << "Error: Could not set the number of stop bits.\n";
        exit(1) ;
    }
    //
    // Turn off hardware flow control.
    //
    serial_port.SetFlowControl( SerialStreamBuf::FLOW_CONTROL_NONE ) ;
    if ( ! serial_port.good() )
    {
        std::cerr << "Error: Could not use hardware flow control."
            << std::endl ;
        exit(1) ;
    }
    //
    // Do not skip whitespace characters while reading from the
    // serial port.
    //
    serial_port.unsetf( std::ios_base::skipws ) ;
    //
    // Wait for some data to be available at the serial port.
    //
    //
    // Keep reading data from serial port and print it to the screen.
    //
    // Wait for some data to be available at the serial port.
    //
    while( serial_port.rdbuf()->in_avail() == 0 )
    {
        usleep(100) ;
    }


    //char out_buf[] = "check";
    //serial_port.write(out_buf, 5);  //<-- First command
    while( true )
    {
        char next_byte;
        serial_port.get(next_byte); // Here, receive the first answer
        // program doesn't start until a '+' has been read
        while(next_byte != '+'){
            serial_port.get(next_byte);
        }
        // program ends when a '*' is read
        while(next_byte != '*'){
            // main loop
            serial_port.get(next_byte);
            if(next_byte != '*' || next_byte != '\r')
                cout << next_byte;
        }
        return EXIT_SUCCESS;
    }
    cout << endl ;
    return EXIT_SUCCESS ;
}
