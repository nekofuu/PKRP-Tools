// Elements
// Posts collector inputs
let username = document.getElementById('username');
let subreddit = document.getElementById('subreddit');
let startDate = document.getElementById('start-date');
let endDate = document.getElementById('end-date');
// Query Status
let queryStatus = document.getElementById('query-status');
// Fetch Button
let fetchBtn = document.getElementById('fetch-btn');
// Small Calculations
let wordCount = document.getElementById('word-count');
let commentCount = document.getElementById('comment-count');
let wordsPerComment = document.getElementById('words-per-comment');
// Stat Calculation Inputs
let currentStats = document.getElementById('current-stats');
let baseLevel = document.getElementById('base-level');
// Results
let score = document.getElementById('score');
let earnedStats = document.getElementById('earned-stats');
let earnedSplit = document.getElementById('earned-split');
let newStats = document.getElementById('new-stats');
// Calculate Button
let calcBtn = document.getElementById('calc-btn');
// Error Message
let errorMsg = document.getElementById('error-msg');
// Username Header
let usernameHeader = document.getElementById('username-header');
// Posts Column
let postsCol = document.getElementById('posts-col');

// Global Variables
const queryLimit = 50;
let processingComments = false;
let tempWordCount = 0;
let commentsLoaded = 0;
let posts = [];

// Event Listeners
fetchBtn.addEventListener("click", fetchComments);
username.addEventListener('change', () => {
    usernameHeader.textContent = username.value;
});

function logError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

function fetchComments() {
    // Clear global variables
    posts = [];
    commentsLoaded = 0;
    tempWordCount = 0;

    // Clear select elements
    wordCount.textContent = '0';
    commentCount.textContent = '0';
    wordsPerComment.textContent = '0';

    // TODO: Delete all comments on webpage
    query();
}

function query(after = '') {
    errorMsg.classList.remove('show');

    const url = `https://api.reddit.com/user/${username.value}/comments/.json?limit=${queryLimit}&?&after=${after}`;
    let request = new XMLHttpRequest();
    
    request.ontimeout = () => {
        logError(`Error - Timed Out while Querying`);
    };

    request.open('GET', url);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    request.timeout = 5000;

    request.send();

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            let response = JSON.parse(request.response);
            if (response.error) {
                logError(`Error Querying Username ${username.value} - ${response.error}: ${response.message}`);
            }
            //console.log(response.data.children);
            if (response.data) {
                //console.log(response.data);
                commentsLoaded += response.data.dist;
                processingComments = true;
                queryStatus.textContent = 'Processing';
                processComments(response.data);
            }
        }
    }
}

function processComments(data) {
    for (let comment in data.children) {
        // Make sure comment is not older than start date
        // If it isn't, end processing
        if (data.children[comment].data.created_utc < (startDate.valueAsNumber / 1000) + 43200) {
            processingComments = false;
            break;
        }

        // Check if comment was made in the correct subreddit
        // and if it was made later than end-date
        // if so, continue to next comment
        if (data.children[comment].data.subreddit.localeCompare(subreddit.value, 'en', {sensitivity: 'base'}) ||
            data.children[comment].data.created_utc > (endDate.valueAsNumber / 1000) + 43200) {
            continue;
        }

        //console.log(data.children[comment]);
        // Any comment that makes it this far is assumed to be
        // from the correct subreddit in the correct timeframe.
        // Now it will be added to the posts array
        let post = {};
        post.postedTo = data.children[comment].data.link_title;
        post.postedToLink = data.children[comment].data.link_permalink;
        post.body = data.children[comment].data.body_html;
        posts.push(post);
    }

    if (processingComments && commentsLoaded < 1000) {
        query(data.after);
    } else {
        if (commentsLoaded >= 1000) {
            logError(`Max Comments Loaded - Due to limitations set by Reddit, only the last 1000 comments from a user can be loaded`);
        }

        queryStatus.textContent = 'Complete';
        displayPosts();
    }

    calculateWords();
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
        commentTitle.innerHTML = `Posted to: <a href="${posts[i].postedToLink}">${posts[i].postedTo}</a>`;
        commentDiv.appendChild(commentTitle);


        let commentBody = document.createElement('div');
        commentBody.classList.add('comment-body');
        commentBody.innerHTML = decodeHTML(posts[i].body);
        commentDiv.appendChild(commentBody);

        postsCol.appendChild(commentDiv);
    }
}

function calculateWords() {
    // Iterate through each comment from postsCol and get word count
    let comments = Array.from(postsCol.querySelectorAll('.comment-body'));
    commentCount.textContent = comments.length;

    for (let i in comments) {
        tempWordCount += countWords(comments[i].textContent);
    }

    wordCount.textContent = tempWordCount;
    wordsPerComment.textContent = round(tempWordCount / comments.length, 1);
}

function decodeHTML(html) {
    let txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function countWords(str) {
    // Use regular expression to replace things we don't want
    // counted as words with empty spaces, then extract all non-whitespace sequences
    str = str.replace(/[.,?!()<>{}[\]/\\+=~'`|:;0-9-_]/g, '');
    console.log(str);
    let exp = /\S+/ig;
    let tmp, words = 0;
    while ((tmp = exp.exec(str)) != null) {
        words++;
    }

    return words;
}