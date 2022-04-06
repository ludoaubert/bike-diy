var pictures = null;
var mypictures = null;


function drawComponent(id) 
{
	if (mypictures==null)
		mypictures = JSON.parse(pictures);
	console.log(mypictures);
	const id_picture = mydata.boxes[id].id_picture;
	console.log(id_picture);
	const Path = mypictures[id_picture].Path;
	console.log(Path);
	return `<img id="${id}" src="${Path}" onmousedown="selectElement(this,'red')" onmouseup="selectElement(this,'green')" onmousemove="moveElement(event)">` ;
}



function expressCutLinks(mydata, mycontexts)
{
	
}
