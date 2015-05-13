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
	var fileView = d3.select(".file-layout")
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
			.attr("class", "stripe")
			.on("click", function(){
				// shrink the file and expand the stripe
			});

	fileView.append("svg:text")
			.attr("x", x + (w / 2))
			.attr("y", y + (h / 2))
			.attr("class", "inner-text")
			.text("Stripe " + stripeId);
}

function drawFooter(fileView, filedump, x, y, w, h) {
	console.log("x: " + x + " y: " + y + " w: " + w + " h: " + h)
	fileView.append("svg:rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("class", "footer")
			.on("click", function(){
				// shrink the file and expand the footer
			});

	fileView.append("svg:text")
			.attr("x", x + (w / 2))
			.attr("y", y + (h / 2))
			.attr("class", "inner-text")
			.text("Footer");
}
