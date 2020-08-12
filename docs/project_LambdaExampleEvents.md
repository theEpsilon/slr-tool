# Project Lambda Event Examples

Examples of how calls to the /project HTTP-API are passed to Lambda functions.

## Project GET Example

> GET /project?user=user_sub&project=project_id&count&start

```json
{
	"http-method": "GET",
	"payload": {
		"user_id": <user_sub>,
		"project_id": <project_id>,
	}
}
```

## Project POST Example

> POST /project?user=user_sub

```json
{
	"http-method": "POST",
	"payload": {
		"user_id": <user_sub>,
		"body": {
			"name":  "<project name>",  
			"description":  "<project description>",  
			"search":  "<search id>",  
		}
	}
}
```

## Project PUT Examples

### Add To Project

> PUT /project?user=user_sub&project=project_id&method=add

```json
{
	"http-method": "PUT",
	"payload": {
		"user_id": <user_sub>,
		"project_id": <project_id>,
		"method": "add",
		"body": {
			"searches": [
				"<search id>"
			],
			"results": [
				"<result id>"
			]
		}
	}
}
```
### Replace In Project

> PUT /project?user=user_sub&project=project_id&method=replace

```json
{
	"http-method": "PUT",
	"payload": {
		"user_id": <user_sub>,
		"project_id": <project_id>,
		"method": "replace",
		"body": {
			"name": "Project Name",
			"description": "Project description",
			"searches": [
				"<search id>"
			],
			"results": [
				"<result id>"
			]
		}
	}
}
```

## Project DELETE Example

> DELETE /project?user=user_sub&project=project_id

```json
{
	"http-method": "DELETE",
	"payload": {
		"user_id": <user_sub>,
		"project_id": <project_id>,
	}
}
```

