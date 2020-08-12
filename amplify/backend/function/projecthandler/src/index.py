from db_project_service import DBService
from put_method import PutMethod, StatusCode, HTTPHelper
from bson.objectid import ObjectId
import os

def handler(event, context):

  bad_request = {
      "statusCode": 400,
      "body": "Bad request."
    }

  if "http-method" not in event:
    return bad_request

  db = DBService(os.environ["MONGO"])
  status = StatusCode.FAILED
  project = {}

  if event["http-method"] == "POST":
    authorized = db.authorize_user(event["payload"]["user_id"], None, True)
  else:
    authorized = db.authorize_user(event["payload"]["user_id"], event["payload"]["project_id"], False)

  if not authorized:
    return {
      "statusCode": 403,
      "body": "User not authorized to perform requested action."
    }

  if(event["http-method"] == "POST"):
    if "payload" not in event\
      or "user_id" not in event["payload"]\
      or "body" not in event["payload"]:

      return bad_request

    project = db.create_project(event["payload"])

    if "_id" in project:
      status = StatusCode.CREATED
    else:
      status = StatusCode.FAILED

  elif(event["http-method"] == "PUT"):
    if "payload" not in event\
      or "user_id" not in event["payload"] \
      or "project_id" not in event["payload"] \
      or "method" not in event["payload"] \
      or "body" not in event["payload"]:

      return bad_request

    project = db.update_project(convert_method(event["payload"]["method"]), event["payload"])
    status = StatusCode.SUCCESS

  elif(event["http-method"] == "DELETE"):
    if "payload" not in event:
      return bad_request

    db.remove_project(event["payload"])

    project = "Project deleted."
    status = StatusCode.SUCCESS

  elif(event["http-method"] == "GET"):
    if "payload" not in event\
      or "user_id" not in event["payload"] \
      or "project_id" not in event["payload"]:

      return bad_request

    project = db.get_project(event["payload"])
    status = StatusCode.SUCCESS

  return {
    "statusCode": HTTPHelper().get_http_code(status),
    "body": project
  }


def convert_method(method):
  if(method == "add"):
    return PutMethod.ADD
  elif method == "replace":
    return  PutMethod.REPLACE
  elif method == "remove":
    return PutMethod.REMOVE
  else:
    return None


if __name__ == "__main__":
  #print(HTTPHelper().get_http_code(StatusCode.FORBIDDEN))

  test_event = {
    "http-method": "POST",
    "payload": {
        "user_id": "5840d373-8490-4cd6-93e6-8f3b23519829",
        "body": {
          "name": "projectName",
          "description": "Test Project"
        }
    }
  }

  print(handler(test_event, None))
