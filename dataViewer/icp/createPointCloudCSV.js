const fs = require('fs');

var convertSphericalToCartesian = function(pointString) {
  var stringArr = pointString.split(' ').filter(Boolean);
  var radius = stringArr[0] * 0.01;
  var theta = stringArr[1] * Math.PI / 180; 
  var phi = stringArr[2] * Math.PI / 180;
  var point = [
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta),
  ];

  return point.toString();
};

var inputDir = (process.argv[2]) ? process.argv[2] : 'raw_scans/';
var outputDir = (process.argv[3]) ? process.argv[3] : 'csv_scans/';

var inputFiles = fs.readdirSync(inputDir).map( (fileName) => { 
  return fileName.split('.')[0];
});

var currentCSVFiles = fs.readdirSync(outputDir).map( (fileName) => { 
  return fileName.split('.csv')[0];
});

var validFileNames = inputFiles.filter( (fileName) => {
  return (currentCSVFiles.indexOf(fileName) < 0);
});

var filesToWrite = validFileNames.map( (fileName) => {
  return fileName + '.csv';
});

filesToWrite.forEach( (fileName) => {
  var contents = fs.readFileSync(inputDir + '/' + fileName.split('.csv')[0] + '.txt', 'utf-8');
  var lines = contents.split(/\r?\n/);
  lines.forEach( (line, index) => {
    if (line.replace(/\r?\n | \s/g).length > 0) {
      var stuffToWrite = convertSphericalToCartesian(line);
      if (index != (lines.length - 1)) {
        stuffToWrite += '\n';
      }
      fs.appendFileSync(outputDir + '/' + fileName, stuffToWrite, 'utf-8');
    }
  });
});
