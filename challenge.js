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

SAMPLE SUBSET: [[“AAPL”,”2019-01-31”,”0.0552”],[“AAPL”,”2019-02-28”,”0.0448”],[“AAPL”,”2019-03-31”,”0.097”]]

ii. Write a program that reads the data from the csv file and creates a new csv file 
in which each row contains a stock's maximum draw-up for each year. A maximum draw-up is 
the maximum observed gain from a trough to a peak. Given the three rows in the sample subset, 
the csv file should contain AAPL,2019,0.197.

 */

const csv = require("csv-parser");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// template for CSV headers
const HEADER_TEMPLATE = [
  { id: "name", title: "Name" },
  { id: "year", title: "Year" },
  { id: "price", title: "Price" },
];

/**
 * Generates a CSV file that illustrates highest monthly return
 * for each company in each year or maximum draw-up for each company in given year.
 * @param {String} csvData path for CSV file from which to import data from.
 * @param {String} reportType desired report for generated CSV (annual = highest monthly,
 * drawup = maximum drawups)
 */
const generateStockReport = function (csvData, reportType) {
  const fileData = [];
  let unformattedAnnuals = {};
  let filteredCompanyData = [];

  // handle errors
  if (!reportType || (reportType !== "annual" && reportType !== "drawup")) {
    console.log("Please provide valid reportType parameter.");
    return;
  }

  fs.createReadStream(csvData)
    .pipe(csv())
    .on("data", (data) => fileData.push(data))
    .on("end", () => {
      // constant for all unique company and year combinations
      const unique = [
        ...new Set(
          fileData.map(
            (result) => result[`ticker`] + result[`date`].substring(0, 4)
          )
        ),
      ];

      // separates data by company and year
      for (x = 0; x < unique.length; x++) {
        let newTicker = JSON.stringify(unique[x]).substring(1, 5);
        let newDate = JSON.stringify(unique[x]).substring(5, 9);
        let filteredCompanyYear = fileData.filter(function (v, i) {
          return (
            v["ticker"] == `${newTicker}` &&
            v[`date`].substring(0, 4) == `${newDate}`
          );
        });

        filteredCompanyData.push(filteredCompanyYear);
      }

      // pushes desired max values for each company in given year to array
      let allMaxes = [];

      for (let i = 0; i < filteredCompanyData.length; i++) {
        reportType === "annual"
          ? allMaxes.push(findAnnualMax(filteredCompanyData[i]))
          : allMaxes.push(findDrawUp(filteredCompanyData[i]));

        for (let j = 0; j < filteredCompanyData[i].length; j++) {
          let ticker = filteredCompanyData[i][j][`ticker`];
          let year = filteredCompanyData[i][j][`date`].substring(0, 4);

          if (!unformattedAnnuals.hasOwnProperty(`${ticker}${year}`)) {
            unformattedAnnuals[`${ticker}${year}`] = allMaxes[i];
          }
        }
      }

      // fix formatting of data to be written into CSV file
      const formattedAnnuals = Object.keys(unformattedAnnuals).reduce(
        (acc, curr) => {
          let name = JSON.stringify(curr).substring(1, 5);
          let year = JSON.stringify(curr).substring(5, 9);

          return [
            ...acc,
            { name: name, year: year, price: unformattedAnnuals[curr] },
          ];
        },
        []
      );

      // write into corresponding CSV files
      createCsvWriter({
        path: `${
          reportType === "annual" ? "max_annual.csv" : "max_drawups.csv"
        }`,
        header: HEADER_TEMPLATE,
      })
        .writeRecords(formattedAnnuals)
        .then(() => console.log("CSV file created successfully!"));
    });
};

/**
 * Helper function to find the highest monthly return for a company in a given year.
 * @param {Object} data stock data for specific company and year
 * @returns highest monthly return
 */
const findAnnualMax = function (data) {
  let max = Number.MIN_VALUE;

  for (let i = 0; i < data.length; i++) {
    max = Math.max(max, data[i][`monthly_return`]);
  }

  return max;
};

/**
 * Helper function to find the maximum draw-up for a company in a given year.
 * @param {Object} data stock data for specific company and year
 * @returns highest maximum draw-up
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

// run functions
generateStockReport("test_returns.csv", "annual");
generateStockReport("test_returns.csv", "drawup");
