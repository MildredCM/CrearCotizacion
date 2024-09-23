import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

// Instanciación del cliente DynamoDB con región de variable de entorno (si está disponible)
const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",  // Puedes configurar la región faltante aquí
  })
);

export const handler = async (event, context) => {
  try {
    // Verificación y parseo del cuerpo de la solicitud
    let cotizacion;
    try {
      cotizacion = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Solicitud inválida, el cuerpo no es un JSON válido.",
        }),
      };
    }

    // Validación de campos obligatorios en la cotización
    if (!cotizacion.modelo || !cotizacion.precio) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Faltan campos obligatorios en la cotización (modelo o precio).",
        }),
      };
    }

    // Crear una nueva cotización con un ID único
    const nuevaCotizacion = {
      ...cotizacion,
      id: randomUUID(),
    };

    // Inserción de la cotización en la tabla DynamoDB
    await ddbDocClient.send(
      new PutCommand({
        TableName: "cotizaciones",  
        Item: nuevaCotizacion,
      })
    );

    // Respuesta exitosa
    return {
      statusCode: 200,
      body: JSON.stringify(nuevaCotizacion),
    };
  } catch (error) {
    // Manejo de errores y registro del error en los logs
    console.error("Error al procesar la cotización:", error, event);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Error interno del servidor: ${error.message}`,
      }),
    };
  }
};

