var isprofanity = require('../../lib/isprofanity/isProfanity');

var getProfanity = isprofanity.isProfanity("fuck" ,function(t){
	console.log("22: "+t);
	return t
	});