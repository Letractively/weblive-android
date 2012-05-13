document.addEventListener("deviceready", onDeviceReady, false);
// PhoneGap is ready
//
function populateDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS data (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, data)');      
}
function insertValue(){
	if($('#inswebsite').val()!=''){
		var db = window.openDatabase("listweb", "1.0", "List web", 200000);
		db.transaction(insertWebsite, errorCB, successCB);
	}
}
function insertWebsite(tx){
	tx.executeSql('INSERT INTO data (data) VALUES ("'+$('#inswebsite').val()+'")');
	$('#inswebsite').val('http://');
	showListWebsite();
	console.log("Inserito "+$('#inswebsite').val());
	
}
function removeWebsite(idremove){
	var db = window.openDatabase("listweb", "1.0", "List web", 200000);
	db.transaction(function(tx){removeItem(tx,idremove)}, errorCB, successCB);
}
function removeItem(tx,idremove){
	tx.executeSql('DELETE FROM data WHERE id = '+idremove,[], successCB(), errorCB);
	$('#item'+idremove).remove();
	$('#item').listview('refresh');
}
function showListWebsite(){
	var db = window.openDatabase("listweb", "1.0", "List web", 200000);
	db.transaction(selectAllWebsite, errorCB);	
}

function selectAllWebsite(tx) {
    tx.executeSql('SELECT * FROM data WHERE 1',[], aggiornaLista, errorCB);
}

function aggiornaLista(tx, results){
    var len = results.rows.length;
    $('#item').html('');
    for (var i=0; i<len; i++){
        $('#item').append('<li id="item'+results.rows.item(i).id+'">'+results.rows.item(i).data+'  <span id="status'+results.rows.item(i).id+'" style="color:black;">WAITING</span> <br /> <span id="rank'+results.rows.item(i).id+'"> </span> <br /> <span id="alexa'+results.rows.item(i).id+'"></span> <br /> <span id="tweet'+results.rows.item(i).id+'"></span> <br /> <span id="w3c'+results.rows.item(i).id+'"></span> <br /> <input type="button" onclick="javascript: removeWebsite(\''+results.rows.item(i).id+'\')" value="REMOVE"/>  </li>');
        webIsLive(results.rows.item(i).data,results.rows.item(i).id);
        getPageRank(results.rows.item(i).data,results.rows.item(i).id);
        getAlexaRank(results.rows.item(i).data,results.rows.item(i).id);
        countLinkTweet(results.rows.item(i).data,results.rows.item(i).id);
        validCode(results.rows.item(i).data,results.rows.item(i).id);
    }
    $('#item').listview('refresh');	
}

function errorCB(){
	console.log("Errore nel db");
}
function successCB(){
	console.log("Successo nella query");
}
function validCode(myurl,idstatus){
	$.getJSON("http://validator.w3.org/check?uri="+myurl+"&output=json",function(data){
		if(data.messages == ''){
			//code valid
			$('#w3c'+idstatus).css("color","#55b05a");
			$('#w3c'+idstatus).html("W3C: Valid!")
		}else{
			$('#w3c'+idstatus).css("color","#55b05a");
			$('#w3c'+idstatus).html('W3C: <span style="color:red;">Not Valid!</span>')
		}
		$('#item').listview('refresh');
	});
}
function countLinkTweet(myurl,idstatus){
	$.getJSON("http://urls.api.twitter.com/1/urls/count.json?url="+myurl,function(data){
		$('#tweet'+idstatus).css("color","#007FFF");
		$('#tweet'+idstatus).html(' <span style="color: black;"></span>TWITTER LINK: '+data.count);
		$('#item').listview('refresh');
	});
}
function getAlexaRank(myurl,idstatus){
    jQuery.ajax({
    	url: "http://tailot.altervista.org/alexarank.php?url="+myurl,
    	success: function(result){
    		if(result != ''){
    			$('#alexa'+idstatus).css("color","red");
    			$('#alexa'+idstatus).html(' <span style="color: black;"></span> ALEXA RANK: '+result);
    			$('#item').listview('refresh');	
    		}else{
    			$('#alexa'+idstatus).css("color","red");
    			$('#alexa'+idstatus).html(' <span style="color: black;"></span> ALEXA RANK: ND');
    			$('#item').listview('refresh');	   			
    		}
    	},
    	async:   true
    });	

}

function getPageRank(myurl,idstatus){
    jQuery.ajax({
    	url: 'http://josh-fowler.com/prapi/?url='+myurl,
    	success: function(result){
    		if(result != ''){
    			$('#rank'+idstatus).css("color","blue");
    			$('#rank'+idstatus).html(' PAGERANK: '+result);
    			$('#item').listview('refresh');	
    		}
    	},
    	async:   true
    });	
}
function webIsLive(mywebsite,idstatus){
    jQuery.ajax({
    	url: mywebsite,
    	success: function(result){
    		if(result != ''){
    			$('#status'+idstatus).css("color","green");
    			$('#status'+idstatus).html('LIVE');
    			$('#item').listview('refresh');	
    		}
    	},
    	error: function(){
    		$('#status'+idstatus).css("color","red");
    		$('#status'+idstatus).html('DOWN');
    		$('#item').listview('refresh');	    		
    	},
    	async:   true
    });
}

function refreshCheckWebSite(){
	 showListWebsite();
	 setTimeout("refreshCheckWebSite()",120000);
}
function onDeviceReady() {
    var db = window.openDatabase("listweb", "1.0", "List web", 200000);
    db.transaction(populateDB, errorCB, successCB);
    refreshCheckWebSite();
}