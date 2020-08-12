import os
from db_get_service import DBService
from bson import json_util
import json

def handler(event, context):

  if("queryId" in event):
    id = event["queryId"]
  else:
    return {
      "statusCode": 400,
      "body": {
        "error": "No queryId HTTP parameter found."
      }
    }

  db_service = DBService(os.environ["MONGO"])

  result = db_service.get_search(id)

  if(result is not None):
    response = {
      "statusCode": 200,
      "body": result
    }
  else:
    response = {
      "statusCode": 404,
      "body": "Requested search not found"
    }

  return json.loads(json_util.dumps(response))
