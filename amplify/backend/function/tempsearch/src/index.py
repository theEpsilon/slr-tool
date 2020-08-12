import string
import json
import springer_api
import elsevier_api
import ieee_api
from enum import Enum
import os
import boto3


def handler(event, context):
    """
    Takes the search given by event and returns a 20 records per api,
    or if page = 0 saves the search.

    ExampleEvent = {
        "event":
        {
            "sub": "xxxxxxxx-xxxxxxxx"   # must be set when saving
            "query": {
                "condition": "AND",
                "rules": [
                    {
                        "field": "article_title",
                        "id": "article_title",
                        "input": "text",
                        "operator": "contains",
                        "type": "string",
                        "value": "systematic review"
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
            "page": 1,  # 0 to save
            "name": "name of search" # must be set when saving
            "databases": [
                {
                    "name": "ieee"
                },
                {
                    "name": "springer"
                }
            ]
        }
    }

    Parameters
    ----------
    event : json
        Json with infos about the user and the requested search (look ExampleEvent)
    context : context
        Needed by lambda
    """

    # read query from event
    query = event["event"]["query"]

    # results json
    results = {}

    # set booleans for api decision
    springer, elsevier, ieee = False, False, False
    for api in event["event"]["databases"]:
        if api['name'] == 'springer':
            springer = True
        elif api['name'] == 'elsevier':
            elsevier = True
        elif api['name'] == 'ieee':
            ieee = True

    # read terms from query
    terms = read_terms(query)

    # check if search should be saved and fetch all
    if event["event"]["page"] == 0:
        # save results and terms to db
        print(event)
        boto3_client = boto3.client('lambda', region_name='eu-central-1')
        boto3_client.invoke(FunctionName='savesearch-dustindev', InvocationType='Event', Payload=json.dumps(event))
        return {
            "statusCode": 200,
            'message': 'save initiated'
        }

    # if a page is requested fetch results and return them
    # springer results
    if springer:
        results = springer_api.fetch_springer(
            event["event"]["query"], os.environ["SPRINGER"], event["event"]["page"])
        # add total results for springer (total results already set)
        results.update({"springer_total": int(results["total"])})
    else:
        results = {
            'records': [],
            'total': 0
        }

    # elsevier results
    if elsevier:
        elsevier_results = elsevier_api.fetch_elsevier(
            query, os.environ["ELSEVIER"], event["event"]["page"])
        for record in elsevier_results['records']:
            results['records'].append(record)
        # add total results for elsevier and update total results
        results["elsevier_total"] = elsevier_results["total"]
        results.update({"total": int(results["total"]) + int(elsevier_results["total"])})
    # print(json.dumps(results, indent=4))

    # ieee results
    if ieee:
        ieee_results = ieee_api.fetch_ieee(query, os.environ["IEEE"], event["event"]["page"])
        for record in ieee_results['records']:
            results['records'].append(record)
        # add total results for ieee and update total results
        results["ieee_total"] = int(ieee_results["total"])
        results.update({"total": int(results["total"]) + int(ieee_results["total"])})

    # remove duplicates
    results = removeDuplicates(results)

    # create and return json
    response = {
        "statusCode": 200,
        "body": results
    }
    return response


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


class Types(Enum):
    Chapter = 1
    ConferencePaper = 2
    Article = 3
    ReferenceWorkEntry = 4
    Book = 5
    ConferenceProceedings = 6
    VideoSegment = 7
    BookSeries = 8
    Journal = 9
    Video = 10
    ReferenceWork = 11
    Protocol = 12


def filterDate(results, givenDate):
    for record in results["records"]:
        date = record["date"]
        if int(date[0:4]) < givenDate:
            results["records"].remove(record)
            results = filterDate(results, givenDate)
            break
    return results

def filterOpenAccess(results):
    for record in results["records"]:
        if record["openaccess"] == False:
            results["records"].remove(record)
            results = filterOpenAccess(results)
            break
    return results

def filterType(results, givenType):
    for record in results["records"]:
        if record["type"] != givenType:
            results["records"].remove(record)
            results = filterType(results, givenType)
            break
    return results

def calculateTFIDF(results, searchQuerys):
    queryString = ""
    for searchQuery in searchQuerys["rules"]:
        if searchQuery["field"] == "title" and searchQuery["input"] == "text" and searchQuery["operator"] == "contains":
            queryString = queryString + " " + searchQuery["value"]
    searchString = queryString.strip(string.punctuation)
    searchStrings = searchString.split()
    print(searchStrings)
    for record in results["records"]:
        words = record["abstract"].split(" ")
        numberOfWords = len(words)
        countMatches = 1
        for word in words:
            cleanedWord = word.strip(string.punctuation)
            for searchString in searchStrings:
                if cleanedWord.lower() == searchString.lower():
                    countMatches += 1
        record.update({"tfidf": int(round((10000*countMatches)/numberOfWords))})
    return results


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
    event = {
        "event":
        {
            "query": {
                "condition": "AND",
                "rules": [
                    {
                        "field": "article_title",
                        "id": "article_title",
                        "input": "text",
                        "operator": "contains",
                        "type": "string",
                        "value": "chaos theory"
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
            "page": 0,
            "sub": "",
            "databases": [
                {
                    "name": "ieee"
                },
                {
                    "name": "springer"
                },
                {
                    "name": "elsevier"
                }
            ]
        }
    }

    ExampleEvent = {
        "event":
        {
            # "sub": "149ec720-ccbc-43c3-a854-e70665546ea6",
            "query": {
                "condition": "AND",
                "rules": [
                    {
                        "field": "article_title",
                        "id": "article_title",
                        "input": "text",
                        "operator": "contains",
                        "type": "string",
                        "value": "chaos theory"
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
            "page": 0,
            "name": "hmmmm hmmmmmsssss", # must be set when saving
            "sub": "149ec720-ccbc-43c3-a854-e70665546ea6",
            "review_id": "5f0dc32d9424f7348d240293",
            "databases": [
                {
                    "name": "springer"
                },
                {
                    "name": "elsevier"
                },
                {
                    "name": "ieee"
                }
            ]
        }
    }

    # print()
    print(handler(ExampleEvent, 0))

    terms_test_query = {
      "condition": "AND",
      "rules": [
        {
          "id": "openaccess",
          "field": "openaccess",
          "type": "integer",
          "input": "number",
          "operator": "less",
          "value": 1
        },
        {
          "condition": "OR",
          "rules": [
            {
              "id": "category",
              "field": "article_title",
              "type": "integer",
              "input": "select",
              "operator": "equal",
              "value": "title 1"
            },
            {
              "id": "category",
              "field": "article_title",
              "type": "integer",
              "input": "select",
              "operator": "equal",
              "value": "title 2"
            }
          ]
        }
      ]
    }
    terms = []
    # print(read_terms(terms_test_query))
    # with open('results.json', 'r') as f:
    #     results = json.load(f)
    # results = removeDuplicates(results)
    doi_example = {
        "condition": "AND",
        "rules": [
            {
                "field": "article_title",
                "id": "article_title",
                "input": "text",
                "operator": "contains",
                "type": "string",
                "value": "chaos theory"
            },
            {
                "field": "publication_year",
                "id": "publication_year",
                "input": "number",
                "operator": "equal",
                "type": "integer",
                "value": 2017
            }
        ]
    }
