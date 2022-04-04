var mypictures;

// FRAME_MARGIN is duplicated in diagload.js
const FRAME_MARGIN = 20;

var mydata={documentTitle:"",boxes:[],links:[]};
var currentBoxIndex = -1;


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
		mydata = JSON.parse(e.target.result);
	  //refreshEditDataFromJson(e.target.result);
    });
    
    reader.readAsBinaryString(myFile);
  }   
});


function download(filename) {
  var element = document.createElement('a');
  //const Json = refreshJsonFromEditData();
  const jsons = prettyData(JSON.stringify(mydata));
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + jsons);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


function download2(filename) {
	var element = document.createElement('a');
	const rectangles = compute_box_rectangles(mydata.boxes);
	//const Json = refreshJsonFromEditData();
	//const {links, rectangles} = Json;
	
	const hex = (i,n) => i.toString(16).padStart(n,'0');
	
	const rectdim = rectangles
						.map(r => hex(r.right-r.left,3)+hex(r.bottom-r.top,3));
	console.log(rectdim);
						
	const slinks = mydata.links.filter(lk => lk.from != lk.to)
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


function comboOnClick(id)
{
	const innerHTML = mydata.boxes
							.map(box => "<option>" + box.title + "</option>")
							.join('');
							
	if (document.getElementById(id).innerHTML != innerHTML)
		document.getElementById(id).innerHTML = innerHTML;
}



function load(pictures) {
	mypictures = JSON.parse(pictures);
	console.log("scanning pictures");
	for (const {id, Libelle, id_product, Path} of mypictures)
	{
		var option = document.createElement('option');
		option.value = Path;
		imagesAutocompleteCombo.appendChild(option);
	}
}


function updateFieldAttributes(value)
{	
	console.log(value);
	console.log(value);
	const id_picture = mypictures.findIndex(picture => picture.Path == value);
	console.log(id_picture);
	mydata.boxes[currentBoxIndex].id_picture = id_picture;
	displayCurrent();
}


function displayCurrent()
{
	console.log(currentBoxIndex);
	if (currentBoxIndex != -1)
	{
		const {title, id, id_picture} = mydata.boxes[currentBoxIndex];
		boxCombo.value = title;
		document.getElementById("picture").value = (id_picture != -1) ? mypictures[id_picture].Path : "";
	}
	else
	{
		boxCombo.value = "";
		document.getElementById("picture").value = "";
	}
	newBoxEditField.value='';
}

function addNewBox()
{
	const text = newBoxEditField.value;
	currentBoxIndex = mydata.boxes.length;
	mydata.boxes.push({title:newBoxEditField.value, id:currentBoxIndex, id_picture:-1});
	console.log(mydata.boxes);
	boxCombo.add(new Option(text,text));
	displayCurrent();
}

function selectBox(name)
{
	console.log(name);
	currentBoxIndex = mydata.boxes.findIndex(box => box.title==name);
	displayCurrent();
}

function dropBox()
{
	console.log('dropBox');
	currentBoxIndex = mydata.boxes.findIndex(box => box.title == boxCombo.value);
	console.log(currentBoxIndex);
	
	mydata.boxes = mydata.boxes.filter(box => box.title != boxCombo.value);
	mydata.links = mydata.links.filter(lk => lk.from != currentBoxIndex && lk.to != currentBoxIndex);
	
	for (let box of mydata.boxes)
	{
		box.id = box.id > currentBoxIndex ? box.id - 1 : box.id;
	}
	
	for (let lk of mydata.links)
	{
		lk.from = lk.from > currentBoxIndex ? lk.from - 1 : lk.from;
		lk.to = lk.to > currentBoxIndex ? lk.to - 1 : lk.to;
	}
	
	console.log(mydata);
	if (currentBoxIndex == mydata.boxes.length)
		currentBoxIndex = -1;
	displayCurrent();
}


function linkComboOnClick()
{
	console.log("linkComboOnClick");
	const innerHTML = mydata.links
							.map(lk => "<option>" + mydata.boxes[lk.from].title + " => " + mydata.boxes[lk.to].title + "</option>")
							.join('');
	
	console.log(innerHTML);
							
	if (document.getElementById("links").innerHTML != innerHTML)
		document.getElementById("links").innerHTML = innerHTML;
}

function updateLink()
{
	const text = `${fromBoxCombo.value}.${fromFieldCombo.value}.${fromCardinalityCombo.value} \-> ${toBoxCombo.value}.${toFieldCombo.value}.${toCardinalityCombo.value}`;
	linkCombo.options[linkCombo.selectedIndex].innerHTML = text;
}

function addNewLink()
{
	const lk = {
		"from":mydata.boxes.find(box => box.title == fromBoxCombo.value).id,
		"fromField":-1,
		"fromCardinality":"undefined",
		"to":mydata.boxes.find(box => box.title == toBoxCombo.value).id,
		"toField":-1,
		"toCardinality":"undefined",
		"Category":""
	};
	
	console.log(lk);
	
	mydata.links.push(lk);
}

function dropLink()
{
	console.log(mydata.links);
	mydata.links = mydata.links.filter(lk => mydata.boxes[lk.from].title + " => " + mydata.boxes[lk.to].title != linkCombo.value);
	console.log(mydata.links);
	linkComboOnClick();
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

/*
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
*/


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

/*
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
*/


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
