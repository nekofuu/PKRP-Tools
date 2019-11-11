// Elements
// Link input
let countBtn = document.getElementById('count-btn');
// Thread Error Msg
let threadErrorMsg = document.getElementById('thread-error-msg')
// Posts Column
let postsCol = document.getElementById('thread-posts-col');
// Total Word Count
let totalWordCount = document.getElementById('word-count');
// Total Comment Count
let totalCommentCount = document.getElementById('comment-count');
//Participants Table
let participantsTable = document.getElementById('participants-table');
// Global Variables
let posts = [];
let filteredAccounts = ["npc-senpai", "npc-san", "rewards-san", "stats-san", "shoppe-san", "davyjones-san", "newscoo-san", "tempnpc", "[deleted]"]
let thread = {}
    
countBtn.addEventListener('click', () => {
    checkThread(document.getElementById("thread-input").value);
});

// Take a link to a thread and count the number of words total in the thread    
function checkThread(link) {
    countBtn.disabled=true;
    thread = {
        link: "",
        words: 0,
        comments: 0,
        participants: {},
        posts: []
    }
    thread.link = link + ".json";

    totalWordCount.textContent = "0";
    totalCommentCount.textContent = "0";
    participantsTable.children[1].innerHTML = "";
    
    query(thread.link, countBtn, threadErrorMsg, processThread);
}
function query(url, btnElement, errorMsgElement, callback) {
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
            let response = {};
            try {
                response = JSON.parse(request.response);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    logError(errorMsgElement, e);
                    btnElement.disabled = false;
                    return false;
                }
            }
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


function processThread(response) {
    let comment = response[1].data.children[0].data;

    let post = {};
    post.html = document.createElement('div');
    post.html.innerHTML = decodeHTML(comment.body_html);
    post.author = comment.author;
    thread.posts.push(post);

    thread.comments++;
    totalCommentCount.textContent = parseInt(totalCommentCount.textContent) + 1;
    
    if (comment.replies !== "") {
        let url = "https://api.reddit.com" + comment.replies.data.children[0].data.permalink + ".json";
        query(url, countBtn, threadErrorMsg, processThread);
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
            let tempWords = 0;
            // Check each element and only count the words within
            // the element if it isn't a blockquote, table, or list
            if (commentElements[element].tagName.toLowerCase() != 'blockquote' &&
                commentElements[element].tagName.toLowerCase() != 'table' &&
                commentElements[element].tagName.toLowerCase() != 'code' &&
                commentElements[element].tagName.toLowerCase() != 'ul' &&
                commentElements[element].tagName.toLowerCase() != 'ol')
            {
                tempWords = countWords(commentElements[element].textContent);
                thread.words += tempWords;
            }

            if (author in thread.participants) {
                thread.participants[author].words += tempWords;
            } else {
                //thread.participants[author] = {};
                //thread.participants[author].name = author;
                //thread.participants[author].words = tempWords;
                //thread.participants[author].comments = 0;
                thread.participants[author] = {
                    name: author,
                    words: tempWords,
                    comments: 0
                }

            }
        }
        thread.participants[author].comments++;
    }
    
    display();
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

function logError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}
function decodeHTML(html) {
    let txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}
function display() {
    // Delete all comments from webpage to make room for the new ones
    while (postsCol.lastChild.id !== 'posts-col-header') {
        postsCol.removeChild(postsCol.lastChild);
    }
    // Iterate through posts array
    for (i in thread.posts) {
        let commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        let commentTitle = document.createElement('h3');
        commentTitle.classList.add('comment-title');
        commentTitle.innerHTML = `Posted by: <a href="https://www.reddit.com/user/${thread.posts[i].author}">${thread.posts[i].author}</a>`;
        commentDiv.appendChild(commentTitle);


        let commentBody = document.createElement('div');
        commentBody.classList.add('comment-body');
        commentBody.innerHTML = decodeHTML(thread.posts[i].html.innerHTML);
        commentDiv.appendChild(commentBody);

        postsCol.appendChild(commentDiv);
    }

    // Iterate through Participants
    for(p in thread.participants) {
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        let wordCell = document.createElement('td');
        let commentCell = document.createElement('td');
        let checkCell = document.createElement('td');

        nameCell.appendChild(document.createTextNode(thread.participants[p].name));
        wordCell.appendChild(document.createTextNode(thread.participants[p].words));
        commentCell.appendChild(document.createTextNode(thread.participants[p].comments));

        let checkBox = document.createElement('input');
        checkBox.setAttribute('type', 'checkbox');
        if (filteredAccounts.indexOf(thread.participants[p].name.toLowerCase()) === -1) {
            checkBox.checked = true;
        }

        checkBox.addEventListener('change', displayResults);

        checkCell.appendChild(checkBox);

        row.appendChild(nameCell);
        row.appendChild(wordCell);
        row.appendChild(commentCell);
        row.appendChild(checkCell);

       participantsTable.children[1].appendChild(row);
    }

    displayResults();
}

function displayResults() {
    countBtn.disabled=true;
    let totalWC = 0

    let tableData = participantsTable.children[1].children;
    // For participant in tableData
    for (let p = 0; p < tableData.length; p++) {
        if(tableData[p].children[3].children[0].checked === true) {
            totalWC += parseInt(tableData[p].children[1].textContent);
        }
    }
    
    totalWordCount.textContent=totalWC;
    countBtn.disabled=false;
}
