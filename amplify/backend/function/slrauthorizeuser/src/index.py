from db_service import DBService

def handler(event, context):

  db_service = DBService()

  path = event["request"]["path"].split("/")
  path.pop(0)
  method = event["request"]["method"]

  authorized = False
  status = 500

  if len(path) == 1:
    if path[0] == "projects" or path[0] == "find_user":
      authorized = db_service.user_exists(event["user-id"])

  elif len(path) > 1:
    if path[0] == "projects":
      if len(path) == 2:
        if method == "DELETE":
          authorized = db_service.user_owns_project(event["user-id"], event["project-id"])
        elif method == "GET":
          authorized = db_service.user_can_edit_project(event["user-id"], event["project-id"])
      elif len(path) == 3:
        if path[2] == "collabs":
          if method == "POST" or method == "DELETE":
            authorized = db_service.user_owns_project(event["user-id"], event["project-id"])
          elif method == "GET":
            authorized = db_service.user_can_edit_project(event["user-id"], event["project-id"])
        elif path[2] == "labels" or path[2] == "meta" or path[2] == "results" or path[2] == "searches":
          authorized = db_service.user_can_edit_project(event["user-id"], event["project-id"])
      elif len(path) > 3:
        authorized = db_service.user_can_edit_project(event["user-id"], event["project-id"])

  if not authorized:
    if not db_service.user_exists(event["user-id"]):
      status = 404
  else:
    status = 200

  return {
    "status": status
  }
