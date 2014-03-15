<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function(){

	return View::make('hello');
});


//USER
Route::post('api/v1/user/login', 'USER@login'); //CHECK!
Route::post('api/v1/user/import', 'USER@import');
Route::get('api/v1/user/session', 'USER@checkSession'); //CHECK!
Route::get('api/v1/user/inbox', 'USER@inbox'); //sorta
Route::put('api/v1/user/activate', 'USER@activateUserAccount');
Route::put('api/v1/user/password/request', 'USER@requestPasswordReset');
Route::put('api/v1/user/password', 'USER@updateUserPassword');
Route::get('api/v1/user/logout', 'USER@logoutUser');
Route::put('api/v1/user/node/new', 'USER@newUserNodeID');
Route::put('api/v1/user/node/remove', 'USER@removeUserNodeID');
Route::get('api/v1/user/transactions', 'USER@userTransactions'); //CHECK!
Route::post('api/v1/user/game/event', 'USER@externalGameEvent');
Route::post('api/v1/user/purchase/start', 'USER@startPurchase');
Route::post('api/v1/user/purchase/complete', 'USER@completePurchase');
Route::post('api/v1/user/purchase/fail', 'USER@failPurchase');
Route::get('api/v1/user/bids', 'USER@bids');
Route::get('api/v1/user/wins/today', 'USER@winsToday');
Route::get('api/v1/user/gifts/today', 'USER@gratiiGiftedToday');
Route::put('api/v1/user/fbTokens', 'USER@updateFacebookTokens');
Route::post('api/v1/user/twitterTokens', 'USER@updateTwitterTokens');
Route::get('api/v1/user/{id}/likes', 'USER@getFacebookLikes');
Route::get('api/v1/user/{id}/follows', 'USER@getTwitterFollows');
Route::get('api/v1/user/online', 'USER@getCurrentNodeConnections');
Route::put('api/v1/user/{id}/location/google', 'USER@setGoogleLocation');
//CLIENT
Route::post('api/v1/client/login', 'CLIENT@login');
Route::get('api/v1/client/session', 'CLIENT@checkSession');
Route::get('api/v1/client/logout', 'CLIENT@logoutClient');
Route::get('api/v1/client/{id}/promos', 'CLIENT@promosForClient');
Route::get('api/v1/client/{id}/auctions/basic', 'CLIENT@auctionsBasicForClient');
Route::get('api/v1/client/{id}/auctions/complex', 'CLIENT@auctionsComplexForClient');
Route::get('api/v1/client/{id}/bidders', 'CLIENT@getAllBidders');
Route::get('api/v1/client/{id}/likers', 'CLIENT@getAllLikers');
Route::get('api/v1/client/{id}/followers', 'CLIENT@getAllFollowers');
Route::get('api/v1/client/{id}/clickers', 'CLIENT@getAllClickers');
Route::get('api/v1/client/{id}/facebooks', 'CLIENT@getFacebooks');
Route::get('api/v1/client/{id}/twitters', 'CLIENT@getTwitters');
Route::get('api/v1/client/{id}/websites', 'CLIENT@getWebsites');
Route::get('api/v1/client/{id}/inventory', 'CLIENT@getInventory');
Route::get('api/v1/client/{id}/surveys', 'CLIENT@getSurveys');
Route::get('api/v1/client/{id}/surveys/responses', 'CLIENT@getSurveyResponses');
Route::get('api/v1/client/{id}/bids/daily', 'CLIENT@getBidsDaily');
Route::get('api/v1/client/{id}/likes/daily', 'CLIENT@getLikesDaily');
Route::get('api/v1/client/{id}/follows/daily', 'CLIENT@getFollowsDaily');
Route::get('api/v1/client/{id}/clickthrus/daily', 'CLIENT@getClickthrusDaily');
//ADMIN
Route::post('api/v1/admin/login', 'ADMIN@login');
Route::get('api/v1/admin/session', 'ADMIN@checkSession');
Route::get('api/v1/admin/logout', 'ADMIN@logoutAdmin');
Route::put('api/v1/admin/auctions/settings', 'ADMIN@updateAuctionSettings');
Route::get('api/v1/admin/bidders', 'ADMIN@getAllBidders');
Route::get('api/v1/admin/likers', 'ADMIN@getAllLikers');
Route::get('api/v1/admin/followers', 'ADMIN@getAllFollowers');
Route::get('api/v1/admin/clickers', 'ADMIN@getAllClickers');
Route::get('api/v1/admin/bids/daily', 'ADMIN@getBidsDaily');
Route::get('api/v1/admin/likes/daily', 'ADMIN@getLikesDaily');
Route::get('api/v1/admin/follows/daily', 'ADMIN@getFollowsDaily');
Route::get('api/v1/admin/clickthrus/daily', 'ADMIN@getClickthrusDaily');
Route::get('api/v1/admin/economy/stats', 'ADMIN@getAllEconomyStats');
Route::get('api/v1/admin/economy/stats/snapshot', 'ADMIN@getEconomyStatsSnapshot');
Route::post('api/v1/admin/economy/stats/snapshot', 'ADMIN@createEconomyStatsSnapshot');
//AUCTION
Route::get('api/v1/auction/live', 'AUCTION@getLiveAuctions');
Route::get('api/v1/auction/upnext', 'AUCTION@getUpcomingAuctions');
Route::get('api/v1/auction/past', 'AUCTION@getPastAuctions');
Route::get('api/v1/auction/refresh', 'AUCTION@refresh');
Route::get('api/v1/auction/winners', 'AUCTION@winners');
Route::put('api/v1/auction/schedule', 'AUCTION@scheduleAuctions');
Route::get('api/v1/auction/{id}/email', 'AUCTION@sendWinnerEmail');
//PROMO
Route::get('api/v1/promo/{id}/auctions/basic', 'PROMO@auctionsBasicForPromo');
Route::get('api/v1/promo/{id}/auctions/complex', 'PROMO@auctionsComplexForPromo');
Route::get('api/v1/promo/{id}/bidders', 'PROMO@getAllBidders');
Route::get('api/v1/promo/{id}/likers', 'PROMO@getAllLikers');
Route::get('api/v1/promo/{id}/followers', 'PROMO@getAllFollowers');
Route::get('api/v1/promo/{id}/clickers', 'PROMO@getAllClickers');
Route::get('api/v1/promo/{id}/bids', 'PROMO@getAllBids');
Route::get('api/v1/promo/facebook/{promoFacebookID}/likers', 'PROMO@getAllLikersForFacebookID');
Route::get('api/v1/promo/twitter/{promoTwitterID}/followers', 'PROMO@getAllFollowersForTwitterID');
Route::get('api/v1/promo/website/{promoWebsite}/clickers', 'PROMO@getAllClickersForWebsiteID');
Route::get('api/v1/promo/website/{promoWebsite}/clickthrus', 'PROMO@getAllClickthrusForWebsiteID');
//MSG
Route::put('api/v1/msg/respond', 'MSG@respondToMsg');
Route::put('api/v1/msg/open', 'MSG@openMsg');
Route::get('api/v1/msg/{senderEntity}/surveys', 'MSG@getSurveys');
Route::get('api/v1/msg/{senderEntity}/surveys/responses', 'MSG@getSurveyResponses');
//CHALLENGE
Route::post('api/v1/challenge/issue', 'CHALLENGE@issue');
Route::post('api/v1/challenge/complete', 'CHALLENGE@complete');
//SLOTS
Route::post('api/v1/game/slots/spin', 'SLOTS@spin');
Route::get('api/v1/game/slots/start', 'SLOTS@start');
//TRIVIA
Route::get('api/v1/game/trivia/random', 'TRIVIA@random');
Route::post('api/v1/game/trivia/response', 'TRIVIA@response');
//CRON
Route::get('api/v1/cron/economy/snapshot', 'CRON@createEconomyStatsSnapshot');
Route::get('api/v1/cron/taxes', 'CRON@takeTaxes');
Route::get('api/v1/cron/like/buckets', 'CRON@payoutLikeBuckets');
Route::get('api/v1/cron/follow/buckets', 'CRON@payoutFollowBuckets');
//DOWNLOAD
Route::put('api/v1/download/claim', 'DOWNLOAD@claimDownload');

// Route group for API versioning
Route::group(array('prefix' => 'api/v1'), function(){

	Route::resource('user', 'USER'); //CHECK!
	Route::resource('client', 'CLIENT');
	Route::resource('admin', 'ADMIN');
	Route::resource('auction', 'AUCTION');
	Route::resource('promo', 'PROMO');
	Route::resource('challenge', 'CHALLENGE');
	Route::resource('arcade', 'ARCADE');
	Route::resource('msg', 'MSG');
	Route::resource('bid', 'BID');
	Route::resource('like', 'LIKE');
	Route::resource('follow', 'FOLLOW');
	Route::resource('clickthru', 'CLICKTHRU');
	Route::resource('report', 'REPORT');

});


Route::get('users', function(){
	
    return 'Users!';
});