window.onload=function(){
    mainCalcFunction();
}

function fetchUserStats() {
    // Remove stats error because we're getting a new username and new stats
    //statsErrorMsg.classList.remove('show');

    // GET PAGE ID FROM HERE WHEN PUBLISHED
    // https://spreadsheets.google.com/feeds/cells/SHEET_ID/od6/public/full?alt=json
    let sheetID = "1dFMZyDocinowOFWw1g4n7uo-JE6oPAujVLIWwHJ75l0";

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
                    return (e.gsx$username.$t.localeCompare(document.getElementById("username").value, 'en', {sensitivity: 'base'}) === 0)
                });
                if (entry) {
                    //currentStats.value = entry.gsx$totalbasestats.$t;
                    document.getElementById("stamIPF").value=entry.gsx$stamina.$t;
                    document.getElementById("strIPF").value=entry.gsx$strength.$t;
                    document.getElementById("spdIPF").value=entry.gsx$speed.$t;
                    document.getElementById("dexIPF").value=entry.gsx$dexterity.$t;
                    document.getElementById("willIPF").value=entry.gsx$willpower.$t;
                    document.getElementById("charName").textContent=entry.gsx$names.$t;
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
    var newStats=document.getElementsByClassName("new-stats");
    var racestam=document.getElementById("stamRIPF").valueAsNumber;
    var basestam=document.getElementById("stamIPF").valueAsNumber;
    var tempstamBoost=document.getElementById("stamTempBoostIPF").valueAsNumber;
    var stancestamBoost=document.getElementById("stamStancesIPF").valueAsNumber;
    var stancestamLoss=document.getElementById("stamStancesLossIPF").valueAsNumber;
    var racestr=document.getElementById("strRIPF").valueAsNumber;
    var basestr=document.getElementById("strIPF").valueAsNumber;
    var tempstrBoost=document.getElementById("strTempBoostIPF").valueAsNumber;
    var stancestrBoost=document.getElementById("strStancesIPF").valueAsNumber;
    var stancestrLoss=document.getElementById("strStancesLossIPF").valueAsNumber;
    var racespd=document.getElementById("spdRIPF").valueAsNumber;
    var basespd=document.getElementById("spdIPF").valueAsNumber;
    var tempspdBoost=document.getElementById("spdTempBoostIPF").valueAsNumber;
    var stancespdBoost=document.getElementById("spdStancesIPF").valueAsNumber;
    var stancespdLoss=document.getElementById("spdStancesLossIPF").valueAsNumber;
    var racedex=document.getElementById("dexRIPF").valueAsNumber;
    var basedex=document.getElementById("dexIPF").valueAsNumber;
    var tempdexBoost=document.getElementById("dexTempBoostIPF").valueAsNumber;
    var stancedexBoost=document.getElementById("dexStancesIPF").valueAsNumber;
    var stancedexLoss=document.getElementById("dexStancesLossIPF").valueAsNumber;    
    var racewill=document.getElementById("willRIPF").valueAsNumber;
    var basewill=document.getElementById("willIPF").valueAsNumber;
    var tempwillBoost=document.getElementById("willTempBoostIPF").valueAsNumber;
    var stancewillBoost=document.getElementById("willStancesIPF").valueAsNumber;
    var stancewillLoss=document.getElementById("willStancesLossIPF").valueAsNumber;
    var stancePerkLevel=document.getElementById("StancePerk").value;
    var strongWill=document.getElementById("StrongWillIPF").checked; 
    var statLossReduction,totalRaceBoost,totalStanceBoost,totalFlatStanceBoost,properFlatStanceLoss,actualFlatStanceBoost,totalBoost;
    var totalStamBoost=1;
    var totalStrBoost=1;
    var totalSpdBoost=1;
    var totalDexBoost=1;
    var totalWillBoost=1;    
    var racebasestam,racebasestr,racebasespd,racebasedex,racebasewill,finalstam,finalstr,finalspd,finaldex,finalwill,finaltotal;
    var i; //Initializing
    var boosts=document.getElementsByClassName("Boost");
    var raceBoost=document.getElementsByClassName("raceBoost");
    var stamBoost=document.getElementsByClassName("stamBoost");
    var strBoost=document.getElementsByClassName("strBoost");
    var spdBoost=document.getElementsByClassName("spdBoost");
    var dexBoost=document.getElementsByClassName("dexBoost");
    var willBoost=document.getElementsByClassName("willBoost");
    var stanceBoost=document.getElementsByClassName("stanceBoost"); //Creating Variables/Array Pointers to use in case boosts exceed caps
    var stanceLoss=document.getElementsByClassName("stanceLoss")
    var basetotal=basestam+basestr+basespd+basedex+basewill;
    document.getElementById("TotalIPF").value=basetotal;  //Set Total
    for(i=0;i<errors.length;i++)
        {
            errors[i].style.visibility="hidden";  //Hide Errors by Default
        }
    for(i=0;i<warns.length;i++)
        {
            warns[i].style.visibility="hidden";  //Hide Warns by Default
        }
    for(i=0;i<newStats.length;i++)
        {
            newStats[i].style.color=""; //Unhighlight Final Stats
        }
    for(i=0;i<boosts.length;i++)
        {
            boosts[i].style.border=""; //Unhighlight Fields
        }
    document.getElementById("stamStancesLossIPF").disabled=false;
    document.getElementById("strStancesLossIPF").disabled=false;
    document.getElementById("spdStancesLossIPF").disabled=false;  //Manually Re-enable Stat Loss Fields for physicals, not dex cause duh
    if(!strongWill)
        {
            document.getElementById("willStancesIPF").value=0;
            document.getElementById("willStancesLossIPF").value=0;
            stancewillBoost=0;
            stancewillLoss=0;
            document.getElementById("willStancesIPF").disabled=true;
            document.getElementById("willStancesLossIPF").disabled=true; //Disable Will from Stances by default
        }
    else
        {
            document.getElementById("willStancesIPF").disabled=false;
            document.getElementById("willStancesLossIPF").disabled=false;
        }
    switch(stancePerkLevel)
        {
            case '0':statLossReduction=0;break;
            case '1':statLossReduction=25;break;
            case '2':statLossReduction=50;break;
            case '3':statLossReduction=75;break;
            default:statLossReduction=0;break;
        }
    document.getElementById("LossRedIPF").value=statLossReduction; //set StatLossReduction based on Perk Level
    
    
    

            //Check Stances settings and accordingly adjust
            //Calculate Total Boosts by adding (TotalTempBoosts+TotalStancesBoost*StatLossReduction)
            //Check if Individual and Total Boosts are within 40 and 75 resp, show errors if true and highlight necessary boxes
            totalRaceBoost=(racestam+racestr+racespd+racedex+racewill)/100; //Should be less than 0.15
            totalStamBoost=(tempstamBoost+stancestamBoost)/100;
            totalStrBoost=(tempstrBoost+stancestrBoost)/100;
            totalSpdBoost=(tempspdBoost+stancespdBoost)/100;
            totalDexBoost=(tempdexBoost+stancedexBoost)/100;
            totalWillBoost=(tempwillBoost+stancewillBoost)/100; //Each Should be Less than 0.40
            totalStanceBoost=(stancestamBoost+stancestrBoost+stancespdBoost+stancedexBoost+stancewillBoost)/100; //Should be less than 0.20
            totalBoost=((tempstamBoost+tempstrBoost+tempspdBoost+tempdexBoost+tempwillBoost)+(stancestamBoost+stancestrBoost+stancespdBoost+stancedexBoost+stancewillBoost))/100 //Should be less than 0.75
            //Change the second bracket to (stancestamBoost+stancestrBoost+stancespdBoost+stancedexBoost+stancewillBoost)*statLossReduction/100 if you want to account for the fact that stances are not "really" boosts cause of flat loss
            document.getElementById("maxBoost").value=Math.round(totalBoost*100);
    
            if(totalRaceBoost>0.15)
                {
                    document.getElementById("race-error-msg").style.visibility="visible";
                    for(i=0;i<raceBoost.length;i++)
                        {
                            raceBoost[i].style.border="2px solid red";
                        }
                }
            if(totalStamBoost>0.40)
                {
                    document.getElementById("statCap-error-msg").style.visibility="visible";
                    for(i=0;i<stamBoost.length;i++)
                        {
                            stamBoost[i].style.border="2px solid red";
                        }
                }
            if(totalStrBoost>0.40)
                {
                    document.getElementById("statCap-error-msg").style.visibility="visible";
                    for(i=0;i<strBoost.length;i++)
                        {
                            strBoost[i].style.border="2px solid red";
                        }
                }
            if(totalSpdBoost>0.40)
                {
                    document.getElementById("statCap-error-msg").style.visibility="visible";
                    for(i=0;i<spdBoost.length;i++)
                        {
                            spdBoost[i].style.border="2px solid red";
                        }
                }
            if(totalDexBoost>0.40)
                {
                    document.getElementById("statCap-error-msg").style.visibility="visible";
                    for(i=0;i<dexBoost.length;i++)
                        {
                            dexBoost[i].style.border="2px solid red";
                        }
                }
            if(totalWillBoost>0.40)
                {
                    document.getElementById("statCap-error-msg").style.visibility="visible";
                    for(i=0;i<willBoost.length;i++)
                        {
                            willBoost[i].style.border="2px solid red";
                        }
                }
            if(totalStanceBoost>0.20)
                {
                    document.getElementById("stanceCap-error-msg").style.visibility="visible";
                    for(i=0;i<stanceBoost.length;i++)
                        {
                            stanceBoost[i].style.border="2px solid red";
                        }
                }
            if(totalBoost>0.75)
                {
                    document.getElementById("maxStatCap-error-msg").style.visibility="visible";
                    for(i=0;i<boosts.length;i++)
                        {
                            boosts[i].style.border="2px solid red";
                        }
                }
    
            if(stancestamBoost)
                {
                    stancestamLoss=0;
                    document.getElementById("stamStancesLossIPF").value=stancestamLoss;
                    document.getElementById("stamStancesLossIPF").disabled=true;
                }
            if(stancestrBoost)
                {
                    stancestrLoss=0;
                    document.getElementById("strStancesLossIPF").value=stancestrLoss;
                    document.getElementById("strStancesLossIPF").disabled=true;
                }
            if(stancespdBoost)
                {
                    stancespdLoss=0;
                    document.getElementById("spdStancesLossIPF").value=stancespdLoss;
                    document.getElementById("spdStancesLossIPF").disabled=true;
                }
            if(stancedexBoost)
                {
                    stancedexLoss=0;
                    document.getElementById("dexStancesLossIPF").value=stancedexLoss;
                    document.getElementById("dexStancesLossIPF").disabled=true;
                }
            if(stancewillBoost)
                {
                    stancewillLoss=0;
                    document.getElementById("willStancesLossIPF").value=stancewillLoss;
                    document.getElementById("willStancesLossIPF").disabled=true;
                }
            
    
            totalFlatStanceBoost=basestam*stancestamBoost/100+basestr*stancestrBoost/100+basespd*stancespdBoost/100+basedex*stancedexBoost/100+basewill*stancewillBoost/100;
            properFlatStanceLoss=totalFlatStanceBoost*(100-statLossReduction)/100;
            actualFlatStanceLoss=stancestamLoss+stancestrLoss+stancespdLoss+stancedexLoss+stancewillLoss;
            document.getElementById("totalStancesLossF").value=Math.round(properFlatStanceLoss-actualFlatStanceLoss);
            
            if(document.getElementById("totalStancesLossF").value!=0)
                {
                    document.getElementById("stanceLoss-error-msg").style.visibility="visible";
                    for(i=0;i<stanceLoss.length;i++)
                        {
                            stanceLoss[i].style.border="2px solid red";
                        }
                } //Check to see if the flat stat reduction from the stance is proper
            
            racebasestam=basestam*(1+racestam/100);
            racebasestr=basestr*(1+racestr/100);
            racebasespd=basespd*(1+racespd/100);
            racebasedex=basedex*(1+racedex/100);
            racebasewill=basewill*(1+racewill/100);
            if(racebasestam>500)
                {
                    racebasestam=500;
                }
            if(racebasestr>500)
                {
                    racebasestr=500;
                }
            if(racebasespd>500)
                {
                    racebasespd=500;
                }
            if(racebasedex>500)
                {
                    racebasedex=500;
                }
            if(racebasewill>500)
                {
                    racebasewill=500;
                }
    
    
            finalstam=Math.round(racebasestam+racebasestam*totalStamBoost-stancestamLoss);
            finalstr=Math.round(racebasestr+racebasestr*totalStrBoost-stancestrLoss);
            finalspd=Math.round(racebasespd+racebasespd*totalSpdBoost-stancespdLoss);
            finaldex=Math.round(racebasedex+racebasedex*totalDexBoost-stancedexLoss);
            finalwill=Math.round(racebasewill+racebasewill*totalWillBoost-stancewillLoss);
    
            if(finalstam>650)
                {
                    document.getElementById("statCap-warn-msg").style.visibility="visible";
                    finalstam=650;
                    document.getElementById("new-stam").style.color="yellow";
                }
            if(finalstr>650)
                {
                    document.getElementById("statCap-warn-msg").style.visibility="visible";
                    finalstr=650;
                    document.getElementById("new-str").style.color="yellow";
                }
            if(finalspd>650)
                {
                    document.getElementById("statCap-warn-msg").style.visibility="visible";
                    finalspd=650;
                    document.getElementById("new-spd").style.color="yellow";
                }
            if(finaldex>650)
                {
                    document.getElementById("statCap-warn-msg").style.visibility="visible";
                    finaldex=650;
                    document.getElementById("new-dex").style.color="yellow";
                }
            if(finalwill>650)
                {
                    document.getElementById("statCap-warn-msg").style.visibility="visible";
                    finalwill=650;
                    document.getElementById("new-will").style.color="yellow";
                }
            finaltotal=finalstam+finalstr+finalspd+finaldex+finalwill;
            
            document.getElementById("new-stam").textContent=finalstam;
            document.getElementById("new-str").textContent=finalstr;
            document.getElementById("new-spd").textContent=finalspd;
            document.getElementById("new-dex").textContent=finaldex;
            document.getElementById("new-will").textContent=finalwill;
            document.getElementById("new-total-stats").textContent=finaltotal;
        
}


