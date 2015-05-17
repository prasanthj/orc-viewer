var fileView
var fileMetadata = []
var stripeMetadata = {}
var footerMetadata = []
loadLayout()

function loadLayout() {
	populateFileMetadata(data);
	populateStripeMetadata(data);
	populateFooterMetadata(data);
	updateMetadataList(fileMetadata);

	var originX = $(".col-md-4").width();
	var originY = 0;
	var width = $(".col-md-8").width();
	var height = $(".body.container-fluid").height();
	drawFileLayout(data, originX, originY, width, height);
}

function populateFileMetadata(filedump) {
	fileMetadata.push(["Filename", filedump["fileName"]])
	fileMetadata.push(["Schema", htmlEntities(filedump["schemaString"])])
	fileMetadata.push(["Compression", filedump["compression"]])
	fileMetadata.push(["Compression Buffer Size", filedump["compressionBufferSize"]])
	fileMetadata.push(["File Version", filedump["fileVersion"]])
	fileMetadata.push(["Writer Version", filedump["writerVersion"]])
	fileMetadata.push(["Row Count", filedump["numberOfRows"]])
	fileMetadata.push(["File Length", filedump["fileLength"]])
	fileMetadata.push(["Padding Length", filedump["paddingLength"]])
}

function populateStripeMetadata(filedump) {
	var stripes = filedump["stripes"]
	for(var i=0; i<stripes.length; i++) {
		var stripeInfo = []
		var stripe = stripes[i]
        stripeInfo.push(["Offset", stripe["stripeInformation"]["offset"]])
        stripeInfo.push(["Index Length", stripe["stripeInformation"]["indexLength"]])
        stripeInfo.push(["Data Length", stripe["stripeInformation"]["dataLength"]])
        stripeInfo.push(["Footer Length", stripe["stripeInformation"]["footerLength"]])
        stripeInfo.push(["Row Count", stripe["stripeInformation"]["rowCount"]])
        stripeMetadata[stripe["stripeNumber"]] = stripeInfo
	}
}

function populateFooterMetadata(filedump) {

}

function htmlEntities(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function updateMetadataList(items) {
	$("ul.metadata-list").empty()
	for (var i=0; i<items.length; i++) {
		var item = items[i]
		$("ul.metadata-list").append('<li class="level-1">' + item[0] + '</li>');
		$("ul.metadata-list").append('<li class="level-2"><pre>' + item[1] + '</pre></li>');
	}
}

function drawFileLayout(filedump, x, y, w, h) {
	//console.log("x: " + x + " y: " + y + " w: " + w + " h: " + h)
	fileView = d3.select(".file-layout")
					.append("svg:svg")
					.attr("width", w)
					.attr("height", h)
					.on("click", layoutClick);

	var stripes = filedump["stripes"]
	var nStripes = filedump["stripes"].length

	var newX = 0.2 * x
	var newY = y + 0.1 * h
	var totalStripesHeight = 0.7 * h
	var perStripeHeight = totalStripesHeight / nStripes
	var stripeWidth = 0.5 * w
	for (var i=0; i<nStripes; i++) {	
		drawStripe(fileView, stripes, i + 1, newX, newY, stripeWidth, perStripeHeight)
		newY += perStripeHeight
	}

	var footerHeight = 0.1 * h
	drawFooter(fileView, filedump, newX, newY, stripeWidth, footerHeight)
}

function drawStripe(fileView, stripes, stripeId, x, y, w, h) {
	//console.log("x: " + x + " y: " + y + " w: " + w + " h: " + h)
	var stripe = fileView.append("svg:rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("class", "stripe")
			.attr("id", stripeId)
			.on("click", elementClick);

	fileView.append("svg:text")
			.attr("x", x + (w / 2))
			.attr("y", y + (h / 2))
			.attr("class", "inner-text")
			.text("Stripe " + stripeId);
}

function drawFooter(fileView, filedump, x, y, w, h) {
	//console.log("x: " + x + " y: " + y + " w: " + w + " h: " + h)
	fileView.append("svg:rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("class", "footer")
			.attr("id", "footer")
			.on("click", elementClick);

	fileView.append("svg:text")
			.attr("x", x + (w / 2))
			.attr("y", y + (h / 2))
			.attr("class", "inner-text")
			.text("Footer");
}

function elementClick() {
	d3.select(".selected").remove();
	var x = parseFloat(d3.select(this).attr("x"));
	var y = parseFloat(d3.select(this).attr("y"));
	var w = parseFloat(d3.select(this).attr("width"));
	var h = parseFloat(d3.select(this).attr("height"));
	fileView.append("svg:rect")
		    .attr("x", x)
		    .attr("y", y + h - 2)
		    .attr("width", w)
		    .attr("height", 3)
		    .attr("class", "selected")
		    .style("opacity", 0.0)
		    .transition()
			.delay(100)
			.duration(200)
			.style("opacity", 1.0);

	if (d3.select(this).attr("class") == "stripe") {
		var stripeId = d3.select(this).attr("id")
		updateMetadataList(stripeMetadata[stripeId])
	} else if (d3.select(this).attr("class") == "footer") {
	}

	// stop the click event from propagting to parent file-layout
	d3.event.stopPropagation()
}

function layoutClick() {
	d3.select(".selected").remove();
	updateMetadataList(fileMetadata)
}