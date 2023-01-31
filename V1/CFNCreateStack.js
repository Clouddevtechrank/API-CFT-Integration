const AWS = require('aws-sdk')
const fs = require("fs");
const mustache = require('mustache');
const {resolve} = require('path');
var cloudformation = new AWS.CloudFormation();
class CreateStack {
    constructor(event, context, callback) {
        this.event=event
        this.callback=callback
        this.eventbody;
        
    }
    StartProcess(event, context, callback) {
        return new Promise((resolve, reject) =>{
            this.eventbody = JSON.parse(event.body);
            console.log(`BODY:::`, this.eventbody);
            this.FormTemplates(event).then((resulttemplate) => {
                this.CreateStackOp(event, resulttemplate).then((resp) => {
                    resolve(resp)
                    

                })
            })
        })
    }

    FormTemplates(event) {
        console.log("Executing FormTemplates Function")
        return new Promise((resolve, reject) => {
            fs.readFile('./CFN.json', (err, data) => {
                if (err) {
                    throw err
                } else {
                    var templatedata = data.toString()
                    //console.log("TemplateData is ;;;", templatedata)
                    var output = mustache.render(templatedata,this.eventbody);
                    //console.log("Output After Renndering", output)
                    resolve(output)
                }
            })
        })
    }

    CreateStackOp(event, resulttemplate) {
        console.log("Executing CreateStack operation")
        return new Promise((resolve, reject) => {
            this.DescribeStack().then((Stackevent) => {
                console.log("StackData is;;", Stackevent)
                let TemplateBody = JSON.stringify(JSON.parse(resulttemplate))
                if (Stackevent === "CREATE") {
                    let params = {
                        StackName: this.eventbody.StackName,
                        TemplateBody: TemplateBody
                    }
                    console.log("StackParams is ;;;",params)
                    cloudformation.createStack(params, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                        } else {
                            console.log(data);
                            resolve(data)
                        }
                    });
                } else if (Stackevent == "UPDATE") {
                    let params = {
                        StackName: this.eventbody.StackName,
                        TemplateBody: TemplateBody
                    }
                    //console.log("StackParams is ;;;",params)
                    cloudformation.updateStack(params, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                        } else {
                            console.log(data);
                            resolve(data)
                        }
                    });
                }
            })
        })
    }

    DescribeStack(event) {
        console.log("Executing describe stack Operations")
        return new Promise((resolve, reject) => {
            let params = {
                StackName: this.eventbody.StackName
            };
            console.log("Params is ;;", params)
            cloudformation.describeStacks(params, (err, data) => {
                console.log("Error is", err)
                if (err.code == "ValidationError" && err.code != "TypeError" && err.errorType!="Runtime.UnhandledPromiseRejection") {
                    resolve("CREATE")
                } 
                else {
                    console.log(data);
                    resolve("UPDATE")
                }
            })
        })
    }

}

module.exports = CreateStack;