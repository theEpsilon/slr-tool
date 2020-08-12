import pymongo
from bson.objectid import ObjectId
import json
from bson import json_util

class DBService:

    def __init__(self, connection_string):
        db_client = pymongo.MongoClient(connection_string)

        self.db = db_client.slrdb

    def get_projects(self, user_id):
        pipeline = [
            {'$match': {
                'sub': user_id
            }},
            {'$lookup': {'from': 'reviews',
                         'localField': 'projects',
                         'foreignField': '_id',
                         'as': 'projects'}},
            {"$unwind": "$projects"},
            {"$replaceRoot": {"newRoot": "$projects"}},
            {"$addFields": {
                "result_count": {"$size": "$results"}
            }},
            {"$project": {"terms": 0, "searches": 0, "collabs": 0, "results": 0}}
        ]

        return json.loads(json_util.dumps(list(self.db.users.aggregate(pipeline))))

    def get_searches(self, user_id):
        pipeline = [
            {'$match': {
                'sub': user_id
            }},
            {'$lookup': {'from': 'searches',
                         'localField': 'searches',
                         'foreignField': '_id',
                         'as': 'searches'}},
            {"$unwind": "$searches"},
            {"$match": {"searches.date": {"$exists": True}}},
            {"$replaceRoot": {"newRoot": "$searches"}},
            {"$addFields": {
                "result_count": {"$size": "$results"}
            }},
            {"$project": {"results": 0}}
        ]

        return json.loads(json_util.dumps(list(self.db.users.aggregate(pipeline))))

    def get_user_details(self, user_id):
        pipeline = [
            {'$match': {
                'sub': user_id
            }},
            {'$lookup': {'from': 'reviews',
                         'localField': 'projects',
                         'foreignField': '_id',
                         'as': 'projects'}},
            {"$addFields": {
                "projects": {
                    "$map": {
                        "input": "$projects",
                        "as": "row",
                        "in": {
                            "_id": "$$row._id",
                            "name": "$$row.name",
                            "description": "$$row.description",
                            "result_count": {"$size": "$$row.results"}
                        }
                    }
                }
            }},
            {'$lookup': {'from': 'searches',
                         'localField': 'searches',
                         'foreignField': '_id',
                         'as': 'searches'}},
            {"$addFields": {
                "searches": {
                    "$filter": {
                        "input": '$searches',
                        "as": 'row',
                        "cond": {"$gt": ["$$row.date", None]}
                    }
                }
            }},
            {"$addFields": {
                "searches": {
                    "$map": {
                        "input": "$searches",
                        "as": "row",
                        "in": {
                            "_id": "$$row._id",
                            "date": "$$row.date",
                            "querries": "$$row.querries",
                            "result_count": {"$size": "$$row.results"}
                        }
                    }
                }
            }},
            {"$project": {"_id": 0, "sub": 0}}
        ]

        return json.loads(json_util.dumps(list(self.db.users.aggregate(pipeline))[0]))

    def authorize_user(self, user_id):
        user = self.db.users.find_one({"sub": user_id})

        if user is None:
            return False
        else:
            return True