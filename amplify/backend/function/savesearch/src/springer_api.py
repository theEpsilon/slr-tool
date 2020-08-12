import json
import requests

# converts json query to query string
# query = json query
# returns query string


def build_query(query):
    '''Builds springer api ready string from json query

    Parameters
    ----------
    query : json
        Json with the query

    Returns
    -------
    str
        String which can be used to query a search with springer
    '''

    query_string = '('
    for rule in query['rules']:
        if "condition" in rule:
            query_string = query_string + \
                build_query(rule) + f' {query["condition"]} '
        else:
            query_string = query_string + \
                handleSingleRule(rule) + f' {query["condition"]} '
    if "openaccess:true" in query_string:
        if query_string[query_string.find('openaccess:true')-2] == 'D':
            query_string = query_string[:query_string.find('openaccess')-4] + query_string[query_string.find('openaccess')+16:]
            return query_string[:len(query_string)-len(query['condition'])-2] + ') openaccess:true'
        elif query_string[query_string.find('openaccess')-2] == 'R':
            query_string = query_string[:query_string.find('openaccess:true')-3] + query_string[query_string.find('openaccess')+16:]
            return query_string[:len(query_string)-len(query['condition'])-2] + ') openaccess:true'
    if 'openaccess:false' in query_string:
        if query_string[query_string.find('openaccess')-2] == 'D':
            query_string = query_string[:query_string.find('openaccess:false')-4] + query_string[query_string.find('openaccess')+17:]
            return query_string[:len(query_string)-len(query['condition'])-2] + ') openaccess:false'
        elif query_string[query_string.find('openaccess:false')-2] == 'R':
            query_string = query_string[:query_string.find('openaccess')-3] + query_string[query_string.find('openaccess')+17:]
            return query_string[:len(query_string)-len(query['condition'])-2] + ') openaccess:false'
    return query_string[:len(query_string)-len(query['condition'])-2] + ')'



def handleSingleRule(rule):
    '''Helper function to convert a single rule to string

    Parameters
    ----------
    rule : json
        Json with the rule

    Returns
    -------
    str
        Part of the Query-String for springer
    '''

    if rule['field'] == 'doi':
        return str('doi:"' + rule['value'] + '"')
    elif rule['field'] == 'keyword':
        return str('keyword:"' + rule['value'] + '"')
    elif rule['field'] == 'publication_title' and rule['operator'] == 'equals':
        return str('pub:"' + rule['value'] + '"')
    elif rule['field'] == 'publication_year':
        return str('year:' + str(rule['value']))
    elif rule['field'] == 'isbn':
        return str('isbn:' + rule['value'])
    elif rule['field'] == 'issn':
        return str('issn:' + rule['value'])
    elif rule['field'] == 'openaccess' and rule['value'] == 1:
        return str('openaccess:true')
    elif rule['field'] == 'openaccess' and rule['value'] == 0:
        return str('openaccess:false')
    elif rule['field'] == 'article_title':
        return str('title:"' + rule['value'] + '"')
    elif rule['field'] == 'publication_title' and rule['operator'] == 'contains':
        return str('(book:"' + rule['value'] + '" OR journal:"' + rule['value'] + '")')
    elif rule['field'] == 'author':
        return str('author:"' + str(rule['value']) + '"')


# main function to call from api to get results from query
# search_query = json query to search for
# api_key = string with Springer api key
# returns json with all results found by the search query
def fetch_springer(search_query, api_key, pagenr):
    '''"Main function" to fetch a single page or a complete search

    Parameters
    ----------
    search_query : json
        Json with the query from querybuilder

    Returns
    -------
    json
        json with the results of the requested search
    '''

    query_string = build_query(search_query)
    # print(query_string)
    if pagenr == 1:
        start = 1
    else:
        start = ((pagenr - 1) * 20)+1
    results = get_query_data(query_string, api_key, start)
    return results


def fetch_all_springer(search_query, api_key):
    '''Fetches all results of Springer belonging to the search_query

    Parameters
    ----------
    search_query : json
        Json with the query from querybuilder
    api_key : str
        String with the Springer api key

    Returns
    -------
    json
        json with the results of the requested search
    '''

    query_string = build_query(search_query)

    step = 100
    if 'openaccess' in query_string:
        step = 20
    results = get_query_data_complete(query_string, api_key, step)

    #
    return results


def filter_dates(results_data, timequery):
    filtered_records = []
    if (timequery['operator'] == 'between'):
        for record in results_data['records'][:]:
            if (int(record['date'][:4]) >= int(timequery['value'][0][:4]) and int(record['date'][:4]) <= int(timequery['value'][1][:4])):
                filtered_records.append(record)
        results_data['records'] = filtered_records
    return results_data


