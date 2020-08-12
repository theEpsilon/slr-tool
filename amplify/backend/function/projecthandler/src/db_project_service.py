import pymongo
from bson.objectid import ObjectId
from put_method import PutMethod, StatusCode
from datetime import date
import json
from bson import json_util

class DBService:

    def __init__(self, connection_string):
        db_client = pymongo.MongoClient(connection_string)

        self.db = db_client.slrdb

    ######################
    # MAIN HANDLERS
    ######################

    def update_project(self, method, projectData):

        project = {}

        if method == PutMethod.ADD:
            self.add_to_project(projectData["body"], projectData["project_id"])

        elif method == PutMethod.REPLACE:
            self.replace_in_project(projectData["body"], projectData["project_id"])

        elif method == PutMethod.REMOVE:
            self.remove_from_project(projectData["body"], projectData["project_id"])
        else:
            return StatusCode.FAILED

        return self.get_project(projectData)

    def create_project(self, projectData):

        new_project = {
            "name": projectData["body"]["name"],
            "description": projectData["body"]["description"],
            "terms": [],
            "searches": [],
            "collabs": [],
            "labels": [],
            "results": []
        }

        if "search" in projectData["body"] and projectData["body"]["search"] != "" and projectData["body"]["search"] is not None:
            searchid = ObjectId(projectData["body"]["search"])

            results = list(map(lambda x: {"_id": ObjectId(x), "labels": [], "comments": []}, self.db.searches.find_one({"_id": searchid})["results"]))

            new_project["results"] = results
            new_project["searches"].append(searchid)

        #print(new_project)
        project_id = self.db.reviews.insert_one(new_project).inserted_id

        print(str(project_id))

        self.db.users.update_one({'sub': projectData["user_id"]}, {'$push': {'projects': project_id}})

        # if len(str(project_id)) > 0:
        #     new_project["_id"] = project_id

        return self.get_project({
            "project_id": str(project_id)
        })

    def remove_project(self, projectData):
        self.db.reviews.delete_one({"_id": ObjectId(projectData["project_id"])})
        self.db.users.update_one({"sub": projectData["user_id"]}, {"$pull": {"projects": ObjectId(projectData["project_id"])}})

    def get_project(self, projectData):

        pipeline = [
            {"$match": {
                "_id": ObjectId(projectData["project_id"])
            }},
            {"$set": {
                "results": {
                    "$size": "$results"
                }
            }},
            {
                "$lookup": {
                    "from": "searches",
                    "localField": "searches",
                    "foreignField": "_id",
                    "as": "searches"
                }
            },
            {"$unwind": {
                "path": "$searches",
                "preserveNullAndEmptyArrays": True
            }},
            {"$group": {
                "_id": "$_id",
                "doc": {
                    "$first": "$$ROOT"
                },
                "searches": {
                    "$push": "$searches"
                }
            }},
            {"$replaceRoot":
                {"newRoot": {
                    "$mergeObjects": [
                        "$doc",
                        {"searches": "$searches"}
                    ]
                }}
            },
            {"$set": {
                "searches.terms": {
                    "$size": "$searches.terms"
                },
                "searches.results": {
                    "$size": "$searches.results"
                }
            }},
            {
                "$lookup": {
                    "from": "terms",
                    "localField": "terms",
                    "foreignField": "_id",
                    "as": "terms"
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "collabs",
                    "foreignField": "sub",
                    "as": "collabs"
                }
            },
            {"$project": {
                "collabs._id": 0,
                "collabs.temp_searches": 0,
                "collabs.searches": 0,
                "collabs.projects": 0
            }},
            {"$addFields": {
                "_links": {
                    "results": "/project/" + projectData["project_id"] + "/results",
                    "collabs": "/project/" + projectData["project_id"] + "/collabs",
                    "labels": "/project/" + projectData["project_id"] + "/labels",
                    "meta": "/project/" + projectData["project_id"] + "/meta"
                }
            }}
        ]

        return json.loads(json_util.dumps(list(self.db.reviews.aggregate(pipeline))[0]))
        #return list(json.dumps(response, default=json_util.default)self.db.reviews.aggregate(pipeline))[0]

    ######################
    # SUB HANDLERS
    ######################

    def add_to_project(self, payload, project_id):
        if "searches" in payload and len(payload["searches"]) > 0:

            searches = list(map(lambda x: ObjectId(x), payload["searches"]))
            #print(searches)
            pipeline = [
                {
                    "$match": {
                        "$expr": {
                            "$in": [
                                "$_id", list(searches)
                            ]
                        }
                    }
                },
                {
                    "$group": {
                        "_id": str(date.today()),
                        "results": {
                            "$push": "$results"
                        }
                    }
                },
                {
                    "$project": {
                        "results": {
                            "$reduce": {
                                "input": "$results",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": [
                                        "$$value",
                                        "$$this"
                                    ]
                                }
                            }
                        }
                    }
                }
            ]

            results = list(map(lambda x: {"_id": x, "labels": [], "comments": []}, list(set(list(self.db.searches.aggregate(pipeline))[0]["results"]))))

            self.db.reviews.update_one({"_id": ObjectId(project_id)},
                                       {"$addToSet": {"searches": {"$each": searches},
                                                      "results": {"$each": results}}})

        elif "results" in payload and len(payload["results"]) > 0:
            results = list(map(lambda x: {"_id": ObjectId(x), "labels": [], "comments": []}, payload["results"]))

            self.db.reviews.update_one({"_id": ObjectId(project_id)},
                                       {"$addToSet": {"results": {"$each": results}}})

        elif "collabs" in payload and len(payload["collabs"]) > 0:
            collab_subs = list(map(lambda x: ObjectId(x), payload["collabs"]))

            self.db.reviews.update_one({"_id": ObjectId(project_id)},
                                       {"$addToSet": {"collabs": {"$each": collab_subs}}})

        elif "labels" in payload and len(payload["labels"]) > 0:
            for label in payload["labels"]:
                if type(label) is dict:
                    label["_id"] = ObjectId()

            self.db.reviews.update_one({"_id": ObjectId(project_id)},
                                       {"$addToSet": {"labels": {"$each": payload["labels"]}}})

    def replace_in_project(self, payload, project_id):

        results = []

        if "searches" in payload:
            searches = list(map(lambda x: ObjectId(x), payload["searches"]))

            pipeline = [
                {
                    "$match": {
                        "$expr": {
                            "$in": [
                                "$_id", list(searches)
                            ]
                        }
                    }
                },
                {
                    "$group": {
                        "_id": str(date.today()),
                        "results": {
                            "$push": "$results"
                        }
                    }
                },
                {
                    "$project": {
                        "results": {
                            "$reduce": {
                                "input": "$results",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": [
                                        "$$value",
                                        "$$this"
                                    ]
                                }
                            }
                        }
                    }
                }
            ]

            results = set(list(self.db.searches.aggregate(pipeline))[0]["results"])

            payload["searches"] = list(searches)

        if "results" in payload:
            new_results = list(map(lambda x: ObjectId(x), payload["results"]))

            results.update(new_results)

        payload["results"] = list(results)

        #print(payload)

        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$set": payload})

    def remove_from_project(self, payload, project_id):

        if "searches" in payload:
            searches = list(map(lambda x: ObjectId(x), payload["searches"]))

            self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"searches": {"$in": searches}}})

        elif "results" in payload:
            results = list(map(lambda x: ObjectId(x), payload["results"]))

            self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"results": {"_id": {"$in": results}}}})

        elif "collabs" in payload:
            collabs = list(map(lambda x: ObjectId(x), payload["collabs"]))

            self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"collabs": {"$in": collabs}}})

        elif "labels" in payload:
            labels = list(map(lambda x: ObjectId(x), payload["labels"]))

            self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"labels": {"$in": labels}}})


    ######################
    # UTIL
    ######################

    def authorize_user(self, user_id, project_id, new_project):
        user = self.db.users.find_one({"sub": user_id})

        if user is None:
            return False

        if project_id is None and new_project:
            return True

        if "projects" in user:
            if ObjectId(project_id) in user["projects"]:
                return True
        else:
            return False