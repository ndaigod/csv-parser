import * as csv from 'csv-parser';
import fs = require('fs');
import * as mysql from 'mysql';
import * as config from './config';

function createTableConfig(): string {
    let result = "";
    config.database.forEach((column, index)=>{
        result += column.name + ' ' + column.type + ((index === config.database.length - 1) ? '\n' : ',\n');
    });
    return result;
}

function CreateInsertQuery(obj) : string{
    let query : string = 'INSERT IGNORE INTO\n users \n SET \n';
    config.database.forEach((column, index)=>{
       query += column.name + ' = "' + obj[column.data] +
           ((index === config.database.length - 1) ? '";' : '",\n');
    });
    return query;
}

const outputFile = 'InvalidObjectsLog.txt';
let results = [];
let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1111'
});
connection.connect();
connection.query('CREATE DATABASE IF NOT EXISTS users;');
connection.query('USE users');
connection.query('CREATE TABLE IF NOT EXISTS users (\n' +
    createTableConfig() +
    '); ')
fs.writeFileSync(outputFile, new Date().toString() + '\n');
fs.createReadStream('./Users.csv')
    .pipe(csv({ separator: ';' }))
    .on('headers', (headers: Array<string>) => {
        headers.forEach(function (value, index) {
            if (index < config.csv.length && config.csv[index].name !== value)
                console.log(`Unmatched header "${config.csv[index].name}" => "${value}"`);
        });
    })
    .on('data', function(data){
        let errors: string[] = [];
        config.csv.forEach((fieldDescriptor: config.ColumnDescriptor)=>{
           fieldDescriptor.validators.forEach((validator: config.Validators)=>{
                validator.validate(data[fieldDescriptor.name]).forEach((error:string)=>{
                    errors.push(`[${fieldDescriptor.name}] ${error}`);
                })
           })
        });
        if (errors.length === 0){
            results.push(data);
        }
        else{
            fs.appendFileSync(outputFile, JSON.stringify(data) + '\n');
            errors.forEach((error:string) => {
                fs.appendFileSync(outputFile, error + '\n');
                console.log(error);
            })
        }
    })
    .on('end', () => {
        results.forEach((value)=>{
            connection.query(CreateInsertQuery(value));
        });
        connection.end();
    });

