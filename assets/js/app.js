// Elements
// Countdown Timer
let timerLabel = document.getElementById('timer-label');
let timerCounter = document.getElementById('timer-counter');
// Posts collector inputs
let username = document.getElementById('username');
let subreddit = document.getElementById('subreddit');
let startDate = document.getElementById('start-date');
let endDate = document.getElementById('end-date');
// Query Status
let queryStatus = document.getElementById('query-status');
// Fetch Button
let fetchBtn = document.getElementById('fetch-btn');
// Fetch error message
let fetchErrorMsg = document.getElementById('fetch-error-msg');
// Remove Button
let removeBtn = document.getElementById('remove-btn');
// Remove error message
let removeErrorMsg = document.getElementById('remove-error-msg');
// Small Calculations
//let wordCount = document.getElementById('word-count');
//let commentCount = document.getElementById('comment-count');
//let wordsPerComment = document.getElementById('words-per-comment');
// Stat Calculation Inputs
let currentStats = document.getElementById('current-stats');
let baseLevel = document.getElementById('base-level');
// Results
let score = document.getElementById('score');
let manualScore = document.getElementById('manual-score');
let earnedStats = document.getElementById('earned-stats');
let earnedSplit = document.getElementById('earned-split');
let newStats = document.getElementById('new-stats');
// Calculate Button
let calcBtn = document.getElementById('calc-btn');
// Stats Error Message
let statsErrorMsg = document.getElementById('stats-error-msg');
// Username Header
let usernameHeader = document.getElementById('username-header');
// Posts Column
let postsCol = document.getElementById('posts-col');

// Global Variables
const QUERY_LIMIT = 50;
let processingComments = false;
let filteringComments = false;
let filterIndex = 0;
let tempWordCount = 0;
let tempCommentCount = 0;
let commentsLoaded = 0;
let commentsRemoved = false;
let posts = [];

// Event Listeners
fetchBtn.addEventListener("click", fetchComments);
removeBtn.addEventListener("click", removeComments);
username.addEventListener('change', () => {
    usernameHeader.textContent = username.value;
});
window.addEventListener('load', winLoad);
baseLevel.addEventListener('change', changeStartingStats);

// Window Load Function
function winLoad() {
    timerInit();
    changeStartingStats();
}

// Initiate the countdown timer and automatically set the start date and end date
function timerInit() {
    let currentTime = new Date();
    let year = currentTime.getUTCFullYear();
    let month = (`0${currentTime.getUTCMonth() + 1}`).slice(-2);

    if ((currentTime.getUTCDate() < 15 || (currentTime.getUTCDate() === 15 && currentTime.getUTCHours() < 12)) &&
        (currentTime.getUTCDate() > 1 || (currentTime.getUTCDate() === 1 && currentTime.getUTCHours() >= 12))) {
        let day = '01';
        let startTime = `${year}-${month}-${day}`;
        startDate.value = startTime;
        
    } else {
        if (currentTime.getUTCDate() === 1) {
            month = (`0${currentTime.getUTCMonth()}`).slice(-2);
        }
        let day = '15';
        let startTime = `${year}-${month}-${day}`;
        startDate.value = startTime;
    }
    changeDate();

    let end = new Date(endDate.valueAsNumber);
    end.setUTCHours(12);
    let countdown = setInterval(function() {
        let now = new Date().getTime();
        let distance = end.getTime() - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerCounter.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";

        if (distance < 0) {
            clearInterval(x);
            timerCounter.innerHTML = "EXPIRED";
        }
    }, 1000)
}

// Change starting Stats based on base
function changeStartingStats() {
    currentStats.value = 50 + (25 * parseInt(baseLevel.options[baseLevel.selectedIndex].textContent));
}

startDate.addEventListener('change', changeDate);

function changeDate() {
    // Every time the start date is changed, check to see if
    // the new Start Date is either the 1st or the 15th of a month
    let start = new Date(startDate.value);
    let end = new Date(start);
    let setNewDate = false;
    if (start.getUTCDate() === 1) {
        end.setUTCDate(15);
        setNewDate = true;
    }
    // If it is, change the End Date to either the 15th of the
    // same month or the first of the next month respectively.
    if (start.getUTCDate() === 15) {
        end.setUTCMonth(start.getUTCMonth() + 1, 1)
        setNewDate = true;
    }

    if (setNewDate) {
        let year = end.getUTCFullYear();
        let month = (`0${end.getUTCMonth() + 1}`).slice(-2);
        let day = (`0${end.getUTCDate()}`).slice(-2);
        let endString = `${year}-${month}-${day}`;
        endDate.value = endString;
    }
}

