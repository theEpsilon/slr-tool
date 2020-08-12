import json
import requests
import urllib.parse
import hashlib
import os


def main():
    with open("query.json", "r") as read_file:
        data = json.load(read_file)
    query = data["query"]
    data2 = fetch_elsevier(query, os.environ["ELSEVIER"], 1)
    print(json.dumps(data2, indent=4))


def fetch_elsevier(search_query, api_key, pagenr):
    query_string = build_query_scopus(search_query)
    # sciDir = get_query_dataSciDirect(query_string, api_key)
    scopus = get_scopus(query_string, api_key, pagenr)
    return scopus


def fetch_all_elsevier(search_query, api_key):
    query_string = build_query_scopus(search_query)
    # sciDir = get_query_dataSciDirect(query_string, api_key)
    scopus = get_all_scopus(query_string, api_key)
    return scopus


def build_query_scopus(query):
    query_string = ""
    for rule in query['rules']:
        if "condition" in rule:
            query_string = f'{query_string}{build_query_scopus(rule)}{query["condition"]} '
        else:
            query_string = f'{query_string}{handleSingleRule(rule)}{query["condition"]} '
    return query_string[:len(query_string) - len(query['condition']) - 2]


def handleSingleRule(rule):
    if rule['field'] == 'doi':
        return str('DOI(' + rule['value'] + ') ')
    elif rule['field'] == 'keyword':
        return str('KEY(' + rule['value'] + ') ')
    elif rule['field'] == 'publication_title':
        return str('SRCTITLE(' + rule['value'] + ') ')
    elif rule['field'] == 'publication_year':
        return str('pubyear = ' + str(rule['value']) + ' ')
    elif rule['field'] == 'isbn':
        return str('ISBN(' + rule['value'] + ') ')
    elif rule['field'] == 'issn':
        return str('ISSN(' + rule['value'] + ') ')
    elif rule['field'] == 'openaccess':
        return str('OPENACCESS(' + str(rule['value']) + ') ')
    elif rule['field'] == 'article_title':
        return str('title(' + rule['value'] + ') ')
    elif rule['field'] == 'author':
        return str('auth(' + rule['value'] + ') ')


def get_scopus(query_string, api_key, pagenr):
    # print(query_string)
    query_string = urllib.parse.quote_plus(query_string)
    finalResults = {"records": []}
    response = requests.get(
        'https://api.elsevier.com/content/search/scopus?query=' + query_string + '&apiKey=' + api_key + "&start=" + str((pagenr-1)*20) + "&count=20").json()
    # print(response['search-results'])
    total = 0
    if "search-results" in response:
        total = int(response['search-results']["opensearch:totalResults"])
    finalResults.update({"total": total})
    if "search-results" in response:
        if "opensearch:totalResults" in response['search-results']:
            total = response['search-results']["opensearch:totalResults"]
            total = int(total)
    print(total)
    if total > 0:
        for result in response['search-results']["entry"]:
            result_json = {}
            authors = []
            # print(result)
            if 'dc:creator' in result:
                names = result['dc:creator'].split()
                creator_json = {}
                creator_json.update({'names': [names[len(names)-1]]})
                creator_json.update({'lastname': names[0]})
            else:
                creator_json = {}
                creator_json.update({'names': ["to fix"]})
                creator_json.update({'lastname': "to fix"})
            authors.append(creator_json)
            result_json.update({"authors": authors})
            result_json.update({"type": result["subtypeDescription"]})
            result_json.update({"sourcetype": result["prism:aggregationType"]})
            result_json.update({"title": result["dc:title"]})
            for link in result["link"]:
                if link["@ref"] == "scopus":
                    result_json.update({"abstract": link["@href"]})
            if "openaccessFlag" in result:
                result_json.update({"openaccess": result["openaccessFlag"]})
            if "prism:publicationName" in result:
                result_json.update(
                    {"publicationName": result["prism:publicationName"]})
            if "prism:coverDisplayDate" in result:
                result_json.update({"date": result["prism:coverDisplayDate"]})
            if "prism:doi" in result:
                result_json.update({"doi": result["prism:doi"]})
            if "prism:doi" not in result:
                result_json.update(
                    {"doi": hashlib.md5(result["dc:title"].encode('utf-8')).hexdigest()})
            if "prism:issn" in result:
                result_json.update({"issn": result["prism:issn"]})
            if "pii" in result:
                result_json.update({"pii": result["pii"]})
            for link in result["link"]:
                if (link["@ref"] == "scopus"):
                    result_json.update({"link": link["@href"]})
            result_json.update({"source": "Elsevier (Scopus)"})
            finalResults["records"].append(result_json)
    return finalResults


def get_all_scopus(query_string, api_key):
    # print(query_string)
    query_string = urllib.parse.quote_plus(query_string)
    finalResults = {"records": []}
    current = 0
    response = requests.get(
        'https://api.elsevier.com/content/search/scopus?query=' + query_string + '&apiKey=' + api_key + "&start=" + str(current) + "&count=2").json()
    # print(response['search-results'])
    total = int(response['search-results']["opensearch:totalResults"])

    while current <= total:
        response = requests.get(
            'https://api.elsevier.com/content/search/scopus?query=' + query_string + '&apiKey=' + api_key + "&start=" + str(current) + "&count=25").json()
        if "search-results" in response:
            for result in response['search-results']["entry"]:
                result_json = {}
                authors = []
                # print(result)
                if 'dc:creator' in result:
                    names = result['dc:creator'].split()
                    creator_json = {}
                    creator_json.update({'names': [names[len(names)-1]]})
                    creator_json.update({'lastname': names[0]})
                else:
                    creator_json = {}
                    creator_json.update({'names': ["to fix"]})
                    creator_json.update({'lastname': "to fix"})
                authors.append(creator_json)
                result_json.update({"authors": authors})
                result_json.update({"type": result["subtypeDescription"]})
                result_json.update({"sourcetype": result["prism:aggregationType"]})
                result_json.update({"title": result["dc:title"]})
                for link in result["link"]:
                    if link["@ref"] == "scopus":
                        result_json.update({"abstract": link["@href"]})
                if "openaccessFlag" in result:
                    result_json.update({"openaccess": result["openaccessFlag"]})
                if "prism:publicationName" in result:
                    result_json.update(
                        {"publicationName": result["prism:publicationName"]})
                if "prism:coverDisplayDate" in result:
                    result_json.update({"date": result["prism:coverDisplayDate"]})
                if "prism:doi" in result:
                    result_json.update({"doi": result["prism:doi"]})
                if "prism:doi" not in result:
                    result_json.update(
                        {"doi": hashlib.md5(result["dc:title"].encode('utf-8')).hexdigest()})
                if "prism:issn" in result:
                    result_json.update({"issn": result["prism:issn"]})
                if "pii" in result:
                    result_json.update({"pii": result["pii"]})
                for link in result["link"]:
                    if (link["@ref"] == "scopus"):
                        result_json.update({"link": link["@href"]})
                result_json.update({"source": "Elsevier (Scopus)"})
                finalResults["records"].append(result_json)
        current += 25
    finalResults.update({"total": total})
    return finalResults
