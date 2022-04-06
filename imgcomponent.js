var pictures = null;
var mypictures = null;

var brands = null;
var mybrands = null;

var componenttypes = null;
var mycomponenttypes = null;

var products = null;
var myproducts = null;


function drawComponent(id) 
{
	if (mypictures==null)
		mypictures = JSON.parse(pictures);
	if (mybrands==null)
		mybrands = JSON.parse(brands);
	if (mycomponenttypes==null)
		mycomponenttypes = JSON.parse(componenttypes);
	if (myproducts==null)
		myproducts = JSON.parse(products);
	
	console.log(mypictures);
	const box = mydata.boxes[id];
	const id_picture = box.id_picture;
	console.log(id_picture);
	const picture = mypictures[id_picture];
	console.log(picture);
	const Path = picture.Path;
	console.log(Path);
	const product = myproducts[picture.id_product];
	const brand = mybrands[product.id_brand];
	const componenttype = mycomponenttypes[product.id_comp];
	
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
	
	innerHTML += `<tr><td>`;
		innerHTML += componenttype.Libelle ;
	innerHTML += `</td></tr>`;	
	
	innerHTML += `<tr><td>`;
		innerHTML += brand.Libelle ;
	innerHTML += `</td></tr>`;	
	
	innerHTML += `<tr><td>`;
		innerHTML += product.Libelle ;
	innerHTML += `</td></tr>`;	

	innerHTML += `</tbody></table>`;
	
	return innerHTML;
}



function expressCutLinks(mydata, mycontexts)
{
	
}
