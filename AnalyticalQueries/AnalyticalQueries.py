from textblob import TextBlob
from SPARQLWrapper import SPARQLWrapper2


# Sentiment Classifier in textblob:
# TextBlob uses a large Movie Review Dataset which is pre-classified as positive and negative.
# TextBlob trains using the Naive Bayes classifier to determine positive and negative reviews.
# the sentiment classifier calculates the polarity of tokens between -1.0 and 1.0
# -1.0 is negative, 0.0 is neutral and 1.0 is positive

def get_sentiment(text):
    # make TextBlob object of passed text
    analysis = TextBlob(text.strip())
    # assign sentiment
    if analysis.sentiment.polarity > 0:
        return 'positive'
    elif analysis.sentiment.polarity == 0:
        return 'neutral'
    else:
        return 'negative'


# Query 1: What range of text in the Requirements section have received the most attention from the reviewers.
def run_query1():
    sparql = SPARQLWrapper2("http://localhost:3030/article/sparql")  # address of local fuseki server

    sparql.setQuery("""
    PREFIX schema: <http://schema.org/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    SELECT ?resourceText  (COUNT(?replyID) AS ?commentCount)  WHERE {
    ?section <http://schema.org/hasPart> ?resourceId .
    ?section <http://schema.org/name> "Requirements" .
    ?resourceId <http://schema.org/description> ?resourceText .
    ?resourceId <http://purl.org/spar/cito/hasReplyFrom> ?replyID
    }GROUP BY ?resourceText
    ORDER  BY DESC(?commentCount)
    """)

    print "Query 1: What range of text in the Requirements section have received the most attention from the reviewers."
    print "result: Number of comments per selected text:"
    for result in sparql.query().bindings:
        print('%s: %s' % (result["resourceText"].value, result["commentCount"].value))
    print ""


# Query 2 : What sections in the article received greatest number of comments by reviewers?
def run_query2():
    sparql = SPARQLWrapper2("http://localhost:3030/article/sparql")  # address of local fuseki server

    sparql.setQuery("""
    PREFIX schema: <http://schema.org/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT ?section  (COUNT(?commentID) AS ?commentCount)  WHERE {
    ?section <http://schema.org/hasPart> ?commentID . 
    ?section  <http://schema.org/description> ?sectionName .
    ?section  <http://schema.org/description> ?sectionName .
    }
    GROUP BY  ?section
    ORDER  BY DESC(?commentCount)
    """)

    print "Query 2 : What sections in the article received greatest number of comments by reviewers?"
    print "result: Number of comments per section:"
    for result in sparql.query().bindings:
        print('%s: %s' % (result["section"].value.rsplit("/", 1)[1], result["commentCount"].value))
    print ""


# Query 3: Search within the reviews and find those comments that contain a specific word
def run_query3(searchedWord):
    sparql = SPARQLWrapper2("http://localhost:3030/article/sparql")  # address of local fuseki server

    sparql.setQuery("""
    PREFIX schema: <http://schema.org/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT ?subject ?object WHERE {
    ?subject schema:name "Comment" ;
           rdf:value   ?object .
    FILTER regex(str(?object), """ + '"' + searchedWord + '"' + """)
    }
    """)

    print "Query 3: Search within the reviews and find those comments that contain a specific word"
    print "result: CommentId and comment content:"
    for result in sparql.query().bindings:
        print('%s: %s' % (result["subject"].value.rsplit("#", 1)[1], result["object"].value))
    print ""


def getCommentsPerSection():
    sparql = SPARQLWrapper2("http://localhost:3030/article/sparql")  # address of local fuseki server
    sparql.setQuery("""
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?sectionName  ?commentInSectionURI ?commentURI ?commentContent WHERE {
?section <http://schema.org/hasPart> ?commentedtext . 
?commentedtext <http://purl.org/spar/cito/hasReplyFrom> ?commentInSectionURI .
 ?commentURI  <http://schema.org/name> "Comment" .
  ?commentURI  <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> ?commentContent. 
?section  <http://schema.org/name> ?sectionName .
}
    """)
    comments_per_section = {}  # find those comments that are related to a section
    for result in sparql.query().bindings:
        sectionName = result["sectionName"].value
        commentInSectionURI = result["commentInSectionURI"].value.rsplit("/", 1)[1]
        commentURI = result["commentURI"].value.rsplit("#", 1)[1]
        commentContent = result["commentContent"].value
        if commentInSectionURI == commentURI:
            comments_per_section[sectionName, commentURI] = commentContent
    return comments_per_section

def getCommentsPerPerSectionPerUser():
    sparql = SPARQLWrapper2("http://localhost:3030/article/sparql")  # address of local fuseki server
    sparql.setQuery("""
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?sectionName  ?commentInSectionURI ?commentURI ?commentContent ?commentfromUserURI ?userUri WHERE {
?section <http://schema.org/hasPart> ?commentedtext . 
?commentedtext <http://purl.org/spar/cito/hasReplyFrom> ?commentInSectionURI .
 ?commentURI  <http://schema.org/name> "Comment" .
  ?commentURI  <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> ?commentContent. 
?section  <http://schema.org/name> ?sectionName .
?commentfromUserURI  <http://schema.org/creator> ?userUri
}
    """)
    comments_per_section = {}  # find those comments that are related to a section
    for result in sparql.query().bindings:
        sectionName = result["sectionName"].value
        commentInSectionURI = result["commentInSectionURI"].value.rsplit("/", 1)[1]
        commentURI = result["commentURI"].value.rsplit("#", 1)[1]
        commentContent = result["commentContent"].value
        commentfromUserURI = result["commentfromUserURI"].value
        userUri = result["userUri"].value
        if commentInSectionURI == commentURI:
            comments_per_section[sectionName, commentURI] = commentContent
    return comments_per_section


# Query 1: returns range of text in the Requirements section have received the most attention from the reviewers.
run_query1()

# Output on the sample file:
# Number of comments per selected text:
# evaluating our implementation: 1
# two applications: 1

# Query 2 : What sections in the article received greatest number of comments by reviewers?
run_query2()

# Output on the sample file:
# Number of comments per section:
# Requirements: 2
# Introduction: 1
# SupportedWorkflows: 1

# Query 3: Search within the reviews and find those comments that contain a specific word
# Testing with word "communication"
run_query3("communication")

# Output on the sample file:
# comment-674297328: I do not understand the usage of communication here.

def run_query4():
    commentsPerPerSectionPerUser= getCommentsPerPerSectionPerUser()

def run_query5():
    comments_per_section= getCommentsPerSection()


a = getCommentsPerSection()
print a


