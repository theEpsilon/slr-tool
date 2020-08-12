import json
from datetime import date
from pymongo import MongoClient
from bson import ObjectId
import springer_api
import elsevier_api
import ieee_api
import os


def handler(event, context):

    springer, elsevier, ieee = False, False, False
    for api in event["event"]["databases"]:
        if api['name'] == 'springer':
            springer = True
        elif api['name'] == 'elsevier':
            elsevier = True
        elif api['name'] == 'ieee':
            ieee = True

    query = event["event"]["query"]

    # read terms from query
    terms = read_terms(query)

    if springer:
        results = springer_api.fetch_all_springer(event["event"]["query"], os.environ["SPRINGER"])
        # add total results for springer (total results already set)
        results.update({"springer_total": int(results["total"])})
    else:
        results = {
            'records': [],
            'total': 0
        }

    # elsevier results
    if elsevier:
        elsevier_results = elsevier_api.fetch_all_elsevier(
            query, os.environ["ELSEVIER"])
        for record in elsevier_results['records']:
            results['records'].append(record)
        # add total results for elsevier and update total results
        results["elsevier_total"] = elsevier_results["total"]
        results.update({"total": int(results["total"]) + int(elsevier_results["total"])})

    # ieee results
    if ieee:
        ieee_results = ieee_api.fetch_all_ieee(query, os.environ["IEEE"])
        for record in ieee_results['records']:
            results['records'].append(record)
        # add total results for ieee and update total results
        results["ieee_total"] = int(ieee_results["total"])
        results.update({"total": int(results["total"]) + int(ieee_results["total"])})

    # remove duplicates
    results = removeDuplicates(results)

    # sort results

    # add searchInfo to results
    if "review_id" in event["event"]:
        results.update({"review_id":  event["event"]["review_id"]})

    results.update({"name": event["event"]['name']})
    results.update({"terms": terms})
    results.update({"query": query})
    results.update({"sub": event["event"]["sub"]})

    print(results)

    search_data = {
        "name": results["name"],
        "terms": results["terms"],
        "query": results["query"],
        "results": results["records"],
        "total": results["total"]
    }

    if "springer_total" in results:
        search_data.update({"springer_total": results["springer_total"]})
    if "elsevier_total" in results:
        search_data.update({"elsevier_total": results["elsevier_total"]})
    if "ieee_total" in results:
        search_data.update({"ieee_total": results["ieee_total"]})

    print(search_data)
    if "review_id" in event["event"]:
        create_search(search_data, results["sub"], results["review_id"])
    else:
        create_search(search_data, results["sub"])

    return {
        'message': 'Done!'
    }


def get_connection():
    '''Function to establish connection to db

    Returns
    -------
    MongoClient
        Client to handle db stuff
    '''
    return MongoClient(os.environ["MONGO"])


def create_search(search_data, sub, review_id=None):
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
        term_ids.append(create_term(term, sub))

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
        insert_data.update({"ieee_total": search_data["ieee_total"]})

    # pprint.PrettyPrinter(indent=4).pprint(insert_data)
    # insert search to db
    search_id = db.searches.insert_one(insert_data).inserted_id
    # print(search_id)

    # update searches in user Collection
    update_json = {'$push':{"searches":ObjectId(search_id)}}
    db.users.update_one({'sub': sub}, update_json)

    # if review given update searches in review
    if review_id != None:
        update_json = {'$push':{"searches":ObjectId(search_id)}}
        db.reviews.update_one({'_id': ObjectId(review_id)}, update_json)

    # insert/update results to search
    insert_search_results(search_data["results"], search_id)
    # print(search_id)
    return search_id


# creates a term document with the given term and link it to a user
# returns obejct_id of created term
def create_term(term, sub):
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
    return db.terms.insert_one({"type": term["type"], "term": term["term"], "description": term["description"], "added_by": sub}).inserted_id


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


def read_terms(query):
    '''Read the terms and put them to a list

    Parameters
    ----------
    query : json
        Json with the query

    Returns
    -------
    list
        List with terms
    '''

    terms = []
    terms = get_terms(query, terms)
    return terms


