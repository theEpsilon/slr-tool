import json
from datetime import date
from pymongo import MongoClient
from bson import ObjectId
import os


# function to establish connection to db
# returns connection to db
def get_connection():
    '''Function to establish connection to db

    Returns
    -------
    MongoClient
        Client to handle db stuff
    '''
    return MongoClient(os.environ["MONGO"])


def create_search(search_data, user_id, review_id=None):
    '''Create a search document

    Creates a search document from search_data, including terms and results
    example_search_data = {
        "name": "name of search",
        "query": {
            ...
        },
        "terms": [
            {
                ...
            },
            {
                ...
            },
            ...
        ],
        "results":[
            {
                "authors": [
                    {
                        "names": [
                            "T"
                        ],
                        "lastname": "Iokibe"
                    }
                ],
                "type": "Conferences",
                "title": "Predicting combustion pressure of automobile engine employing chaos theory",
                "abstract": "abstext bacihbcn",
                "date": "29 July-1 Aug. 2001",
                "doi": "10.1109/CIRA.2001.1013254",
                "link": "https://ieeexplore.ieee.org/document/1013254/",
                "source": "IEEE"
            },
            {
                "authors": [
                    {
                        "names": [
                            "O.-S"
                        ],
                        "lastname": "Marco"
                    },
                    {
                        "names": [
                            "R.P"
                        ],
                        "lastname": "Alejandro"
                    },
                ],
                "type": "Conferences",
                "title": "Dynamic analysis of active filters using Chaos theory",
                "abstract": "abstext",
                "date": "4-6 June 2003",
                "doi": "10.1109/ACC.2003.1243436",
                "issn": "0743-1619",
                "link": "https://ieeexplore.ieee.org/document/1243436/",
                "source": "IEEE"
            }
        ],
        "total": 124,
        "springer_total": 123,
        "ieee_total": 1
    }

    Parameters
    ----------
    search_data : json
        Json with infos about the search and the results
    user_id : str
        User ID
    review_id : str, optional
        Review ID if search belongs to a Project

    Returns
    -------
    list
        List with Result ID's
    '''

    # db connection
    connection = get_connection()
    db = connection.slrdb

    # insert terms into db
    term_ids = []
    for term in search_data['terms']:
        term_ids.append(create_term(term, user_id))

    # prepare data for search to insert
    insert_data = {
        "name": search_data['name'],
        "date": str(date.today()),
        "terms": term_ids,
        "query": search_data['query'],
        "results": [],
        "total": search_data['total']
    }
    if "springer_total" in search_data:
        insert_data.update({"springer_total": search_data["springer_total"]})
    if "elsevier_total" in search_data:
        insert_data.update({"elsevier_total": search_data["elsevier_total"]})
    if "ieee_total" in search_data:
        insert_data.update({"ieee_total": search_data["ieee_api"]})

    # pprint.PrettyPrinter(indent=4).pprint(insert_data)
    # insert search to db
    search_id = db.searches.insert_one(insert_data).inserted_id
    # print(search_id)

    # update searches in user Collection
    update_json = {'$push':{"searches":ObjectId(search_id)}}
    db.users.update_one({'_id': ObjectId(user_id)}, update_json)

    # if review given update searches in review
    if review_id != None:
        update_json = {'$push':{"searches":ObjectId(search_id)}}
        db.users.update_one({'_id': ObjectId(review_id)}, update_json)

    # insert/update results to search
    insert_search_results(search_data["results"], search_id)
    return search_id


# creates a term document with the given term and link it to a user
# returns obejct_id of created term
def create_term(term, user_id):
    '''Insert a term into db

    Parameters
    ----------
    term : json
        Json with infos about the term

    Returns
    -------
    str
        ID of the inserted term
    '''
    connection = get_connection()
    db = connection.slrdb
    return db.terms.insert_one({"type": term["type"], "term": term["term"], "description": term["description"], "added_by": ObjectId(user_id)}).inserted_id


# checks if results with specified doi existsting and get the the object_id's of it if so
# or insert it to the db if not
# results = List with resultobeject from the api calls
# returns List of object_id's of the results
def insert_search_results(results, search_id):
    connection = get_connection()
    db = connection.slrdb
    record_ids = []
    for record in results:
        doi = db.results.find({"doi": str(record['doi'])})
        if db.results.count_documents({"doi": str(record['doi'])}) != 0:
            record_id = db.results.find({"doi": str(record['doi'])})[0]["_id"]
            record_ids.append(record_id)
        else:
            insert_data = record
            insert_data.update({"date_added": str(date.today())})
            record_id = db.results.insert_one(insert_data).inserted_id
            record_ids.append(record_id)
        update_json = {'$push':{"results":record_id}}
        db.searches.update_one({'_id': search_id}, update_json)
    return record_ids


# function to get all results of a "Quick-search"
# search_id = id of quicksearch to get results from
# returns list of result objects
def get_quick_search_results(search_id):
    connection = get_connection()
    db = connection.slrdb
    pipeline = [
    {'$lookup': {'from' : 'results',
        'localField' : 'results',
        'foreignField' : '_id',
        'as' : 'records'}},
    {'$match': {'_id' : search_id}}]
    return list(db.searches.aggregate(pipeline))[0]['records']


# just to test
if __name__ == "__main__":
    search_data = {
        "name": "name of search",
        "query": {
            "condition": "AND",
            "rules": [
                {
                    "field": "article_title",
                    "id": "article_title",
                    "input": "text",
                    "operator": "contains",
                    "type": "string",
                    "value": "chaos"
                },
                {
                    "field": "openaccess",
                    "id": "openaccess",
                    "input": "select",
                    "operator": "equal",
                    "type": "integer",
                    "value": 1
                }
            ],
            "valid": True
        },
        "terms": [
            {
                'type': 'Article Title',
                'term': 'systematic review',
                'description': ''
            },
            {
                'type': 'Open Access',
                'term': 'False',
                'description': ''
            }
        ],
        "results":[
            {
                "authors": [
                    {
                        "names": [
                            "T"
                        ],
                        "lastname": "Iokibe"
                    }
                ],
                "type": "Conferences",
                "title": "Predicting combustion pressure of automobile engine employing chaos theory",
                "abstract": "abstext bacihbcn",
                "date": "29 July-1 Aug. 2001",
                "doi": "10.1109/CIRA.2001.1013254",
                "link": "https://ieeexplore.ieee.org/document/1013254/",
                "source": "IEEE"
            },
            {
                "authors": [
                    {
                        "names": [
                            "O.-S"
                        ],
                        "lastname": "Marco"
                    },
                    {
                        "names": [
                            "R.P"
                        ],
                        "lastname": "Alejandro"
                    },
                ],
                "type": "Conferences",
                "title": "Dynamic analysis of active filters using Chaos theory",
                "abstract": "abstext",
                "date": "4-6 June 2003",
                "doi": "10.1109/ACC.2003.1243436",
                "issn": "0743-1619",
                "link": "https://ieeexplore.ieee.org/document/1243436/",
                "source": "IEEE"
            }
        ],
        "total": 123,
        "springer_total": 123
    }
    create_search(search_data, '5f03d7f7642dd37d53562ec1')
    # print(create_term({'type': 'Article Title', 'term': 'therory', 'description': ''}, '5f03d7f7642dd37d53562ec1'))
