// choose group (0 - 5) === level (1 - 6)
// choose page (0 - 29) === round (1 - 60)
// round even (0) => 1st half of the server response
// round odd (1) => 2nd half

const baseUrl = 'https://afternoon-falls-25894.herokuapp.com';

const sentToGuess = document.querySelector('.sentence-to-guess');
const checkBtn = document.querySelector('.check-btn');
const continueBtn = document.querySelector('.continue-btn');
const dontKnowBtn = document.querySelector('.dont-know-btn');
const formBtn = document.querySelector('.form__btn');
const wordAudioBtn = document.querySelector('.hints__word');
const sentenceAudioBtn = document.querySelector('.hints__sentence');
const translationBtn = document.querySelector('.hints__translation');
const startBtn = document.querySelector('.start__btn')
const resultsBtn = document.querySelector('.results-btn')
const results = document.querySelector('.results-sentences');
const form = document.querySelector('.inputs');

let wordIdx;

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
  const url = `${baseUrl}${path}?page=${page}&group=${group}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

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
  sentToGuess.innerHTML = '';
  const sent = game.dataForGame[game.sentCurr].textExample;
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
  sentToGuess.append(fragment);
};

const startNewGame = async (round, group) => {
  results.innerHTML = '';

  // document.querySelector('.success-number').textContent = '';
  // document.querySelector('.errors-number').textContent = '';
  // document.querySelector('.success-items').innerHTML = '';
  // document.querySelector('.error-items').innerHTML = '';

  document.querySelector('.form__round').value = round;
  document.querySelector('.form__level').value = group;

  resultsBtn.classList.add('none');
  continueBtn.classList.add('none');
  dontKnowBtn.classList.remove('none');

  const page = countPage(round);
  const data = await getData(page, group);
  splitData(round, data);
  const dataForGame = splitData(round, data);
  game.dataForGame = dataForGame;
  displayData();
};

const showTranslation = () => {
  const translation = game.dataForGame[game.sentCurr].textExampleTranslate
  document.querySelector('.translation').innerHTML = translation;
}

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
  sentResultCurr.querySelectorAll('.results__word-block')[wordIdx].innerHTML = e.target.closest('.guess__word-block').innerHTML;
  e.target.closest('.guess__word-block').remove();
  wordIdx += 1;
  if (sentToGuess.children.length === 0) {
    checkBtn.classList.remove('none');
    dontKnowBtn.classList.add('none');
  }
}

function checkIfGuessedCorrectly(correctWords, sentArr) {
  if (correctWords === sentArr.length) {
    checkBtn.classList.add('none');
    continueBtn.classList.remove('none');
    game.correctGuess.push(game.dataForGame[game.sentCurr].textExample);
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

  sentResultCurr.querySelectorAll('.results__word-block').forEach((word) => {
 
   // word.style.backgroundImage = "url('../../dist/675d47af046d986aede8b97f7bfa87a8.jpg') ";
  })
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
    const sentBlock = createResultsBlock(sent)
    document.querySelector('.success-items').append(sentBlock);
  })
  let successNumber = game.correctGuess.length;
  document.querySelector('.success-number').textContent = successNumber;
  game.dontKnow.forEach((sent) => {
    const sentBlock = createResultsBlock(sent)
    document.querySelector('.error-items').append(sentBlock);
  })
  let errorsNumber = game.dontKnow.length;
  document.querySelector('.errors-number').textContent = errorsNumber;
}

// continue
continueBtn.addEventListener('click', () => {
  if (results.children.length !== 10) {
    continueBtn.classList.add('none');
    dontKnowBtn.classList.remove('none');
    game.sentCurr += 1;
    wordIdx = 0;
    displayData();
  } else if (resultsBtn.classList.contains('none')) {
    // show picture
    resultsBtn.classList.remove('none');
  } else {
    if (game.round < 60) {
      let round = parseInt(game.round, 10) + 1;
      let group = game.group;
      game = new Game(0, round, group);
      startNewGame(round, group);
    } else {
      console.log('change level')
    }
  }
});

wordAudioBtn.addEventListener('click', sayWord);

sentenceAudioBtn.addEventListener('click', saySentence);

translationBtn.addEventListener('click', showTranslation);

sentToGuess.addEventListener('click', guessWordOrder);

checkBtn.addEventListener('click', compareSentences);

dontKnowBtn.addEventListener('click', () => {
  showCorrectSentence();
  game.dontKnow.push(game.dataForGame[game.sentCurr].textExample);
});

formBtn.addEventListener('click', (e) => {
  e.preventDefault();
  let round = document.querySelector('.form__round').value;
  let group = document.querySelector('.form__level').value;
  game = new Game(0, round, group);
  startNewGame(round, group);
})

startBtn.addEventListener('click', () => {
  document.querySelector('.start').classList.add('none');
})

resultsBtn.addEventListener('click', () => {
  document.querySelector('.results').classList.remove('none');
  showResults();
  document.querySelectorAll('.item--icon').forEach((el) => {
    el.addEventListener('click', (e) => {
      game.dataForGame.forEach((el) => {
        if (el.textExample === e.target.nextSibling.innerHTML) {
          const audio = new Audio(`https://raw.githubusercontent.com/22-22/rslang/rslang-data/data/${el.audioExample}`);
          audio.play();
        }
      })
    });
  })
})

window.addEventListener('DOMContentLoaded', () => {
  wordIdx = 0;
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

//  let sentencesForRound = dataForGame.map((obj) => obj.textExample);
