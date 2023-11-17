require('dotenv').config()

const axios = require('axios');
const moment = require('moment');

const  {  getSuperToken, getTempToken,getObjectUri,fetchExecutionResults} = require("./insights-util");



const getReport = async (tempToken,reportIdentifier,startDate,endDate) => {

    const reportObjectId = await getObjectUri(reportIdentifier,tempToken)
    const dateObjectId = await getObjectUri("date.date.mmddyyyy",tempToken)

    // Setting default date range as yesterday (Ex: Today => 0 | Yesterday => -1 )

    let startDayIndex = -364;
    let endDayIndex = 0;

    if(startDate){
        var startDateObj = moment(startDate, "YYYY-MM-DD");
        var currentDateObj = moment();
        startDayIndex = startDateObj.diff(currentDateObj, 'days');
    }

    if(endDate){
        var endDateObj = moment(endDate, "YYYY-MM-DD");
        var currentDateObj = moment();
        endDayIndex = endDateObj.diff(currentDateObj, 'days');
    }
   

    const [executionResp, error] = await axios.post(`https://analytics.ytica.com/gdc/app/projects/${process.env.FLEX_INSIGHTS_WORKSPACEID}/execute/raw`, 
       {
            "report_req": { 
                "report": reportObjectId,
                "context": { 
                    "filters": [
                        { 
                            "uri": dateObjectId,
                            "constraint": { 
                                "type": "floating", 
                                "from": startDayIndex, 
                                "to": endDayIndex 
                            } 
                        }
                    ] 
                } 
            } 
        },     
        {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Cookie": `GDCAuthTT=${tempToken}`
            }
        })
        .then(d => [d.data, null])
        .catch(function (error) {
            console.error(error);
            return [null, error];
        });


    return executionResp;
}



const main = async () => {


    const REPORT_START_DATE = "2023-11-02";
    const REPORT_END_DATE = "2023-11-17";

    const superToken = await getSuperToken();
    const tempToken = await getTempToken(superToken);


    const reportResponse = await getReport(tempToken,process.env.FLEX_INSIGHTS_REPORT_IDENTIFIER,REPORT_START_DATE,REPORT_END_DATE);
    
    const executionResults = await fetchExecutionResults(tempToken,reportResponse.uri);
    console.error(executionResults);

    
}

main();