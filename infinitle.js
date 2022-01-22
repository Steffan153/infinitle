let letterCount = 5;
const words = {};
let word;
let wordCounts = {};
let guesses = 0;
let letters = [];

(async () => {
  const $ = (x) => document.querySelector(x);
  const $$ = (x) => document.querySelectorAll(x);

  await fetch("infinitle.txt")
    .then((x) => x.text())
    .then((x) => {
      x.split("\n").forEach((y, i) => {
        words[i + 2] = y.trim().split(" ");
      });
    });

  function makeLetterBoxes() {
    closeAnnouncement();
    letters = [];
    guesses = 0;
    $$(".guess-letters").forEach((x) => (x.innerHTML = '<div class="guess-letter"></div>'.repeat(letterCount)));
    word = words[letterCount][Math.random() * words[letterCount].length | 0].toUpperCase();
    wordCounts = {};
    word.split("").forEach((x) => (wordCounts[x] = (wordCounts[x] || 0) + 1));
    $$('.guess-letter').forEach(x => x.style.height = x.clientWidth + 4 + 'px');
    $$('.key-letter').forEach(x => x.classList.remove('no', 'yes', 'wp'));
  }

  function updateLetters() {
    $$(".guess-letters")[guesses].querySelectorAll(".guess-letter").forEach((x, i) => {
      x.innerText = letters[i] || "";
    });
  }

  function makeAnnouncement(a, b, c = true) {
    $('.announcement').innerHTML = a;
    $('.announcement').style.color = b;
    $('.announcement').style.display = 'block';
    $('.announcement').style.opacity = 1;
    c && setTimeout(() => {
      closeAnnouncement();
    }, 2000);
  }

  function closeAnnouncement() {
    $('.announcement').style.opacity = 0;
    setTimeout(() => {
      $('.announcement').style.display = 'none';
    }, 1000);
  }

  function submitWord() {
    if (letters.length < letterCount) return;
    if (!words[letterCount].includes(letters.join('').toLowerCase())) {
      return makeAnnouncement("Not in word list!", "red");
    }
    const ls = [...$$(".guess-letters")[guesses].children];
    const counts = {};
    ls.forEach((x, i) => {
      const key = [...$$('.key-letter')].find(y => y.innerText === x.innerText);
      counts[x.innerText] = (counts[x.innerText] || 0) + 1;
      if (!word.includes(x.innerText)) {
        x.classList.add("no");
        key.classList.add("no");
      } else if (word[i] === x.innerText) {
        x.classList.add('yes');
        key.classList.add('yes');
      } else if (counts[x.innerText] <= wordCounts[x.innerText]) {
        x.classList.add('wp');
        key.classList.add('wp');
      } else {
        x.classList.add("no");
        key.classList.add("no");
      }
    });
    if (ls.map(x => x.innerText).join('') === word) {
      ls.forEach((x, i) => {
        x.style.animation = 'done .3s';
        x.style.animationDelay = `${i * .1}s`;
      });
      setTimeout(() => {
        makeAnnouncement("You did it!<br><button class='play-again'>Play Again</button>", "green", false);
        $('.play-again').addEventListener('click', () => {
          makeLetterBoxes();
        });
      }, letterCount * 100 + 200);
    }
    guesses++;
    if (guesses === 6) {
      return makeAnnouncement("You lost!<br><button class='play-again'>Play Again</button>", "red", false);
      $('.play-again').addEventListener('click', () => {
        makeLetterBoxes();
      });
    }
    letters = [];
  }

  makeLetterBoxes();

  $("#letter-count-r").addEventListener("input", (e) => {
    $(".letter-count-s").innerText = e.target.value;
    letterCount = +e.target.value;
    makeLetterBoxes();
  });

  document.addEventListener('keyup', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (/^[a-z]$/i.test(e.key)) {
      if (letters.length === letterCount) return;
      letters.push(e.key.toUpperCase());
      updateLetters();
    }
    if (e.keyCode === 8) {
      letters.pop();
      updateLetters();
    }
    if (e.keyCode === 13) {
      submitWord();
    }
  });

  $$('.key-letter').forEach(x => x.addEventListener('click', () => {
    if (letters.length === letterCount) return;
    letters.push(x.innerText);
    updateLetters();
  }));

  $('.key-backspace').addEventListener('click', () => {
    letters.pop();
    updateLetters();
  });

  $('.key-enter').addEventListener('click', () => {
    submitWord();
  });
})();
