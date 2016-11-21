const fs = require('fs');


var appendCSV = function(sources, out) {
  var newCSVContents = '';
  if (Array.isArray(sources)) {
    sources.forEach( (source, index) => {
      newCSVContents += fs.readFileSync(source, 'utf-8') + '\n';
    });
  }
  else {
    newCSVContents += fs.readFileSync(source, 'utf-8') + '\n';
  }

  fs.writeFileSync(out, newCSVContents);
};

var inputFile = (process.argv[2]) ? process.argv[2] : null;
var outputFile = (process.argv[3]) ? process.argv[3] : null;

if (inputFile === null || outputFile === null) {
  console.log('Usage: node convert_vtk_csv.js <input-file> <output-file>');
  process.exit(1);
}

fs.readFile(inputFile, 'utf-8', (err, contents) => {
  if (err) { throw err; }
  // get contents of vtk file starting and ending on vertices
  var validData = contents.slice(contents.indexOf('POINTS'));
  // slice at the next new line
  validData = validData.slice(validData.indexOf('\n'));
  validData = validData.slice(0, validData.indexOf('VERTICES'));
  // split by new line characters and remove empty values
  var lines = validData.split('\n').filter(Boolean);
  var csvData = lines.map( (line, index) => {
    return lineStr = line.replace(/  +/g, ' ').trim().split(' ').join(',');
  });
  fs.writeFile(outputFile, csvData.join('\n'), (err, data) => {
  if (err) { throw err; }
  console.log('saved', outputFile);
  });
});


// appendCSV(['test1.csv', 'test2.csv'], 'fuck.csv');
// append csv
