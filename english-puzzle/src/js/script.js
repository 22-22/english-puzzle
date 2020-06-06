// choose group (0 - 5) === level (1 - 6)
// choose page (0 - 29) === round (1 - 60)
// round even (0) => 1st half of the server response
// round odd (1) => 2nd half

const baseUrl = 'https://afternoon-falls-25894.herokuapp.com';
const translationKey = 'trnsl.1.1.20200322T155651Z.de98a60e6a99185e.089aea4237b51c6db082c966f27a7895cd1e8b44';

const sentCurr = document.querySelector('.sentence-curr');
const checkBtn = document.querySelector('.check-btn');
const continueBtn = document.querySelector('.continue-btn');
const dontKnowBtn = document.querySelector('.dont-know-btn');
const formBtn = document.querySelector('.form__btn');
const wordAudioBtn = document.querySelector('.hints__word');
const sentenceAudioBtn = document.querySelector('.hints__sentence');
const translationBtn = document.querySelector('.hints__translation');
const startBtn = document.querySelector('.start__btn')
const results = document.querySelector('.results');
const form = document.querySelector('.inputs');

// a new game obj is create once a new game starts,
// sentIdx idx is updated every time a Continue btn is clicked
class Game {
  constructor(sentIdx) {
    this.sentIdx = sentIdx;
  }
  // methods if needed
}

const game = new Game(0);

const countPage = (round) => Math.ceil((round / 2) - 1);

const getData = async (page, group) => {
  const path = '/words';
  const url = `${baseUrl}${path}?page=${page}&group=${group}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const getTranslation = async () => {
  const text = game.dataForGame[game.sentIdx].textExample;
  const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${translationKey}&text=${text}&lang=en-ru`
  const response = await fetch(url);
  const data = await response.json();
  return data.text;
}

const splitData = (round, data) => {
  const dataForGame = data.filter((obj, idx, arr) => {
    if (round % 2 === 0) {
      return idx < arr.length / 2;
    }
    return idx >= arr.length / 2;
  });
  return dataForGame;
};

function createEmptyBlocks(num) {
  const sentResultNew = document.createElement('div');
  sentResultNew.classList.add('sentence-result');
  for (let i = 0; i < num; i += 1) {
    const wordBlock = document.createElement('span');
    wordBlock.className = 'word-block results__word-block';
    sentResultNew.append(wordBlock);
  }
  results.append(sentResultNew);
}

const displayData = () => {
  sentCurr.innerHTML = '';
  const sent = game.dataForGame[game.sentIdx].textExample;
  const sentArr = sent.split(' ');
  createEmptyBlocks(sentArr.length);
  const fragment = document.createDocumentFragment();
  sentArr.sort(() => Math.random() - 0.5);
  sentArr.forEach((word) => {
    const wordBlock = document.createElement('span');
    wordBlock.className = 'word-block guess__word-block';
    wordBlock.innerHTML = word;
    fragment.append(wordBlock);
  });
  sentCurr.append(fragment);
};

const startNewGame = async (round, group) => {
  const page = countPage(round);
  const data = await getData(page, group);
  const dataForGame = splitData(round, data);
  game.dataForGame = dataForGame;
  displayData();
};

const showTranslation = async () => {
  const data = await getTranslation();
  document.querySelector('.translation').innerHTML = data;
}

const sayWord = () => {
  const sentenceAudioPath = game.dataForGame[game.sentIdx].audioExample;
  const audio = new Audio(`https://raw.githubusercontent.com/22-22/rslang/rslang-data/data/${sentenceAudioPath}`);
  audio.play();
};

const saySentence = () => {
  const wordAudioBtnPath = game.dataForGame[game.sentIdx].audio;
  const audio = new Audio(`https://raw.githubusercontent.com/22-22/rslang/rslang-data/data/${wordAudioBtnPath}`);
  audio.play();
};

let wordIdx = 0;
function guessWordOrder(e) {
  const sentResultCurr = results.children[game.sentIdx];
  sentResultCurr.querySelectorAll('.results__word-block')[wordIdx].innerHTML = e.target.closest('.guess__word-block').innerHTML;
  e.target.closest('.guess__word-block').remove();
  wordIdx += 1;
  if (sentCurr.children.length === 0) {
    checkBtn.classList.remove('none');
    dontKnowBtn.classList.add('none');
  }
}

function checkSentence() {
  const sentArr = game.dataForGame[game.sentIdx].textExample.split(' ');
  const sentResultCurr = results.children[game.sentIdx];
  sentResultCurr.querySelectorAll('.results__word-block').forEach((word, idx) => {
    if (sentArr[idx] === word.innerHTML) {
      word.classList.add('correct');
      checkBtn.classList.add('none');
      continueBtn.classList.remove('none');
    } else {
      word.classList.add('incorrect');
      dontKnowBtn.classList.remove('none');
    }
  });
}

function showCorrectSentence() {
  const sentArr = game.dataForGame[game.sentIdx].textExample.split(' ');
  const sentResultCurr = results.children[game.sentIdx];
  sentResultCurr.querySelectorAll('.results__word-block').forEach((word, idx) => {
    word.innerHTML = sentArr[idx];
  });
  checkBtn.classList.add('none');
  dontKnowBtn.classList.add('none');
}

// continue
continueBtn.addEventListener('click', () => {
  game.sentIdx += 1;
  wordIdx = 0;
  displayData();
  // if (results.children.length === 10) ...

});

wordAudioBtn.addEventListener('click', sayWord);

sentenceAudioBtn.addEventListener('click', saySentence);

translationBtn.addEventListener('click', showTranslation);

sentCurr.addEventListener('click', guessWordOrder);

checkBtn.addEventListener('click', checkSentence);

dontKnowBtn.addEventListener('click', showCorrectSentence);

formBtn.addEventListener('click', (e) => {
  e.preventDefault();
  let round = document.querySelector('.form__round').value;
  let group = document.querySelector('.form__level').value;
  startNewGame(round, group);
})

startBtn.addEventListener('click', () => {
  document.querySelector('.start').classList.add('none');
})

window.addEventListener('DOMContentLoaded', startNewGame(1, 1));


// TO-DO


// как составить текцщей объект игры? какая инф там должна быть и как ее представить? ?????????7
// нужные данные из прилетевших (предложение с произношением слова) + номер предложения

// высчитать page, зафетчить данные
// отфильтровать (из 20 объектов оставить 10), забрать нужные поля
// (например, строку textExample + возможно засетить что-то в дата-атрибуты), разбить на массив
// создать элементы (span?), засетать слова в textContent
// и вывести разбитое по словам предложение в блок нижний блок sentence-curr
// создать новые элементы в блоке результатов по количеству слов отгадываемого предложения
// при клике на слово из нижнего блока оно последовательно перемещается наверх.

//  let sentencesForRound = dataForGame.map((obj) => obj.textExample);
