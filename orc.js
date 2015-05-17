var fileView
var fileMetadata = []
var stripeMetadata = {}
var width = $(".col-md-8").width();
var height = $(".body.container-fluid").height();
loadLayout()

function loadLayout() {
	populateFileMetadata(data);
	populateStripeMetadata(data);
	updateMetadataList(fileMetadata);

	var originX = $(".col-md-4").width();
	var originY = 0;
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
		stripeInfo.push(["Stripe " + stripe["stripeNumber"], ""])
        stripeInfo.push(["Offset", stripe["stripeInformation"]["offset"]])
        stripeInfo.push(["Index Length", stripe["stripeInformation"]["indexLength"]])
        stripeInfo.push(["Data Length", stripe["stripeInformation"]["dataLength"]])
        stripeInfo.push(["Footer Length", stripe["stripeInformation"]["footerLength"]])
        stripeInfo.push(["Row Count", stripe["stripeInformation"]["rowCount"]])
        stripeMetadata[stripe["stripeNumber"]] = stripeInfo
	}
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
 	var zoom = d3.behavior.zoom()
 				 .scaleExtent([-8, 8])
 				 .on("zoom", zoomed);

	fileView = d3.select(".file-layout")
					.append("svg:svg")
					.attr("width", w)
					.attr("height", h)
					.on("click", layoutClick)
					.append("g")
					.attr("transform", "scale(1)")
    				.call(zoom);

	var stripes = filedump["stripes"]
	var nStripes = filedump["stripes"].length

	var newX = 0.2 * x
	var newY = y + 0.1 * h
	var totalStripesHeight = 0.7 * h
	var perStripeHeight = totalStripesHeight / nStripes
	var stripeWidth = 0.5 * w
	for (var i=0; i<nStripes; i++) {	
		drawStripe(stripes, i + 1, newX, newY, stripeWidth, perStripeHeight)
		newY += perStripeHeight
	}

	var footerHeight = 0.1 * h
	drawFooter(filedump, newX, newY, stripeWidth, footerHeight)
}

function zoomed() {
	fileView.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function drawStripe(stripes, stripeId, x, y, w, h) {
	var stripe = fileView.append("svg:rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("class", "stripe")
			.attr("id", stripeId)
			.on("click", elementClick);

	drawText("Stripe " + stripeId, x + (w / 2), y + (h / 2));
}

function drawFooter(filedump, x, y, w, h) {
	fileView.append("svg:rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("class", "footer")
			.attr("id", "footer")
			.on("click", elementClick);

	drawText("Footer", x + (w / 2), y + (h / 2));
}

function elementClick() {
	d3.selectAll(".selected").remove();
	var x = parseFloat(d3.select(this).attr("x"));
	var y = parseFloat(d3.select(this).attr("y"));
	var w = parseFloat(d3.select(this).attr("width"));
	var h = parseFloat(d3.select(this).attr("height"));
	drawSelectionLine(x, y, x + w, y)
	drawSelectionLine(x, y + h, x + w, y + h)

	if (d3.select(this).attr("class") == "stripe") {
		var stripeId = d3.select(this).attr("id")
		updateMetadataList(stripeMetadata[stripeId])
		drawStripeExpanded(x, y, w, h)
	} else if (d3.select(this).attr("class") == "footer") {
		updateMetadataList(fileMetadata)	
	}

	// stop the click event from propagting to parent file-layout
	d3.event.stopPropagation()
}

function layoutClick() {
	fileView.transition()
			.delay(100)
			.duration(500)
	        .attr("transform", "scale(1)");
	d3.selectAll(".selected").remove();
	d3.selectAll(".depth-1").remove();
	updateMetadataList(fileMetadata)
}

function drawStripeExpanded(x, y, w, h) {
	fileView.transition()
			.delay(100)
			.duration(500)
	        .attr("transform", "scale(0.5)");

	d3.selectAll(".depth-1").remove()

	var x1 = x + w
	var y1 = y
	var lineWidth = 100
	var x2 = x1 + 100
	var y2 = y1
	drawLine(x1, y1, x2, y2)
	var x3 = x1
	var y3 = y1 + h
	var x4 = x1 + lineWidth
	var y4 = y1 + height
	drawLine(x3, y3, x4, y4)

	var headerHeight = 0.15 * height
	var footerHeight = 0.15 * height
	var bodyHeight = height - headerHeight - footerHeight

	var stripeWidth = 500
	fileView.append("svg:rect")
			.attr("x", x2)
			.attr("y", y2)
			.attr("width", width)
			.attr("height", height)
			.attr("class", "stripe-expanded depth-1")
			.on("click", elementClick)
			.style("opacity", "0")
			.transition()
			.delay(100)
			.duration(500)
			.style("opacity", "1");
}

function drawLine(x1, y1, x2, y2) {
	fileView.append("svg:line")
	        .attr("x1", x1)
	        .attr("y1", y1)
	        .attr("x2", x2)
	        .attr("y2", y2)
	        .attr("class", "expander-line depth-1")
	        .style("stroke-dasharray", ("5, 5"))
	        .style("opacity", "0")
	        .transition()
			.delay(100)
			.duration(500)
			.style("opacity", "1");
}

function drawSelectionLine(x1, y1, x2, y2) {
	fileView.append("svg:line")
	        .attr("x1", x1)
	        .attr("y1", y1)
	        .attr("x2", x2)
	        .attr("y2", y2)
	        .attr("class", "selected")
	        .style("opacity", "0")
	        .transition()
			.delay(100)
			.duration(500)
			.style("opacity", "1");
}

function drawText(t, x, y) {
	fileView.append("svg:text")
			.attr("x", x)
			.attr("y", y)
			.attr("class", "inner-text")
			.text(t);
}