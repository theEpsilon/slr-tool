import pymongo
from bson import ObjectId
import os

class DBService:

    def __init__(self):
        self.db = pymongo.MongoClient(os.environ["MONGO"]).slrdb

    def user_exists(self, user_sub):

        print(user_sub)

        if self.db.users.find_one({"sub": user_sub}) is not None:
            return True
        else:
            return False

    def user_owns_project(self, user_sub, project_id):
        project_id = ObjectId(project_id)

        if project_id in self.db.users.find_one({"sub": user_sub})["projects"]:
            return True
        else:
            return False

    def user_can_edit_project(self, user_sub, project_id):
        pipeline = [
            {"$match": {
                "sub": user_sub
            }},
            {'$lookup': {
                'from': 'reviews',
                'localField': 'projects',
                'foreignField': '_id',
                'as': 'projects'
            }},
            {"$unwind": "$projects"},
            {"$match": {
                "projects._id": ObjectId(project_id)
            }},
            {"$replaceRoot": {
                "newRoot": "$projects"
            }},
            {"$project": {
                "collabs": 1
            }}
        ]

        project = list(self.db.users.aggregate(pipeline))

        if len(project) >= 1:
            return True
        elif user_sub in project[0]["collabs"]:
            return True
        else:
            return False


if __name__ == "__main__":
    db = DBService()

    user_sub = "5840d373-8490-4cd6-93e6-8f3b23519829"
    project = "5f04f6605cdf30a746ef211d"


    #print(list(db.db.users.aggregate(pipeline)))

    print(db.user_exists("5840d373-8490-4cd6-93e6-8f3b23519829"))