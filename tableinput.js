var mypictures;

// FRAME_MARGIN is duplicated in diagload.js
const FRAME_MARGIN = 20;

var mydata={documentTitle:"",boxes:[],links:[]};
var currentBoxIndex = -1;


var myBoxes = [];
var box2idimage = {};
var box2comment = {};
var field2comment = {};


var input = document.getElementById("myFile");
var editTitle = document.getElementById("title");
var boxCombo = document.getElementById("boxes");
var boxCommentTextArea = document.getElementById("box comment");	
var fieldCommentTextArea = document.getElementById("field comment");
var linkCombo = document.getElementById("links");
var newBoxEditField = document.getElementById("new box");
var fromBoxCombo = document.getElementById("from boxes");
var toBoxCombo = document.getElementById("to boxes");
var imagesAutocompleteCombo = document.getElementById("pictures");


input.addEventListener("change", function () {
  if (this.files && this.files[0]) {
    var myFile = this.files[0];
    var reader = new FileReader();
    
    reader.addEventListener('load', function (e) {
	  refreshEditDataFromJson(e.target.result);
    });
    
    reader.readAsBinaryString(myFile);
  }   
});


function download(filename) {
  var element = document.createElement('a');
  const Json = refreshJsonFromEditData();
  const jsons = prettyData(JSON.stringify(Json));
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + jsons);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


function download2(filename) {
	var element = document.createElement('a');
	const Json = refreshJsonFromEditData();
	const {links, rectangles} = Json;
	
	const hex = (i,n) => i.toString(16).padStart(n,'0');
	
	const rectdim = rectangles
						.map(r => hex(r.right-r.left,3)+hex(r.bottom-r.top,3));
	console.log(rectdim);
						
	const slinks = links.filter(lk => lk.from != lk.to)
						.filter(lk => lk.Category != "TR2")
						.map(lk => [lk.from, lk.to])
						.map(lk => JSON.stringify(lk))
						.filter(function(lk, pos, self){
									return self.indexOf(lk) == pos;}
						) //removing duplicates
						.map(lk => JSON.parse(lk))
						.flat()
						.map(i => hex(i,3))
						.join('');
	console.log(slinks);
	
	latuile = Module.cwrap("latuile","string",["string","string"]);
	bombix = Module.cwrap("bombix","string",["string","string","string","string"]);	


	const jsonResponse = latuile(rectdim.join(''), slinks);
	console.log(jsonResponse);
	
	data = JSON.parse(jsonResponse);
	
	data.rectangles = rectangles;
	
	data.contexts = data.contexts.map(
		({frame, translatedBoxes}) => {
			const {left,right,top,bottom} = frame;
			const sframe = [left, right, top, bottom]
							.map(i => hex(i,4))
							.join('');
			console.log(sframe);
			
			const translations = translatedBoxes
							.map(({id,translation})=>[translation.x,translation.y])
							.flat()
							.map(i => hex(i,3))
							.join('');
			console.log(translations);
			
			const ids = translatedBoxes.map(tB => tB.id);
			
			const rectdim_ = translatedBoxes
							.map(({id}) => rectdim[id])
							.join('');
			console.log(rectdim_);
			console.assert(rectdim_.size == translations.size);
			console.log(links);
			const links_ = links
							.filter(lk => lk.from != lk.to)
							.filter(lk => lk.Category != "TR2")
							.map(lk => ({from:lk.from, to:lk.to}))
							.filter(lk => ids.indexOf(lk.from) != -1 && ids.indexOf(lk.to) != -1)
							.map(lk => [ids.indexOf(lk.from), ids.indexOf(lk.to)])
							.map(lk => JSON.stringify(lk))
							.filter(function(lk, pos, self){
										return self.indexOf(lk) == pos;}
							) //removing duplicates
							.map(lk => JSON.parse(lk))							
							.flat()
							.map(i => hex(i,2))
							.join('');	
			console.log(links_);
			const json2 = bombix(rectdim_, translations, sframe, links_);
			console.log(json2);
			const polylines = JSON.parse(json2);
			const polylines2 = polylines.map(({polyline,from,to})=>({polyline, from:ids[from], to:ids[to]}));
			console.log(polylines2);
			
			return {frame, translatedBoxes, links:polylines2};
		}
	);
	
	const jsonCompletedResponse = prettyContexts(JSON.stringify(data));
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + jsonCompletedResponse);
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}


