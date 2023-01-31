const aws = require('aws-sdk')
const DBCreateService = require("CFNCreateStack.js")
const DBputItemService=require("DBPutItem.js");
const DBgetItemService=require("DBQuery.js");
exports.handler = function(event, context, callback) {
    console.log("Event is ;;;",JSON.stringify(event))
    //var eventbody = event.body
    var eventbody = JSON.parse(event.body);
    console.log("EVent Body is ;;;;;",eventbody)
    const headers = {
                    'Access-Control-Allow-Origin': event.headers.origin || event.headers.Origin,
                    "Access-Control-Allow-Headers": 'Content-Type,X-Requested-With,withcredentials,X-Amz-Date,Accept,Authorization,X-Api-Key,X-Amz-Security-Token',
                    "Access-Control-Allow-Methods": 'GET,DELETE,POST,OPTIONS',
                    "Access-Control-Allow-Credentials": true,
                    "Cache-Control": "no-cache"
            };
    
    return new Promise((resolve, reject) => {
        console.log("StackAction is ;;", eventbody.StackAction)
        if (eventbody.StackAction == "Only DB Creation") {
            console.log("Start Executing CFNCreateStack Class")
            var CFNServiceCall = new DBCreateService()
            CFNServiceCall.StartProcess(event, context, callback).then(() => {
                context.succeed({
                    statusCode: 200,
                    "headers":headers,
                    body: JSON.stringify({
                        "StatusCode": 200,
                        "Message": "DB is created Successfully"
                    })
                })

            }).catch((err)=>{
                console.log(err)
            })

        }
        else if(eventbody.StackAction == "DB Put Item"){
            console.log("Start Executing DB Put Item Class")
            var DBPutServiceCall = new DBputItemService()
            DBPutServiceCall.StartProcess(event, context, callback).then((data) => {
                console.log("Data is ;;;",data)
                if(data.TableStatus){
                    context.succeed({
                        statusCode: data.StatusCode,
                        "headers":headers,
                        body: JSON.stringify({
                            "StatusCode": data.StatusCode,
                            "Message": data.TableStatus
                        })
                    })
                }
                

            }).catch((err)=>{
                console.log(err)
            })

        }
        else if(eventbody.StackAction == "DB Get Item"){
            console.log("Start Executing DB Get Item Class")
            var DBQueryServiceCall = new DBgetItemService()
            DBQueryServiceCall.StartProcess(event, context, callback).then((tabledata) => {
                console.log("Data is ;;;",tabledata)
                if(tabledata.TableStatus){
                    context.succeed({
                        statusCode: tabledata.StatusCode,
                        "headers":headers,
                        body: JSON.stringify({
                            "StatusCode": tabledata.StatusCode,
                            "Message": tabledata.TableStatus,
                            "data":tabledata["data"]
                        })
                    })
                }
                

            }).catch((err)=>{
                console.log(err)
            })

        }
    })

};