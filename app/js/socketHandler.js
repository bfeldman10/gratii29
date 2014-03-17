var socket = io.connect("//gratii.com:8001");
// var socket = io.connect("//localhost:8001");

socket.on('news', function (data) {
	//console.log(data);
	socket.emit('my other event', { my: 'data' });
});

socket.on('connectionEstablished', function (data) {
	var userNodeID = data.userNodeID;
	//console.log(data.userNodeID);
	socket.emit('connectionEstablished', { my: 'data' });

	$.ajax({
	    url: "../backend/public/api/v1/user/node/new",
	    type: 'PUT',
	    dataType: 'json',
	    data: { userNodeID: userNodeID },
	    async: true,
	    cache: false,
	    timeout: 30000,
	    error: function(data){
	    	var jsonResponse = data.responseJSON;
	    	//console.log(jsonResponse);
	    	//alert(jsonResponse['msg']);
	        return true;
	    },
	    success: function(data){ 
	    	//console.log(data);
	    	return;
	    }
	});

});

socket.on('incomingTransaction', function (data) {
	console.log("INCOMING TRANSACTION");
	if((user.gratii + data.changeInGratii) == data.newBalance){
		user.changeGratii(data.changeInGratii);
	}else{
		var adjustedChangeInGratii = (data.newBalance - user.gratii);
		user.changeGratii(adjustedChangeInGratii);
	}
	
});

socket.on('auctionUpdate', function (data) {
	console.log("INCOMING BID");
	updateLiveAuctionAfterBidFromNode(data.id, data.leaderNickname, data.maxBid);
});

socket.on('incomingMessage', function (data) {
	console.log("INCOMING MESSAGE");
	user.newMessages++;
	//inboxUpdateRequested = true;
	//user.updateNewMessageIndicator();
	getData("inbox");
});

socket.on('auctionRefresh', function (data) {
	console.log("REFRESH AUCTIONS!");
	auctionUpdateRequested = true;
});