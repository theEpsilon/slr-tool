import pymongo
from bson import ObjectId, json_util
from datetime import date
import json
import os

class DBService:

    def __init__(self):
        self.db = pymongo.MongoClient(os.environ["MONGO"]).slrdb

    ###############
    #   COLLABS   #
    ###############

    def add_collab_to_project(self, project_id, user_sub):
        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$addToSet": {"collabs": user_sub}})
        self.db.users.update_one({"sub": user_sub}, {"$addToSet": {"projects": ObjectId(project_id)}})

        return self.get_collabs(project_id)

    def remove_collab_from_project(self, project_id, user_sub):
        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"collabs": user_sub}})
        self.db.users.update_one({"sub": user_sub}, {"$pull": {"projects": ObjectId(project_id)}})

        return self.get_collabs(project_id)

    def get_collabs(self, project_id):
        pipeline = [
            {"$match": {
                "_id": ObjectId(project_id)
            }},
            {"$unwind": "$collabs"},
            {"$lookup": {
                "from": "users",
                "localField": "collabs",
                "foreignField": "sub",
                "as": "collabs"
            }},
            {"$project": {
                "_id": 0, "collabs.sub": 1, "collabs.username": 1, "collabs.name": 1
            }},
            {"$unwind": "$collabs"},
            {"$replaceRoot": {
                "newRoot": "$collabs"
            }}
        ]

        return list(self.db.reviews.aggregate(pipeline))

    ###############
    #   COMMENTS  #
    ###############

    def add_comment_to_result(self, project_id, result_id, user_id, comment):
        #TODO: Validate comment object

        comment["_id"] = ObjectId()
        comment["date"] = str(date.today())
        comment["user"] = user_id

        self.db.reviews.update_one({"_id": ObjectId(project_id), "results._id": ObjectId(result_id)}, {"$push": {"results.$.comments": comment}})

        return self.get_comments_for_result(project_id, result_id)

    def delete_comment_from_result(self, project_id, result_id, comment_id):

        self.db.reviews.update_one({"_id": ObjectId(project_id), "results._id": ObjectId(result_id)}, {"$pull": {"results.$.comments": {"_id": ObjectId(comment_id)}}})

        return self.get_comments_for_result(project_id, result_id)

    def get_comments_for_result(self, project_id, result_id):

        pipeline = [
            {"$match": {
                "_id": ObjectId(project_id)
            }},
            {"$unwind": "$results"},
            {"$match": {
                "results._id": ObjectId(result_id)
            }},
            {"$replaceRoot": {
                "newRoot": "$results"
            }},
            {"$unwind": "$comments"},
            {"$lookup": {
                "from": "users",
                "localField": "comments.user",
                "foreignField": "sub",
                "as": "comments.user"
            }},
            {"$unwind": "$comments.user"},
            {"$project": {
                "_id": 0, "comments": 1
            }},
            {
                "$replaceRoot": {
                    "newRoot": "$comments"
                }
            },
            {
                "$project": {
                    "user._id": 0, "user.searches": 0, "user.projects": 0
                }
            }
        ]

        return list(self.db.reviews.aggregate(pipeline))

    #######################
    #   PROJECT LABELS    #
    #######################

    def add_label_to_project(self, project_id, label):
        label["_id"] = ObjectId()

        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$push": {"labels": label}})

        return label

    def remove_label_from_project(self, project_id, label_id):

        #Remove Label from project field
        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"labels": {"_id": ObjectId(label_id)}}})

        #Remove label from all results inside the project
        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"results.$[].labels": ObjectId(label_id)}})

        return self.get_labels_in_project(project_id)

    def update_label_in_project(self, project_id, label_id, label):
        #TODO: Validate label object

        label["_id"] = label_id

        self.db.reviews.update_one({"_id": ObjectId(project_id), "labels._id": ObjectId(label_id)}, {"$set": {"labels.$": label}})

        return label

    def get_labels_in_project(self, project_id):

        return self.db.reviews.find_one({"_id": ObjectId(project_id)})["labels"]

    #######################
    #    RESULT LABELS    #
    #######################

    def add_label_to_result(self, project_id, result_id, label_id):
        self.db.reviews.update_one({"_id": ObjectId(project_id), "results._id": ObjectId(result_id)}, {"$addToSet": {"results.$.labels": ObjectId(label_id)}})

        return self.get_result_in_project(project_id, result_id)

    def remove_label_from_result(self, project_id, result_id, label_id):
        self.db.reviews.update_one({"_id": ObjectId(project_id), "results._id": ObjectId(result_id)},
                                   {"$pull": {"results.$.labels": ObjectId(label_id)}})

        return self.get_result_in_project(project_id, result_id)

    ################
    #   RESULTS    #
    ################

    def add_result_to_project(self, project_id, result_id):
        result = {
            "_id": ObjectId(result_id),
            "labels": [],
            "comments": []
        }

        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$push": {"results": result}})

        return {
            "message": "Added successfully"
        }

    def remove_result_from_project(self, project_id, result_id):

        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"results": {"_id": ObjectId(result_id)}}})

        return {
            "message": "Removed successfully"
        }

    def get_result_in_project(self, project_id, result_id):
        pipeline = [
            {"$match": {
                "_id": ObjectId(project_id)
            }},
            {"$unwind": "$results"},
            {"$match": {
                "results._id": ObjectId(result_id)
            }},
            {"$lookup": {
                "from": "results",
                "localField": "results._id",
                "foreignField": "_id",
                "as": "results.result"
            }},
            {"$unwind": {
                "path": "$results.labels",
                "preserveNullAndEmptyArrays": True
            }},
            {"$set": {
                "results.labels": {
                    "$filter": {
                        "input": "$labels",
                        "as": "labels",
                        "cond": {
                            "$eq": [
                                "$$labels._id",
                                "$results.labels"
                            ]
                        }
                    }
                }
            }},
            {"$unwind": {
                "path": "$results.labels",
                "preserveNullAndEmptyArrays": True
            }},
            {
                "$replaceRoot": {
                    "newRoot": "$results"
                }
            },
            {"$group": {
                "_id": "$_id",
                "labels": {
                    "$push": "$labels"
                },
                "comments": {
                    "$first": "$comments"
                },
                "result": {
                    "$first": "$result"
                }
            }},
            {"$unwind": {
                "path": "$comments",
                "preserveNullAndEmptyArrays": True
            }},
            {"$lookup": {
                "from": "users",
                "localField": "comments.user",
                "foreignField": "sub",
                "as": "comments.user"
            }},
            {"$unwind": {
                "path": "$comments.user",
                "preserveNullAndEmptyArrays": True
            }},
            {"$project": {
                "comments.user.searches": 0, "comments.user.projects": 0, "comments.user._id": 0
            }},
            {"$group": {
                "_id": "$_id",
                "labels": {
                    "$first": "$labels"
                },
                "comments": {
                    "$push": {
                        "$cond": [
                            {"$gt": ["$comments", {}]},
                            "$comments",
                            "$$REMOVE"
                        ]
                    }
                },
                "result": {
                    "$first": "$result"
                }
            }},
            {"$unwind": "$result"},
            {"$project": {
                "_id": 0
            }}
        ]

        return list(self.db.reviews.aggregate(pipeline))[0]

    def get_all_results_in_project(self, project_id, filter = None, sort_order = None):

        filters = []

        if filter is not None:
            filters = list(map(lambda x: ObjectId(x), filter.split(" ")))

        print(filters)

        if sort_order is not None:
            sort = sort_order.split("_")

            if sort[1] == "asc":
                sort[1] = 1
            else:
                sort[1] = -1
        else:
            sort = ["date", -1]

        pipeline = [
            {"$match": {
                "_id": ObjectId(project_id)
            }},
            {"$unwind": "$results"},
            {"$lookup": {
                "from": "results",
                "localField": "results._id",
                "foreignField": "_id",
                "as": "results.result"
            }},
            {"$unwind": {
                "path": "$results.labels",
                "preserveNullAndEmptyArrays": True
            }},
            {"$set": {
                "results.labels": {
                    "$filter": {
                        "input": "$labels",
                        "as": "labels",
                        "cond": {
                            "$eq": [
                                "$$labels._id",
                                "$results.labels"
                            ]
                        }
                    }
                }
            }},
            {"$unwind": {
                "path": "$results.labels",
                "preserveNullAndEmptyArrays": True
            }},
            {
                "$replaceRoot": {
                    "newRoot": "$results"
                }
            },
            {"$group": {
                "_id": "$_id",
                "labels": {
                    "$push": {
                        "$cond": [
                            {"$gt": ["$labels", None]},
                            "$labels",
                            "$$REMOVE"
                        ]
                    }
                },
                "comments": {
                    "$first": "$comments"
                },
                "result": {
                    "$first": "$result"
                }
            }},
            {"$unwind": {
                "path": "$comments",
                "preserveNullAndEmptyArrays": True
            }},
            {"$lookup": {
                "from": "users",
                "localField": "comments.user",
                "foreignField": "sub",
                "as": "comments.user"
            }},
            {"$unwind": {
                "path": "$comments.user",
                "preserveNullAndEmptyArrays": True
            }},
            {"$project": {
                "comments.user.searches": 0, "comments.user.projects": 0, "comments.user._id": 0
            }},
            {"$group": {
                "_id": "$_id",
                "labels": {
                    "$first": "$labels"
                },
                "comments": {
                    "$push": {
                        "$cond": [
                            {"$gt": ["$comments", {}]},
                            "$comments",
                            "$$REMOVE"
                        ]
                    }
                },
                "result": {
                    "$first": "$result"
                }
            }},
            {"$project": {
                "_id": 0
            }},
            {"$unwind": "$result"},
            {"$match": {
                "$expr": {
                    "$cond": [
                        {"$gt": [filter, None]},
                        {"$setIsSubset": [filters, "$labels._id"]},
                        True
                    ]
                }
            }},
            {"$sort": {
                "result." + sort[0]: sort[1]
            }}
        ]

        print(type(filters))

        return list(self.db.reviews.aggregate(pipeline))

    ################
    #   SEARCHES   #
    ################

    def add_search_to_project(self, project_id, search_id, add_results = False):

        search_object = self.db.searches.find_one({"_id": ObjectId(search_id)})

        if add_results:
            results = search_object["results"]
        else:
            results = []

        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$addToSet": {"searches": ObjectId(search_id),
                                                                                 "results": {"$each": results},
                                                                                 "terms": {"$each": search_object["terms"]}}})

        return {
            "message": "Added successfully"
        }

    def remove_search_from_project(self, project_id, search_id):
        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$pull": {"searches": ObjectId(search_id)}})

        return {
            "message": "Removed successfully"
        }

    ################
    #     META     #
    ################

    def change_meta_info(self, project_id, meta_object):
        #TODO: Validate meta object

        #{
        #   "name": "<name>",
        #   "description": "<description>"
        #}

        self.db.reviews.update_one({"_id": ObjectId(project_id)}, {"$set": {"name": meta_object["name"], "description": meta_object["description"]}})

        return meta_object

    def get_project(self, project_id):
        pipeline = [
            {"$match": {
                "_id": ObjectId(project_id)
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
            {"$unwind": "$searches"},
            {"$set": {
                "searches.terms": {
                    "$size": "$searches.terms"
                },
                "searches.results": {
                    "$size": "$searches.results"
                }
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
                    "results": "/project/" + project_id + "/results",
                    "collabs": "/project/" + project_id + "/collabs",
                    "labels": "/project/" + project_id + "/labels",
                    "meta": "/project/" + project_id + "/meta"
                }
            }}
        ]

        return list(self.db.reviews.aggregate(pipeline))[0]

    ################
    #     USER     #
    ################

    def find_user(self, username = None, name = None):
        # TODO: Validate user request object

        if username is None and name is None:
            return None

        matching_object = {}

        if username is not None:
            matching_object["username"] = username
        if name is not None:
            matching_object["name"] = name

        pipeline = [
            {"$match": matching_object},
            {"$project": {
                "_id": 0, "temp_searches": 0, "projects": 0, "searches": 0
            }}
        ]

        return list(self.db.users.aggregate(pipeline))


if __name__ == "__main__":
    db = DBService()

    # pipeline = [
    #     {"$match": {
    #         "_id": ObjectId("5f0db46c377c3ce2c35cd67e")
    #     }},
    #     {"$unwind": "$results"},
    #     {"$match": {
    #         "results._id": ObjectId("5ef003e7b3a3406cf571d6b2")
    #     }},
    #     {"$lookup": {
    #         "from": "results",
    #         "localField": "results._id",
    #         "foreignField": "_id",
    #         "as": "results.result"
    #     }},
    #     {"$unwind": {
    #         "path": "$results.labels",
    #         "preserveNullAndEmptyArrays": True
    #     }},
    #     {"$set": {
    #         "results.labels": {
    #             "$filter": {
    #                 "input": "$labels",
    #                 "as": "labels",
    #                 "cond": {
    #                     "$eq": [
    #                         "$$labels._id",
    #                         "$results.labels"
    #                     ]
    #                 }
    #             }
    #         }
    #     }},
    #     {"$unwind": {
    #         "path": "$results.labels",
    #         "preserveNullAndEmptyArrays": True
    #     }},
    #     {
    #         "$replaceRoot": {
    #             "newRoot": "$results"
    #         }
    #     },
    #     {"$group": {
    #         "_id": "$_id",
    #         "labels": {
    #             "$push": "$labels"
    #         },
    #         "comments": {
    #             "$first": "$comments"
    #         },
    #         "result": {
    #             "$first": "$result"
    #         }
    #     }},
    #     {"$unwind": {
    #         "path": "$comments",
    #         "preserveNullAndEmptyArrays": True
    #     }},
    #     {"$lookup": {
    #         "from": "users",
    #         "localField": "comments.user",
    #         "foreignField": "sub",
    #         "as": "comments.user"
    #     }},
    #     {"$unwind": {
    #         "path": "$comments.user",
    #         "preserveNullAndEmptyArrays": True
    #     }},
    #     {"$project": {
    #         "comments.user.searches": 0, "comments.user.projects": 0, "comments.user._id": 0
    #     }},
    #     {"$group": {
    #         "_id": "$_id",
    #         "labels": {
    #             "$first": "$labels"
    #         },
    #         "comments": {
    #             "$push": {
    #                 "$cond": [
    #                     {"$gt": ["$comments", {}]},
    #                     "$comments",
    #                     "$$REMOVE"
    #                 ]
    #             }
    #         },
    #         "result": {
    #             "$first": "$result"
    #         }
    #     }},
    #     {"$unwind": "$result"},
    #     {"$project": {
    #         "_id": 0
    #     }}
    # ]
    #
    # print(list(db.db.reviews.aggregate(pipeline)))

    #print(db.get_all_results_in_project("5f1762e130b3254a781fe48e"))

    print(db.find_user("coll1@example.de"))

    #print(db.add_label_to_project("5f0db46c377c3ce2c35cd67e", {"name": "Test Label", "color": "#E91E63"}))
    #print(db.add_label_to_result("5f0db46c377c3ce2c35cd67e", "5ef003e7b3a3406cf571d6b0", "5f10911513c0671e78219027"))

    #print(db.add_collab_to_project("5f04f6605cdf30a746ef211d", "ff0c664a-9048-4680-8560-cb1e903274e6"))

    #print(db.get_collabs("5f04f6605cdf30a746ef211d"))
    # print(db.get_all_results_in_project("5f04f6605cdf30a746ef211d"))
    # print(db.get_labels_in_project("5f04f6605cdf30a746ef211d"))
    #print(db.get_comments_for_result("5f04f6605cdf30a746ef211d", "5ee9568a61e11a8c28261b62"))
    #print(db.get_result_in_project("5f04f6605cdf30a746ef211d", "5ee9568a61e11a8c28261b5e"))
