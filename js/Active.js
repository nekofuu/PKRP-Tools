// Elements
// Countdown Timer
// Posts collector inputs
let username = document.getElementById('username');
let subreddit = document.getElementById('subreddit');
//let startDate = document.getElementById('start-date');
//let endDate = document.getElementById('end-date');
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
// Results
let activeTillElement = document.getElementById('active-till');
let activeTillDate = document.getElementById('active-till-date');
let inactive = document.getElementById('inactive');
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
fetchBtn.addEventListener("click", reset);
fetchBtn.addEventListener("click", fetchComments);
removeBtn.addEventListener("click", removeComments);
calcBtn.addEventListener("click", checkActive);
username.addEventListener('change', () => {
    usernameHeader.textContent = username.value;
    fetchBtn.disabled = true;
    reset();
    checkActive();
});
window.addEventListener('load', winLoad);
//baseLevel.addEventListener('change', changeStartingStats);

// Window Load Function
function winLoad() {
}

// Initiate the countdown timer and automatically set the start date and end date

//startDate.addEventListener('change', changeDate);

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


function logError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function reset()
{
    while (postsCol.lastChild.id !== 'posts-col-header') {
        postsCol.removeChild(postsCol.lastChild);
    }
    activeTillElement.style.display="none";
    inactive.style.display="none";
    posts = [];
    commentsLoaded = 0;
    tempWordCount = 0;
    commentsRemoved = false;
    filterIndex = 0;
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
    reset();
    
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

        let commentDate = document.createElement('h6');
        commentDate.classList.add('comment-date');
        commentDate.innerHTML = `Posted on: <span>${new Date((posts[i].date)*1000).toGMTString()}</span>`;
        commentDiv.appendChild(commentDate);
        
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
    const ACTIVITY_THRESHOLD = 1000;
    let activeTill="";
    tempWordCount = 0;
    activeTillElement.style.display="none";
    inactive.style.display="none";
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
                if(tempWordCount>=ACTIVITY_THRESHOLD)
                    {
                        activeTill=comments[i].querySelector("span").innerHTML;
                    }
            }
            if(activeTill)
                {
                    //console.log(new Date(new Date(activeTill).valueOf()+2592000000).toGMTString())
                    break;
                }
        }
        
    }
    if(activeTill)
            {
                activeTillElement.style.display="";
                activeTillDate.innerText=new Date(new Date(activeTill).valueOf()+2592000000).toGMTString().substring(5,16);
            }
        else
            {
                inactive.style.display="";
            }
        // Calculate score as soon as word counting is done
        //updateScore();

        //updateCalcValues(calculate(currentStats.valueAsNumber, maxStats.valueAsNumber, manualScore.valueAsNumber, maxScore.valueAsNumber));
        //updateCalcValues(calculate(currentStats.valueAsNumber, manualScore.valueAsNumber));
        //wordCount.textContent = tempWordCount;
        //wordsPerComment.textContent = (tempWordCount / posts.length).toFixed(1);
    //}
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


function checkActive()
{
    let url = `https://api.reddit.com/user/${username.value}/comments/.json`;
    query(url, fetchBtn, fetchErrorMsg, fetch);
}

function fetch(response)
{
    commentsLoaded += response.data.dist;
    processingComments = true;
    queryStatus.textContent = 'Processing';
    let data = response.data;
    //console.log(data);
    for (let comment in data.children) {
        // Make sure comment is not older than 30 Days
        // If it is, end processing
        if (data.children[comment].data.created_utc < (Date.now()/1000 - 2592000)) {
            if (data.children[comment].data.pinned === true) {
                continue;
            } else {
                processingComments = false;
                break;
            }
        }
        // Check if comment was made in the correct subreddit
        // and if it was made later than now (not actually possible)
        // if so, continue to next comment
        if (data.children[comment].data.created_utc > Date.now()) {
            console.log("This is weird");
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
        
        //Check if comment was made in a post by Rewards, Stats, Newscoo or DavyJones
        //if so, continue to next comment
        if(data.children[comment].data.link_author=="Stats-san"||data.children[comment].data.link_author=="Rewards-san"||data.children[comment].data.link_author=="Newscoo-san"||data.children[comment].data.link_author=="DavyJones-san")
            {
                continue;
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
        post.date = data.children[comment].data.created_utc;
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}