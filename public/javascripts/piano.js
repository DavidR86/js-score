$( document ).ready(function() {
    //create piano with 3 octaves, starting at C4 (lowest key)
    //shows labels and octave shift buttons
    var keyboardHTML = htmlForKeyboardWithOctaves(4, octaves.C2, false, false, false, false)
    //render the keyboard in the div
    $("#keyboardContainer").html(keyboardHTML)
    //when keys are pressed updatePreview() is called
    bindKeysToFunction(updatePreviewWithNote)
    //when the clef is changed updatePreviewWithClef() is called
    bindClefSelectionToFunction(updatePreviewWithClef)
    //set the default clef to G4
    setSelectedClef(clefs.G4)
})

//this stores all keyboard input
var plaineEasieCodes = []
var selectedClef = clefs.G4

//this is called whenever a piano key is pressed
function updatePreviewWithNote(sender, paeNote) {
    //console.log(pressKey);
    var octave;
    if (paeNote.includes(",,")){
	octave = "2";
    }else if(paeNote.includes(",")){
	octave = "3";
    }else if(paeNote.includes("''")){
	octave = "5";
    }else {
	octave = "4";
    }
    e = {
	note: {
	    name: paeNote.charAt(paeNote.length-1),
	    octave: octave
	}
    }
    pressKey(e);

    //need to return note.name = "F", note.octave = "4"

}

//this is called when the user changes the clef for display
function updatePreviewWithClef(sender, clef) {
    //console.log("clef changed to " + clef)

}

function updateNotesSVG() {

}
