import random

def handler(event, context):

  if("queryId" in event):
    id = event["queryId"]
  else:
    return {
      "statusCode": 400,
      "body": {
        "error": "No queryId HTTP parameter found."
      }
    }

  results_available = random.randint(0, 4)

  if(results_available < 4):
    response = {
      "statusCode": 200,
      "body": {
        "records": [
          {
            "authors": "Author",
            "sourcetype": "Book",
            "title": "Title",
            "abstract": "Congratulations! The request was successful!",
            "openaccess": "false",
            "publicationName": "Publication Name",
            "type": "Chapter",
            "date": "2020-08-06",
            "doi": "DOI",
            "link": "http://www.ref.com"
          }
        ]
      }
    }
  else:
    response = {
      "statusCode": 204,
      "body": {
        "queryId": id,
        "timeUntilNextRequest": 500
      }
    }

  return response
