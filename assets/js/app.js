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
let maxStatsLabelNew = document.getElementById('max-stats-label-new');
let maxStats = document.getElementById('max-stats');
// Results
let score = document.getElementById('score');
let manualScore = document.getElementById('manual-score');
let earnedStats = document.getElementById('earned-stats');
let earnedSplit = document.getElementById('earned-split');
let newStats = document.getElementById('new-stats');
// Calculate Button
let calcBtn = document.getElementById('calc-btn');
// Max Error Message
let maxErrorMsg = document.getElementById('max-error-msg');
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
let maxNewStats = 0;
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
    fetchBtn.disabled = true;
    fetchUserStats();
});
window.addEventListener('load', winLoad);
baseLevel.addEventListener('change', changeStartingStats);
maxStats.addEventListener('change', calculateMaxStats);

// Window Load Function
function winLoad() {
    timerInit();
    changeStartingStats();
    fetchMaxStats();
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

        if (distance < 0) {
            clearInterval(countdown);
            timerCounter.innerHTML = "EXPIRED";
        } else {
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            timerCounter.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";
        }

        
    }, 1000)
}

// Change starting Stats based on base
function changeStartingStats() {
    //Calculate Max Stats since base is changed
    calculateMaxStats();
    currentStats.value = 50 * (parseInt(baseLevel.options[baseLevel.selectedIndex].textContent) + 1);
}

function calculateMaxStats() {
    let calc = {newBase: 0};
    let tempBase =  baseLevel.selectedIndex;
    do {
        calc = calculate(maxStats.valueAsNumber, 50, true, tempBase);
        if (calc.newBase > tempBase) {
            tempBase++;
        }
    } while (calc.newStats === 0 && calc.newBase <= 9);

    if (calc.newBase > 9) {
        maxStatsLabelNew.textContent = '0';
        logError(statsErrorMsg, "Need more bases!");
        return;
    } else if (calc.newBase !== baseLevel.selectedIndex) {
        maxStatsLabelNew.textContent = '0';
        logError(statsErrorMsg, 'Incorrect Base; Change Base or Max!');
    } else {
        maxNewStats = calc.newStats;
        maxStatsLabelNew.textContent = maxNewStats;
    }
}

// Automatically fetch the max stats from the stats sheet
function fetchMaxStats() {

    // GET PAGE ID FROM HERE WHEN PUBLISHED
    // https://spreadsheets.google.com/feeds/cells/SHEET_ID/od6/public/full?alt=json
    
    // OFFICIAL STAT SHEET
    let sheetID = "11DBV69f-U9T1EXbdI_AvjHpp7XzSs38fH9eKqdx2sUw";
    // JOEY'S SHEET FOR DEBUGGING
    //let sheetID = "10bBzQNryutYgx49QEb2Vz19alL55lS_hEJ-FrJTOIFE";
    let url = `https://spreadsheets.google.com/feeds/list/${sheetID}/1/public/full?alt=json`;

    let request = new XMLHttpRequest();
    
    request.ontimeout = () => {
        logError(statsErrorMsg, `Error - Timed Out while fetching max stats. Please manually input max stats.`);
    };

    request.open('GET', url);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    request.timeout = 5000;

    request.send();
    
    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status === 200) {
                // Good response
                let data = JSON.parse(request.response);
                maxStats.valueAsNumber = data.feed.entry[0].gsx$currentmax.$t;
                calculateMaxStats();
                return;
            } else {
                logError(maxErrorMsg, "Error Fetching Max from Google - Using Default");
                calculateMaxStats();
                return;
            }
        }
    }
    
    request.onabort = function() {
        logError(maxErrorMsg, "Fetching Stats Aborted - Using Default");
        calculateMaxStats();
        return;
    }

    request.onerror = function() {
        logError(maxErrorMsg, "Error Fetching Max from Google - Using Default");
        console.log(`Error ${request.status}: ${request.statusText}`);
        calculateMaxStats();
        return;
    }
}

