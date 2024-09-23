import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb";
import {randomUUID} from "crypto";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({region:"us-east-1"}));

export const handler = async (event, context) => {
  try{
  const cotizacion = JSON.parse(event.body);
  
  const nuevaCotizacion = {
        ...cotizacion,
        id: randomUUID(),
  };
  await ddbDocClient.send(new PutCommand({
       TableName:"cotizaciones",
       Item: nuevaCotizacion,
  }));
  
  return  {
    statusCode: 200,
    body: JSON.stringify(nuevaCotizacion),
  };
  }
  catch (error) {
     console.error(error);
     return {
       statusCode: 500,
       body: JSON.stringify({ message: error.message }) ,
     };
  }}
