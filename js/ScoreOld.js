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
//let baseLevel = document.getElementById('base-level');
let maxStatsLabelNew = document.getElementById('max-stats-label-new');
let maxStats = document.getElementById('max-stats');
let maxScore = document.getElementById('max-score')
// Results
let score = document.getElementById('score');
let manualScore = document.getElementById('manual-score');
let earnedStats = document.getElementById('earned-stats');
let earnedSplit = document.getElementById('earned-split');
let newStats = document.getElementById('new-stats');
let earnedReserve = document.getElementById('earned-reserve-stats');
let totalReserve = document.getElementById('reserve-stats');
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
let modprocessingComments = false;
let filteringComments = false;
let filterIndex = 0;
let maxNewStats = 0;
let tempWordCount = 0, playerWordCount = 0, npcWordCount = 0;
let commentsLoaded = 0,  modcommentsLoaded = 0;
let commentsRemoved = false;
let posts = [], modlinks = [], donelinks = [];
let str,stm,spd,dex,will,currentReserveScore,stri;
//let dlIndex = 0;

// Event Listeners
//fetchBtn.addEventListener("click", fetchComments);
removeBtn.addEventListener("click", removeComments);
fetchBtn.addEventListener('click', () => {
    usernameHeader.textContent = username.value;
    fetchBtn.disabled = true;
    fetchUserStats();
});
window.addEventListener('load', winLoad);
maxStats.addEventListener('change', calculateMaxStats);

