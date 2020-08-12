import json
import requests
import urllib.parse
import hashlib
import os


def main():
    with open("query.json", "r") as read_file:
        data = json.load(read_file)
    query = data["query"]
    data2 = fetch_ieee(query, os.environ["IEEE"], 1)
    print(json.dumps(data2, indent=4))


def fetch_ieee(search_query, api_key, pagenr):
    appendix = ""
    query_string, appendix = build_query_ieee(search_query, appendix)
    # sciDir = get_query_dataSciDirect(query_string, api_key)
    start = ((pagenr - 1) * 20)+1
    ieee = get_ieee("&querytext=(" + query_string + ")" + appendix, api_key, start)
    return ieee


def fetch_all_ieee(search_query, api_key):
    appendix = ""
    query_string, appendix = build_query_ieee(search_query, appendix)
    # sciDir = get_query_dataSciDirect(query_string, api_key)
    ieee = get_all_ieee("&querytext=(" + query_string + ")" + appendix, api_key)
    return ieee


def build_query_ieee(query, appendix):
    query_string = ""
    for rule in query['rules']:
        if "condition" in rule:
            build, appendix = build_query_ieee(rule, appendix)
            query_string = query_string + "(" + build + ")" + urllib.parse.quote(
                f' {query["condition"]} ')
        else:
            handle, appendix = handleSingleRule(rule, appendix)
            if handle != "":
                query_string = query_string + handle + urllib.parse.quote(
                    f' {query["condition"]} ')
    return query_string[:len(query_string) - len(query['condition']) - 6], appendix


def handleSingleRule(rule, appendix):
    if rule['field'] == 'article_title':
        # value = urllib.parse.quote_plus(rule["value"])
        return ('"Document%20Title":' + '"' + urllib.parse.quote(rule["value"]) + '"'), appendix
    elif rule['field'] == 'keyword':
        # value = urllib.parse.quote_plus(rule["value"])
        return ('"Author%20Keywords":' + '"'+urllib.parse.quote(rule["value"]) + '"'), appendix
    elif rule['field'] == 'author':
        # value = urllib.parse.quote_plus(rule["value"])
        return ('"Authors":' + urllib.parse.quote(rule["value"])), appendix
    elif rule['field'] == 'publication_year':
        return "", appendix + "&publication_year=" + str(rule["value"])
    elif rule['field'] == 'doi':
        return ('"DOI":' + '"' + urllib.parse.quote(rule["value"]) + '"'), appendix
    elif rule['field'] == 'publication_title':
        return ('"Publication%20Title":' + '"' + urllib.parse.quote(rule["value"]) + '"'), appendix
    elif rule['field'] == 'isbn':
        return ('"ISBN":' + '"' + urllib.parse.quote(rule["value"]) + '"'), appendix
    elif rule['field'] == 'issn':
        return ('"ISSN":' + '"' + urllib.parse.quote(rule["value"]) + '"'), appendix
    elif rule['field'] == 'issn':
        return ('"ISSN":' + '"' + urllib.parse.quote(rule["value"]) + '"'), appendix
    elif rule['field'] == 'openaccess' and rule["value"] == 1:
        return "", appendix + "&open_access=" + "True"
    elif rule['field'] == 'openaccess' and rule["value"] == 0:
        return "", appendix + "&open_access=" + "False"


