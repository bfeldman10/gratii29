$(function(){

    $.ajaxSetup ({
        // Disable caching of AJAX responses
        cache: false,
        xhrFields: {
            withCredentials: true
        }
    });

	window.adminApp = {
		Models: {},
		Collections: {},
		Views: {},
		Router: {},
        Data: {},
        UI: {},
        UIState: {},
        User: {},
        Settings: {}

    };


    adminApp.User.id = null;
    adminApp.User.nickname = null;
    adminApp.User.loggedIn = false;

    adminApp.UIState.currentRoute = 'login';
    adminApp.UIState.currentField = '';
    adminApp.UIState.currentQuery = '';

    // adminApp.Settings.apiBaseURL = 'http://10.1.1.106/gratii-app/laravel/public/api/v1/';
    adminApp.Settings.apiBaseURL = '../backend/public/api/v1/';


    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------








    // -- START - engagement line graph

    adminApp.Data.initEngagementOverview = function(clientID, graphType){

        var totalData   = 5;
        var curData     = 1;

        // -------------------

        var bidRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/bids/daily?days=30",
            dataType: 'json',
        });

        bidRequest.done(function(response, textStatus, jqXHR) {
            adminApp.Data.engagementOverviewBids = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderEngagementOverview(graphType);
        });

        bidRequest.fail(function(resp, textStatus, jqXHR) {
            $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

        // -------------------

        var likeRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/likes/daily?days=30",
            dataType: 'json',
        });

        likeRequest.done(function(response, textStatus, jqXHR) {
            adminApp.Data.engagementOverviewLikes = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderEngagementOverview(graphType);
        });

        likeRequest.fail(function(resp, textStatus, jqXHR) {
            $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

        // -------------------

        var followRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/follows/daily?days=30",
            dataType: 'json',
        });

        followRequest.done(function(response, textStatus, jqXHR) {
            adminApp.Data.engagementOverviewFollows = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderEngagementOverview(graphType);
        });

        followRequest.fail(function(resp, textStatus, jqXHR) {
            $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

        // -------------------

        var clickRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/clickthrus/daily?days=30",
            dataType: 'json',
        });

        clickRequest.done(function(response, textStatus, jqXHR) {
            adminApp.Data.engagementOverviewClickers = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderEngagementOverview(graphType);
        });

        clickRequest.fail(function(resp, textStatus, jqXHR) {
            $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

    };


    adminApp.Data.renderEngagementOverview = function(graphType){
        // alert('here');

        //convert unix timestamp to js date - var date = new Date([UNIX Timestamp] * 1000);

        //ALL ff0000
        //FB 007eff
        //TWI 00c0ff
        //bid a200ff
        //click 18ff00
        var lineColors = ['#ff0000'];



        adminApp.Data.allEngagementOverviewData = null;

        if (graphType === "all") {
            // adminApp.Data.allEngagementOverviewData = adminApp.Data.engagementOverviewBids.concat(adminApp.Data.engagementOverviewLikes, adminApp.Data.engagementOverviewFollows, adminApp.Data.engagementOverviewClickthrus);

            var tempTally = new Array();

            var c = 0;
            _.each(adminApp.Data.engagementOverviewBids, function(dayObject, key, list){
                // console.log( 'dayObject' );
                // console.log( dayObject );
                tempTally[c] = parseInt(dayObject.count);
                c++;
            });
            // console.log( tempTally );
            c = 0;
            _.each(adminApp.Data.engagementOverviewLikes, function(dayObject, key, list){
                tempTally[c] += parseInt(dayObject.count);
                c++;
            });
            // console.log( tempTally );
            c = 0;
            _.each(adminApp.Data.engagementOverviewFollows, function(dayObject, key, list){
                tempTally[c] += parseInt(dayObject.count);
                c++;
            });
            // console.log( tempTally );
            adminApp.Data.allEngagementOverviewData = [];
            c = 0;
            _.each(adminApp.Data.engagementOverviewClickers, function(dayObject, key, list){
                tempTally[c] += parseInt(dayObject.count);
                var tallyObject = {};
                tallyObject.unixTimestamp = dayObject.unixTimestamp;
                tallyObject.count = tempTally[c];
                adminApp.Data.allEngagementOverviewData.push(tallyObject);
                c++;
            });

            // console.log( tempTally );
            // console.log( adminApp.Data.allEngagementOverviewData );

            // return;

        }

        if (graphType === "bidders") {
            lineColors = ['#a200ff'];
            adminApp.Data.allEngagementOverviewData = adminApp.Data.engagementOverviewBids;
        }
        if (graphType === "likers") {
            lineColors = ['#007eff'];
            adminApp.Data.allEngagementOverviewData = adminApp.Data.engagementOverviewLikes;
        }
        if (graphType === "followers") {
            lineColors = ['#00c0ff'];
            adminApp.Data.allEngagementOverviewData = adminApp.Data.engagementOverviewFollows;
        }
        if (graphType === "clickers") {
            lineColors = ['#18ff00'];
            adminApp.Data.allEngagementOverviewData = adminApp.Data.engagementOverviewClickers;
        }

        console.log( adminApp.Data.allEngagementOverviewData );

        var index = 0;
        var chartData = [];
        var dataLabels = [];

        _.each(adminApp.Data.allEngagementOverviewData, function(dayObject, key, list){

            var date = new Date(dayObject.unixTimestamp * 1000);
            // console.log( date );
            // console.log( date.getMonth() );
            var dateString = date.getMonth()+1 + "/" + date.getDate();

            chartData.push([index, dayObject.count]);
            dataLabels.push([index, dateString]);

            index++;
        });

        console.log( chartData );


      /*  var dataLabels = [
         [0, "preteen"],
         [1, "13-17"],
         [2, "18-20"],
         [3, "21-25"],
         [4, "26-30"],
         [5, "31-40"],
         [6, "41-50"],
         [7, "51-60"],
         [8, "60+"],
        ];

        var chartData = [
         [0, preteen],
         [1, thirteenSeventeen],
         [2, eighteenTwenty],
         [3, twentyOneTwentyFive],
         [4, twentySixThirty],
         [5, thirtyOneFourty],
         [6, fourtyOneFifty],
         [7, fiftyOneSixty],
         [8,sixtyPlus]
        ];*/

        $.plot($("#engagement-overview-graph"), [
            {
               data: chartData,
               lines: { show: true, fill: true }
            }
        ],{
            xaxis: {
                ticks: dataLabels
            },
            yaxis: {
                // ticks: 10,
                // min: 0,
                // max: 200
            },
            // colors:['red','orange','green','blue','purple']
            colors: lineColors,

        }
        );

    };

    // -- END - engagement line graph











    adminApp.User.getNickname = function(){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+adminApp.User.id,
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            console.log( response );
            adminApp.User.nickname = response.results.clientName;
            $('.navbar .navbar-nickname').text(adminApp.User.nickname);
            $('.navbar .navbar-text').fadeIn(100);
        });

        request.fail(function(resp, textStatus, jqXHR) {
        });

    };


    adminApp.User.checkSession = function(){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/session",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            // alert('session exists');
            // window.location = '#dashboard';
            console.log( response );
            console.log( response.results.entity );
            if (response.results.entity !== "client") {
                // alert('no session');
                adminApp.User.loggedIn = false;
                window.location = '#login';
            }else{
                // $('.navbar .navbar-nickname').text(adminApp.User.nickname);
                // $('.navbar .navbar-text').fadeIn(100);


                adminApp.User.loggedIn = true;
                adminApp.User.id = response.results.id;

                adminApp.User.getNickname();

                var location = "#"+adminApp.UIState.currentRoute;
                if(adminApp.UIState.currentField !== '') location += '/'+adminApp.UIState.currentField;
                if(adminApp.UIState.currentQuery !== '') location += '/'+adminApp.UIState.currentQuery;
                window.location = location;
            }

        });

        request.fail(function(resp, textStatus, jqXHR) {
            // alert('no session');
            adminApp.User.loggedIn = false;
            window.location = '#login';
        });

    };


    adminApp.Data.initSurveyAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/surveys/responses",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.renderSurveys(response.results);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("You don't have any surveys in the Gratii system right now.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };

    adminApp.Data.initSurveyResultsAnalytics = function(){

        // var request = $.ajax({
        //     type: "GET",
        //     url: adminApp.Settings.apiBaseURL + "client/"+adminApp.User.id+"/surveys/responses",
        //     dataType: 'json',
        // });

        // request.done(function(response, textStatus, jqXHR) {
        //     adminApp.Data.renderSurveyResults(response.results);
        // });

        // request.fail(function(resp, textStatus, jqXHR) {
        //     if (resp.responseJSON.msg === "404") {
        //         $.bootstrapGrowl("You don't have any survey results in the Gratii system right now.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        //     }
        //     else{
        //         $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        //     }
        // });

    };


    adminApp.Data.renderSurveys = function(data){

        var items = '<tr><th>Survey Question</th><th>Option A</th><th>Option B</th><th>Option C</th><th>Reward Offered</th></tr>';
        var c = 0;

        _.each(data, function(surveyObject, key, list){

            items += '<tr id="item-'+c+'" data-id="'+c+'" class="survey-item">';

            items += '<td rowspan="2"><h5>'+surveyObject.body+'</h5></td><td class="op-td">'+surveyObject.optionA+'</td><td class="op-td">'+surveyObject.optionB+'</td><td class="op-td">'+surveyObject.optionC+'</td>';

            items += '<td>'+surveyObject.gratiiReward+'</td>';
            items += '</tr>';

            items += '<tr id="item-res-'+c+'"><td colspan="3"><div id="result-graph-'+c+'" class="survey-graph"></div><div><p class="survey-results"><strong>Option A:</strong> <span class="op-a-res">'+surveyObject.responses.optionATotal+'</span> <strong>Option B:</strong> <span class="op-b-res">'+surveyObject.responses.optionBTotal+'</span> <strong>Option C:</strong> <span class="op-c-res">'+surveyObject.responses.optionCTotal+'</span> <strong>Pending:</strong> <span class="pending-res">'+surveyObject.responses.pendingTotal+'</span></p></div></td><td>&nbsp;</td></tr>';
            c++;
        });

        $('.surveys-table').append(items);

        // adminApp.Data.initSurveyResultsAnalytics();

        var c = 0;

        _.each(data, function(surveyObject, key, list){

            var $selector = $('#result-graph-'+c);
            var pending = surveyObject.responses.pendingTotal;

            $('#item-res-'+c+' .op-a-res').text(surveyObject.responses.optionATotal);
            $('#item-res-'+c+' .op-b-res').text(surveyObject.responses.optionBTotal);
            $('#item-res-'+c+' .op-c-res').text(surveyObject.responses.optionCTotal);

            $('#item-res-'+c+' .pending-res').text(surveyObject.responses.pendingTotal);

            var dataLabels = [
            [0, "C"],
            [1, "B"],
            [2, "A"]
            ];

            var chartData = [
            [surveyObject.responses.optionCTotal, 0],
            [surveyObject.responses.optionBTotal, 1],
            [surveyObject.responses.optionATotal, 2]
            ];

            $.plot($selector, [
                {
                   data: chartData,
                   bars: { show: true, horizontal:true }
                }
            ],{
                xaxis: {
                    ticks: 0
                },
                yaxis: {
                    // ticks: 0,
                    ticks: dataLabels
                    // min: 0,
                    // max: 200
                },
                colors:['#00a651']
            }
            );

            c++;
        });

    };

    /*adminApp.Data.renderSurveyResults = function(data){

        var c = 0;

        _.each(data, function(surveyObject, key, list){

            var $selector = $('#result-graph-'+c);
            var pending = surveyObject.pendingTotal;

            $('#item-res-'+c+' .op-a-res').text(surveyObject.optionATotal);
            $('#item-res-'+c+' .op-b-res').text(surveyObject.optionBTotal);
            $('#item-res-'+c+' .op-c-res').text(surveyObject.optionCTotal);

            $('#item-res-'+c+' .pending-res').text(surveyObject.pendingTotal);

            var dataLabels = [
            [0, "A"],
            [1, "B"],
            [2, "C"]
            ];

            var chartData = [
            [0, surveyObject.optionATotal],
            [1, surveyObject.optionBTotal],
            [2, surveyObject.optionCTotal]
            ];

            $.plot($selector, [
                {
                   data: chartData,
                   bars: { show: true }
                }
            ],{
                xaxis: {
                    ticks: dataLabels
                },
                yaxis: {
                    ticks: 0,
                    // min: 0,
                    // max: 200
                },
                colors:['#00a651']
            }
            );

            c++;
        });

    };*/





    adminApp.Data.initInventory = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/inventory",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            console.log( response.results );
            var items = '';
            _.each(response.results, function(inventoryObject, key, list){

                items += '<tr id="item-'+inventoryObject.promoID+'" data-id="'+inventoryObject.promoID+'" class="inventory-item">';

                if (inventoryObject.promoPic !== "---") {
                    items += '<td class="img-td"><img src="../app/images/auctions/'+inventoryObject.promoPic+'" alt="" /></td>';
                }
                else{
                    items += '<td class="img-td"></td>';
                }

                items += '<td><h5>'+inventoryObject.promoName+'</h5></td><td>'+inventoryObject.distributed.length+'</td><td>'+inventoryObject.pending.length+'</td>';

                items += '<td><a href="#user-engagement/'+inventoryObject.promoID+'/bidders">View Demographics</a></td>';
                items += '</tr>';
            });

            $('.inventory-table').append(items);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("You don't have any inventory in the Gratii system right now.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };



    adminApp.Data.getConversionDataForPromo = function(promoID){

        var $selector = $('.promo-table #promo-'+promoID+' .total-bids');

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/bids",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            console.log( 'BIDS for ' + promoID );
            console.log( response.results.length );
            console.log( '--' );
            $selector.text(response.results.length);
        });

        request.fail(function(resp, textStatus, jqXHR) {
           if (resp.responseJSON.msg === "404") {
                // $.bootstrapGrowl("No promotion data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                $selector.text('0');
           }
           else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
        });

    };


    adminApp.Data.initAndRenderPromoConversions = function(){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+adminApp.User.id+"/promos",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {

            _.each(response.results, function(promoObject, key, list){
                var item = '<tr id="promo-'+promoObject.id+'"><td>'+promoObject.promoName+'</td><td class="total-bids"></td></tr>';
                $('.promo-table').append(item);
                adminApp.Data.getConversionDataForPromo(promoObject.id);
            });

        });

        request.fail(function(resp, textStatus, jqXHR) {
           if (resp.responseJSON.msg === "404") {
               $.bootstrapGrowl("No promotion data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
           else{
               $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
        });

    };


    adminApp.Data.initAndRenderSocial = function(clientID){

        adminApp.Data.initAndRenderPromoConversions();


        var requestFacebook = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/facebooks",
            dataType: 'json',
        });

        requestFacebook.done(function(response, textStatus, jqXHR) {
            adminApp.Data.clientFacebooks = response.results;
            console.log( 'SUCCESS' );
            console.log( adminApp.Data.clientFacebooks );
            adminApp.UI.renderSocialItems("fb", adminApp.Data.clientFacebooks);
        });

        requestFacebook.fail(function(resp, textStatus, jqXHR) {
           if (resp.responseJSON.msg === "404") {
               // $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
           else{
               $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
        });


        var requestTwitter = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/twitters",
            dataType: 'json',
        });

        requestTwitter.done(function(response, textStatus, jqXHR) {
            adminApp.Data.clientTwitters = response.results;
            console.log( 'SUCCESS' );
            console.log( adminApp.Data.clientTwitters );
            adminApp.UI.renderSocialItems("twitter", adminApp.Data.clientTwitters);
        });

        requestTwitter.fail(function(resp, textStatus, jqXHR) {
           if (resp.responseJSON.msg === "404") {
               // $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
           else{
               $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
        });



        var requestWebsite = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/websites",
            dataType: 'json',
        });

        requestWebsite.done(function(response, textStatus, jqXHR) {
            adminApp.Data.clientWebsites = response.results;
            console.log( 'SUCCESS' );
            console.log( adminApp.Data.clientWebsites );
            adminApp.UI.renderSocialItems("web", adminApp.Data.clientWebsites);
        });

        requestWebsite.fail(function(resp, textStatus, jqXHR) {
           if (resp.responseJSON.msg === "404") {
               // $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
           else{
               $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
           }
        });

    };

    adminApp.Data.retrieveTotalLikesForItem = function(itemID, itemDOMID){
        console.log( 'Fetching Likes for Item: ' + itemID );
        console.log( 'With DOM ID: ' + itemDOMID );

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/facebook/"+itemID+"/likers",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            console.log( response.results.length );
            var text = "We've generated <strong>"+response.results.length+" new likes</strong> for this page.";
            $('#'+itemDOMID).append(text);
        });

        request.fail(function(resp, textStatus, jqXHR) {
        });

    };

    adminApp.Data.retrieveTotalFollowsForItem = function(itemID, itemDOMID){
        console.log( 'Fetching Follows for Item: ' + itemID );
        console.log( 'With DOM ID: ' + itemDOMID );

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/twitter/"+itemID+"/followers",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            console.log( response.results.length );
            var text = "We've generated <strong>"+response.results.length+" new followers</strong> for this account.";
            $('#'+itemDOMID).append(text);
        });

        request.fail(function(resp, textStatus, jqXHR) {
        });

    };

    adminApp.Data.retrieveTotalClickThrusForItem = function(itemID, itemDOMID){

        console.log( 'Fetching Click Thrus for Item: ' + itemID );
        console.log( 'With DOM ID: ' + itemDOMID );

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/website/"+itemID+"/clickthrus",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            console.log( response.results.length );
            var text = "We've generated <strong>"+response.results.length+" new visits</strong> for this site.";
            $('#'+itemDOMID).append(text);
        });

        request.fail(function(resp, textStatus, jqXHR) {
        });

    };


    adminApp.UI.renderSocialItems = function(type, data){

        var $selector = null;
        var items = '';

        switch(type){
            case "fb":
                $selector = $('.fb-row .facebook-table');
                _.each(data, function(socialObject, key, list){
                    items += '<tr data-id="'+socialObject.promoFacebookID+'" class="item"><td><a target="_blank" href="https://facebook.com/'+socialObject.promoFacebook+'">facebook.com/'+socialObject.promoFacebook+'</a></td><td id="item-'+socialObject.promoFacebookID+'"></td></tr>';
                    adminApp.Data.retrieveTotalLikesForItem(socialObject.promoFacebookID, "item-"+socialObject.promoFacebookID);
                });
                $selector.append(items);
            break;
            case "twitter":
                $selector = $('.twitter-row .twitter-table');
                _.each(data, function(socialObject, key, list){
                    items += '<tr data-id="'+socialObject.promoTwitterID+'" class="item"><td><a target="_blank" href="https://twitter.com/'+socialObject.promoTwitter+'">twitter.com/'+socialObject.promoTwitter+'</a></td><td id="item-'+socialObject.promoTwitterID+'"></td></tr>';
                    adminApp.Data.retrieveTotalFollowsForItem(socialObject.promoTwitterID, "item-"+socialObject.promoTwitterID);
                });
                $selector.append(items);
            break;
            case "web":
                $selector = $('.web-row .web-table');
                _.each(data, function(socialObject, key, list){
                    items += '<tr data-id="'+socialObject.promoWebsiteID+'" class="item"><td><a target="_blank" href="http://'+socialObject.promoWebsite+'">http://'+socialObject.promoWebsite+'</a></td><td id="item-'+socialObject.promoWebsiteID+'"></td></tr>';
                    adminApp.Data.retrieveTotalClickThrusForItem(socialObject.promoWebsiteID, "item-"+socialObject.promoWebsiteID);
                });
                $selector.append(items);
            break;
        }

    };









    adminApp.Data.downloadPromos = function (clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/inventory",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.promos = response.results;
            console.log( 'SUCCESS' );
            console.log( adminApp.Data.promos );
            adminApp.UI.renderPromoDropDown();
        });

        request.fail(function(resp, textStatus, jqXHR) {
            // alert("error loading client promos");
        });

    };

    adminApp.UI.renderPromoDropDown = function(field){

        var opt = '<option value="all">All Promotions</option>';
        _.each(adminApp.Data.promos, function(promoObject, key, list){
            opt += '<option value="'+promoObject.promoID+'">'+promoObject.promoName+'</option>';
        });
        $('#promo-select').append(opt);
        $('#promo-select option[value="'+adminApp.Data.curField+'"]').attr('selected','selected');

    };

    adminApp.UI.generateEngagementLink = function(){
        var field = $('#promo-select option:selected').val();
        var query = $('#view-select option:selected').val();
        console.log( field );
        console.log( query );
        window.location = '#user-engagement/'+field+'/'+query;
    };

    adminApp.UI.generateEngagementOverviewLink = function(){
        var field = $('#view-select option:selected').val();
        console.log( field );
        window.location = '#dashboard/'+field;
    };

    adminApp.UI.generateAuctionsLink = function(){
        var field = $('#view-select option:selected').val();
        console.log( field );
        window.location = '#auctions/'+field;
    };


    adminApp.Data.initAuctionAnalytics = function(clientID, typeID){

        var requestLikers = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "auction/"+typeID+"",
            dataType: 'json',
        });

        requestLikers.done(function(response, textStatus, jqXHR) {

            if (typeID === "past") {
                adminApp.Data.renderPastAuctions(response.results);
            }
            else if(typeID === "live"){
                adminApp.Data.renderLiveAuctions(response.results);

            }
            else if(typeID === "upnext"){
                adminApp.Data.renderNextAuctions(response.results);

            }

        });

        requestLikers.fail(function(resp, textStatus, jqXHR) {
            if (resp.status === 404) {
                $.bootstrapGrowl("No auctions of this type are currently in the system.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };


    adminApp.Data.renderPastAuctions = function(data){

        console.log( 'Rendering Auctions: ' + data );

        var items = '<tr><th>Photo</th><th>Auction Item</th><th>Bids</th><th>Winner Demographics</th><th>Details</th></tr>';

        _.each(data, function(auctionObject, key, list){

            // Split timestamp into [ Y, M, D, h, m, s ]
            var auctionTimeStart = auctionObject.startsAt.split(/[- :]/);
            // Apply each element to the Date function
            var auctionStartDate = new Date(auctionTimeStart[0], auctionTimeStart[1]-1, auctionTimeStart[2], auctionTimeStart[3], auctionTimeStart[4], auctionTimeStart[5]);

            // Split timestamp into [ Y, M, D, h, m, s ]
            var auctionTimeEnd = auctionObject.endsAt.split(/[- :]/);
            // Apply each element to the Date function
            var auctionEndDate = new Date(auctionTimeEnd[0], auctionTimeEnd[1]-1, auctionTimeEnd[2], auctionTimeEnd[3], auctionTimeEnd[4], auctionTimeEnd[5]);

            console.log( 'Auction starts at: ' + auctionStartDate);
            console.log( 'Auction ends at: '   + auctionEndDate);

            if (auctionObject.leaderGender == "m" || auctionObject.leaderGender == "f") {
                auctionObject.leaderGender = auctionObject.leaderGender.toUpperCase();
            }

            items += '<tr id="item-'+auctionObject.id+'" data-id="'+auctionObject.id+'" class="auction-item">';

            if (auctionObject.promoPic !== "---") {
                items += '<td class="img-td"><img src="../app/images/auctions/'+auctionObject.promoPic+'" alt="" /></td>';
            }
            else{
                items += '<td class="img-td"></td>';
            }

            items += '<td><h5>'+auctionObject.promoName+'</h5></td>';
            items += '<td><strong>Total Bids:</strong> '+auctionObject.totalBids+'<br><strong>Winning Bid:</strong> '+auctionObject.maxBid+'</td>';

            items += '<td><strong>'+auctionObject.leaderNickname+'</strong><br>'+auctionObject.leaderGender+' ('+auctionObject.leaderAgeMin+' - '+auctionObject.leaderAgeMax+')';

            if (auctionObject.leaderCity !== '-' && auctionObject.leaderState !== '-' && auctionObject.leaderCountry !== '-') {
                items += '<br>'+auctionObject.leaderCity+', '+auctionObject.leaderState+', '+auctionObject.leaderCountry;
            }

            items += '</td>';

            items += '<td><strong>Started:</strong> '+auctionStartDate.toDateString()+' - '+auctionStartDate.toTimeString()+'<br><strong>Ended:</strong> '+auctionEndDate.toDateString()+' - '+auctionEndDate.toTimeString()+'</td>';
            items += '</tr>';

        });

        $('.auction-table').append(items);

    };

    adminApp.Data.renderLiveAuctions = function(data){

        console.log( 'Rendering Live Auctions: ' + data );

        var items = '<tr><th>Photo</th><th>Auction Item</th><th>Bids</th><th>Details</th></tr>';

        _.each(data, function(auctionObject, key, list){

            // Split timestamp into [ Y, M, D, h, m, s ]
            var auctionTimeStart = auctionObject.startsAt.split(/[- :]/);
            // Apply each element to the Date function
            var auctionStartDate = new Date(auctionTimeStart[0], auctionTimeStart[1]-1, auctionTimeStart[2], auctionTimeStart[3], auctionTimeStart[4], auctionTimeStart[5]);

            // Split timestamp into [ Y, M, D, h, m, s ]
            var auctionTimeEnd = auctionObject.endsAt.split(/[- :]/);
            // Apply each element to the Date function
            var auctionEndDate = new Date(auctionTimeEnd[0], auctionTimeEnd[1]-1, auctionTimeEnd[2], auctionTimeEnd[3], auctionTimeEnd[4], auctionTimeEnd[5]);

            console.log( 'Auction starts at: ' + auctionStartDate);
            console.log( 'Auction ends at: '   + auctionEndDate);

            // if (auctionObject.leaderGender == "m" || auctionObject.leaderGender == "f") {
            //     auctionObject.leaderGender = auctionObject.leaderGender.toUpperCase();
            // }

            items += '<tr id="item-'+auctionObject.id+'" data-id="'+auctionObject.id+'" class="auction-item">';

            if (auctionObject.promoPic !== "---") {
                items += '<td class="img-td"><img src="../app/images/auctions/'+auctionObject.promoPic+'" alt="" /></td>';
            }
            else{
                items += '<td class="img-td"></td>';
            }

            items += '<td><h5>'+auctionObject.promoName+'</h5></td>';
            items += '<td><strong>Total Bids:</strong> '+auctionObject.totalBids+'<br><strong>Leading Bid:</strong> '+auctionObject.maxBid+'</td>';

            //items += '<td><strong>'+auctionObject.leaderNickname+'</strong><br>'+auctionObject.leaderGender+' ('+auctionObject.leaderAgeMin+' - '+auctionObject.leaderAgeMax+')';

            //if (auctionObject.leaderCity !== '-' && auctionObject.leaderState !== '-' && auctionObject.leaderCountry !== '-') {
                //items += '<br>'+auctionObject.leaderCity+', '+auctionObject.leaderState+', '+auctionObject.leaderCountry;
            //}

            items += '</td>';

            items += '<td><strong>Started:</strong> '+auctionStartDate.toDateString()+' - '+auctionStartDate.toTimeString()+'<br><strong>Ends at:</strong> '+auctionEndDate.toDateString()+' - '+auctionEndDate.toTimeString()+'</td>';
            items += '</tr>';

        });

        $('.auction-table').append(items);

    };

    adminApp.Data.renderNextAuctions = function(data){

        console.log( 'Rendering Next Auctions: ' + data );

        var items = '<tr><th>Photo</th><th>Auction Item</th><th>Details</th></tr>';

        _.each(data, function(auctionObject, key, list){

            // Split timestamp into [ Y, M, D, h, m, s ]
            var auctionTimeStart = auctionObject.startsAt.split(/[- :]/);
            // Apply each element to the Date function
            var auctionStartDate = new Date(auctionTimeStart[0], auctionTimeStart[1]-1, auctionTimeStart[2], auctionTimeStart[3], auctionTimeStart[4], auctionTimeStart[5]);

            // Split timestamp into [ Y, M, D, h, m, s ]
            var auctionTimeEnd = auctionObject.endsAt.split(/[- :]/);
            // Apply each element to the Date function
            var auctionEndDate = new Date(auctionTimeEnd[0], auctionTimeEnd[1]-1, auctionTimeEnd[2], auctionTimeEnd[3], auctionTimeEnd[4], auctionTimeEnd[5]);

            console.log( 'Auction starts at: ' + auctionStartDate);
            console.log( 'Auction ends at: '   + auctionEndDate);

            // if (auctionObject.leaderGender == "m" || auctionObject.leaderGender == "f") {
            //     auctionObject.leaderGender = auctionObject.leaderGender.toUpperCase();
            // }

            items += '<tr id="item-'+auctionObject.id+'" data-id="'+auctionObject.id+'" class="auction-item">';

            if (auctionObject.promoPic !== "---") {
                items += '<td class="img-td"><img src="../app/images/auctions/'+auctionObject.promoPic+'" alt="" /></td>';
            }
            else{
                items += '<td class="img-td"></td>';
            }

            items += '<td><h5>'+auctionObject.promoName+'</h5></td>';
            //items += '<td>Total Bids: '+auctionObject.totalBids+'<br>Leading Bid: '+auctionObject.maxBid+'</td>';

            //items += '<td><strong>'+auctionObject.leaderNickname+'</strong><br>'+auctionObject.leaderGender+' ('+auctionObject.leaderAgeMin+' - '+auctionObject.leaderAgeMax+')';

            //if (auctionObject.leaderCity !== '-' && auctionObject.leaderState !== '-' && auctionObject.leaderCountry !== '-') {
                //items += '<br>'+auctionObject.leaderCity+', '+auctionObject.leaderState+', '+auctionObject.leaderCountry;
            //}

            items += '</td>';

            items += '<td><strong>Starts:</strong> '+auctionStartDate.toDateString()+' - '+auctionStartDate.toTimeString()+'<br><strong>Ends at:</strong> '+auctionEndDate.toDateString()+' - '+auctionEndDate.toTimeString()+'</td>';
            items += '</tr>';

        });

        $('.auction-table').append(items);

    };



    adminApp.Data.initAllAnalytics = function(clientID){

        var totalData = 5;
        var curData = 1;

        var requestLikers = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/likers",
            dataType: 'json',
        });

        requestLikers.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
        });

        requestLikers.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No Facebook likes data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                curData++;
                if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestFollowers = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/followers",
            dataType: 'json',
        });

        requestFollowers.done(function(response, textStatus, jqXHR) {
            adminApp.Data.followers = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
        });

        requestFollowers.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No Twitter follower data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                curData++;
                if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestBidders = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/bidders",
            dataType: 'json',
        });

        requestBidders.done(function(response, textStatus, jqXHR) {
            adminApp.Data.bidders = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
        });

        requestBidders.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No bidder data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                curData++;
                if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestClickers = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/clickers",
            dataType: 'json',
        });

        requestClickers.done(function(response, textStatus, jqXHR) {
            adminApp.Data.clickers = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
        });

        requestClickers.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No click-thru data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                curData++;
                if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };


    adminApp.Data.initAllAnalyticsForPromo = function(clientID, promoID){

        var totalData = 5;
        var curData = 1;

        var requestLikers = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/likers",
            dataType: 'json',
        });

        requestLikers.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
        });

        requestLikers.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No Facebook Likes data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                curData++;
                if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestFollowers = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/followers",
            dataType: 'json',
        });

        requestFollowers.done(function(response, textStatus, jqXHR) {
            adminApp.Data.followers = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
        });

        requestFollowers.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No Twitter follower data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                curData++;
                if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestBidders = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/bidders",
            dataType: 'json',
        });

        requestBidders.done(function(response, textStatus, jqXHR) {
            adminApp.Data.bidders = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
        });

        requestBidders.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No bidder data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                curData++;
                if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestClickers = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/clickers",
            dataType: 'json',
        });

        requestClickers.done(function(response, textStatus, jqXHR) {
            adminApp.Data.clickers = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
        });

        requestClickers.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No click-thru data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                curData++;
                if (curData == totalData) adminApp.Data.renderAllAnalyticsData();
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };





    adminApp.Data.renderAllAnalyticsData = function(){

        // alert('rendering all data');

        console.log( 'Likers:' );
        console.log( adminApp.Data.likers );
        console.log( 'Followers:' );
        console.log( adminApp.Data.followers );
        console.log( 'Bidders:' );
        console.log( adminApp.Data.bidders );
        console.log( 'Clickers:' );
        console.log( adminApp.Data.clickers );

        var tData = [];

        if (adminApp.Data.likers !== undefined) {
            // adminApp.Data.likers = "";
            tData = tData.concat(adminApp.Data.likers);
        }
        if (adminApp.Data.followers !== undefined) {
            // adminApp.Data.followers = "";
            tData = tData.concat(adminApp.Data.followers);
        }
        if (adminApp.Data.bidders !== undefined) {
            // adminApp.Data.bidders = "";
            tData = tData.concat(adminApp.Data.bidders);
        }
        if (adminApp.Data.clickers !== undefined) {
            // adminApp.Data.clickers = "";
            tData = tData.concat(adminApp.Data.clickers);
        }

        console.log( tData );


        // adminApp.Data.allData = adminApp.Data.likers.concat(adminApp.Data.followers, adminApp.Data.bidders, adminApp.Data.clickers);
        adminApp.Data.allData = tData;

        console.log( 'All: ' );
        console.log( adminApp.Data.allData );

        adminApp.Data.mapAnalyticsData(adminApp.Data.allData, adminApp.UI.map);
        adminApp.Data.chartAgeDemoraphics(adminApp.Data.allData);
        adminApp.Data.chartGenderDemoraphics(adminApp.Data.allData);
    };




    adminApp.Data.initLikerAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/likers",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            adminApp.Data.mapAnalyticsData(adminApp.Data.likers, adminApp.UI.map);
            adminApp.Data.chartAgeDemoraphics(adminApp.Data.likers);
            adminApp.Data.chartGenderDemoraphics(adminApp.Data.likers);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };
    adminApp.Data.initLikerAnalyticsForPromo = function(clientID, promoID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/likers",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            adminApp.Data.mapAnalyticsData(adminApp.Data.likers, adminApp.UI.map);
            adminApp.Data.chartAgeDemoraphics(adminApp.Data.likers);
            adminApp.Data.chartGenderDemoraphics(adminApp.Data.likers);
        });

        request.fail(function(resp, textStatus, jqXHR) {

            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }

        });

    };


    adminApp.Data.initFollowerAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/followers",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            adminApp.Data.mapAnalyticsData(adminApp.Data.likers, adminApp.UI.map);
            adminApp.Data.chartAgeDemoraphics(adminApp.Data.likers);
            adminApp.Data.chartGenderDemoraphics(adminApp.Data.likers);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };
    adminApp.Data.initFollowerAnalyticsForPromo = function(clientID, promoID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/followers",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            adminApp.Data.mapAnalyticsData(adminApp.Data.likers, adminApp.UI.map);
            adminApp.Data.chartAgeDemoraphics(adminApp.Data.likers);
            adminApp.Data.chartGenderDemoraphics(adminApp.Data.likers);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };


    adminApp.Data.initBidderAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/bidders",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            adminApp.Data.mapAnalyticsData(adminApp.Data.likers, adminApp.UI.map);
            adminApp.Data.chartAgeDemoraphics(adminApp.Data.likers);
            adminApp.Data.chartGenderDemoraphics(adminApp.Data.likers);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };
    adminApp.Data.initBidderAnalyticsForPromo = function(clientID, promoID){
        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/bidders",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            adminApp.Data.mapAnalyticsData(adminApp.Data.likers, adminApp.UI.map);
            adminApp.Data.chartAgeDemoraphics(adminApp.Data.likers);
            adminApp.Data.chartGenderDemoraphics(adminApp.Data.likers);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });
    };


    adminApp.Data.initClickerAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "client/"+clientID+"/clickers",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            adminApp.Data.mapAnalyticsData(adminApp.Data.likers, adminApp.UI.map);
            adminApp.Data.chartAgeDemoraphics(adminApp.Data.likers);
            adminApp.Data.chartGenderDemoraphics(adminApp.Data.likers);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };
    adminApp.Data.initClickerAnalyticsForPromo = function(clientID, promoID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.apiBaseURL + "promo/"+promoID+"/clickers",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.likers = response.results;
            adminApp.Data.mapAnalyticsData(adminApp.Data.likers, adminApp.UI.map);
            adminApp.Data.chartAgeDemoraphics(adminApp.Data.likers);
            adminApp.Data.chartGenderDemoraphics(adminApp.Data.likers);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No engagement data is currently available.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request. Please contact the Gratii team.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };






    adminApp.Data.mapAnalyticsData = function(data, map){

        /*var tempMarkers = new Array();*/
        var testMarkers = [];

        _.each(data, function(userObject, key, list){

           // console.log( 'user..' );
           // console.log( userObject );

           if(userObject.userLat !== "---" && userObject.userLong != "---"){

               var myLatlng = new google.maps.LatLng(userObject.userLat,userObject.userLong);

               var contentString = '<div>';
               contentString += '<span class="nickname">User: '+userObject.userNickname+'</span><br>';
               contentString += '<span class="age">Age Group: '+userObject.userAgeMin+' - '+userObject.userAgeMax+'</span><br>';
               contentString += '<span class="location">'+userObject.userCity+', '+userObject.userState+', '+userObject.userCountry+'</span>';
               contentString += '</div>';

               var infowindow = new google.maps.InfoWindow({
                   content: contentString,
                   // maxWidth: 200
               });

               console.log( 'Creating Marker for: ' + myLatlng );

               var marker = new google.maps.Marker({
                     position: myLatlng,
                     // map: map
               });
               testMarkers.push(marker);

              /* if (tempMarkers[myLatlng] != undefined) {
                tempMarkers[myLatlng].push(marker);
               }
               else{
                tempMarkers[myLatlng] = new Array();
                tempMarkers[myLatlng].push(marker);
               }*/


               // marker.setMap(map);

               google.maps.event.addListener(marker, 'click', function() {
                   infowindow.open(map,marker);
               });

               // console.log( 'added marker' );
           }
        });

        /*
        console.log( tempMarkers );
        for(key in tempMarkers) {
            console.log("key " + key + " has value " + tempMarkers[key]);
            console.log( tempMarkers[key].length );
            // if more than 1 create a map cluster // else just add the 1 marker to the map.
            if (tempMarkers[key].length === 1) {
                tempMarkers[key][0].setMap(map);
            }
            else{
                var mcOptions = {gridSize: 150, maxZoom: 15};
                // var markers = [...]; // Create the markers you want to add and collect them into a array.
                var mc = new MarkerClusterer(map, tempMarkers[key], mcOptions);
            }
        }
        */

        var mcOptions = {gridSize: 150, maxZoom: 15};
        // var markers = [...]; // Create the markers you want to add and collect them into a array.
        var mc = new MarkerClusterer(map, testMarkers, mcOptions);

    };



    adminApp.Data.chartAgeDemoraphics = function(data){

        var preteen=0;
        var thirteenSeventeen = 0;
        var eighteenTwenty = 0;
        var twentyOneTwentyFive =0;
        var twentySixThirty = 0;
        var thirtyOneFourty = 0;
        var fourtyOneFifty = 0;
        var fiftyOneSixty = 0;
        var sixtyPlus = 0;

        _.each(data, function(userObject, key, list){

            if (userObject.userAge < 13) {
                preteen++;
            }
            else if(userObject.userAge >=13 && userObject.userAge <= 17){
                thirteenSeventeen++;
            }
            else if(userObject.userAge >17 && userObject.userAge <= 20){
                eighteenTwenty++;
            }
            else if(userObject.userAge >20 && userObject.userAge <= 25){
                twentyOneTwentyFive++;
            }
            else if(userObject.userAge >25 && userObject.userAge <= 30){
                twentySixThirty++;
            }
            else if(userObject.userAge >30 && userObject.userAge <= 40){
                thirtyOneFourty++;
            }
            else if(userObject.userAge >40 && userObject.userAge <= 50){
                fourtyOneFifty++;
            }
            else if(userObject.userAge >50 && userObject.userAge <= 60){
                fiftyOneSixty++;
            }
            else{
                sixtyPlus++;
            }

        });

        var dataLabels = [
         [0, "preteen"],
         [1, "13-17"],
         [2, "18-20"],
         [3, "21-25"],
         [4, "26-30"],
         [5, "31-40"],
         [6, "41-50"],
         [7, "51-60"],
         [8, "60+"],
        ];

        var chartData = [
         [0, preteen],
         [1, thirteenSeventeen],
         [2, eighteenTwenty],
         [3, twentyOneTwentyFive],
         [4, twentySixThirty],
         [5, thirtyOneFourty],
         [6, fourtyOneFifty],
         [7, fiftyOneSixty],
         [8,sixtyPlus]
        ];

        $.plot($("#age-demo"), [
            {
               data: chartData,
               bars: { show: true }
            }
        ],{
            xaxis: {
                ticks: dataLabels
            },
            yaxis: {
                // ticks: 10,
                // min: 0,
                // max: 200
            },
            colors:['#005aff','#ff42eb','#4c4c4c']
        }
        );



    };


    adminApp.Data.chartGenderDemoraphics = function(data){

        console.log( 'charting gender demo' );
        console.log( adminApp.Data.followers );
        console.log( adminApp.Data.likers );

        var male    = 0;
        var female  = 0;
        var newwave = 0;

        _.each(data, function(userObject, key, list){
            console.log( "---> " + userObject.userGender );
            switch(userObject.userGender){
                case "m":
                    male++;
                break;
                case "f":
                    female++;
                break;
                default:
                    newwave++;
                break;
            }
        });


        var chartData = [
         { label: "Male",  data: male},
         { label: "Female",  data: female},
         { label: "Unknown",  data: newwave},
        ];

        $.plot('#gender-demo', chartData, {
            series: {
                  pie: {
                      show: true,
                      radius: 1,
                      label: {
                          show: true,
                          radius: 3/4,
                          formatter: adminApp.Data.labelFormatter,
                          background: {
                              opacity: 0.5
                          }
                      }
                  }
              },
          legend: {
              show: false
          },
          colors:['#005aff','#ff42eb','#4c4c4c']
        });

    };


    adminApp.Data.labelFormatter = function(label, series) {
        return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
    };





    adminApp.Models.GratiiClient = Backbone.Model.extend({
        urlRoot: '../laravel/public/api/v1/client',
        initialize: function(){
            console.log("GratiiClient Model is Initialized.");
        }
    });

    adminApp.Collections.GratiiClients = Backbone.Collection.extend({

        model: adminApp.Models.GratiiClient,
        url:   '../laravel/public/api/v1/client',
        dbName: 'clients',

        initialize: function(){
            console.log( 'clients collection initialized..' );
        },
        parse:function(response){
            return response.results;
        },
        search : function(letters, field){

            if(letters === "" || letters === null || letters === undefined || field === '' || field === null || field === undefined) return this;

            var pattern;
            if ( field.substring( field.length-2, field.length ).toLowerCase() === "id" ) {
                pattern = new RegExp("^"+letters+"$","gi");
            }else{
                pattern = new RegExp(letters,"gi");
            }

            return _(this.filter(function(data) {
                return pattern.test(data.get(""+field+""));
            }));
        }
    });

    adminApp.gratiiClients = new adminApp.Collections.GratiiClients();







    /* Routing ------------------------------------------------------------------- */


    adminApp.Router = Backbone.Router.extend({
        routes: {

            "dashboard/:id": "loadDashboardHome",

            "auctions/:id": "auctions",

            "surveys": "surveys",

            "clients": "loadClientHome",
            "clients/edit/:id": "editClient",
            "clients/list": "loadClientHome",
            "clients/listquery/:id/:q": "loadClientHomeWithQuery",
            "clients/new": "addClient",

            "promo": "loadPromoHome",
            "promo/edit/:id": "editPromo",
            "promo/list": "loadPromoHome",
            "promo/listquery/:id/:q": "loadPromoHomeWithQuery",
            "promo/new": "addPromo",

            "auctions": "loadAuctionHome",
            "auctions/edit/:id": "editAuction",
            "auctions/list": "loadAuctionHome",
            "auctions/listquery/:id/:q": "loadAuctionHomeWithQuery",
            "auctions/new(/:promoID)": "addAuction",
            "auctions/createSchedule": "createSchedule",


            "social-media": "socialMedia",
            "your-inventory": "inventory",

            "user-engagement/:id/:q": "userEngagement",

            "*actions": "defaultRoute"
        }
    });



    var app_router = new adminApp.Router();




    app_router.on('route:defaultRoute', function () {

        window.setTimeout(function(e){
            $('#overlay').fadeOut(500);
        },400);

        console.log( "load default route." );
        $('.nav-tabs li').removeClass('active');

        $('#app-content').load('html/login.html', function() {

            $('#admin-login-form').bind('submit', function(e){
                e.preventDefault();

                var request = $.ajax({
                    type: "POST",
                    url: adminApp.Settings.apiBaseURL + "client/login",
                    dataType: 'json',
                    data: { clientEmail: $('#client-email').val(), clientPassword: $('#client-password').val() }
                });
                request.done(function(response, textStatus, jqXHR) {

                    $.bootstrapGrowl("Welcome.", { type: 'success',  delay: 3000, offset: {from: 'top', amount: 50} });
                    console.log( response.results );
                    adminApp.User.id = response.results.id;
                    adminApp.User.nickname = response.results.clientName;
                    adminApp.User.loggedIn = true;
                    $('.navbar .navbar-nickname').text(adminApp.User.nickname);
                    $('.navbar .navbar-text').fadeIn(100);
                    window.location = "#dashboard/all";
                });
                request.fail(function(resp, textStatus, jqXHR) {
                    adminApp.User.loggedIn = false;
                    $.bootstrapGrowl("Error: " + resp.responseJSON.msg, { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                });

            });

        });

    });

    app_router.on('route:socialMedia', function () {

        if ( adminApp.User.loggedIn === false) {
            //Save for later if they are logged in but the call has yet to be made.

            adminApp.UIState.currentRoute = 'social-media';
            adminApp.UIState.currentField = '';
            adminApp.UIState.currentQuery = '';
            window.location = '#';
            return;
        }

        adminApp.initSocialMediaPage();

    });

    app_router.on('route:inventory', function () {

        if ( adminApp.User.loggedIn === false) {
            //Save for later if they are logged in but the call has yet to be made.

            adminApp.UIState.currentRoute = 'your-inventory';
            adminApp.UIState.currentField = '';
            adminApp.UIState.currentQuery = '';
            window.location = '#';
            return;
        }

        adminApp.initInventoryPage();

    });

    app_router.on('route:userEngagement', function (field,query) {

        if ( adminApp.User.loggedIn === false) {
            //Save for later if they are logged in but the call has yet to be made.

            adminApp.UIState.currentRoute = 'user-engagement';
            adminApp.UIState.currentField = field;
            adminApp.UIState.currentQuery = query;
            window.location = '#';
            return;
        }

        adminApp.initUserEngagementPage(field, query);

    });

    app_router.on('route:loadDashboardHome', function (field) {

        if ( adminApp.User.loggedIn === false) {
            //Save for later if they are logged in but the call has yet to be made.

            adminApp.UIState.currentRoute = 'dashboard';
            adminApp.UIState.currentField = field;
            adminApp.UIState.currentQuery = '';
            window.location = '#';
            return;
        }

        adminApp.initDashBoardPage(field);

    });

    app_router.on('route:auctions', function (field) {

        if ( adminApp.User.loggedIn === false) {
            //Save for later if they are logged in but the call has yet to be made.

            adminApp.UIState.currentRoute = 'auctions';
            adminApp.UIState.currentField = field;
            adminApp.UIState.currentQuery = '';
            window.location = '#';
            return;
        }

        adminApp.initAuctionsPage(field);

    });


    app_router.on('route:surveys', function () {

        if ( adminApp.User.loggedIn === false) {
            //Save for later if they are logged in but the call has yet to be made.

            adminApp.UIState.currentRoute = 'surveys';
            adminApp.UIState.currentField = '';
            adminApp.UIState.currentQuery = '';
            window.location = '#';
            return;
        }

        adminApp.initSurveysPage();

    });


    adminApp.initSurveysPage = function(){

        window.setTimeout(function(e){
            $('#overlay').fadeOut(500);
        },400);

        $('.nav-tabs li').removeClass('active');
        $('.nav-tabs #surveys-tab').addClass('active');

        $('#app-content').load('html/surveys.html', function() {

            // $('#view-select option[value="'+field+'"]').attr('selected','selected');
            // adminApp.Data.initEngagementOverview(adminApp.User.id, field);
            adminApp.Data.initSurveyAnalytics(adminApp.User.id);

            // alert(field);
            // $('#view-select').on('change', function (e) {
            //     adminApp.UI.generateAuctionsLink();
            // });

        });
    };


    adminApp.initAuctionsPage = function(field){

        window.setTimeout(function(e){
            $('#overlay').fadeOut(500);
        },400);

        $('.nav-tabs li').removeClass('active');
        $('.nav-tabs #auctions-tab').addClass('active');

        $('#app-content').load('html/auctions.html', function() {

            $('#view-select option[value="'+field+'"]').attr('selected','selected');
            // adminApp.Data.initEngagementOverview(adminApp.User.id, field);
            adminApp.Data.initAuctionAnalytics(adminApp.User.id, field);

            // alert(field);
            $('#view-select').on('change', function (e) {
                adminApp.UI.generateAuctionsLink();
            });

        });
    };


    adminApp.initDashBoardPage = function(field){

        window.setTimeout(function(e){
            $('#overlay').fadeOut(500);
        },400);

        $('.nav-tabs li').removeClass('active');
        $('.nav-tabs #dashboard-tab').addClass('active');

        $('#app-content').load('html/dashboard-home.html', function() {

            $('#view-select option[value="'+field+'"]').attr('selected','selected');
            adminApp.Data.initEngagementOverview(adminApp.User.id, field);

            // alert(field);
            $('#view-select').on('change', function (e) {
                adminApp.UI.generateEngagementOverviewLink();
            });

        });
    };

    adminApp.initSocialMediaPage = function(){

        console.log( "Loading Social Media Route." );

        window.setTimeout(function(e){
            $('#overlay').fadeOut(500);
        },400);

        $('.nav-tabs li').removeClass('active');
        $('.nav-tabs #social-media-tab').addClass('active');


        $('#app-content').load('html/social-media.html', function() {

            adminApp.Data.initAndRenderSocial(adminApp.User.id);

        });
    };

    adminApp.initInventoryPage = function(){

        console.log( "Loading Inventory Route." );

        window.setTimeout(function(e){
            $('#overlay').fadeOut(500);
        },400);

        $('.nav-tabs li').removeClass('active');
        $('.nav-tabs #inventory-tab').addClass('active');


        $('#app-content').load('html/inventory.html', function() {

            // adminApp.Data.initAndRenderSocial(1);
            adminApp.Data.initInventory(adminApp.User.id);

        });
    }


    adminApp.initUserEngagementPage = function(field,query){

        console.log( "Loading User Engagement Route. field="+field + " query=" + query );

        window.setTimeout(function(e){
            $('#overlay').fadeOut(500);
        },400);

        adminApp.Data.curField = field;
        adminApp.Data.curQuery = query;

        //var viewStatus = "You're viewing: People who have <strong>bid on</strong> any of your promotions on Gratii.";
        //view-status

        $('.nav-tabs li').removeClass('active');
        $('.nav-tabs #engagement-tab').addClass('active');

        $('#app-content').load('html/engagement.html', function() {



            var mapOptions = {
                center: new google.maps.LatLng(40.846374, -95.555450),
                zoom: 3,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            adminApp.UI.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

            // downloads data and displays
            // adminApp.Data.downloadEngagementAnalytics(1);
            // adminApp.Data.initLikerAnalytics(1);

            if (field == "all" && query == "all") {
                adminApp.Data.initAllAnalytics(adminApp.User.id);
            }
            if (field == "all" && query == "bidders"){
                adminApp.Data.initBidderAnalytics(adminApp.User.id);
            }
            if (field == "all" && query == "likers"){
                adminApp.Data.initLikerAnalytics(adminApp.User.id);
            }
            if (field == "all" && query == "followers"){
                adminApp.Data.initFollowerAnalytics(adminApp.User.id);
            }
            if (field == "all" && query == "clickers"){
                adminApp.Data.initClickerAnalytics(adminApp.User.id);
            }



            if (field !== "all" && query == "all") {
                adminApp.Data.initAllAnalyticsForPromo(adminApp.User.id, field);
            }
            if (field !== "all" && query == "bidders") {
                adminApp.Data.initBidderAnalyticsForPromo(adminApp.User.id, field);
            }
            if (field !== "all" && query == "likers") {
                adminApp.Data.initLikerAnalyticsForPromo(adminApp.User.id, field);
            }
            if (field !== "all" && query == "followers") {
                adminApp.Data.initFollowerAnalyticsForPromo(adminApp.User.id, field);
            }
            if (field !== "all" && query == "clickers") {
                adminApp.Data.initClickerAnalyticsForPromo(adminApp.User.id, field);
            }


            adminApp.Data.downloadPromos(adminApp.User.id);

            $('#view-select option[value="'+query+'"]').attr('selected','selected');


            //BINDINGS
            $('#view-select').on('change', function (e) {
                // var optionSelected = $("option:selected", this);
                // var valueSelected = this.value;
                // alert(valueSelected);
                // window.location = '#social-media/'+valueSelected+'/';
                adminApp.UI.generateEngagementLink();
            });
            $('#promo-select').on('change', function (e) {
                adminApp.UI.generateEngagementLink();
            });

        });

    };





    Backbone.history.start();



	adminApp.init = function(){
        adminApp.User.checkSession();

        adminApp.UIState.dataListMax = 50;
        adminApp.UIState.dataListStart = 0;
        //adminApp.UIState.activeDataSet = "clients";

        $('#logout-link').bind('click',function(e){
            e.preventDefault();

            var request = $.ajax({
                type: "GET",
                url: adminApp.Settings.apiBaseURL + "client/logout",
                dataType: 'json',
            });

            request.done(function(response, textStatus, jqXHR) {

                adminApp.User.loggedIn = false;
                adminApp.User.nickname = null;
                adminApp.User.id = null;

                $.bootstrapGrowl("You've been logged out.", { type: 'success',  delay: 3000, offset: {from: 'top', amount: 50} });
                window.location = '#login';

            });

            request.fail(function(resp, textStatus, jqXHR) {
                $.bootstrapGrowl("Woops. Error Loggin you out. Please Try Again.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });

            });
        });

	};

	$(function(){
		adminApp.init();
	});


});