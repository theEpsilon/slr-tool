from db_aggregation_service import DBService
import os

def handler(event, context):

  db_service = DBService(os.environ["MONGO"])
  return_body = ""

  if "payload" not in event:
    return {
      "statusCode": 400,
      "body": "Bad Request"
    }

  if "user_id" not in event["payload"]:
    return {
      "statusCode": 400,
      "body": "Bad Request"
    }

  if not db_service.authorize_user(event["payload"]["user_id"]):
    return {
      "statusCode": 404,
      "body": "No user found with sub " + event["payload"]["user_id"]
    }

  print(event)

  if event["path"].endswith("/projects"):
    return_body = db_service.get_projects(event["payload"]["user_id"])

  elif event["path"].endswith("/searches"):
    return_body = db_service.get_searches(event["payload"]["user_id"])

  elif event["path"].endswith("/user"):
    return_body = db_service.get_user_details(event["payload"]["user_id"])

  return {
    "statusCode": 200,
    "body": return_body
  }
