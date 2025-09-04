const fs = require('fs');
const csv = require('csv-parser');

// Function to read a CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function compareColumns(data1, data2, columnName) {
  data1.forEach((row, i) => {
    if (data2[i] && row[columnName] !== data2[i][columnName]) {
      console.log(`Row ${i + 1} differs: ${row[columnName]} vs ${data2[i][columnName]}`);
    }
  });
}

function getColumnValues(file, columnName) {
    return new Set(file.map(row => row[columnName]));
}

async function findMissingValues(file1, file2, columnName) {
  const values1 = await getColumnValues(file1, columnName);
  const values2 = await getColumnValues(file2, columnName);

  const missing = [...values1].filter(val => !values2.has(val));
  console.log('Missing values in file2:', missing);
}

// Usage

// Read two CSV files and log output
async function main() {
  try {
    // Read both CSV files
    const [file1Data, file2Data] = await Promise.all([
      readCSV('annual-enterprise-survey-2024-financial-year-provisional.csv'),
      readCSV('annual-enterprise-survey-2024-financial-year-provisional_copy.csv')
    ]);
    
    // Console log the output
    console.log('=== FILE 1 DATA ===');
    //console.log(file1Data);
    
    console.log('\n=== FILE 2 DATA ===');
    //console.log(file2Data);


    //await compareColumns(file1Data, file2Data, 'Value');
    // where first file is the one we want to relate to
    await findMissingValues(file2Data, file1Data, 'Industry_aggregation_NZSIOC');
    
  } catch (error) {
    console.error('Error reading CSV files:', error);
  }
}

// Run the script
main();