// Window Load Function
function winLoad() {
    timerInit();
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
            if (currentTime.getUTCMonth() === 0) {
                month = 12;
                year = currentTime.getUTCFullYear() - 1;
            } else {
                month = (`0${currentTime.getUTCMonth()}`).slice(-2);
            }
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
function fetchMaxStats() {

    // GET PAGE ID FROM HERE WHEN PUBLISHED
    // https://spreadsheets.google.com/feeds/cells/SHEET_ID/od6/public/full?alt=json
    
    // OFFICIAL STAT SHEET
    let sheetID = "11DBV69f-U9T1EXbdI_AvjHpp7XzSs38fH9eKqdx2sUw";
    // JOEY'S SHEET FOR DEBUGGING
    //let sheetID = "10bBzQNryutYgx49QEb2Vz19alL55lS_hEJ-FrJTOIFE";
    let url = `https://spreadsheets.google.com/feeds/list/${sheetID}/2/public/full?alt=json`;

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
                str="gsx$fort"+new Date(endDate.value).toUTCString().substr(5,11).replace(" ","").replace(" ","").toLowerCase();
                let data = JSON.parse(request.response).feed.entry;
                //console.log(str);
                //console.log(data);
                if (data[0][str]) {
                    let max = Number(data[0][str]["$t"])
                    /*findIndex((e) => {
                        return (e.gsx$racialboost.$t.localeCompare(username.value, 'en', {sensitivity: 'base'}) === 0)
                    });*/
                    if (max) {
                        maxStats.valueAsNumber = max;
                        calculateMaxStats();
                        return;
                    }
                } else {
                    logError(maxErrorMsg, "If the end date is not set to the 1st or 15th of a month, the max stats must be manually set. Please make sure the value is correct.");
                }
            }
            else {
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

function calculateMaxStats() {
    let calc = {newBase: 0};
    //let tempBase =  baseLevel.selectedIndex;
    //do {
        //calc = calculate(maxStats.valueAsNumber, 50, true, tempBase);
        calc = calculate(maxStats.valueAsNumber, maxStats.valueAsNumber, maxScore.valueAsNumber, maxScore.valueAsNumber)
        /*
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
    } else 
    */
    {
        maxNewStats = calc.newStats;
        maxStatsLabelNew.textContent = maxNewStats;
    }
    if(!username.value)
        {
            changeStartingStats();
        }
}

// Change starting Stats based on base
function changeStartingStats() {
    currentStats.value = (50+Math.floor((maxStats.valueAsNumber-50)/100)*25)
}
// Automatically fetch the max stats from the stats sheet


// Attempt to fetch user's stats when a new username is entered
function fetchUserStats(chain=true) {
    // Remove stats error because we're getting a new username and new stats
    statsErrorMsg.classList.remove('show');

    // Reset individual stats
    str = stm = spd = dex = will = currentReserveScore = null;

    // GET PAGE ID FROM HERE WHEN PUBLISHED
    // https://spreadsheets.google.com/feeds/cells/SHEET_ID/od6/public/full?alt=json
    let sheetID = "11DBV69f-U9T1EXbdI_AvjHpp7XzSs38fH9eKqdx2sUw";

    let url = `https://spreadsheets.google.com/feeds/list/${sheetID}/2/public/full?alt=json`;
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
                stri="gsx$fort"+new Date(endDate.value).toUTCString().substr(5,11).replace(" ","").replace(" ","").toLowerCase();
                let data = JSON.parse(request.response).feed.entry;
                let entry = data.findIndex((e) => {
                    return (e.gsx$racialboost.$t.localeCompare(username.value, 'en', {sensitivity: 'base'}) === 0)
                });
                //console.log(data[entry])
                if (entry) {
                    if(data[0][stri])
                        {
                            stm=getRowTotalUptoDate(data[entry+1],stri);
                            str=getRowTotalUptoDate(data[entry+2],stri);
                            spd=getRowTotalUptoDate(data[entry+3],stri);
                            dex=getRowTotalUptoDate(data[entry+4],stri);
                            will=getRowTotalUptoDate(data[entry+5],stri);
                            currentReserveScore=getRowTotalUptoDate(data[entry+6],stri)
                            currentStats.value = stm + str + spd + dex + will;
                        }
                    else
                    {
                        currentStats.value = Number(data[entry].gsx$currentstats.$t);(50+Math.floor((maxStats.valueAsNumber-50)/100)*25)
                        stm=Number(data[entry+1].gsx$currentstats.$t);
                        str=Number(data[entry+2].gsx$currentstats.$t);
                        spd=Number(data[entry+3].gsx$currentstats.$t);
                        dex=Number(data[entry+4].gsx$currentstats.$t);
                        will=Number(data[entry+5].gsx$currentstats.$t);
                        currentReserveScore=Number(data[entry+6].gsx$currentstats.$t);
                    }
                    
                    if(chain)
                        {
                            fetchComments();
                        }
                    else
                        {
                            return
                        }

                } else {
                    logError(statsErrorMsg, "Error Fetching User's Stats. Check spelling or enter stats manually");
                    currentStats.value = (50+Math.floor((maxStats.valueAsNumber-50)/100)*25)
                    if(chain)
                        {
                            fetchComments();
                        }
                    else
                        {
                            return
                        }

                    //fetchBtn.disabled = false;
                }
                //return;
            } else {
                logError(statsErrorMsg, "Error Fetching User's Stats from Google");
                currentStats.value = (50+Math.floor((maxStats.valueAsNumber-50)/100)*25)
                    if(chain)
                        {
                            fetchComments();
                        }
                    else
                        {
                            return
                        }

                //fetchBtn.disabled = false;
                //return;
            }
        }
    }
    request.onabort = function() {
        logError(statsErrorMsg, "Fetching User's Stats Aborted");
        currentStats.value = (50+Math.floor((maxStats.valueAsNumber-50)/100)*25)
                    if(chain)
                        {
                            fetchComments();
                        }
                    else
                        {
                            return
                        }

        //calculateMaxStats();
        //fetchBtn.disabled = false;
        //return;
    }

    request.onerror = function() {
        logError(statsErrorMsg, "Error Fetching User's Stats from Google");
        console.log(`Error ${request.status}: ${request.statusText}`);
        currentStats.value = (50+Math.floor((maxStats.valueAsNumber-50)/100)*25)
                    if(chain)
                        {
                            fetchComments();
                        }
                    else
                        {
                            return
                        }

        //calculateMaxStats();
        //fetchBtn.disabled = false;
        //return;
    }
}

