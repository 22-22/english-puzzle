// choose group (0 - 5) === level (1 - 6)
// choose page (0 - 29) === round (1 - 60)
// round even (0) => 1st half of the server response
// round odd (1) => 2nd half

const baseUrl = 'https://afternoon-falls-25894.herokuapp.com';

const sentToGuess = document.querySelector('.sentence-to-guess');
const checkBtn = document.querySelector('.check-btn');
const continueBtn = document.querySelector('.continue-btn');
const continueAfterResults = document.querySelector('.results-continue-btn');
const dontKnowBtn = document.querySelector('.dont-know-btn');
const formBtn = document.querySelector('.form__btn');
const wordAudioBtn = document.querySelector('.hints__word');
const sentenceAudioBtn = document.querySelector('.hints__sentence');
const translationBtn = document.querySelector('.hints__translation');
const imageBtn = document.querySelector('.hints__image');
const startBtn = document.querySelector('.start__btn');
const resultsBtn = document.querySelector('.results-btn');
const results = document.querySelector('.results-sentences');
const form = document.querySelector('.inputs');

// a new game obj is create once a new game starts,
// sentCurr idx is updated every time a Continue btn is clicked
class Game {
  constructor(sentCurr, round, group) {
    this.sentCurr = sentCurr;
    this.round = round;
    this.group = group;
    this.correctGuess = [];
    this.dontKnow = [];
  }
  // methods if needed
}

let game = new Game(0, 1, 1);

const countPage = (round) => Math.ceil((round / 2) - 1);

const getData = async (page, group) => {
  const path = '/words';
  const url = `${baseUrl}${path}?page=${page}&group=${group}&wordsPerExampleSentenceLTE=10&wordsPerPage=10`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

function createEmptyBlocks(num) {
  const sentResultNew = document.createElement('div');
  sentResultNew.classList.add('result-sentence');
  for (let i = 0; i < num; i += 1) {
    const wordBlock = document.createElement('span');
    wordBlock.className = 'word-block results__word-block';
    wordBlock.setAttribute('draggable', 'true');
    sentResultNew.append(wordBlock);
  }
  results.append(sentResultNew);
}

const displayData = () => {
  sentToGuess.innerHTML = '';
  document.querySelector('.translation').innerHTML = '';

  const sent = game.dataForGame[game.sentCurr].textExample;
  const sentArr = sent.split(' ');
  createEmptyBlocks(sentArr.length);
  const fragment = document.createDocumentFragment();
  sentArr.sort(() => Math.random() - 0.5);
  sentArr.forEach((word) => {
    const wordBlock = document.createElement('span');
    wordBlock.className = 'word-block guess__word-block';
    wordBlock.setAttribute('draggable', 'true');
    wordBlock.innerHTML = word;
    fragment.append(wordBlock);
  });
  sentToGuess.append(fragment);
};

const startNewGame = async (round, group) => {
  document.querySelector('.success-items').innerHTML = '';
  document.querySelector('.error-items').innerHTML = '';

  document.querySelector('.form__round').value = round;
  document.querySelector('.form__level').value = group;

  resultsBtn.classList.add('none');
  continueBtn.classList.add('none');
  dontKnowBtn.classList.remove('none');
  results.classList.remove('final-image');

  const page = countPage(round);
  const dataForGame = await getData(page, group);
  game.dataForGame = dataForGame;
  displayData();
};

const showTranslation = () => {
  const translation = game.dataForGame[game.sentCurr].textExampleTranslate;
  document.querySelector('.translation').innerHTML = translation;
};

const sayWord = () => {
  const sentenceAudioPath = game.dataForGame[game.sentCurr].audio;
  const audio = new Audio(`https://raw.githubusercontent.com/22-22/rslang/rslang-data/data/${sentenceAudioPath}`);
  audio.play();
};

const saySentence = () => {
  const wordAudioBtnPath = game.dataForGame[game.sentCurr].audioExample;
  const audio = new Audio(`https://raw.githubusercontent.com/22-22/rslang/rslang-data/data/${wordAudioBtnPath}`);
  audio.play();
};

function guessWordOrder(e) {
  const sentResultCurr = results.children[game.sentCurr];
  for (let i = 0; i < sentResultCurr.children.length; i += 1) {
    if (!sentResultCurr.children[i].innerHTML) {
      sentResultCurr.children[i].innerHTML = e.target.closest('.guess__word-block').innerHTML;
      break;
    };
  }
  e.target.closest('.guess__word-block').innerHTML = '';
  if (sentToGuess.textContent === '') {
    checkBtn.classList.remove('none');
    dontKnowBtn.classList.add('none');
  }
}

const showImages = () => {
  const sentResultCurr = results.children[game.sentCurr];
  // const blockHeight = 50;
  const blockHeight = 88;
  const topVal = 0 + blockHeight * game.sentCurr;
  let leftVal = 0;
  sentResultCurr.querySelectorAll('.results__word-block').forEach((word) => {
    word.style.background = "linear-gradient(rgba(255, 255, 255, 0.4) 100%, rgba(0, 0, 0, 0.3) 0%), url('../../dist/e3ff896d961f297da83349fcdd0ad8d3.png'), no-repeat";
    word.style.backgroundPosition = `top -${topVal}px left -${leftVal}px`;
    leftVal += word.offsetWidth;
  });
};

function checkIfGuessedCorrectly(correctWords, sentArr) {
  if (correctWords === sentArr.length) {
    checkBtn.classList.add('none');
    continueBtn.classList.remove('none');
    game.correctGuess.push(game.dataForGame[game.sentCurr].textExample);
    showImages();
    showTranslation();
    saySentence();
  } else {
    dontKnowBtn.classList.remove('none');
  }
}

function compareSentences() {
  let correctWords = 0;
  const sentArr = game.dataForGame[game.sentCurr].textExample.split(' ');
  const sentResultCurr = results.children[game.sentCurr];
  sentResultCurr.querySelectorAll('.results__word-block').forEach((word, idx) => {
    if (sentArr[idx] === word.innerHTML) {
      word.classList.add('correct');
      correctWords += 1;
    } else {
      word.classList.add('incorrect');
    }
  });
  checkIfGuessedCorrectly(correctWords, sentArr);
}

function showCorrectSentence() {
  const sentArr = game.dataForGame[game.sentCurr].textExample.split(' ');
  const sentResultCurr = results.children[game.sentCurr];
  sentResultCurr.querySelectorAll('.results__word-block').forEach((word, idx) => {
    word.innerHTML = sentArr[idx];
  });
  checkBtn.classList.add('none');
  dontKnowBtn.classList.add('none');
  continueBtn.classList.remove('none');
}

function createResultsBlock(sent) {
  const sentBlock = document.createElement('div');
  sentBlock.classList.add('item');
  sentBlock.insertAdjacentHTML('beforeend', '<div class="item--icon"></div>');
  const sentEl = document.createElement('div');
  sentEl.classList.add('item--sent');
  sentEl.innerHTML = sent;
  sentBlock.append(sentEl);
  return sentBlock;
}

const showResults = () => {
  game.correctGuess.forEach((sent) => {
    const sentBlock = createResultsBlock(sent);
    document.querySelector('.success-items').append(sentBlock);
  });
  const successNumber = game.correctGuess.length;
  document.querySelector('.success-number').textContent = successNumber;
  game.dontKnow.forEach((sent) => {
    const sentBlock = createResultsBlock(sent);
    document.querySelector('.error-items').append(sentBlock);
  });
  const errorsNumber = game.dontKnow.length;
  document.querySelector('.errors-number').textContent = errorsNumber;
};

const goToNextGame = () => {
  if (game.round < 60) {
    const round = parseInt(game.round, 10) + 1;
    const { group } = game;
    game = new Game(0, round, group);
    startNewGame(round, group);
  } else {
    console.log('change level');
  }
};
// continue
continueBtn.addEventListener('click', () => {
  if (results.children.length > 0 && results.children.length !== 10) {
    continueBtn.classList.add('none');
    dontKnowBtn.classList.remove('none');
    game.sentCurr += 1;
    displayData();
  } else {
    if (resultsBtn.classList.contains('none')) {
      resultsBtn.classList.remove('none');
      sentToGuess.innerHTML = 'Моне Клод Оскар – Красные лодки в Аржантее, 1875.';
      results.innerHTML = '';
      results.classList.add('final-image');
      document.querySelector('.translation').innerHTML = '';
    } else {
      goToNextGame();
    }
  }
});

continueAfterResults.addEventListener('click', () => {
  document.querySelector('.translation').innerHTML = '';
  document.querySelector('.results').classList.add('none');
  goToNextGame();
});

wordAudioBtn.addEventListener('click', sayWord);

sentenceAudioBtn.addEventListener('click', saySentence);

translationBtn.addEventListener('click', showTranslation);

sentToGuess.addEventListener('click', guessWordOrder);

imageBtn.addEventListener('click', showImages);

checkBtn.addEventListener('click', compareSentences);

dontKnowBtn.addEventListener('click', () => {
  showCorrectSentence();
  showTranslation();
  showImages();
  game.dontKnow.push(game.dataForGame[game.sentCurr].textExample);
});

formBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const round = document.querySelector('.form__round').value;
  const group = document.querySelector('.form__level').value;
  game = new Game(0, round, group);
  startNewGame(round, group);
});

