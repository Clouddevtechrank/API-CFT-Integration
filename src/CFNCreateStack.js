const AWS = require('aws-sdk')
const fs = require("fs");
const mustache = require('mustache');
const { resolve } = require('path');
var cloudformation = new AWS.CloudFormation();
class CreateStack {
    constructor(event,eventbody) {
        return new Promise((resolve, reject) =>
            FormTemplates(event).then((resulttemplate) => {
                CreateStackOp(event, resulttemplate).then((resp) => {
                    resolve(resp)
                })
            })
        )

        function FormTemplates(event) {
            console.log("Executing FormTemplates Function")
            return new Promise((resolve, reject) => {
                fs.readFile('./CFN.json', (err, data) => {
                    if (err) {
                        throw err
                    } else {
                        var templatedata = data.toString()
                        //console.log("TemplateData is ;;;", templatedata)
                        var output = mustache.render(templatedata, eventbody);
                        //console.log("Output After Renndering", output)
                        resolve(output)
                    }
                })
            })
        }

        function CreateStackOp(event, resulttemplate) {
            console.log("Executing CreateStack operation")
            return new Promise((resolve, reject) => {
                DescribeStack(eventbody).then((Stackevent) => {
                    console.log("StackData is;;",Stackevent)
                    let TemplateBody=JSON.stringify(JSON.parse(resulttemplate))
                    if (Stackevent === "CREATE") {
                        let params = {
                            StackName: eventbody.StackName,
                            TemplateBody: TemplateBody
                        }
                        //console.log("StackParams is ;;;",params)
                        cloudformation.createStack(params, (err, data) => {
                            if (err) {
                                console.log(err, err.stack);
                            } else {
                                console.log(data);
                                resolve(data)  
                            }
                        });
                    }
                    else if(Stackevent=="UPDATE"){
                        let params = {
                            StackName: eventbody.StackName,
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

        function DescribeStack(event) {
            console.log("Executing describe stack Operations")
            return new Promise((resolve, reject) => {
                let params = {
                    StackName: event.StackName
                };
                console.log("Params is ;;",params)
                cloudformation.describeStacks(params, (err, data) => {
                    console.log("Error is",err)
                    if (err.code == "ValidationError" && err.code!="TypeError") {
                        resolve("CREATE")
                    } else {
                        console.log(data);
                        resolve("UPDATE")
                    }
                })
            })
        }
    }
}

module.exports = CreateStack;
