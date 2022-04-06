var mypictures=null;


function drawComponent(id) 
{
	if (mypictures==null)
		mypictures = JSON.parse(pictures);
	const id_picture = mydata.boxes[id].id_picture;
	const Path = mypictures[id_picture].Path;
	return "<img src=\"" + Path + "\">" ;
}



function expressCutLinks(mydata, mycontexts)
{
	
}
