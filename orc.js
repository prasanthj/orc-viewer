var fileView
loadLayout()

function loadLayout() {
	var metadata = getFileMetadata(data);
	updateMetadataList(metadata);

	var originX = $(".col-md-4").width();
	var originY = 0;
	var width = $(".col-md-8").width();
	var height = $(".body.container-fluid").height();
	drawFileLayout(data, originX, originY, width, height);
}

function getFileMetadata(filedump) {
	var fileMetadata = []
	fileMetadata.push(["Filename", filedump["fileName"]])
	fileMetadata.push(["Schema", htmlEntities(filedump["schemaString"])])
	fileMetadata.push(["Compression", filedump["compression"]])
	fileMetadata.push(["Compression Buffer Size", filedump["compressionBufferSize"]])
	fileMetadata.push(["File Version", filedump["fileVersion"]])
	fileMetadata.push(["Writer Version", filedump["writerVersion"]])
	fileMetadata.push(["Row Count", filedump["numberOfRows"]])
	fileMetadata.push(["File Length", filedump["fileLength"]])
	fileMetadata.push(["Padding Length", filedump["paddingLength"]])

	return fileMetadata;
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
	console.log("x: " + x + " y: " + y + " w: " + w + " h: " + h)
	fileView = d3.select(".file-layout")
					.append("svg:svg")
					.attr("width", w)
					.attr("height", h);

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
	console.log("x: " + x + " y: " + y + " w: " + w + " h: " + h)
	fileView.append("svg:rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("id", "stripe")
			.on("mouseover", focus)
			.on("mouseout", defocus);

	fileView.append("svg:text")
			.attr("x", x + (w / 2))
			.attr("y", y + (h / 2))
			.attr("id", "inner-text")
			.text("Stripe " + stripeId);
}

function drawFooter(fileView, filedump, x, y, w, h) {
	console.log("x: " + x + " y: " + y + " w: " + w + " h: " + h)
	fileView.append("svg:rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("id", "footer")
			.on("mouseover", focus)
			.on("mouseout", defocus);

	fileView.append("svg:text")
			.attr("x", x + (w / 2))
			.attr("y", y + (h / 2))
			.attr("id", "inner-text")
			.text("Footer");
}

function focus() {
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
			.duration(500)
			.style("opacity", 1.0);
}

function defocus() {
	d3.select(".selected").remove();
}