function load(pictures) {
	mypictures = JSON.parse(pictures);
alert("scanning pictures");
	for (const {id, Libelle, id_product, Path} of mypictures)
	{
		var option = document.createElement('option');
		option.value = Path;
		imagesAutocompleteCombo.appendChild(option);
	}
}


function updateFieldAttributes(value)
{	
	alert(value);
	const id_picture = mypictures.findIndex(picture => picture.Path == value);
	alert(id_picture);
	mydata.boxes[currentBoxIndex].id_picture = id_picture;
	displayCurrent();
}


function displayCurrent()
{
	const {title, id, id_picture} = mydata.boxes[currentBoxIndex];
	boxCombo.value = title;
	imagesAutocompleteCombo.value = mypictures[id_picture].Path ;
	newBoxEditField.value='';
}

function addNewBox()
{
	const text = newBoxEditField.value;
	currentBoxIndex = mydata.boxes.length;
	mydata.boxes.push({title:newBoxEditField.value, id:currentBoxIndex, id_picture:0});
	boxCombo.add(new Option(text,text));
	displayCurrent();
}

function selectBox(name)
{
	currentBoxIndex = mydata.boxes.findIndex(box => box.title==name);
	displayCurrent();
}

function dropBox()
{
	const box = boxCombo.value;
	let index = myBoxes.indexOf(box);
	myBoxes.splice(index,1);
	for (const {name} in box2idimage[box])
	{
		const field = name;
		delete field2comment[`${box}.${field}`];
	}
	delete box2idimage[box];
	boxCombo.remove(boxCombo.selectedIndex);
	
	selectCascadeBox();
	
	alert(JSON.stringify(box2idimage));
	
	for (let i=linkCombo.options.length-1; i >= 0; i--) 
	{
	//Split a string with multiple parameters: Pass in a regexp as the parameter.
		let [fromBoxTitle, , ,toBoxTitle, ,] = linkCombo.options[i].text.split(/ -> |\./);
		if (fromBoxTitle == box || toBoxTitle == box)
		{
			alert ("Cascade dropping link: " + linkCombo.options[i].text);
			linkCombo.remove(i);
		}
	}		
}


function selectLink()
{
	const myRegexp = /([^\.]+)\.([^\.]+)\.([^\s]+) \-\> ([^\.]+)\.([^\.]+)\.([^\s]+)/g;
	const match = myRegexp.exec(linkCombo.value);
	fromBoxCombo.value = match[1];
	selectBox(fromBoxCombo, fromFieldCombo);
	toBoxCombo.value = match[4];
	selectBox(toBoxCombo, toFieldCombo);
}

function updateLink()
{
	const text = `${fromBoxCombo.value}.${fromFieldCombo.value}.${fromCardinalityCombo.value} \-> ${toBoxCombo.value}.${toFieldCombo.value}.${toCardinalityCombo.value}`;
	linkCombo.options[linkCombo.selectedIndex].innerHTML = text;
}

function addNewLink()
{
	const text = `${fromBoxCombo.value}.. \-> ${toBoxCombo.value}..`;					
	linkCombo.add(new Option(text, text));
	sortSelect(linkCombo);
	linkCombo.value = text;
}

function dropLink()
{
	if (linkCombo.selectedIndex != -1)
		linkCombo.remove(linkCombo.selectedIndex);
}



function dropBoxComment()
{
	const box = boxCombo.value;
	delete box2comment[box];
	boxCommentTextArea.value = "";
}

