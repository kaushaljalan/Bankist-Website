'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-12-20T23:36:17.929Z',
    '2020-12-25T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    //currency is independent of the locale itself
    //in this case we can have a european country with a US currency
  }).format(value);
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  console.log(acc.movements);
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedMov = formatCur(acc.balance, acc.locale, acc.currency);

  labelBalance.textContent = formattedMov;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //In each cell, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 seconds, stop timer and log out user
    if (time == 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    //Decrease 1 sec
    time--;
  };
  //Set time to 5 minutes
  let time = 120;
  //Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;
//FAKE always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Experimenting API

//const now = new Date();
// labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

//   const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric', //alternative:2-digir
//   month: 'long', //alternative:2-digit
//   year: 'numeric', //alternative:2-digit
//   weekday: 'long',
// };
// const locale = navigator.language;
// console.log(locale);

/*
const now = new Date();
const day = `${now.getDate()}`.padStart(2, 0);
const month = `${now.getMonth() + 1}`.padStart(2, 0);
const year = now.getFullYear();
const hour = `${now.getHours()}`.padStart(2, 0);
const min = `${now.getMinutes()}`.padStart(2, 0);
labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;*/
//day/month/year

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric', //alternative:2-digir
      month: 'numeric', //alternative:2-digit,long
      year: 'numeric', //alternative:2-digit
      // weekday: 'long',
    };
    const locale = navigator.language;
    console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);

    //Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add loan Date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      //Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

console.log(23 === 23.0);
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3); //Error in JS which we have to accept

//Conversion of String to Integer
console.log(Number('23'));
console.log(+'23');

//Parsing
//To read a number out of a string ,parsing should be done
//It is like type coercion and it tries to get rid of unnecessary symbols that are not numbers
console.log(Number.parseInt('34px', 10)); //second argument is decimal
console.log(Number.parseInt('12fs', 2)); //second argement is binary
console.log(Number.parseInt('ws15', 10));
console.log(Number.parseInt('3.2fg'));

console.log(Number.parseFloat('3.2ds'));

//console.log(parseFloat('  3.2ds   '));

//Check if value is Not a Number(NaN)
console.log(Number.isNaN(23)); //false
console.log(Number.isNaN('24')); //false
console.log(Number.isNaN('24c')); //false
console.log(Number.isNaN(+'24d')); //true
console.log(Number.isNaN(24 / 0)); //false

//isFinite() is the best way to check if the value is a number
//Check if value is a number
console.log(Number.isFinite(20)); //t
console.log(Number.isFinite('24')); //f
console.log(Number.isFinite('24x')); //f
console.log(Number.isFinite(+'24x')); //f
console.log(Number.isFinite(+'24')); //t
console.log(Number.isFinite(24 / 0)); //f
console.log(Number.isFinite(24 / -2)); //t

console.log(Number.isInteger(24)); //t
console.log(Number.isInteger('24')); //f
console.log(Number.isInteger(23.6)); //f
console.log(Number.isInteger(24.0)); //t
console.log(Number.isInteger(24 / 0)); //f

//Math and Round operations
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));
console.log(Math.max(13, 42, 135, 34, 1));
//Math.max() does type coercion but not parsing
console.log(Math.max(13, '42', 135, 34, 1));
console.log(Math.max(13, '42px', 135, 34, 1));

console.log(Math.min(13, 42, 135, 34, 1));

//To calculate the radius of a circle
console.log(Math.PI * Number.parseFloat('10px') ** 2);

//Dice roll
console.log(Math.trunc(Math.random() * 6) + 1);
//To get a number between min and max always
const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

const randomNo = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomNo(1, 10));

//Rounding integers
//All does type coercion as well
console.log(Math.trunc(5.3));

console.log(Math.round(23.3));
console.log(Math.round('23.6'));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.6));

console.log(Math.floor(23.3));
console.log(Math.floor(23.6));
//Both floor() and trunc() behave the same when we deal with +ve integers but not for -ve integers
console.log(Math.trunc(-23.3)); //-23
console.log(Math.floor(-23.3)); //-24
//floor() is better than trunc() since it works for all cases

//Rounding Decimals

//toFixed() always returns a string and not a number
console.log((2.6).toFixed(0));
console.log((2.6).toFixed(3));
console.log((2.345).toFixed(2));
//to convert it into a number add a "+" sign
console.log(+(2.345).toFixed(2));

console.log(5 % 2);
console.log(5 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(53));
console.log(isEven(46));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});

//BigInt is a special type of integers that was intoduced in ES2020
console.log(2 ** 53 - 1); //This is the biggest no that JS can safely represent
console.log(Number.MAX_SAFE_INTEGER);
console.log(4252884235252525252525252n);
console.log(BigInt(4252884235252525252525252));
console.log(BigInt(5235322));

//Operations
console.log(10003n + 24242n);
console.log(1934252627789809880770990n * 10000000n);
//console.log(Math.sqrt(16n)); //Math operation does not work in case of bigint

const huge = 241526261512636532414n;
const num = 23;
console.log(huge * BigInt(num));

//Exceptions
console.log(20n > 15); //true
console.log(20n === 20); //=== operator does not do type coercion,hence o/p=false
console.log(20n == 20); //== does type coercion,so true
console.log(20n == '20'); //true
console.log(typeof 20n);

console.log(huge + ' is Really Big!');

//console.log(10n / 3); //error:cannot mix BigInt and other types
console.log(10n / 3n);
console.log(10 / 3);

//Dates and Times

//Create a date
const noww = new Date();
console.log(noww);

console.log(new Date('December 25,2014'));
console.log(new Date('Dec 26 2020 14:43:37'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(1999, 5, 15, 12, 44, 30));
//Auto-correct dates
console.log(new Date(2037, 10, 31, 15, 24, 12));
console.log(new Date(2037, 11, 32, 15, 24, 12));

console.log(new Date(0)); //1970
//Time stamp is the  milliseconds that have passed since 1970
console.log(new Date(3 * 24 * 60 * 60 * 1000));

//Working with dates
const future = new Date(2037, 10, 19, 15, 24);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142237240000));

//To get current time stamp
console.log(Date.now());

//To set a new date
future.setFullYear(2064);
console.log(future);

const future1 = new Date(2037, 10, 19, 15, 24);
console.log(Number(future1));
console.log(+future1);

const calcDaysPassed = (date1, date2) =>
  Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(days1);

//If we need precise changes like daylight changes and other wierd edge cases like that then use a library like moment.js

const options = {
  //2 diff options for style: unit,percent,currency
  style: 'currency',
  unit: 'celsius', //'mile-per-hour',
  currency: 'EUR',
  userGrouping: false,
};

const numb = 2343321.34;
console.log('US: ', new Intl.NumberFormat('en-US', options).format(numb));
console.log('India:', new Intl.NumberFormat('en-IN', options).format(numb));
console.log('Germany', new Intl.NumberFormat('de-DE', options).format(numb));
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options).format(numb));
console.log(navigator.language);
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(numb)
);

//setTimeout() schedules a function to run after a certain amount of time but the callback function is executed only once
setTimeout(() => console.log('Here is your pizza 🍕'), 3000);
setTimeout(() => console.log('Where are u gng?'), 1000);

setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  2000,
  'oloves',
  'spinach'
);
//Other way
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  4000,
  ...ingredients
);
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);
console.log('Hello');

//setInterval() will execute the code after every spicific amount of time
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 10000);