manualScore.addEventListener('change', () => {
    // Anytime the manual input changes, update the score field accordingly
    if (manualScore.value >= 0) {
        // Do not check to see if manual score is greater than 50 since mods may
        // Want to reward more than 50 score manually in the case of double stats
        score.textContent = manualScore.value;
    } else {
        manualScore.value = 0;
    }

    tempScore = manualScore.value;
    calculate();
});

function logError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function fetchComments() {
    // Clear global variables
    posts = [];
    commentsLoaded = 0;
    tempWordCount = 0;
    commentsRemoved = false;
    filterIndex = 0;

    // Clear select elements
    //wordCount.textContent = '0';
    //commentCount.textContent = '0';
    //wordsPerComment.textContent = '0';

    // Clear stat values since the new comments are
    // potentially unrelated to the old ones
    resetStatValues();

    // Disable fetch button until processing is complete
    fetchBtn.disabled = true;

    //let url = `https://api.reddit.com/user/${username.value}/comments/.json?limit=${QUERY_LIMIT}`;
    let url = `https://api.reddit.com/user/${username.value}/.json`;
    query(url, fetchBtn, fetchErrorMsg, fetch);
}

function removeComments() {
    filterIndex = 0;
    if (posts.length === 0) {
        logError(removeErrorMsg, "Must fetch comments before they can be deleted.");
    } else if (commentsRemoved === true) {
        logError(removeErrorMsg, "Comments are already removed!");
    } else if (fetchBtn.disabled === true) {
        // Fetch button is disabled means the comments are still processing or attempting to be fetched
        logError(removeErrorMsg, "Fetch in progress - try again later");
    } else {
        // Comments are ready and have not been filtered yet
        // Disable remove button until filtering is complete
        removeBtn.disabled = true;
        filteringComments = true;
        queryStatus.textContent = 'Filtering';

        let url = `https://api.reddit.com${posts[filterIndex].postedToLink}.json`;
        //console.log(url);
        if (!query(url, removeBtn, removeErrorMsg, filter)) {
            filteringComments = false;
        }
    }
}

function query(url = '', btnElement, errorMsgElement, callback) {
    errorMsgElement.classList.remove('show');

    let request = new XMLHttpRequest();
    
    request.ontimeout = () => {
        logError(errorMsgElement, `Error - Timed Out while Querying`);
        btnElement.disabled = false;
        return false;
    };

    request.open('GET', url);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    request.timeout = 5000;

    request.send();

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            let response = JSON.parse(request.response);
            //console.log(request);
            if (response.error) {
                logError(errorMsgElement, `Error Querying - ${response.error}: ${response.message}`);
                btnElement.disabled = false;
                return false;
            }
            //console.log(response.data.children);
            if (request.status === 200) {
                //console.log(response.data);
                // Call the Callback and send in the response data
                callback(response);
            }
        }
    }

    return true;
}

function fetch(response) {
    commentsLoaded += response.data.dist;
    processingComments = true;
    queryStatus.textContent = 'Processing';
    processComments(response);
}

function filter(response) {
    //console.log(response);
    if (response[1].data.children.length > 0) {
        let id = response[1].data.children[0].data.id;

        if (response[1].data.children[0].data.author === "[deleted]") {
            for (let post in posts) {
                if (posts[post].id === id) {
                    // Mark to filter
                    posts[post].filter = true;
                }
            }
        }

        if (id === posts[posts.length - 1].id) {
            // Done filtering
            filteringComments = false;
        } else {
            let url = `https://api.reddit.com${posts[++filterIndex].postedToLink}.json`;
            //console.log(url);
            if (!query(url, removeBtn, removeErrorMsg, filter)) {
                filteringComments = false;
            }
        }
    } else {
        posts[filterIndex].filter = true;
        if (filterIndex < posts.length - 1) {
            let url = `https://api.reddit.com${posts[++filterIndex].postedToLink}.json`;
            //console.log(url);
            if (!query(url, removeBtn, removeErrorMsg, filter)) {
                filteringComments = false;
            }
        }
    }

    if (!filteringComments) {
        removeBtn.disabled = false;
        filterPosts();
    }
}

