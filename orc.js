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
		drawRect(fileView, newX, newY, stripeWidth, perStripeHeight, "stripe", elementClick, "Stripe " + (i + 1), i + 1)
		newY += perStripeHeight
	}

	var footerHeight = 0.1 * h
	drawRect(fileView, newX, newY, stripeWidth, footerHeight, "footer", elementClick, "Footer")
}

function zoomed() {
	fileView.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function elementClick() {
	d3.selectAll(".selected").remove();
	var x = parseFloat(d3.select(this).attr("x"));
	var y = parseFloat(d3.select(this).attr("y"));
	var w = parseFloat(d3.select(this).attr("width"));
	var h = parseFloat(d3.select(this).attr("height"));
	if (d3.select(this).attr("class").indexOf("depth-1") > 0) {
		x = 2 * x
		y = 2 * y
		w = 2 * w
		h = 2 * h	
	}
	drawLine(fileView, x, y, x + w, y, "selected", false);
	drawLine(fileView, x, y + h, x + w, y + h, "selected", false);

	if (d3.select(this).attr("class") == "stripe") {
		var stripeId = d3.select(this).attr("id")
		updateMetadataList(stripeMetadata[stripeId])
		drawStripeExpanded(x, y, w, h)
	} else if (d3.select(this).attr("class") == "footer") {
		updateMetadataList(fileMetadata)
		drawFooterExpanded(x, y, w, h)
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

function drawFooterExpanded(x, y, w, h) {
	fileView.transition()
			.delay(100)
			.duration(500)
	        .attr("transform", "scale(0.5)");
	x = 0.5 * x;
	y = 0.5 * y;
	w = 0.5 * w;
	h = 0.5 * h;

	d3.selectAll(".depth-1").remove()
	var depth1 = fileView.append("g")
						 .attr("transform", "scale(2)");

	var stripeWidth = width * 0.5
	var stripeHeight = height * 0.5
	var x1 = x + w
	var y1 = y
	var lineWidth = 100
	var x2 = x1 + 100
	var y2 = y1
	drawLine(depth1, x1, y1, x2, y2, "expander-line depth-1", true)
	var x3 = x1
	var y3 = y1 + h
	var x4 = x1 + lineWidth
	var y4 = y1 + stripeHeight
	drawLine(depth1, x3, y3, x4, y4, "expander-line depth-1", true)

	var headerHeight = 0.4 * stripeHeight
	var footerHeight = 0.2 * stripeHeight
	var bodyHeight = stripeHeight - headerHeight - footerHeight
	drawRect(depth1, x2, y2, stripeWidth, headerHeight, "stripe-header depth-1", elementClick, "Metadata")
	drawRect(depth1, x2, y2 + headerHeight, stripeWidth, bodyHeight, "stripe-body depth-1", elementClick, "Footer")
	drawRect(depth1, x2, y2 + headerHeight + bodyHeight, stripeWidth, footerHeight, "stripe-footer depth-1", elementClick, "Postscript")
}

function drawStripeExpanded(x, y, w, h) {
	fileView.transition()
			.delay(100)
			.duration(500)
	        .attr("transform", "scale(0.5)");
	x = 0.5 * x;
	y = 0.5 * y;
	w = 0.5 * w;
	h = 0.5 * h;

	d3.selectAll(".depth-1").remove()
	var depth1 = fileView.append("g")
						 .attr("transform", "scale(2)");

	var stripeWidth = width * 0.5
	var stripeHeight = height * 0.5
	var x1 = x + w
	var y1 = y
	var lineWidth = 100
	var x2 = x1 + 100
	var y2 = y1
	drawLine(depth1, x1, y1, x2, y2, "expander-line depth-1", true)
	var x3 = x1
	var y3 = y1 + h
	var x4 = x1 + lineWidth
	var y4 = y1 + stripeHeight
	drawLine(depth1, x3, y3, x4, y4, "expander-line depth-1", true)

	var headerHeight = 0.15 * stripeHeight
	var footerHeight = 0.15 * stripeHeight
	var bodyHeight = stripeHeight - headerHeight - footerHeight
	drawRect(depth1, x2, y2, stripeWidth, headerHeight, "stripe-header depth-1", elementClick, "Indexes")
	drawRect(depth1, x2, y2 + headerHeight, stripeWidth, bodyHeight, "stripe-body depth-1", elementClick, "Data")
	drawRect(depth1, x2, y2 + headerHeight + bodyHeight, stripeWidth, footerHeight, "stripe-footer depth-1", elementClick, "Stripe Footer")
}

function drawRect(node, x, y, w, h, klass, clickHandler, text) {
	drawRect(node, x, y, w, h, klass, clickHandler, text, "")
}

function drawRect(node, x, y, w, h, klass, clickHandler, text, id) {
	node.append("svg:rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("class", klass)
			.attr("id", id)
			.on("click", clickHandler)
			.style("opacity", "0")
			.transition()
			.delay(100)
			.duration(500)
			.style("opacity", "1");
	drawText(node, text, x + (w / 2), y + (h / 2))
}

function drawLine(node, x1, y1, x2, y2, klass, isDotted) {
	if (isDotted) {
		node.append("svg:line")
	        .attr("x1", x1)
	        .attr("y1", y1)
	        .attr("x2", x2)
	        .attr("y2", y2)
	        .attr("class", klass)
	        .style("stroke-dasharray", ("5, 5"))
	        .style("opacity", "0")
	        .transition()
			.delay(100)
			.duration(500)
			.style("opacity", "0.5");
	} else {
		node.append("svg:line")
	        .attr("x1", x1)
	        .attr("y1", y1)
	        .attr("x2", x2)
	        .attr("y2", y2)
	        .attr("class", klass)
	        .style("opacity", "0")
	        .transition()
			.delay(100)
			.duration(500)
			.style("opacity", "1");	
	}
}

function drawText(node, t, x, y) {
	node.append("svg:text")
			.attr("x", x)
			.attr("y", y)
			.attr("class", "inner-text")
			.text(t);
}