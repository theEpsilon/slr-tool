# Amplify Project Setup Instructions

## Prerequisites

* Have Python 3 installed and available on the ```python3``` command
* Have pipenv installed and available on the ```pipenv``` command
* Have the [Amplify CLI](https://docs.amplify.aws/cli) installed
* Have Git installed
* Make sure you have the according AWS Credentials (ask @theEpsilon if you don't)

## Step 1: Git Theory

The git repository [amplify](https://github.com/DaWeSys-SLR-Anwendung/amplify) is the single source of truth! Never pull from Amplify directly, never push directly to the prod environment!
Bottom line is: Work with Git for version control and merging. The only reason to use Amplify in any way is to test implemented code in a close-to-production environment.

1. Clone the repository and set it up to track remote from Github
2. Create a new branch from master or pull your branch if you already have one
3. If you created a new branch locally, push it to GitHub

## Step 2: Configure Amplify

**Note:** Amplify will open your browser mulitple times in the process. Close the tab and press Enter in the console. You won't need your browser.

Use command
```
amplify configure
```

1. Skip the opened browser tab and press Enter in the console
2. Select ```eu-central-1``` as your region
3. Choose a user name for the user you are going to create on your local machine
4. Ignore the browser popup again
5. Enter the credentials you received from @theEpsilon

## Step 3: Create or Connect your Amplify Environment

### I already have an Amplify Environment:
```
amplify env checkout <environmentName>
```

### I want to create a new environment:
```
amplify env add
```
and follow the steps to create a new environment.

### Useful commands:

Check your un-pushed local changes:
```
amplify status
```

Get a list of all available environments:
```
amplify env list
```


## Step 4: Push your changes
**Important:**
1. Always make sure that you are on your own environment! Check the current environment with ```amplify status```
2. Always change the Git branch first before changing the Amplify environment!

To push your code changes to your environment, do:
```
amplify push
```

You will be asked to confirm your push request. Again, Amplify tells you which environment you are about to push to. Ensure that it is yours!

## Some notes
Amplify has no version control built-in whatsoever. This means that recovering previous states aswell as merging code is not possible in Amplify alone. Therefore, we use Git.
Inheritently, changing the Amplify environment will **not** alter your file directory, changing Git branches will.

You will never need to use the commands ```amplify init``` or ```amplify pull```.
The former would create a new project and the latter would directly pull the contents of an Amplify environment which would hurt the Git-is-the-single-source-of-truth-paradigm.

## Official Links:

* Amplify CLI documentation: https://docs.amplify.aws/cli

* Amplify landing page: https://aws.amazon.com/de/amplify/ 