def get_ieee(query_string, api_key, page):
    # print(query_string)

    url = 'http://ieeexploreapi.ieee.org/api/v1/search/articles?apikey=' + api_key + "&format=json&max_records=20&start_record=" + str(
        page) + "&sort_order=asc&sort_field=article_number" + query_string
    # print(url)
    response = requests.get(url).json()
    print(f"Total records: {response['total_records']}")
    finalResults = {
        "records": [],
        "total": response['total_records']
    }
    if "articles" in response:
        for result in response['articles']:
            result_json = {
            }
            authors = []
            if "authors" in result:
                for author in result['authors']['authors']:
                    vorname = author["full_name"][:author["full_name"].rfind(' ')-1]
                    nachname = author["full_name"][author["full_name"].rfind(' ')+1:]
                    creator_json = {}
                    creator_json.update({'names': [vorname]})
                    creator_json.update({'lastname': nachname})
                    authors.append(creator_json)
            result_json.update({"authors": authors})
            if "content_type" in result:
                result_json.update({"type": result["content_type"]})
            # result_json.update({"sourcetype": result["article"]})
            if "title" in result:
                result_json.update({"title": result["title"]})
            if "abstract" in result:
                result_json.update({"abstract": result["abstract"]})
            if "accessType" in result:
                result_json.update(
                    {"openaccess": result["accessType"]})
            if "publication_title" in result:
                result_json.update(
                    {"publicationName": result["publication_title"]})
            if "publication_date" in result:
                result_json.update(
                    {"date": result["publication_date"]})
            if "doi" in result:
                result_json.update({"doi": result["doi"]})
            if "doi" not in result:
                result_json.update(
                    {"doi": hashlib.md5(result["title"].encode('utf-8')).hexdigest()})
            if "issn" in result:
                result_json.update({"issn": result["issn"]})
            if "html_url" in result:
                result_json.update({"link": result["html_url"]})
            elif "pdf_url" in result:
                result_json.update({"link": result["pdf_url"]})
            result_json.update({"source": "IEEE"})
            finalResults["records"].append(result_json)
    return finalResults


def get_all_ieee(query_string, api_key):
    current = 1
    url = 'http://ieeexploreapi.ieee.org/api/v1/search/articles?apikey=' + api_key + "&format=json&max_records=2&start_record=" + str(current) + "&sort_order=asc&sort_field=article_number" + query_string
    response = requests.get(url).json()
    total = response['total_records']
    finalResults = {
        "records": [],
        "total": response['total_records']
    }

    while current <= total:
        print('call')
        url = 'http://ieeexploreapi.ieee.org/api/v1/search/articles?apikey=' + api_key + "&format=json&max_records=200&start_record=" + str(current) + "&sort_order=asc&sort_field=article_number" + query_string
        response = requests.get(url).json()
        if "articles" in response:
            for result in response['articles']:
                result_json = {
                }
                authors = []
                if "authors" in result:
                    for author in result['authors']['authors']:
                        vorname = author["full_name"][:author["full_name"].rfind(' ')-1]
                        nachname = author["full_name"][author["full_name"].rfind(' ')+1:]
                        creator_json = {}
                        creator_json.update({'names': [vorname]})
                        creator_json.update({'lastname': nachname})
                        authors.append(creator_json)
                result_json.update({"authors": authors})
                if "content_type" in result:
                    result_json.update({"type": result["content_type"]})
                # result_json.update({"sourcetype": result["article"]})
                if "title" in result:
                    result_json.update({"title": result["title"]})
                if "abstract" in result:
                    result_json.update({"abstract": result["abstract"]})
                if "accessType" in result:
                    result_json.update(
                        {"openaccess": result["accessType"]})
                if "publication_title" in result:
                    result_json.update(
                        {"publicationName": result["publication_title"]})
                if "publication_date" in result:
                    result_json.update(
                        {"date": result["publication_date"]})
                if "doi" in result:
                    result_json.update({"doi": result["doi"]})
                if "doi" not in result:
                    result_json.update(
                        {"doi": hashlib.md5(result["title"].encode('utf-8')).hexdigest()})
                if "issn" in result:
                    result_json.update({"issn": result["issn"]})
                if "html_url" in result:
                    result_json.update({"link": result["html_url"]})
                elif "pdf_url" in result:
                    result_json.update({"link": result["pdf_url"]})
                result_json.update({"source": "IEEE"})
                finalResults["records"].append(result_json)
        current += 200
    return finalResults
