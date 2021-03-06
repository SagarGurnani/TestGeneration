var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en_US";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');

var comboArray = [];
var fileString = '';

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["subject.js"];
	}
	var filePath = args[0];

	constraints(filePath);

	generateTestCases()

}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
	if( greaterThan )
		return Random.integer(constraintValue,constraintValue+10)(engine);
	else
		return Random.integer(constraintValue-10,constraintValue)(engine);
}

function Constraint(properties)
{
	this.ident = properties.ident;
	this.expression = properties.expression;
	this.operator = properties.operator;
	this.value = properties.value;
	this.funcName = properties.funcName;
	// Supported kinds: "fileWithContent","fileExists"
	// integer, string, phoneNumber
	this.kind = properties.kind;
}

function fakeDemo()
{
	//console.log( faker.phone.phoneNumber() );
	return faker.phone.phoneNumberFormat();
	//console.log( faker.phone.phoneFormats() );
}

var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'path/fileExists': {},
		'path/fileExists1' : {
			newContent: 
			{	
  				file2: 'text content',
			}
		}
	},
	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content',
  			file2: ''
		}
	}
};

function generateTestCases()
{

	var content = "var subject = require('./subject.js')\nvar mock = require('mock-fs');\n";
	for ( var funcName in functionConstraints )
	{
		var params = {};

		// initialize params
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];
			//params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			params[paramName] = '\'\'';
		}

		//console.log( params );


		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;
		// Handle global constraints...
		var fileWithContent = _.some(constraints, {kind: 'fileWithContent' });
		var pathExists      = _.some(constraints, {kind: 'fileExists' });

		if(funcName == 'fileTest'){
			console.log("constraints=",JSON.stringify(constraints,null,3));
		}
		// plug-in values for parameters
		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];
			if( params.hasOwnProperty( constraint.ident ) )
			{
				params[constraint.ident] = constraint.value;
				// if(constraint.ident == 'filePath'){
				// 	console.log("constraint.value=====================",constraint.value);
				// 	if(constraint.value == '\'\''){
				// 		console.log('INSIDE SECRET AREA');
				// 		params[constraint.ident] = '\'demopath\'';
				// 	}
				// 	else{
				// 		params[constraint.ident] = constraint.value;
				// 	}
				// }
				// else{
				// 	params[constraint.ident] = constraint.value;	
				// }
				

				// if(constraint.kind == 'fileWithContent' || constraint.kind == 'fileExists'){
				// 	if(params[constraint.ident] == '\'\''){
				// 		params[constraint.ident] = '\'demopath\'';
				// 	}
				// }
			}

			if(params[fileString] == '\'\''){
				params[fileString] = '\'demopath\'';
			}


			// Prepare function arguments.
			var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");

			// var paramLength = functionConstraints[funcName].params.length;
			// var innerArray = [];
			// var answer = [];

			// for(var comboFiller=0;comboFiller<comboArray.length;comboFiller++){
			// 	innerArray.push(comboFiller);
			// }

			// var indexPtr=[];
			// for(var indexFiller=0;indexFiller<paramLength;indexFiller++){
			// 	answer[indexFiller] = innerArray;
			// 	indexPtr[indexFiller] = 0;
			// }


			// for(var iterator=answer.length;iterator>0;iterator--){

			// }



			if( pathExists || fileWithContent )
			{
				content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
				// Bonus...generate constraint variations test cases....
				content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, args);
				content += generateMockFsTestCases(pathExists,!fileWithContent,funcName, args);
				content += generateMockFsTestCases(!pathExists,!fileWithContent,funcName, args);
			}
			else
			{
				// Emit simple test case.
				content += "subject.{0}({1});\n".format(funcName, args );
			}
		}

		// // Prepare function arguments.
		// var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
		// if( pathExists || fileWithContent )
		// {
		// 	content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
		// 	// Bonus...generate constraint variations test cases....
		// 	content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, args);
		// 	content += generateMockFsTestCases(pathExists,!fileWithContent,funcName, args);
		// 	content += generateMockFsTestCases(!pathExists,!fileWithContent,funcName, args);
		// }
		// else
		// {
		// 	// Emit simple test case.
		// 	content += "subject.{0}({1});\n".format(funcName, args );
		// }

	}


	fs.writeFileSync('test.js', content, "utf8");

}

