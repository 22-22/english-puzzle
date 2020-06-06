// choose group (0 - 5) === level (1 - 6)
// choose page (0 - 29) === round (1 - 60)
// round even (0) => 1st half of the server response
// round odd (1) => 2nd half

const baseUrl = 'https://afternoon-falls-25894.herokuapp.com';

let sentCurr = document.querySelector('.sentence-curr');
const checkBtn = document.querySelector('.check-btn');
const continueBtn = document.querySelector('.continue-btn');
const dontKnowBtn = document.querySelector('.dont-know-btn');
const results = document.querySelector('.results');

// a new game obj is create once a new game starts,
// sentIdx idx is updated every time a Continue btn is clicked
class Game {
    constructor(sentIdx) {
        this.sentIdx = sentIdx;
    }
    // methods if needed
}

let game = new Game(0);

const countPage = (round) => {
    return Math.ceil((round / 2) - 1);
}

const getData = async (page, group) => {
    const path = '/words'
    const url = `${baseUrl}${path}?page=${page}&group=${group}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

const splitData = (round, data) => {
    const dataForGame = data.filter((obj, idx, arr) => {
        if (round % 2 === 0) {
            return idx < arr.length / 2;
        } else {
            return idx >= arr.length / 2
        }
    })
    return dataForGame;
}

const displayData = () => {
    sentCurr.innerHTML = '';
    let sent = game.dataForGame[game.sentIdx].textExample;
    let sentArr = sent.split(' ');
    createEmptyBlocks(sentArr.length);
    let fragment = document.createDocumentFragment();
    sentArr.sort(() => Math.random() - 0.5);
    sentArr.forEach((word) => {
        let wordBlock = document.createElement('span');
        wordBlock.className = 'word-block guess__word-block';
        wordBlock.innerHTML = word;
        fragment.append(wordBlock);
    })
    sentCurr.append(fragment);
}

const startNewGame = async (round, group) => {
    let page = countPage(round);
    let data = await getData(page, group);
    let dataForGame = splitData(round, data);
    game.dataForGame = dataForGame;
    displayData();
}

// on window load
// let round = document.querySelector('.input__round').value;
// let group = document.querySelector('.input__group').value;
// startNewGame(round, group)
startNewGame(5, 0);


const playSound = () => {
    let audioPath = game.dataForGame[game.sentIdx].audioExample;
    let audio = new Audio(`https://raw.githubusercontent.com/22-22/rslang/rslang-data/data/${audioPath}`)
    audio.play();
}

function createEmptyBlocks(num) {
    let sentResultNew = document.createElement('div');
    sentResultNew.classList.add('sentence-result')
    for (let i = 0; i < num; i += 1) {
        let wordBlock = document.createElement('span');
        wordBlock.className = 'word-block results__word-block';
        sentResultNew.append(wordBlock);
    }
    results.append(sentResultNew);
}

let wordIdx = 0;
function guessWordOrder(e) {
    let sentResultCurr = results.children[game.sentIdx];
    sentResultCurr.querySelectorAll('.results__word-block')[wordIdx].innerHTML = e.target.closest('.guess__word-block').innerHTML;
    e.target.closest('.guess__word-block').remove();
    wordIdx += 1;
    if (sentCurr.children.length === 0) {
        checkBtn.classList.remove('none');
        dontKnowBtn.classList.add('none');
    }
}

function checkSentence() {
    let sentArr = game.dataForGame[game.sentIdx].textExample.split(' ');
    let sentResultCurr = results.children[game.sentIdx];
    sentResultCurr.querySelectorAll('.results__word-block').forEach((word, idx) => {
        if (sentArr[idx] === word.innerHTML) {
            word.classList.add('correct');
            checkBtn.classList.add('none');
            continueBtn.classList.remove('none');
        } else {
            word.classList.add('incorrect');
            dontKnowBtn.classList.remove('none');
        }
    })
}

function showCorrectSentence() {
    let sentArr = game.dataForGame[game.sentIdx].textExample.split(' ');
    let sentResultCurr = results.children[game.sentIdx];
    sentResultCurr.querySelectorAll('.results__word-block').forEach((word, idx) => {
        word.innerHTML = sentArr[idx];
    })
    checkBtn.classList.add('none');
    dontKnowBtn.classList.add('none');
}

// continue
continueBtn.addEventListener('click', () => {
    game.sentIdx += 1;
    wordIdx = 0;
    displayData();
    // if (results.children.length === 10) ...
})

document.querySelector('.sound-btn').addEventListener('click', playSound)

sentCurr.addEventListener('click', guessWordOrder);

checkBtn.addEventListener('click', checkSentence)

dontKnowBtn.addEventListener('click', showCorrectSentence)

// TO-DO


// как составить текцщей объект игры? какая инф там должна быть и как ее представить? ?????????7
// нужные данные из прилетевших (предложение с произношением слова) + номер предложения

// высчитать page, зафетчить данные
// отфильтровать (из 20 объектов оставить 10), забрать нужные поля (например, строку textExample + возможно засетить что-то в дата-атрибуты), разбить на массив
// создать элементы (span?), засетать слова в textContent и вывести разбитое по словам предложение в блок нижний блок sentence-curr
// создать новые элементы в блоке результатов по количеству слов отгадываемого предложения
// при клике на слово из нижнего блока оно последовательно перемещается наверх.

//  let sentencesForRound = dataForGame.map((obj) => obj.textExample);
