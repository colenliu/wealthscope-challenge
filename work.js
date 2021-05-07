/**
 
The csv file "test_returns.csv" contains monthly returns for 3 stocks
over a two-year period. The first new lines of the file look like this:


ticker,date,monthly_return
AAPL,2019-01-31,0.0552
AAPL,2019-02-28,0.0448
AAPL,2019-03-31,0.097


i. Write a program that reads the data from the csv file and creates a
new csv file in which each row contains the stock's highest return in
each year. The output file should have three columns with "ticker",
"year", and "highest_return" as the headers.

// [[“AAPL”,”2019-01-31”,”0.0552”],[“AAPL”,”2019-02-28”,”0.0448”],[“AAPL”,”2019-03-31”,”0.097”]]


 * ii. Write a program that reads the data from the csv file and creates a new csv file in which each row contains a stock's maximum draw-up for each year. A maximum draw-up is the maximum observed gain from a trough to a peak.
Given the three rows in the sample subset, the csv file should contain AAPL,2019,0.197.
 */
const csv = require("csv-parser");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "max_returns.csv",
  header: [
    { id: "name", title: "Name" },
    { id: "year", title: "Year" },
    { id: "price", title: "Price" },
  ],
});

const csvWriter2 = createCsvWriter({
  path: "max_drawups.csv",
  header: [
    { id: "name", title: "Name" },
    { id: "year", title: "Year" },
    { id: "price", title: "Price" },
  ],
});

/**
 *
 * @param {*} csvData
 */
const highestAnnual = function (csvData) {
  const results = [];
  let obj = {};

  fs.createReadStream(csvData)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      // TODO: change to uniqueCompany and uniqueName
      const unique = [
        ...new Set(
          results.map(
            (result) => result[`ticker`] + result[`date`].substring(0, 4)
          )
        ),
      ];

      let arr = [];

      for (x = 0; x < unique.length; x++) {
        let newTicker = JSON.stringify(unique[x]).substring(1, 5);
        let newDate = JSON.stringify(unique[x]).substring(5, 9);
        let test2 = results.filter(function (v, i) {
          return (
            v["ticker"] == `${newTicker}` &&
            v[`date`].substring(0, 4) == `${newDate}`
          );
        });

        arr.push(test2);
      }

      let allMaxes = [];

      for (let i = 0; i < arr.length; i++) {
        allMaxes.push(findMax(arr[i], arr.length));

        for (let j = 0; j < arr[i].length; j++) {
          let ticker = arr[i][j][`ticker`];
          let year = arr[i][j][`date`].substring(0, 4);

          if (!obj.hasOwnProperty(`${ticker}${year}`)) {
            obj[`${ticker}${year}`] = allMaxes[i];
          }
        }
      }

      let newObj = Object.keys(obj).reduce((acc, curr) => {
        let name = JSON.stringify(curr).substring(1, 5);
        let year = JSON.stringify(curr).substring(5, 9);

        return [...acc, { name: name, year: year, price: obj[curr] }];
      }, []);

      csvWriter
        .writeRecords(newObj)
        .then(() => console.log("The CSV file was written successfully"));
    });
};

/**
 *
 * @param {*} csvData
 */
const highestDrawUp = function (csvData) {
  const results = [];
  let obj = {};

  fs.createReadStream(csvData)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      // TODO: change to uniqueCompany and uniqueName
      const unique = [
        ...new Set(
          results.map(
            (result) => result[`ticker`] + result[`date`].substring(0, 4)
          )
        ),
      ];

      let arr = [];

      for (x = 0; x < unique.length; x++) {
        let newTicker = JSON.stringify(unique[x]).substring(1, 5);
        let newDate = JSON.stringify(unique[x]).substring(5, 9);
        let test2 = results.filter(function (v, i) {
          return (
            v["ticker"] == `${newTicker}` &&
            v[`date`].substring(0, 4) == `${newDate}`
          );
        });

        arr.push(test2);
      }

      let allMaxes = [];

      for (let i = 0; i < arr.length; i++) {
        allMaxes.push(findDrawUp(arr[i]));

        for (let j = 0; j < arr[i].length; j++) {
          let ticker = arr[i][j][`ticker`];
          let year = arr[i][j][`date`].substring(0, 4);

          if (!obj.hasOwnProperty(`${ticker}${year}`)) {
            obj[`${ticker}${year}`] = allMaxes[i];
          }
        }
      }

      let newObj = Object.keys(obj).reduce((acc, curr) => {
        let name = JSON.stringify(curr).substring(1, 5);
        let year = JSON.stringify(curr).substring(5, 9);

        return [...acc, { name: name, year: year, price: obj[curr] }];
      }, []);

      csvWriter2
        .writeRecords(newObj)
        .then(() => console.log("The CSV file was written successfully"));
    });
};

/**
 *
 * @param {*} data
 * @param {*} arrLength
 * @returns max
 */
const findMax = function (data, arrLength) {
  let max = Number.MIN_VALUE;

  for (let i = 0; i < data.length; i++) {
    max = Math.max(max, data[i][`monthly_return`]);
  }

  return max;
};

/**
 *
 * @param {*} data
 * @returns
 */
const findDrawUp = function (data) {
  let max = 0;
  let min = Number.MAX_VALUE;

  for (let i = 0; i < data.length; i++) {
    let monthly = data[i][`monthly_return`];
    if (monthly < min) {
      min = monthly;
    } else {
      max = Math.max(max, monthly - min);
    }
  }

  return max.toFixed(4);
};

highestAnnual("test_returns.csv");
highestDrawUp("test_returns.csv");
