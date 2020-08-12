from db_user_service import DBService
import os

def handler(event, context):

  if(event["triggerSource"] == "PostConfirmation_ConfirmSignUp"):

    db_service = DBService(os.environ["MONGO"])

    db_service.createUser(event)

  return event
