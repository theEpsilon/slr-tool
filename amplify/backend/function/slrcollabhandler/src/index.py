import boto3
import json
from bson import json_util
from db_service import DBService
from event_validator import EventValidator

def handler(event, context):

  validator = EventValidator(event)

  if not validator.validate_event():
    return {
      "statusCode": 400,
      "body": "Bad Request"
    }

  path = event["request"]["path"].split("/")
  path.pop(0)
  method = event["request"]["method"]

  auth_request = {
    "request": event["request"],
    "user-id": event["queryparams"]["user-id"]
  }

  if len(path) >= 2:
    auth_request["project-id"] = event["urlparams"]["project-id"]

  boto3_client = boto3.client('lambda', region_name='eu-central-1')
  auth_response = boto3_client.invoke(FunctionName='slrauthorizeuser-fabi', InvocationType='RequestResponse', Payload=json.dumps(auth_request))

  auth_response = json.loads(auth_response["Payload"].read().decode())

  if auth_response["status"] == 403:
    return {
      "statusCode": 403,
      "body": "Permission denied"
    }
  elif auth_response["status"] == 404:
    return {
      "statusCode": 404,
      "body": "User not found"
    }
  elif auth_response["status"] == 500:
    return {
      "statusCode": 500,
      "body": "Server Error"
    }

  db_service = DBService()

  url_params = event["urlparams"]
  query_params = event["queryparams"]

  if "payload" in event:
    payload = event["payload"]
  else:
    payload = {}

  result = "Error"

  if len(path) == 1:
    if path[0] == "projects":
      if method == "POST":
        # Handled in different Lambda
        pass
      elif method == "GET":
        # Handled in different Lambda
        pass

    elif path[0] == "find_user":
      if "username" in query_params and query_params["username"] != "":
        if "name" in query_params and query_params["name"] != "":
          result = db_service.find_user(query_params["username"], query_params["name"])
        else:
          result = db_service.find_user(username=query_params["username"])
      elif "name" in query_params and query_params["name"] != "":
        result = db_service.find_user(name=query_params["name"])

  elif len(path) == 3:
    if path[2] == "results":
      if method == "GET":
        if "filter" in query_params and query_params["filter"] != "":
          result = db_service.get_all_results_in_project(url_params["project-id"], query_params["filter"])
        else:
          result = db_service.get_all_results_in_project(url_params["project-id"])

      elif method == "POST":
        result = db_service.add_result_to_project(url_params["project-id"], payload["result-id"])

    if path[2] == "collabs":
      if method == "GET":
        result = db_service.get_collabs(url_params["project-id"])

      elif method == "POST":
        result = db_service.add_collab_to_project(url_params["project-id"], payload["user-id"])

      elif method == "DELETE":
        result = db_service.remove_collab_from_project(url_params["project-id"], query_params["del-id"])

    elif path[2] == "labels":
      if method == "GET":
        result = db_service.get_labels_in_project(url_params["project-id"])

      elif method == "POST":
        result = db_service.add_label_to_project(url_params["project-id"], payload)

      elif method == "DELETE":
        result = db_service.remove_label_from_project(url_params["project-id"], query_params["label-id"])

      elif method == "PUT":
        result = db_service.update_label_in_project(url_params["project-id"], query_params["label-id"], payload)

    elif path[2] == "searches":
      if method == "POST":
        result = db_service.add_search_to_project(url_params["project-id"], payload["search-id"], payload["add-results"])

      elif method == "DELETE":
        result = db_service.remove_search_from_project(url_params["project-id"], query_params["search-id"])

    elif path[2] == "meta":
      if method == "PUT":
        result = db_service.change_meta_info(url_params["project-id"], payload)

  elif len(path) > 3:
    if len(path) == 4 and path[2] == "results":
      if method == "DELETE":
        result = db_service.remove_result_from_project(url_params["project-id"], url_params["result-id"])

      elif method == "GET":
        result = db_service.get_result_in_project(url_params["project-id"], url_params["result-id"])

    elif len(path) > 4:
      if path[4] == "labels":
        if method == "GET":
          # Not considered necessary
          pass

        elif method == "POST":
          result = db_service.add_label_to_result(url_params["project-id"], url_params["result-id"], payload["label-id"])

        elif method == "DELETE":
          result = db_service.remove_label_from_result(url_params["project-id"], url_params["result-id"], query_params["label-id"])

      elif path[4] == "comments":
        if method == "GET":
          result = db_service.get_comments_for_result(url_params["project-id"], url_params["result-id"])

        elif method == "POST":
          result = db_service.add_comment_to_result(url_params["project-id"], url_params["result-id"], query_params["user-id"], payload)

        elif method == "DELETE":
          result = db_service.delete_comment_from_result(url_params["project-id"], url_params["result-id"], query_params["comment-id"])



  return {
    "statusCode": 200,
    "body": json.loads(json_util.dumps(result))
  }