function updateCalcValues(calc) {
    calculateMaxStats();
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
        fetchMaxStats();
        fetchUserStats(false);
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
    if(manualScore.valueAsNumber > maxScore.valueAsNumber)
        {
            manualScore.valueAsNumber = maxScore.valueAsNumber;
            score.textContent = manualScore.value
        }
    //updateCalcValues(calculate(currentStats.valueAsNumber, manualScore.valueAsNumber));
    updateCalcValues(calculate(currentStats.valueAsNumber, maxStats.valueAsNumber,  manualScore.valueAsNumber, maxScore.valueAsNumber));
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
    npcWordCount = 0;
    playerWordCount = 0;
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

function fetchModLinks()
{
    // Clear global variables
    var plink
    modlinks =[]
    modcommentsLoaded = 0;
    //dlIndex = 0;
    //modtempWordCount = 0;
    
    let index = ""
    let x=0
    let sheetID = "1cJTwl83F0EYOPiRztLb0ENWbv-J4_jaXzBLnPZjkR94";

    let url = `https://spreadsheets.google.com/feeds/list/${sheetID}/1/public/full?alt=json`;

    let request = new XMLHttpRequest();
    
    request.ontimeout = () => {
        logError(statsErrorMsg, `Error - Timed Out while fetching NPC Links.`);
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
                let data = JSON.parse(request.response).feed.entry;
                for(var i=0;i<data.length;i++)
                    {
                        if(data[i].gsx$username.$t.toLocaleLowerCase()==document.getElementById("username").value.toLocaleLowerCase())
                            {
                                //modlinks[x]={link:data[i].gsx$commentlink.$t,isLastLink:false};
                                plink=data[i].gsx$commentlink.$t.toString().split('.com')[1].split('?')[0].toLocaleLowerCase();
                                if(plink.charAt(plink.length-1)!='/')
                                    {
                                        plink+="/"
                                    }
                                modlinks[x]=plink;
                                x++;
                            }
                    }
                if(modlinks.length==0)
                    {
                        //posts[posts.length-1].isLastLink = true;
                        displayPosts();
                    }
                else
                    {
                        //modlinks[modlinks.length-1].isLastLink=true;
                        fetchModComments();
                    }
                
            } else {
                logError(statsErrorMsg, "Error Fetching NPC Links from Google");
                fetchBtn.disabled = false;
                return;
            }
        }
    }
    
    request.onabort = function() {
        logError(statsErrorMsg, "Fetching NPC Links Aborted");
        calculateMaxStats();
        fetchBtn.disabled = false;
        return;
    }

    request.onerror = function() {
        logError(statsErrorMsg, "Error Fetching NPC Links from Google");
        console.log(`Error ${request.status}: ${request.statusText}`);
        calculateMaxStats();
        fetchBtn.disabled = false;
        return;
    }
}

