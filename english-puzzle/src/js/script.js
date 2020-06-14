// choose group (0 - 5) === level (1 - 6)
// choose page (0 - 29) === round (1 - 60)
// round even (0) => 1st half of the server response
// round odd (1) => 2nd half

const baseUrl = 'https://afternoon-falls-25894.herokuapp.com';
const tokenValidHours = 4;

const checkBtn = document.querySelector('.check-btn');
const continueBtn = document.querySelector('.continue-btn');
const continueAfterResultsBtn = document.querySelector('#results-continue-btn');
const continueAfterStatsBtn = document.querySelector('#stats-continue-btn');
const dontKnowBtn = document.querySelector('.dont-know-btn');
const formBtn = document.querySelector('.form__btn');
const wordAudioBtn = document.querySelector('.hints__word');
const sentenceAudioBtn = document.querySelector('.hints__sentence');
const translationBtn = document.querySelector('.hints__translation');
const imageBtn = document.querySelector('.hints__image');
const autoSpeechBtn = document.querySelector('.auto-speech');
const startBtn = document.querySelector('.start__btn');
const resultsBtn = document.querySelector('.results-btn');
const statsBtn = document.querySelector('.stats-btn');
const loginBtn = document.querySelector('.login-btn');
const results = document.querySelector('.results-sentences');
const sentToGuess = document.querySelector('.sentence-to-guess');
const form = document.querySelector('.inputs');
class Game {
  constructor(round, level) {
    this.round = round;
    this.level = level;
    this.sentCurr = 0;
    this.correctGuess = [];
    this.dontKnow = [];
    this.autoSpeech = true;
  }
}

let game = new Game(0, 0);

const countPage = (round) => Math.ceil((round / 2));

const getWords = async (page, level) => {
  const path = '/words';
  const url = `${baseUrl}${path}?page=${page}&group=${level}&wordsPerExampleSentenceLTE=10&wordsPerPage=10`;
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

const startNewGame = async (round, level) => {
  document.querySelector('.success-items').innerHTML = '';
  document.querySelector('.error-items').innerHTML = '';
  results.innerHTML = '';

  document.querySelector('.form__round').value = round + 1;
  document.querySelector('.form__level').value = level + 1;

  resultsBtn.classList.add('none');
  continueBtn.classList.add('none');
  dontKnowBtn.classList.remove('none');
  results.classList.remove('final-image');

  const page = countPage(round);
  const dataForGame = await getWords(page, level);
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
    }
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
    word.style.background = "linear-gradient(rgba(255, 255, 255, 0.4) 100%, rgba(0, 0, 0, 0.3) 0%), url('./assets/picture.png'), no-repeat";
    word.style.backgroundPosition = `top -${topVal}px left -${leftVal}px`;
    leftVal += word.offsetWidth;
  });
};

function checkIfGuessedCorrectly(correctWords, sentArr) {
  if (correctWords === sentArr.length) {
    checkBtn.classList.add('none');
    continueBtn.classList.remove('none');
    game.correctGuess.push(game.dataForGame[game.sentCurr].textExample);
    if (game.autoSpeech) {
      saySentence();
    }
    showImages();
    showTranslation();
  } else {
    dontKnowBtn.classList.remove('none');
  }
}

function compareSentences() {
  let correctWords = 0;
  const sentArr = game.dataForGame[game.sentCurr].textExample.split(' ');
  const sentResultCurr = results.children[game.sentCurr];
  sentResultCurr.querySelectorAll('.results__word-block').forEach((word, idx) => {
    if (word.classList.contains('correct') || word.classList.contains('incorrect')) {
      word.classList.remove('correct');
      word.classList.remove('incorrect');
    }
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
  if (game.round < 50) {
    let { level } = game;
    let round = parseInt(game.round, 10) + 1;
    game = new Game(round, level);
    startNewGame(round, level);
  } else if (game.level < 5) {
    let level = parseInt(game.level, 10) + 1;
    let round = 0;
    game = new Game(round, level);
    startNewGame(round, level);
  } else {
    console.log('Please choose any level from 1 to 6 and any round from 1 to 50');
  }
};

const toggleAutoSpeech = () => {
  game.autoSpeech = !game.autoSpeech;
  autoSpeechBtn.classList.toggle('inactive');
}

const checkTokenTime = () => {
  let dateNow = new Date();
  let tokenValidTime = new Date(localStorage.getItem('tokenValidTime'));
  if (dateNow.getTime() > tokenValidTime.getTime()) {
    updateToken();
    updateTokenValidTime();
  }
}

sentToGuess.addEventListener('click', guessWordOrder);

continueBtn.addEventListener('click', () => {
  if (results.children.length > 0 && results.children.length !== 10) {
    continueBtn.classList.add('none');
    dontKnowBtn.classList.remove('none');
    game.sentCurr += 1;
    displayData();
  } else if (resultsBtn.classList.contains('none')) {
    resultsBtn.classList.remove('none');
    sentToGuess.innerHTML = 'Моне Клод Оскар – Красные лодки в Аржантее, 1875.';
    results.innerHTML = '';
    results.classList.add('final-image');
    document.querySelector('.translation').innerHTML = '';
   // checkTokenTime();
    let stats = {
      "optional": {}
    };
    stats.optional.date = new Date();
    stats.optional.iKnow = game.correctGuess.length;
    stats.optional.iDontKnow = game.dontKnow.length;
    stats.optional.level = game.level;
    stats.optional.round = game.round;

    sendStatistics(stats);
  } else {
    goToNextGame();
  }
});

const getStatistics = async () => {
  try {
    const userId = localStorage.getItem('id');
    const url = `${baseUrl}/users/${userId}/statistics`;
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    })
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err.message);
  }
}

