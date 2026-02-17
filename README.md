Vi-Tokenizer
============

Description
-----------

Vi-Tokenizer, a very light-weight (700KB) and efficient Vietnamese tokenizer in JS, 
good to use especially for full-text search.


Usage
-----

The lib is avail for both ES6 import and script tag, 
use `dev` branch 'cause the latest code is there.


### How to Use in ES6
Tokenize a string for FTS:
```
import vitokenizer from "vitokenizer/dist/main.js";
var Words = vitokenizer.get_fts_words(Str);
// Now the word list is available
// 1) Use it for FTS index
// 2) Or use it as FTS search terms
```


### How to Use with Script Tag
```
<!-- Required charset -->
<meta charset="utf-8">
<!-- Load lib -->
<script src="vitokenizer/dist/main.js"></script>

<script>
// Lib available at window.vitok
alert(window.vitok.get_fts_words("Chợ hoa lớn nhất Hà Nội nhộn nhịp đêm cuối năm"));
// -> ["chợ", "hoa", "lớn nhất", "hà nội", "nhộn nhịp", "đêm", "cuối năm"]
</script>
```


### Old Methods
These old methods are __**deprecated**__ which may result in non-dictionary words.

Tokenize a string for FTS:
```
// This method is disabled
import vitokenizer from "vitokenizer/dist/main.js";
var Tokens = vitokenizer.get_fts_tokens(Str);
```

Tokenize a string for grammar:
```
// This method is disabled
import vitokenizer from "vitokenizer/dist/main.js";
var Tokens = vitokenizer.get_grammar_tokens(Str);
```


The Algorithm of New Methods
----------------------------

Complexity:
  - JS object is hash-table, ~O(1)
  - This algo: O(inpStrLen) * Hashlookup

Steps:
  - Scan input string from left (always skip 1 for max matchings)
      - Conditions to store: __tri/bi-gram in dict, or strange__ syllables.
  - Check tri-gram in dictionary, found? 
      - STORE tri-gram, and skip 1 syllable.
  - Check bi-gram in dictionary, found? 
      - STORE bi-gram, and skip 1 syllable.
  - No tri-gram nor bi-gram?
      - Is syllable to skip (eg. 'và')? no storing, skip 1 syllable.
      - Syllable not in dictionary? STORE mono-gram, skip 1 syllable.
      - Last case here: no storing, skip 1 syllable.


The Algorithm of Old Methods
----------------------------

Data:
  - All syllable list
  - Scored frequency list of 2 adjacent syllables

Algo:
  - For each syllable, skip joining if to be single syll, eg. 'và'
  - Get the score for the pair left syllable & right syllable to decide
  - Join the 2 sylls if score is above threshold
   
The Pros:
  - With scores is better than dictionary.has(...)
  - Output for most of cases: Monogram, Duogram, Trigram.

The Cons:
  - Can't be perfect when it's related to meaning
  - eg. bàn ăn tối<br>
    bàn ăn -> Good score<br>
    ăn tối -> Good score<br>
    [bàn ăn]+[tối]=Correct, or [bàn]+[ăn tối]=Wrong


The Licence
-----------

General Public Licence v3.<br>
by Novaeh Team.