function updateBoxComment()
{
	const box = boxCombo.value;
	box2comment[box] = boxCommentTextArea.value;
}

function dropFieldComment()
{
	const box = boxCombo.value;
	const field = fieldCombo.value;
	delete field2comment[`${box}.${field}`];
	fieldCommentTextArea.value = "";
}

function updateFieldComment()
{
	const box = boxCombo.value;
	const field = fieldCombo.value;
	field2comment[`${box}.${field}`] = fieldCommentTextArea.value;
}


function refreshJsonFromEditData()
{	
	var boxes = [];

	for (let [id, box] of myBoxes.entries())
	{
		boxes.push({"title":box, "id":id, "fields":box2idimage[box]})
	}
	
	let boxComments = [];
	for (let box in box2comment)
	{
		comment = box2comment[box];
		boxComments.push({box, comment});
	}
	
	let fieldComments = [];
	for (let boxfield in field2comment)
	{
		comment = field2comment[boxfield];
		[box, field] = boxfield.split(".");
		fieldComments.push({box, field, comment});
	}

	let links = [];

	let i=0;
	for (let option of linkCombo.options)
	{
	//Split a string with multiple parameters: Pass in a regexp as the parameter.
		const [fromBoxTitle, fromFieldName, fromCardinality, toBoxTitle, toFieldName, toCardinality, Category] = option.text.split(/ -> |\./);
		console.log({fromBoxTitle, fromFieldName, toBoxTitle, toFieldName, Category});
		const fromBoxIndex = boxes.findIndex( box => box.title == fromBoxTitle );
		if (fromBoxIndex == -1)
			alert(`link ${i}: No Box named ${fromBoxTitle}!`);
		const fromFieldIndex = boxes[fromBoxIndex].fields.findIndex( field => field.name == fromFieldName );
		if (fromFieldIndex == -1)
			alert(`link ${i}: Box ${fromBoxTitle} has no field named ${fromFieldName}!`);
		const toBoxIndex = boxes.findIndex( box => box.title == toBoxTitle );
		if (toBoxIndex == -1)
			alert(`link ${i}: No Box named ${toBoxTitle}`);
		const toFieldIndex = boxes[toBoxIndex].fields.findIndex( field => field.name == toFieldName );
		if (toFieldIndex == -1)
			alert(`link ${i}: Box ${toBoxTitle} has no field named ${toFieldName}!`);
		links.push(
			{
			"from":fromBoxIndex, 
			"fromField":fromFieldIndex,
			"fromCardinality":fromCardinality,
			"to":toBoxIndex,
			"toField":toFieldIndex,
			"toCardinality":toCardinality,
			"Category":Category
			}
		);
		i++;
    }
	
	const rectangles = compute_box_rectangles(boxes);
	const documentTitle = editTitle.value;

	const json = {documentTitle, boxes, boxComments, fieldComments, links, rectangles};
	return json;
}



const MONOSPACE_FONT_PIXEL_WIDTH=7;
const CHAR_RECT_HEIGHT=16;	// in reality 14,8 + 1 + 1 (top and bottom padding) = 16,8
const RECTANGLE_BOTTOM_CAP=200;

function compute_box_rectangles(boxes)
{
	var rectangles = []
	for (const {title,id,fields} of boxes)
	{
		let fields = box2idimage[title];

		var nr_col = 0 ;
		var width = 2*4 + title.length * MONOSPACE_FONT_PIXEL_WIDTH ;
		var max_width = width;
		
		for (const field of fields)
		{
			nr_col++ ;
			const column_name = field.name;

			var column_width= column_name.length ;

			max_width = Math.max(column_width * MONOSPACE_FONT_PIXEL_WIDTH, max_width);
		}
		
		const bottom = 8 + CHAR_RECT_HEIGHT * (nr_col+1) ;

		rectangles.push({"left":0, "right":max_width, "top":0, "bottom":Math.min(bottom, RECTANGLE_BOTTOM_CAP)}) ;
	}
	return rectangles;
}


