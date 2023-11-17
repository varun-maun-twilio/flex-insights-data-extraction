require('dotenv').config()
const axios = require('axios');


const getSuperToken = async () => {
    const [userProfile, error] = await axios.post('https://analytics.ytica.com/gdc/account/login', {
        "postUserLogin": {
            "login": process.env.FLEX_INSIGHTS_LOGIN,
            "password": process.env.FLEX_INSIGHTS_PASSWORD,
            "remember": 0,
            "verify_level": 2
        }
    })
        .then(d => [d.data, null])
        .catch(function (error) {
            console.error(error);
            return [null, error];
        });


    return userProfile?.userLogin?.token;
}

const getTempToken = async (superToken) => {

    const [userToken, error] = await axios.get('https://analytics.ytica.com/gdc/account/token', {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-GDC-AuthSST": superToken
        }
    })
        .then(d => [d.data, null])
        .catch(function (error) {
            console.error(error);
            return [null, error];
        });


    return userToken?.userToken?.token;
}


const getObjectUri = async (identifier,tempToken) => {
    const [executionResp, error] = await axios.post(`https://analytics.ytica.com/gdc/md/${process.env.FLEX_INSIGHTS_WORKSPACEID}/identifiers`, {
        identifierToUri:[identifier]
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
    return executionResp?.identifiers[0]?.uri;
}


const fetchExecutionResults = async (tempToken,executionLink) => {
    const [executionResp, error] = await axios.get(`https://analytics.ytica.com${executionLink}`, 
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

//Helper function to transform custom GD execution to table data
const mapInsightResponseIntoTabularData = (executionResult)=>{
    const tableData = [];
    const rowCount = executionResult.headerItems[0][0].length;
    const colCount = executionResult.headerItems[0].length;
    
  
    for(var rowIter=0;rowIter<rowCount;rowIter++){
        const rowData = [];
        for(var colIter=0;colIter<colCount;colIter++){
            rowData.push(executionResult.headerItems[0][colIter][rowIter]['attributeHeaderItem']['name']);
        }
    
        tableData.push( rowData);
    }
    
    
    return tableData;
    
}

module.exports = {
    getSuperToken, getTempToken,getObjectUri,fetchExecutionResults,mapInsightResponseIntoTabularData
}