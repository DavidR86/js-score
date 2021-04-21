$(document).ready(function() {
    $('.a').click(function() {
	$(this).toggleClass("down");
    });
});


var addNotesInterval;

var pressKey;
var highscore = getHighscore();
document.getElementById("highscore-label").textContent = ("Highscore: "+highscore);
var startingAddNoteInterval = 3000;
var decreaseStepMs = 50;
var lastInterval;

var conversionHelper = ["C", "D", "E", "F", "G", "A", "B"];

var lastWrongNote;
var lastAnswers = [];


WebMidi.enable(function (err) {

    $(document).ready(function() {

	if (err) {
	    console.log("WebMidi could not be enabled.", err);
	    alert("Your browser does not support MIDI. You can use the keyboard on the screen.");
	}else {
	    alert("You can connect a MIDI keyboard, or use the keyboard on the screen");

	    var string = "MIDI inputs:";
	    WebMidi.inputs.forEach(function(item) {
		string+="<br>"+item.name;
	    });
	    document.getElementById("MIDIinputs").innerHTML = string;

	    // Reacting when a new device becomes available
	    WebMidi.addListener("connected", function(e) {
		console.log(e);
		var string = "MIDI inputs:";
		WebMidi.inputs.forEach(function(item) {
		    string+="<br>"+item.name;
		});
		document.getElementById("MIDIinputs").innerHTML = string;
	    });

	    // Reacting when a device becomes unavailable
	    WebMidi.addListener("disconnected", function(e) {
		console.log(e);
		var string = "MIDI inputs:";
		WebMidi.inputs.forEach(function(item) {
		    string+="<br>"+item.name;
		});
		document.getElementById("MIDIinputs").innerHTML = string;    });

	}

	// Basic setup boilerplate for using VexFlow with the SVG rendering context:
	VF = Vex.Flow;

	// Create an SVG renderer and attach it to the DIV element named "boo".
	var div = document.getElementById("boo")
	//div.innerHTML = ''; // clear child elements
	var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

	// Configure the rendering context.
	renderer.resize(590, 500);
	var context = renderer.getContext();

	// Create a stave of width 10000 at position 10, 40 on the canvas.
	var stave = new VF.Stave(10, 10, 800).addClef('treble');
	var stave_bass = new VF.Stave(10, 70, 800).addClef('bass');

	context.setFillStyle('orange');
	
	// Connect it to the rendering context and draw!
	stave.setContext(context).draw();
	stave_bass.setContext(context).draw();

	
	($('#start').click(function() {

	    //remove old colored notes
	    if(lastWrongNote != null) {
		lastWrongNote.classList.remove("last-wrong");
		lastAnswers.forEach(answer => answer.classList.remove("last-right"));
	    }
	    

	    //var div = document.getElementById("boo")
	    //div.innerHTML = ''; // clear child elements

	    var selectedNotes = $('.notes.a').not(".down");
	    var selectedOctaves = $('.octave.a').not(".down");
	    var notesArr = [];
	    var score = 0;
	    var currentAddNoteInterval = startingAddNoteInterval
	    document.getElementById("score-label").textContent = ("Score: "+score);
	    var lost = false;
	    var speedIncrease =  ( $('#increase-speed').hasClass('down')) ? false : true; 


	    for(let i = 0; i < 1000; i++) {
		var val = [];
		val.push(selectedNotes[Math.floor((Math.random() * selectedNotes.length))].dataset.name);
		val.push("");
		val.push(selectedOctaves[Math.floor((Math.random() * selectedOctaves.length))].dataset.name);
		notesArr.push(val);
	    }
	    

	    var tickContext = new VF.TickContext();

	    var durations = ['8', '4', '2', '1'];

	    var Queue = {
		notes : [],
		position : 0,
		next : function() {
		    if(this.position < this.notes.length) {
			return this.notes[++this.position];
		    }else {
			this.position = 0;
			return this.notes[0];
		    }
		}
	    };

	    var timeouts = [];


	    var queueInstance = Object.create(Queue);

	    var notes = notesArr.map(([letter, acc, octave]) => { // use ES6 Array Destructuring here
		var keyList;
		if($("#chords").hasClass("down")){
		    keyList = [letter+acc+"/"+octave]; //no chords
		}else{
		    //chords
		    var selectedNotesCopy = [];
		    for(var i = 0; i < selectedNotes.length; i++){
			selectedNotesCopy.push(selectedNotes[i].dataset.name);
		    }
		    let index = Math.floor((Math.random() * selectedNotesCopy.length));
		    let note1 = selectedNotesCopy[index];
		    selectedNotesCopy.splice(index, 1);
		    index =  Math.floor((Math.random() * selectedNotesCopy.length));
		    let note2 = selectedNotesCopy[index];
		    selectedNotesCopy.splice(index, 1);
		    index =  Math.floor((Math.random() * selectedNotesCopy.length));
		    let note3 = selectedNotesCopy[index];
		    if(Math.random() > 0.66) {
			// 3 note chords
			keyList = [note1+acc+"/"+octave, note2+"/"+octave, note3+"/"+octave];
			
		    }else{
			// 2 note chord
			keyList = [note1+acc+"/"+octave, note2+"/"+octave];
		    }
		}

		 const note = new VF.StaveNote({
		     clef: (octave === "2" || octave === "3") ? "bass" : "treble",
		     keys: keyList,
		     duration: durations[Math.floor(Math.random()*durations.length)],
		 });
		
		note.setStyle({fillStyle: "orange", strokeStyle: "orange"});
		note.setContext(context)
		    .setStave((octave === "2" || octave === "3") ? stave_bass : stave);

		// If a StaveNote has an accidental, we must render it manually.
		// This is so that you get full control over whether to render
		// an accidental depending on the musical context. Here, if we
		// have one, we want to render it. (Theoretically, we might
		// add logic to render a natural sign if we had the same letter
		// name previously with an accidental. Or, perhaps every twelfth
		// note or so we might render a natural sign randomly, just to be
		// sure our user who's learning to read accidentals learns
		// what the natural symbol means.)
		if(acc) note.addAccidental(0, new VF.Accidental(acc));

		// Here we add the note to the tickContext so that it will get
		// assigned an x-position
		tickContext.addTickable(note)
		return note;
	    });

	    queueInstance.notes = notes;
	    tickContext.preFormat().setX(500)



	    const visibleNoteGroups = [];
	    var notesAnswerArray = [];

	    function addNote() {
		note = queueInstance.next(); // pluck the left-most undrawn note
		if(!note) return; // if we're out of notes, return.
		const group = context.openGroup(); // create an SVG group element
		visibleNoteGroups.push(group); // add that element to our visibleNoteGroups array
		note.draw(); // draw the note
		notesAnswerArray.push(note);
		context.closeGroup(); // and close the group
		
		group.classList.add('scroll'); // set up the group for scrolling

		// Force a dom-refresh by asking for the group's bounding box. Why? Most
		// modern browsers are smart enough to realize that adding .scroll class
		// hasn't changed anything about the rendering, so they wait to apply it
		// at the next dom refresh, when they can apply any other changes at the
		// same time for optimization. However, if we allow that to happen,
		// then sometimes the note will immediately jump to its fully transformed
		// position -- because the transform will be applied before the class with
		// its transition rule. 
		const box = group.getBoundingClientRect();
		group.classList.add('scrolling'); // and now start it scrolling

		// If a user doesn't answer in time make the note fall below the staff
		var noteTimeout = window.setTimeout(() => {
		    $('.too-slow').remove(); //remove old objects
		    const index = visibleNoteGroups.indexOf(group);
		    if(index === -1) return;
		    group.classList.add('too-slow');
		    notesAnswerArray.shift();
		    visibleNoteGroups.shift();
		    lose("You ran out of time!");
		}, 5000);
		timeouts.push(noteTimeout);
	    }

	    function addNotesInterval() {
		addNote();
		if(!lost) {
		    if(speedIncrease) {
			currentAddNoteInterval -= decreaseStepMs;
			if(currentAddNoteInterval < 300) {
			    currentAddNoteInterval = 300;
			}
		    }
		    lastInterval = window.setTimeout(addNotesInterval, currentAddNoteInterval);
		}
	    }
	    
	window.setTimeout(addNotesInterval, 500);

	    function rightAnswer(e) {
		$('.correct').remove(); //delete old correct notes
		group = visibleNoteGroups.shift();
		notesAnswerArray.shift();
		group.classList.add('correct'); // this starts the note fading-out.

		// The note will be somewhere in the middle of its move to the left -- by
		// getting its computed style we find its x-position, freeze it there, and
		// then send it straight up to note heaven with no horizontal motion.
		const transformMatrix = window.getComputedStyle(group).transform;
		
		// transformMatrix will be something like 'matrix(1, 0, 0, 1, -118, 0)'
		// where, since we're only translating in x, the 5th property will be
		// the current x-translation. You can dive into the gory details of
		// CSS3 transform matrices (along with matrix multiplication) if you want
		// at http://www.useragentman.com/blog/2011/01/07/css3-matrix-transform-for-the-mathematically-challenged/
		const x = transformMatrix.split(',')[4].trim();

		// And, finally, we set the note's style.transform property to send it skyward.
		group.style.transform = `translate(${x}px, -800px)`;
		score++;
		document.getElementById("score-label").textContent = ("Score: "+score);
		
	    };



	    pressKey = function(e) {

		var answers = [];

		for(var i = 0; i <  notesAnswerArray[0].keys.length; i++){
		    answers.push(notesAnswerArray[0].keys[i].charAt(0).toUpperCase());
		}

		var answer = notesAnswerArray[0].keys[0];
		//var staffNote = answer.charAt(0).toUpperCase();
		var octave = answer.charAt(answer.length-1);
		//var full = staffNote+octave;
		var message = "You pressed: "+e.note.name + e.note.octave+", Correct: ["+answers+"]"+octave;
		if(answers.includes(e.note.name) && e.note.octave == octave) {
		    //if(e.note.name == staffNote && e.note.octave == octave) {
		    notesAnswerArray[0].keys.splice(answers.indexOf(e.note.name), 1);
		    if(notesAnswerArray[0].keys.length==0){
			rightAnswer();
		    }else {
			score++;
			document.getElementById("score-label").textContent = ("Score: "+score);
		    }
		}else{
		    lose(message);

		    //display notes
		    var keyboard = Array.from(document.getElementsByClassName("DA-PianoKeyboard")[0].children);
		    //var keyboard = document.getElementsByClassName("DA-PianoKeyboard")[0].children;
		    //keyboard.map((value, index) => {});

		    keyboard = keyboard.filter(key => (!key.className.includes("Flat") && !key.className.includes("Sharp")));

		    lastWrongNote = keyboard[conversionHelper.indexOf(e.note.name) + (Number(e.note.octave)-2)*7];
		    lastWrongNote.classList.add("last-wrong");

		    lastAnswers = answers.map((key, index) => {
			console.log(key)
			console.log(conversionHelper.indexOf(key) +  (Number(octave)-2)*7)
			    return keyboard[conversionHelper.indexOf(key) + (Number(octave)-2)*7]});
			console.log(lastAnswers)

		    lastAnswers.forEach( element => element.classList.add("last-right"));
		}
		
	    }

	    if(!err) {

		var input = WebMidi.inputs[WebMidi.inputs.length-1];
		console.log(input);

		var l = input.addListener('noteon', 'all', pressKey);
		
	    }


	    function lose(message){
		if(score > highscore){
		    highscore = score;
		    document.getElementById("highscore-label").textContent = ("Highscore: "+highscore);
		    updateHighscore(highscore);
		}
		clearInterval(lastInterval); // stop adding notes
		if(!err){
		    input.removeListener(); // remove all listeners.
		}
		//var div = document.getElementById("boo")
		//div.innerHTML = ''; // clear child elements
		$('.scrolling').remove() //only remove notes

		setTimeout(function() {
		    //clearInterval(addNotesInterval); // stop adding notes
		    lost = true;
		    for (var i=0; i<timeouts.length; i++) {
			clearTimeout(timeouts[i]);
		    }
		    notesArr = [];
		    notesAnswerArray = [];
		    alert('You lost! \n'+message+"\nScore: "+score);
		    
		    //location.reload();
		}, 200);
	    }

	}));
    });

});
