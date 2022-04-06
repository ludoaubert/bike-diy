var pictures = null;
var mypictures = null;


function drawComponent(id) 
{
	if (mypictures==null)
		mypictures = JSON.parse(pictures);
	console.log(mypictures);
	const box = mydata.boxes[id];
	const id_picture = box.id_picture;
	console.log(id_picture);
	const Path = mypictures[id_picture].Path;
	console.log(Path);
	
	let innerHTML = `<table id="${id}" onmousedown="selectElement(this,'red')" onmouseup="selectElement(this,'green')" onmousemove="moveElement(event)">`;
	innerHTML += `<thead>
					<tr>
						<th>${box.title}</th>
					</tr>
				  </thead>
				  <tbody>
				  `;

	innerHTML += `<tr><td>`;
				  
	innerHTML += `<img id="${id}" src="${Path}" onmousedown="selectElement(this,'red')" onmouseup="selectElement(this,'green')" onmousemove="moveElement(event)">` ;

	innerHTML += `</td></tr>`;

	innerHTML += `</tbody></table>`;
	
	return innerHTML;
}



function expressCutLinks(mydata, mycontexts)
{
	
}