function processComments(response) {
    let data = response.data;
    for (let comment in data.children) {
        // Make sure comment is not older than start date
        // If it is, end processing
        if (data.children[comment].data.created_utc < (startDate.valueAsNumber / 1000) + 43200) {
            if (data.children[comment].data.pinned === true) {
                continue;
            } else {
                processingComments = false;
                break;
            }
        }

        // Check if comment was made in the correct subreddit
        // and if it was made later than end-date
        // if so, continue to next comment
        if (data.children[comment].data.created_utc > (endDate.valueAsNumber / 1000) + 43200) {
            continue;
        }

        if (data.children[comment].data.subreddit.localeCompare(subreddit.value, 'en', {sensitivity: 'base'}) !== 0) {
            if (subreddit.value.localeCompare('StrawHatRPG', 'en', {sensitivity: 'base'}) === 0) {
                // If the subreddit is set to StrawHatRPG, then it checks if the comment was made in
                // any of the subs within the StrawHatRPG Community
                if (data.children[comment].data.subreddit.localeCompare('StrawHatRPGShops', 'en', {sensitivity: 'base'}) !== 0) {
                    continue;
                } 
            } else {
                continue;
            }
        }

        //console.log(data.children[comment]);
        // Any comment that makes it this far is assumed to be
        // from the correct subreddit in the correct timeframe.
        // Now it will be added to the posts array
        let post = {};
        post.postedTo = data.children[comment].data.link_title;
        post.postedToLink = data.children[comment].data.permalink;
        post.body = data.children[comment].data.body_html;
        post.id = data.children[comment].data.id;
        posts.push(post);
    }

    if (processingComments && commentsLoaded < 1000 && data.after != null) {
        let url = `https://api.reddit.com/user/${username.value}/comments/.json?limit=${QUERY_LIMIT}&?&after=${data.after}`;
        query(url, fetchBtn, fetchErrorMsg, fetch);
    } else {
        if (commentsLoaded >= 1000) {
            logError(fetchErrorMsg, `Max Comments Loaded - Due to limitations set by Reddit, only the last 1000 comments from a user can be loaded`);
        }

        // Reenable fetchBtn so that the tool can still be used
        fetchBtn.disabled = false;
        queryStatus.textContent = 'Complete';
        //commentCount.textContent = posts.length;
        displayPosts();
    }
}

function displayPosts() {
    // Delete all comments from webpage to make room for the new ones
    while (postsCol.lastChild.id !== 'posts-col-header') {
        postsCol.removeChild(postsCol.lastChild);
    }
    // Iterate through posts array
    for (let i in posts) {
        let commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        let commentTitle = document.createElement('h3');
        commentTitle.classList.add('comment-title');
        commentTitle.innerHTML = `Posted to: <a href="https://www.reddit.com${posts[i].postedToLink}">${posts[i].postedTo}</a>`;
        commentDiv.appendChild(commentTitle);


        let commentBody = document.createElement('div');
        commentBody.classList.add('comment-body');
        commentBody.innerHTML = decodeHTML(posts[i].body);
        commentDiv.appendChild(commentBody);

        postsCol.appendChild(commentDiv);
    }

    calculateWords();
}

function filterPosts() {
    let comments = Array.from(postsCol.querySelectorAll('.comment'));
    // Iterate through posts array
    for (let i in posts) {
        //console.log(posts[i]);
        if (posts[i].filter) {
            let comment = comments[i];
            comment.classList.add('filtered');
        }
    }

    calculateWords();
    queryStatus.textContent = 'Complete';
}

function calculateWords() {
    tempWordCount = 0;

    if (posts.length) {
        // Iterate through each comment from postsCol and get word count
        let comments = Array.from(postsCol.querySelectorAll('.comment'));
        let posts = Array.from(postsCol.querySelectorAll('.comment-body'));

        for (let i in posts) {
            if (comments[i].classList.contains('filtered')) {
                // Do not count filtered comments
                continue;
            }
            let commentElements = Array.from(posts[i].children[0].children);
            for (let element in commentElements) {
                // Check each element and only count the words within
                // the element if it isn't a blockquote, table, or list
                if (commentElements[element].tagName.toLowerCase() != 'blockquote' &&
                    commentElements[element].tagName.toLowerCase() != 'table' &&
                    commentElements[element].tagName.toLowerCase() != 'code' &&
                    commentElements[element].tagName.toLowerCase() != 'ul' &&
                    commentElements[element].tagName.toLowerCase() != 'ol')
                {
                    tempWordCount += countWords(commentElements[element].textContent);
                }
            }
        }
        // Calculate score as soon as word counting is done
        updateScore();
        calculate();
        //wordCount.textContent = tempWordCount;
        //wordsPerComment.textContent = (tempWordCount / posts.length).toFixed(1);
    }
}