startBtn.addEventListener('click', () => {
  document.querySelector('.start').classList.add('none');
});

resultsBtn.addEventListener('click', () => {
  document.querySelector('.results').classList.remove('none');
  showResults();
  document.querySelectorAll('.item--icon').forEach((el) => {
    el.addEventListener('click', (e) => {
      game.dataForGame.forEach((item) => {
        if (item.textExample === e.target.nextSibling.innerHTML) {
          const audio = new Audio(`https://raw.githubusercontent.com/22-22/rslang/rslang-data/data/${item.audioExample}`);
          audio.play();
        }
      });
    });
  });
});

// drag and drop
function allowDrop(e) {
  e.preventDefault();
}

function drag(e) {
  e.dataTransfer.setData("text/plain", e.target.innerHTML);
  e.target.innerHTML = '';
}

function drop(e) {
  e.preventDefault();
  let d = e.dataTransfer.getData("text/plain");
  e.target.innerHTML = d;
}

sentToGuess.addEventListener('drop', drop);
sentToGuess.addEventListener('dragover', allowDrop)
sentToGuess.addEventListener('dragstart', drag);

results.addEventListener('drop', (e) => {
  drop(e);
  if (sentToGuess.textContent === '') {
    checkBtn.classList.remove('none');
    dontKnowBtn.classList.add('none');
  }
});
results.addEventListener('dragover', allowDrop)
results.addEventListener('dragstart', drag);


window.addEventListener('DOMContentLoaded', () => {
  startNewGame(1, 1);
});


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

// Винсент Ван Гог – Красные виноградники в Арле, 1888.
