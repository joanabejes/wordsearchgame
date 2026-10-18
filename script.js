// grid in the memory
// letters to fill the board
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// board size: 10x10
let SIZE = 10;
// words
const WORD_POOLS = {
    en: [
        "WATER", "RAIN", "RIVER", "CLOUD", "LAKE", "SEA", "ECOSYSTEM", 
        "ENERGY", "ECOLOGY", "CLIMATE", "WEATHER", "RECYCLE", "OCEAN", 
        "POLLUTION", "SOLAR", "NATURE", "EARTH", "GREEN", "FOREST",
        "ANIMAL", "PLANT", "BIOME", "PLANET"
    ],
    es: [
        "AGUA", "LLUVIA", "RIO", "NUBE", "LAGO", "MAR", "ECOSISTEMA",
        "ENERGIA", "ECOLOGIA", "CLIMA", "TIEMPO", "RECICLAR", "OCEANO",
        "ARBOL", "SOLAR", "NATURALEZA", "TIERRA", "VERDE",
        "BOSQUE", "ANIMAL", "PLANTA", "BIOMA", "PLANETA"
    ],
    de: [
        "WASSER", "REGEN", "FLUSS", "WOLKE", "SEE", "MEER", "OKOSYSTEM",
        "ENERGIE", "OKOLOGIE", "KLIMA", "WETTER", "RECYCLING", "OZEAN",
        "SOLAR", "NATUR", "ERDE", "GRUN", "WALD","TIER", "PFLANZE", 
        "BIOM", "PLANET", "ABFALL"
    ]
};
// pool of the current language
let WORDS_POOL = WORD_POOLS.en;

// settings
let savedSize = null;
let savedLanguage = null;
try {
    savedSize = localStorage.getItem("aquasearch-size");
    savedLanguage = localStorage.getItem("aquasearch-language");
} catch (error) {
}
if (savedSize !== null) {
    SIZE = parseInt(savedSize);
}
if (savedLanguage !== null && WORD_POOLS[savedLanguage] !== undefined) {
    WORDS_POOL = WORD_POOLS[savedLanguage];
}


// words per game
const WORDS_PER_GAME = 10;

// the words of the curret game
let WORDS = [];

// the grid starts as an empty list
const grid = [];

// references
const gridDiv = document.getElementById("grid");
const wordListUl = document.getElementById("word-list");

// random selection of words
function chooseRandomWords() {
    // copying
    const pool = [...WORDS_POOL].filter(word => word.length <= SIZE); 
    const selection = [];

    while (selection.length < WORDS_PER_GAME && pool.length > 0) {
        // random index
        const index = Math.floor(Math.random() * pool.length);
        // taking the word
        selection.push(pool[index]); 
        // removing it from the copy
        pool.splice(index, 1);
    }
    return selection;
}

// hiding the words
function placeWord(word){
   // try up to 100 random positions until one fits
   for (let attempt = 0; attempt < 100; attempt++){
       // random direction, if its true -> horizontal, if its false -> vertical
       const horizontal = Math.random()<0.5;

       // random start position
       const startRow = Math.floor(Math.random() * (horizontal ? SIZE : SIZE - word.length +1));
       const startCol = Math.floor(Math.random() * (horizontal ? SIZE - word.length +1 : SIZE));
      
       // checking the path
       let pathIsFree = true;
       for (let i =0; i < word.length; i++){
           // calculating which cell this letter occupies
           const row = horizontal ? startRow : startRow + i;
           const col = horizontal ? startCol + i : startCol;
           // if the cell has a different letter, the path is blocked
           if (grid[row][col] !== "" && grid[row][col] !== word[i]){
               pathIsFree = false;
               break
           }
       }

       if (pathIsFree){
               for (let i = 0; i < word.length; i++){
                   const row = horizontal ? startRow : startRow + i;
                   const col = horizontal ? startCol + i : startCol;
                   grid[row][col] = word[i];
               }
               return true;
       }
   }  
   return false;
}

// drawing the grid on the screen
function drawGrid(){
   for (let row = 0; row < SIZE; row++){
       for (let col = 0; col < SIZE; col++){
           const cell = document.createElement("div");
           cell.textContent = grid[row][col];
           cell.classList.add("cell");

           //calling handleCellClick
           cell.addEventListener("click", function() {
               handleCellClick(row,col,cell);
           });
           gridDiv.appendChild(cell);
       }
   } 
}

// game state, remembering the first clicked cell AND its position
let firstCell = null;
let firstRow = 0;
let firstCol = 0;
let foundCount = 0;

// runs everytime a cell is clicked
function handleCellClick (row, col, cellElement){
   if (firstCell === null){ // selects this cell
       firstCell = cellElement;
       firstRow = row;
       firstCol = col;
       cellElement.classList.add("selected");
   }else{ // unselect
       firstCell.classList.remove("selected");
       firstCell = null;
       checkWord (firstRow, firstCol, row, col);
   }
}

