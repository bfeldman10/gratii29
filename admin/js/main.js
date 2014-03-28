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
        Data: {},
		Router: {},
        UI: {},
        UIState: {},
        User: {},
        Settings: {}
    };

    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // adminApp.Settings.baseURL = 'http://10.1.1.106/gratii-app/laravel/public/api/v1/';
    adminApp.Settings.baseURL = '../backend/public/api/v1/';


    adminApp.UI.renderListPager = function(){

        console.log( 'rendering pager' );

        var pagerHtml = '<ul><li class="nextprev-btn"><a class="prev" href="#">Prev</a></li>';

        for (var i = 1; i <= adminApp.UIState.dataListPages; i++) {
            pagerHtml += '<li class="'+((i===1) ? "active" : "")+'"><a class="page" data-page="'+i+'" href="#'+i+'">'+i+'</a></li>';
        }
        pagerHtml += '<li class="nextprev-btn"><a class="next" href="#">Next</a></li></ul>';

        $('.pagination').html(pagerHtml);

        $('.pagination li a.page').bind('click', function(e){
            e.preventDefault();
            if ($(this).hasClass('active')) return;
            var pageCalc = $(this).attr('data-page')-1;
            adminApp.UIState.dataListStart = ( pageCalc * adminApp.UIState.dataListMax);
            adminApp.UI.renderList();
            $('.pagination .active').removeClass('active');
            $(this).parent().addClass('active');
        });
        $('.pagination li .prev').bind('click', function(e){
            e.preventDefault();
            if (adminApp.UIState.dataListStart > 0) adminApp.UIState.dataListStart -= adminApp.UIState.dataListMax;
            adminApp.UI.renderList();

            $prevPageBtn = $('.pagination .active').prev();

            if($prevPageBtn.hasClass('nextprev-btn') === false){
                $('.pagination .active').removeClass('active');
                $prevPageBtn.addClass('active');
            }
        });
        $('.pagination li .next').bind('click', function(e){
            e.preventDefault();
            if (adminApp.UIState.dataListStart < (adminApp.UIState.dataListTotal-adminApp.UIState.dataListMax) ) adminApp.UIState.dataListStart += adminApp.UIState.dataListMax;
            adminApp.UI.renderList();

            $nextPageBtn = $('.pagination .active').next();

            if($nextPageBtn.hasClass('nextprev-btn') === false){
                $('.pagination .active').removeClass('active');
                $nextPageBtn.addClass('active');
            }
        });
    };


    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    adminApp.UI.renderList = function(query, value){

        // adminApp.UIState.dataListTotal  = adminApp.UIState.activeDataSet.length;

        // if (query === undefined) query = '';
        // if (value === undefined) value = '';

        // adminApp.UIState.dataListTotal  = adminApp.UIState.activeDataSet.search(value,query)._wrapped.length;

        if (query && value) {
            adminApp.UIState.dataListTotal  = adminApp.UIState.activeDataSet.search(value,query)._wrapped.length;
            if (adminApp.UIState.dataListTotal === 0){
                $.bootstrapGrowl("No Results Found.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                return;
            }
        }else{
            adminApp.UIState.dataListTotal  = adminApp.UIState.activeDataSet.length;
        }

        // try{
        //     adminApp.UIState.dataListTotal  = adminApp.UIState.activeDataSet.search(value,query)._wrapped.length;
        // }
        // catch(e){
        //     adminApp.UIState.dataListTotal  = adminApp.UIState.activeDataSet.length;
        // }

        adminApp.UIState.dataListPages  = Math.ceil(adminApp.UIState.dataListTotal/adminApp.UIState.dataListMax);

        var clientDataRows;

        // Create List heading row.
        switch (adminApp.UIState.activeDataSet.dbName){
            case "clients":
                $('table').html('<tr><th>ID</th><th>Company Name</th><th>Email</th><th>Actions</th></tr>');
            break;
            case "promo":
                $('table').html('<tr><th>ID</th><th>Promo Name</th><th>Client Name</th><th>Actions</th></tr>');
            break;
            case "auction":
                $('table').html('<tr><th>ID</th><th>Promo Name</th><th>Client Name</th><th>Actions</th></tr>');
            break;
        }

        adminApp.UIState.activeDataSet.search(value,query).each(function(client,index){

            // Page Data
            if (index < adminApp.UIState.dataListStart || index >= (adminApp.UIState.dataListStart + adminApp.UIState.dataListMax)){
                return;
            }

            // Create Data Set Rows
            switch (adminApp.UIState.activeDataSet.dbName){
                case "clients":
                    clientDataRows += '<tr><td>'+client.get("id")+'</td><td>'+client.get("clientName")+'</td><td>'+client.get("clientEmail")+'</td><td><a href="#auctions/listquery/clientID/'+client.get("id")+'" class="btn btn-small">Auctions</a> <a href="#promo/listquery/clientID/'+client.get("id")+'" class="btn btn-small">Promos</a> <a href="#clients/edit/'+client.get("id")+'" class="btn btn-small"><i class="icon-edit"></i> View/Edit</a></td></tr>';
                break;
                case "promo":
                    clientDataRows += '<tr><td>'+client.get("id")+'</td><td>'+client.get("promoName")+'</td><td>'+client.get("clientName")+'</td><td><a href="#auctions/new/'+client.get("id")+'" class="btn btn-small">Add Auctions</a>  <a href="#auctions/listquery/promoID/'+client.get("id")+'" class="btn btn-small">View Auctions</a> <a href="#clients/listquery/id/'+client.get("clientID")+'" class="btn btn-small">Client</a> <a href="#promo/edit/'+client.get("id")+'" class="btn btn-small"><i class="icon-edit"></i> View/Edit</a></td></tr>';
                break;
                case "auction":
                    clientDataRows += '<tr><td>'+client.get("id")+'</td><td>'+client.get("promoName")+'</td><td>'+client.get("clientName")+'</td><td> <a href="#promo/listquery/id/'+client.get("promoID")+'" class="btn btn-small">Promo</a> <a href="#clients/listquery/id/'+client.get("clientID")+'" class="btn btn-small">Client</a></td></tr>';
                break;
            }

        });


        $('table').append(clientDataRows);

        if (adminApp.UIState.dataListStart === 0) adminApp.UI.renderListPager();

    };

    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    adminApp.setMainNav = function($id){
        $('.nav-pills .active').removeClass('active');
        $id.parent().addClass('active');
    };

    adminApp.initCrudNav = function(){
        $('#crud-nav li a').bind('click', function(){
            $('#crud-nav .active').removeClass('active');
            $(this).parent().addClass('active');
        });
    };

    adminApp.serializeFormAndCreate = function(){

        var formErrors = 0;
        var requiredFields;
        var successURLFragment = "#";

        switch(adminApp.UIState.activeDataSet.dbName){
            case "clients":
                requiredFields = ["client-name", "client-email", "client-password"];
                successURLFragment = "#clients/list";
            break;
            case "promo":
                requiredFields = ["client-name", "promo-name"];
                successURLFragment = "#promo/list";
                // This should be moved out & enhanced at some point.
                var clientNameOnForm = $('#client-name').val();
                if (clientNameOnForm !== undefined && clientNameOnForm !== "") {
                    var clientRecord = adminApp.gratiiClients.where({clientName: clientNameOnForm });
                    var clientID     = clientRecord[0].id;
                    $('#client-id').val(clientID);
                }
            break;
            case "auction":
                requiredFields = ["promo-id", "amount"];
                successURLFragment = "#auctions/list";
                var extIDs = $('#externel-id').val();
                var extIdsArray = extIDs.split(',');
                console.log( extIdsArray );
            break;
        }

        var dataSet = $('#add-new-form').serializeArray();

        // alert("serializing array");
        // console.log( dataSet );

        // console.log( 'dataset:' );
        // dataSet.splice(2, 1);
        // console.log( dataSet );
        if (adminApp.UIState.activeDataSet.dbName === "auction") {
            var externalIDs = new Object();
            externalIDs.name = "externalIDs";
            externalIDs.value = extIdsArray;
            // console.log( externalIDs );
            dataSet.push(externalIDs);
        }
        var cleanDataSet = {};

        $.each(requiredFields, function(key, fieldName) {
            if ($('#'+fieldName).val() === "") {
                formErrors = 1;
                $.bootstrapGrowl("Error: " + fieldName + ' is a required field.', { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });
        if (formErrors) return;

        $.each(dataSet, function(key, formObject) {
            cleanDataSet[formObject.name] = formObject.value;
        });

        // cleanDataSet = JSON.stringify(cleanDataSet);
        // console.log( cleanDataSet );

        // TODO - good now - wathc thi thogh
        // var newObject = new adminApp.Models.GratiiClient(cleanDataSet);
        var newObject = new adminApp.UIState.activeDataSet.model(cleanDataSet);

        newObject.save({},{
            success: function (userData, resp) {
                var newID = newObject.get("id");
                console.log( newID );
                window.location.href = successURLFragment;
                $.bootstrapGrowl("High-Five.", { type: 'success',  delay: 3000, offset: {from: 'top', amount: 50} });

            },
            error: function(model, resp){
                console.log( 'errror saving...!' );
                console.log( resp.responseJSON );
                $.bootstrapGrowl("Error: " + resp.responseJSON.msg, { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });

            }
        });

    };

    adminApp.serializeFormAndUpdate = function(gratiiModel){
        console.log( 'serialize and update' );

        var formErrors = 0;
        var requiredFields;
        var successURLFragment = "#";

        switch(adminApp.UIState.activeDataSet.dbName){
            case "clients":
                requiredFields = ["client-name", "client-email", "client-password"];
                successURLFragment = "#clients/list";
            break;
            case "promo":
                requiredFields = ["client-name", "promo-name"];
                successURLFragment = "#promo/list";
                // This should be moved out & enhanced at some point.
                var clientNameOnForm = $('#client-name').val();
                if (clientNameOnForm !== undefined && clientNameOnForm !== "") {
                    var clientRecord = adminApp.gratiiClients.where({clientName: clientNameOnForm });
                    var clientID     = clientRecord[0].id;
                    $('#client-id').val(clientID);
                }
            break;
            case "auction":
                requiredFields = ["promo-id", "amount"];
                successURLFragment = "#auctions/list";
            break;
        }

        var dataSet = $('#add-new-form').serializeArray();

        var cleanDataSet = {};

        $.each(requiredFields, function(key, fieldName) {
            if ($('#'+fieldName).val() === "") {
                formErrors = 1;
                $.bootstrapGrowl("Error: " + fieldName + ' is a required field.', { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        if (formErrors) return;

        $.each(dataSet, function(key, formObject) {
          cleanDataSet[formObject.name] = formObject.value;
        });

        gratiiModel.save(cleanDataSet,{
            success: function (userData, resp) {
                window.location.href = successURLFragment;
                $.bootstrapGrowl("High-Five. Updated Successfully.", { type: 'success',  delay: 3000, offset: {from: 'top', amount: 50} });

            },
            error: function(model, resp){
                $.bootstrapGrowl("Error: " + resp.responseJSON.msg, { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });

            }
        });

    };


    adminApp.Models.GratiiClient = Backbone.Model.extend({
        urlRoot: adminApp.Settings.baseURL + 'client',
        initialize: function(){
            console.log("GratiiClient Model is Initialized.");
        }
    });

    adminApp.Collections.GratiiClients = Backbone.Collection.extend({

        model: adminApp.Models.GratiiClient,
        url:   adminApp.Settings.baseURL + 'client',
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


    adminApp.Models.GratiiAuction = Backbone.Model.extend({
        urlRoot: adminApp.Settings.baseURL + 'auction',
        initialize: function(){
            console.log("GratiiAuction Model is Initialized.");
        }
    });

    adminApp.Collections.GratiiAuctions = Backbone.Collection.extend({

        model: adminApp.Models.GratiiAuction,
        // url:   adminApp.Settings.baseURL + 'auction',
        dbName: 'auction',

        url: function(){
           return this.instanceUrl;
        },
        changeURL: function(uri){
            // alert('changing uri');
            this.reset();
            this.instanceUrl = uri;
        },
        initialize: function(){
            console.log( 'auction collection initialized..' );
            this.instanceUrl = adminApp.Settings.baseURL + 'auction';
        },
        parse:function(response){
            return response.results;
        },
        search : function(letters, field){

            if(letters === "" || letters === null || letters === undefined || field === '' || field === null || field === undefined) return this;

            var pattern;
            if ( field.substring( field.length-2, field.length ).toLowerCase() === "id" ) {
                console.log( 'exact query for id' );
                pattern = new RegExp("^"+letters+"$","gi");
            }else{
                pattern = new RegExp(letters,"gi");
            }

            return _(this.filter(function(data) {
                return pattern.test(data.get(""+field+""));
            }));
        }
    });

    adminApp.gratiiAuctions = new adminApp.Collections.GratiiAuctions();


    adminApp.Models.GratiiPromo = Backbone.Model.extend({
        urlRoot: adminApp.Settings.baseURL + 'promo',
        initialize: function(){
            console.log("GratiiPromo Model is Initialized.");
        }
    });

    adminApp.Collections.GratiiPromos = Backbone.Collection.extend({

        model: adminApp.Models.GratiiPromo,
        dbName: 'promo',

        url: function(){
           return this.instanceUrl;
        },
        changeURL: function(uri){
            // alert('changing uri');
            this.reset();
            this.instanceUrl = uri;
        },
        initialize: function(){
            console.log( 'promo collection initialized..' );
            this.instanceUrl = adminApp.Settings.baseURL + 'promo';
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

    adminApp.gratiiPromos = new adminApp.Collections.GratiiPromos();

















    adminApp.Data.initLikerAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/likers",
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
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };

    adminApp.Data.initFollowerAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/followers",
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
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };

    adminApp.Data.initBidderAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/bidders",
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
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };

    adminApp.Data.initClickerAnalytics = function(clientID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/clickers",
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
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };

    adminApp.Data.initAllAnalytics = function(){

        alert('init all analytics');

        var totalData = 5;
        var curData = 1;

        var requestLikers = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/likers",
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
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestFollowers = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/followers",
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
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestBidders = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/bidders",
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
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

        var requestClickers = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/clickers",
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
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };


    adminApp.Data.renderAllAnalyticsData = function(){

        // alert('rendering all data 5');

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




    adminApp.Data.initActivityOverview = function(graphType){

        var totalData   = 5;
        var curData     = 1;

        // -------------------

        var bidRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/bids/daily?days=30",
            dataType: 'json',
        });

        bidRequest.done(function(response, textStatus, jqXHR) {
            adminApp.Data.engagementOverviewBids = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderActivityOverview(graphType);
        });

        bidRequest.fail(function(resp, textStatus, jqXHR) {
            $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

        // -------------------

        var likeRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/likes/daily?days=30",
            dataType: 'json',
        });

        likeRequest.done(function(response, textStatus, jqXHR) {
            adminApp.Data.engagementOverviewLikes = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderActivityOverview(graphType);
        });

        likeRequest.fail(function(resp, textStatus, jqXHR) {
            $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

        // -------------------

        var followRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/follows/daily?days=30",
            dataType: 'json',
        });

        followRequest.done(function(response, textStatus, jqXHR) {
            adminApp.Data.engagementOverviewFollows = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderActivityOverview(graphType);
        });

        followRequest.fail(function(resp, textStatus, jqXHR) {
            $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

        // -------------------

        var clickRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/clickthrus/daily?days=30",
            dataType: 'json',
        });

        clickRequest.done(function(response, textStatus, jqXHR) {
            adminApp.Data.engagementOverviewClickers = response.results;
            curData++;
            if (curData == totalData) adminApp.Data.renderActivityOverview(graphType);
        });

        clickRequest.fail(function(resp, textStatus, jqXHR) {
            $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

    };


    adminApp.Data.renderActivityOverview = function(graphType){

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





    adminApp.Data.initSurveyAnalytics = function(typeID){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "msg/"+typeID+"/surveys/responses",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.renderSurveys(response.results);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No surveys of this type in the Gratii system right now.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });

    };

    adminApp.Data.renderSurveys = function(data){

        console.log( data );

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
                    // ticks: dataLabels,
                    ticks:0
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

    adminApp.Data.initEconomyAnalytics = function(field, queryDays){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/economy/stats?days="+queryDays,
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            adminApp.Data.renderEconomyAnalytics(response.results, field);
        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No Results Returned.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });
    };



    adminApp.Data.renderEconomyAnalytics = function(data, field){

        var userChartData = [];
        var userChartLabels = [];

        var gratiiChartData = [];
        var gratiiChartLabels = [];


        var economyChartLabels = [];

        var meanChartData = [];
        var minOutlierChartData = [];
        var maxOutlierChartData = [];
        var q1ChartData = [];
        var q2ChartData = [];
        var q3ChartData = [];

        var c = 0;

        _.each(data, function(economyObject, key, list){

            console.log( economyObject );

            var date = new Date(economyObject.unixTimestamp * 1000);
            var dateString = date.getMonth()+1 + "/" + date.getDate() + " - " + date.toTimeString().substring(0,8);
            economyObject.dateLabel = dateString;

            // Gratii Users
            userChartData.push([c, economyObject.totalUsers]);
            userChartLabels.push([c, economyObject.dateLabel]);

            //Total Gratii
            gratiiChartData.push([c, economyObject.totalGratii]);
            gratiiChartLabels.push([c, economyObject.dateLabel]);

            //Economy Overview
            economyChartLabels.push([c, economyObject.dateLabel]);

            meanChartData.push([c, economyObject.mean]);
            minOutlierChartData.push([c, economyObject.minOutlier]);
            maxOutlierChartData.push([c, economyObject.maxOutlier]);
            q1ChartData.push([c, economyObject.q1]);
            q2ChartData.push([c, economyObject.q2]);
            q3ChartData.push([c, economyObject.q3]);

            c++;

        });

        console.log( userChartData );
        console.log( userChartLabels );

        //Graph Users.
        $.plot($('#user-overview-graph'), [
            {
               data: userChartData,
               // bars: { show: true }
               lines: {}
            }
        ],{
            xaxis: {
                ticks: userChartLabels
            },
            yaxis: {
            },
            colors:['#00a651']
        }
        );

        //Graph Gratii
        $.plot($('#gratii-overview-graph'), [
            {
               data: gratiiChartData,
               // bars: { show: true }
               lines: {}
            }
        ],{
            xaxis: {
                ticks: gratiiChartLabels
            },
            yaxis: {
            },
            colors:['#ff9000']
        }
        );

        //Graph Economy
        //Graph Gratii

        var finalGraphData = [];
        var colorSequence = null;

        if (field === "all") {
            finalGraphData.push({data: meanChartData, label: "mean", lines: { show: true }, points: { show: true }});
            finalGraphData.push({data: minOutlierChartData, label: "min outlier", lines: { show: true }, points: { show: true }});
            finalGraphData.push({data: maxOutlierChartData, label: "max outlier", lines: { show: true }, points: { show: true }});
            finalGraphData.push({data: q1ChartData, label: "q1", lines: { show: true }, points: { show: true }});
            finalGraphData.push({data: q2ChartData, label: "q2", lines: { show: true }, points: { show: true }});
            finalGraphData.push({data: q3ChartData, label: "q3", lines: { show: true }, points: { show: true }});
            colorSequence = ['#ed1c24','#8dc63f','#00aeef', '#662d91', '#8c6239', '#a864a8'];
        }
        else if(field === "mean"){
            finalGraphData.push({data: meanChartData, label: "mean", lines: { show: true }, points: { show: true }});
            colorSequence = ['#ed1c24'];
        }
        else if(field === "minOutlier"){
            finalGraphData.push({data: minOutlierChartData, label: "min outlier", lines: { show: true }, points: { show: true }});
            colorSequence = ['#8dc63f'];
        }
        else if(field === "maxOutlier"){
            finalGraphData.push({data: maxOutlierChartData, label: "max outlier", lines: { show: true }, points: { show: true }});
            colorSequence = ['#00aeef'];
        }
        else if(field === "q1"){
            finalGraphData.push({data: q1ChartData, label: "q1", lines: { show: true }, points: { show: true }});
            colorSequence = ['#662d91'];
        }
        else if(field === "q2"){
            finalGraphData.push({data: q2ChartData, label: "q2", lines: { show: true }, points: { show: true }});
            colorSequence = ['#8c6239'];
        }
        else if(field === "q3"){
            finalGraphData.push({data: q3ChartData, label: "q3", lines: { show: true }, points: { show: true }});
            colorSequence = ['#a864a8'];
        }

        $.plot($('#economy-overview-graph'), finalGraphData,{
            xaxis: {
                ticks: economyChartLabels
            },
            yaxis: {
            },
            legend: {
                show: true,
                // container: '#legend-container'
            },
            colors:colorSequence
        }
        );


        /*$.plot($('#economy-overview-graph'), [
            {
                data: meanChartData,
                lines: { show: true },
                points: { show: true }
                //bars: { show: true }
            },
            {
                data: minOutlierChartData,
                //bars: { show: true }
            }
        ],{
            xaxis: {
                ticks: economyChartLabels
            },
            yaxis: {
            },
            colors:['#ff9000']
        }
        );*/


    };


    adminApp.initSnapshotOverview = function(){

        var request = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "admin/economy/stats/snapshot",
            dataType: 'json',
        });

        request.done(function(response, textStatus, jqXHR) {
            //adminApp.Data.renderEconomyAnalytics(response.results, field);

            console.log( response.results );
            var hack = [];
            hack.push(response.results);

            var items = '';
            _.each(hack, function(economyObject, key, list){
                // console.log( 'here' );
                // console.log( key );
                // console.log( economyObject );
                items += '<tr><td>Total Users:</td><td>'+economyObject.totalUsers+'</td></tr>';
                items += '<tr><td>Total Gratii:</td><td>'+economyObject.totalGratii+'</td></tr>';
                items += '<tr><td>Mean:</td><td>'+economyObject.mean+'</td></tr>';
                items += '<tr><td>Min Outlier:</td><td>'+economyObject.minOutlier+'</td></tr>';
                items += '<tr><td>Max Outlier:</td><td>'+economyObject.maxOutlier+'</td></tr>';
                items += '<tr><td>Q1:</td><td>'+economyObject.q1+'</td></tr>';
                items += '<tr><td>Q2:</td><td>'+economyObject.q2+'</td></tr>';
                items += '<tr><td>Q2:</td><td>'+economyObject.q3+'</td></tr>';
            });
            $('.snapshot-table').append(items);

        });

        request.fail(function(resp, textStatus, jqXHR) {
            if (resp.responseJSON.msg === "404") {
                $.bootstrapGrowl("No Results from Snapshot Returned.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
            else{
                $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
            }
        });



        var liveRequest = $.ajax({
            type: "GET",
            url: adminApp.Settings.baseURL + "user/online",
            dataType: 'json',
        });

        liveRequest.done(function(response, textStatus, jqXHR) {
            var items = '<tr><td>Online Users:</td><td>'+response.results.length+'</td></tr>';
            $('.live-table').append(items);

        });

        liveRequest.fail(function(resp, textStatus, jqXHR) {
          $.bootstrapGrowl("There was an error processing your request.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
        });

    };




    adminApp.UI.generateActivityLink = function(){
        var field = $('#view-select option:selected').val();
        window.location = '#activity/'+field;
    };

    adminApp.UI.generateDemographicsLink = function(){
        var query = $('#view-select option:selected').val();
        window.location = '#demographics/'+query;
    };

    adminApp.UI.generateSurveysLink = function(){
        var query = $('#view-select option:selected').val();
        window.location = '#surveys/'+query;
    };

    adminApp.UI.generateEconomyLink = function(){
        var query = $('#view-select option:selected').val();
        var field = $('#query-days').val();
        window.location = '#economy/'+query+'/'+field;
    };








    /* Routing ------------------------------------------------------------------- */


    adminApp.Router = Backbone.Router.extend({
        routes: {
            "dashboard": "loadDashboardHome",

            "activity/:q": "activity",
            "demographics/:q": "demographics",
            "surveys/:q": "surveys",
            "economy/:q/:f": "economy",

            "messages": "messages",

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

            "*actions": "defaultRoute"
        }
    });

    var app_router = new adminApp.Router();




    app_router.on('route:messages', function (field) {

        adminApp.setMainNav($('#messages'));

        $('#app-content').load('html/messages.html', function() {

            $('#msg-send-btn').bind('click', function(e){

                e.preventDefault();

                var theMsg = {};

                theMsg.senderEntity = $('#senderEntity option:selected').val();
                theMsg.senderID = $('#senderID').val();
                theMsg.template = $('#template option:selected').val();
                theMsg.gratiiReward = $('#gratiiReward').val();

                var recipientListData = $('#recipientList').val();
                if (recipientListData === "") {
                    $.bootstrapGrowl("Fill everything in.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                    return;
                }

                var recipientListArray = recipientListData.split(',');

                var recipientType = $('#recipientType option:selected').val();
                if (recipientType === "recipientIDs") {
                    theMsg.recipientIDs = recipientListArray;
                }else{
                    theMsg.recipientNicknames = recipientListArray;
                }


                if($('#msgTitle').val() !== "") theMsg.title = $('#msgTitle').val();
                if($('#body').val() !== "") theMsg.body = $('#body').val();
                if($('#footer').val() !== "") theMsg.footer = $('#footer').val();
                if($('#link').val() !== "") theMsg.link = $('#link').val();

                if($('#optA').val() !== "") theMsg.optionA = $('#optA').val();
                if($('#optB').val() !== "") theMsg.optionB = $('#optB').val();
                if($('#optC').val() !== "") theMsg.optionC = $('#optC').val();

                if($('#msgBackgroundPic').val() !== "") theMsg.msgBackgroundPic = $('#msgBackgroundPic').val();
                if($('#msgBackgroundColor').val() !== "") theMsg.msgBackgroundColor = $('#msgBackgroundColor').val();
                if($('#msgFontColor').val() !== "") theMsg.msgFontColor = $('#msgFontColor').val();

                if (theMsg.senderEntity === "" || theMsg.senderID === "" || theMsg.template === "" || theMsg.gratiiReward == "") {
                    $.bootstrapGrowl("Fill everything in.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                    return;
                }

                console.log( theMsg );

                var request = $.ajax({
                    type: "POST",
                    url: adminApp.Settings.baseURL + "msg",
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(theMsg)
                });

                request.done(function(response, textStatus, jqXHR) {
                    $.bootstrapGrowl("Message Sent.", { type: 'success',  delay: 2000, offset: {from: 'top', amount: 50} });
                });

                request.fail(function(resp, textStatus, jqXHR) {
                    $.bootstrapGrowl("Message Could not be sent.", { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                });


            });

        });

    });



    app_router.on('route:surveys', function (field) {

        adminApp.setMainNav($('#surveys'));

        $('#app-content').load('html/surveys.html', function() {

            $('#view-select option[value="'+field+'"]').attr('selected','selected');

            adminApp.Data.initSurveyAnalytics(field);

            $('#view-select').on('change', function (e) {
                adminApp.UI.generateSurveysLink();
            });

        });

    });



    app_router.on('route:economy', function (field, queryDays) {

        adminApp.setMainNav($('#economy'));

        $('#app-content').load('html/economy.html', function() {

            $('#view-select option[value="'+field+'"]').attr('selected','selected');
            $('#query-days').val(queryDays);

            adminApp.Data.initEconomyAnalytics(field, queryDays);

            $('#view-select').on('change', function (e) {
                adminApp.UI.generateEconomyLink();
            });

            $('#refresh-btn').on('click', function (e) {
                e.preventDefault();
                adminApp.UI.generateEconomyLink();
            });



        });

    });






    app_router.on('route:activity', function (field) {

        adminApp.setMainNav($('#activity'));

        $('#app-content').load('html/activity.html', function() {

            $('#view-select option[value="'+field+'"]').attr('selected','selected');
            adminApp.Data.initActivityOverview(field);

            // alert(field);
            $('#view-select').on('change', function (e) {
                adminApp.UI.generateActivityLink();
            });

        });

    });



    app_router.on('route:demographics', function (field) {

        adminApp.setMainNav($('#demographics'));

        $('#app-content').load('html/demographics.html', function() {

           var mapOptions = {
               center: new google.maps.LatLng(38.9878, -77.1262),
               zoom: 2,
               mapTypeId: google.maps.MapTypeId.ROADMAP
           };

           adminApp.UI.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

           // downloads data and displays
           // adminApp.Data.downloadEngagementAnalytics(1);
           // adminApp.Data.initLikerAnalytics(1);

           if (field == "all") {
               adminApp.Data.initAllAnalytics();
           }
           if (field == "bidders"){
               adminApp.Data.initBidderAnalytics();
           }
           if (field == "likers"){
               adminApp.Data.initLikerAnalytics();
           }
           if (field == "followers"){
               adminApp.Data.initFollowerAnalytics();
           }
           if (field == "clickers"){
               adminApp.Data.initClickerAnalytics();
           }


           $('#view-select option[value="'+field+'"]').attr('selected','selected');

           //BINDINGS
           $('#view-select').on('change', function (e) {
               adminApp.UI.generateDemographicsLink();
           });


        });

    });



    app_router.on('route:createSchedule', function () {

        console.log( 'create schedule' );

        $('#app-section-content').load('html/create-schedule.html', function() {

            $('.dp').datepicker({format:"yyyy-mm-dd"});

            $('#mysql-start-day').datepicker()
            .on('changeDate', function(ev){
                console.log( ev.date.getTime()/1000.0 );
                // console.log( ev.date.getTime() );
                // console.log( ev.date );
                var ts = ev.date.getTime()/1000.0;
                $('#unix-timestamp').val(ts);
            });

            // $('.tp').timepicker({showMeridian:false, showSeconds: true});

            // $('#mysql-start-time').timepicker('setTime', '09:30:00');
            // $('#mysql-end-time').timepicker('setTime', '22:00:00');

            $('#create-schedule-form').bind('submit', function(e){

                e.preventDefault();

                // var days =  Math.abs(Math.floor(( Date.parse($('#mysql-start-day').val()) - Date.parse($('#mysql-end-day').val()) ) / 86400000)) + 1;

                // var request = $.ajax({
                //     type: "POST",
                //     url: adminApp.Settings.baseURL + "auction/schedule",
                //     dataType: 'json',
                //     data: { mysqlStartDay: $('#mysql-start-day').val(), daysToPrepare: days, auctionsPerDay:$('#auctions-per-day').val(), mysqlStartTime: $('#mysql-start-time').val(), mysqlEndTime: $('#mysql-end-time').val() }
                // });
                // request.done(function(response, textStatus, jqXHR) {
                //     window.location = "#auctions/list";
                //     $.bootstrapGrowl("High-Five.", { type: 'success',  delay: 3000, offset: {from: 'top', amount: 50} });
                //     console.log( response );
                // });
                // request.fail(function(resp, textStatus, jqXHR) {
                //     $.bootstrapGrowl("Error: " + resp.responseJSON.msg, { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                // });

                var request = $.ajax({
                    type: "PUT",
                    url: adminApp.Settings.baseURL + "auction/schedule",
                    dataType: 'json',
                    data: { startDate: $('#unix-timestamp').val()}
                });
                request.done(function(response, textStatus, jqXHR) {
                    window.location = "#auctions/list";
                    $.bootstrapGrowl("High-Five.", { type: 'success',  delay: 3000, offset: {from: 'top', amount: 50} });
                    console.log( response );
                });
                request.fail(function(resp, textStatus, jqXHR) {
                    $.bootstrapGrowl("Error: " + resp.responseJSON.msg, { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                });


            });

        });

    });

    app_router.on('route:loadDashboardHome', function () {
        // console.log( 'dash route' );
        adminApp.setMainNav($('#dashboard'));

        $('#app-content').load('html/dashboard-home.html', function() {
            // adminApp.initCrudNav();
            adminApp.initSnapshotOverview();
        });


    });

    // app_router.on('route:showClient', function (id) {
    //     console.log( "Get client with ID " + id );
    //     adminApp.UIState.activeDataSet = adminApp.gratiiClients;
    // });

    app_router.on('route:loadClientHome', function () {

        adminApp.UIState.activeDataSet = adminApp.gratiiClients;

        adminApp.setMainNav($('#clients'));

        $('#app-content').load('html/clients-home.html', function() {
            adminApp.initCrudNav();
        });

        adminApp.gratiiClients.fetch({success: function(){

            console.log( 'success' );

            adminApp.UIState.dataListStart = 0;
            adminApp.UI.renderList();

        }});

    });

    app_router.on('route:loadClientHomeWithQuery', function (field,query) {

        // console.log( 'f: ' + field );
        // console.log( 'q: ' + query );


        adminApp.UIState.activeDataSet = adminApp.gratiiClients;

        adminApp.setMainNav($('#clients'));

        $('#app-content').load('html/clients-home.html', function() {
            adminApp.initCrudNav();
            $('#letters').val(query);
            $('#search-filter').children('[value="'+field+'"]').prop('selected', true);
        });

        adminApp.gratiiClients.fetch({success: function(){

            console.log( 'success' );

            adminApp.UIState.dataListStart = 0;
            adminApp.UI.renderList(field,query);

        }});

    });


    app_router.on('route:editClient', function (id) {

        console.log( "Edit client with ID " + id );
        adminApp.UIState.activeDataSet = adminApp.gratiiClients;

        $('#app-section-content').load('html/edit-client.html', function() {

            //get instance from collection
            var gratiiClient = adminApp.gratiiClients.get(id);

            $.each(gratiiClient.toJSON(), function(name, value){
                // console.log( name + ' ' + value );

                if(value === "---") return;

                $('input[name='+name+']').val(value);
                $('textarea[name='+name+']').text(value);
                $('select[name='+name+']').children('[value="'+value+'"]').prop('selected', true);
            });

            //itterate over data
            $('#add-new-form #done').text('Save Changes');
            $('#add-new-form').bind('submit', function(e){
                e.preventDefault();
                adminApp.serializeFormAndUpdate(gratiiClient);
            });

            $('#account-deactivates-at').datepicker({format:"yyyy-mm-dd"});
            $('#data-deactivates-at').datepicker({format:"yyyy-mm-dd"});
            $('#twitter-deactivates-at').datepicker({format:"yyyy-mm-dd"});
            $('#facebook-deactivates-at').datepicker({format:"yyyy-mm-dd"});


        });

    });

    app_router.on('route:addClient', function () {

        console.log( "Route add client" );
        adminApp.UIState.activeDataSet = adminApp.gratiiClients;

        $('#app-section-content').load('html/add-new-client.html', function() {

            $('#add-new-form').bind('submit', function(e){
                e.preventDefault();
                adminApp.serializeFormAndCreate();
            });

            $('#account-deactivates-at').datepicker({format:"yyyy-mm-dd"});
            $('#data-deactivates-at').datepicker({format:"yyyy-mm-dd"});
            $('#twitter-deactivates-at').datepicker({format:"yyyy-mm-dd"});
            $('#facebook-deactivates-at').datepicker({format:"yyyy-mm-dd"});

        });
    });

    app_router.on('route:loadPromoHome', function () {

        adminApp.UIState.activeDataSet = adminApp.gratiiPromos;

        adminApp.setMainNav($('#promo'));

        $('#app-content').load('html/promo-home.html', function() {
            adminApp.initCrudNav();
        });

        adminApp.gratiiPromos.changeURL(adminApp.Settings.baseURL + 'promo');
        adminApp.gratiiPromos.fetch({success: function(){

            console.log( 'success' );
            adminApp.UIState.dataListStart = 0;
            adminApp.UI.renderList();

        }});

    });

    //loadPromoHomeWithQuery

    app_router.on('route:loadPromoHomeWithQuery', function (field,query) {

        // console.log( 'f: ' + field );
        // console.log( 'q: ' + query );
        // alert("Loading Promo with query " + field + " | " + query);

        adminApp.UIState.activeDataSet = adminApp.gratiiPromos;

        adminApp.setMainNav($('#promo'));

        $('#app-content').load('html/promo-home.html', function() {
            adminApp.initCrudNav();
            $('#letters').val(query);
            $('#search-filter').children('[value="'+field+'"]').prop('selected', true);
        });


        //change URL to reflect filters
        if (field === "clientID") {
            adminApp.gratiiPromos.changeURL(adminApp.Settings.baseURL + 'client/'+query+'/promos');
        }
        else if (field === "id"){
            adminApp.gratiiPromos.changeURL(adminApp.Settings.baseURL + 'promo/'+query);
        }
        ///client/$CLIENTID/promos

        adminApp.gratiiPromos.fetch({success: function(){

            console.log( 'success' );

            adminApp.UIState.dataListStart = 0;
            // adminApp.UI.renderList(field,query);
            adminApp.UI.renderList();

        }});

    });

    app_router.on('route:addPromo', function () {

        console.log( "Route add promo" );
        adminApp.UIState.activeDataSet = adminApp.gratiiPromos;

        $('#app-section-content').load('html/add-new-promo.html', function() {

            $('#add-new-form').bind('submit', function(e){
                e.preventDefault();
                adminApp.serializeFormAndCreate();
            });

            $('.typeahead').typeahead({
                source : adminApp.gratiiClients.pluck('clientName')
            });
        });
    });

    app_router.on('route:editPromo', function (id) {

        console.log( "Edit promo with ID " + id );
        adminApp.UIState.activeDataSet = adminApp.gratiiPromos;

        $('#app-section-content').load('html/add-new-promo.html', function() {

            //get instance from collection
            var gratiiPromo = adminApp.gratiiPromos.get(id);

            $.each(gratiiPromo.toJSON(), function(name, value){
                // console.log( name + ' ' + value );

                if(value === "---") return;

                $('input[name='+name+']').val(value);
                $('textarea[name='+name+']').text(value);
                $('select[name='+name+']').children('[value="'+value+'"]').prop('selected', true);
            });

            //itterate over data
            $('#add-new-form #done').text('Save Changes');
            $('#add-new-form').bind('submit', function(e){
                e.preventDefault();
                adminApp.serializeFormAndUpdate(gratiiPromo);
            });

        });

    });


    app_router.on('route:loadAuctionHome', function () {

        adminApp.UIState.activeDataSet = adminApp.gratiiAuctions;

        adminApp.setMainNav($('#auction'));

        $('#app-content').load('html/auction-home.html', function() {
            adminApp.initCrudNav();
            $('#search-filter').bind('change', function(e){
                var queryType = $('#search-filter option:selected').attr('data-type');
                if ( queryType == "datePicker" ) {
                    $('#letters').datepicker({format:"yyyy-mm-dd"});
                }
            });
        });

        adminApp.gratiiAuctions.changeURL(adminApp.Settings.baseURL + 'auction');
        adminApp.gratiiAuctions.fetch({success: function(){

            console.log( 'success' );
            adminApp.UIState.dataListStart = 0;
            adminApp.UI.renderList();

        }});

    });


    app_router.on('route:loadAuctionHomeWithQuery', function (field,query) {

        // console.log( 'f: ' + field );
        // console.log( 'q: ' + query );
        // alert('loading auctions with query');

        adminApp.UIState.activeDataSet = adminApp.gratiiAuctions;

        adminApp.setMainNav($('#auction'));

        $('#app-content').load('html/auction-home.html', function() {
            adminApp.initCrudNav();
            $('#letters').val(query);
            $('#search-filter').children('[value="'+field+'"]').prop('selected', true);
        });
        if (field === "clientID") {
            adminApp.gratiiAuctions.changeURL(adminApp.Settings.baseURL + 'client/'+query+'/auctions/complex');
        }
        else if(field === "promoID"){
            adminApp.gratiiAuctions.changeURL(adminApp.Settings.baseURL + 'promo/'+query+'/auctions/complex');
        }
        adminApp.gratiiAuctions.fetch({success: function(){

            console.log( 'success' );

            adminApp.UIState.dataListStart = 0;
            // adminApp.UI.renderList(field,query);
            adminApp.UI.renderList();

        }});

    });

    app_router.on('route:addAuction', function (promoID) {

        console.log( "Route add auction " + promoID );


        adminApp.UIState.activeDataSet = adminApp.gratiiAuctions;

        $('#app-section-content').load('html/add-new-auction.html', function() {

            if (promoID !== null) {
                $('#promo-id').val(promoID);
            }

            $('#add-new-form').bind('submit', function(e){
                e.preventDefault();
                adminApp.serializeFormAndCreate();
            });

        });

    });

    app_router.on('route:editAuction', function (id) {

        console.log( "Edit auction with ID " + id );
        adminApp.UIState.activeDataSet = adminApp.gratiiAuctions;

        $('#app-section-content').load('html/add-new-auction.html', function() {

            //get instance from collection
            var gratiiAuction = adminApp.gratiiAuctions.get(id);

            $.each(gratiiAuction.toJSON(), function(name, value){

                if(value === "---") return;

                $('input[name='+name+']').val(value);
                $('textarea[name='+name+']').text(value);
                $('select[name='+name+']').children('[value="'+value+'"]').prop('selected', true);
            });

            //itterate over data
            $('#add-new-form #done').text('Save Changes');
            $('#add-new-form').bind('submit', function(e){
                e.preventDefault();
                adminApp.serializeFormAndUpdate(gratiiAuction);
            });

        });

    });


    app_router.on('route:defaultRoute', function () {

        console.log( "load default route." );

        $('#app-content').load('html/login.html', function() {

            $('#admin-login-form').bind('submit', function(e){
                e.preventDefault();

                var request = $.ajax({
                    type: "POST",
                    url: adminApp.Settings.baseURL + "admin/login",
                    dataType: 'json',
                    data: { adminEmail: $('#admin-email').val(), adminPassword: $('#admin-password').val() }
                });
                request.done(function(response, textStatus, jqXHR) {
                    window.location = "#dashboard";
                    $.bootstrapGrowl("Welcome.", { type: 'success',  delay: 3000, offset: {from: 'top', amount: 50} });
                    console.log( response.results );
                });
                request.fail(function(resp, textStatus, jqXHR) {
                    $.bootstrapGrowl("Error: " + resp.responseJSON.msg, { type: 'error',  delay: 2000, offset: {from: 'top', amount: 50} });
                });

            });

        });

    });

    Backbone.history.start();



	adminApp.init = function(){
        adminApp.UIState.dataListMax = 50;
        adminApp.UIState.dataListStart = 0;
        //adminApp.UIState.activeDataSet = "clients";
	};

	$(function(){
		adminApp.init();
	});


});