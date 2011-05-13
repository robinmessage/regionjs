function makeSplitter() {
//	return $('<span>&#8203;</span>').css('display','inline');
	return $('<img width=0 height=1 />');
}

function doSplit(text,splitpoint,top,splitter) {
	bottom=text.splitText(splitpoint);
	//Split it here
	splitter.insertBefore(bottom);
	//Check it out
	offset=splitter.offset().top-top;
	return offset;
}

function trialSplit(text,splitpoint,top,splitter,element) {
	offset=doSplit(text,splitpoint,top,splitter);
	//Put it back
	splitter.detach();
	element.normalize();
	return offset;
}

function splitText(contents,top,element) {
	text=contents;
	length=text.length;
	splitpoint=parseInt((length)/2);

	splitter=makeSplitter();

	step=splitpoint;
	direction=0;

	do {
		if(step==1)step=0;
		else
			step=parseInt((step+1)/2);
		offset=trialSplit(text,splitpoint,top,splitter,element);
		//console.log("A Trial split at "+splitpoint+" offset "+offset+" (step "+step+")");
		if(offset<=0) {
			splitpoint+=step;
		} else {
			splitpoint-=step;
		}
	} while(step>=1 && splitpoint>=0 && splitpoint<=text.length-1)

	//Move left until wrong
	while(splitpoint>0 && splitpoint<text.length-1) {
		offset=trialSplit(text,splitpoint,top,splitter,element);
		//console.log("B Trial split at "+splitpoint+" offset "+offset);
		if(offset>0)splitpoint--;
		else break;
	}

	if(splitpoint<=0 || splitpoint>=text.length-1)return false;
	
	var movement=0;

	while(true) {

		//Move left until space or other suitable character to split.
		while(splitpoint>0 && text.data[splitpoint].match("[ \f\n\r\t\v\u00A0\u2028\u2029\u00AD]")==null) {
			splitpoint--;
			//console.log("C Trial split at "+splitpoint+" text "+text.data[splitpoint]);
			movement++;
		}

		if(text.data[splitpoint]=="\u00AD") {
			if(movement<2) {
				//console.log("Again for -, movement "+movement);
				splitpoint--;
				movement++;
				continue;
			}
			text.insertData(splitpoint++,"\u00AD");
			movement*=2; //Assume no char more than twice the width of space.
			while(movement-->0)
				text.insertData(splitpoint++,"\u00A0");
			text.insertData(splitpoint++,"\u00AD");
		}
		break;
	}

	doSplit(text,splitpoint,top,splitter);
	return splitter;
}

function fixup(node,from) {
	if(node.tagName=="OL") {
		console.log("Fixup an OL");
		//if(tagName=="OL")newTag.attr("start",found+1);
	}
}

function fillRegion(source,dests,overflow,bottom) {
	var dest=dests.shift();
	if(overflow) {
		var z=$(dest);
		bottom=z.offset().top+z.height();
	}
	var subpart=source.cloneNode(false);
	dest.appendChild(subpart);
	dest=subpart;
	
	var full=false;
	while(source.childNodes.length>0 && !full) {
		var node=source.childNodes[0];
		if(node.nodeType==3) {
			//Check and maybe split a text node
			dest.appendChild(node);
			var splitter=makeSplitter();
			splitter.insertAfter(node);
			if(splitter.offset().top>bottom) {
				//Doesn't fit, split text
				splitter.detach();
				splitter=splitText(node,bottom,dest);
				if(!splitter) {
					//Doesn't fit at all.
					//Put it back.
					source.insertBefore(node,source.childNodes[0]);
					//Finished.
				} else {
					source.insertBefore(splitter[0].nextSibling, source.childNodes[0]);
					splitter.detach();
				}
				full=true;
			} else {
				//Fits, carry on.
				splitter.detach();
			}
		} else {
			dest.appendChild(node);
			z=$(node);
			var top=z.offset().top;
			if(top>bottom) {
				//Doesn't fit at all, don't recurse
				source.insertBefore(node,source.childNodes[0]);
				full=true;
			} else if(top+z.height()>bottom) {
				source.insertBefore(node,source.childNodes[0]);
				dest.appendChild(node.cloneNode(false));
				fillRegion(node,[dest.lastChild],false,bottom);
				fixup(node,dest);
				full=true;
			}
		}
	}
	if(source.childNodes.length>0) {
		if(dests.length>0) {
			fillRegion(source,dests,overflow);
		} else if(overflow) {
			while(source.childNodes.length>0) {
				dest.appendChild(source.childNodes[0]);
			}
		}
	}
}

function fillWrapper(source,dests) {
	oldsource=source.cloneNode(true);
	fillRegion(source,dests,true);
	return oldsource;
}

function clearDests(dests) {
	$(dests).empty();
}

var regions = {};
var regions_ready = false;

$(window).load(function(){
	// Find the threads and hide them and make a list.
	// Actually, detaching them makes more sense.
	$(".regioned").each(function(i,r){
		var z=$(r).detach();
		regions[z.attr("region")]={source:r,dests:[]};
	});

	// Find the regions and categorise them.
	$(".region").each(function(i,r){
		var z=$(r);
		var klass=z.attr("class");
		var m=klass.match(/region ([a-zA-Z0-9-]*)/);
		if(m && regions.hasOwnProperty(m[1])) {
			regions[m[1]].dests.push(r);
		}
	});
	// Fill the regions from the threads.
	for(var k in regions) {
		var d=regions[k].dests.slice(0);
		regions[k].source=fillWrapper(regions[k].source,d);
	}
	regions_ready=true;
});

$(window).resize(function(){
	if(regions_ready) {
		for(var k in regions) {
			var d=regions[k].dests.slice(0);
			clearDests(d);
			d=regions[k].dests.slice(0);
			regions[k].source=fillWrapper(regions[k].source,d);
		}
	}
});
