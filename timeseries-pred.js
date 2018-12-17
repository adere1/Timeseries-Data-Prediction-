const {inspect} = require('util'); 
var timeseries = require("timeseries-analysis");
const assert = require('assert');
const fs = require('fs');
'use strict';

class  TimeSeriesPrediction{
  constructor() {  
    this.indexing_structure = {};  	                  //indexing structure to store the data read from the file
    this.counter = 0;  
    this.buyer_basic_info = new Array(); 
    this.buyer_historical_category15_money = new Array();
    this.key_product_ids = new Array();
    this.product_distribution_training_set = new Array();
    this.product_features = new Array();
    this.trade_info_training = new Array();
    
  }

addContent(name, content) {                            // add content to the indexing structure and generate the output
    let content_array = content.split(/\n+/);    
    this.indexing_structure[name] = new Map();    
    let index_stored ;    
	if(name === 'buyer_basic_info'){
		let final_array = new Array();
		 for(let p=0;p<content_array.length;p++){
		     let hold_object = {}
		     let temp = content_array[p].split(/\s+/);  
		     let hold = ["buyer_id","registration_time","seller_level","buyer_level","age","gender"]
		     
		     for(let i =0;i<hold.length;i++){
		        hold_object[hold[i]] = temp[i];
		     }            
		     this.buyer_basic_info.push(hold_object);
		 }
	}

	if(name === 'buyer_historical_category15_money'){	    
		 let final_array = new Array();
		 let hold_object = {}
		 
                 for(let p=0;p<content_array.length;p++){
		     let hold_object = {}
		     let temp = content_array[p].split(/\s+/);
       		     hold_object["buyer_id"] = temp[0]
		     
                     for(let i =1;i<temp.length-1;i++){
		       hold_object["Cquantity"+i] = temp[i];
		     }		    
		     this.buyer_historical_category15_money.push(hold_object);
		 }
	   }

	if(name === 'key_product_IDs'){    
		 let final_array = new Array();
		 let hold_object = {}
		 for(let p=0;p<content_array.length;p++){
		     let hold_object = {}
		     let temp = content_array[p].split(/\s+/);  
		     this.key_product_ids.push(temp[0]);
		 }		 
	}

	if(name === 'product_distribution_training_set'){                  // read product_distribution_training_set line by line
	     let final_array = new Array();
	     let  a = 1;         
		 for(let p=0;p<content_array.length;p++){
		     let hold_object = {}
		     let temp = content_array[p].split(/\s+/);
		     hold_object[""+temp[0]] = new Array();
		   for(let i =1;i<temp.length-1;i++){
		     hold_object[temp[0]].push(Number(temp[i]));
		    }
		    this.product_distribution_training_set.push(hold_object);
		 }
	      let count = 83;
	      let keys;
	      let total = new Array();
		for(let m =0;m<118;m++){                                                       // code to generate total sum of favorite products on daily basis
			let sum = 0;
			for(let i=0;i<this.product_distribution_training_set.length-1;i++){
				keys = Object.keys(this.product_distribution_training_set[i]);
				sum = sum+this.product_distribution_training_set[i][keys][m];
			}
			total.push(sum);
		}

		let  timeseriesprod = new timeseries.main(timeseries.adapter.fromArray(total.slice(count)));

		timeseriesprod.sliding_regression_forecast({                                   // sliding regression forecast to generate the outupt array
				    sample:     7,
				    degree: 	2,
				    method:     'ARMaxEntropy'                                // Method used ARMaxEntropy
				});

		let p = "    ";
		for(let r =6;r<timeseriesprod.data.length;r++){
		   p = p + Math.ceil(timeseriesprod.data[r][1])+ "     ";
		}  
		 fs.writeFile('output.txt',"0"+p+'\n', (err) => {                             // write output to the file
		    if (err) throw err;
		    console.log('Output Generated');
		});

		for(let i=0;i<this.product_distribution_training_set.length-1;i++){
			let keys = Object.keys(this.product_distribution_training_set[i]);
			let timeseriesprod = new timeseries.main(timeseries.adapter.fromArray(this.product_distribution_training_set[i][keys].slice(count)));
			var forecast	= 0;
			timeseriesprod.sliding_regression_forecast({
			    sample:     7,
			    degree: 	2,
			    method:     'ARMaxEntropy'
			});
			let p = "    ";
			for(let r =6;r<timeseriesprod.data.length;r++){
			   p = p + Math.ceil(timeseriesprod.data[r][1] < 0 ? 0 :timeseriesprod.data[r][1])+ "     ";
			}  
			 fs.appendFile('output.txt', keys+" "+p+'\n', (err) => {  
			    if (err) throw err;		 
			});
		}
	}

	if(name === "product_features"){
		 let final_array = new Array();

		 for(let p=0;p<content_array.length;p++){
		     let hold_object = {}
		     let temp = content_array[p].split(/\s+/);  
		     let hold = ["product_id","attribute_1","attribute_2","original_price"];
		    for(let i =0;i<hold.length;i++){
		     hold_object[hold[i]] = temp[i];
		    }		    
		     this.product_features.push(hold_object);
		 }
	 
	}

	if(name === "trade_info_training"){
		 let final_array = new Array();
		 for(let p=0;p<content_array.length;p++){
		     let hold_object = {}
		     let temp = content_array[p].split(/\s+/);  
		     let hold = ["product_id","buyer_id","trade_time","trade_quantity","trade_price"];
		    for(let i =0;i<hold.length;i++){
		     hold_object[hold[i]] = temp[i];
		    }		    
		     this.trade_info_training.push(hold_object);
		 } 
	   
	}
    }
}

module.exports = TimeSeriesPrediction;
