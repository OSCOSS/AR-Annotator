## Describtion:


The Query and sentiment analysis of the extracted information about reviews and their relation 
to article and reviewers.

This component connects to a local fuseki server that stores the content of Article_RDF.ttl

and executes SPARQL queries over it. Then it processes the result of the queries and applies sentiment analysis

on them using a Naive Bayes sentiment classifier.


### "AnalyticalQueries.py"
	The query and sentiment analysis of article reviews.

### "Article_RDF.ttl"

	The output dataset extracted from a sample article. To test this dataset, it should be uploaded into a triple-store

### "AnalyticalQueries"

	The SPARQL queries and sentiment of their results. The outputs on the sample file is also included for explanation.

### "QUERYResult.txt"

	The result of running the 3 queries in the data in "Article_RDF.ttl" in a Apache fuseki server. 

	