function refreshEditDataFromJson(Json)
{
	const {documentTitle, boxes, values, boxComments, fieldComments, links, fieldColors, rectangles, http_get_param, http_get_request} = JSON.parse(Json);
	
	editTitle.value = documentTitle;
	
	removeOptions(boxCombo);
	removeOptions(fieldCombo);
	removeOptions(fromBoxCombo);
	removeOptions(toBoxCombo);
	removeOptions(linkCombo);
	removeOptions(colorBoxCombo);
	removeOptions(colorsCombo);
	
	myBoxes = [];
	for (const {title, id, fields} of boxes)
	{
		myBoxes.push(title);
	}
	
	console.log(myBoxes);
	
	for (const {from,fromField,fromCardinality,to,toField,toCardinality,Category} of links)
	{
		console.log({from,fromField,fromCardinality,to,toField,toCardinality,Category});
		console.assert(from < boxes.length);
		console.assert(fromField < boxes[from].fields.length);
		console.assert(to < boxes.length);
		console.assert(toField < boxes[to].fields.length);
		
		let text = boxes[from].title +
					"." +
					(fromField != -1 ? boxes[from].fields[fromField].name : '') +
					"." +
					fromCardinality +
					" -> " + 
					boxes[to].title +
					"." +
					(toField != -1 ? boxes[to].fields[toField].name : '') +
					"." +
					toCardinality +
					"." +
					Category;
					
		linkCombo.add(new Option(text, text));
    }
	sortSelect(linkCombo);

	for (const box of boxes) 
	{
		boxCombo.add(new Option(box.title, box.title));
	}
	sortSelect(boxCombo);
	
	copyOptions(boxCombo, fromBoxCombo);
	copyOptions(boxCombo, toBoxCombo);
	copyOptions(boxCombo, colorBoxCombo);
	
	box2comment = {};
	for (let {box,comment} of boxComments)
	{
		box2comment[box] = comment;
	}
	
	field2comment = {};
	for (let {box,field,comment} of fieldComments)
	{
		field2comment[`${box}.${field}`] = comment;
	}
	
	selectBox(boxCombo, fieldCombo);
	updateFieldAttributes();
	selectBox(fromBoxCombo, fromFieldCombo);
	selectBox(toBoxCombo, toFieldCombo);
	selectField();
}


function enable_disable()
{
/*
	const box = boxCombo.value;
	const boxComment = boxCommentTextArea.value;
	const fieldComment = fieldCommentTextArea.value;
	
	document.getElementById("add box").disabled = newBoxEditField.value.length == 0 || myBoxes.indexOf(newBoxEditField.value) != -1;
	document.getElementById("drop box").disabled = boxCombo.selectedIndex == -1 ||
												newBoxEditField.value.length != 0;
	document.getElementById("update box").disabled = boxCombo.selectedIndex == -1 ||
														newBoxEditField.value.length == 0 ||
														boxCombo.value == newBoxEditField.value ||
														myBoxes.indexOf(newBoxEditField.value) != -1 ;
		
	
	document.getElementById("drop link").disabled = linkCombo.selectedIndex == -1;

	document.getElementById("update box comment").disabled = boxComment.length == 0 || (box in box2comment && box2comment[box] == boxComment);
	document.getElementById("drop box comment").disabled = !(box in box2comment);
	document.getElementById("update field comment").disabled = fieldComment.length == 0 || (`${box}.${field}` in field2comment && field2comment[`${box}.${field}`] == fieldComment);
	document.getElementById("drop field comment").disabled = !(`${box}.${field}` in field2comment);	

	document.getElementById("add link").disabled = fromBoxCombo.selectedIndex == -1 ||
													toBoxCombo.selectedIndex == -1;
*/
}

setInterval("enable_disable()", 100);
