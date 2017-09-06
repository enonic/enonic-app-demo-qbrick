var portal = require('/lib/xp/portal'); // Import the portal functions
var thymeleaf = require('/lib/xp/thymeleaf'); // Import the Thymeleaf rendering function
var qbricklib = require('/lib/qbrick'); //import qbrickLib


// Handle the GET request
exports.get = function(req) {
	var settings = portal.getSiteConfig();	
	//GET Settings from app

	var account = settings.qbrickAccountId;
	
    var component = portal.getComponent();
	
	var selectedVideo = component.config.mediaId || "";
	var autostart = component.config.autostart || false;
	var volume = 1;
	var replay = false;
	if(component.config.mute != undefined){
		if(component.config.mute){
			volume = 0;
		}		
	}
	if(component.config.replay != undefined){
		replay = component.config.replay;
	}
	//set video if it is not defined in part
	if (selectedVideo =="" || selectedVideo == undefined){
			var callsettings = 	{};
			callsettings.accountID = account;
			callsettings.query = "sort=created+desc&q=asset.resources.type:video&offset=0&limit=5";		
			var response1 = qbricklib.mediaQuery(callsettings);
			selectedVideo = response1[0].id;
	}
	
	//Generate the embedcode
	var embedplayer = "";
	var playersettings = {};
	playersettings.accountID = account;
	playersettings.mediaID = selectedVideo;
	playersettings.autoplay = autostart;
	playersettings.repeat = replay;
	playersettings.volume = volume;
	//if live render of part, then get player, else load previewimage
	if(req.mode != "edit"){
		embedplayer = qbricklib.getPlayer(playersettings);
	}else{
		var mediaSettings = {};
		mediaSettings.accountID = account;
		mediaSettings.mediaID = selectedVideo;
		var previewObject = qbricklib.getMedia(mediaSettings);
		var previewHtml = "";
		previewHtml +='<div class="qbrick-video-wrapper-single">';
		previewHtml +='<div class="qbrick-video-single" style="background-image: url(\'';
		previewHtml += previewObject.thumbnail;
		previewHtml += '\'); background-size: 100%">';
		previewHtml += '</div></div>';
		embedplayer = previewHtml;
	}
	
    // Prepare the model object with the needed data from the content
    var model = {
		//pass the embedcode
		embedcode: embedplayer
    };

    // Specify the view file to use
    var view = resolve('qbrickVideo.html');
    // Return the merged view and model in the response object
    return {
        body: thymeleaf.render(view, model),
		pageContributions: {
            headEnd: [
                '<link rel="stylesheet" type="text/css" href="' + portal.assetUrl({path: 'css/video.css'}) + '"/>',
				'<script src="//play2.qbrick.com/framework/GoBrain.min.js"></script>'
            ]
        }
    }
};