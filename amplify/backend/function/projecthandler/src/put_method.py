from enum import Enum


class PutMethod(Enum):

    ADD = 0
    REPLACE = 1
    REMOVE = 2


class StatusCode(Enum):
    FORBIDDEN = 0
    NOTFOUND = 1
    SUCCESS = 2
    CREATED = 3
    FAILED = 4


class HTTPHelper:
    def get_http_code(self, statusCode):
        if statusCode == StatusCode.SUCCESS:
            return 200
        elif statusCode == StatusCode.CREATED:
            return 201
        elif statusCode == StatusCode.FORBIDDEN:
            return 403
        elif statusCode == StatusCode.NOTFOUND:
            return 404
        else:
            return 500