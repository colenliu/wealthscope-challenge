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

const fs = require("fs");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

/**
 * Generates a stock report CSV file that illustrates highest monthly return
 * OR maximum draw-up for each company in each year given a valid CSV file.
 * @param {String} csvData path for CSV file from which to import data from
 * @param {String} reportType desired report for generated CSV (annual = highest monthly,
 * drawup = maximum drawups)
 */
const generateStockReport = function (csvData, reportType) {
  try {
    const fileData = [];
    let unformattedStockData = {};
    let groupedCompanyData = [];

    // handle error cases (incorrect/missing reportType param)
    if (!reportType || (reportType !== "annual" && reportType !== "drawup")) {
      console.log("Error: Please provide valid reportType parameter.");
      return;
    }

    // begin reading CSV file
    fs.createReadStream(csvData)
      .pipe(csv())
      .on("data", (data) => fileData.push(data))
      .on("end", () => {
        // stores all unique company and year combinations
        const companyYearCombos = [
          ...new Set(
            fileData.map(
              (result) => result[`ticker`] + result[`date`].substring(0, 4)
            )
          ),
        ];

        // groups data by company and year
        for (x = 0; x < companyYearCombos.length; x++) {
          let newTicker = JSON.stringify(companyYearCombos[x]).substring(1, 5);
          let newDate = JSON.stringify(companyYearCombos[x]).substring(5, 9);
          let filteredCompanyYear = fileData.filter((v) => {
            return (
              v["ticker"] === `${newTicker}` &&
              v[`date`].substring(0, 4) === `${newDate}`
            );
          });

          groupedCompanyData.push(filteredCompanyYear);
        }

        // pushes desired max values for each company in given year to array
        let allMaxes = [];

        for (let i = 0; i < groupedCompanyData.length; i++) {
          reportType === "annual"
            ? allMaxes.push(findAnnualMax(groupedCompanyData[i]))
            : allMaxes.push(findDrawUp(groupedCompanyData[i]));

          // creates object containing desired company name, year, and desired max value
          for (let j = 0; j < groupedCompanyData[i].length; j++) {
            let ticker = groupedCompanyData[i][j][`ticker`];
            let year = groupedCompanyData[i][j][`date`].substring(0, 4);

            if (!unformattedStockData.hasOwnProperty(`${ticker}${year}`)) {
              unformattedStockData[`${ticker}${year}`] = allMaxes[i];
            }
          }
        }

        // fix formatting of data to be written into CSV file
        const formattedStockData = Object.keys(unformattedStockData).reduce(
          (acc, curr) => {
            let name = JSON.stringify(curr).substring(1, 5);
            let year = JSON.stringify(curr).substring(5, 9);

            return [
              ...acc,
              {
                ticker: name,
                year: year,
                highest_return: unformattedStockData[curr],
              },
            ];
          },
          []
        );

        // write data into corresponding CSV files
        createCsvWriter({
          path: `${
            reportType === "annual" ? "max_annual.csv" : "max_drawups.csv"
          }`,
          header: [
            { id: "ticker", title: "ticker" },
            { id: "year", title: "year" },
            { id: "highest_return", title: "highest_return" },
          ],
        })
          .writeRecords(formattedStockData)
          .then(() => console.log("CSV file created successfully!"));
      });
  } catch (err) {
    console.log("Error: generateStockReport() has failed to run.");
    return;
  }
};

/**
 * Helper function to find the highest monthly return for a company in a given year.
 * @param {Object} data stock data for specific company and year
 * @returns highest monthly return
 */
const findAnnualMax = function (data) {
  try {
    let max = Number.MIN_VALUE;

    for (let i = 0; i < data.length; i++) {
      max = Math.max(max, data[i][`monthly_return`]);
    }

    return max;
  } catch (err) {
    console.log("Error: findAnnualMax() has failed to run.");
    return;
  }
};

/**
 * Helper function to find the maximum draw-up for a company in a given year.
 * @param {Object} data stock data for specific company and year
 * @returns highest maximum draw-up
 */
const findDrawUp = function (data) {
  try {
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
  } catch (err) {
    console.log("findDrawUp() has failed to run.");
    return;
  }
};

// run functions
generateStockReport("test_returns.csv", "annual");
generateStockReport("test_returns.csv", "drawup");