// Attempt to fetch user's stats when a new username is entered
function fetchUserStats() {
    // Remove stats error because we're getting a new username and new stats
    statsErrorMsg.classList.remove('show');

    // GET PAGE ID FROM HERE WHEN PUBLISHED
    // https://spreadsheets.google.com/feeds/cells/SHEET_ID/od6/public/full?alt=json
    let sheetID = "11DBV69f-U9T1EXbdI_AvjHpp7XzSs38fH9eKqdx2sUw";

    let url = `https://spreadsheets.google.com/feeds/list/${sheetID}/1/public/full?alt=json`;

    let request = new XMLHttpRequest();
    
    request.ontimeout = () => {
        logError(statsErrorMsg, `Error - Timed Out while fetching user's stats. Please manually input current stats.`);
        fetchBtn.disabled = false;
    };

    request.open('GET', url);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    request.timeout = 5000;

    request.send();
    
    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status === 200) {
                // Good response
                let data = JSON.parse(request.response);
                let entry = data.feed.entry.find((e) => {
                    return (e.gsx$username.$t.localeCompare(username.value, 'en', {sensitivity: 'base'}) === 0)
                });
                if (entry) {
                    currentStats.value = entry.gsx$totalbasestats.$t;
                    fetchComments();
                } else {
                    logError(statsErrorMsg, "Error Fetching User's Stats. Check spelling or enter stats manually");
                    fetchBtn.disabled = false;
                }
                return;
            } else {
                logError(statsErrorMsg, "Error Fetching User's Stats from Google");
                fetchBtn.disabled = false;
                return;
            }
        }
    }
    
    request.onabort = function() {
        logError(statsErrorMsg, "Fetching User's Stats Aborted");
        calculateMaxStats();
        fetchBtn.disabled = false;
        return;
    }

    request.onerror = function() {
        logError(statsErrorMsg, "Error Fetching User's Stats from Google");
        console.log(`Error ${request.status}: ${request.statusText}`);
        calculateMaxStats();
        fetchBtn.disabled = false;
        return;
    }
}

