#!/usr/bin/env shjs

require('shelljs/global');

function processResult(stdout) {  
    var lines = stdout.toString().split('\n');
    var results = new Array();
    lines.forEach(function(line) {
    	if(line == 'done'){
    		return = 1;
    	}
    });
    return 0;
};

var test = '';

var quit = 0;

// while(1){
	console.log('starting........');
	var done = exec('./test_program /dev/ttyUSB0 > test.txt');
	// first argument of process is the quantize multiple
	// second argument of process is the angle offset
	var done = exec('./process 10 -7 > processed.txt');
	var done = exec('python plot.py');
// }
