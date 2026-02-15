// Data
import Singles from "./data-in/singles.js";
// import Sylls from "./data-out/sylls.js";
// import Freqs from "./data-out/freqs.js";
import Words from "./data-out/words.js";
import Words_Manual from "./data-out/words-manual.js";

// Shorthands
var log = console.log;

// Globals
const VI_ALPHABET = "aăâbcdđeêghiklmnoôơpqrstuưvxy"; // 29
const EN_ALPHABET = "fjwz"; // 4, or facebook -> acebook (wrong)
const DIGITS = "0123456789"; // 10
const TONALS = "aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩị"+
    "oòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵ";
// const THRESHOLD = 0.001; // See freq.js, .001 ~take 30% top.

// Static init, use object for ~O(1)
var Wordmap = {}; // Hash table
var Singlemap = {};

for (let W of Words.split(",").concat(Words_Manual.split(",")))
    Wordmap[W] = true;
for (let S of Singles)
    Singlemap[S] = true;

// Main class
class vitokenizer {    
    // Alphabet lowercase + digits, no symbols
    static ALPHABET = VI_ALPHABET + EN_ALPHABET + DIGITS + TONALS;

    // Keep only alphabet
    static simplify(Str){
        // NFC to ensure diacritics & tonals are combined to vowels.
        // toLowerCase works well with vietnamese diacritics & tonals.
        Str = Str.normalize("NFC").toLowerCase(); 
        Str = Str.replace(new RegExp("[^" + thisclass.ALPHABET + "]","g"), "\x20");
        Str = Str.replace(/\s+/g, "\x20").trim();
        return Str;
    }

    // Only syllables and spaces make phrases,
    // symbols break phrase.
    static get_phrases(Str){
        // NFC to ensure diacritics & tonals are combined to vowels.
        // toLowerCase works well with vietnamese diacritics & tonals.
        Str = Str.normalize("NFC").toLowerCase(); 
        Str = Str.replaceAll("\x20","~");
        Str = Str.replace(new RegExp("[^~" + thisclass.ALPHABET + "]","g"), "\x20");
        Str = Str.replace(/\s+/g, "\x20").trim();
        var Phrases = Str.split("\x20");

        for (let i=0; i<Phrases.length; i++){
            Phrases[i] = Phrases[i].replaceAll("~","\x20")
                .replace(/\s+/g,"\x20").trim();
            
            if (Phrases[i].length==0)
                Phrases[i] = null;
            else
                Phrases[i] = Phrases[i].split("\x20");
        }
        return Phrases.filter(X=>X!=null);
    }

    // Array of tokens in sequence, not unique
    static str2arr(Str){
        return thisclass.simplify(Str).split("\x20")
            .filter(X => X.match(/^[0-9.,\-]+$/)==null);
    }     

    // Array of phrases in sequence, not unique
    /*static str2phrases(Str){
        return thisclass.get_phrases(Str);
    }*/

    // Score for pair
    /*static get_score(Left,Right){
        return Freqs[Left+" "+Right] || 0;
    }*/

    // Costly o(n*k) * lookup
    // n=inputStrLen, k=nGram, 
    // Returns all possible tokens (may omit some syllables,
    // and won't output single syllables unless is unknown syllable)
    /*static get_fts_tokens(Str){
        var Arr = thisclass.str2arr(Str);
        var Scores = Array(Arr.length-1).fill(0); 

        for (let i=0; i<Scores.length; i++)
            Scores[i] = thisclass.get_score(Arr[i],Arr[i+1]);

        var Toklist = []; 

        for (let i=0; i<Scores.length; i++){
            // log("\nStart at:",Arr[i]);
            // Keep non-existing syllable
            if (Sylls.indexOf(Arr[i])<0)
                Toklist.push(Arr[i]);

            // Can't join from here
            if (Singles.indexOf(Arr[i])>=0) {
                // log("Can't start from:",Arr[i]);
                continue;
            }

            // Try next ranges
            for (let j=i+1; j<Scores.length+1; j++){
                if (Singles.indexOf(Arr[j])>=0) {
                    // log("Start at:",Arr[i],"- can't end at:",Arr[j]);
                    break;
                }
                if (Scores[j-1] <= THRESHOLD) break;

                let Token = Arr.slice(i,j+1).join("_");
                // log("Token:",Token);
                Toklist.push(Token);
            }
        }
        return [...new Set(Toklist)];
    }*/

