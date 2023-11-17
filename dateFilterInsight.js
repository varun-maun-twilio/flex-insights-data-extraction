require('dotenv').config()

const axios = require('axios');
const moment = require('moment');

const  {  getSuperToken, getTempToken,getObjectUri,fetchExecutionResults,mapInsightResponseIntoTabularData} = require("./insights-util");






const executeQuery = async (tempToken,startDate,endDate) => {


    const dateObjectId = await getObjectUri("date.dataset.dt",tempToken);
    
    const conversationObjectId = await getObjectUri("label.conversations.conversation_id",tempToken);
    const segmentObjectId = await getObjectUri("label.conversations.segment",tempToken);
    

    const [executionResp, error] = await axios.post(`https://analytics.ytica.com/gdc/projects/${process.env.FLEX_INSIGHTS_WORKSPACEID}/executeAfm`,
    
    {
        "execution":{
           "afm":{
              "attributes":[
                {
                    "displayForm":{
                       "uri":conversationObjectId
                    },
                    "localIdentifier":"conversationName"
                 },
                 {
                    "displayForm":{
                       "uri":segmentObjectId
                    },
                    "localIdentifier":"segmentName"
                 }
              ],
              "filters":[
                 {
                    "absoluteDateFilter":{
                       "dataSet":{
                          "uri":dateObjectId
                       },
                       "from":startDate,
                       "to":endDate
                    }
                 }
              ]
           },
           "resultSpec":{
              "sorts":[
                 {
                    "attributeSortItem":{
                       "attributeIdentifier":"conversationName",
                       "direction":"asc"
                    }
                 }
              ],
              "dimensions":[
                 {
                    "itemIdentifiers":[
                        "conversationName",
                       "segmentName"
                    ]
                 },
                 {
                    "itemIdentifiers":[
                       
                    ]
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
            console.log(error);
            return [null, error];
        });

  
    return executionResp?.executionResponse?.links?.executionResult;
}






const main = async () => {

    const REPORT_START_DATE = "2023-11-02";
    const REPORT_END_DATE = "2023-11-17";

    const superToken = await getSuperToken();
    const tempToken = await getTempToken(superToken);

   
    const queryLink = await executeQuery(tempToken,REPORT_START_DATE,REPORT_END_DATE);
    const data = await fetchExecutionResults(tempToken,queryLink)
    const dataTable = mapInsightResponseIntoTabularData(data.executionResult);
    console.error(JSON.stringify(dataTable));

}

main();