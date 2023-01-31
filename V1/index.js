const aws = require('aws-sdk')
const DBCreateService = require("CFNCreateStack.js")
//const DBQueryService=require("");
//const DBPostService=require("");
exports.handler = function(event, context, callback) {
    //console.log("Event is ;;;",JSON.stringify(event))
    var eventbody = JSON.parse(event.body)
    //console.log("EVent Body is ;;;;;",eventbody)
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
    })

};