class EventValidator():
    def __init__(self, event):
        self.event = event

    def validate_event(self):
        if not self.valid_request_object():
            return False

        path = self.event["request"]["path"].split("/")
        path.pop()

        if "queryparams" not in self.event:
            return False
        if "user-id" not in self.event["queryparams"]:
            return False

        if (path[0] == "projects" or path[0] == "find_user") and len(path) < 2:
            return True
        elif len(path) >= 2:
            if "urlparams" not in self.event:
                return False
            if "project-id" not in self.event["urlparams"]:
                return False

        return True


    def valid_request_object(self):
        if "request" in self.event:
            if "method" in self.event["request"] and "path" in self.event["request"]:
                return True
        return False
