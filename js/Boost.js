window.onload = function(){
    mainCalcFunction();
}
var errorFlag;
function fetchUserStats() {
    // Remove stats error because we're getting a new username and new stats
    //statsErrorMsg.classList.remove('show');

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
                    return (e.gsx$racialboost.$t.localeCompare(document.getElementById("username").value, 'en', {sensitivity: 'base'}) === 0)
                });
                if (entry) {
                    //currentStats.value = entry.gsx$totalbasestats.$t;
                    document.getElementById("stamIPF").value=data[entry+1].gsx$currentstats.$t;
                    document.getElementById("stamRIPF").value=data[entry+1].gsx$racialboost.$t;
                    document.getElementById("strIPF").value=data[entry+2].gsx$currentstats.$t;
                    document.getElementById("strRIPF").value=data[entry+2].gsx$racialboost.$t;
                    document.getElementById("spdIPF").value=data[entry+3].gsx$currentstats.$t;
                    document.getElementById("spdRIPF").value=data[entry+3].gsx$racialboost.$t;
                    document.getElementById("dexIPF").value=data[entry+4].gsx$currentstats.$t;
                    document.getElementById("dexRIPF").value=data[entry+4].gsx$racialboost.$t;
                    document.getElementById("willIPF").value=data[entry+5].gsx$currentstats.$t;
                    document.getElementById("willRIPF").value=data[entry+5].gsx$racialboost.$t;
                    document.getElementById("charName").textContent=data[entry].gsx$a.$t;
                    mainCalcFunction();
                } else {
                    logError(statsErrorMsg, "Error Fetching User's Stats. Check spelling or enter stats manually");
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


function mainCalcFunction()
{
    var ipfields=document.getElementsByClassName("IP");
    for(var i=0;i<ipfields.length;i++)
        {
            ipfields[i].addEventListener("change",mainCalcFunction);
            ipfields[i].style.border="";
        }
    
    var errors=document.getElementsByClassName("error-msg");
    var warns=document.getElementsByClassName("warn-msg");
    var MaxTotalBoostLabel=document.getElementsByClassName("maxPercBoost");
    var MaxPhysBoostLabel=document.getElementsByClassName("maxPhysBoost");
    var MaxMentBoostLabel=document.getElementsByClassName("maxMentBoost");
    var MaxFlatLabel=document.getElementsByClassName("maxFlatBoost");
    var MaxTotalFlatLabel=document.getElementsByClassName("maxTotalFlatBoost");
    var MaxStanceBoostLabel=document.getElementsByClassName("maxStanceBoost");
    var MaxStanceFlatBoostLabel=document.getElementsByClassName("maxStanceFlatBoost");
    var stanceFlatBoost=document.getElementsByClassName("stanceFlatBoost");
    var stancePercBoost=document.getElementsByClassName("stancePercBoost");
    var PercBoosts=document.getElementsByClassName("PercBoost");
    var FlatBoosts=document.getElementsByClassName("FlatBoost");
    var newStats=document.getElementsByClassName("new-stats");
    var racestam=document.getElementById("stamRIPF").valueAsNumber;
    var basestam=document.getElementById("stamIPF").valueAsNumber;
    var tempstamBoost=document.getElementById("stamTempBoostIPF").valueAsNumber;
    var stancestamPerc=document.getElementById("stamStancesPIPF").valueAsNumber;
    var stancestamFlat=document.getElementById("stamStancesFIPF").valueAsNumber;
    var otherstamBoost=document.getElementById("stamTempFlatBoostIPF").valueAsNumber;
    var otherstamLoss=document.getElementById("stamTempFlatLossIPF").valueAsNumber;
    var racestr=document.getElementById("strRIPF").valueAsNumber;
    var basestr=document.getElementById("strIPF").valueAsNumber;
    var tempstrBoost=document.getElementById("strTempBoostIPF").valueAsNumber;
    var stancestrPerc=document.getElementById("strStancesPIPF").valueAsNumber;
    var stancestrFlat=document.getElementById("strStancesFIPF").valueAsNumber;
    var otherstrBoost=document.getElementById("strTempFlatBoostIPF").valueAsNumber;
    var otherstrLoss=document.getElementById("strTempFlatLossIPF").valueAsNumber;
    var racespd=document.getElementById("spdRIPF").valueAsNumber;
    var basespd=document.getElementById("spdIPF").valueAsNumber;
    var tempspdBoost=document.getElementById("spdTempBoostIPF").valueAsNumber;
    var stancespdPerc=document.getElementById("spdStancesPIPF").valueAsNumber;
    var stancespdFlat=document.getElementById("spdStancesFIPF").valueAsNumber;
    var otherspdBoost=document.getElementById("spdTempFlatBoostIPF").valueAsNumber;
    var otherspdLoss=document.getElementById("spdTempFlatLossIPF").valueAsNumber;
    var racedex=document.getElementById("dexRIPF").valueAsNumber;
    var basedex=document.getElementById("dexIPF").valueAsNumber;
    var tempdexBoost=document.getElementById("dexTempBoostIPF").valueAsNumber;
    var stancedexPerc=document.getElementById("dexStancesPIPF").valueAsNumber;
    var stancedexFlat=document.getElementById("dexStancesFIPF").valueAsNumber; 
    var otherdexBoost=document.getElementById("dexTempFlatBoostIPF").valueAsNumber;
    var otherdexLoss=document.getElementById("dexTempFlatLossIPF").valueAsNumber;
    var racewill=document.getElementById("willRIPF").valueAsNumber;
    var basewill=document.getElementById("willIPF").valueAsNumber;
    var tempwillBoost=document.getElementById("willTempBoostIPF").valueAsNumber;
    var stancewillPerc=document.getElementById("willStancesPIPF").valueAsNumber;
    var stancewillFlat=document.getElementById("willStancesFIPF").valueAsNumber;
    var otherwillBoost=document.getElementById("willTempFlatBoostIPF").valueAsNumber;
    var otherwillLoss=document.getElementById("willTempFlatLossIPF").valueAsNumber;
    var stancePerkLevel=document.getElementById("StancePerk").value;
    //var maxBoosterPerk=document.getElementById("MaxModifier").value;
    var strongWill=document.getElementById("StrongWillIPF").checked;
    var maxRacialBoost=30,maxStanceBoost,maxStanceFlatBoost;
    var maxTotalBoost=100,maxBaseStatAmt=500, maxStatFlatBoost=60, maxTotalFlatBoost=100;
    var maxPhysStatBoost=60, maxBoostPhysStatAmt=675, maxMentStatBoost=60, maxBoostMentStatAmt=675, minStatAmt=0;
    var maxStancePercBoost,statLossReduction,totalRaceBoost,actualStancePercBoost=0,actualStanceFlatBoost=0,properFlatStanceLoss,properPercStanceLoss,actualFlatStanceLoss=0,actualPercStanceLoss=0,totalBoost, totalFlatBoost=0;
    var totalStamBoost=0, totalStamFlatBoost=0;
    var totalStrBoost=0, totalStrFlatBoost=0;
    var totalSpdBoost=0, totalSpdFlatBoost=0;
    var totalDexBoost=0, totalDexFlatBoost=0;
    var totalWillBoost=0, totalWillFlatBoost=0;
    var racebasestam,racebasestr,racebasespd,racebasedex,racebasewill,finalstam,finalstr,finalspd,finaldex,finalwill,finaltotal;
    var i,overflow=.25; //Initializing
    var boosts=document.getElementsByClassName("Boost");
    var raceBoost=document.getElementsByClassName("raceBoost");
    var stamPercBoost=document.getElementsByClassName("stamPercBoost");
    var strPercBoost=document.getElementsByClassName("strPercBoost");
    var spdPercBoost=document.getElementsByClassName("spdPercBoost");
    var dexPercBoost=document.getElementsByClassName("dexPercBoost");
    var willPercBoost=document.getElementsByClassName("willPercBoost");
    var stamFlatBoost=document.getElementsByClassName("stamFlatBoost");
    var strFlatBoost=document.getElementsByClassName("strFlatBoost");
    var spdFlatBoost=document.getElementsByClassName("spdFlatBoost");
    var dexFlatBoost=document.getElementsByClassName("dexFlatBoost");
    var willFlatBoost=document.getElementsByClassName("willFlatBoost");
    
    var stanceBoost=document.getElementsByClassName("stanceBoost"); //Creating Variables/Array Pointers to use in case boosts exceed caps
    var stanceLossP=document.getElementsByClassName("stanceLossPerc");
    var stanceLossF=document.getElementsByClassName("stanceLossFlat");
    
    for(i=0;i<errors.length;i++)
        {
            errors[i].style.display="none";  //Hide Errors by Default
        }
    for(i=0;i<warns.length;i++)
        {
            warns[i].style.display="none";  //Hide Warns by Default
        }
    for(i=0;i<newStats.length;i++)
        {
            newStats[i].style.color=""; //Unhighlight Final Stats
        }
    for(i=0;i<MaxTotalBoostLabel.length;i++)
        {
            MaxTotalBoostLabel[i].textContent=maxTotalBoost;
        }
    for(i=0;i<MaxPhysBoostLabel.length;i++)
        {
            MaxPhysBoostLabel[i].textContent=maxPhysStatBoost;
        }
    for(i=0;i<MaxMentBoostLabel.length;i++)
        {
            MaxMentBoostLabel[i].textContent=maxMentStatBoost;
        }
    for(i=0;i<MaxFlatLabel.length;i++)
        {
            MaxFlatLabel[i].textContent=maxStatFlatBoost;
        }
    for(i=0;i<MaxTotalFlatLabel.length;i++)
        {
            MaxTotalFlatLabel[i].textContent=maxTotalFlatBoost;
        }
    switch(stancePerkLevel)
        {
            case '0':statLossReduction=0;maxStanceFlatBoost=0;break;
            case '1':statLossReduction=25;maxStanceFlatBoost=5;break;
            case '2':statLossReduction=50;maxStanceFlatBoost=10;break;
            case '3':statLossReduction=75;maxStanceFlatBoost=15;break;  
                
            default:statLossReduction=0;break;
        }
    if(!Number(stancePerkLevel))
        {
            document.getElementById("stamStancesFIPF").value=0;
            document.getElementById("strStancesFIPF").value=0;
            document.getElementById("spdStancesFIPF").value=0;
            document.getElementById("dexStancesFIPF").value=0;
            document.getElementById("willStancesFIPF").value=0;
            stancestamFlat=0;
            stancestrFlat=0;
            stancespdFlat=0;
            stancedexFlat=0;
            stancewillFlat=0;
            document.getElementById("stamStancesFIPF").disabled=true;
            document.getElementById("strStancesFIPF").disabled=true;
            document.getElementById("spdStancesFIPF").disabled=true;
            document.getElementById("dexStancesFIPF").disabled=true;
            document.getElementById("willStancesFIPF").disabled=true;
        }
    else
        {
            document.getElementById("stamStancesFIPF").disabled=false;
            document.getElementById("strStancesFIPF").disabled=false;
            document.getElementById("spdStancesFIPF").disabled=false;
        }
    if(!strongWill)
        {
            maxStancePercBoost=20;
            document.getElementById("dexStancesPIPF").value=0;
            document.getElementById("willStancesPIPF").value=0; 
            document.getElementById("dexStancesFIPF").value=0;
            document.getElementById("willStancesFIPF").value=0;
            stancedexBoost=0;
            stancewillBoost=0;
            stancedexFlat=0;
            stancewillFlat=0;
            document.getElementById("dexStancesPIPF").disabled=true;
            document.getElementById("willStancesPIPF").disabled=true;
            document.getElementById("dexStancesFIPF").disabled=true;
            document.getElementById("willStancesFIPF").disabled=true; //Disable Mental from Stances by default and Max to 10
        }
    else
        {
            maxStancePercBoost=40;
            document.getElementById("dexStancesPIPF").disabled=false;
            document.getElementById("willStancesPIPF").disabled=false;
            if(!Number(stancePerkLevel))
                {
                    
                }
            else
                {   
                    document.getElementById("dexStancesFIPF").disabled=false;
                    document.getElementById("willStancesFIPF").disabled=false;
                }
        }
    
    for(i=0;i<MaxStanceBoostLabel.length;i++)
        {
            MaxStanceBoostLabel[i].textContent=maxStancePercBoost;
        }
    for(i=0;i<MaxStanceFlatBoostLabel.length;i++)
        {
            MaxStanceFlatBoostLabel[i].textContent=maxStanceFlatBoost;
        }
    document.getElementById("LossRedIPF").value=statLossReduction; //set StatLossReduction based on Perk Level
    
    
            //Check and Correct Base Stats, Race, Temp Boost, Stance Boost Fields before doing the other checks
            basestam=check(basestam,maxBaseStatAmt);
            if(errorFlag)
                {
                    document.getElementById("stamIPF").value=maxBaseStatAmt;
                    errorFlag=false;
                }
            basestr=check(basestr,maxBaseStatAmt);
            if(errorFlag)
                {
                    document.getElementById("strIPF").value=maxBaseStatAmt;
                    errorFlag=false;
                }
            basespd=check(basespd,maxBaseStatAmt);
            if(errorFlag)
                {
                    document.getElementById("spdIPF").value=maxBaseStatAmt;
                    errorFlag=false;
                }
            basedex=check(basedex,maxBaseStatAmt);
            if(errorFlag)
                {
                    document.getElementById("dexIPF").value=maxBaseStatAmt;
                    errorFlag=false;
                }
            basewill=check(basewill,maxBaseStatAmt);
            if(errorFlag)
                {
                    document.getElementById("willIPF").value=maxBaseStatAmt;
                    errorFlag=false;
                }
    
            racestam=check(racestam,maxRacialBoost);
            if(errorFlag)
                {
                    document.getElementById("stamRIPF").value=maxRacialBoost;
                    errorFlag=false;
                }
            racestr=check(racestr,40);
            if(errorFlag)
                {
                    document.getElementById("strRIPF").value=40;
                    errorFlag=false;
                }
            racespd=check(racespd,maxRacialBoost);
            if(errorFlag)
                {
                    document.getElementById("spdRIPF").value=maxRacialBoost;
                    errorFlag=false;
                }
            racedex=check(racedex,maxRacialBoost);
            if(errorFlag)
                {
                    document.getElementById("dexRIPF").value=maxRacialBoost;
                    errorFlag=false;
                }
            racewill=check(racewill,maxRacialBoost);
            if(errorFlag)
                {
                    document.getElementById("willRIPF").value=maxRacialBoost;
                    errorFlag=false;
                }
    
            tempstamBoost=check(tempstamBoost,maxTotalBoost);
            if(errorFlag)
                {
                    document.getElementById("stamTempBoostIPF").value=maxTotalBoost;
                    errorFlag=false;
                }
            tempstrBoost=check(tempstrBoost,maxTotalBoost);
            if(errorFlag)
                {
                    document.getElementById("strTempBoostIPF").value=maxTotalBoost;
                    errorFlag=false;
                }
            tempspdBoost=check(tempspdBoost,maxTotalBoost);
            if(errorFlag)
                {
                    document.getElementById("spdTempBoostIPF").value=maxTotalBoost;
                    errorFlag=false;
                }
            tempdexBoost=check(tempdexBoost,maxTotalBoost);
            if(errorFlag)
                {
                    document.getElementById("dexTempBoostIPF").value=maxTotalBoost;
                    errorFlag=false;
                }
            tempwillBoost=check(tempwillBoost,maxTotalBoost);
            if(errorFlag)
                {
                    document.getElementById("willTempBoostIPF").value=maxTotalBoost;
                    errorFlag=false;
                }
    
            otherstamBoost=check(otherstamBoost,maxTotalFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("stamTempFlatBoostIPF").value=maxTotalFlatBoost;
                    errorFlag=false;
                }
            otherstrBoost=check(otherstrBoost,maxTotalFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("strTempFlatBoostIPF").value=maxTotalFlatBoost;
                    errorFlag=false;
                }
            otherspdBoost=check(otherspdBoost,maxTotalFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("spdTempFlatBoostIPF").value=maxTotalFlatBoost;
                    errorFlag=false;
                }
            otherdexBoost=check(otherdexBoost,maxTotalFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("dexTempFlatBoostIPF").value=maxTotalFlatBoost;
                    errorFlag=false;
                }
            otherwillBoost=check(otherwillBoost,maxTotalFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("willTempFlatBoostIPF").value=maxTotalFlatBoost;
                    errorFlag=false;
                }
    
            stancestamPerc=check(stancestamPerc,maxStancePercBoost)
            if(errorFlag)
                {
                    document.getElementById("stamStancesPIPF").value=maxStancePercBoost;
                    errorFlag=false;
                }
            stancestrPerc=check(stancestrPerc,maxStancePercBoost)
            if(errorFlag)
                {
                    document.getElementById("strStancesPIPF").value=maxStancePercBoost;
                    errorFlag=false;
                }
            stancespdPerc=check(stancespdPerc,maxStancePercBoost)
            if(errorFlag)
                {
                    document.getElementById("spdStancesPIPF").value=maxStancePercBoost;
                    errorFlag=false;
                }
            stancedexPerc=check(stancedexPerc,maxStancePercBoost)
            if(errorFlag)
                {
                    document.getElementById("dexStancesPIPF").value=maxStancePercBoost;
                    errorFlag=false;
                }
            stancewillPerc=check(stancewillPerc,maxStancePercBoost)
            if(errorFlag)
                {
                    document.getElementById("willStancesPIPF").value=maxStancePercBoost;
                    errorFlag=false;
                }
    
            stancestamFlat=check(stancestamFlat,maxStanceFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("stamStancesFIPF").value=maxStanceFlatBoost;
                    errorFlag=false;
                }
            stancestrFlat=check(stancestrFlat,maxStanceFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("strStancesFIPF").value=maxStanceFlatBoost;
                    errorFlag=false;
                }
            stancespdFlat=check(stancespdFlat,maxStanceFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("spdStancesFIPF").value=maxStanceFlatBoost;
                    errorFlag=false;
                }
            stancedexFlat=check(stancedexFlat,maxStanceFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("dexStancesFIPF").value=maxStanceFlatBoost;
                    errorFlag=false;
                }
            stancewillFlat=check(stancewillFlat,maxStanceFlatBoost)
            if(errorFlag)
                {
                    document.getElementById("willStancesFIPF").value=maxStanceFlatBoost;
                    errorFlag=false;
                }
    
            if(stancestamPerc > 0 || stancestamFlat > 0)
                {
                    stancestamPerc=checkRev(stancestamPerc,0);
                    if(errorFlag)
                        {
                            document.getElementById("stamStancesPIPF").value=0;
                            errorFlag=false;
                        }
                    stancestamFlat=checkRev(stancestamFlat,0);
                    if(errorFlag)
                        {
                            document.getElementById("stamStancesFIPF").value=0;
                            errorFlag=false;
                        }
                }
            if(stancestrPerc > 0 || stancestrFlat > 0)
                {
                    stancestrPerc=checkRev(stancestrPerc,0);
                    if(errorFlag)
                        {
                            document.getElementById("strStancesPIPF").value=0;
                            errorFlag=false;
                        }
                    stancestrFlat=checkRev(stancestrFlat,0);
                    if(errorFlag)
                        {
                            document.getElementById("strStancesFIPF").value=0;
                            errorFlag=false;
                        }
                }
            if(stancespdPerc > 0 || stancespdFlat > 0)
                {
                    stancespdPerc=checkRev(stancespdPerc,0);
                    if(errorFlag)
                        {
                            document.getElementById("spdStancesPIPF").value=0;
                            errorFlag=false;
                        }
                    stancespdFlat=checkRev(stancespdFlat,0);
                    if(errorFlag)
                        {
                            document.getElementById("spdStancesFIPF").value=0;
                            errorFlag=false;
                        }
                }
            if(stancedexPerc > 0 || stancedexFlat > 0)
                {
                    stancedexPerc=checkRev(stancedexPerc,0);
                    if(errorFlag)
                        {
                            document.getElementById("dexStancesPIPF").value=0;
                            errorFlag=false;
                        }
                    stancedexFlat=checkRev(stancedexFlat,0);
                    if(errorFlag)
                        {
                            document.getElementById("dexStancesFIPF").value=0;
                            errorFlag=false;
                        }
                }
            if(stancewillPerc > 0 || stancewillFlat > 0)
                {
                    stancewillPerc=checkRev(stancewillPerc,0);
                    if(errorFlag)
                        {
                            document.getElementById("willStancesPIPF").value=0;
                            errorFlag=false;
                        }
                    stancewillFlat=checkRev(stancewillFlat,0);
                    if(errorFlag)
                        {
                            document.getElementById("willStancesFIPF").value=0;
                            errorFlag=false;
                        }
                }
        
            netStanceBoost=(stancestamPerc+stancestrPerc+stancespdPerc+stancedexPerc+stancewillPerc);
            netStanceFlatBoost=(stancestamFlat+stancestrFlat+stancespdFlat+stancedexFlat+stancewillFlat);
            if(stancestamPerc>0) {actualStancePercBoost+=stancestamPerc;} totalStamBoost+=stancestamPerc;
            if(stancestrPerc>0) {actualStancePercBoost+=stancestrPerc;} totalStrBoost+=stancestrPerc;
            if(stancespdPerc>0) {actualStancePercBoost+=stancespdPerc;} totalSpdBoost+=stancespdPerc;
            if(stancedexPerc>0) {actualStancePercBoost+=stancedexPerc;} totalDexBoost+=stancedexPerc;
            if(stancewillPerc>0) {actualStancePercBoost+=stancewillPerc;} totalWillBoost+=stancewillPerc;
    
            if(stancestamFlat>0) {actualStanceFlatBoost+=stancestamFlat;} totalStamFlatBoost+=stancestamFlat;
            if(stancestrFlat>0) {actualStanceFlatBoost+=stancestrFlat;} totalStrFlatBoost+=stancestrFlat;
            if(stancespdFlat>0) {actualStanceFlatBoost+=stancespdFlat;} totalSpdFlatBoost+=stancespdFlat;
            if(stancedexFlat>0) {actualStanceFlatBoost+=stancedexFlat;} totalDexFlatBoost+=stancedexFlat;
            if(stancewillFlat>0) {actualStanceFlatBoost+=stancewillFlat;} totalWillFlatBoost+=stancewillFlat;
    
            if(actualStancePercBoost>maxStancePercBoost)
                {
                    document.getElementById("stanceCap-error-msg").style.display="";
                    for(i=0;i<stancePercBoost.length;i++)
                        {
                            if(stancePercBoost[i].value!=0)
                                {
                                    stancePercBoost[i].style.border="2px solid red";
                                }
                        }
                }
            if(actualStanceFlatBoost>maxStanceFlatBoost)
                {
                    document.getElementById("stanceFlatCap-error-msg").style.display="";
                    for(i=0;i<stanceFlatBoost.length;i++)
                        {
                            if(stanceFlatBoost[i].value!=0)
                                {
                                    stanceFlatBoost[i].style.border="2px solid red";
                                }
                        }
                }
            
            var basetotal=basestam+basestr+basespd+basedex+basewill;
            document.getElementById("TotalIPF").value=basetotal;  //Set Total
            //Check Stances settings and accordingly adjust
            //Calculate Total Boosts by adding (TotalTempBoosts+TotalStancesBoost*StatLossReduction)
            //Check if Individual and Total Boosts are within maxPhysStatBoost/100 or maxMenStatBoost/100 and maxTotalBoost/100 resp, show errors if true and highlight necessary boxes
            totalRaceBoost=(racestam+racestr+racespd+racedex+racewill); //Should be less than 3
            totalStamBoost+=tempstamBoost;
            totalStrBoost+=tempstrBoost;
            totalSpdBoost+=tempspdBoost;    //Each Should be Less than maxPhysStatBoost/100
            totalDexBoost+=tempdexBoost;
            totalWillBoost+=tempwillBoost; //Each Should be Less than maxMentStatBoost/100
            totalStamFlatBoost+=otherstamBoost;
            totalStrFlatBoost+=otherstrBoost;
            totalSpdFlatBoost+=otherspdBoost;
            totalDexFlatBoost+=otherdexBoost;
            totalWillFlatBoost+=otherwillBoost;
    
            totalBoost=
                    document.getElementById("stamTempBoostIPF").valueAsNumber+stancestamPerc+
                document.getElementById("strTempBoostIPF").valueAsNumber+stancestrPerc+
                document.getElementById("spdTempBoostIPF").valueAsNumber+stancespdPerc+
                document.getElementById("dexTempBoostIPF").valueAsNumber+stancedexPerc+
                document.getElementById("willTempBoostIPF").valueAsNumber+stancewillPerc;
            totalFlatBoost=
                    document.getElementById("stamTempFlatBoostIPF").valueAsNumber+stancestamFlat+
                document.getElementById("strTempFlatBoostIPF").valueAsNumber+stancestrFlat+
                document.getElementById("spdTempFlatBoostIPF").valueAsNumber+stancespdFlat+
                document.getElementById("dexTempFlatBoostIPF").valueAsNumber+stancedexFlat+
                document.getElementById("willTempFlatBoostIPF").valueAsNumber+stancewillFlat;
            //totalBoost=tempstamBoost+stancestamPerc+tempstrBoost+stancestrPerc+tempspdBoost+stancespdPerc+tempdexBoost+stancedexPerc+tempwillBoost+stancewillPerc; //Should be less than maxTotalBoost/100
            //totalFlatBoost=otherstamBoost+stancestamFlat+otherstrBoost+stancestrFlat+otherspdBoost+stancespdFlat+otherdexBoost+stancedexFlat+otherwillBoost+stancewillFlat;
            //document.getElementById("totalPercBoost").value=Math.round(totalBoost*100)/100+"%";
            document.getElementById("totalPercBoost").value=Math.round(totalBoost)+"%";
            document.getElementById("totalFlatBoost").value=Math.round(totalFlatBoost);
    
            if(totalRaceBoost>maxRacialBoost)
                {
                    document.getElementById("race-error-msg").style.display="";
                    for(i=0;i<raceBoost.length;i++)
                        {
                            if(raceBoost[i].value!=0)
                                {
                                    raceBoost[i].style.border="2px solid red";
                                }
                        }
                }
            if(totalStamBoost>maxPhysStatBoost)
                {
                    totalStamBoost=(totalStamBoost-maxPhysStatBoost)*overflow+maxPhysStatBoost;
                    document.getElementById("physstatCap-error-msg").style.display="";
                    for(i=0;i<stamPercBoost.length;i++)
                        {
                            if(stamPercBoost[i].value!=0)
                                {
                                    stamPercBoost[i].style.border="2px solid yellow";
                                }
                        }
                }
            if(totalStrBoost>maxPhysStatBoost)
                {
                    totalStrBoost=(totalStrBoost-maxPhysStatBoost)*overflow+maxPhysStatBoost;
                    document.getElementById("physstatCap-error-msg").style.display="";
                    for(i=0;i<strPercBoost.length;i++)
                        {
                            if(strPercBoost[i].value!=0)
                               {
                                    strPercBoost[i].style.border="2px solid yellow";
                               }
                        }
                }
            if(totalSpdBoost>maxPhysStatBoost)
                {
                    totalSpdBoost=(totalSpdBoost-maxPhysStatBoost)*overflow+maxPhysStatBoost;
                    document.getElementById("physstatCap-error-msg").style.display="";
                    for(i=0;i<spdPercBoost.length;i++)
                        {
                            if(spdPercBoost[i].value!=0)
                                {
                                    spdPercBoost[i].style.border="2px solid yellow";
                                }
                        }
                }
            if(totalDexBoost>maxMentStatBoost)
                {
                    totalDexBoost=(totalDexBoost-maxPhysStatBoost)*overflow+maxMentStatBoost;
                    document.getElementById("physstatCap-error-msg").style.display="";
                    for(i=0;i<dexPercBoost.length;i++)
                        {
                            if(dexPercBoost[i].value!=0)
                                {
                                    dexPercBoost[i].style.border="2px solid yellow";
                                }
                        }
                }
            if(totalWillBoost>maxMentStatBoost)
                {
                    totalWillBoost=(totalWillBoost-maxPhysStatBoost)*overflow+maxMentStatBoost;
                    document.getElementById("physstatCap-error-msg").style.display="";
                    for(i=0;i<willPercBoost.length;i++)
                        {
                            if(willPercBoost[i].value!=0)
                                {
                                    willPercBoost[i].style.border="2px solid yellow";
                                }
                        }
                }
            if(totalStamFlatBoost>maxStatFlatBoost)
                {
                    totalStamFlatBoost=(totalStamFlatBoost-maxStatFlatBoost)*overflow+maxStatFlatBoost;
                    document.getElementById("flatCap-error-msg").style.display=""
                    for(i=0;i<stamFlatBoost;i++)
                        {
                            if(stamFlatBoost[i].value!=0)
                                {
                                    stamFlatBoost[i].style.border="2px solid yellow";
                        
                                }
                        }
                }
            if(totalStrFlatBoost>maxStatFlatBoost)
                {
                    totalStrFlatBoost=(totalStrFlatBoost-maxStatFlatBoost)*overflow+maxStatFlatBoost;
                    document.getElementById("flatCap-error-msg").style.display=""
                    for(i=0;i<strFlatBoost;i++)
                        {
                            if(strFlatBoost[i].value!=0)
                                {
                                    strFlatBoost[i].style.border="2px solid yellow";
                                }
                        }
                }
            if(totalSpdFlatBoost>maxStatFlatBoost)
                {
                    totalSpdFlatBoost=(totalSpdFlatBoost-maxStatFlatBoost)*overflow+maxStatFlatBoost;
                    document.getElementById("flatCap-error-msg").style.display=""
                    for(i=0;i<spdFlatBoost;i++)
                        {
                            if(spdFlatBoost[i].value!=0)
                                {
                                    spdFlatBoost[i].style.border="2px solid yellow";
                                }
                        }
                }
            if(totalDexFlatBoost>maxStatFlatBoost)
                {
                    totalDexFlatBoost=(totalDexFlatBoost-maxStatFlatBoost)*overflow+maxStatFlatBoost;
                    document.getElementById("flatCap-error-msg").style.display=""
                    for(i=0;i<dexFlatBoost;i++)
                        {
                            if(dexFlatBoost[i].value!=0)
                                {
                                    dexFlatBoost[i].style.border="2px solid yellow";
                                }
                        }
                }
            if(totalWillFlatBoost>maxStatFlatBoost)
                {
                    totalWillFlatBoost=(totalWillFlatBoost-maxStatFlatBoost)*overflow+maxStatFlatBoost;
                    document.getElementById("flatCap-error-msg").style.display=""
                    for(i=0;i<willFlatBoost;i++)
                        {
                            if(willFlatBoost[i].value!=0)
                                {
                                    willFlatBoost[i].style.border="2px solid yellow";
                                }
                        }
                    errorFlag=false;
                }
    
    
            totalStamBoost+=racestam;
            totalStrBoost+=racestr;
            totalSpdBoost+=racespd;
            totalDexBoost+=racedex;
            totalWillBoost+=racewill;
    
    /*basetotal=Math.round
    (check(basestam+basetotal*(racestam/100),maxBoostPhysStatAmt)+
     check(basestr+basetotal*(racestr/100),maxBoostPhysStatAmt)+
     check(basespd+basetotal*(racespd/100),maxBoostPhysStatAmt)+
     check(basedex+basetotal*(racedex/100),maxBoostPhysStatAmt)+
     check(basewill+basetotal*(racewill/100),maxBoostPhysStatAmt));
    //Updating base Total to Include Racials so that it reflects in boosts
    //Update: Pretty Pointless, difference is miniscule
    */
            if(totalBoost>maxTotalBoost)
                {
                    document.getElementById("maxStatCap-error-msg").style.display="";
                    for(i=0;i<PercBoosts.length;i++)
                        {
                            if(PercBoosts[i].value!=0)
                                {
                                    PercBoosts[i].style.border="2px solid red";
                                }
                        }
                }
    
            if(totalFlatBoost>maxTotalFlatBoost)
                {
                    document.getElementById("flatTotalCap-error-msg").style.display=""
                    for(i=0;i<FlatBoosts.length;i++)
                        {
                            if(FlatBoosts[i].value!=0)
                                {
                                    FlatBoosts[i].style.border="2px solid red";
                                }
                        }
                }
            
    
            //properPercStanceLoss=Math.round(actualStancePercBoost*(100-statLossReduction)/100*1000)/1000;
            properPercStanceLoss=Math.round(actualStancePercBoost*(100-statLossReduction)/100);
            if(stancestamPerc<0) actualPercStanceLoss-=stancestamPerc;
            if(stancestrPerc<0) actualPercStanceLoss-=stancestrPerc;
            if(stancespdPerc<0) actualPercStanceLoss-=stancespdPerc;
            if(stancedexPerc<0) actualPercStanceLoss-=stancedexPerc;
            if(stancewillPerc<0) actualPercStanceLoss-=stancewillPerc;
            document.getElementById("totalStancesLossP").value=(properPercStanceLoss-actualPercStanceLoss)+"%";
        if(actualPercStanceLoss > properPercStanceLoss && !(actualPercStanceLoss > actualStancePercBoost))
            {
                document.getElementById("stanceLoss-warn-msg").style.display="";
                for(i=0;i<stanceLossP.length;i++)
                        {
                            if(stanceLossP[i].value!=0)
                                {
                                    stanceLossP[i].style.border="2px solid yellow";
                                }
                        }
            }
        if(actualPercStanceLoss < properPercStanceLoss || actualPercStanceLoss > actualStancePercBoost)
                {
                    document.getElementById("stanceLoss-error-msg").style.display="";
                    for(i=0;i<stanceLossP.length;i++)
                        {
                            stanceLossP[i].style.border="2px solid red";
                        }
                } //Check to see if the flat stat reduction from the stance is proper
            
            properFlatStanceLoss=Math.round(actualStanceFlatBoost*(100-statLossReduction)/100);
            if(stancestamFlat<0) actualFlatStanceLoss-=stancestamFlat;
            if(stancestrFlat<0) actualFlatStanceLoss-=stancestrFlat;
            if(stancespdFlat<0) actualFlatStanceLoss-=stancespdFlat;
            if(stancedexFlat<0) actualFlatStanceLoss-=stancedexFlat;
            if(stancewillFlat<0) actualFlatStanceLoss-=stancewillFlat;
    
            document.getElementById("totalStancesLossF").value=(properFlatStanceLoss-actualFlatStanceLoss);
            if(actualFlatStanceLoss > properFlatStanceLoss && !(actualFlatStanceLoss > actualStanceFlatBoost))
                {
                    document.getElementById("stanceLoss-warn-msg").style.display="";
                    for(i=0;i<stanceLossF.length;i++)
                        {
                            if(stanceLossF[i].value!=0)
                                {
                                    stanceLossF[i].style.border="2px solid yellow";
                                }
                        }
                }
        if(actualFlatStanceLoss < properFlatStanceLoss || actualFlatStanceLoss > actualStanceFlatBoost)
                {
                    document.getElementById("stanceLoss-error-msg").style.display="";
                    for(i=0;i<stanceLossF.length;i++)
                        {
                            stanceLossF[i].style.border="2px solid red";
                        }
                } //Check to see if the flat stat reduction from the stance is proper
            
            finalstam=Math.round(check(check(basestam+(totalStamBoost*basetotal/10)/100,maxBoostPhysStatAmt)+totalStamFlatBoost,maxBoostPhysStatAmt)-otherstamLoss,maxBoostPhysStatAmt);
            if(errorFlag)
                {
                    document.getElementById("statCap-warn-msg").style.display="";
                    document.getElementById("new-stam").style.color="yellow";
                    errorFlag=false;
                }
    
            finalstr=Math.round(check(check(basestr+(totalStrBoost*basetotal/10)/100,maxBoostPhysStatAmt)+totalStrFlatBoost,maxBoostPhysStatAmt)-otherstrLoss,maxBoostPhysStatAmt);
            if(errorFlag)
                {
                    document.getElementById("statCap-warn-msg").style.display="";
                    document.getElementById("new-str").style.color="yellow";
                    errorFlag=false;
                }

            finalspd=Math.round(check(check(basespd+(totalSpdBoost*basetotal/10)/100,maxBoostPhysStatAmt)+totalSpdFlatBoost,maxBoostPhysStatAmt)-otherspdLoss,maxBoostPhysStatAmt);
            if(errorFlag)
                {
                    document.getElementById("statCap-warn-msg").style.display="";
                    document.getElementById("new-spd").style.color="yellow";
                    errorFlag=false;
                }

            finaldex=Math.round(check(check(basedex+(totalDexBoost*basetotal/10)/100,maxBoostPhysStatAmt)+totalDexFlatBoost,maxBoostPhysStatAmt)-otherdexLoss,maxBoostPhysStatAmt);
            if(errorFlag)
                {
                    document.getElementById("statCap-warn-msg").style.display="";
                    document.getElementById("new-dex").style.color="yellow";
                    errorFlag=false;
                }

            finalwill=Math.round(check(check(basewill+(totalWillBoost*basetotal/10)/100,maxBoostPhysStatAmt)+totalWillFlatBoost,maxBoostPhysStatAmt)-otherwillLoss,maxBoostPhysStatAmt);
            if(errorFlag)
                {
                    document.getElementById("statCap-warn-msg").style.display="";
                    document.getElementById("new-will").style.color="yellow";
                    errorFlag=false;
                }
    
            if(finalstam<minStatAmt)
                {
                    finalstam=minStatAmt;
                }
            if(finalstr<minStatAmt)
                {
                    finalstr=minStatAmt;
                }
            if(finalspd<minStatAmt)
                {
                    finalspd=minStatAmt;
                }
            if(finaldex<minStatAmt)
                {
                    finaldex=minStatAmt;
                }
            if(finalwill<minStatAmt)
                {
                    finalwill=minStatAmt;
                }
         
            finaltotal=finalstam+finalstr+finalspd+finaldex+finalwill;
            
            document.getElementById("new-stam").textContent=finalstam;
            document.getElementById("new-str").textContent=finalstr;
            document.getElementById("new-spd").textContent=finalspd;
            document.getElementById("new-dex").textContent=finaldex;
            document.getElementById("new-will").textContent=finalwill;
            document.getElementById("new-total-stats").textContent=finaltotal;
        
}
function check(value,Max)
{
    if(value>Max)
        {
            errorFlag=true;
            return Max;
        }
    else return value;
}
function checkRev(value,Min)
{
    if(value<Min)
        {
            errorFlag=true;
            return Min;
        }
    else return value;
}