    // Fast o(n) * lookup
    // Returns a list of tokens (not missing a single syllable
    // in input Str)   
    /*static get_grammar_tokens_phrase(Str){
        var Arr = thisclass.str2arr(Str);
        var Scores = Array(Arr.length-1).fill(0); 

        for (let i=0; i<Scores.length; i++)
            Scores[i] = thisclass.get_score(Arr[i],Arr[i+1]);

        var Tokstr = "";

        for (let i=0; i<Scores.length; i++){
            // No single left, no single right, nor low relation rate
            if (Singles.indexOf(Arr[i])>=0 || Singles.indexOf(Arr[i+1])>=0 
                    || Scores[i] <= THRESHOLD)                
                Tokstr += Arr[i]+"\x20";
            // ok to join    
            else
                Tokstr += Arr[i]+"_"; 
        }
        Tokstr += Arr[Arr.length-1];
        return Tokstr.split("\x20");
    }*/

    // Fast o(n) * lookup
    // Returns a list of phrases and their tokens
    /*static get_grammar_tokens(Str){
        var Phrases = thisclass.get_phrases(Str);
        var Toklist = [];

        for (let P of Phrases)
            Toklist.push(thisclass.get_grammar_tokens_phrase(P.join(" ")));

        return Toklist;
    }*/

    // Get FTS words (only in dictionary or strange single syllables)
    // See README.md for algo
    static get_fts_words_phrase(Added, Added_Sylls, Str){
        var Arr = thisclass.str2arr(Str);
        if (Arr.length==0) return [];

        // Get all considerable chunks (tri/bi/mono-gram)
        var Chunks = [];
        var Foundwords = [];

        for (let i=0; i<Arr.length; i++){
            Chunks.push(Arr.slice(i,i+3));
            Chunks.push(Arr.slice(i,i+2));
            Chunks.push(Arr.slice(i,i+1));
        }
        
        // Loop to find useful chunks
        for (let C of Chunks){
            let Tok = C.join(" ");            

            if (C.length==3){ // len case
                if (Wordmap[Tok]===true) // in dictionary
                    // Not excluded, not added to list?
                    if (Singlemap[Tok]==null && Added[Tok]==null){
                        Foundwords.push(Tok);
                        // Mark to avoid duplicates:
                        Added[Tok]=true;
                        for (let Syll of C) Added_Sylls[Syll]=true;
                    }
            }
            else 
            if (C.length==2){ // len case
                if (Wordmap[Tok]===true) // dict check
                    // Not excluded, not added to list?
                    if (Singlemap[Tok]==null && Added[Tok]==null){
                        Foundwords.push(Tok);
                        // Mark to avoid duplicates
                        Added[Tok]=true;
                        for (let Syll of C) Added_Sylls[Syll]=true;
                    }
            }
            else {
                // Skip ignored word, and need at least 2 chars
                if (Singlemap[Tok]===true || Tok.length<2) continue;

                // Single syllables need to be added to list too
                // but not duplicates
                if (Added[Tok]==null && Added_Sylls[Tok]==null){
                    Foundwords.push(Tok);
                    Added[Tok]=true;
                }
            }
        } // All considerable chunk loop

        return Foundwords;
    }

    // Get words to index in full-text index
    static get_fts_words(Str){
        var Phrases = thisclass.get_phrases(Str);
        var Toklist = [];
        var Added = {};
        var Added_Sylls = {};

        for (let P of Phrases)
            Toklist.push(thisclass.get_fts_words_phrase(
                Added, Added_Sylls, P.join(" ")
            ));

        return Toklist.flat();
    }
}
 
const thisclass = vitokenizer;
export default thisclass;
// EOF