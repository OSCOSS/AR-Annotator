from textblob import TextBlob
from SPARQLWrapper import SPARQLWrapper2


# The Query and sentiment analysis of the extracted information about reviews and their relation
# to article and reviewers.
# This component connects to a local fuseki server that stores the content of Article_RDF.ttl
# and executes SPARQL queries over it. Then it processes the result of the queries and applies sentiment analysis
# on them using a Naive Bayes sentiment classifier.

# The Sentiment Classifier in textblob:
# TextBlob trains using the Naive Bayes classifier to determine positive and negative reviews.
# It is trained on a Movie Review Dataset which is labled as positive and negative.
# The classifier calculates the polarity of tokens between -1.0 and 1.0 . If we regard x as the polarity, x < 0 is 
# negative polarity , 0.0 is neutral and x > 0 is positive polarity of the review.


def get_sentiment(polarity):
    if polarity > 0:
        return 'positive'
    elif polarity == 0:
        return 'neutral'
    else:
        return 'negative'


def get_sentiment_polarity(text):
    # make TextBlob object of passed text
    analysis = TextBlob(text.strip())
    # assign sentiment
    return analysis.sentiment.polarity


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
    comments_per_section_per_user = {}  # find those comments that are related to a section
    for result in sparql.query().bindings:
        sectionName = result["sectionName"].value
        commentInSectionURI = result["commentInSectionURI"].value.rsplit("/", 1)[1]
        commentURI = result["commentURI"].value.rsplit("#", 1)[1]
        commentContent = result["commentContent"].value
        commentfromUserURI = result["commentfromUserURI"].value.rsplit("#", 1)
        if len(commentfromUserURI) > 1: commentfromUserURI = commentfromUserURI[1]

        reviewerNumber = result["userUri"].value.rsplit("#", 1)
        if len(reviewerNumber) > 1: reviewerNumber = reviewerNumber[1]

        if commentInSectionURI == commentURI and commentURI.rsplit("-", 1)[1] == commentfromUserURI:
            comments_per_section_per_user[sectionName, commentURI, reviewerNumber] = commentContent

    return comments_per_section_per_user


# Sentiment Query 1: Does the second reviewer have a positive idea about the "Introduction" section?
def run_sentiment_query1(section_class_, reviewer_number_):
    sum_polarity = 0
    comments_per_section_per_user = getCommentsPerPerSectionPerUser()

    for (section_class__, commentId, reviewer_number__), value in comments_per_section_per_user.iteritems():
        if section_class__ == section_class_ and reviewer_number__ == reviewer_number_:
            sum_polarity = sum_polarity + get_sentiment_polarity(value)

    print "Sentiment Query 1: Does the second reviewer have a positive idea about the " + section_class_ + " section?"
    print "result:"
    print get_sentiment(sum_polarity)
    return sum_polarity > 0


# Sentiment Query 2: What was the section of article that reviewers were most unhappy about?
# (I.e., which section needs to be revised with the highest priority?)
def run_sentiment_query2():
    sum_polarity = {}
    min_polarity = 0
    most_negative_reviewed_section = ""
    comments_per_section = getCommentsPerSection()
    for (section_class__, commentId), value in comments_per_section.iteritems():
        a = sum_polarity.get(section_class__, 0)
        sum_polarity[section_class__] = a + get_sentiment_polarity(value)

    for (section_class__), value in sum_polarity.iteritems():
        if value < min_polarity:
            most_negative_reviewed_section = section_class__
            min_polarity = value
    print "Sentiment Query 2: What was the section of article that reviewers were most unhappy about?"
    print "result: that section of paper is "
    print most_negative_reviewed_section
    return most_negative_reviewed_section, min_polarity


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


# Sentiment Query 1: Does the second reviewer have a positive idea about the "Requirements" section?
reviewer_number = "4"
run_sentiment_query1("Requirements", reviewer_number)

# Output on the sample file:
# result:
# positive

# Sentiment Query 2: What was the section of article that reviewers were most unhappy about?
# (I.e., which section needs to be revised with the highest priority?)
run_sentiment_query2()

# Output on the sample file:
# result: that section of paper is
# Introduction