// checking if the path between two cells form a word
function checkWord (r1, c1, r2, c2){
   let text = "";
   let cells = [];

   // same row means horizontal
   // step is +1 if second click is to the right
   // step is -1 if second click is to the left
   if (r1 === r2){
       const step = c1 < c2 ? 1 : -1;
       for (let c = c1; c !== c2 + step; c += step){
           text+= grid[r1][c];
       // the cell at (row, col) lives at index row * size + col
       cells.push(gridDiv.children[r1 * SIZE + c]);
       }
   }
   // same column means vertical
   else if (c1 === c2){
       const step = r1 < r2 ? 1 : -1;
       for (let r = r1; r !== r2 + step; r += step){
           text += grid[r][c1];
           cells.push(gridDiv.children[r * SIZE + c1]);
       }
   } else {
       return;
   }

   // clicking backwards, both directions
   const reversed = text.split("").reverse().join("");

   for (const word of WORDS){
       if (text === word || reversed === word){
        // asking the list if the word was already found
        const listItem = document.getElementById("word-" + word);
        if (listItem.classList.contains("found")){
            return;
        }
        // if it matches, it turns green
        for (const cell of cells){
            cell.classList.add("found");
        }
        // cross the word of the list
        document.getElementById("word-" + word).classList.add("found");
        // count it and update
        foundCount++;
        document.getElementById("message").textContent = "You found: " + word;

        if (foundCount === WORDS.length){
            document.getElementById("victory").classList.remove("hidden");
            }
        }
    }
}

// starting a new game
function startGame(){
   // fresh words
   WORDS = chooseRandomWords();
    // reseting the grid
   grid.length = 0;

   //creating the empty grid
   // loop that iterates through the rows
    for (let row = 0; row < SIZE; row++){
    // for each line a new list of letters
        const newRow = [];
        // loop that iterates through the columns
        for (let col = 0; col < SIZE; col++){
               newRow.push("");
        }
          // store the ready-line into the grid
        grid.push(newRow);
    }

   // hiding every word
    const requestedWords = [...WORDS];
    WORDS = [];
    for (const word of requestedWords){
        let placed = false;
        let totalAttempts = 0;
        while (!placed && totalAttempts < 100){
            placed = placeWord(word);
            totalAttempts++;
        }
        if (placed){
            WORDS.push(word);
        }
    }

    // filling the empty cells with random letters
    for (let row = 0; row < SIZE; row++){
        for (let col = 0; col < SIZE; col++){
            if (grid[row][col] === ""){
                const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
                grid[row][col] = letter;
            }
        }
    }

    // reseting the game state
    foundCount = 0;
    firstCell = null;
    document.getElementById("message").textContent = "";

    // resizing the grid for current level
    gridDiv.style.gridTemplateColumns = "repeat("+ SIZE + ", 40px)";

    // cleaning the screen before drawing
    gridDiv.innerHTML = "";
    drawGrid();

    // rebuilding the word list
    wordListUl.innerHTML = "";
    for (const word of WORDS){
        const item = document.createElement("li");
        item.textContent = word;
        item.id = "word-" + word;
        wordListUl.appendChild(item);
    }
}

// finding words or checking
function findWord(word) {
 // searching along each row
 for (let row = 0; row < SIZE; row++) {
   const line = grid[row].join("");
   if (line.includes(word)) return "found in row " + row;
 }
 // searching each column
 for (let col = 0; col < SIZE; col++) {
   let line = "";
   for (let row = 0; row < SIZE; row++) {
     line += grid[row][col];
   }
   if (line.includes(word)) return "found in column " + col;
 }
 return "NOT found";
}

// staring the first game when page loads
startGame();

// game limit
const MAX_NEW_GAMES = 3;
let newGamesLeft = MAX_NEW_GAMES;
document.getElementById("games-left").textContent = newGamesLeft;

document.getElementById("new-game").addEventListener("click", function() {
    if (newGamesLeft<=0){
        return;
    }
    newGamesLeft--;
    document.getElementById("games-left").textContent = newGamesLeft;
    startGame();
    if (newGamesLeft ===0){
        document.getElementById("new-game").disabled = true;
    }
});

// victory
document.getElementById("victory-button").addEventListener("click", function() {
    document.getElementById("victory").classList.add("hidden");
    startGame();
});

// level
const levelButtons = document.querySelectorAll("#level-group .option-btn");
for (const btn of levelButtons){
   btn.addEventListener("click", function() {
       //removing highlight
        for (const b of levelButtons){
            b.classList.remove("active");
        }
        //highlighting the clicked button
        btn.classList.add("active");
        //applying the new level
        SIZE = parseInt(btn.dataset.size);
        // saving choice for the next time
       try {
        localStorage.setItem("aquasearch-size", SIZE);
       } catch (error){}
        startGame();
   });
}

// language
const languageButtons = document.querySelectorAll("#language-group .option-btn");
for (const btn of languageButtons){
   btn.addEventListener("click", function() {
       //removing highlight
        for (const b of languageButtons){
            b.classList.remove("active");
        }
        //highlighting the clicked button
        btn.classList.add("active");
        //applying the new language
        WORDS_POOL = WORD_POOLS[btn.dataset.language];
        try {
            localStorage.setItem("aquasearch-language", btn.dataset.language);
        } catch (error) {}
        startGame();
   });
}   

// making the buttons match the loaded settings
for (const btn of levelButtons){
    if (parseInt(btn.dataset.size) === SIZE){
        btn.classList.add("active");
    }else{
        btn.classList.remove("active");
    }
}

if (savedLanguage !== null && WORD_POOLS[savedLanguage] !== undefined){
    for (const btn of languageButtons){
        if (btn.dataset.language === savedLanguage){
            btn.classList.add("active");
        }else{
            btn.classList.remove("active");
        }
    }
}   