def get_query_data(query_string, api_key, start):
    '''Gets a single page (20 Results atm)

    Parameters
    ----------
    query_string : str
        String with the query to search
    api_key : str
        String with the Springer api key
    start : int
        int of the first result to get

    Returns
    -------
    json
        json with the results of the requested search
    '''

    results = {"records": []}
    payload = {'q': query_string, 's': start, 'p': '20', 'api_key': api_key}
    response = requests.get(
        'http://api.springernature.com/metadata/json', params=payload).json()
    # print(response)
    total = int(response['result'][0]['total'])
    results.update({"total": str(total)})
    # print(f'Total Results: {total}')
    for record in response['records']:
        record_json = {}
        authors = []
        for crea in record['creators']:
            names = crea['creator'].split(',')
            creator_json = {}
            prenames = []
            if len(names) > 1:
                for i in range(1, len(names)):
                    prenames.append(names[i][1:])
            creator_json.update({'names': prenames})
            creator_json.update({'lastname': names[0]})
            authors.append(creator_json)
        record_json.update({"authors": authors})
        record_json.update({"sourcetype": record["publicationType"]})
        record_json.update({"title": str(record["title"]).encode('unicode_escape').decode('unicode_escape')})
        record_json.update({"abstract": record["abstract"]})
        record_json.update({"openaccess": record["openaccess"]})
        record_json.update({"publicationName": record["publicationName"]})
        record_json.update({"type": record["contentType"]})
        record_json.update({"date": record["publicationDate"]})
        record_json.update({"doi": record["doi"]})
        try:
            record_json.update({"issn": record["issn"]})
        except:
            record_json.update({"issn": "not available"})
        record_json.update({"link": record["url"][0]['value']})
        record_json.update({"source": "Springer"})
        results['records'].append(record_json)
        # print(f'Gesammelt: {len(results["records"])}')
        # print(json.dumps(results, indent=4))

        # for all results uncomment next line and comment out "start = total"
        # start = start + 20
        start = total
    return results


def get_query_data_complete(query_string, api_key, step):
    '''Gets the complete results of the search

    Parameters
    ----------
    query_string : str
        String with the query to search
    api_key : str
        String with the Springer api key
    step : int
        Int with the number of results to return by one loop (20 if openaccess, else 100)

    Returns
    -------
    json
        json with the results of the requested search
    '''
    current = 1
    results = {"records": []}

    payload = {'q': query_string, 's': 1, 'p': 2, 'api_key': api_key}
    response = requests.get(
        'http://api.springernature.com/metadata/json', params=payload).json()
        # print(response)
    total = int(response['result'][0]['total'])
    current = 1
    print(str(total))

    while current <= total:
        payload = {'q': query_string, 's': current, 'p': step, 'api_key': api_key}
        response = requests.get(
            'http://api.springernature.com/metadata/json', params=payload).json()
            # print(response)
        total = int(response['result'][0]['total'])
        # results.update({"total": str(total)})
        # print(f'Total Results: {total}')
        for record in response['records']:
            record_json = {}
            authors = []
            for crea in record['creators']:
                names = crea['creator'].split(',')
                creator_json = {}
                prenames = []
                if len(names) > 1:
                    for i in range(1, len(names)):
                        prenames.append(names[i][1:])
                creator_json.update({'names': prenames})
                creator_json.update({'lastname': names[0]})
                authors.append(creator_json)
            record_json.update({"authors": authors})
            record_json.update({"sourcetype": record["publicationType"]})
            record_json.update({"title": str(record["title"]).encode('unicode_escape').decode('unicode_escape')})
            record_json.update({"abstract": record["abstract"]})
            record_json.update({"openaccess": record["openaccess"]})
            record_json.update({"publicationName": record["publicationName"]})
            record_json.update({"type": record["contentType"]})
            record_json.update({"date": record["publicationDate"]})
            record_json.update({"doi": record["doi"]})
            try:
                record_json.update({"issn": record["issn"]})
            except:
                record_json.update({"issn": "not available"})
            record_json.update({"link": record["url"][0]['value']})
            record_json.update({"source": "Springer"})
            # print(json.dumps(record_json, indent=4))
            results['records'].append(record_json)
            # print(f'Gesammelt: {len(results["records"])}')
            # print(json.dumps(results, indent=4))
        current = current + step
    results.update({"total": total})
    return results