const { urlencoded } = require("express");

(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);

function addev(){
	if (name.length > 1){
		var eventToadd = document.getElementById("add").value;
	}
	else{
		var eventToadd = document.getElementById("add").value
		if (eventToadd == ""){
			alert("add something")
			return
		}
	}
	
	if (document.getElementById("dateChk").checked){
		var timeStp=document.getElementById('dateS').value
		if (document.getElementById("dateS").value == "") {
			alert("enter date")
			return
		}
		console.log('datecheck'+timeStp)
	}
	else{
		var timeStp= 'default'
		console.log('dateNOcheck'+timeStp)
	}
	console.log(timeStp, eventToadd)

	fetch("add?ev="+eventToadd+"&date="+timeStp).
	then(response=>{
		// alert("Done scroll to the bottom to see it!!")
		if (response.status == 400){
			alert('Invalid date')
		}
		else{
			document.location.href='/'
		}
	})
}
function gpge(arg){
	var id = arg["attributes"]["value"]["value"];
	var ev = document.getElementById("track")
	var chilen = ev.children.length 
	for (var i = 3; i < chilen; i++) {
		var id2 = ev.children[i]["attributes"]["id"]
		if (id2.value !== id){
			// console.log(id ,id2.value,i)
			document.getElementById(id2.value).style.display = "none";
		}
		else{
		}
	}
	document.getElementById(id).style.display="block";
}

function unMrkAll(length){
	console.log("unmakall",length,)
	document.getElementById('mark').disabled = true;
	document.getElementById('del').disabled = true;
	document.getElementById('label').disabled = true;
	document.getElementById('category').disabled = true;
	document.getElementById('dateChk').checked= false;

	for (let index = 0; index < length; index++) {
		document.getElementById('all' + index).checked = false
	}
	for (let index = 0; index < length; index++) {
		console.log('len' + index)
			try{
				// console.log('all' + index)
				document.getElementById('uniq' + index).checked = false //check
				document.getElementById('old' + index).checked = false//check
				document.getElementById('new' + index).checked = false
				document.getElementById('inaday' + index).checked = false
				// document.getElementById('categories' + index).checked = false
			}
			catch(err){
				
				console.log(document.getElementById('inaday' + index).checked = false)
				// console.log('uniq' + index)
			}

	}
	
}

var tabId="";
function selectData(length,select){
	console.log(length,select,tabId,9898)
	if (tabId.length > 0){
		for (let index = 0; index < length; index++) {
			try{
				if (tabId == 'inaday'){
					var name = document.getElementById('L' + tabId + index).attributes.event.nodeValue
				}
				else{
					var name = document.getElementById('L'+tabId + index).attributes.toMrk.nodeValue;
				}
			}
			catch{
				// console.log(tabId+ index);
			}
			if (name.split(',').length > 1){
				for (let ind = 0; ind < name.split(',').length; ind++) {
					if (name.split(',')[ind] == select){
						// console.log(name.split(',').length,name)
						document.getElementById(tabId + index).checked = true
					}
				}
				
			}
			if (name == select){
				document.getElementById(tabId + index).checked=true
			}
			else if (select == 'All'){
				document.getElementById(tabId + index).checked = true
			}
		}		
	}
	// console.log(name == "All")
}
function popMenu(eventID,id,tabID){
	tabId=tabID;
	// console.log(eventID,id,tabId)
	if (eventID.id.length > 0){
		if (eventID.checked == true){
			document.getElementById('L' + eventID.id).style.color ="white"
		}
		else{
			document.getElementById('L' + eventID.id).style.color = "wheat"
		}
	}
	for (let index = 0; index < id; index++) {
		// console.log(tabID + index,'popmenu')	
		var check =document.getElementById(tabID+index).checked
		// console.log(index,check,'2')
		if (check){
			document.getElementById('mark').disabled = false;
			document.getElementById('del').disabled = false;
			document.getElementById('label').disabled = false;
			document.getElementById('category').disabled = false;
			break
		}
		else{
			document.getElementById('mark').disabled = true;
			document.getElementById('del').disabled = true;
			document.getElementById('label').disabled = true;
			document.getElementById('category').disabled = true;

		}
	}
}
function scanPs(length,label){ // delete and add
	var deList=[];
	for (let index = 0; index < length; index++) {
		// console.log(document.getElementById(tabId + index).checked, 'uniq0', tabId + index)
		try{
			var check = document.getElementById(tabId + index).checked
			var apend = document.getElementById('L'+tabId+ index).attributes.value.nodeValue
			if (check) {
				// console.log(apend)
				deList.push(apend)
			}
		}
		catch{
			// console.log(index,'errr')
		}
	}
	if (tabId == 'inaday'){
		deList = deList.toString().split(',')
	}
	// console.log(label)
	if (label.type == 'del'){
		var param = 'rm?p=' + deList
	}
	if (label.type !== 'del'){
		param = label.type+"?labelN=" + encodeURI( label.value) +'&id=' + JSON.stringify(deList);
	}
	console.log(deList,param,'scanps',label)
	fetch(param).then(res=>{
		if(res.status){
			document.location.reload()
		}
	})
	
}

function categoryShow(){
	var isCat=document.location.search.indexOf('cat')
	if (isCat !== -1){
		catName=document.location.search.split('=')[1]
		document.getElementById('catShow').innerHTML="Category "+decodeURI(catName)	+"<br>"	
	}
	else{
		document.getElementById('catShow').style.display='none'
	}
}