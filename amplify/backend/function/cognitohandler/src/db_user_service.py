import pymongo

class DBService:

    def __init__(self, connection_string):
        db_client = pymongo.MongoClient(connection_string)

        self.db = db_client.slrdb

    def createUser(self, userData):

        userAttributes = userData["request"]["userAttributes"]

        newUser = {
            "sub": userAttributes["sub"],
            "username": userAttributes["email"],
            "name": userAttributes["name"],
            "searches": [],
            "projects": []
        }

        self.db.users.insert_one(newUser)