function fetchModComments()
{
    let url = `https://api.reddit.com/user/NPC-senpai/comments/.json`;
    query(url, fetchBtn, fetchErrorMsg, modfetch);
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

function modfetch(response)
{
    modcommentsLoaded++;
    modprocessingComments = true;
    queryStatus.textContent = 'Processing';
    modprocessComments(response);
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

function getRowTotalUptoDate(row,date)
{
    var res=0;
    for(var cell in row)
        {
            
            if(cell==date)
                {
                    break;
                }
            if(!(cell.startsWith("gsx$fort")||(cell=="gsx$originalstats")))
                {
                    continue;
                }
            res+=Number(row[cell]["$t"]);
        }
    return res;
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
        post.edited = data.children[comment].data.edited;
        post.NPC = false
        //post.isLastLink = false;
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
        //fetchBtn.disabled = false;
        //queryStatus.textContent = 'Complete';
        //commentCount.textContent = posts.length;
        fetchModLinks();
        //displayPosts();
    }
}

function modprocessComments(response) {
    let data = response.data;
    for (let comment in data.children) {
        // Make sure comment is not older than start date
        // If it is, end processing
        if (data.children[comment].data.created_utc < (startDate.valueAsNumber / 1000) + 43200) {
            if (data.children[comment].data.pinned === true) {
                continue;
            } else {
                modprocessingComments = false;
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
        for(var i=0;i<modlinks.length;i++)
            {
                /*
                var doneFlag = false;
                for(var j=0;j<donelinks.length;j++)
                    {
                        if(donelinks[j]==modlinks[i])
                            {
                                doneFlag=true;
                                break;
                            }
                    }
                if(doneFlag)
                    {
                        continue;
                    }
                */
                if(modlinks[i]==data.children[comment].data.permalink.toLocaleLowerCase())
                    {
                        //donelinks[dlIndex]=modlinks[i]
                        //dlIndex++;
                        // Any comment that makes it this far is assumed to be
                        // from the correct subreddit in the correct timeframe.
                        // Now it will be added to the posts array
                        let post = {};
                        post.postedTo = data.children[comment].data.link_title;
                        post.postedToLink = data.children[comment].data.permalink;
                        post.body = data.children[comment].data.body_html;
                        post.id = data.children[comment].data.id;
                        post.date = data.children[comment].data.created_utc;
                        post.edited = data.children[comment].data.edited;
                        post.NPC = true
                        //post.isLastLink = false;
                        posts.push(post);
                    }
            }
    }

    if (modprocessingComments && modcommentsLoaded < 1000 && data.after != null) {
        let url = `https://api.reddit.com/user/NPC-senpai/comments/.json?limit=${QUERY_LIMIT}&?&after=${data.after}`;
        //console.log(url);
        query(url, fetchBtn, fetchErrorMsg, modfetch);
    } else {
        if (modcommentsLoaded >= 1000) {
            logError(fetchErrorMsg, `Max Comments Loaded - Due to limitations set by Reddit, only the last 1000 comments from a user can be loaded`);
        }

        displayPosts();
    }
}
/*
function modprocessComments(response, isLastLink)
{
    let skipFlag=false
    let comment = response[1].data.children[0].data;
    
    if (comment.created_utc < (startDate.valueAsNumber / 1000) + 43200) {
        skipFlag=true;
        //Commented out since mods may not post links in the right order
        }

        // Check if comment was made in the correct subreddit
        // and if it was made later than end-date
        // if so, continue to next comment
        if (comment.created_utc > (endDate.valueAsNumber / 1000) + 43200) {
            skipFlag=true;
        }

        if (comment.subreddit.localeCompare(subreddit.value, 'en', {sensitivity: 'base'}) !== 0) {
            if (subreddit.value.localeCompare('StrawHatRPG', 'en', {sensitivity: 'base'}) === 0) {
                // If the subreddit is set to StrawHatRPG, then it checks if the comment was made in
                // any of the subs within the StrawHatRPG Community
                if (comment.subreddit.localeCompare('StrawHatRPGShops', 'en', {sensitivity: 'base'}) !== 0) {
                    skipFlag=true;
                } 
            } else {
                skipFlag=true;
            }
        if (comment.author!='NPC-senpai')
            {
                skipFlag=true;
            }
        }
    if(!skipFlag)
        {
            let post = {};
            post.postedTo = response[0].data.children[0].data.title;
            post.postedToLink = comment.permalink;
            post.body = comment.body_html;
            post.id = comment.id;
            post.date = comment.created_utc;
            post.edited = comment.edited;
            post.NPC = true;
            post.isLastLink = isLastLink;
            
            posts.push(post);
            processingComments=false;
        }
    
    if(posts[posts.length-1].isLastLink&&!processingComments)
        {
            console.log(2)
            displayPosts();
        }
}
*/
function displayPosts() {
    /*
    if(!posts[posts.length-1].isLastLink)
        {
            return;
        }
    */
    //Query is Complete
    modprocessingComments=false;
    processingComments=false;
    fetchBtn.disabled = false;
    queryStatus.textContent = 'Complete';
    // Delete all comments from webpage to make room for the new ones
    while (postsCol.lastChild.id !== 'posts-col-header') {
        postsCol.removeChild(postsCol.lastChild);
    }
    // Iterate through posts array
    for (var i=0;i<posts.length;i++) {
        let commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        
        if(posts[i].NPC)
            {
                let commentNPC = document.createElement('h4');
                commentNPC.classList.add('comment-npc');
                commentNPC.innerHTML = 'NPC Reply';
                commentDiv.appendChild(commentNPC);
                commentDiv.style.display = 'none';
            }
        
        let commentTitle = document.createElement('h3');
        commentTitle.classList.add('comment-title');
        commentTitle.innerHTML = `Posted to: <a href="https://www.reddit.com${posts[i].postedToLink}">${posts[i].postedTo}</a>`;
        commentDiv.appendChild(commentTitle);

        let commentDate = document.createElement('h6');
        commentDate.classList.add('comment-date');
        commentDate.innerHTML = `Posted on: <span>${new Date((posts[i].date)*1000).toGMTString()}</span>`;
        if(posts[i].edited > (endDate.valueAsNumber / 1000) + 43200)
            {
                commentDate.innerHTML = `<p style="color: red;font-weight: 800">Edited on ${new Date((posts[i].date)*1000).toGMTString()}<p>`
            }
        commentDiv.appendChild(commentDate);

        let commentBody = document.createElement('div');
        commentBody.classList.add('comment-body');
        commentBody.innerHTML = decodeHTML(posts[i].body);
        commentDiv.appendChild(commentBody);

        postsCol.appendChild(commentDiv);
    }
    calculateWords();
}

function showAllPosts()
{
    for(var i=0;i<postsCol.childElementCount;i++)
        {
            postsCol.children[i].style.display="";
        }
}

function filterPosts() {
    let comments = Array.from(postsCol.querySelectorAll('.comment'));
    // Iterate through posts array
    for (var i=0;i<posts.length;i++) {
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
    var isNPCReply;
    tempWordCount = 0;

    if (posts.length) {
        // Iterate through each comment from postsCol and get word count
        let comments = Array.from(postsCol.querySelectorAll('.comment'));
        let posts = Array.from(postsCol.querySelectorAll('.comment-body'));

        for (var i=0;i<posts.length;i++) {
            isNPCReply=false
            if(comments[i].children[0].innerText=='NPC Reply')
                {
                    isNPCReply=true;
                }
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
                    if(isNPCReply)
                        {
                            tempWordCount += countWords(commentElements[element].textContent)*2/3
                            npcWordCount += countWords(commentElements[element].textContent)
                        }
                    else
                        {
                            tempWordCount += countWords(commentElements[element].textContent);
                            playerWordCount += countWords(commentElements[element].textContent);
                        }
                }
            }
        }
    }
        // Calculate score as soon as word counting is done
        updateScore();

        updateCalcValues(calculate(currentStats.valueAsNumber, maxStats.valueAsNumber, manualScore.valueAsNumber, maxScore.valueAsNumber));
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

const MAX_RESERVE_SCORE = 5;
const MAX_TOTAL_RESERVE = 50;
const WORD_REQUIREMENT = 100;
const TOTAL_WORDS_REQ = 5100;
//const WORDS_PER_POINT = 170;

calcBtn.addEventListener('click', () => {
    //updateCalcValues(calculate(currentStats.valueAsNumber, manualScore.valueAsNumber));
    updateCalcValues(calculate(currentStats.valueAsNumber, maxStats.valueAsNumber, manualScore.valueAsNumber, maxScore.valueAsNumber));
});

function updateScore() {
    var MAX_STAT_SCORE = maxScore.valueAsNumber;
    var MIN_SCORE = maxScore.valueAsNumber*0.40;
    var WORDS_PER_POINT = 5100/(MAX_STAT_SCORE-MIN_SCORE);
    var NORMAL_SCORE_RATE = 5100/30;
    // Get a temporary score by dividing word count by WORDS_PER_POINT
    //tempScore = Math.floor(tempWordCount / WORDS_PER_POINT);
    // If the player has written at least 100 words, they can get the minimum score of 20
    let tempScore = 0;
    let earnedReserveScore = 0;
    if (tempWordCount >= WORD_REQUIREMENT) {
        // Calculate Score
        tempScore = MIN_SCORE + Math.floor(tempWordCount / WORDS_PER_POINT);
        earnedReserveScore = (tempScore - MAX_STAT_SCORE)/(5100/(MAX_STAT_SCORE-MIN_SCORE)/NORMAL_SCORE_RATE);
        // If score is above MAX_STAT_SCORE, set it equal to max score
        if (tempScore > MAX_STAT_SCORE) {
            tempScore = MAX_STAT_SCORE;
        }
        if(earnedReserveScore < 0)
            {
                earnedReserveScore = 0
            }
        if(earnedReserveScore > MAX_RESERVE_SCORE)
            {
                earnedReserveScore = MAX_RESERVE_SCORE;
            }
        if((currentReserveScore + earnedReserveScore) > MAX_TOTAL_RESERVE)
            {
                earnedReserveScore = MAX_TOTAL_RESERVE - currentReserveScore
            }
    } else {
        logError(statsErrorMsg, `Player did not write ${WORD_REQUIREMENT} words, 0 points awarded!`);
        tempScore = 0;
        earnedReserveScore = 0;
    }
    
    score.textContent = tempScore;
    manualScore.value = tempScore;
    earnedReserve.textContent = earnedReserveScore;
    totalReserve.textContent =  currentReserveScore + earnedReserveScore;
}

function calculate(currStats,maxStats,earnedScore=20,maxScore=50)
{
    let returnVal = {
        earnedStats: 0,
        earnedSplit: "",
        newStats: 0,
        //newBase: base
    }
    var currentStatsCopy=currStats;
    var earnedScoreCopy=earnedScore;
    var maxStatsCopy=maxStats;
    var maxScoreCopy=maxScore;
    var baseRate=0.40, boostRate=.16, acceleRate, diffBoostRate;  //Change Base to 0.50 and Boost to 0.20 for previous numbers
    
    var earnedStas;
    var startingStats=(50+Math.floor((maxStats-50)/100)*25)
    if(currStats < startingStats)
        {
            currStats = startingStats;
        }
    if(currStats < maxStats)
        {
            diffBoostRate=(maxStats-currStats)/200
            acceleRate=boostRate*(earnedScoreCopy/maxScore);
        }
    else
        {
            diffBoostRate=0;
            acceleRate=0;
        }
    while(earnedScore>0)
        {
            if(currStats < maxStats)
                {
                    diffBoostRate=(maxStats-currStats)/200
                    acceleRate=boostRate*(earnedScoreCopy/maxScore);
                }
            else
                {
                    diffBoostRate=0;
                    acceleRate=0;
                }
            currStats+=(baseRate + diffBoostRate + acceleRate);
            maxStats+=baseRate;
            if(currStats > maxStats)
                {
                    currStats = maxStats;
                }
            earnedScore--;
        }
    maxStats=maxStatsCopy
    maxScoreCopy=maxScore;
    while(maxScore)
        {
            maxStats+=baseRate;
            maxScore--;
        }
    if(currStats > maxStats)
        {
            currStats = maxStats;
        }
    currStats=Math.round(currStats);
    //maxStats=Math.floor(maxStats);
    earnedStas=currStats-currentStatsCopy;
    
    returnVal.earnedStats=currStats-currentStatsCopy
    if((stm)&&(str)&&(spd)&&(dex)&&(will)&&(stm+str+spd+dex+will==currentStatsCopy))
        {
            returnVal.earnedSplit=`(${Math.round((currentStatsCopy+returnVal.earnedStats) * 0.6-(stm+str+spd))}/${Math.round((currentStatsCopy+returnVal.earnedStats) * 0.4-(dex+will))})`;
        }
    else
    {
        returnVal.earnedSplit = `(${Math.round(earnedStas * 0.6)}/${Math.round(earnedStas * 0.4)})`;
    }
    
    returnVal.newStats = currStats;
    
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
/   CONSOLE FUNCTIONS
/
/
*/


function WhenWillICatchUp(maxStats,startingStats=-1,score=50)
{
    var maxStatCopy=maxStats
    if(startingStats==-1)
        {
            startingStats=(50+Math.floor((maxStats-50)/100)*25)
        } 
    var res1, res2, res3, res4;
    res1 = res2 = res3 = res4 = ""
    while (startingStats<maxStats)
        {
            if((startingStats>=maxStats*.50)&&res1=="")
                {
                    res1="50%: "+(maxStats-maxStatCopy)/20+" Forts | "+startingStats+" / "+maxStats+ "\n"
                }
            if((startingStats>=maxStats*.75)&&res2=="")
                {
                    res2="75%: "+(maxStats-maxStatCopy)/20+" Forts | "+startingStats+" / "+maxStats+ "\n"
                }
            if((startingStats>=maxStats*.95)&&res3=="")
                {
                    res3="95%: "+(maxStats-maxStatCopy)/20+" Forts | "+startingStats+" / "+maxStats+ "\n"
                }
            startingStats=calculate(startingStats,maxStats,score,50).newStats;
            maxStats=calculate(maxStats,maxStats,50,50).newStats;
            if(maxStats>2500)
                {
                    res4+="100%: >2500 Stats"
                    return res1+res2+res3+res4;
                }
        }
    res4+="100%: "+(maxStats-maxStatCopy)/20+" Forts | "+startingStats+" / "+maxStats+ "\n";
    return res1+res2+res3+res4;
}



function getFortResults(number=50)
{
    let eachResult
    let result=[]
    let sheetID = "11DBV69f-U9T1EXbdI_AvjHpp7XzSs38fH9eKqdx2sUw";
    // JOEY'S SHEET FOR DEBUGGING
    //let sheetID = "10bBzQNryutYgx49QEb2Vz19alL55lS_hEJ-FrJTOIFE";
    let url = `https://spreadsheets.google.com/feeds/list/${sheetID}/1/public/full?alt=json`;

    let request = new XMLHttpRequest();
    
    request.ontimeout = () => {
        logError(statsErrorMsg, `Error - Timed Out while getting Fort Results. Please manually do so manually.`);
    };

    request.open('GET', url);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    request.timeout = 5000;

    request.send();
    
    request.onreadystatechange = async function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status === 200) {
                // Good response
                let data = JSON.parse(request.response).feed.entry;
                for(var i=0;i<number;i++)
                    {
                        username.value=data[i]["gsx$username"]["$t"]
                        fetchBtn.click();
                        await sleep(10000);
                        eachResult=username.value+"\t"+score.innerHTML+"\t"+earnedStats.innerHTML+"\tReserve:"+earnedReserve.innerHTML;
                        result[i]=eachResult;
                        /*
                        result[i]={
                                    User: usernames[i],
                                    Score: score.innerHTML,
                                    Split: earnedSplit.innerHTML,
                                    Reserve: earnedReserve.innerHTML,
                                  }
                        */
                        console.log(eachResult)
                    }
                console.log(result)
            }
            else {
                logError(maxErrorMsg, "Error Getting Usernames from Google");
                return;
            }
        }
    }

    
    request.onabort = function() {
        logError(maxErrorMsg, "Get Fort Results Aborted");
        calculateMaxStats();
        return;
    }

    request.onerror = function() {
        logError(maxErrorMsg, "Error Getting Usernames from Google");
        console.log(`Error ${request.status}: ${request.statusText}`);
        return;
    }
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
 *
 * OLD STAT CALCULATIONS AND OLD FUNCTIONS
 * 
 */

/*
function oldfetchUserStats() {
    // Remove stats error because we're getting a new username and new stats
    statsErrorMsg.classList.remove('show');

    // Reset individual stats
    str = stm = spd = dex = will = currentReserveScore = null;

    // GET PAGE ID FROM HERE WHEN PUBLISHED
    // https://spreadsheets.google.com/feeds/cells/SHEET_ID/od6/public/full?alt=json
    let sheetID = "11DBV69f-U9T1EXbdI_AvjHpp7XzSs38fH9eKqdx2sUw";

    let url = `https://spreadsheets.google.com/feeds/list/${sheetID}/2/public/full?alt=json`;
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
                let data = JSON.parse(request.response).feed.entry;
                let entry = data.findIndex((e) => {
                    return (e.gsx$racialboost.$t.localeCompare(username.value, 'en', {sensitivity: 'base'}) === 0)
                });
                if (entry) {
                    currentStats.value = Number(data[entry].gsx$currentstats.$t);
                    stm=Number(data[entry+1].gsx$currentstats.$t);
                    str=Number(data[entry+2].gsx$currentstats.$t);
                    spd=Number(data[entry+3].gsx$currentstats.$t);
                    dex=Number(data[entry+4].gsx$currentstats.$t);
                    will=Number(data[entry+5].gsx$currentstats.$t);
                    currentReserveScore=Number(data[entry+6].gsx$currentstats.$t);
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


function calculateOld(stats, score, getMax = false, base = baseLevel.selectedIndex, max = maxStats.valueAsNumber, maxNew = Number(maxStatsLabelNew.textContent), logErrors = true) {
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
    //let startingStats = 50 * (parseInt(baseLevel.options[base].textContent) + 1);
    startingStats = (50+Math.floor((maxStats.valueAsNumber-50)/100)*25)
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
            if((stm)&&(str)&&(spd)&&(dex)&&(will)&&(stm+str+spd+dex+will==stats))
                {
                    returnVal.earnedSplit=`(${Math.round((stats+returnVal.earnedStats) * 0.6-(stm+str+spd))}/${Math.round((stats+returnVal.earnedStats) * 0.4 - (dex+will))})`;
                }
            else
                {
                    returnVal.earnedSplit = `(${Math.round(returnVal.earnedStats * 0.6)}/${Math.round(returnVal.earnedStats * 0.4)})`;
                }
            returnVal.newStats = stats + returnVal.earnedStats;

            return returnVal;
        }
    }
    
    returnVal.earnedStats = earnedRounded;
    if((stm)&&(str)&&(spd)&&(dex)&&(will)&&(stm+str+spd+dex+will==stats))
        {
            returnVal.earnedSplit=`(${Math.round((stats+returnVal.earnedStats) * 0.6-(stm+str+spd))}/${Math.round((stats+returnVal.earnedStats) * 0.4-(dex+will))})`;
        }
    else
    {
        returnVal.earnedSplit = `(${Math.round(earnedRounded * 0.6)}/${Math.round(earnedRounded * 0.4)})`;
    }
    returnVal.newStats = stats + earnedRounded;
    return returnVal;
}
function catchUp(first, newbie, max = 0) {
    console.log(1)
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
    console.log(1)
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
    console.log(1)
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
    console.log(1)
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
*/
/// END OF OLD STUFF
