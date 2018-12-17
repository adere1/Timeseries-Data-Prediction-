#!/usr/bin/env nodejs
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const TimeSeries = require('./timeseries-pred');

async function go(args) {                       // Code to read the input files 
  const finder = new TimeSeries();
  let filearray = new Array();
  let content = await readFileContents("buyer_basic_info.txt");
  await finder.addContent("buyer_basic_info", content);  
  content = await readFileContents("buyer_historical_category15_money.txt");
  await finder.addContent("buyer_historical_category15_money", content);  
  content = await readFileContents("key_product_IDs.txt");
  await finder.addContent("key_product_IDs", content);
  content = await readFileContents("product_distribution_training_set.txt");
  await finder.addContent("product_distribution_training_set", content);  
  content = await readFileContents("product_features.txt");
  await finder.addContent("product_features", content);  
  content = await readFileContents("trade_info_training.txt");
  await finder.addContent("trade_info_training", content);

}

async function readFileContents(path) {
  try {
    return await readFile(path, 'utf8');
  }
  catch (err) {
    console.error('cannot read %s: %s', path, err);
    process.exit(1);
  }
}

(async (args) => await go(process.argv.slice(2)))();