function updateCalcValues(calc) {
    earnedStats.textContent = calc.earnedStats;
    earnedSplit.textContent = calc.earnedSplit;
    newStats.textContent = calc.newStats;
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

    updateCalcValues(calculate(currentStats.valueAsNumber, manualScore.valueAsNumber));
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
    let url = `https://api.reddit.com/user/${username.value}/comments/.json`;
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
    //console.log(data);
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
        //console.log(url);
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

        updateCalcValues(calculate(currentStats.valueAsNumber, manualScore.valueAsNumber));
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
    str = str.replace(/[.,?!()<>{}[\]/\\+=~'`|:;_-]/g, '');
    str = str.replace(/-/g, ' ');
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
        percent: 1.00
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
        percent: 1.00
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
        threshold: 301,
        percent: 2.0
    },
    { //3
        threshold: 551,
        percent: 0.90
    },
    { //4
        threshold: 601,
        percent: 0.70
    },
    { //5
        threshold: 651,
        percent: 0.50
    },
    { //6
        threshold: 701,
        percent: 0.40
    },
    { //7
        threshold: 751,
        percent: 0.30
    }], //DONE
    
    base_3: [
    { //1
        threshold: 0,
        percent: 4.0
    },
    { //2
        threshold: 301,
        percent: 3.0
    },
    { //3
        threshold: 551,
        percent: 2.0
    },
    { //4
        threshold: 801,
        percent: 0.90
    },
    { //5
        threshold: 851,
        percent: 0.70
    },
    { //6
        threshold: 901,
        percent: 0.50
    },
    { //7
        threshold: 951,
        percent: 0.40
    },
    { //8
        threshold: 1001,
        percent: 0.30
    }], //DONE
        
    base_4: [
    { //1
        threshold: 0,
        percent: 5.0
    },
    { //2
        threshold: 301,
        percent: 4.0
    },
    { //3
        threshold: 551,
        percent: 3.0
    },
    { //4
        threshold: 801,
        percent: 2.0
    },
    { //5
        threshold: 1051,
        percent: 1.0
    },
    { //6
        threshold: 1101,
        percent: 0.85    },
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
        threshold: 301,
        percent: 5.0
    },
    { //3
        threshold: 551,
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

calcBtn.addEventListener('click', () => {
    updateCalcValues(calculate(currentStats.valueAsNumber, manualScore.valueAsNumber));
});

function updateScore() {
    // Get a temporary score by dividing word count by WORDS_PER_POINT
    //tempScore = Math.floor(tempWordCount / WORDS_PER_POINT);
    // If the player has written at least 100 words, they can get the minimum score of 20
    let tempScore = 0;
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

function calculate(stats, score, getMax = false, base = baseLevel.selectedIndex, max = maxStats.valueAsNumber, maxNew = Number(maxStatsLabelNew.textContent), logErrors = true) {
    // Return value with all the different information we may need
    let returnVal = {
        earnedStats: 0,
        earnedSplit: "",
        newStats: 0,
        newBase: base
    }

    // Whenever the Calculate Stats button is pressed
    // Clear error message
    statsErrorMsg.classList.remove('show');

    // Change starting stats based on what base we're on
    let tempCurrentStats = 0;
    let startingStats = 50 * (parseInt(baseLevel.options[base].textContent) + 1);
    tempCurrentStats = stats < startingStats ? startingStats : stats;
    
    let isMax = tempCurrentStats >= max;
    let rangeLevel = 0;
    let baseArray = baseLevels[`base_${base}`];
    let baseRangeMin = baseArray[baseArray.length - 1].threshold;
    let baseRangeMax = baseRangeMin + 49;
    let percent;
    let isBottomRange;
    let tempStatsEarned = 0;

    // If the current stat total is outside of the range, set the rangeLevel
    // to the size of the array
    if (tempCurrentStats >= baseRangeMin) {
        rangeLevel = baseArray.length - 1;
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

    let tempScore = score;
    while (tempScore > 0) {
        // Set to the currect percent
        percent = baseArray[rangeLevel].percent;
        // Catch up system
        // If percent is less than 1.0 and score is multiple of 50
        if (percent < 1.0 && score % 50 === 0 && isMax === false) {
            if (percent === 0.90) {
                percent = 1.0;
            } else {
                // Give them a small boost equal to the midway percent value
                // of their correct range and the range above theirs
                percent = (percent + baseArray[rangeLevel - 1].percent) / 2;
            }
        }

        if (rangeLevel === (baseArray.length - 1)) {
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
                returnVal.newBase += 1;
                return returnVal;
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
    if (tempCurrentStats > stats) {
        earnedRounded += tempCurrentStats - stats;
    }
    
    if (!getMax) {
        if (stats + earnedRounded > maxNew) {
            returnVal.earnedStats = maxNew - stats;
            returnVal.earnedSplit = `(${Math.round(returnVal.earnedStats * 0.6)}/${Math.round(returnVal.earnedStats * 0.4)})`;
            returnVal.newStats = stats + returnVal.earnedStats;

            return returnVal;
        }
    }

    returnVal.earnedStats = earnedRounded;
    returnVal.earnedSplit = `(${Math.round(earnedRounded * 0.6)}/${Math.round(earnedRounded * 0.4)})`;
    returnVal.newStats = stats + earnedRounded;
    return returnVal;
}

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

function catchUp(first, newbie, max = 0) {
    let firstNew = 0;
    let newbieNew = 0;
    let maxNew = 0;
    let testBase = 0;

    if (first > max) {
        max = first;
    }

    let results = {};

    let iterations = 0;

    console.log(`${iterations}: First: ${first} | Newbie: ${newbie}`);

    while(newbie < first) {
        // Should have hit max stats, set first to stat limit
        if (testBase > 9) {
            firstNew = 2500;
            maxNew = 2500;
        } else {
            // First do max
            if (max > first) {
                results = calculate(max, 50, true, testBase, max, null, false);
                if (results.newBase !== testBase) {
                    testBase += 1;
                    continue;
                }
                maxNew = results.newStats;
            }

            if (first === max) {
                // First and Max are the same, so don't calculate max twice dummy
                results = calculate(first, 50, true, testBase, max, null, false);
                if (results.newBase !== testBase) {
                    testBase += 1;
                    continue;
                }
                firstNew = results.newStats;
                maxNew = firstNew;
            } else if (first < max) {
                // First less than max, proceed as normal
                results = calculate(first, 50, false, testBase, max, maxNew, false);
                if (results.newBase !== testBase) {
                    // This probably shouldn't happen but if it does I'd like to know
                    console.log("Base up on first when not max?");
                    break;
                }
                firstNew = results.newStats;
            } else {
                // This probably won't ever happen.
                console.log("First is somehow greater than max.");
                break;
            }
        }

        // Do newbie stats outside of the if/else in case the limit is hit
        if (testBase > 9) {
            results = calculate(newbie, 50, false, 9, max, maxNew, false);
            if (results.newBase > 9) {
                newbieNew = 2500;
            } else {
                newbieNew = results.newStats;
            }
        } else {
            results = calculate(newbie, 50, false, testBase, max, maxNew, false);
            if (results.newBase !== testBase) {
                console.log("Base up as newbie?");
            }
            newbieNew = results.newStats;
        }

        max = maxNew;
        first = firstNew;
        newbie = newbieNew;

        console.log(`${++iterations}: First: ${first} | Newbie: ${newbie}`);
    }
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