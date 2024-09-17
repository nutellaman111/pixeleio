
function GetDictionary(language)
{
    let allowedSymbols;
    let languageDirection = "ltr";
    if(language == "english")
    {
        allowedSymbols = "abcdefghijklmnopqrstuvwxyz"
    } else if(language == "hebrew")
    {
        allowedSymbols = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ";
        languageDirection = "rtl";
    }
    return new dictionary(`./data/words/${language}.json`, 1000, allowedSymbols, languageDirection);
}

class dictionary
{
    constructor(wordsJsonPath, numberOfWords, allowedSymbols, languageDirection)
    {
        // Load the words from the JSON file
        this.words = require(wordsJsonPath).slice(0, numberOfWords);;
        this.removedWords = [];

        // Store the allowed symbols
        this.allowedSymbols = allowedSymbols;

        //right to left language
        this.languageDirection = languageDirection;

    }

    PopRandomWord()
    {
        if (this.words.length === 0) {
            // If no words are left, refill the words array with removed words
            this.words = this.removedWords.slice();
            this.removedWords = [];  // Clear the removedWords array
        }
    
        // Get a random index
        const randomIndex = Math.floor(Math.random() * this.words.length);
    
        // Remove the word at the random index and store it in removedWords
        const word = this.words.splice(randomIndex, 1)[0];
        this.removedWords.push(word);
    
        return word;
    }

    CensorWord(word)
    {
        return word
        .replace('-',' ')
        .split('')
        .map(char => (this.allowedSymbols).includes(char) ? '_ ' : '')
        .join('');
    }

    AreWordsEquivelent(originalWord1, originalWord2) {
        const word1 = this.StandardiseWord(originalWord1)
        const word2 = this.StandardiseWord(originalWord2)
        return word1 == word2;
    }

    AreWordsClose(originalWord1, originalWord2) {

        const word1 = this.StandardiseWord(originalWord1)
        const word2 = this.StandardiseWord(originalWord2)

        const len1 = word1.length;
        const len2 = word2.length;

        if (Math.abs(len1 - len2) > 1) {
            return false; // More than one letter difference in length means more than one change
        }

        let i = 0, j = 0;
        let foundDifference = false;

        while (i < len1 && j < len2) {
            if (word1[i] !== word2[j]) {
                if (foundDifference) return false;
                foundDifference = true;

                // Check for replacement or insertion/removal
                if (len1 > len2) {
                    i++; // Removal case
                } else if (len2 > len1) {
                    j++; // Insertion case
                } else {
                    i++;
                    j++; // Replacement case
                }
            } else {
                i++;
                j++;
            }
        }

        // Handle the case where the end of one string is reached
        if (i < len1 || j < len2) {
            if (foundDifference) return false;
            foundDifference = true;
        }

        return true;
    }

    StandardiseWord(str) {
        if (!str) return '';

        // Convert to lowercase
        return str
            .trim()
            .toLowerCase()
            .split('')
            .filter(char => this.allowedSymbols.includes(char))
            .join('')
    }

}

module.exports = { GetDictionary };
