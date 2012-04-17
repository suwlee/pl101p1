// MUS compiler

var compileMus = function(expr) {
	var note = [];
	handleMus(note, 0, expr);
	return note;
};

var handleMus = function(note, start, expr) {
	var func = selectMusFunc(expr.tag);
	return func(note, start, expr);
};

var selectMusFunc = function(tag) {
	var func = {
		seq: handleMusSeq,
		par: handleMusPar,
		repeat: handleMusRepeat
	}[tag];
	if (typeof(func) === 'undefined') {
		func = handleMusNoteAndRest;
	}
	return func;
};

var handleMusSeq = function(note, start, expr) {
	return handleMus(
		note, 
		handleMus(note, start, expr.left),
		expr.right);
};

var handleMusPar = function(note, start, expr) {
	return Math.max(
		handleMus(note, start, expr.left),
		handleMus(note, start, expr.right));
};

var handleMusRepeat = function(note, start, expr) {
	var newStart = start;
	for (var i=0; i<expr.count; i++) {
		newStart += handleMus(note, newStart, expr.section);
	}
	return newStart;
};

var handleMusNoteAndRest = function(note, start, expr) {
	var item = { tag: expr.tag, start: start, dur: expr.dur };
	if (expr.tag === 'note') {
		item.pitch = expr.pitch;
	}
	note.push(item);
	return start + expr.dur;
};

// NOTE compiler

var compileNote = function(expr) {
	var note = [];
	for (var i=0; i<expr.length; i++) {
		var item = expr[i];
		note.push({
			tag: item.tag,
			pitch: getMIDINum(item.pitch),
			start: item.start,
			dur: item.dur
		});
	}
	return note;
};

var getMIDINum = function(note) {
	var midi = {
		c: [1, 24],
		d: [1, 26],
		e: [1, 28],
		f: [1, 29],
		g: [1, 31],
		a: [0, 21],
		b: [0, 23]
	}[note[0].toLowerCase()];	
	var base = 12 * (parseInt(note[1]) - midi[0]);
	return base + midi[1];
};

// MAIN compiler
    
var compile = function(musExpr) {
	var noteExpr = compileMus(musExpr);
	return compileNote(noteExpr);
};
