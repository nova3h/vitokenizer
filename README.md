Vi-Tokenizer
============

Description
-----------

**Vietnamese Tokenizer** for **JavaScript**, with both modes to tokenize
for __grammar__ (no overlapping syllables) and for __FTS__ (Full-text Search,
allows overlapping syllables of tokens).


The Algorithm
-------------

Data:
  - All syllable list
  - Scored frequency list of 2 adjacent syllables

Algo:
  - For each syllable, get the scores with left syllable & right syllable to decide
  - 4 dicisions:
      - No joining with both left and right syllables
      - Join with left syllable only
      - Join with right syllable only
      - Join with both syllables
   
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

Creative Commons.<br>
by Novaeh Team.