function decodeHTML(html) {
    let txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function countWords(str) {
    // Use regular expression to replace things we don't want
    // counted as words with empty spaces, then extract all non-whitespace sequences
    str = str.replace(/[.,?!()<>{}[\]/\\+=~'`|:;0-9-_]/g, '');
    let exp = /\S+/ig;
    let tmp, words = 0;
    while ((tmp = exp.exec(str)) != null) {
        words++;
    }

    return words;
}

/*
 *
 * STAT CALCULATIONS
 * 
 */

 // Object to hold the different thresholds at different base values
 var baseLevels = {
    //threshold = levelTable.low
    base_0: [
    { //1
        threshold: 0,
        percent: 1.0
    },
    { //2
        threshold: 101,
        percent: 0.85
    },
    { //3
        threshold: 151,
        percent: 0.70
    },
    { //4
        threshold: 201,
        percent: 0.55
    },
    { //5
        threshold: 251,
        percent: 0.40
    }], //DONE
    
    base_1: [
    { //1
        threshold: 0,
        percent: 2.0
    },
    { //2
        threshold: 301,
        percent: 1.0
    },
    { //3
        threshold: 351,
        percent: 0.85
    },
    { //4
        threshold: 401,
        percent: 0.70
    },
    { //5
        threshold: 451,
        percent: 0.55
    },
    { //6
        threshold: 501,
        percent: 0.40
    }], //DONE
    
    base_2: [
    { //1
        threshold: 0,
        percent: 3.0
    },
    { //2
        threshold: 351,
        percent: 2.0
    },
    { //3
        threshold: 551,
        percent: 1.0
    },
    { //4
        threshold: 601,
        percent: 0.85
    },
    { //5
        threshold: 651,
        percent: 0.70
    },
    { //6
        threshold: 700,
        percent: 0.55
    },
    { //7
        threshold: 751,
        percent: 0.40
    }], //DONE
    
    base_3: [
    { //1
        threshold: 0,
        percent: 4.0
    },
    { //2
        threshold: 401,
        percent: 3.0
    },
    { //3
        threshold: 601,
        percent: 2.0
    },
    { //4
        threshold: 801,
        percent: 1.0
    },
    { //5
        threshold: 851,
        percent: 0.85
    },
    { //6
        threshold: 901,
        percent: 0.70
    },
    { //7
        threshold: 951,
        percent: 0.55
    },
    { //8
        threshold: 1001,
        percent: 0.40
    }], //DONE
        
    base_4: [
    { //1
        threshold: 0,
        percent: 5.0
    },
    { //2
        threshold: 351,
        percent: 4.0
    },
    { //3
        threshold: 651,
        percent: 3.0
    },
    { //4
        threshold: 851,
        percent: 2.0
    },
    { //5
        threshold: 1051,
        percent: 1.0
    },
    { //6
        threshold: 1101,
        percent: 0.85
    },
    { //7
        threshold: 1151,
        percent: 0.70
    },
    { //8
        threshold: 1201,
        percent: 0.55
    },
    { //9
        threshold: 1251,
        percent: 0.40
    }], //DONE
    
    base_5: [
    { //1
        threshold: 0,
        percent: 6.0
    },
    { //2
        threshold: 351,
        percent: 5.0
    },
    { //3
        threshold: 601,
        percent: 4.0
    },
    { //4
        threshold: 801,
        percent: 3.0
    },
    { //5
        threshold: 1051,
        percent: 2.0
    },
    { //6
        threshold: 1301,
        percent: 1.0
    },
    { //7
        threshold: 1351,
        percent: 0.85
    },
    { //8
        threshold: 1401,
        percent: 0.70
    },
    { //9
        threshold: 1451,
        percent: 0.55
    },
    { //10
        threshold: 1501,
        percent: 0.40
    }], //DONE
    
    base_6: [
    { //1
        threshold: 0,
        percent: 7.0
    },
    { //2
        threshold: 301,
        percent: 6.0
    },
    { //3
        threshold: 551,
        percent: 5.0
    },
    { //4
        threshold: 801,
        percent: 4.0
    },
    { //5
        threshold: 1051,
        percent: 3.0
    },
    { //6
        threshold: 1301,
        percent: 2.0
    },
    { //7
        threshold: 1551,
        percent: 1.0
    },
    { //8
        threshold: 1601,
        percent: 0.85
    },
    { //9
        threshold: 1651,
        percent: 0.70
    },
    { //10
        threshold: 1701,
        percent: 0.55
    },
    { //11
        threshold: 1751,
        percent: 0.40
    }], //DONE
    
    base_7: [
    { //1
        threshold: 0,
        percent: 8.0
    },
    { //2
        threshold: 301,
        percent: 7.0
    },
    { //3
        threshold: 551,
        percent: 6.0
    },
    { //4
        threshold: 801,
        percent: 5.0
    },
    { //5
        threshold: 1051,
        percent: 4.0
    },
    { //6
        threshold: 1301,
        percent: 3.0
    },
    { //7
        threshold: 1551,
        percent: 2.0
    },
    { //8
        threshold: 1801,
        percent: 1.0
    },
    { //9
        threshold: 1851,
        percent: 0.85
    },
    { //10
        threshold: 1901,
        percent: 0.70
    },
    { //11
        threshold: 1951,
        percent: 0.55
    },
    { //12
        threshold: 2001,
        percent: 0.40
    }], //DONE
    
    base_8: [
    { //1
        threshold: 0,
        percent: 9.0
    },
    { //2
        threshold: 301,
        percent: 8.0
    },
    { //3
        threshold: 551,
        percent: 7.0
    },
    { //4
        threshold: 801,
        percent: 6.0
    },
    { //5
        threshold: 1051,
        percent: 5.0
    },
    { //6
        threshold: 1301,
        percent: 4.0
    },
    { //7
        threshold: 1551,
        percent: 3.0
    },
    { //8
        threshold: 1801,
        percent: 2.0
    },
    { //9
        threshold: 2051,
        percent: 1.0
    },
    { //10
        threshold: 2101,
        percent: 0.85
    },
    { //11
        threshold: 2151,
        percent: 0.70
    },
    { //12
        threshold: 2201,
        percent: 0.55
    },
    { //13
        threshold: 2251,
        percent: 0.40
    }], //DONE
    
    base_9: [
    { //1
        threshold: 0,
        percent: 10.0
    },
    { //2
        threshold: 301,
        percent: 9.0
    },
    { //3
        threshold: 551,
        percent: 8.0
    },
    { //4
        threshold: 801,
        percent: 7.0
    },
    { //5
        threshold: 1051,
        percent: 6.0
    },
    { //6
        threshold: 1301,
        percent: 5.0
    },
    { //7
        threshold: 1551,
        percent: 4.0
    },
    { //8
        threshold: 1801,
        percent: 3.0
    },
    { //9
        threshold: 2051,
        percent: 2.0
    },
    { //10
        threshold: 2301,
        percent: 1.0
    },
    { //11
        threshold: 2351,
        percent: 0.85
    },
    { //12
        threshold: 2401,
        percent: 0.70
    },
    { //13
        threshold: 2451,
        percent: 0.55
    }]  //DONE
};

const MAX_SCORE = 50;
const MIN_SCORE = 20;
const WORD_REQUIREMENT = 100;
const WORDS_PER_POINT = 170;
let tempScore = 0;

calcBtn.addEventListener('click', calculate);

function updateScore() {
    // Get a temporary score by dividing word count by WORDS_PER_POINT
    //tempScore = Math.floor(tempWordCount / WORDS_PER_POINT);
    // If the player has written at least 100 words, they can get the minimum score of 20
    if (tempWordCount >= WORD_REQUIREMENT) {
        // Calculate Score
        tempScore = MIN_SCORE + Math.floor(tempWordCount / WORDS_PER_POINT);
        // If score is above MAX_SCORE, set it equal to max score
        if (tempScore > MAX_SCORE) {
            tempScore = MAX_SCORE;
        }
    } else {
        logError(statsErrorMsg, 'Player did not write 100 words, 0 points awarded!');
        tempScore = 0;
    }

    score.textContent = tempScore;
    manualScore.value = tempScore;
}

function calculate() {
    // Whenever the Calculate Stats button is pressed
    // Clear error message
    statsErrorMsg.classList.remove('show');

    tempScore = manualScore.value;

    let tempCurrentStats = 0;
    let startingStats = 50 + (25 * parseInt(baseLevel.options[baseLevel.selectedIndex].textContent));
    
    tempCurrentStats = currentStats.valueAsNumber < startingStats ? startingStats : currentStats.valueAsNumber;
    
    let rangeLevel = 0;
    let baseArray = baseLevels[baseLevel.value];
    let baseRangeMin = baseArray[Object.keys(baseArray).length - 1].threshold;
    let baseRangeMax = baseRangeMin + 49;
    let percent;
    let isBaseValid, isBottomRange;
    let tempStatsEarned = 0;

    if (tempCurrentStats > baseRangeMax) {
        isBaseValid = false;
        logError(statsErrorMsg, 'Current Stat Total outside of Base Range!');
        return;
    } else {
        isBaseValid = true;
    }

    // If the current stat total is outside of the range, set the rangeLevel
    // to the size of the array
    if (tempCurrentStats >= baseRangeMin) {
        rangeLevel = Object.keys(baseArray).length - 1;
    } else {
        // Iterate through the baseArray to find what rangeLevel we're at
        for (let lvl in baseArray) {
            lvl = Number(lvl);
            if (tempCurrentStats >= baseArray[lvl].threshold &&
                tempCurrentStats < baseArray[lvl+1].threshold) {
                rangeLevel = lvl;
                break;
            }
        }
    }

    while (tempScore > 0) {
        percent = baseArray[rangeLevel].percent;

        if (rangeLevel === (Object.keys(baseArray).length - 1)) {
            isBottomRange = true;
        } else {
            isBottomRange = false;
        }

        let temp = tempScore * percent; //ROUNDED
        let statsNeeded = 0;
        if (isBottomRange) {
            statsNeeded = baseRangeMax - tempCurrentStats; //ROUNDED
            if (temp > statsNeeded) {
                logError(statsErrorMsg, 'You need to Base Up!');
                return;
            }
        } else {
            statsNeeded = (baseArray[rangeLevel+1].threshold - 1) - (tempCurrentStats + tempStatsEarned);
        }

        if (temp > statsNeeded) {
            let tmp = (statsNeeded / percent); //ROUNDED
            tempScore -= tmp;
            tempStatsEarned += statsNeeded;
            rangeLevel++;
        } else {
            tempStatsEarned += temp;
            tempScore = 0;
        }
    }

    let earnedRounded = Math.round(tempStatsEarned);
    if (tempCurrentStats > currentStats.valueAsNumber) {
        earnedRounded += tempCurrentStats - currentStats.valueAsNumber;
    }

    earnedStats.textContent = earnedRounded;
    earnedSplit.textContent = `(${Math.round(earnedRounded * 0.6)}/${Math.round(earnedRounded * 0.4)})`;
    newStats.textContent = currentStats.valueAsNumber + earnedRounded;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function resetStatValues() {
    score.textContent = '0';
    earnedStats.textContent = '0';
    earnedSplit.textContent = '(0/0)';
    newStats.textContent = '0';
}



/*
/
/   TESTING
/
/
*/

function catchUp(testFirst, newb = 50) {
    let first = testFirst;
    let newbie = newb;
    let testBase = 0;

    let results = {};

    let iterations = 0;

    console.log(`${iterations}: First: ${first} | Newbie: ${newbie}`);

    while(newbie < first) {
        if (testBase > 9) break;
        results = catchUpCalc(first, testBase);
        if (results.Base !== testBase) {
            testBase += 1;
            continue;
        } else {
            first += results.Earned;
            results = catchUpCalc(newbie, testBase);
            if (results.Base !== testBase) {
                testBase += 1;
                continue;
            } else {
                newbie += results.Earned;
            }
        }

        console.log(`${++iterations}: First: ${first} | Newbie: ${newbie}`);
    }
}

function catchUpToMax(testFirst) {
    let first = testFirst;
    let testBase = 0;

    let results = {};

    let iterations = 0;

    console.log(`${iterations}: Stats: ${first}`);

    while(first < 2500) {
        if (testBase > 9) break;
        results = catchUpCalc(first, testBase);
        if (results.Base !== testBase) {
            testBase += 1;
            continue;
        } else {
            first += results.Earned;
        }

        console.log(`${++iterations}: Stats: ${first}`);
    }
}

function catchUpCalc(testStats, testBase) {
    let returnVal = {
        "Base": testBase,
        "Earned": 0
    }

    let testScore = 50;

    let rangeLevel = 0;
    let baseArray = baseLevels[`base_${testBase}`];
    let baseRangeMin = baseArray[Object.keys(baseArray).length - 1].threshold;
    let baseRangeMax = baseRangeMin + 49;
    let percent;
    let isBottomRange;
    let tempStatsEarned = 0;

    // If the current stat total is outside of the range, set the rangeLevel
    // to the size of the array
    if (testStats >= baseRangeMin) {
        rangeLevel = Object.keys(baseArray).length - 1;
    } else {
        // Iterate through the baseArray to find what rangeLevel we're at
        for (let lvl in baseArray) {
            lvl = Number(lvl);
            if (testStats >= baseArray[lvl].threshold &&
                testStats < baseArray[lvl+1].threshold) {
                rangeLevel = lvl;
                break;
            }
        }
    }

    while (testScore > 0) {
        percent = baseArray[rangeLevel].percent;

        if (rangeLevel === (Object.keys(baseArray).length - 1)) {
            isBottomRange = true;
        } else {
            isBottomRange = false;
        }

        let temp = testScore * percent; //ROUNDED
        let statsNeeded = 0;
        if (isBottomRange) {
            statsNeeded = baseRangeMax - testStats; //ROUNDED
            if (temp > statsNeeded) {
                returnVal.Base += 1;
                return returnVal;
            }
        } else {
            statsNeeded = (baseArray[rangeLevel+1].threshold - 1) - (testStats + tempStatsEarned);
        }

        if (temp > statsNeeded) {
            let tmp = (statsNeeded / percent); //ROUNDED
            testScore -= tmp;
            tempStatsEarned += statsNeeded;
            rangeLevel++;
        } else {
            tempStatsEarned += temp;
            testScore = 0;
        }
    }
    returnVal.Earned = Math.round(tempStatsEarned);
    return returnVal;
}

let thread = {}
let fakeElement = document.createElement('p');
// Take a link to a thread and count the number of words total in the thread
function checkThread(link) {
    thread = {
        link: "",
        words: 0,
        comments: 0,
        participants: {},
        posts: []
    }
    thread.link = link + ".json";
    
    query(thread.link, fakeElement, fakeElement, processThread);
}

function processThread(response) {
    let comment = response[1].data.children[0].data;

    let post = {};
    post.html = document.createElement('div');
    post.html.innerHTML = decodeHTML(comment.body_html);
    post.author = comment.author;
    thread.posts.push(post);

    thread.comments++;
    
    if (comment.replies !== "") {
        let url = "https://api.reddit.com" + comment.replies.data.children[0].data.permalink + ".json";
        query(url, fakeElement, fakeElement, processThread);
    } else {
        countThread();
    }
}

function countThread() {
    // Iterate through each comment from thread object and get word count
    
    for (let i in thread.posts) {
        let commentElements = Array.from(thread.posts[i].html.children[0].children);
        let author = thread.posts[i].author;
        for (let element in commentElements) {
            
            // Check each element and only count the words within
            // the element if it isn't a blockquote, table, or list
            if (commentElements[element].tagName.toLowerCase() != 'blockquote' &&
                commentElements[element].tagName.toLowerCase() != 'table' &&
                commentElements[element].tagName.toLowerCase() != 'code' &&
                commentElements[element].tagName.toLowerCase() != 'ul' &&
                commentElements[element].tagName.toLowerCase() != 'ol')
            {
                let tempWords = countWords(commentElements[element].textContent);
                thread.words += tempWords;
                
                if (author in thread.participants) {
                    thread.participants[author].words += tempWords;
                } else {
                    thread.participants[author] = {};
                    thread.participants[author].words = tempWords;
                    thread.participants[author].comments = 0;

                }
            }
        }
        thread.participants[author].comments += 1;
    }
    
    console.log("Thread processed!");
}