function generateMockFsTestCases (pathExists,fileWithContent,funcName,args) 
{
	var testCase = "";
	// Build mock file system based on constraints.
	var mergedFS = {};
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
	}

	testCase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testCase += "\tsubject.{0}({1});\n".format(funcName, args );
	testCase+="mock.restore();\n";
	return testCase;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);

			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};

			for(var paramIndex = 0;paramIndex<params.length;paramIndex++){
				if(params[paramIndex] == 'phoneNumber'){
					var myNumber = '\''+fakeDemo()+'\'';

					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: 'phoneNumber',
								value: myNumber,
								funcName: funcName,
								kind: "string",
								operator : node.operator,
								expression: '\'\''
							}));
					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: 'phoneNumber',
								value: '\'\'',
								funcName: funcName,
								kind: "string",
								operator : node.operator,
								expression: '\'\''
							}));

				}
			}

			// Check for expressions using argument.
			traverse(node, function(child)
			{
				if( child.type === 'BinaryExpression' && child.operator == "==")
				{
					if(child.left.name == 'area'){
						//console.log("coming in AREAAAAAAAAAAAAAAAAAAAAA");
						var NYnumber = '\''+fakeDemo()+'\'';
						var newArea = child.right.value;
						NYnumber = '\''+newArea+NYnumber.substring(4,NYnumber.length);

						//console.log("new no===================",NYnumber);
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: 'phoneNumber',
								value: NYnumber,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));


					}
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1]);

						if(rightHand == undefined){

							var counterRight = 1;

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
							comboArray.push(rightHand);

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: counterRight,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
							comboArray.push(counterRight);	
						}
						else{
							if(rightHand.charCodeAt(0) == 45 && rightHand.charCodeAt(1)<=57 && rightHand.charCodeAt(1)>=48){
								
								var test1 = parseInt(rightHand);
								var test2 = test1 + 1;
								
								functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: child.left.name,
									value: test1,
									funcName: funcName,
									kind: "integer",
									operator : child.operator,
									expression: expression
								}));
								comboArray.push(test1);

								functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: child.left.name,
									value: test2,
									funcName: funcName,
									kind: "integer",
									operator : child.operator,
									expression: expression
								}));	
								comboArray.push(test2);
							}
							else if(rightHand.charCodeAt(0)<=57 && rightHand.charCodeAt(0)>=48){
								var test1 = parseInt(rightHand);
								var test2 = test1 + 1;
								
								functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: child.left.name,
									value: test1,
									funcName: funcName,
									kind: "integer",
									operator : child.operator,
									expression: expression
								}));
								comboArray.push(test1);

								functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: child.left.name,
									value: test2,
									funcName: funcName,
									kind: "integer",
									operator : child.operator,
									expression: expression
								}));
								comboArray.push(test2);
							}
							else{
								var test1 = rightHand;
								var rightHandCopy = rightHand;
								var test2 = '\''+rightHandCopy.slice(0,1)+'testing'+rightHandCopy.slice(1) + '\'';

								functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: child.left.name,
									value: test1,
									funcName: funcName,
									kind: "string",
									operator : child.operator,
									expression: expression
								}));
								comboArray.push(test1);

								functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: child.left.name,
									value: test2,
									funcName: funcName,
									kind: "string",
									operator : child.operator,
									expression: expression
								}));
								comboArray.push(test2);
							}
						}
					}
				}

				//MY CODE---------------------------------------------------------------------
				if( child.type === 'BinaryExpression' && (child.operator == "<" || child.operator == "<="))
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1]);

						var intRight = parseInt(rightHand);
						var test1 = intRight - 2;
						var test2 = intRight + 2;
						
						functionConstraints[funcName].constraints.push( 
						new Constraint(
						{
							ident: child.left.name,
							value: test1,
							funcName: funcName,
							kind: "integer",
							operator : child.operator,
							expression: expression
						}));
						comboArray.push(test1);

						functionConstraints[funcName].constraints.push( 
						new Constraint(
						{
							ident: child.left.name,
							value: test2,
							funcName: funcName,
							kind: "integer",
							operator : child.operator,
							expression: expression
						}));
						comboArray.push(test2);		
						
					}
				}


				if( child.type === 'BinaryExpression' && (child.operator == ">" || child.operator == ">="))
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1]);

						var intRight = parseInt(rightHand);
						var test1 = intRight - 2;
						var test2 = intRight + 2;
						
						functionConstraints[funcName].constraints.push( 
						new Constraint(
						{
							ident: child.left.name,
							value: test1,
							funcName: funcName,
							kind: "integer",
							operator : child.operator,
							expression: expression
						}));
						comboArray.push(test1);

						functionConstraints[funcName].constraints.push( 
						new Constraint(
						{
							ident: child.left.name,
							value: test2,
							funcName: funcName,
							kind: "integer",
							operator : child.operator,
							expression: expression
						}));
						comboArray.push(test2);		
						
					}
				}

				if( child.type === 'BinaryExpression' && (child.operator == "<" || child.operator == "!="))
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1]);

						
						
					}
				}

				if(child.type === 'UnaryExpression' && child.operator == '!'){

					var optionName='';
					var propertyName='';
					if(child.hasOwnProperty('argument')){
						if(child.argument.hasOwnProperty('object')){
							if(child.argument.object.hasOwnProperty('name')){
								optionName = child.argument.object.name;		
							}
						}
						
						if(child.argument.hasOwnProperty('property')){
							if(child.argument.property.hasOwnProperty('name')){
								propertyName = child.argument.property.name;	
							}
							
						}
					}
					//console.log(optionName+"   "+propertyName);
					var positiveObj = {};
					positiveObj[propertyName] = true;
					positiveObj = JSON.stringify(positiveObj);

					var negativeObj = {};
					negativeObj[propertyName] = false;
					negativeObj = JSON.stringify(negativeObj);

					functionConstraints[funcName].constraints.push( 
						new Constraint(
						{
							ident: optionName,
							value: positiveObj,
							funcName: funcName,
							kind: "string",
							operator : child.operator,
							expression: expression
						}));

					functionConstraints[funcName].constraints.push( 
						new Constraint(
						{
							ident: optionName,
							value: negativeObj,
							funcName: funcName,
							kind: "string",
							operator : child.operator,
							expression: expression
						}));


				}


				//CODE ENDS-------------------------------------------------------------------

				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="readFileSync" )
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							fileString = params[p];
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent/file1'",
								funcName: funcName,
								kind: "fileWithContent",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

				if( child.type == "CallExpression" &&
					 child.callee.property &&
					 child.callee.property.name =="existsSync")
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] && child.arguments[0].name == 'dir' )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								// A fake path to a file
								value:  "'path/fileExists'",
								funcName: funcName,
								kind: "fileExists",
								operator : child.operator,
								expression: expression
							}));

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								// A fake path to a file
								value:  "'path/fileExists1'",
								funcName: funcName,
								kind: "fileExists",
								operator : child.operator,
								expression: expression
							}));
						}
						if( child.arguments[0].name == params[p] && child.arguments[0].name == 'filePath' ){
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent/file1'",
								funcName: funcName,
								kind: "fileWithContent",
								operator : child.operator,
								expression: expression
							}));

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent/file2'",
								funcName: funcName,
								kind: "fileWithContent",
								operator : child.operator,
								expression: expression
							}));
						}

					}
				}

			});

			console.log( functionConstraints[funcName]);

		}
	});
}

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();
