import pymongo
from bson.objectid import ObjectId

class DBService:

    def __init__(self, connection_string):
        db_client = pymongo.MongoClient(connection_string)

        self.db = db_client.slrdb

    def fetch_search_results(self, search_id, start, count):
        searches = self.db.searches

        pipeline = [
            {'$lookup': {'from': 'results',
                         'localField': 'results',
                         'foreignField': '_id',
                         'as': 'records'}},
            {'$match': {
                '_id': ObjectId(search_id)
            }}]

        result = list(searches.aggregate(pipeline))[0]

        if "date" not in result:
            return None
        else:
            return result["records"]

    def get_search(self, search_id):
        pipeline = [
            {"$match": {
                "_id": ObjectId(search_id)
            }},
            {"$lookup": {
                "from": "terms",
                "localField": "terms",
                "foreignField": "_id",
                "as": "terms"
            }},
            {"$lookup": {
                "from": "results",
                "localField": "results",
                "foreignField": "_id",
                "as": "results"
            }}
        ]

        return list(self.db.searches.aggregate(pipeline))[0]
