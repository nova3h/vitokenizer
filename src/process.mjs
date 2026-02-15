// Rt
import fs from "fs";

// Main file
import vitokenizer from "./index.js";

// Data
// import Data_Dump from "./data-in/data-dump.js";
// import Data_Manual from "./data-in/data-manual.js";
// import Singles from "./data-in/singles.js";

// Shorthands
const vitok = vitokenizer;
var log = console.log; 
  
// Globals
// const Data = Data_Dump + ", " + Data_Manual;
// var Textarr;    
// var Sylls;  
// var Freq;
var Words;

// Data for old method
/*function build_syllables(){
    log("Alphabet:",vitok.ALPHABET.length);
    Textarr = vitok.str2arr(Data);
    log("Words:",Textarr.length);
    Sylls = [...new Set(Textarr)].sort();
    log("Syllables:",Sylls.length);
    fs.writeFileSync("data-out/sylls.js",`export default ${JSON.stringify(Sylls)};`);
}*/

// Data for old method
/*function build_frequencies(){
    var Phrases = vitok.str2phrases(Data);
    log("Phrases:",Phrases.length);
    Freq = {};

    for (let i=0; i<Phrases.length; i++){
        if (Phrases[i].length<=1) continue;

        for (let j=0; j<Phrases[i].length-1; j++){
            let Left = Phrases[i][j];
            let Right = Phrases[i][j+1];
            if (Singles.indexOf(Left)>=0) continue;
            if (Singles.indexOf(Right)>=0) continue; 

            let Key = Left+" "+Right;
            if (Freq[Key]==null) Freq[Key] = 1;
            Freq[Key]++;
        } // syll loop
    } // phrase loop
    
    // Sort keys
    var Keys = Object.keys(Freq);
    Keys.sort((A,B)=>{
        if (Freq[A] > Freq[B]) return -1;
        if (Freq[A] < Freq[B]) return 1;
        return 0;    
    });    
    
    // New object with more frequent pairs first
    var New_Freq = {};
    for (let K of Keys) New_Freq[K] = Freq[K];
    Freq = New_Freq;    
    log("Frequencies:",Object.keys(Freq).length);

    // Confine frequencies into [0..1]
    var max = -Number.MAX_SAFE_INTEGER;

    for (let K in Freq)
        max = Math.max(max,Freq[K]);

    for (let K in Freq)
        Freq[K] = Math.round(Freq[K]/max*10000)/10000;

    fs.writeFileSync("data-out/freqs.js",`export default ${JSON.stringify(Freq)};`);
}*/

// New method, use dictionary
function build_dictionary(){
    var Jsonl = (fs.readFileSync("data-in/hongoc-duc-dict.jsonl")).toString("utf8");
    var Lines = Jsonl.split("\n").map(X=>X.trim()).filter(X=>X.length>0);
    Words = [];
    
    for (let L of Lines)
        Words.push(JSON.parse(L).text);

    // Get unique words and simplify
    Words = [...new Set(Words)].sort()
        .map(X=>vitok.simplify(X));
    
    // Get unique words again coz simplification makes dups
    Words = [...new Set(Words)];

    // Get only mono/bi/tri-grams
    Words = Words.filter(X => vitok.str2arr(X).length<=3);

    fs.writeFileSync("data-out/words.js",`export default "${Words.join(",")}";`);
}

// Main ----------------------------------------
// NOTICE: FIRST RUN -> BUILD DATA, SECOND RUN -> RESULTS.
// Vi dict: https://huggingface.co/datasets/tsdocode/vietnamese-dictionary/raw/main/vi_dictionary.csv
// Json dict: https://github.com/undertheseanlp/dictionary
(async function main(){
    // Build files
    /*build_syllables(); 
    build_frequencies();*/

    // NEW: Use this dictionary instead of frequencies
    // build_dictionary();

    log("=".repeat(80));
    log("-".repeat(40));
    /* Test 1 */
    // var Str = 
    //     `hẳn là nhà sư không thích tên cướp bởi vì tên cướp là kẻ xấu, 
    //     xa xa tên cướp đã bỏ đi. foobar facebook là mạng xã hội.
    //     học sinh hay giậy sớm tập thể dục. công kiên chiến là cái gì?
    //     sinh viên được nghỉ tết nhiều vì phải về nhà ở tỉnh xa.`;

    /* Test 2 */
    // var Str = `Lúc 20h, đường hoa Nguyễn Huệ khai mạc sau nửa tháng thi công. Ở cổng chính trước UBND TP HCM rất đông người tham quan, chụp ảnh với linh vật ngựa cao khoảng 11 m tính cả bệ đỡ.

    // Đường hoa Tết Bính Ngọ mang chủ đề Xuân hội tụ - Vững bước vươn mình, thiết kế nhiều đại cảnh thể hiện những chặng đường lịch sử và tầm vóc mới của TP HCM sau sáp nhập Bình Dương và Bà Rịa - Vũng Tàu.

    // Đây là năm thứ 23 đường hoa được tổ chức dịp Tết ở khu trung tâm TP HCM, trở thành nét văn hóa đặc trưng ở thành phố.`;

    var Obj = await (await fetch(
        "https://vi.wikipedia.org/api/rest_v1/page/random/summary")).json();
    var Str = Obj.extract;

    log("Input:",Str);
    log("-".repeat(40));
    var Words = vitok.get_fts_words(Str);
    log("FTS:",Words); 

    // var Tokens = vitok.get_fts_tokens(Str);
    // log("FTS:",Tokens); 
    // var Tokens = vitok.get_grammar_tokens(Str);
    // log("Grammar:",Tokens);
    log("Done"); 
})();
  