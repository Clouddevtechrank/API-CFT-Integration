const AWS = require('aws-sdk')
const fs = require("fs");
const {resolve} = require('path');
var dynamodb = new AWS.DynamoDB();
class GetItem {
    constructor(event, context, callback) {
        this.event=event
        this.callback=callback
        this.eventbody;
        this.responseObj={}
        
    }
    StartProcess(event, context, callback) {
        return new Promise((resolve, reject) =>{
            this.eventbody = JSON.parse(event.body);
            //this.eventbody=event.body
            console.log(`BODY:::`, this.eventbody);
            this.QueryItem().then((response) => {
                resolve(response)
                
            })
        })
    }
    QueryItem(){
        console.log("Executing Get Item")
        return new Promise((resolve,reject)=>{
            this.DescribeTable().then((tabledata)=>{
                //console.log("TableData is ;;;",JSON.stringify(tabledata))
                //resolve(tabledata)
                if(tabledata.TableStatus!="Table Not Exists in this Account"){
                    let tabledataSchema=tabledata.Table.KeySchema
                    console.log(tabledataSchema)
                    if(tabledataSchema.length===1){
                        console.log("Only HASH Key is present for the table")
                        if(this.eventbody.PrimaryKeyName===tabledataSchema[0].AttributeName){
                            console.log("Primary Keys Matched")
                            console.log(tabledata.Table.ItemCount)
                            this.DBGetRecord().then((data)=>{
                                console.log("Data is ;;;",data)
                                resolve(data)
                            })
                        }
                        else{
                            this.responseObj.TableStatus="Correct the Primay Key from the Input"
                            this.responseObj.AttributeName=tabledataSchema[0].AttributeName
                            this.responseObj.TableStatus+=" "+"For the Given Table Primary Key is "+this.responseObj.AttributeName
                            this.responseObj.StatusCode=500
                            resolve(this.responseObj)
                        }
                    }
                }else{
                    resolve(tabledata)
                }
               
            })

        })
    }

    DescribeTable(){
        return new Promise((resolve,reject)=>{
            let params = {
                TableName: this.eventbody.TableName
            };
            dynamodb.describeTable(params, (err, data)=> {
                if (err){
                    if(err.code="ResourceNotFoundException") {
                    console.log("Table Not Exists")
                    this.responseObj.TableStatus="Table Not Exists in this Account"
                    this.responseObj.StatusCode=500
                    resolve(this.responseObj)
                    }
                } 
                else{
                    console.log(data);
                    resolve(data)
                }
            })

        })
    }
    
    DBGetRecord(){
        return new Promise((resolve,reject)=>{
            var params = {}
            var PrimaryKeyName=this.eventbody.PrimaryKeyName
            var PrimaryKeyValue=this.eventbody.PrimaryKeyValue
            params.Key={"UserId":{S:PrimaryKeyValue}}
            params.TableName=this.eventbody.TableName
            //console.log("Table Params is ;;;",params)
            dynamodb.getItem(params, (err, data)=> {
                if (err) {
                    if(err.code="InvalidParameterType"){
                        console.log(err, err.stack);
                        this.responseObj.TableStatus="Error While Creating DB Record Primary Key Type is InvalidParameterType"
                        this.responseObj.StatusCode=502
                        resolve(this.responseObj)
                    }
                }
                else{
                    console.log(data);
                    if("Item" in data){
                        this.responseObj.TableStatus="Fetched DB Records Details Successfully"
                        this.responseObj.StatusCode=200
                        this.responseObj.data=data
                        resolve(this.responseObj)
                    }
                    else{
                        this.responseObj.TableStatus="No Records Found For "+PrimaryKeyValue
                        this.responseObj.StatusCode=200
                        resolve(this.responseObj)
                        
                    }
                
                }
            })

        })
    }
}

module.exports = GetItem;