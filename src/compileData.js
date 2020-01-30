const XLSX =  require('xlsx');
const path = require('path');
const fs = require('fs');

const mappings = require('./data/mappings.json');
const states = require('./data/states.json');

let data = {};

const source = path.resolve(__dirname, 'data/facts-and-figures.xlsx');
const destination = path.resolve(__dirname, 'data/data.json');
const wb = XLSX.readFile(source);

const mapValues = (table, sheet) => {
  data[table.sheetName] = {};
  data[table.sheetName].values = XLSX.utils.sheet_to_json(sheet, { header: 1, range: table.data, raw: false });
  data[table.sheetName].title = sheet[table.title] ? sheet[table.title].v : null;
  data[table.sheetName].date = sheet[table.date] ? sheet[table.date].v : null;
  data[table.sheetName].notes = sheet[table.notes] ? sheet[table.notes].v : null;
  data[table.sheetName].source = sheet[table.source] ? sheet[table.source].v : null;
  data[table.sheetName].footnotes = sheet[table.footnotes] ? sheet[table.footnotes].v : null;
};

const buildData = () => {
  fs.access(source, err => {
    if (err) throw err;
  });
  mappings.forEach(table => {
    const sheet = wb.Sheets[table.sheetName];
    if (table.data) {
      if (table.skip) {
        // TODO figure out what to do with weird tables
        mapValues(table, sheet);
      } else {
        mapValues(table, sheet);
      }
    }
  });
};

const writeData = () => {
  buildData();
  try {
    console.log('Writing new data to file...');
    fs.writeFileSync(destination, JSON.stringify(data, null, 2));
    console.log('New data created.');
  } catch (err) {
    throw err;
  }
};

fs.access(destination, err => {
  console.log('Deleting old data...');
  if (err) {
    console.log('No data file found, creating from scratch.')
    writeData();
  } else {
    fs.unlink(destination, err => {
      if (err) throw err;
      console.log('Old data deleted.');
      writeData();
    });
  }
});
