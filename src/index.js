const aws=require('aws-sdk')
const DBCreateService=require("CFNCreateStack.js")
//const DBQueryService=require("");
//const DBPostService=require("");
exports.handler = function(event,context,callback) {
    console.log("Event is ;;;",JSON.stringify(event))
    var eventbody=JSON.parse(event.body)
    console.log("EVent Body is ;;;;;",eventbody)
    return new Promise((resolve,reject)=>{
        if(eventbody.StackAction=="Only DB Creation"){
            console.log("Start Executing CFNCreateStack Class")
            var CFNServiceCall=new DBCreateService(event,eventbody)
            

        }
    })
    
};

