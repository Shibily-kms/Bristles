// create_random_id(5)
function create_random_id(sting_length, aditionalWord, stringTipe) {
    let randomString = '';
    let wordString = '';
    if (stringTipe == 'num') {
        wordString = '123456789'
    } else if (stringTipe == 'letter') {
        wordString = 'abcdefghijklmnopqrstuvwxyz'
    } else if (stringTipe == 'numLetter') {
        wordString = 'abcdefghijklmnopqrstuvwxyz123456789'
    } else {
        wordString = '123456789'
    }
    for (var i, i = 0; i < sting_length; i++) {
        randomString += arryWord.charAt(Math.floor(Math.random() * arryWord.length))
    }

    return aditionalWord + randomString;
}

module.exports  = sto = {
   hi : create_random_id()
} 