jQuery(document).ready(function($) { 
	
	//animate teaser
	$("#teaser-container:first").clone().prependTo("body"); // teaser-div duplizieren und an den Anfang des body-tags kopieren
	$(".teaser-container:last").remove(); //verbliebenes teaser-div am Ende des bodys lÃ¶schen
	var teaser = $("#teaser-container");
	var teaserheight = -teaser.outerHeight(); // die Höhe des teaser-divs ermitteln und negativ in eine Variable schreiben
	teaser.css("margin-top", teaserheight + "px").hide(); //die Höhe des teaser-divs als negativen margin setzen und diesen zunÃ¤chst verstecken

	$("a.teaser-load").click(function()
	{
		if (teaser.is(":animated")) { return false; } //wenn teaser bereits animiert ist, erste Animation verhindern
		
		if (teaser.is(":visible")) { // wenn teaser animiert ist, Rückanimation starten
			teaser.stop(true).animate({ marginTop: teaserheight + "px" }, 750, "swing", function() { $(this).hide(); });
			$('#top-bar').stop(true).animate({ marginTop: "0px" }, 750, "swing", function() { });
		}
		else {
			teaser.show().stop(true).animate({ marginTop: "0px" }, 750, "swing");
			$('#top-bar').animate({ marginTop: -teaserheight + "px" }, 750, "swing");
		}
		return false;
	});
	
});