def get_terms(query, terms):
    '''Helper function to get terms

    Parameters
    ----------
    query : json
        Json with the query
    terms :list
        Empty list

    Returns
    -------
    list
        List with terms
    '''
    for rule in query['rules']:
        if "condition" in rule:
            terms = get_terms(rule, terms)
        else:
            terms.append(handleSingleRule(rule, terms))
    return terms


def removeDuplicates(results):
    """
    Removes duplicates from results json

    Parameters
    ----------
    results : json
        Json with all fetched results
    """

    dois = []
    clean_results = {"records": []}
    for result in results['records']:
        if 'doi' not in result:
            clean_results['records'].append(result)
        elif (result['doi'] not in dois):
            dois.append(result['doi'])
        else:
            results['total'] = int(results['total']) - 1
    for result in results['records']:
        if ('doi' in result and result['doi'] in dois):
            clean_results['records'].append(result)
            dois.remove(result['doi'])
    clean_results.update({"total": results['total']})
    if 'springer_total' in results:
        clean_results.update({"springer_total": results['springer_total']})
    if 'elsevier_total' in results:
        clean_results.update({"elsevier_total": results['elsevier_total']})
    if 'ieee_total' in results:
        clean_results.update({"ieee_total": results['ieee_total']})
    return clean_results


def handleSingleRule(rule, terms):
    '''Helper function to term from a querybuilder rule

    Parameters
    ----------
    rule : json
        Json with the rule of the query
    terms :list
        terms list to add a term

    Returns
    -------
    list
        List with terms
    '''
    if rule['field'] == 'doi':
        term = {
            "type": "DOI",
            "term": rule['value'],
            "description": ""
        }
        return term
    elif rule['field'] == 'keyword':
        term = {
            "type": "Keyword",
            "term": rule['value'],
            "description": ""
        }
        return term
    elif rule['field'] == 'publication_title' and rule['operator'] == 'equals':
        term = {
            "type": "Publication Title",
            "term": rule['value'],
            "description": ""
        }
        return term
    elif rule['field'] == 'publication_year':
        term = {
            "type": "Publication Year",
            "term": rule['value'],
            "description": ""
        }
        return term
    elif rule['field'] == 'isbn':
        term = {
            "type": "ISBN",
            "term": rule['value'],
            "description": ""
        }
        return term
    elif rule['field'] == 'issn':
        term = {
            "type": "ISSN",
            "term": rule['value'],
            "description": ""
        }
        return term
    elif rule['field'] == 'openaccess' and rule['value'] == 1:
        term = {
            "type": "Open Access",
            "term": "True",
            "description": ""
        }
        return term
    elif rule['field'] == 'openaccess' and rule['value'] == 0:
        term = {
            "type": "Open Access",
            "term": "False",
            "description": ""
        }
        return term
    elif rule['field'] == 'article_title':
        term = {
            "type": "Article Title",
            "term": rule['value'],
            "description": ""
        }
        return term
    elif rule['field'] == 'publication_title' and rule['operator'] == 'contains':
        term = {
            "type": "Publication Title",
            "term": rule['value'],
            "description": ""
        }
        return term
    elif rule['field'] == 'author':
        term = {
            "type": "Author",
            "term": rule['value'],
            "description": ""
        }
        return term


if __name__ == "__main__":
    event = {'event': {'query': {'condition': 'AND', 'rules': [{'field': 'article_title', 'id': 'article_title', 'input': 'text', 'operator': 'contains', 'type': 'string', 'value': 'chaos theory'}, {'field': 'openaccess', 'id': 'openaccess', 'input': 'select', 'operator': 'equal', 'type': 'integer', 'value': 1}], 'valid': True}, 'page': 0, 'name': 'hmmmm hmmmmmsssss', 'sub': '149ec720-ccbc-43c3-a854-e70665546ea6', 'review_id': '5f0dc32d9424f7348d240293', 'databases': [{'name': 'springer'}, {'name': 'elsevier'}, {'name': 'ieee'}]}}
    handler(event, 0)
