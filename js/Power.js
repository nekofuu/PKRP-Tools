window.onload=function(){
    mainCalcFunction();
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
    var basestr=document.getElementById("strIPF").valueAsNumber;
    var basespd=document.getElementById("spdIPF").valueAsNumber;
    var basedex=document.getElementById("dexIPF").valueAsNumber;
    var basewill=document.getElementById("willIPF").valueAsNumber;
    var attackLevel=document.getElementById("attackLevel").value;
    var slashLevel=document.getElementById("slashLevel").value;
    var meitoGrade=document.getElementById("bladeGrade").value;
    var DFCheck=document.getElementById("DFCheck").checked;
    var UACheck=document.getElementById("UACheck").checked;
    var NACheck=document.getElementById("NACheck").checked;
    var strReq,spdReq,dexReq,willReq,meitoReq;
    var attackMult,slashMult,gradeMult,slashPower,attackPower,attackResult,slashResult,threshold;
    var strFactor=1.5;
    var spdFactor=0.85;
    var dexFactor=1.1;
    var willFactor=1.1;
    var powerScale;
    var i; //Initializing
    //var waveReq=document.getElementsByClassName("waveReq");
    //var slashReq=document.getElementsByClassName("slashReq");
    //var meitoBox=document.getElementsByClassName("bladeGrade"); //Creating Variables/Array Pointers to use in case reqs are not met
    for(i=0;i<errors.length;i++)
        {
            errors[i].style.visibility="hidden";  //Hide Errors by Default
        }
    switch(meitoGrade)
        {
            case '0':gradeMult=1.00;break;
            case '1':gradeMult=1.1;break;
            case '2':gradeMult=1.2;break;
            case '3':gradeMult=1.3;break;
            case '4':gradeMult=1.45;break;
        }
    switch(attackLevel)
        {
            case '0':attackMult=0.95;strReq=0;spdReq=0;break;
            case '1':attackMult=0.225;strReq=50;spdReq=50;break;
            case '2':attackMult=0.350;strReq=90;spdReq=60;break;
            case '3':attackMult=0.475;strReq=130;spdReq=70;break;
            case '4':attackMult=0.600;strReq=170;spdReq=80;break;
            case '5':attackMult=0.725;strReq=210;spdReq=90;break;
        }
    switch(slashLevel)
        {
            case '0':slashMult=1.00;dexReq=0;meitoReq=0;break;
            case '1':slashMult=0.30;dexReq=50;meitoReq=0;break;
            case '2':slashMult=0.45;dexReq=75;meitoReq=1;break;
            case '3':slashMult=0.60;dexReq=100;meitoReq=1;break;
            case '4':slashMult=0.75;dexReq=125;meitoReq=2;break;
            case '5':slashMult=0.90;dexReq=150;meitoReq=3;break;
            
            default:slashMult=0;dexReq=0;break;
        }
    if((DFCheck)&&(slashLevel>0))
        {
            slashMult-=0.075;
        }
    if((UACheck)&&(slashLevel>0))
        {
            slashMult-=0.050;
        }
    willReq=dexReq;
    
    if(basestr<strReq)
        {
            document.getElementById("waveReq-error-msg").style.visibility="visible";
            document.getElementById("strIPF").style.border="2px solid red";
        }
    if(basespd<spdReq)
        {
            document.getElementById("waveReq-error-msg").style.visibility="visible";
            document.getElementById("spdIPF").style.border="2px solid red";
        }
    if(basedex<dexReq)
        {
            document.getElementById("slashReq-error-msg").style.visibility="visible";
            document.getElementById("dexIPF").style.border="2px solid red";
        }
    if(basewill<willReq)
        {
            document.getElementById("slashReq-error-msg").style.visibility="visible";
            document.getElementById("willIPF").style.border="2px solid red";
        }
    if(meitoGrade<meitoReq)
        {
            document.getElementById("meitoGrade-error-msg").style.visibility="visible";
            document.getElementById("bladeGrade").style.border="2px solid red";
        }
    attackPower=(strFactor*basestr+spdFactor*basespd+dexFactor*basedex+willFactor*basewill)/4*attackMult;
    slashPower=(strFactor*basestr+spdFactor*basespd+dexFactor*basedex+willFactor*basewill)/4*slashMult*gradeMult;
    
    if((slashLevel!=0)&&(slashLevel<=5))
        {
            if(slashLevel<=4)
                {
                    if(slashLevel<=3)
                    {
                        if(slashLevel<=2)
                            {
                                if(slashLevel==1)
                                    {
                                        if((slashPower>160)&&(meitoGrade>=1))
                                            {
                                                slashPower=160+(slashPower-160)/2;
                                            }
                                        else if(slashPower>160)
                                            {
                                                slashPower=160;
                                            }
                                    }
                                if((slashPower>205)&&(meitoGrade>=1))
                                    {
                                        slashPower=205+(slashPower-205)/2;
                                    }
                                else if(slashPower>205)
                                    {
                                        slashPower=205;
                                    }
                            }
                        if((slashPower>250)&&(meitoGrade>=1))
                            {
                                slashPower=250+(slashPower-250)/2;
                            }
                        else if(slashPower>250)
                            {
                                slashPower=250;
                            }
                    }
                    if((slashPower>380)&&(meitoGrade>=2))
                        {
                            slashPower=380+(slashPower-380)/2;
                        }
                    else if(slashPower>380)
                        {
                            slashPower=380;
                        }
                }
            if((slashPower>685)&&(meitoGrade==4))
                {
                    slashPower=685+(slashPower-685)/2;
                }
            else if((slashPower>560)&&(meitoGrade>=3))
                {
                    slashPower=560+(slashPower-560)/2;
                }
            else if(slashPower>560)
                {
                    slashPower=560;
                }
        }
    if((attackLevel!=0)&&(attackLevel<=5))
        {
            if(attackLevel<=4)
                {
                    if(attackLevel<=3)
                        {
                            if(attackLevel<=2)
                                {
                                    if(attackLevel==1)
                                        {
                                            if(attackPower>160)
                                                {
                                                    attackPower=160;
                                                }
                                        }
                                    if(attackPower>205)
                                        {
                                            attackPower=205;
                                        }
                                }
                            if(attackPower>250)
                                {
                                    attackPower=250;
                                }
                        }
                    if(attackPower>315)
                        {
                            attackPower=315;
                        }
                }
            if(attackPower>380)
                {
                    attackPower=380;
                }
            
        }
    
    powerScale=
    {
        560:"2Diamond",
        470:"1Diamond",
        380:"2Titanium",
        315:"1Titanium",
        250:"2Steel",
        205:"1Steel",
        160:"2Iron",
        130:"1Iron",
        100:"2Bronze",
        80:"1Bronze",
        60:"2Stone",
        45:"1Stone",
        30:"2Bone",
        20:"1Bone",
        10:"2Wood",
        5:"1Wood",
    }
    attackPower=Math.round(attackPower);
    slashPower=Math.round(slashPower);
    for(var threshold in powerScale)
        {
            if(attackPower>=threshold)
                {
                    attackResult=powerScale[threshold];
                }
           if(slashPower>=threshold)
                {
                    slashResult=powerScale[threshold];
                }
        }
    if(attackResult[0]=="2")
        {
            attackResult=attackResult.replace("2","Can Smash ");
        }
    else if(attackResult[0]=="1")
        {
            attackResult=attackResult.replace("1","Can Dent ");
        }
    else
        {
            attackResult="This shouldn't be happening";
        }
    if(slashResult[0]=="2")
        {
            slashResult=slashResult.replace("2","Can Cut ");
        }
    else if(slashResult[0]=="1")
        {
            slashResult=slashResult.replace("1","Can Gouge ");
        }
    else
        {
            slashResult="This shouldn't be happening";
        }
    
    
    document.getElementById("attackPower").textContent=Math.round(attackPower);
    document.getElementById("slashPower").textContent=Math.round(slashPower);
    document.getElementById("attackResult").textContent=attackResult;
    document.getElementById("slashResult").textContent=slashResult;

    
        
}