const renderStatistics = (data) => {
  document.querySelector('.stats').classList.remove('none');
  let statsInfo = document.createElement('p');
  let humanDate = new Date(data.date).toLocaleString();
  statsInfo.textContent
    = `${humanDate}, level: ${data.level}, round: ${data.round} – I know: ${data.iKnow}, I don't know: ${data.iDontKnow}.`;
  document.querySelector('.stats-container').append(statsInfo);
}

const showStatistics = () => {
  //checkTokenTime();
  getStatistics()
    .then(result => renderStatistics(result.optional));
}

continueAfterResultsBtn.addEventListener('click', () => {
  document.querySelector('.results').classList.add('none');
  goToNextGame();
});

continueAfterStatsBtn.addEventListener('click', () => {
  document.querySelector('.results').classList.add('none');
  document.querySelector('.stats').classList.add('none');
  goToNextGame();
});

checkBtn.addEventListener('click', compareSentences);

statsBtn.addEventListener('click', showStatistics);

dontKnowBtn.addEventListener('click', () => {
  showCorrectSentence();
  showTranslation();
  showImages();
  if (game.autoSpeech) {
    saySentence();
  }
  game.dontKnow.push(game.dataForGame[game.sentCurr].textExample);
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

// hints
wordAudioBtn.addEventListener('click', sayWord);

sentenceAudioBtn.addEventListener('click', saySentence);

translationBtn.addEventListener('click', showTranslation);

imageBtn.addEventListener('click', showImages);

autoSpeechBtn.addEventListener('click', toggleAutoSpeech);

formBtn.addEventListener('click', (event) => {
  event.preventDefault();
  const round = document.querySelector('.form__round').value - 1;
  const level = document.querySelector('.form__level').value - 1;
  game = new Game(round, level);
  startNewGame(round, level);
});

// drag and drop
function allowDrop(e) {
  e.preventDefault();
}

function drag(e) {
  e.dataTransfer.setData('text/plain', e.target.innerHTML);
  e.target.innerHTML = '';
}

function drop(e) {
  e.preventDefault();
  const d = e.dataTransfer.getData('text/plain');
  e.target.innerHTML = d;
}

sentToGuess.addEventListener('drop', drop);
sentToGuess.addEventListener('dragover', allowDrop);
sentToGuess.addEventListener('dragstart', drag);

results.addEventListener('drop', (e) => {
  if (e.target.classList.contains('results__word-block')) {
    drop(e);
  }  
  if (sentToGuess.textContent === '') {
    checkBtn.classList.remove('none');
    dontKnowBtn.classList.add('none');
  }
});
results.addEventListener('dragover', allowDrop);
results.addEventListener('dragstart', drag);

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('id') && localStorage.getItem('token')) {
    startNewGame(0, 0);
  } else {
    document.querySelector('.login-window').classList.remove('none');
  }
});

const sendStatistics = async (stats) => {
  try {
    const userId = localStorage.getItem('id');
    const url = `${baseUrl}/users/${userId}/statistics`;
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stats)
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
  } catch (err) {
    console.log(err.message);
  }
}

const createUser = async (user) => {
  let url = `${baseUrl}/users`;
  try {
    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });

    if (!rawResponse.ok) {
      throw new Error(rawResponse.statusText)
    } else {
      const result = await rawResponse.json();
      return result;
    }
  } catch (err) {
    console.log(err.message);
  }
};

const loginUser = async (user) => {
  let url = `${baseUrl}/signin`;
  try {
    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    });
    if (!rawResponse.ok) {
      throw new Error(rawResponse.statusText)
    } else {
      const result = await rawResponse.json();
      return result;
    }
  } catch (err) {
    console.log(err.message);
  }
};

const updateToken = async () => {
  try {
    let email = localStorage.getItem(email);
    let password = localStorage.getItem(password);
    const { token } = await loginUser({ email, password })
    localStorage.setItem('token', token);
  } catch (err) {
    console.log(err.message);
  }
}

const updateTokenValidTime = () => {
  let tokenValidTime = new Date();
  tokenValidTime.setHours(tokenValidTime.getHours() + tokenValidHours);
  localStorage.setItem('tokenValidTime', tokenValidTime);
}

loginBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  user.email = document.querySelector('#input-email').value;
  user.password = document.querySelector('#input-password').value;
  // (?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[+\-_@$!%*?&#.,;:[\]{}]).{8,}
  const { id } = await createUser(user);
  const { token } = await loginUser(user);
  updateTokenValidTime();
  localStorage.setItem('id', id);
  localStorage.setItem('token', token);
  localStorage.setItem('email', user.email);
  localStorage.setItem('password', user.password);
  document.querySelector('.login-window').classList.add('none');
  startNewGame(0, 0);
})

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

