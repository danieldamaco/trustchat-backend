import { Webhook } from './../services/webhook.service.js';
import { find, addToDB, findUser, addUserToDB } from './../services/database.service.js';
import { pairing } from '../index.js';

const webhook = new Webhook();

function requestType(req, res, next) { //tipo status

  if (req.body.entry[0].changes[0].value.statuses) {
  } else {
    next(); //messageType
  }
}

async function messageType(req, res, next) {
  // Check out which type of message had been recieved 
  const type = req.body.entry[0].changes[0].value.messages[0].type;

  switch (type) {
    case 'text':
      //For text type messages

      next(); // databaseAdder

      break;
    case 'image':
      //For image type message
      break;
    case 'audio':
      //For image type message
      break;
    case 'sticker':
      break;
    case 'document':
      //For image type message
      break;
    default:
      break;
  }
}

async function databaseUserAdder(req, res, next){
  const userName = req.body.entry[0].changes[0].value.contacts[0].profile.name;
  var messageFrom = req.body.entry[0].changes[0].value.messages[0].from;
  messageFrom = messageFrom.replace(/^521/i, '52');

  //checking out if user is in db
  const userExistance = await findUser(messageFrom);
  if (userExistance.length === 0) {
    await addUserToDB(userName, messageFrom) 
  }

  next();

}

async function databaseAdder(req, res, next) {
  const type = req.body.entry[0].changes[0].value.messages[0].type;
  var messageFrom = req.body.entry[0].changes[0].value.messages[0].from;
  var messageTimestamp = req.body.entry[0].changes[0].value.messages[0].timestamp;
  const messageId = req.body.entry[0].changes[0].value.messages[0].id;
  const messageContent = req.body.entry[0].changes[0].value.messages[0];
  const userName = req.body.entry[0].changes[0].value.contacts[0].profile.name;

  // Convert timestamp to date 
  var date = new Date(messageTimestamp * 1000).toISOString();
  messageTimestamp = date;
 
  
  //getting rid of that 1 strange number 
  messageFrom = messageFrom.replace(/^521/i, '52');
  
  const user_id = pairing[messageFrom] //será igual a user (user_id) 

  const messageTo = user_id;

  //check out if id it is in db 
  const existance = await find(messageId);

  //In case DB does not have message id then send response and mask as read
  if (existance.length === 0) {
    await addToDB(type,
      messageFrom,
      messageTimestamp,
      messageId,
      messageContent[type],
      messageTo,
      'input'); //conexion con base de datos para agregar
  }
  next();
}

export { requestType, messageType, databaseUserAdder, databaseAdder };